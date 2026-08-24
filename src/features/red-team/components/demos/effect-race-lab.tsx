'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Keyboard,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Timer,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SEQUENCE = ['', 'R', 'Re', 'Rea', 'React'] as const;
type Query = (typeof SEQUENCE)[number];
type NonEmptyQuery = Exclude<Query, ''>;
type StepIndex = 1 | 2 | 3 | 4;

/** Latency giả lập deterministic — chữ càng dài, response càng về sớm. */
const LATENCY: Record<NonEmptyQuery, number> = { R: 900, Re: 650, Rea: 420, React: 180 };

const SUGGESTIONS: Record<NonEmptyQuery, string[]> = {
  R: ['React docs — trang chủ', 'React Native CLI setup', 'ReactDOM.createRoot()'],
  Re: ['Redux Toolkit — slice chuẩn', 'Refs & forwardRef', 'Remix vs Next.js'],
  Rea: ['React Query — staleTime', 'Reading list 2025', 'Reanimated 3 cơ bản'],
  React: ['React 19 Actions', 'React Compiler — memo tự động', 'React Server Components'],
};

const STEPS: Array<{ q: NonEmptyQuery; idx: StepIndex }> = [
  { q: 'R', idx: 1 },
  { q: 'Re', idx: 2 },
  { q: 'Rea', idx: 3 },
  { q: 'React', idx: 4 },
];

type Mode = 'dirty' | 'clean';

interface LogLine {
  text: string;
  kind: 'fire' | 'resolve' | 'ignore' | 'info';
}

