'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Code2,
  Heart,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';

const INIT_LIKES = 128;

const ACTION_SNIPPET = `'use client';

import { useActionState, useOptimistic } from 'react';

export function LikeButton({ postId }: { postId: string }) {
  const [likes, submitLike, isPending] = useActionState(
    async (prev: number) => {
      const res = await likePost(postId);  // Server Action
      if (!res.ok) throw new Error('500'); // throw -> giữ state cũ (rollback)
      return res.count;
    },
    0,
  );

  const [optimisticLikes, addOptimistic] = useOptimistic(
    likes,
    (current: number) => current + 1,
  );

  return (
    <form action={async () => {   // React 19: form action
      addOptimistic(1);           // tim +1 hiển thị NGAY
      await submitLike();         // server chốt hoặc rollback
    }}>
      <button disabled={isPending}>Like {optimisticLikes}</button>
    </form>
  );
}`;

type LogKind = 'optimistic' | 'ok' | 'error' | 'info';

interface LogLine {
  text: string;
  kind: LogKind;
}

export function React19ActionsLab() {
  const [likes, setLikes] = React.useState(INIT_LIKES);
  const [likePending, setLikePending] = React.useState(false);
  const [rolledBack, setRolledBack] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [syncPending, setSyncPending] = React.useState(false);
  const [syncProgress, setSyncProgress] = React.useState(0);
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const attemptRef = React.useRef(0);
  const likesRef = React.useRef(INIT_LIKES);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = React.useRef<ReturnType<typeof setInterval>[]>([]);

  React.useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      intervalsRef.current.forEach(clearInterval);
    },
    [],
  );
  React.useEffect(() => {
    const el = document.getElementById('actions-terminal');
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const pushLog = (line: LogLine) => setLogs((prev) => [...prev.slice(-29), line]);

  /* ── Like: mô phỏng useOptimistic thủ công ─────────────────────────── */
  const handleLike = () => {
    if (likePending) return;
    const willFail = attemptRef.current % 3 === 2; // luật cố định: lượt thứ 3 fail
    attemptRef.current += 1;
    setAttempt(attemptRef.current);
    setLikePending(true);
    pushLog({
      kind: 'optimistic',
      text: `❤️ optimistic: likes ${likesRef.current} → ${likesRef.current + 1} (UI cập nhật NGAY, chưa hỏi server)`,
    });
    const t = setTimeout(() => {
      setLikePending(false);
      if (willFail) {
        pushLog({
          kind: 'error',
          text: `💥 server 500 → rollback optimistic update — likes trở lại ${likesRef.current}`,
        });
        setRolledBack(true);
        const clear = setTimeout(() => setRolledBack(false), 1200);
        timersRef.current.push(clear);
      } else {
        likesRef.current += 1;
        setLikes(likesRef.current);
        pushLog({
          kind: 'ok',
          text: `✓ server 200 OK — xác nhận vĩnh viễn likes = ${likesRef.current}`,
        });
      }
    }, 700);
    timersRef.current.push(t);
  };

  /* ── Sync: mô phỏng useTransition semantics ────────────────────────── */
  const handleSync = () => {
    if (syncPending) return;
    setSyncPending(true);
    setSyncProgress(0);
    pushLog({
      kind: 'info',
      text: '⏳ startTransition(syncData) — isPending=true, CHỈ panel này bị dimmed',
    });
    const iv = setInterval(() => setSyncProgress((p) => Math.min(p + 8, 92)), 100);
    intervalsRef.current.push(iv);
    const t = setTimeout(() => {
      clearInterval(iv);
      setSyncProgress(100);
      setSyncPending(false);
      pushLog({
        kind: 'ok',
        text: '✓ sync hoàn tất sau 1.2s — suốt khoảng đó mọi click khác vẫn hoạt động bình thường',
      });
    }, 1200);
    timersRef.current.push(t);
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    likesRef.current = INIT_LIKES;
    attemptRef.current = 0;
    setLikes(INIT_LIKES);
    setAttempt(0);
    setLikePending(false);
    setRolledBack(false);
    setSyncPending(false);
    setSyncProgress(0);
    pushLog({ kind: 'info', text: '$ reset lab — server-truth likes quay về ban đầu' });
  };

  const displayedLikes = likes + (likePending ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-pink-500" />
          Lab 03 · React 19 Actions — Optimistic UI &amp; Transitions
        </h3>
        <Badge variant="secondary" className="font-mono text-[10px]">
          client-side simulation
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ════════ PLAYGROUND ════════ */}
        <Card className="glass-card space-y-4 p-5">
          {/* Like playground */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Thả tim bài viết · useOptimistic
              </p>
              <Badge variant="outline" className="font-mono text-[10px]">
                fail mỗi lượt thứ 3
              </Badge>
            </div>
            <div
              className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-300 ${
                likePending
                  ? 'animate-pulse border-amber-500/50 ring-2 ring-amber-400/40'
                  : rolledBack
                    ? 'border-destructive/50'
                    : 'border-border/40'
              }`}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={handleLike}
                disabled={likePending}
                className="gap-2"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                Thả tim
              </Button>
              <div className="text-right">
                <p
                  className={`font-mono text-2xl font-bold leading-none ${
                    rolledBack ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {displayedLikes}
                </p>
                {likePending ? (
                  <Badge variant="warning" className="mt-1.5 text-[10px]">
                    pending — đợi server…
                  </Badge>
                ) : rolledBack ? (
                  <Badge variant="destructive" className="mt-1.5 text-[10px]">
                    rolled back!
                  </Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">likes đã xác nhận</span>
                )}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Lượt tới là lượt <span className="font-mono text-foreground">{attempt + 1}</span> —{' '}
              {attempt % 3 === 2 ? (
                <span className="font-bold text-destructive">server sẽ trả 500 💥 (rollback)</span>
              ) : (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  sẽ thành công ✓
                </span>
              )}
            </p>
          </div>

          {/* Sync / useTransition playground */}
          <div className="relative space-y-3 overflow-hidden rounded-xl border border-border/60 bg-secondary/20 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Sync dữ liệu · useTransition
              </p>
              {syncPending ? (
                <Badge variant="warning" className="gap-1 text-[10px]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  isPending
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px]">
                  idle
                </Badge>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={handleSync}
              disabled={syncPending}
              className="w-full gap-2 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncPending ? 'animate-spin' : ''}`} />
              {syncPending ? 'Đang sync...' : 'Sync dữ liệu'}
            </Button>
            <Progress value={syncProgress} className="h-1.5" />
            {syncPending && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  isPending — panel này dimmed, phần khác vẫn bấm được
                </span>
              </div>
            )}
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Transition là update non-urgent: UI không bị khoá — thử bấm ❤️ trong lúc sync đang
              chạy!
            </p>
          </div>

          {/* Mini log */}
          <div
            id="actions-terminal"
            className="max-h-36 min-h-[80px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]"
          >
            {logs.length === 0 ? (
              <span className="text-slate-500">$ bấm Thả tim hoặc Sync để xem action chạy...</span>
            ) : (
              logs.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === 'error'
                      ? 'text-red-400'
                      : line.kind === 'ok'
                        ? 'text-emerald-400'
                        : line.kind === 'info'
                          ? 'text-slate-500'
                          : 'text-amber-300'
                  }
                >
                  {line.text}
                </div>
              ))
            )}
          </div>

          <Button size="sm" variant="ghost" onClick={reset} className="gap-1 text-xs">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </Card>

        {/* ════════ REAL PATTERN ════════ */}
        <Card className="glass-card space-y-3 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Code2 className="h-4 w-4 text-sky-500" />
            Pattern thật — React 19 API
          </p>
          <CodeBlock code={ACTION_SNIPPET} language="tsx" />
          <ul className="space-y-2 text-[11px] leading-relaxed text-muted-foreground">
            <li className="flex gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>
                <span className="font-semibold text-foreground">useOptimistic</span> — hiện trạng
                thái mong muốn NGAY khi bấm, chưa cần server trả lời (đúng như phần thả tim bên
                trái).
              </span>
            </li>
            <li className="flex gap-1.5">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <span>
                Action throw / server lỗi →{' '}
                <span className="font-semibold text-foreground">useActionState</span> giữ nguyên
                state cũ = rollback tự động, không phải tự viết undo.
              </span>
            </li>
            <li className="flex gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
              <span>
                <span className="font-semibold text-foreground">useTransition</span> — đánh dấu
                update là non-urgent: dùng isPending để dim đúng panel chịu tải, phần còn lại của
                UI vẫn responsive.
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Mô phỏng thuần client-side — round-trip 700ms và lỗi 500 mỗi lượt thứ 3 đều là kịch bản định
        sẵn trong bộ nhớ, không có request thật nào được gửi. CodeBlock bên phải là API React 19
        thật để đối chiếu với bản mô phỏng thủ công.
      </p>
    </div>
  );
}
