'use client';

import * as React from 'react';
import {
  AlertTriangle,
  Ban,
  Database,
  FastForward,
  History,
  Power,
  PowerOff,
  RefreshCw,
  RotateCcw,
  Terminal,
  Timer,
  Trophy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/* ═══════════ Mental model được minh họa ═══════════
 * staleTime : data được coi là FRESH trong bao lâu — trong thời gian đó,
 *             mount/focus lại KHÔNG bắn request nào cả (cache hit).
 * gcTime    : khi observer cuối unmount, data vẫn nằm trong cache thêm 5 phút.
 * Demo mô phỏng MỘT query ['posts'] với HAI observers mount song song
 * (A: header list · B: sidebar widget) dùng chung một cache entry.
 * ═════════════════════════════════════════════════ */

type StaleTimeOption = '0' | '30' | 'inf';
type ObserverStatus = 'unmounted' | 'fetching' | 'fresh' | 'stale';
type Tone = 'neutral' | 'good' | 'warn' | 'bad';

interface LogEntry {
  id: number;
  tLabel: string;
  text: string;
  tone: Tone;
}

const MAX_LOG_ENTRIES = 14;
const NETWORK_MS = 600;

const STALE_OPTIONS: { key: StaleTimeOption; label: string; sub: string }[] = [
  { key: '0', label: 'staleTime = 0', sub: 'default · luôn refetch' },
  { key: '30', label: 'staleTime = 30s', sub: 'enterprise sweet spot' },
  { key: 'inf', label: 'staleTime = ∞', sub: 'không bao giờ stale' },
];

const STATUS_META: Record<
  ObserverStatus,
  { label: string; variant: 'success' | 'warning' | 'info' | 'outline'; dot: string }
> = {
  fresh: { label: 'FRESH', variant: 'success', dot: 'bg-emerald-500' },
  stale: { label: 'STALE', variant: 'warning', dot: 'bg-amber-500' },
  fetching: { label: 'FETCHING', variant: 'info', dot: 'animate-pulse bg-sky-500' },
  unmounted: { label: 'UNMOUNTED', variant: 'outline', dot: 'bg-muted-foreground/40' },
};

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'text-slate-300',
  good: 'text-emerald-400',
  warn: 'text-amber-400',
  bad: 'text-red-400',
};

