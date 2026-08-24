'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Crown,
  Lightbulb,
  Monitor,
  Package,
  Radio,
  RefreshCw,
  RotateCcw,
  Rocket,
  Route,
  Server,
  Terminal,
  Timer,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ═══════════ Cuộc đua tải /product/42 ═══════════
 * Năm strategy cùng đua trên một track với latency budget CỐ ĐỊNH (ms thật).
 * CSR: tải JS rồi mới fetch API · SSG: CDN trả HTML build-time ·
 * ISR: như SSG nhưng có thể dính path revalidate-miss (stale + regen ngầm) ·
 * SSR: server render từng request · PPR: shell tĩnh + stream phần động.
 * ═══════════════════════════════════════════════ */

type StrategyId = 'csr' | 'ssg' | 'isr' | 'ssr' | 'ppr';

interface Phase {
  label: string;
  short: string;
  ms: number;
}

interface LaneState {
  elapsed: number;
  running: boolean;
  done: boolean;
}

type Lanes = Record<StrategyId, LaneState>;
type Plan = Record<StrategyId, Phase[]>;

const STRATEGY_IDS = ['csr', 'ssg', 'isr', 'ssr', 'ppr'] as const;

const TICK_MS = 30;

const STRATEGY_META: Record<
  StrategyId,
  { name: string; icon: LucideIcon; blurb: string }
> = {
  csr: { name: 'CSR', icon: Monitor, blurb: 'Client-side rendering' },
  ssg: { name: 'SSG', icon: Package, blurb: 'Static site generation' },
  isr: { name: 'ISR', icon: RefreshCw, blurb: 'Incremental static regen' },
  ssr: { name: 'SSR', icon: Server, blurb: 'Render mỗi request' },
  ppr: { name: 'PPR', icon: Radio, blurb: 'Static shell + stream' },
};

const buildPlan = (isrDue: boolean): Plan => ({
  csr: [
    { label: 'Download JS bundle', short: 'JS 800ms', ms: 800 },
    { label: 'Fetch API /api/product/42', short: 'API 600ms', ms: 600 },
    { label: 'Hydrate → paint UI', short: 'Render 120ms', ms: 120 },
  ],
  ssg: [{ label: 'CDN serve static HTML', short: 'CDN 90ms', ms: 90 }],
  isr: isrDue
    ? [
        { label: 'CDN serve bản stale (SWR)', short: 'Stale 90ms', ms: 90 },
        { label: 'Regenerate page trên server', short: 'Regen 260ms', ms: 260 },
      ]
    : [{ label: 'CDN serve cached HTML', short: 'CDN 90ms', ms: 90 }],
  ssr: [
    { label: 'Server render RSC tree', short: 'SSR 380ms', ms: 380 },
    { label: 'Stream HTML về browser', short: 'Stream 40ms', ms: 40 },
  ],
  ppr: [
    { label: 'Static shell từ CDN', short: 'Shell 70ms', ms: 70 },
    { label: 'Stream dynamic hole (stock, cart)', short: 'Hole +420ms', ms: 420 },
  ],
});

const TABLE_ROWS: Record<
  StrategyId,
  { ttfb: string; ttc: string; freshness: string; cost: string }
> = {
  csr: {
    ttfb: 'Nhanh (HTML rỗng)',
    ttc: 'Chậm nhất 🐢 ~1.5s',
    freshness: 'Realtime phía client',
    cost: 'Rẻ — đẩy chi phí sang user',
  },
  ssg: {
    ttfb: 'Cực nhanh 🚀',
    ttc: '≈ TTFB',
    freshness: 'Build-time (cũ nhất)',
    cost: 'Rẻ nhất (CDN only)',
  },
  isr: {
    ttfb: 'Cực nhanh 🚀',
    ttc: '≈ TTFB (stale-while-revalidate)',
    freshness: 'Tươi theo chu kỳ revalidate ⏱',
    cost: 'Rẻ + chi phí regen định kỳ',
  },
  ssr: {
    ttfb: 'Chậm hơn (~380ms render)',
    ttc: '≈ TTFB + stream',
    freshness: 'Luôn tươi mỗi request',
    cost: 'Đắt — server trả giá mỗi hit',
  },
  ppr: {
    ttfb: 'Nhanh (shell @70ms)',
    ttc: '+ stream dynamic hole',
    freshness: 'Shell cũ nhưng data tươi',
    cost: 'Trung bình',
  },
};

const INSIGHTS = [
  'Trang marketing / docs / blog ít đổi → SSG: build một lần, CDN phục vụ ~90ms.',
  'Catalog sản phẩm, listing cập nhật theo giờ → ISR: nhanh như SSG nhưng data tự tươi.',
  'Dashboard, feed cá nhân hoá, data phải tươi từng request → SSR hoặc PPR.',
  'PPR = best of both worlds: shell tĩnh 70ms + stream phần <Stock /> động phía sau.',
  'App tương tác cực nặng sau load (editor, chat) → CSR mới là lựa chọn chấp nhận được.',
];

