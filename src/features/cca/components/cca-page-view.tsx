'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpenCheck, GraduationCap, Layers3, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiUrl, examApi, ExamApiError } from '../api';
import {
  TOPICS,
  type Attempt,
  type Session,
  type Summary,
  type TopicId,
} from '../contracts';
import { writeResults } from '../storage';
import { CandidateForm } from './candidate-form';
import { TopicDashboard } from './topic-dashboard';
import { ExamRoom } from './exam-room';
import { ExamResult } from './exam-result';

type Screen =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'auth'; setup?: Session }
  | { kind: 'dashboard'; session: Session }
  | { kind: 'exam'; session: Session; attempt: Attempt }
  | { kind: 'result'; session: Session; summary: Summary };
type Cycle = { topicId: string; usedForms: number[]; activeAttemptId: string | null };
const descriptions: Record<TopicId, string> = {
  'cca-f': 'Kiến trúc agent, công cụ MCP và quy trình Claude Code.',
  'ccao-f': 'Ứng dụng Claude trong công việc, prompting và sử dụng có trách nhiệm.',
  'ccar-p': 'Thiết kế, tích hợp và vận hành giải pháp Claude trong doanh nghiệp.',
};

export function CcaPageView({
  mode = 'account',
}: {
  mode?: 'login' | 'setup' | 'account' | 'redirect';
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>({ kind: 'loading' });
  const [topics, setTopics] = useState(TOPICS);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selected, setSelected] = useState<TopicId>('cca-f');
  const [results, setResults] = useState<Summary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [storageNotice, setStorageNotice] = useState('');

  function persist(summaries: Summary[]) {
    setResults(summaries);
    setStorageNotice(
      writeResults(summaries)
        ? ''
        : 'Trình duyệt không lưu được lịch sử. Kết quả vẫn được giữ tại phòng thi.'
    );
  }
  async function verified(session: Session) {
    if (mode !== 'account') {
      router.replace('/account');
      return;
    }
    const [catalog, initial] = await Promise.all([
      examApi.catalog(),
      examApi.dashboard(),
    ]);
    // A new page has no active room state: reload/closed-page attempts are consumed.
    if (initial.activeAttemptId) await examApi.finish(initial.activeAttemptId, 'abandon');
    const dashboard = initial.activeAttemptId ? await examApi.dashboard() : initial;
    setTopics(catalog);
    setCycles(dashboard.cycles);
    persist(dashboard.results);
    setScreen({ kind: 'dashboard', session });
    setError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  useEffect(() => {
    let canceled = false;
    void (async () => {
      try {
        const session = await examApi.session();
        if (canceled) return;
        const destination = !session
          ? '/login'
          : session.kind === 'password_setup'
            ? '/setup-password'
            : '/account';
        const currentRoute =
          mode === 'login'
            ? '/login'
            : mode === 'setup'
              ? '/setup-password'
              : mode === 'account'
                ? '/account'
                : null;
        if (!session || session.kind === 'password_setup') {
          writeResults([]);
          setResults([]);
        }
        if (destination !== currentRoute) {
          router.replace(destination);
          return;
        }
        if (!session || session.kind === 'password_setup') {
          setScreen({ kind: 'auth', ...(session ? { setup: session } : {}) });
          return;
        }
        const [catalog, initial] = await Promise.all([
          examApi.catalog(),
          examApi.dashboard(),
        ]);
        if (canceled) return;
        if (initial.activeAttemptId)
          await examApi.finish(initial.activeAttemptId, 'abandon');
        const dashboard = initial.activeAttemptId ? await examApi.dashboard() : initial;
        if (!canceled) {
          setTopics(catalog);
          setCycles(dashboard.cycles);
          persist(dashboard.results);
          setScreen({ kind: 'dashboard', session });
        }
      } catch (error) {
        if (!canceled) {
          writeResults([]);
          setResults([]);
          setError(error instanceof Error ? error.message : 'Chưa thể mở phòng thi.');
          setScreen({ kind: 'error' });
        }
      }
    })();
    return () => {
      canceled = true;
    };
  }, [router, mode]);

  async function start(form: number) {
    if (screen.kind !== 'dashboard') return;
    setBusy(true);
    setError('');
    try {
      const attempt = await examApi.start(selected, form);
      setCycles((previous) => {
        const current = previous.find((cycle) => cycle.topicId === selected);
        const next = {
          topicId: selected,
          usedForms: [...new Set([...(current?.usedForms ?? []), form])],
          activeAttemptId: attempt.id,
        };
        return [...previous.filter((cycle) => cycle.topicId !== selected), next];
      });
      setScreen({ kind: 'exam', session: screen.session, attempt });
      window.scrollTo(0, 0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa bắt đầu được bài thi.');
      if (error instanceof ExamApiError && error.status === 401) {
        setScreen({ kind: 'loading' });
        router.replace('/login');
        persist([]);
      }
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await examApi.logout();
      persist([]);
      setCycles([]);
      setScreen({ kind: 'loading' });
      router.replace('/login');
    } catch {
      setError('Chưa thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }
  if (screen.kind === 'error')
    return (
      <div className="space-y-4 py-16 text-center">
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  if (screen.kind === 'loading')
    return (
      <p role="status" className="text-muted-foreground py-16 text-center">
        Đang kiểm tra phiên đăng nhập…
      </p>
    );
  if (screen.kind === 'exam')
    return (
      <ExamRoom
        key={screen.attempt.id}
        attempt={screen.attempt}
        session={screen.session}
        onDiscard={() => {
          setScreen({ kind: 'loading' });
          void verified(screen.session).catch(() => {
            setScreen({ kind: 'loading' });
            router.replace('/login');
            persist([]);
          });
        }}
        onEnd={(summary) => {
          persist([summary, ...results.filter((r) => r.id !== summary.id)]);
          setScreen({ kind: 'result', session: screen.session, summary });
          window.scrollTo(0, 0);
        }}
      />
    );
  if (screen.kind === 'result')
    return (
      <>
        <ExamResult
          summary={screen.summary}
          onBack={() => {
            setBusy(true);
            void verified(screen.session)
              .catch((error: unknown) =>
                setError(
                  error instanceof Error ? error.message : 'Chưa tải được danh sách.'
                )
              )
              .finally(() => setBusy(false));
          }}
        />
        {busy && <p role="status">Đang tải danh sách đề…</p>}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {storageNotice && <p role="status">{storageNotice}</p>}
      </>
    );
  if (screen.kind === 'auth')
    return (
      <div className="space-y-4">
        {error && (
          <p role="alert" className="text-destructive text-center text-sm">
            {error}
          </p>
        )}
        <CandidateForm
          key={screen.setup?.user.id ?? 'login'}
          available={!!apiUrl}
          initialSession={screen.setup}
          onVerified={verified}
        />
      </div>
    );
  const topic = topics.find((t) => t.id === selected) ?? topics[0];
  return (
    <div className="space-y-8 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="bg-primary/10 text-primary mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
            <GraduationCap className="size-3.5" />
            CLAUDE CERTIFICATION PRACTICE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sẵn sàng cho <span className="text-primary">kỳ thi Claude.</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
            Chọn chứng chỉ, bước vào phòng thi và theo dõi tiến bộ qua từng đề.
          </p>
        </div>
        {screen.kind === 'dashboard' && (
          <div className="space-y-2 text-right">
            <p className="max-w-48 truncate text-sm font-medium">
              {screen.session.user.username}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void logout()}
              disabled={busy}
            >
              <LogOut className="mr-2 size-3.5" />
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {storageNotice && (
        <p role="status" className="text-muted-foreground text-xs">
          {storageNotice}
        </p>
      )}
      <>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { Icon: Layers3, text: '3 chứng chỉ · 30 đề thi' },
            { Icon: BookOpenCheck, text: '456 câu hỏi hợp lệ' },
            { Icon: ShieldCheck, text: '120 phút · Tự kết thúc' },
          ].map(({ Icon, text }) => (
            <div
              key={text}
              className="border-border/60 bg-card/50 text-muted-foreground flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium"
            >
              <Icon className="text-primary size-4" />
              {text}
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3" aria-label="Chọn chủ đề thi">
          {topics.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Chọn ${item.id.toUpperCase()}`}
              aria-pressed={selected === item.id}
              onClick={() => {
                setSelected(item.id);
                setError('');
              }}
              className={cn(
                'glass-card focus-visible:ring-ring flex cursor-pointer flex-col gap-3 rounded-2xl border p-5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
                selected === item.id
                  ? 'border-primary/60 bg-primary/5 ring-primary/10 ring-2'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <span className="text-primary text-sm font-extrabold tracking-wider">
                {item.id.toUpperCase()}
              </span>
              <h2 className="font-bold">{item.title}</h2>
              <p className="text-muted-foreground min-h-10 text-xs leading-5">
                {descriptions[item.id]}
              </p>
              <p className="border-border/50 text-muted-foreground mt-auto w-full border-t pt-3 text-xs">
                {item.questionsPerExam} câu / đề · {item.questionCount} câu trong ngân
                hàng
              </p>
            </button>
          ))}
        </div>
        <TopicDashboard
          key={selected}
          topic={topic}
          results={results}
          usedForms={cycles.find((cycle) => cycle.topicId === selected)?.usedForms ?? []}
          busy={busy}
          onStart={(form) => void start(form)}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void verified(screen.session)
              .catch((error: unknown) =>
                setError(
                  error instanceof Error ? error.message : 'Chưa tải được danh sách.'
                )
              )
              .finally(() => setBusy(false));
          }}
        >
          Tải lại danh sách đề
        </Button>
      </>
      <p className="text-muted-foreground text-center text-xs leading-5">
        Bộ luyện tập độc lập. Điểm mô phỏng không thay thế kết quả chứng chỉ chính thức.
      </p>
    </div>
  );
}
