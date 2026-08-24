'use client';

import * as React from 'react';
import {
  CheckCircle2,
  FlaskConical,
  PartyPopper,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Timer,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';

/* ═══════════ Nguyên lý enterprise testing (Vitest + RTL + MSW) ═══════════
 * 1. Test HÀNH VI người dùng, không test chi tiết implementation (RTL role queries).
 * 2. Mock network ở BIÊN GIỚI bằng MSW — service worker chặn request thật trong CI.
 * 3. Fake timers cho debounce/interval → CI nhanh, ổn định, không bao giờ flaky.
 * Demo dưới đây mô phỏng một runner thật chạy hoàn toàn client-side.
 * ════════════════════════════════════════════════════════════════════════ */

type LineKind =
  | 'cmd'
  | 'suite'
  | 'step'
  | 'pass'
  | 'fail'
  | 'diffNeg'
  | 'diffPos'
  | 'summaryFail'
  | 'summaryPass'
  | 'patch';

interface TerminalLine {
  kind: LineKind;
  text: string;
}

interface ScriptLine extends TerminalLine {
  delay: number;
  testId?: string;
}

interface TestCase {
  id: string;
  file: string;
  name: string;
  arrange: string;
  act: string;
  assert: string;
  ms: number;
}

const TESTS: TestCase[] = [
  {
    id: 't1',
    file: 'auth/LoginForm.test.tsx',
    name: 'renders login form (role queries)',
    arrange: "render(<LoginForm />)",
    act: 'smoke test — chỉ mount và query',
    assert: "expect(getByRole('button', { name: /đăng nhập/i })).toBeEnabled()",
    ms: 34,
  },
  {
    id: 't2',
    file: 'auth/LoginForm.test.tsx',
    name: 'rejects wrong password (MSW mock)',
    arrange: "server.use(http.post('*/api/login', () => HttpResponse.json(401)))",
    act: "user.type(pwSai); user.click('Đăng nhập')",
    assert: "expect(await screen.findByRole('alert')).toHaveTextContent('Sai mật khẩu')",
    ms: 47,
  },
  {
    id: 't3',
    file: 'search/SearchBar.test.tsx',
    name: 'debounced search fires once (fake timers)',
    arrange: 'vi.useFakeTimers()',
    act: "await user.type(input, 'next.js'); vi.advanceTimersByTime(500)",
    assert: 'expect(searchSpy).toHaveBeenCalledTimes(1)',
    ms: 52,
  },
  {
    id: 't4',
    file: 'a11y/FormA11y.test.tsx',
    name: 'accessible label cho input',
    arrange: 'render(<SettingsForm />)',
    act: 'query-only — kiểm tra accessibility tree',
    assert: "expect(getByLabelText('Mật khẩu')).toBeInTheDocument()",
    ms: 21,
  },
  {
    id: 't5',
    file: 'cart/CartTotal.test.tsx',
    name: '❌ BUG: cart total sai khi xóa item',
    arrange: 'seedCart([20₫, 30₫, 50₫])',
    act: "removeItem(item 30₫)",
    assert: "expect(cart.totalVnd()).toBe('70₫')",
    ms: 63,
  },
];

const TOTAL_MS = TESTS.reduce((sum, t) => sum + t.ms, 0);

const KIND_CLASS: Record<LineKind, string> = {
  cmd: 'font-bold text-slate-200',
  suite: 'text-slate-400',
  step: 'text-slate-500',
  pass: 'text-emerald-400',
  fail: 'text-red-400',
  diffNeg: 'bg-emerald-500/10 text-emerald-400',
  diffPos: 'bg-red-500/10 text-red-400',
  summaryFail: 'font-bold text-amber-300',
  summaryPass: 'font-bold text-emerald-300',
  patch: 'text-sky-300',
};

const BUGGY_CODE = `// ❌ src/lib/cart-store.ts — removeItem quên deduct
let items: CartItem[] = [];
let total = 0;

function addToCart(item: CartItem) {
  items.push(item);
  total += item.price;
}

function removeItem(id: string) {
  items = items.filter((i) => i.id !== id);
  // 💥 BUG: total không bị trừ → tổng bị đội lên
}`;

const FIXED_CODE = `// ✅ Patch: deduct removed item khỏi tổng
function removeItem(id: string) {
  const victim = items.find((i) => i.id === id);
  items = items.filter((i) => i.id !== id);
  if (victim) total -= victim.price; // 🔧 fix
}`;

const buildScript = (fixed: boolean): ScriptLine[] => {
  const script: ScriptLine[] = [];
  let cursor = 0;
  const push = (line: Omit<ScriptLine, 'delay'>, gap = 95) => {
    cursor += gap;
    script.push({ ...line, delay: cursor });
  };

  push({ kind: 'cmd', text: '$ npx vitest run --reporter=verbose' }, 10);

  TESTS.forEach((tc) => {
    const fails = tc.id === 't5' && !fixed;
    push(
      { kind: 'suite', testId: tc.id, text: `▸ ${tc.file} › ${tc.name}` },
      150,
    );
    push({ kind: 'step', text: `   arrange : ${tc.arrange}` });
    push({ kind: 'step', text: `   act     : ${tc.act}` });
    push({ kind: 'step', text: `   assert  : ${tc.assert}` });
    if (fails) {
      push({ kind: 'fail', testId: tc.id, text: '   ✕ assertion-error: expect(cart.totalVnd())' }, 130);
      push({ kind: 'diffNeg', text: '      - Expected: 70₫' }, 90);
      push({ kind: 'diffPos', text: '      + Received: 100₫' }, 90);
      push({ kind: 'fail', testId: tc.id, text: `  ✕ ${tc.name} ${tc.ms}ms` }, 110);
    } else {
      push({ kind: 'pass', testId: tc.id, text: `  ✓ ${tc.name} ${tc.ms}ms` }, 140);
    }
  });

  if (fixed) {
    push(
      { kind: 'summaryPass', text: ' Test Files  1 passed (1)' },
      220,
    );
    push({ kind: 'summaryPass', text: ` Tests       5 passed (5) · Duration ~${TOTAL_MS}ms` }, 60);
  } else {
    push({ kind: 'summaryFail', text: ' Test Files  1 failed (1)' }, 220);
    push({ kind: 'summaryFail', text: ' Tests  4 passed | 1 failed (5) · exit code 1' }, 60);
  }
  return script;
};

export function TestRunnerSimulator() {
  const [lines, setLines] = React.useState<TerminalLine[]>([]);
  const [results, setResults] = React.useState<Record<string, 'pass' | 'fail'>>({});
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);
  const [ranOnce, setRanOnce] = React.useState(false);
  const [codeFixed, setCodeFixed] = React.useState(false);
  const [summary, setSummary] = React.useState<'pass' | 'fail' | null>(null);

  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const termRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    const el = termRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const runAll = () => {
    if (running) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setResults({});
    setActiveId(null);
    setLines([]);
    setRunning(true);
    setRanOnce(true);
    setSummary(null);

    const script = buildScript(codeFixed);
    script.forEach((sl, idx) => {
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, { kind: sl.kind, text: sl.text }]);
        if (sl.testId && sl.kind === 'suite') setActiveId(sl.testId);
        if (sl.testId && (sl.kind === 'pass' || sl.kind === 'fail')) {
          setResults((prev) => ({
            ...prev,
            [sl.testId as string]: sl.kind === 'pass' ? 'pass' : 'fail',
          }));
          setActiveId(null);
        }
        if (idx === script.length - 1) {
          setRunning(false);
          setActiveId(null);
          setSummary(codeFixed ? 'pass' : 'fail');
        }
      }, sl.delay);
      timersRef.current.push(timer);
    });
  };

  const applyFix = () => {
    if (codeFixed) return;
    setCodeFixed(true);
    setLines((prev) => [
      ...prev,
      { kind: 'patch', text: '$ git apply fix/cart-deduct-total.patch' },
      { kind: 'patch', text: '> cart-store.ts: removeItem() giờ trừ total -= victim.price ✅' },
    ]);
    setSummary(null);
  };

  const resetAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLines([]);
    setResults({});
    setActiveId(null);
    setRunning(false);
    setRanOnce(false);
    setCodeFixed(false);
    setSummary(null);
  };

  /* ─── Derived ──────────────────────────────────────────── */
  const passedCount = TESTS.filter((t) => results[t.id] === 'pass').length;
  const failedCount = TESTS.filter((t) => results[t.id] === 'fail').length;
  const passRate = Math.round((passedCount / TESTS.length) * 100);

  const rowDot = (id: string) => {
    if (results[id] === 'pass')
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />;
    if (results[id] === 'fail') return <XCircle className="h-4 w-4 shrink-0 text-destructive" />;
    if (activeId === id)
      return <span className="h-3.5 w-3.5 shrink-0 animate-pulse rounded-full bg-sky-500" />;
    return (
      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border bg-muted-foreground/30" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ════════ SUITE PANEL ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FlaskConical className="h-4 w-4 text-sky-500" />
              vitest · ecommerce-web · 5 tests
            </h3>
            <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1 text-[11px]">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          {/* Stats strip */}
          <div className="space-y-1.5 rounded-xl border border-border/60 bg-secondary/20 p-3">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Timer className="h-3 w-3" />
                duration:
                <span className="font-bold text-foreground">{TOTAL_MS}ms</span>
                <span className="text-[9px]">(virtual)</span>
              </span>
              <span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {passedCount} passed
                </span>
                {failedCount > 0 && (
                  <span className="ml-1 font-bold text-destructive">· {failedCount} failed</span>
                )}
              </span>
            </div>
            <Progress
              value={passRate}
              className="h-2"
              indicatorClassName={
                passRate === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-destructive'
              }
            />
            <p className="text-right font-mono text-[10px] text-muted-foreground">
              pass rate {passRate}%
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={runAll} disabled={running} className="text-xs font-bold">
              <Play className="mr-1.5 h-4 w-4" />
              {running ? 'Running…' : ranOnce ? 'Re-run all tests' : '▶ Run all tests (Vitest)'}
            </Button>
            {summary === 'fail' && (
              <Button
                variant="secondary"
                onClick={applyFix}
                className="border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                🔧 Fix implementation (deduct removed item)
              </Button>
            )}
          </div>

          {/* Test rows */}
          <div className="space-y-1.5">
            {TESTS.map((tc) => (
              <div
                key={tc.id}
                className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                  activeId === tc.id
                    ? 'animate-pulse border-sky-500/50 bg-sky-500/5'
                    : results[tc.id] === 'pass'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : results[tc.id] === 'fail'
                        ? 'border-destructive/40 bg-destructive/5'
                        : 'border-border/50 bg-secondary/10'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {rowDot(tc.id)}
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-foreground">{tc.name}</p>
                    <p className="truncate text-[9px] text-muted-foreground">{tc.file}</p>
                  </div>
                </div>
                {results[tc.id] ? (
                  <Badge
                    variant={results[tc.id] === 'pass' ? 'success' : 'destructive'}
                    className="shrink-0 font-mono text-[9px]"
                  >
                    {results[tc.id] === 'pass' ? `✓ ${tc.ms}ms` : '✕ failed'}
                  </Badge>
                ) : activeId === tc.id ? (
                  <Badge variant="info" className="shrink-0 animate-pulse font-mono text-[9px]">
                    running…
                  </Badge>
                ) : (
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
                    idle
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ════════ TERMINAL + PATCH ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Terminal className="h-4 w-4 text-emerald-500" />
            Runner Output
          </h3>

          <div
            ref={termRef}
            className="min-h-[260px] max-h-[300px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed"
          >
            {lines.length === 0 ? (
              <span className="text-slate-500">$ npx vitest run — chờ bạn nhấn Run…</span>
            ) : (
              lines.map((line, i) => (
                <div key={i} className={`whitespace-pre-wrap break-words ${KIND_CLASS[line.kind]}`}>
                  {line.text}
                </div>
              ))
            )}
          </div>

          <CodeBlock code={codeFixed ? FIXED_CODE : BUGGY_CODE} language="tsx" />
        </Card>
      </div>

      {/* Summary banners */}
      {summary === 'pass' && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <PartyPopper className="h-4 w-4" />
            All 5 passed ✅ — ship it!
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
            CI xanh nhờ 3 nguyên lý: test hành vi người dùng (role queries), mock network ở biên
            giới bằng MSW, fake timers cho debounce — không flaky, không đụng server thật.
          </p>
        </div>
      )}
      {summary === 'fail' && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm font-bold text-destructive">
            Tests: 4 passed, 1 failed ✖ — cart.total không trừ tiền khi xóa item (expected 70₫,
            received 100₫).
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Đây chính là giá trị của regression test: bug được bắt TRƯỚC khi user phát hiện giỏ
            hàng “biến mất” tiền của họ. Nhấn 🔧 Fix rồi Re-run để thấy màu đỏ biến mất.
          </p>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Mô phỏng runner thật chạy hoàn toàn client-side (không có Vitest/MSW nào được thực thi).
        Nguyên lý được mô phỏng đúng tinh thần: test hành vi người dùng, mock network ở biên giới
        (MSW), fake timers cho CI flaky-free.
      </p>
    </div>
  );
}