const idleLanes = (): Lanes => ({
  csr: { elapsed: 0, running: false, done: false },
  ssg: { elapsed: 0, running: false, done: false },
  isr: { elapsed: 0, running: false, done: false },
  ssr: { elapsed: 0, running: false, done: false },
  ppr: { elapsed: 0, running: false, done: false },
});

export function RenderingWaterfallLab() {
  const [isrDue, setIsrDue] = React.useState(true);
  const [lanes, setLanes] = React.useState<Lanes>(idleLanes);
  const [racing, setRacing] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const timersRef = React.useRef<Array<() => void>>([]);

  React.useEffect(() => () => timersRef.current.forEach((cancel) => cancel()), []);

  const plan = React.useMemo(() => buildPlan(isrDue), [isrDue]);
  const totals = React.useMemo(
    () =>
      Object.fromEntries(
        STRATEGY_IDS.map((id) => [id, plan[id].reduce((sum, ph) => sum + ph.ms, 0)]),
      ) as Record<StrategyId, number>,
    [plan],
  );

  const startRace = () => {
    timersRef.current.forEach((cancel) => cancel());
    timersRef.current = [];
    setLanes({
      csr: { elapsed: 0, running: true, done: false },
      ssg: { elapsed: 0, running: true, done: false },
      isr: { elapsed: 0, running: true, done: false },
      ssr: { elapsed: 0, running: true, done: false },
      ppr: { elapsed: 0, running: true, done: false },
    });
    setStarted(true);
    setRacing(true);
    // Closure giữ nguyên `totals` của lần chạy này → ISR toggle bị khoá khi đang đua.
    const runTotals = totals;
    const interval = setInterval(() => {
      setLanes((prev) => {
        const next = { ...prev };
        STRATEGY_IDS.forEach((id) => {
          const lane = prev[id];
          if (!lane.running || lane.done) return;
          const total = runTotals[id];
          const elapsed = Math.min(lane.elapsed + TICK_MS, total);
          next[id] = { elapsed, running: true, done: elapsed >= total };
        });
        return next;
      });
    }, TICK_MS);
    timersRef.current.push(() => clearInterval(interval));
  };

  const allDone = STRATEGY_IDS.every((id) => lanes[id].done);
  React.useEffect(() => {
    if (racing && allDone) {
      timersRef.current.forEach((cancel) => cancel());
      timersRef.current = [];
      setRacing(false);
    }
  }, [racing, allDone]);

  const resetRace = () => {
    timersRef.current.forEach((cancel) => cancel());
    timersRef.current = [];
    setLanes(idleLanes());
    setRacing(false);
    setStarted(false);
  };

  /* ─── Derived ──────────────────────────────────────────── */
  const finished = STRATEGY_IDS.filter((id) => lanes[id].done);
  const bestTotal = finished.length ? Math.min(...finished.map((id) => totals[id])) : null;
  const winners = finished.filter((id) => totals[id] === bestTotal);
  const firstPaintId = STRATEGY_IDS.reduce((fastest, id) =>
    plan[id][0].ms < plan[fastest][0].ms ? id : fastest, 'csr' as StrategyId);

  const currentPhase = (id: StrategyId): Phase => {
    let acc = 0;
    for (const ph of plan[id]) {
      if (lanes[id].elapsed < acc + ph.ms || lanes[id].done) return ph;
      acc += ph.ms;
    }
    return plan[id][plan[id].length - 1];
  };

  const statusText = (id: StrategyId) => {
    const lane = lanes[id];
    if (lane.done) return `✓ ${totals[id]}ms`;
    if (lane.running && lane.elapsed > 0)
      return `${lane.elapsed}ms · ${currentPhase(id).short}`;
    return '—';
  };

  const fillClass = (i: number) =>
    i % 2 === 0 ? 'bg-sky-500/80' : 'bg-indigo-500/80';

  return (
    <div className="space-y-4">
      <Card className="glass-card space-y-4 overflow-hidden p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Rocket className="h-4 w-4 text-destructive" />
            Range 02 · Rendering Waterfall Race
          </h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            <Route className="mr-1 h-3 w-3" />
            GET /product/42
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={startRace} disabled={racing} className="text-xs font-bold">
            <Rocket className="mr-1.5 h-4 w-4" />
            {racing ? 'Đang đua…' : started ? '🚀 Load lại /product/42' : '🚀 Load /product/42'}
          </Button>
          <Button
            variant="outline"
            disabled={racing}
            onClick={() => setIsrDue((v) => !v)}
            className={`text-xs ${
              isrDue
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : ''
            }`}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isrDue ? '' : 'opacity-40'}`} />
            ISR revalidate due? {isrDue ? 'ON' : 'OFF'}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetRace} className="gap-1 text-[11px]">
            <RotateCcw className="h-3 w-3" />
            Reset bars
          </Button>
        </div>
        <p className="-mt-2 text-[11px] leading-snug text-muted-foreground">
          Bật “revalidate due?” để xem nhánh xấu của ISR: user vẫn được phục vụ tức thì bằng bản
          stale (SWR) trong lúc server regen ngầm 260ms.
        </p>

        {/* Track */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
          {STRATEGY_IDS.map((id) => {
            const meta = STRATEGY_META[id];
            const Icon = meta.icon;
            const phases = plan[id];
            const total = totals[id];
            const lane = lanes[id];
            const isWinner = started && lane.done && winners.includes(id);
            let accBefore = 0;
            return (
              <div key={id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Icon className={`h-3.5 w-3.5 ${lane.done ? 'text-emerald-500' : 'text-sky-500'}`} />
                    {meta.name}
                    <span className="hidden text-[10px] font-normal text-muted-foreground sm:inline">
                      {meta.blurb}
                    </span>
                    {isWinner && (
                      <span className="flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        <Crown className="h-3 w-3" /> FASTEST
                      </span>
                    )}
                    {started && id === firstPaintId && !isWinner && (
                      <span className="flex items-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400">
                        <Zap className="h-3 w-3" /> first content @ {phases[0].ms}ms
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-mono text-[10px] ${
                      lane.done ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                    }`}
                  >
                    {statusText(id)}
                  </span>
                </div>
                {/* Segmented waterfall */}
                <div
                  className={`flex h-7 divide-x divide-border/40 overflow-hidden rounded-lg border bg-secondary/50 ${
                    lane.done ? 'border-emerald-500/50' : 'border-border/60'
                  }`}
                >
                  {phases.map((ph, i) => {
                    const segStart = accBefore;
                    accBefore += ph.ms;
                    const segElapsed = Math.min(Math.max(lane.elapsed - segStart, 0), ph.ms);
                    const fillPct = lane.done ? 100 : (segElapsed / ph.ms) * 100;
                    return (
                      <div
                        key={ph.label}
                        title={`${ph.label} · ${ph.ms}ms`}
                        style={{ width: `${(ph.ms / total) * 100}%` }}
                        className="relative shrink-0"
                      >
                        <div
                          className={`absolute inset-y-0 left-0 ${fillClass(i)} ${
                            id === 'ppr' && i === 1 && !lane.done ? 'animate-pulse' : ''
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Segment labels */}
                <div className="flex">
                  {phases.map((ph) => (
                    <span
                      key={ph.label}
                      style={{ width: `${(ph.ms / total) * 100}%` }}
                      className="truncate px-1 text-center font-mono text-[9px] text-muted-foreground"
                    >
                      {ph.short}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ════════ COMPARISON TABLE ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Timer className="h-4 w-4 text-sky-500" />
            So sánh chiến lược render
          </h4>
          <div className="overflow-x-auto">
            <div className="min-w-[520px] space-y-0">
              <div className="grid grid-cols-[88px_repeat(4,minmax(0,1fr))] gap-x-2 border-b border-border/60 pb-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Cách</span>
                <span>TTFB</span>
                <span>Time-to-content</span>
                <span>Data freshness</span>
                <span>Infra cost</span>
              </div>
              {STRATEGY_IDS.map((id) => {
                const Icon = STRATEGY_META[id].icon;
                const row = TABLE_ROWS[id];
                return (
                  <div
                    key={id}
                    className="grid grid-cols-[88px_repeat(4,minmax(0,1fr))] items-start gap-x-2 border-b border-border/30 py-2 text-[11px] last:border-b-0"
                  >
                    <span className="flex items-center gap-1 font-mono font-bold text-foreground">
                      <Icon className="h-3 w-3 shrink-0 text-sky-500" />
                      {STRATEGY_META[id].name}
                    </span>
                    <span className="text-muted-foreground">{row.ttfb}</span>
                    <span className="text-muted-foreground">{row.ttc}</span>
                    <span className="text-muted-foreground">{row.freshness}</span>
                    <span className="text-muted-foreground">{row.cost}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ════════ INSIGHT PANEL ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <Lightbulb className="h-4 w-4" />
            Chọn strategy theo tình huống
          </h4>
          <ul className="space-y-2">
            {INSIGHTS.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] leading-snug text-foreground"
              >
                <Zap className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                {tip}
              </li>
            ))}
          </ul>
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-2.5 text-[11px] leading-snug text-muted-foreground">
            <span className="font-bold text-destructive">Góc đỏ:</span> chọn sai strategy là tự
            thua tại start line — SSG cho dashboard thì data cũ như build-time; SSR cho landing
            page tĩnh thì đốt tiền server cho thứ CDN làm tốt hơn 4 lần.
          </p>
        </Card>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Mô phỏng client-side với latency budget cố định (tick 30ms). Con số minh họa thứ tự tương
        đối của các strategy chứ không đo network thật.
      </p>
    </div>
  );
}
