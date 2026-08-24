'use client';

import * as React from 'react';
import {
  Search,
  Flame,
  ShieldCheck,
  RotateCcw,
  Gauge,
  Lightbulb,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: number;
  name: string;
  tag: string;
  price: number;
}

// 24 sản phẩm hardcode — hoàn toàn deterministic để an toàn hydration
const PRODUCT_SEEDS: Array<[string, string]> = [
  ['Bàn phím cơ', '⌨️'],
  ['Chuột gaming', '🖱️'],
  ['Màn hình 4K', '🖥️'],
  ['Tai nghe BT', '🎧'],
  ['Webcam HD', '📷'],
  ['Dock USB-C', '🔌'],
  ['SSD NVMe', '💾'],
  ['Router WiFi 6', '📡'],
  ['Cân thông minh', '⚖️'],
  ['Đèn bàn LED', '💡'],
  ['Balo laptop', '🎒'],
  ['Sạc nhanh 65W', '🔋'],
  ['Giá đỡ laptop', '🗜️'],
  ['Bàn nâng hạ', '🪑'],
  ['Mic podcast', '🎙️'],
  ['Tablet vẽ', '🖌️'],
  ['Ổ cứng di động', '📦'],
  ['Hub Thunderbolt', '🧩'],
  ['Bàn phím số', '🔢'],
  ['Loa bluetooth', '🔊'],
  ['Quạt mini USB', '🌬️'],
  ['Sạc dự phòng', '🧲'],
  ['Kính chống xanh', '👓'],
  ['Thẻ nhớ 1TB', '🃏'],
];

const PRODUCTS: Product[] = PRODUCT_SEEDS.map(([name, tag], i) => ({
  id: i + 1,
  name,
  tag,
  price: 199 + i * 37,
}));

type DefenseKey = 'memo' | 'callback' | 'filter';

const DEFENSE_META: Record<DefenseKey, { label: string; hint: string }> = {
  memo: { label: 'React.memo(Item)', hint: 'bỏ qua re-render khi props shallow-equal' },
  callback: { label: 'useCallback(onSelect)', hint: 'giữ tham chiếu prop function ổn định' },
  filter: { label: 'useMemo(filteredItems)', hint: 'giữ tham chiếu object item ổn định' },
};

interface GridItemProps {
  item: Product;
  selected: boolean;
  onSelect: (item: Product) => void;
}

function GridItemBase({ item, selected, onSelect }: GridItemProps) {
  // Tick counter nằm ngay thân component: chỉ tăng khi component THỰC SỰ render
  const rendersRef = React.useRef(0);
  rendersRef.current += 1;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`relative flex flex-col items-start gap-0.5 rounded-lg border p-2 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border/60 bg-background/60 hover:border-primary/40'
      }`}
    >
      <span className="absolute right-1 top-1 font-mono text-[9px] text-muted-foreground">
        ×{rendersRef.current}
      </span>
      <span className="text-base leading-none">{item.tag}</span>
      <span className="w-full truncate text-[11px] font-semibold text-foreground">{item.name}</span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {item.price.toLocaleString('vi-VN')}₫
      </span>
    </button>
  );
}

const MemoGridItem = React.memo(GridItemBase);

