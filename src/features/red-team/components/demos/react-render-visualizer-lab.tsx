'use client';

import * as React from 'react';
import {
  Activity,
  Database,
  Info,
  Layers,
  ListPlus,
  Plus,
  RotateCcw,
  Tag,
  Terminal,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const LABELS = ['Học React foundations', 'Hiểu re-render sâu', 'Memo hoá mọi thứ'];
const INITIAL_ITEMS = [
  'GET /api/user — profile',
  'GET /api/posts — feed 50 mục',
  'GET /api/notifs — polling',
];

type PanelId = 'parent' | 'counterA' | 'labelB' | 'heavyC';
type RenderCounts = Record<PanelId, number>;
type FlashMap = Record<PanelId, boolean>;

const INITIAL_COUNTS: RenderCounts = { parent: 1, counterA: 1, labelB: 1, heavyC: 1 };
const INITIAL_FLASH: FlashMap = { parent: false, counterA: false, labelB: false, heavyC: false };

/* ─── Sub-components thật của “mini-app tree” ────────────────────────── */

function CounterA({ registerBump }: { registerBump: (fn: () => void) => void }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    registerBump(() => setCount((c) => c + 1));
  }, [registerBump]);
  return (
    <div className="rounded-lg border border-border/40 bg-background/60 p-2.5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        CounterA · sở hữu useState
      </p>
      <p className="mt-1 font-mono text-xl font-bold leading-none text-foreground">{count}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">self state — sibling đứng im</p>
    </div>
  );
}

function LabelCardImpl({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/60 p-2.5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        LabelCard · nhận prop
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">label=“{label}”</p>
    </div>
  );
}
const LabelCard = React.memo(LabelCardImpl);