export function EffectRaceLab() {
  const [typed, setTyped] = React.useState(0);
  const [mode, setMode] = React.useState<Mode>('dirty');
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [result, setResult] = React.useState<{ q: NonEmptyQuery; items: string[] } | null>(null);
  const [running, setRunning] = React.useState(false);
  const latestReqRef = React.useRef(0);
  const modeRef = React.useRef(mode);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  React.useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  React.useEffect(() => {
    const el = document.getElementById('race-terminal');
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const pushLog = (line: LogLine) => setLogs((prev) => [...prev.slice(-49), line]);

  const fireFetch = (q: NonEmptyQuery) => {
    latestReqRef.current += 1;
    const reqId = latestReqRef.current;
    const latency = LATENCY[q];
    pushLog({
      kind: 'fire',
      text: `$ fetch('/api/search?q=${q}') fired — mô phỏng latency ${latency}ms`,
    });
    const t = setTimeout(() => {
      if (modeRef.current === 'clean' && reqId !== latestReqRef.current) {
        pushLog({
          kind: 'ignore',
          text: `🛡️ ignored stale response q=${q} — cleanup đã huỷ đăng ký nó`,
        });
        return;
      }
      pushLog({ kind: 'resolve', text: `← resolved q=${q} (${latency}ms) → setResult()` });
      setResult({ q, items: SUGGESTIONS[q] });
    }, latency);
    timersRef.current.push(t);
  };

  const typeTo = (idx: StepIndex) => {
    setTyped(idx);
    fireFetch(SEQUENCE[idx]);
  };

  const runAll = () => {
    if (running) return;
    setTyped(0);
    setResult(null);
    setRunning(true);
    pushLog({
      kind: 'info',
      text: '$ run-all: gõ liên tiếp R → Re → Rea → React, mỗi keystroke cách nhau 250ms',
    });
    STEPS.forEach(({ idx }) => {
      const t = setTimeout(() => typeTo(idx), idx * 250);
      timersRef.current.push(t);
    });
    const done = setTimeout(() => setRunning(false), 1450);
    timersRef.current.push(done);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    pushLog({
      kind: 'info',
      text:
        next === 'clean'
          ? '⚙️ mode → ✅ có cleanup + ignore flag'
          : '⚙️ mode → ❌ không cleanup (stale response vẫn ghi đè)',
    });
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    setTyped(0);
    setResult(null);
    setRunning(false);
    pushLog({ kind: 'info', text: '$ reset — huỷ mọi timer đang chờ, xoá kết quả' });
  };

  const currentQuery = SEQUENCE[typed];
  const isWrong = result !== null && typed > 0 && result.q !== currentQuery;
  const isMatch = result !== null && typed > 0 && result.q === currentQuery;

  return (
    <div className="space-y-4">
      <Card className="glass-card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Zap className="h-4 w-4 text-amber-500" />
            Lab 02 · Effect Race — stale response ghi đè kết quả
          </h3>
          <Badge
            variant={mode === 'dirty' ? 'destructive' : 'success'}
            className="font-mono text-[10px]"
          >
            {mode === 'dirty' ? 'no-cleanup' : 'cleanup + ignore flag'}
          </Badge>
        </div>

        {/* Mode switch */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/40 p-1">
          <button
            type="button"
            onClick={() => switchMode('dirty')}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'dirty'
                ? 'bg-destructive/15 text-destructive'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            ❌ Không cleanup
          </button>
          <button
            type="button"
            onClick={() => switchMode('clean')}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'clean'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            ✅ Cleanup + ignore flag
          </button>
        </div>

        {/* Quick-typing controls */}
        <div className="flex flex-wrap gap-2">
          {STEPS.map(({ q, idx }) => (
            <Button
              key={q}
              size="sm"
              variant={idx === typed + 1 ? 'default' : 'outline'}
              disabled={running || idx <= typed}
              onClick={() => typeTo(idx)}
              className="gap-1 font-mono text-xs"
            >
              <Keyboard className="h-3 w-3" />“{q}”
            </Button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            onClick={runAll}
            disabled={running}
            className="gap-1 text-xs"
          >
            <Play className="h-3 w-3" />
            {running ? 'Đang gõ...' : 'Run tất cả'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            disabled={running}
            className="gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        {/* Fake search box */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              value={currentQuery}
              placeholder="Bấm các nút gõ nhanh phía trên..."
              className="pl-9 font-mono text-xs"
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Input hiện tại:{' '}
            <span className="font-mono text-foreground">“{currentQuery || '(trống)'}”</span> — mỗi
            keystroke bắn ra 1 request mới với latency giảm dần.
          </p>
        </div>

        {/* Terminal + result */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div
            id="race-terminal"
            className="max-h-44 min-h-[140px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] lg:col-span-3"
          >
            {logs.length === 0 ? (
              <span className="text-slate-500">$ nhấn một nút gõ để bắn request đầu tiên...</span>
            ) : (
              logs.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === 'resolve'
                      ? 'text-emerald-400'
                      : line.kind === 'ignore'
                        ? 'text-sky-400'
                        : line.kind === 'info'
                          ? 'text-slate-500'
                          : 'text-slate-300'
                  }
                >
                  {line.text}
                </div>
              ))
            )}
          </div>
          <div className="space-y-2 lg:col-span-2">
            {isWrong && result && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  ⚠️ WRONG RESULTS: stale response ghi đè kết quả mới
                </p>
                <p className="mt-1 text-[10px] text-destructive/80">
                  Đang hiện kết quả của “{result.q}” trong khi input là “{currentQuery}”.
                </p>
              </div>
            )}
            {isMatch && (
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Result khớp query mới nhất — stale response đã bị ignore 🛡️
              </div>
            )}
            <div className="min-h-[110px] rounded-xl border border-border/60 bg-secondary/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Kết quả cho q=“{result ? result.q : '—'}”
              </p>
              {result ? (
                <ul className="mt-2 space-y-1">
                  {result.items.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-background/60 px-2 py-1.5 text-xs text-foreground"
                    >
                      <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Chưa có response nào về...</p>
              )}
            </div>
          </div>
        </div>

        {/* Insight */}
        <div className="flex items-start gap-2 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
          <span>
            Fix chuẩn trong useEffect thật:{' '}
            <span className="font-mono text-foreground">{'return () => { cancelled = true }'}</span>{' '}
            hoặc AbortController — response cũ về muộn thì bị ignore, chỉ response của query mới
            nhất được phép setState.
          </span>
        </div>
      </Card>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Toàn bộ mô phỏng chạy client-side an toàn — latency là bảng giá trị định sẵn, không có request
        mạng thật nào được gửi. Chế độ cleanup minh họa chính xác hành vi của hàm return trong
        useEffect khi response cũ về sau response mới.
      </p>
    </div>
  );
}