export function MemoProfilerLab() {
  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [defenses, setDefenses] = React.useState<Record<DefenseKey, boolean>>({
    memo: false,
    callback: false,
    filter: false,
  });
  const [gridEpoch, setGridEpoch] = React.useState(0); // đổi key ⇒ remount cả grid

  // ─── Memoization THẬT, điều khiển bằng công tắc ────────────────────
  // Cache theo id: item sống sót qua nhiều keystroke giữ NGUYÊN tham chiếu
  const decoratedCacheRef = React.useRef(new Map<number, Product>());
  const getStableItem = React.useCallback((p: Product): Product => {
    const cached = decoratedCacheRef.current.get(p.id);
    if (cached) return cached;
    const fresh = { ...p };
    decoratedCacheRef.current.set(p.id, fresh);
    return fresh;
  }, []);

  const matchQuery = React.useCallback(
    (p: Product) => p.name.toLowerCase().includes(query.trim().toLowerCase()),
    [query]
  );

  // useMemo ON: danh sách chỉ tính lại khi query đổi, object bên trong ổn định
  const memoFiltered = React.useMemo(
    () => PRODUCTS.filter(matchQuery).map(getStableItem),
    [matchQuery, getStableItem]
  );
  // useMemo OFF: mảng + object mới 100% mỗi render ⇒ React.memo tê liệt
  const rawFiltered = PRODUCTS.filter(matchQuery).map((p) => ({ ...p }));
  const items = defenses.filter ? memoFiltered : rawFiltered;

  const stableSelect = React.useCallback((p: Product) => setSelectedId(p.id), []);
  const hotSelect = (p: Product) => setSelectedId(p.id);
  const onSelect = defenses.callback ? stableSelect : hotSelect;

  // ─── React Profiler thật: ghi số liệu thẳng vào DOM sau mỗi commit ──
  // (cố tình KHÔNG setState trong onRender — sẽ tạo vòng lặp commit vô hạn)
  const commitElRef = React.useRef<HTMLSpanElement>(null);
  const durationElRef = React.useRef<HTMLSpanElement>(null);
  const commitCountRef = React.useRef(0);

  const handleProfilerRender: React.ProfilerOnRenderCallback = (
    _id,
    _phase,
    actualDuration
  ) => {
    commitCountRef.current += 1;
    if (commitElRef.current) commitElRef.current.textContent = String(commitCountRef.current);
    if (durationElRef.current) {
      durationElRef.current.textContent = `${actualDuration.toFixed(1)}ms`;
      durationElRef.current.style.color = actualDuration > 4 ? '#f87171' : '#34d399';
    }
  };

  const toggleDefense = (key: DefenseKey) =>
    setDefenses((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetCounters = () => {
    commitCountRef.current = 0;
    if (commitElRef.current) commitElRef.current.textContent = '0';
    if (durationElRef.current) {
      durationElRef.current.textContent = '—';
      durationElRef.current.style.color = '';
    }
    setGridEpoch((e) => e + 1);
  };

  const allOn = defenses.memo && defenses.callback && defenses.filter;

  const brokenReasons: string[] = [];
  if (!defenses.memo) brokenReasons.push('Item chưa được bọc React.memo');
  if (!defenses.callback) brokenReasons.push('onSelect là function mới mỗi render');
  if (!defenses.filter) brokenReasons.push('mỗi item là object mới mỗi render');

  return (
    <div className="space-y-4">
      <Card className="glass-card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Gauge className="h-4 w-4 text-primary" />
            Lab 03 · Memo Profiler
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              {'<Profiler id="grid" />'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={resetCounters} className="gap-1 text-[11px]">
              <RotateCcw className="h-3 w-3" />
              Reset counters
            </Button>
          </div>
        </div>

        {/* Search + stats strip */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lọc theo tên sản phẩm — gõ thử và nhìn counter..."
              className="pl-8 text-xs"
            />
          </div>
          <Badge variant="secondary" className="whitespace-nowrap font-mono text-[10px]">
            {items.length}/24 items
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            React Profiler · last commit
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            Commit #
            <span ref={commitElRef} className="text-primary">
              0
            </span>{' '}
            ·{' '}
            <span ref={durationElRef} className="text-muted-foreground">
              —
            </span>
          </span>
        </div>

        {/* Công tắc phòng thủ */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(Object.keys(DEFENSE_META) as DefenseKey[]).map((key) => {
            const on = defenses[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDefense(key)}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  on
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-destructive/30 bg-destructive/10'
                }`}
              >
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
                  {on ? (
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Flame className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  )}
                  {DEFENSE_META[key].label}
                </span>
                <span
                  className={`mt-0.5 block text-[10px] ${
                    on
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-destructive'
                  }`}
                >
                  {on ? 'ON' : 'OFF'} · {DEFENSE_META[key].hint}
                </span>
              </button>
            );
          })}
        </div>

        {/* Verdict banner */}
        <div
          className={`rounded-xl border p-3 ${
            allOn
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-destructive/40 bg-destructive/10'
          }`}
        >
          <p
            className={`flex items-center gap-1.5 text-xs font-bold ${
              allOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
            }`}
          >
            {allOn ? (
              <ShieldCheck className="h-4 w-4 shrink-0" />
            ) : (
              <Flame className="h-4 w-4 shrink-0" />
            )}
            {allOn
              ? '🛡️ Chỉ items thay đổi re-render'
              : `🔥 Render storm: ${items.length} items × mỗi keystroke`}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {allOn
              ? 'Items giữ nguyên tham chiếu bị memo chặn ngang — tick counter của chúng đóng băng.'
              : `Nguyên nhân: ${brokenReasons.join(' · ')}.`}
          </p>
        </div>

        {/* Grid được đo bằng Profiler thật */}
        <React.Profiler id="grid" onRender={handleProfilerRender}>
          <div key={gridEpoch} className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) =>
              defenses.memo ? (
                <MemoGridItem
                  key={item.id}
                  item={item}
                  selected={item.id === selectedId}
                  onSelect={onSelect}
                />
              ) : (
                <GridItemBase
                  key={item.id}
                  item={item}
                  selected={item.id === selectedId}
                  onSelect={onSelect}
                />
              )
            )}
            {items.length === 0 && (
              <p className="col-span-full py-6 text-center text-xs text-muted-foreground">
                Không sản phẩm nào khớp “{query}”.
              </p>
            )}
          </div>
        </React.Profiler>

        <p className="text-[10px] text-muted-foreground">
          ×N ở góc mỗi card = số lần item đó THỰC SỰ render (đếm ngay trong thân component).
          Bật đủ 3 công tắc rồi gõ tiếp — counter của các item sống sót sẽ đứng yên.
        </p>
      </Card>

      {/* Insight: referential equality */}
      <Card className="glass-card space-y-2 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Vì sao nó hoạt động — Referential Equality
        </h3>
        <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <li>
            🔍 <code className="font-mono text-[10px] text-foreground">React.memo</code> chỉ hỏi
            một câu:{' '}
            <code className="font-mono text-[10px]">
              prev.item === next.item &amp;&amp; prev.onSelect === next.onSelect
            </code>
            ?
          </li>
          <li>
            💥 Mỗi render, object literal <code className="font-mono text-[10px]">{'{...p}'}</code>{' '}
            và arrow function đều tạo tham chiếu MỚI ⇒ so sánh luôn sai ⇒ memo thành trang trí.
          </li>
          <li>
            🛡️ <code className="font-mono text-[10px] text-foreground">useMemo / useCallback</code>{' '}
            giữ nguyên tham chiếu giữa các render ⇒ memo mới bắt đầu ăn tiền thật.
          </li>
          <li>
            🧠 Cache theo id giúp item sống sót qua keystroke dùng lại đúng object cũ — chỉ
            subset thực sự thay đổi là re-render.
          </li>
        </ul>
      </Card>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Gauge className="mt-0.5 h-3 w-3 shrink-0" />
        Số liệu Commit # và ms đọc trực tiếp từ React Profiler API (actualDuration) tại mỗi
        commit — mô phỏng thuần client-side, không có số liệu giả nào.
      </p>
    </div>
  );
}