export function CacheTimelineLab() {
  const [staleOpt, setStaleOpt] = React.useState<StaleTimeOption>('0');
  const [clock, setClock] = React.useState(0); // ⏱ VIRTUAL clock (giây) — chỉ chạy khi time-travel
  const [mountedA, setMountedA] = React.useState(false);
  const [mountedB, setMountedB] = React.useState(false);
  const [phase, setPhase] = React.useState<'idle' | 'fetching'>('idle');
  const [fetchedAt, setFetchedAt] = React.useState<number | null>(null);
  const [invalidated, setInvalidated] = React.useState(false);
  const [log, setLog] = React.useState<LogEntry[]>([]);
  const [wasted, setWasted] = React.useState(0);

  const clockRef = React.useRef(0);
  const logIdRef = React.useRef(0);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const termRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    const el = termRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const staleTime = staleOpt === 'inf' ? Number.POSITIVE_INFINITY : Number(staleOpt);
  const hasData = fetchedAt !== null;
  const isStale = fetchedAt !== null && (invalidated || clock - fetchedAt >= staleTime);

  /* ─── Helpers ──────────────────────────────────────────── */
  const fmtT = (sec: number) => `t=${Number.isInteger(sec) ? sec : sec.toFixed(1)}s`;

  const pushLog = (text: string, tone: Tone = 'neutral') =>
    setLog((prev) => [
      ...prev.slice(-(MAX_LOG_ENTRIES - 1)),
      { id: ++logIdRef.current, tLabel: fmtT(clockRef.current), text, tone },
    ]);

  /** Mô phỏng 1 network request thật: resolve sau NETWORK_MS ms REAL time. */
  const startNetwork = (opts: { waste?: boolean } = {}) => {
    if (opts.waste) setWasted((w) => w + 1);
    setPhase('fetching');
    const timer = setTimeout(() => {
      setFetchedAt(clockRef.current);
      setInvalidated(false);
      setPhase('idle');
      pushLog(
        `✓ 200 OK /api/posts → FRESH (staleTime=${staleOpt === 'inf' ? '∞' : `${staleOpt}s`})`,
        'good',
      );
    }, NETWORK_MS);
    timersRef.current.push(timer);
  };

  /* ─── Actions ──────────────────────────────────────────── */
  const mountObserver = (which: 'A' | 'B') => {
    (which === 'A' ? setMountedA : setMountedB)(true);
    if (phase === 'fetching') {
      pushLog(`[${which} mount] gắn vào ['posts'] — request DEDUPE, dùng chung fetch đang bay`);
      return;
    }
    if (!hasData) {
      pushLog(`[${which} mount] cache EMPTY → FETCHING`);
      startNetwork();
    } else if (isStale) {
      pushLog(
        `[${which} mount] cache HIT nhưng STALE → serve stale + REFETCH ngầm${
          staleOpt === '0' ? ' (request thừa!)' : ''
        }`,
        staleOpt === '0' ? 'bad' : 'warn',
      );
      startNetwork({ waste: staleOpt === '0' });
    } else {
      pushLog(`[${which} mount] CACHE HIT (fresh) → instant paint, 0 network`);
    }
  };

  const unmountObserver = (which: 'A' | 'B') => {
    (which === 'A' ? setMountedA : setMountedB)(false);
    pushLog(`[${which} unmount] observer removed — data vẫn sống trong cache (gcTime=5m)`);
  };

  const timeTravel = () => {
    const next = clockRef.current + 31;
    clockRef.current = next;
    setClock(next);
    if (!hasData) {
      pushLog('⏩ time-travel +31s → cache vẫn EMPTY, chẳng gì để stale', 'warn');
    } else if (!Number.isFinite(staleTime)) {
      pushLog('⏩ time-travel +31s → staleTime=∞ nên data VẪN FRESH', 'good');
    } else {
      const age = fetchedAt !== null ? next - fetchedAt : 0;
      if (age >= staleTime) {
        pushLog('⏩ time-travel → vượt staleTime → data turns STALE 🟠', 'warn');
      } else {
        pushLog(
          `⏩ time-travel +31s → vẫn FRESH (còn ${Math.ceil(staleTime - age)}s tuổi thọ)`,
          'good',
        );
      }
    }
  };

  const invalidateQuery = () => {
    if (!hasData) {
      pushLog('[invalidate] cache EMPTY → nothing to invalidate', 'warn');
      return;
    }
    setInvalidated(true);
    pushLog("[queryClient.invalidateQueries(['posts'])] → đánh dấu STALE", 'bad');
    if (!(mountedA || mountedB)) {
      pushLog('Không observer nào mount → sẽ refetch ở lần mount kế tiếp');
      return;
    }
    if (phase === 'fetching') {
      pushLog('[A focus] refetch đã in-flight → dedupe, không bắn thêm');
      return;
    }
    pushLog('[A focus] thấy STALE → refetching…', 'warn');
    startNetwork();
  };

  const refetchAll = () => {
    if (!(mountedA || mountedB)) {
      pushLog('[refetchAll] 0 active observer → query INACTIVE, bỏ qua', 'warn');
      return;
    }
    if (phase === 'fetching') {
      pushLog('[refetchAll] dedupe vào request đang chạy');
      return;
    }
    pushLog('[refetchAll] ép cả A + B validate lại cùng lúc', 'warn');
    startNetwork({ waste: staleOpt === '0' && hasData });
  };

  const resetLab = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    clockRef.current = 0;
    setClock(0);
    setMountedA(false);
    setMountedB(false);
    setPhase('idle');
    setFetchedAt(null);
    setInvalidated(false);
    setLog([]);
    setWasted(0);
  };

  /* ─── Derived UI state ─────────────────────────────────── */
  const statusOf = (mounted: boolean): ObserverStatus =>
    !mounted ? 'unmounted' : phase === 'fetching' ? 'fetching' : isStale ? 'stale' : 'fresh';

  const renderObserverCard = (id: 'A' | 'B') => {
    const mounted = id === 'A' ? mountedA : mountedB;
    const meta = STATUS_META[statusOf(mounted)];
    return (
      <div
        key={id}
        className={`rounded-xl border border-border/60 bg-secondary/20 p-3 transition-opacity ${
          mounted ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-foreground">Component {id}</span>
          <Badge variant={meta.variant} className="font-mono text-[10px]">
            {meta.label}
          </Badge>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          {id === 'A' ? 'Header list · useQuery(posts)' : 'Sidebar widget · useQuery(posts)'}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {statusOf(mounted)}
          </span>
        </div>
      </div>
    );
  };

  const ageSeconds = hasData ? Math.max(0, clock - (fetchedAt ?? 0)) : 0;
  const gaugePct = !hasData
    ? 0
    : Number.isFinite(staleTime)
      ? Math.min(100, (ageSeconds / staleTime) * 100)
      : 8;

  const cacheStatusLabel =
    phase === 'fetching' ? 'FETCHING' : !hasData ? 'EMPTY' : isStale ? 'STALE' : 'FRESH';
  const cacheStatusVariant =
    phase === 'fetching' ? 'info' : !hasData ? 'secondary' : isStale ? 'warning' : 'success';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ════════ CONTROL ROOM ════════ */}
        <Card className="glass-card space-y-4 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Timer className="h-4 w-4 text-destructive" />
              Range 01 · Query Cache Timeline
            </h3>
            <Button variant="ghost" size="sm" onClick={resetLab} className="gap-1 text-[11px]">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
          <p className="-mt-2 text-[11px] leading-snug text-muted-foreground">
            Một query <span className="font-mono text-foreground">[&apos;posts&apos;]</span>, hai
            observers dùng chung cache. Đổi staleTime rồi mount/unmount/time-travel để cảm nhận
            mental model của TanStack Query.
          </p>

          {/* staleTime selector */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/40 p-1">
            {STALE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setStaleOpt(opt.key)}
                className={`rounded-lg px-2 py-1.5 text-center transition-all ${
                  staleOpt === opt.key
                    ? opt.key === '0'
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="block text-xs font-bold">{opt.label}</span>
                <span className="block text-[9px] opacity-80">{opt.sub}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Button
              size="sm"
              variant={mountedA ? 'outline' : 'secondary'}
              onClick={() => (mountedA ? unmountObserver('A') : mountObserver('A'))}
              className="text-xs"
            >
              {mountedA ? (
                <PowerOff className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Power className="mr-1 h-3.5 w-3.5" />
              )}
              {mountedA ? 'Unmount A' : 'Mount A'}
            </Button>
            <Button
              size="sm"
              variant={mountedB ? 'outline' : 'secondary'}
              onClick={() => (mountedB ? unmountObserver('B') : mountObserver('B'))}
              className="text-xs"
            >
              {mountedB ? (
                <PowerOff className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Power className="mr-1 h-3.5 w-3.5" />
              )}
              {mountedB ? 'Unmount B' : 'Mount B'}
            </Button>
            <Button size="sm" variant="secondary" onClick={timeTravel} className="text-xs">
              <FastForward className="mr-1 h-3.5 w-3.5" />
              ⏩ Time-travel +31s
            </Button>
            <Button size="sm" variant="outline" onClick={invalidateQuery} className="text-xs">
              <Ban className="mr-1 h-3.5 w-3.5" />
              Invalidate
            </Button>
            <Button size="sm" variant="default" onClick={refetchAll} className="text-xs">
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Refetch all
            </Button>
          </div>

          {/* Observers */}
          <div className="grid grid-cols-2 gap-2">
            {renderObserverCard('A')}
            {renderObserverCard('B')}
          </div>

          {/* Shared cache box */}
          <div className="space-y-2 rounded-xl border border-border/60 bg-secondary/20 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                <Database className="h-3.5 w-3.5 text-sky-500" />
                cache[&quot;posts&quot;]
              </span>
              <Badge variant={cacheStatusVariant} className="font-mono text-[10px]">
                {cacheStatusLabel}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-muted-foreground">
              <span>
                dataAge:{' '}
                <span className={isStale ? 'text-amber-500' : 'text-emerald-500'}>
                  {hasData ? `${ageSeconds}s` : '∅'}
                </span>
              </span>
              <span>
                observers:{' '}
                <span className="text-foreground">{(mountedA ? 1 : 0) + (mountedB ? 1 : 0)}</span>
              </span>
              <span>
                network: <span className="text-foreground">{hasData ? '200 OK' : '—'}</span>
              </span>
            </div>
            <Progress
              value={gaugePct}
              className="h-1.5"
              indicatorClassName={
                isStale
                  ? 'bg-gradient-to-r from-amber-500 to-destructive'
                  : 'bg-gradient-to-r from-emerald-500 to-sky-500'
              }
            />
            <p className="text-[10px] text-muted-foreground">
              Tuổi của data so với staleTime — đầy thanh cam nghĩa là đã/không còn FRESH.
            </p>
          </div>

          {/* Verdict banner */}
          {wasted >= 2 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  staleTime = 0 đã đốt {wasted} API calls
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Mỗi mount/focus là một GET thật cho cùng payload — server khóc, bill tăng.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Trophy className="h-4 w-4" />
                  staleTime = 30s — CACHE HIT 0ms
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Mount lại trong 30s = zero network; gcTime dọn rác khi hết observer.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* ════════ VIRTUAL TIMELINE ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <History className="h-4 w-4 text-amber-500" />
              Virtual Timeline
            </h3>
            {staleOpt === '0' && wasted > 0 ? (
              <Badge variant="destructive" className="animate-pulse font-mono text-[10px]">
                <AlertTriangle className="mr-1 h-3 w-3" />
                API calls wasted: {wasted}
              </Badge>
            ) : (
              <Badge variant="success" className="font-mono text-[10px]">
                0 request thừa
              </Badge>
            )}
          </div>

          <div
            ref={termRef}
            className="min-h-[240px] max-h-[320px] space-y-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]"
          >
            {log.length === 0 ? (
              <span className="text-slate-500">
                $ nhấn “Mount A” để bắt đầu timeline — đồng hồ ảo chỉ chạy khi bạn time-travel…
              </span>
            ) : (
              log.map((entry) => (
                <div key={entry.id}>
                  <span className="whitespace-pre text-slate-500">{entry.tLabel.padEnd(7)}</span>{' '}
                  <span className={TONE_CLASS[entry.tone]}>{entry.text}</span>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">Cách đọc:</span> FRESH (xanh) = cache hit
            tức thì · STALE (cam) = hiện data cũ ngay + refetch nền · FETCHING (sky nhấp nháy) =
            đang chờ mạng. Unmount không xóa data — phải đợi gcTime=5m mới dọn.
          </div>
        </Card>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Mô phỏng hoàn toàn client-side — fetch giả resolve sau ~600ms thực, còn “tuổi data” tính
        trên đồng hồ ảo chỉ tiến khi bấm Time-travel. Không request mạng nào được gửi ra ngoài.
      </p>
    </div>
  );
}