function HeavyListImpl({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/60 p-2.5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        HeavyList · nhận items
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1 font-mono text-[10px] text-foreground">
            <Database className="h-2.5 w-2.5 shrink-0 text-sky-500" />
            <span className="truncate">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
const HeavyList = React.memo(HeavyListImpl);

function PanelShell({
  name,
  hint,
  renders,
  flashing,
  children,
}: {
  name: string;
  hint: string;
  renders: number;
  flashing: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-border/40 bg-secondary/20 p-3 transition-all duration-300 ${
        flashing ? 'ring-2 ring-red-500/60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold text-foreground">{name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{hint}</p>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1 font-mono text-[10px]">
          <Activity className="h-3 w-3 text-red-500" />
          renders: {renders}
        </Badge>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function ReactRenderVisualizerLab() {
  const [counts, setCounts] = React.useState<RenderCounts>(INITIAL_COUNTS);
  const [flash, setFlash] = React.useState<FlashMap>(INITIAL_FLASH);
  const [labelIdx, setLabelIdx] = React.useState(0);
  const [items, setItems] = React.useState<string[]>(INITIAL_ITEMS);
  const [memoLabel, setMemoLabel] = React.useState(false);
  const [memoHeavy, setMemoHeavy] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);
  const [log, setLog] = React.useState<string[]>([]);
  const bumpRef = React.useRef<(() => void) | null>(null);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const label = LABELS[labelIdx];

  const registerBump = React.useCallback((fn: () => void) => {
    bumpRef.current = fn;
  }, []);

  const pushLog = (line: string) => setLog((prev) => [line, ...prev].slice(0, 8));

  /* Bộ đếm + flash mô phỏng đúng ngữ nghĩa render của React */
  const bump = (id: PanelId) => {
    setCounts((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    setFlash((prev) => ({ ...prev, [id]: true }));
    const t = setTimeout(() => setFlash((prev) => ({ ...prev, [id]: false })), 500);
    timersRef.current.push(t);
  };

  const handlePlusOne = () => {
    bumpRef.current?.();
    bump('counterA');
    pushLog('⚡ +1 → chỉ CounterA re-render (state nội bộ, sibling không đụng tới)');
  };

  const handleChangeLabel = () => {
    setLabelIdx((i) => (i + 1) % LABELS.length);
    bump('parent');
    bump('counterA');
    bump('labelB');
    if (memoHeavy) {
      pushLog('🏷️ Đổi label → ParentApp + CounterA + LabelCard re-render · memo chặn HeavyList 🛡️');
    } else {
      pushLog('🏷️ Đổi label → ParentApp kéo theo CẢ 3 con re-render (HeavyList oan ức)');
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, `GET /api/item-${prev.length + 1} — phát sinh lúc chạy`]);
    bump('parent');
    bump('counterA');
    bump('heavyC');
    if (memoLabel) {
      pushLog('📦 Thêm item → ParentApp + CounterA + HeavyList re-render · memo chặn LabelCard 🛡️');
    } else {
      pushLog('📦 Thêm item → ParentApp kéo theo CẢ 3 con re-render (LabelCard oan ức)');
    }
  };

  const toggleMemo = (which: 'label' | 'heavy') => {
    if (which === 'label') {
      const next = !memoLabel;
      setMemoLabel(next);
      bump('labelB');
      pushLog(`🔁 memo(LabelCard) ${next ? 'ON' : 'OFF'} → kiểu component đổi → remount`);
    } else {
      const next = !memoHeavy;
      setMemoHeavy(next);
      bump('heavyC');
      pushLog(`🔁 memo(HeavyList) ${next ? 'ON' : 'OFF'} → kiểu component đổi → remount`);
    }
  };

  const handleReset = () => {
    timersRef.current.forEach(clearTimeout);
    setLabelIdx(0);
    setItems(INITIAL_ITEMS);
    setCounts(INITIAL_COUNTS);
    setFlash(INITIAL_FLASH);
    setResetKey((k) => k + 1);
    pushLog('🔄 Reset → key của CounterA đổi → remount, count quay về 0');
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Zap className="h-4 w-4 text-sky-500" />
            Lab 01 · Render Visualizer — panel nào vừa re-render?
          </h3>
          <Badge variant="info" className="font-mono text-[10px]">
            React Foundations
          </Badge>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handlePlusOne} className="gap-1 text-xs">
            <Plus className="h-3 w-3" />
            +1 Counter A
          </Button>
          <Button size="sm" variant="outline" onClick={handleChangeLabel} className="gap-1 text-xs">
            <Tag className="h-3 w-3" />
            Đổi label B
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddItem} className="gap-1 text-xs">
            <ListPlus className="h-3 w-3" />
            Thêm item vào list C
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReset} className="gap-1 text-xs">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        {/* Memo toggle pair */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/40 p-1">
          <button
            type="button"
            onClick={() => toggleMemo('label')}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              memoLabel
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            memo(LabelCard): {memoLabel ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => toggleMemo('heavy')}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              memoHeavy
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            memo(HeavyList): {memoHeavy ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Mini-app tree */}
        <div
          className={`space-y-3 rounded-xl border border-dashed border-border/60 p-3 transition-all duration-300 ${
            flash.parent ? 'ring-2 ring-red-500/60' : ''
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-1">
            <p className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              ParentApp — owner của state label &amp; items
            </p>
            <Badge variant="outline" className="gap-1 font-mono text-[10px]">
              <Activity className="h-3 w-3 text-red-500" />
              renders: {counts.parent}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PanelShell
              name="Panel A"
              hint="useState nội bộ"
              renders={counts.counterA}
              flashing={flash.counterA}
            >
              <CounterA key={resetKey} registerBump={registerBump} />
            </PanelShell>
            <PanelShell
              name="Panel B"
              hint={memoLabel ? 'đang được memo()' : 'không memo'}
              renders={counts.labelB}
              flashing={flash.labelB}
            >
              {memoLabel ? <LabelCard label={label} /> : <LabelCardImpl label={label} />}
            </PanelShell>
            <PanelShell
              name="Panel C"
              hint={memoHeavy ? 'đang được memo()' : 'không memo'}
              renders={counts.heavyC}
              flashing={flash.heavyC}
            >
              {memoHeavy ? <HeavyList items={items} /> : <HeavyListImpl items={items} />}
            </PanelShell>
          </div>
        </div>

        {/* Event log + insight */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="max-h-40 min-h-[96px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
            {log.length === 0 ? (
              <span className="text-slate-500">$ bấm nút để xem panel nào vừa re-render...</span>
            ) : (
              log.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className={
                    line.includes('🛡️')
                      ? 'text-emerald-400'
                      : line.includes('oan ức')
                        ? 'text-red-400'
                        : 'text-slate-300'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
          <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Info className="h-4 w-4 shrink-0" />
              Insight — re-render lan truyền thế nào?
            </p>
            <ul className="space-y-1 text-[11px] leading-relaxed text-muted-foreground">
              <li>
                • State thay đổi → chỉ <span className="font-semibold text-foreground">owner</span>{' '}
                re-render: bấm +1 ở CounterA không làm sibling chạy lại.
              </li>
              <li>
                • ParentApp re-render → mọi con KHÔNG bọc memo đều re-render theo, dù props không
                đổi.
              </li>
              <li>
                • memo() bỏ qua re-render khi props shallow-equal; còn đổi key/type component =
                remount — mất sạch state nội bộ.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Mô phỏng thuần client-side — bộ đếm renders và hiệu ứng flash tuân theo đúng ngữ nghĩa render
        của React (owner re-render, memo shallow-compare, remount khi key/type đổi), không dùng React
        Profiler thật và không có network nào.
      </p>
    </div>
  );
}
