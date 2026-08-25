'use client';

import * as React from 'react';
import {
  Cpu,
  Database,
  Globe,
  KeyRound,
  Lock,
  Palette,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Skull,
  Timer,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * FIRING RANGE · resource-supply-drain
 * Sân bắn cạn kiệt tài nguyên: waterfall tuần tự giết TTFB, bão dynamic render
 * đè bẹp database, siege compute đóng băng main thread, bão tham chiếu vô hiệu
 * React.memo, context monolith phát sóng re-render toàn cây, và CDN hijack
 * đầu độc lib@latest để ghi phím. Mọi "thiệt hại" đều là mô phỏng local state —
 * không network, không vòng lặp nặng. Bật đủ bản vá để thấy mọi vector biến mất.
 */

type VectorId =
  | 'waterfall'
  | 'render-storm'
  | 'compute-siege'
  | 'ref-storm'
  | 'context-blast'
  | 'supply-chain';

const VECTOR_TOTAL = 6;

/* ─── Vector 1 · Waterfall ─────────────────────────────────────────────── */

const RESOURCES = [
  { path: '/api/user', ms: 280 },
  { path: '/api/orders', ms: 300 },
  { path: '/api/cart', ms: 320 },
  { path: '/api/recos', ms: 300 },
];

const WF_STARTS = (() => {
  let acc = 0;
  return RESOURCES.map((res) => {
    const start = acc;
    acc += res.ms;
    return start;
  });
})();

const WF_SEQ_MS = RESOURCES.reduce((sum, res) => sum + res.ms, 0); // ~1200ms
const WF_PAR_MS = Math.max(...RESOURCES.map((res) => res.ms)) + 40; // ~360ms

/* ─── Vector 2 · Render storm ──────────────────────────────────────────── */

const STORM_TICKS = 8;
const STORM_BATCH = 125; // 8 × 125 = 1000 request

/* ─── Vector 3 · Compute siege ─────────────────────────────────────────── */

const ROW_OPTIONS = [10_000, 100_000, 1_000_000, 10_000_000];
const FRAME_LOSS = [9, 23, 47, 96]; // frame rơi tương ứng mỗi mức rows
const FREEZE_MS = 1500;

/* ─── Vector 4 · Reference storm ───────────────────────────────────────── */

const REF_ROWS = Array.from({ length: 12 }, (_, i) => i + 1);
// Hằng số ở module scope → tham chiếu TUYỆT ĐỐI ổn định giữa các lần render
const STABLE_ROW_STYLE = { fg: '#34d399' };

interface RefStormRowProps {
  index: number;
  /** Đổi mỗi nhịp khi đang bị tấn công → phá shallow compare */
  pulse: number;
  styleObj: { fg: string };
  onCommit: () => void;
}

function RefStormRow({ index, pulse, styleObj, onCommit }: RefStormRowProps) {
  // Effect không deps = chạy sau MỖI lần commit thật của row này
  React.useEffect(() => {
    onCommit();
  });
  return (
    <div className="flex items-center justify-between rounded-md bg-slate-900/70 px-2 py-[3px]">
      <span className="font-mono text-[10px] text-slate-500">
        Row #{String(index).padStart(2, '0')}
      </span>
      <span
        className="h-1.5 w-1.5 rounded-full transition-opacity duration-300"
        style={{ backgroundColor: styleObj.fg, opacity: pulse % 2 === 0 ? 1 : 0.25 }}
      />
    </div>
  );
}

const RefStormRowMemo = React.memo(RefStormRow);

/* ─── Vector 5 · Context blast ─────────────────────────────────────────── */

const SUBSCRIBERS = 300;
const THEME_DOT = 137; // consumer duy nhất THẬT SỰ cần theme (vd Header)

/* ─── Shared shells ────────────────────────────────────────────────────── */

interface SectionShellProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  vulnerable: boolean;
  children: React.ReactNode;
}

