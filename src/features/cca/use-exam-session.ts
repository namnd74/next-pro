'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { abandonOnExit, examApi, ExamApiError } from './api';
import type { Attempt, Summary } from './contracts';

export function useExamSession(
  attempt: Attempt,
  onEnd: (result: Summary) => void,
  onDiscard: () => void
) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.ceil((attempt.expiresAt - attempt.serverNow) / 1000))
  );
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(new Map<string, string[]>());
  const inFlight = useRef<Promise<void> | null>(null);
  const finished = useRef(false);
  const endingRef = useRef(false);
  const mounted = useRef(true);
  const clock = useRef({
    server: attempt.serverNow,
    deadline: attempt.expiresAt,
    received: 0,
  });
  const callbacks = useRef({ onEnd, onDiscard });
  useEffect(() => {
    callbacks.current = { onEnd, onDiscard };
  }, [onEnd, onDiscard]);

  const complete = useCallback((summary: Summary) => {
    if (finished.current || !mounted.current) return;
    finished.current = true;
    pending.current.clear();
    callbacks.current.onEnd(summary);
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (inFlight.current) return inFlight.current;
    const run = async () => {
      if (mounted.current) setSaving(true);
      try {
        while (pending.current.size && !finished.current) {
          const entry = pending.current.entries().next().value;
          if (!entry) break;
          const [questionId, choiceIds] = entry;
          await examApi.save(attempt.id, questionId, choiceIds);
          if (pending.current.get(questionId) === choiceIds)
            pending.current.delete(questionId);
          if (mounted.current) {
            setPendingCount(pending.current.size);
            setError('');
          }
        }
      } catch (error) {
        if (mounted.current)
          setError(error instanceof Error ? error.message : 'Chưa lưu được đáp án.');
        throw error;
      } finally {
        if (mounted.current) setSaving(false);
      }
    };
    const task = run();
    inFlight.current = task;
    void task.then(
      () => {
        inFlight.current = null;
      },
      () => {
        inFlight.current = null;
      }
    );
    return task;
  }, [attempt.id]);

  const finish = useCallback(
    async (action: 'submit' | 'abandon') => {
      if (endingRef.current || finished.current) return;
      endingRef.current = true;
      setEnding(true);
      try {
        if (action === 'submit') await flush();
        complete(await examApi.finish(attempt.id, action));
      } catch (error) {
        if (error instanceof ExamApiError && error.status === 409) {
          try {
            const status = await examApi.status(attempt.id);
            if (!('status' in status)) complete(status);
          } catch {
            if (mounted.current)
              setError('Bài thi đã khóa. Đang chờ kết quả từ phòng thi.');
          }
        } else if (mounted.current)
          setError(error instanceof Error ? error.message : 'Chưa nhận được kết quả.');
      } finally {
        endingRef.current = false;
        if (mounted.current) setEnding(false);
      }
    },
    [attempt.id, flush, complete]
  );

  function choose(questionId: string, choiceIds: string[]) {
    if (finished.current || endingRef.current || remaining <= 0) return;
    setAnswers((previous) => ({ ...previous, [questionId]: choiceIds }));
    pending.current.set(questionId, choiceIds);
    setPendingCount(pending.current.size);
    void flush().catch(() => {});
  }

  useEffect(() => {
    mounted.current = true;
    clock.current.received = performance.now();
    const sync = async () => {
      if (finished.current) return;
      try {
        const result = await examApi.status(attempt.id);
        if (!mounted.current || finished.current) return;
        if (!('status' in result)) {
          complete(result);
          return;
        }
        clock.current = {
          server: result.serverNow,
          deadline: result.expiresAt,
          received: performance.now(),
        };
      } catch (error) {
        if (mounted.current)
          setError(error instanceof Error ? error.message : 'Mất kết nối phòng thi.');
      }
    };
    const tick = setInterval(() => {
      const time = clock.current;
      const seconds = Math.max(
        0,
        Math.ceil(
          (time.deadline - time.server - (performance.now() - time.received)) / 1000
        )
      );
      setRemaining(seconds);
      if (!seconds) void sync();
    }, 1000);
    const poll = setInterval(() => {
      void sync();
      void flush().catch(() => {});
    }, 30_000);
    const focus = () => {
      void sync();
      void flush().catch(() => {});
    };
    window.addEventListener('focus', focus);
    return () => {
      mounted.current = false;
      clearInterval(tick);
      clearInterval(poll);
      window.removeEventListener('focus', focus);
    };
  }, [attempt.id, complete, flush]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (finished.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const leave = () => {
      if (finished.current) return;
      finished.current = true;
      pending.current.clear();
      abandonOnExit(attempt.id);
    };
    const pageHide = () => leave();
    const pageShow = (event: PageTransitionEvent) => {
      // A page restored from the back/forward cache must never restore an active room.
      if (event.persisted && finished.current) callbacks.current.onDiscard();
    };
    const links = (event: MouseEvent) => {
      if (
        finished.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (
        !link ||
        link.target === '_blank' ||
        !link.href ||
        link.hasAttribute('download')
      )
        return;
      const target = new URL(link.href, location.href);
      if (
        target.pathname === location.pathname &&
        target.search === location.search &&
        target.hash
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (
        window.confirm(
          'Rời phòng thi? Lượt này vẫn được tính. Câu trả lời và thông tin thí sinh sẽ bị xóa khỏi trình duyệt.'
        )
      ) {
        leave();
        callbacks.current.onDiscard();
        window.location.assign(link.href);
      }
    };
    // A same-URL sentinel allows Back to be canceled before the Next router changes routes.
    const marker = `cca:${attempt.id}`;
    const currentState: unknown = history.state;
    const state = currentState && typeof currentState === 'object' ? currentState : {};
    if (!('ccaGuard' in state) || state.ccaGuard !== marker) {
      history.pushState({ ...state, ccaGuard: marker }, '', location.href);
    }
    const pop = (event: PopStateEvent) => {
      if (finished.current) return;
      const value: unknown = event.state;
      if (
        value &&
        typeof value === 'object' &&
        'ccaGuard' in value &&
        value.ccaGuard === marker
      )
        return;
      event.stopImmediatePropagation();
      if (
        window.confirm(
          'Rời phòng thi? Lượt này vẫn được tính và bài làm sẽ bị xóa khỏi trình duyệt.'
        )
      ) {
        leave();
        callbacks.current.onDiscard();
        history.back();
      } else history.forward();
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('pagehide', pageHide);
    window.addEventListener('pageshow', pageShow);
    document.addEventListener('click', links, true);
    window.addEventListener('popstate', pop, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('pagehide', pageHide);
      window.removeEventListener('pageshow', pageShow);
      document.removeEventListener('click', links, true);
      window.removeEventListener('popstate', pop, true);
      // Cleanup cannot distinguish React Strict Mode's probe from a real unmount.
      // Deferring by a microtask lets the mounted flag cancel only the probe.
      queueMicrotask(() => {
        if (!mounted.current) leave();
      });
    };
  }, [attempt.id]);

  return { answers, choose, remaining, saving, pendingCount, ending, error, finish };
}