function SectionShell({ icon, title, subtitle, vulnerable, children }: SectionShellProps) {
  return (
    <Card
      className={`glass-card p-3 sm:p-4 ${
        vulnerable ? 'border-destructive/30' : 'border-emerald-500/25'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              vulnerable
                ? 'bg-destructive/10 text-destructive'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            {icon}
          </span>
          <div>
            <p className="text-xs font-bold text-foreground">{title}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {vulnerable ? (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <Skull className="h-3 w-3" />
            LỖ HỔNG
          </Badge>
        ) : (
          <Badge variant="success" className="gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            ĐÃ VÁ
          </Badge>
        )}
      </div>
      {children}
    </Card>
  );
}

interface DefenseToggleProps {
  active: boolean;
  label: string;
  onToggle: () => void;
}

function DefenseToggle({ active, label, onToggle }: DefenseToggleProps) {
  return (
    <Button
      size="sm"
      variant={active ? 'default' : 'ghost'}
      onClick={onToggle}
      className="h-6 px-2 text-[10px]"
    >
      <ShieldCheck className="mr-1 h-3 w-3" />
      {label}
    </Button>
  );
}

export function ResourceDrainLab() {
  /* Vector 1 — waterfall */
  const [parallel, setParallel] = React.useState(false);
  const [wfPhase, setWfPhase] = React.useState<'idle' | 'running' | 'done'>('idle');
  const [wfGo, setWfGo] = React.useState(false);

  /* Vector 2 — render storm */
  const [isr, setIsr] = React.useState(false);
  const [reqs, setReqs] = React.useState(0);
  const [dbHits, setDbHits] = React.useState(0);
  const [storming, setStorming] = React.useState(false);
  const [stormLines, setStormLines] = React.useState<string[]>([]);
  const stormIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const isrRef = React.useRef(isr);

  /* Vector 3 — compute siege */
  const [rowStep, setRowStep] = React.useState(1);
  const [memoCompute, setMemoCompute] = React.useState(false);
  const [freezing, setFreezing] = React.useState(false);
  const [framesDropped, setFramesDropped] = React.useState<number | null>(null);

  /* Vector 4 — reference storm */
  const [refStormOn, setRefStormOn] = React.useState(false);
  const [refTick, setRefTick] = React.useState(0);
  const [childCommits, setChildCommits] = React.useState(0);
  const [memoChildren, setMemoChildren] = React.useState(false);

  /* Vector 5 — context blast */
  const [splitCtx, setSplitCtx] = React.useState(false);
  const [dark, setDark] = React.useState(true);
  const [ctxFlash, setCtxFlash] = React.useState<number[] | null>(null);
  const [lastBlast, setLastBlast] = React.useState<number | null>(null);

  /* Vector 6 — supply chain */
  const [pinVersion, setPinVersion] = React.useState(false);
  const [sriOn, setSriOn] = React.useState(false);
  const [cdnLoaded, setCdnLoaded] = React.useState(false);
  const [pwdValue, setPwdValue] = React.useState('');
  const [keystrokes, setKeystrokes] = React.useState(0);

  /* Meta — đã bắn những vector nào */
  const [fired, setFired] = React.useState<VectorId[]>([]);

  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = React.useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  React.useEffect(() => {
    isrRef.current = isr;
  }, [isr]);

  React.useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      if (stormIntervalRef.current !== null) clearInterval(stormIntervalRef.current);
    },
    []
  );

  const markFired = (id: VectorId) =>
    setFired((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const patched: Record<VectorId, boolean> = {
    waterfall: parallel,
    'render-storm': isr,
    'compute-siege': memoCompute,
    'ref-storm': memoChildren,
    'context-blast': splitCtx,
    'supply-chain': pinVersion || sriOn,
  };
  const patchedCount = Object.values(patched).filter(Boolean).length;
  const allPatched = patchedCount === VECTOR_TOTAL;
  const allFired = fired.length === VECTOR_TOTAL;

  /* ── Vector 1 handler: chạy trace waterfall ── */
  const runWaterfall = () => {
    if (wfPhase === 'running') return;
    markFired('waterfall');
    setWfPhase('running');
    setWfGo(false); // reset bar về 0 tức thì (transition: none)
    later(() => setWfGo(true), 60); // kích hoạt width transition có delay xếp lớp
    later(() => setWfPhase('done'), 80 + (parallel ? WF_PAR_MS : WF_SEQ_MS) + 380);
  };

  /* ── Vector 2 handler: bão 1000 request động ── */
  const fireRenderStorm = () => {
    if (stormIntervalRef.current !== null) return;
    markFired('render-storm');
    setStorming(true);
    let tick = 0;
    stormIntervalRef.current = setInterval(() => {
      tick += 1;
      const cacheOn = isrRef.current;
      const page = Math.floor(Math.random() * 48_000);
      setReqs((r) => r + STORM_BATCH);
      setDbHits((h) => h + (cacheOn ? (tick === 1 ? 1 : 0) : STORM_BATCH));
      setStormLines((prev) => [
        ...prev.slice(-4),
        cacheOn
          ? `GET /san-pham?page=${page} → 200 · ISR CACHE${tick === 1 ? ' (fill đầu tiên)' : ''}`
          : `GET /san-pham?page=${page} → 200 · SELECT * FROM products 💀`,
      ]);
      if (tick >= STORM_TICKS && stormIntervalRef.current !== null) {
        clearInterval(stormIntervalRef.current);
        stormIntervalRef.current = null;
        setStorming(false);
      }
    }, 130);
  };

  /* ── Vector 3 handler: siege main thread ── */
  const runComputeSiege = () => {
    markFired('compute-siege');
    if (memoCompute) {
      setFramesDropped(0); // useMemo cache hit — UI vẫn mượt
      return;
    }
    setFramesDropped(FRAME_LOSS[rowStep]);
    setFreezing(true);
    later(() => setFreezing(false), FREEZE_MS);
  };

  /* ── Vector 4: interval re-render parent mỗi giây ── */
  React.useEffect(() => {
    if (!refStormOn) return;
    const id = setInterval(() => setRefTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [refStormOn]);

  const handleChildCommit = React.useCallback(() => setChildCommits((c) => c + 1), []);

  React.useEffect(() => {
    setChildCommits(0); // đổi chế độ memo = đo lại từ đầu
  }, [memoChildren, refStormOn]);

  /* ── Vector 5 handler: đổi theme toàn cục ── */
  const fireContextBlast = () => {
    markFired('context-blast');
    setDark((d) => !d);
    const ids = splitCtx
      ? [THEME_DOT]
      : Array.from({ length: SUBSCRIBERS }, (_, i) => i);
    setCtxFlash(ids);
    setLastBlast(ids.length);
    later(() => setCtxFlash(null), 700);
  };

  /* ── Vector 6 handler: nạp script từ CDN ── */
  const hijackLive = cdnLoaded && !pinVersion && !sriOn;

  const loadCdnScript = () => {
    markFired('supply-chain');
    setCdnLoaded(true);
    setPwdValue('');
    setKeystrokes(0);
  };

  /* ── Global controls ── */
  const armAllDefenses = () => {
    setParallel(true);
    setIsr(true);
    setMemoCompute(true);
    setMemoChildren(true);
    setSplitCtx(true);
    setPinVersion(true);
    setSriOn(true);
  };

  const disarmAllDefenses = () => {
    setParallel(false);
    setIsr(false);
    setMemoCompute(false);
    setMemoChildren(false);
    setSplitCtx(false);
    setPinVersion(false);
    setSriOn(false);
  };

  const resetLab = () => {
    disarmAllDefenses();
    setWfPhase('idle');
    setWfGo(false);
    setReqs(0);
    setDbHits(0);
    setStorming(false);
    setStormLines([]);
    if (stormIntervalRef.current !== null) {
      clearInterval(stormIntervalRef.current);
      stormIntervalRef.current = null;
    }
    setFreezing(false);
    setFramesDropped(null);
    setRefStormOn(false);
    setRefTick(0);
    setChildCommits(0);
    setCtxFlash(null);
    setLastBlast(null);
    setCdnLoaded(false);
    setPwdValue('');
    setKeystrokes(0);
    setFired([]);
  };

  const blockedMs = FRAME_LOSS[rowStep] * 16;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {allPatched ? (
            <Badge variant="success" className="gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              DEFENSE ON
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <Skull className="h-3 w-3" />
              ATTACK MODE
            </Badge>
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            đã vá {patchedCount}/{VECTOR_TOTAL} vector · đã bắn {fired.length}/{VECTOR_TOTAL} đợt
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={!allPatched ? 'destructive' : 'ghost'}
            onClick={disarmAllDefenses}
            className="h-7 text-[11px]"
          >
            <Skull className="mr-1 h-3 w-3" />
            Deploy ẩu
          </Button>
          <Button
            size="sm"
            variant={allPatched ? 'default' : 'ghost'}
            onClick={armAllDefenses}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Bản vá
          </Button>
          <Button size="sm" variant="outline" onClick={resetLab} className="h-7 text-[11px]">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* ── Vector 1 · Sequential waterfall ── */}
      <SectionShell
        icon={<Timer className="h-3.5 w-3.5" />}
        title="Sequential Waterfall Trap"
        subtitle="await xếp hàng trong RSC → TTFB = TỔNG, không phải MAX"
        vulnerable={!parallel}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <AttackTraceLabel running={wfPhase === 'running'} done={wfPhase === 'done'} />
          <DefenseToggle
            active={parallel}
            label={parallel ? 'Promise.all + preload ON' : 'Promise.all + preload OFF'}
            onToggle={() => setParallel((v) => !v)}
          />
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
          {RESOURCES.map((res, i) => (
            <div key={res.path} className="space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-400">{res.path}</span>
                <span className={parallel ? 'text-emerald-400' : 'text-rose-400'}>
                  {res.ms}ms
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-900">
                <div
                  className={`h-full rounded-full ${
                    parallel
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-rose-600 to-orange-400'
                  }`}
                  style={{
                    width: wfGo ? '100%' : '0%',
                    transition: wfGo
                      ? `width ${res.ms}ms linear ${parallel ? 0 : WF_STARTS[i]}ms`
                      : 'none',
                  }}
                />
              </div>
            </div>
          ))}
          <p className="font-mono text-[10px] leading-relaxed">
            {wfPhase === 'running' ? (
              <span className="animate-pulse text-amber-400">$ tracing network…</span>
            ) : wfPhase === 'done' ? (
              parallel ? (
                <span className="text-emerald-400">
                  $ TTFB ≈ {WF_PAR_MS}ms · max(fetch) — 4 bar CHẠY ĐỒNG THỜI 🛡️
                </span>
              ) : (
                <span className="text-rose-400">
                  $ TTFB ≈ {WF_SEQ_MS}ms · TỔNG dồn tuần tự — bar sau chờ bar trước 💀
                </span>
              )
            ) : (
              <span className="text-slate-500">$ nhấn &quot;Chạy trace&quot; để đo TTFB…</span>
            )}
          </p>
          <Button
            size="sm"
            variant="destructive"
            onClick={runWaterfall}
            disabled={wfPhase === 'running'}
            className="h-7 text-[11px]"
          >
            <Play className="mr-1 h-3 w-3" />
            Chạy trace
          </Button>
        </div>

        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            parallel ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          }`}
        >
          {parallel
            ? '🛡️ Fetch độc lập chạy song song: TTFB rơi về max(fetch) thay vì tổng; phần không chặn nội dung chính đẩy xuống <Suspense> stream.'
            : '💀 Mỗi await cộng dồn độ trễ: dashboard thành trang chậm nhất hệ thống, LCP cháy đỏ, conversion tụt theo từng trăm mili-giây.'}
        </p>
      </SectionShell>

      {/* ── Vector 2 · Dynamic rendering storm ── */}
      <SectionShell
        icon={<Database className="h-3.5 w-3.5" />}
        title="Dynamic Rendering Storm"
        subtitle="force-dynamic + no-store → 100% request đấm vào DB"
        vulnerable={!isr}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            flood /san-pham?page=*
          </span>
          <DefenseToggle
            active={isr}
            label={isr ? 'ISR revalidate 300 ON' : 'ISR revalidate 300 OFF'}
            onToggle={() => setIsr((v) => !v)}
          />
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] sm:grid-cols-3">
            <StatBox label="requests" value={reqs.toLocaleString('vi-VN')} tone="neutral" />
            <StatBox
              label="DB hits"
              value={dbHits.toLocaleString('vi-VN')}
              tone={dbHits > 50 ? 'bad' : 'good'}
            />
            <StatBox
              label="pool"
              value={dbHits > 50 ? `${Math.min(20, Math.ceil(dbHits / 50))}/20 busy` : '0/20 busy'}
              tone={dbHits > 50 ? 'bad' : 'good'}
            />
          </div>

          <div className="max-h-24 space-y-0.5 overflow-hidden font-mono text-[10px] leading-relaxed text-slate-400">
            {stormLines.length === 0 ? (
              <p className="animate-pulse text-slate-600">$ log request trống — chưa bắn…</p>
            ) : (
              stormLines.map((line, i) => (
                <p key={`${line}-${i}`} className={line.includes('💀') ? 'text-rose-400' : 'text-emerald-400'}>
                  {line}
                </p>
              ))
            )}
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={fireRenderStorm}
            disabled={storming}
            className="h-7 text-[11px]"
          >
            <Zap className="mr-1 h-3 w-3" />
            {storming ? 'Đang bắn…' : 'Bắn 1000 request động'}
          </Button>
        </div>

        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            isr ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          }`}
        >
          {isr
            ? '🛡️ Static shell + ISR phục vụ 99% request từ cache; webhook revalidateTag chỉ làm tươi đúng gì đã đổi. DB gần như không biết campaign đang chạy.'
            : '💀 Mỗi user là một lượt SELECT *: connection pool cạn trong phút, p99 lên hàng chục giây và trang sập đúng giờ vàng doanh thu.'}
        </p>
      </SectionShell>

      {/* ── Vector 3 · Compute siege ── */}
      <SectionShell
        icon={<Cpu className="h-3.5 w-3.5" />}
        title="Render-Body Compute Siege"
        subtitle="filter/sort ngay trong thân render → main thread đóng băng"
        vulnerable={!memoCompute}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            dataset:{' '}
            <span className="text-amber-400">{ROW_OPTIONS[rowStep].toLocaleString('vi-VN')} rows</span>
          </label>
          <DefenseToggle
            active={memoCompute}
            label={memoCompute ? 'useMemo + defer ON' : 'useMemo + defer OFF'}
            onToggle={() => setMemoCompute((v) => !v)}
          />
        </div>

        <input
          type="range"
          min={0}
          max={ROW_OPTIONS.length - 1}
          step={1}
          value={rowStep}
          onChange={(e) => setRowStep(Number(e.target.value))}
          className="w-full accent-rose-500"
          aria-label="Số dòng dữ liệu"
        />

        <div className="relative mt-2 space-y-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-3">
          <p className="font-mono text-[10px] leading-relaxed text-slate-400">
            {memoCompute ? (
              <>
                <span className="text-emerald-400">const rows = useMemo(…)</span>{' '}
                <span className="text-slate-600">{'// chỉ tính lại khi query/sortKey đổi'}</span>
              </>
            ) : (
              <>
                <span className="text-rose-400">allTransactions.filter(…).sort(…)</span>{' '}
                <span className="text-slate-600">{'// chạy LẠI ở mọi render'}</span>
              </>
            )}
          </p>

          {framesDropped !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>dropped frames / 1.5s</span>
                <span className={framesDropped > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                  {framesDropped}
                </span>
              </div>
              <Progress
                value={framesDropped}
                max={120}
                indicatorClassName={
                  framesDropped > 0
                    ? 'bg-gradient-to-r from-amber-500 to-destructive'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }
              />
              <p className="font-mono text-[10px] text-slate-500">
                {framesDropped > 0
                  ? `main thread blocked ≈ ${blockedMs}ms · INP ≈ ${blockedMs}ms 💀`
                  : 'cache hit ≈ 0.6ms · 0 frame rơi · keystroke echo tức thì 🛡️'}
              </p>
            </div>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={runComputeSiege}
            disabled={freezing}
            className="h-7 text-[11px]"
          >
            <Zap className="mr-1 h-3 w-3" />
            Filter ngay trong render
          </Button>

          {/* Overlay giả lập đóng băng — thuần visual, setTimeout gỡ sau 1.5s */}
          {freezing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-slate-950/90 backdrop-blur-[2px]">
              <Skull className="h-5 w-5 animate-pulse text-rose-500" />
              <p className="font-mono text-[11px] font-bold text-rose-400">
                ⛔ MAIN THREAD BLOCKED — filter {ROW_OPTIONS[rowStep].toLocaleString('vi-VN')} rows…
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                input · click · animation đang xếp hàng chờ compute
              </p>
            </div>
          )}
        </div>

        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            memoCompute ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          }`}
        >
          {memoCompute
            ? '🛡️ Compute nặng nằm sau useMemo deps chuẩn xác, state gõ phím đẩy xuống con, danh sách lớn thì virtualize — main thread thở lại.'
            : '💀 Mỗi keystroke đốt O(n log n) CPU: chữ hiện sau nửa giây trên mobile, INP đỏ thẫm, pin tụt như vỡ đập.'}
        </p>
      </SectionShell>

      {/* ── Vector 4 · Reference storm ── */}
      <SectionShell
        icon={<RefreshCw className="h-3.5 w-3.5" />}
        title="Referential Identity Storm"
        subtitle="object/function mới mỗi render → React.memo vô dụng"
        vulnerable={!memoChildren}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            parent re-render 1s/nhịp
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={refStormOn ? 'secondary' : 'ghost'}
              onClick={() => {
                markFired('ref-storm');
                setRefStormOn((v) => !v);
              }}
              className="h-6 px-2 text-[10px]"
            >
              <Play className="mr-1 h-3 w-3" />
              {refStormOn ? 'Dừng bão' : 'Bật bão 1s/nhịp'}
            </Button>
            <DefenseToggle
              active={memoChildren}
              label={memoChildren ? 'React.memo + stable refs ON' : 'React.memo + stable refs OFF'}
              onToggle={() => setMemoChildren((v) => !v)}
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 md:grid-cols-2">
          <div className="grid grid-cols-2 content-start gap-1">
            {REF_ROWS.map((rowIdx) =>
              memoChildren ? (
                <RefStormRowMemo
                  key={rowIdx}
                  index={rowIdx}
                  pulse={refStormOn ? refTick : 0}
                  styleObj={STABLE_ROW_STYLE}
                  onCommit={handleChildCommit}
                />
              ) : (
                <RefStormRow
                  key={rowIdx}
                  index={rowIdx}
                  pulse={refStormOn ? refTick : 0}
                  styleObj={{ fg: '#fb7185' }} // ❌ object mới mỗi render
                  onCommit={handleChildCommit}
                />
              )
            )}
          </div>

          <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
            <p className="text-slate-400">
              child commits:{' '}
              <span className={childCommits > REF_ROWS.length ? 'text-rose-400' : 'text-emerald-400'}>
                {childCommits.toLocaleString('vi-VN')}
              </span>
            </p>
            <p className={memoChildren ? 'text-emerald-400' : 'text-rose-400'}>
              ${' '}
              {memoChildren
                ? 'shallow compare PASS ✓ — styleObj@stable, fn@stable → 0 row commit thừa'
                : `shallow compare FAIL ✗ — styleObj@0x${((refTick * 2654435761) % 65535)
                    .toString(16)
                    .padStart(4, '0')} ≠ lần trước → 12 row commit/nhịp`}
            </p>
            <p className="text-slate-500">
              {refStormOn
                ? memoChildren
                  ? '> React.memo BYPASSED ×0 — kỷ luật tham chiếu giữ cho memo sống 🛡️'
                  : '> React.memo BYPASSED ×12 rows mỗi giây — FPS 60 → 24 💀'
                : '$ bật bão để thấy cha truyền props mới mỗi nhịp…'}
            </p>
          </div>
        </div>

        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            memoChildren ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          }`}
        >
          {memoChildren
            ? '🛡️ useCallback/useMemo khóa tham chiếu, hằng số ra module scope — memo so sánh PASS và chỉ row thật sự đổi mới vẽ lại.'
            : '💀 Mọi bảng dài trong app chậm theo tỉ lệ row × tần suất re-render cha; Profiler chỉ ra 70–80% commit là wasted renders.'}
        </p>
      </SectionShell>

      {/* ── Vector 5 · Context blast ── */}
      <SectionShell
        icon={<Palette className="h-3.5 w-3.5" />}
        title="Monolith Context Blast"
        subtitle="một AppContext ôm mọi domain → đổi theme rung cả cây"
        vulnerable={!splitCtx}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            theme: <span className={dark ? 'text-sky-400' : 'text-amber-400'}>{dark ? 'dark' : 'light'}</span>
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={fireContextBlast} className="h-6 px-2 text-[10px]">
              <Zap className="mr-1 h-3 w-3" />
              Đổi theme toàn cục
            </Button>
            <DefenseToggle
              active={splitCtx}
              label={splitCtx ? 'Split context ON' : 'Split context OFF'}
              onToggle={() => setSplitCtx((v) => !v)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
          <div className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-1">
            {Array.from({ length: SUBSCRIBERS }, (_, i) => {
              const isThemeDot = i === THEME_DOT;
              const flashing = ctxFlash?.includes(i) ?? false;
              const cls = flashing
                ? splitCtx
                  ? 'bg-emerald-400'
                  : 'bg-rose-500'
                : isThemeDot
                  ? 'bg-sky-500/60'
                  : dark
                    ? 'bg-slate-800'
                    : 'bg-slate-700';
              return (
                <span
                  key={i}
                  className={`h-1.5 w-full rounded-sm transition-colors duration-300 ${cls}`}
                />
              );
            })}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-sm bg-sky-500/60" /> consumer dùng theme
            </span>
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-3 rounded-sm ${splitCtx ? 'bg-emerald-400' : 'bg-rose-500'}`} />{' '}
              re-render do setTheme()
            </span>
            <span className="ml-auto">
              {lastBlast !== null && (
                <span className={splitCtx ? 'text-emerald-400' : 'text-rose-400'}>
                  {splitCtx ? '🛡️' : '💀'} setTheme() → {lastBlast}/{SUBSCRIBERS} consumer re-render
                </span>
              )}
            </span>
          </div>
        </div>

        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            splitCtx ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          }`}
        >
          {splitCtx
            ? '🛡️ Mỗi domain một context nhỏ (hoặc store selector): đổi theme chỉ đánh thức đúng consumer đọc theme — blast radius về đúng 1.'
            : '💀 useContext bỏ qua React.memo: value đổi tham chiếu là TOÀN BỘ 300 consumer diff lại vô nghĩa dù chỉ 1 dot dùng theme.'}
        </p>
      </SectionShell>

      {/* ── Vector 6 · Supply-chain hijack ── */}
      <SectionShell
        icon={<Globe className="h-3.5 w-3.5" />}
        title="CDN Supply-Chain Hijack"
        subtitle="@latest + SRI OFF → script bên thứ ba có thể bị đầu độc"
        vulnerable={!(pinVersion || sriOn)}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            index.html · third-party script
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={pinVersion ? 'default' : 'ghost'}
              onClick={() => setPinVersion((v) => !v)}
              className="h-6 px-2 text-[10px]"
            >
              <Lock className="mr-1 h-3 w-3" />
              Pin @2.4.1
            </Button>
            <Button
              size="sm"
              variant={sriOn ? 'default' : 'ghost'}
              onClick={() => setSriOn((v) => !v)}
              className="h-6 px-2 text-[10px]"
            >
              <KeyRound className="mr-1 h-3 w-3" />
              SRI hash
            </Button>
          </div>
        </div>

        <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-slate-300">
          {pinVersion || sriOn ? (
            <>
              <span className="text-slate-500">{'<!-- ✅ khoá version + kiểm chứng integrity -->'}</span>
              {'\n'}
              <span className="text-emerald-400">
                {`<script src="https://cdn.example.com/lib${pinVersion ? '@2.4.1' : '@latest'}"`}
              </span>
              {'\n'}
              {sriOn && (
                <span className="text-emerald-400">
                  {'  integrity="sha384-W9smwUo7QqZj4vXk2LmTe8rRb1nYc0dFgHjK5lPqA2s"\n  crossorigin="anonymous"'}
                </span>
              )}
              <span className="text-emerald-400">{'></script>'}</span>
            </>
          ) : (
            <>
              <span className="text-slate-500">{'<!-- 💀 unpinned + không SRI -->'}</span>
              {'\n'}
              <span className="text-rose-400">
                {'<script src="https://cdn.example.com/lib@latest"></script>'}
              </span>
            </>
          )}
        </pre>

        <div className="mt-2 space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-slate-500">
              ô đăng nhập giả lập · dữ liệu không rời trình duyệt
            </p>
            <Button
              size="sm"
              variant={cdnLoaded ? 'secondary' : 'destructive'}
              onClick={loadCdnScript}
              className="h-6 px-2 text-[10px]"
            >
              <Globe className="mr-1 h-3 w-3" />
              Nạp lib từ CDN
            </Button>
          </div>

          <input
            type="password"
            value={pwdValue}
            onChange={(e) => {
              setPwdValue(e.target.value);
              setKeystrokes((k) => k + 1);
            }}
            placeholder="nhập mật khẩu giả lập…"
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 font-mono text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 ${
              hijackLive
                ? 'border-destructive/60 focus:border-destructive'
                : 'border-slate-700 focus:border-slate-500'
            }`}
          />

          {!cdnLoaded ? (
            <p className="animate-pulse font-mono text-[10px] text-slate-600">
              $ nhấn &quot;Nạp lib từ CDN&quot; rồi gõ vài phím để xem ai nghe lén…
            </p>
          ) : hijackLive ? (
            <div className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/10 p-2 font-mono text-[10px] leading-relaxed text-destructive">
              <p className="font-bold">☠ lib@latest bị đầu độc — keylogger đã inject!</p>
              <p>
                captured: &quot;{pwdValue}&quot; · {keystrokes} phím
              </p>
              <p className="animate-pulse">
                POST https://evil-cdn.example/collect · k=&quot;{pwdValue}&quot; · 200 OK
              </p>
            </div>
          ) : (
            <div className="space-y-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 font-mono text-[10px] leading-relaxed text-emerald-600 dark:text-emerald-400">
              <p className="font-bold">🛡️ Script bị neutralize — keylogger không kịp chạy.</p>
              <p>
                {sriOn
                  ? 'integrity hash mismatch → browser refuse to execute file lạ.'
                  : 'version pinned → file cũ hợp lệ, chưa bị đầu độc.'}
              </p>
              {sriOn && !pinVersion && (
                <p className="text-amber-500">
                  ⚠ @latest vẫn là viên đạn trên nòng: hash chỉ chặn lần này, lần deploy sau nội dung lại đổi.
                </p>
              )}
            </div>
          )}
        </div>

        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            pinVersion || sriOn
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-destructive'
          }`}
        >
          {pinVersion || sriOn
            ? '🛡️ Pin version + SRI hash + crossorigin: supply chain của bạn không còn là cửa hậu cho attacker thay file giữa chừng.'
            : '💀 Một bản deploy xấu của CDN là mật khẩu user bay thẳng ra server lạ — sự cố bạn không thể debug vì code của bạn trong sạch.'}
        </p>
      </SectionShell>

      {/* Verdict */}
      {(allPatched || allFired) && (
        <Card
          className={`glass-card p-4 ${
            allPatched ? 'border-emerald-500/30' : 'border-destructive/30'
          }`}
        >
          {allPatched ? (
            <p className="text-xs leading-relaxed text-foreground">
              🛡️ <span className="font-bold text-emerald-600 dark:text-emerald-400">Defense Patch:</span>{' '}
              Promise.all/preload hạ TTFB về max(fetch), ISR hấp thụ cả bão request, useMemo đưa
              compute ra khỏi đường nóng, kỷ luật tham chiếu cho React.memo sống lại, context tách
              domain thu hẹp blast radius còn đúng 1 consumer, và pin+SRI khiến script giả bị trình
              duyệt từ chối thực thi. Hạ tầng thở lại — attacker chỉ thấy trang tải nhanh.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-foreground">
              💀 <span className="font-bold">Blast Radius:</span> cả 6 vector nổ cùng lúc ở cấu hình
              không vá — TTFB gấp 4 lần do waterfall, DB gánh trọn 1.000 request động, main thread
              đóng băng 1.5s mỗi lần filter, 12 row re-render vô nghĩa mỗi giây vì tham chiếu mới,
              300/300 consumer rung theo một cú đổi theme, và lib@latest đầu độc đã ghi trộm mật
              khẩu. Production: mất doanh thu giờ vàng, INP cháy đỏ, credential rò ra Internet.
            </p>
          )}
        </Card>
      )}

      {!allPatched && !allFired && (
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          $ bắn đủ cả {VECTOR_TOTAL} đợt tấn công hoặc bật đủ bản vá để mở kết luận cuối…
        </p>
      )}
    </div>
  );
}

/* ─── Small presentational helpers ─────────────────────────────────────── */

function AttackTraceLabel({ running, done }: { running: boolean; done: boolean }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
      {running ? 'tracing…' : done ? 'trace xong — xem TTFB bên dưới' : '4 resources · tuần tự vs song song'}
    </span>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'good' | 'bad';
}) {
  const toneCls =
    tone === 'bad' ? 'text-rose-400' : tone === 'good' ? 'text-emerald-400' : 'text-slate-300';
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
      <p className="uppercase tracking-wider text-slate-600">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${toneCls}`}>{value}</p>
    </div>
  );
}
