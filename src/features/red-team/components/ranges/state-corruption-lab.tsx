'use client';

import * as React from 'react';
import {
  Bell,
  Bug,
  Hash,
  Layers,
  ListTodo,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Skull,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * FIRING RANGE · ui-state-corruption
 * Tham nhũng trạng thái React: index-key tráo danh tính row sau lưng user,
 * mutation khiến UI ngủ đông đến khi dữ liệu "trồi lên" sai nhịp, số 0 ma
 * in hình từ toán tử &&, và render không thuần khiết cộng dồn lợi nhuận
 * mỗi lần StrictMode double-invoke. Bật Defense Mode để thấy bản vá làm
 * toàn bộ vector biến mất thế nào.
 */

interface TodoItem {
  id: string;
  label: string;
}

interface SlotNote {
  text: string;
  typedFor: string;
}

const INITIAL_TODOS: TodoItem[] = [
  { id: 'todo-1', label: 'Học JavaScript' },
  { id: 'todo-2', label: 'Học React' },
  { id: 'todo-3', label: 'Học Next.js' },
];

const PREPEND_LABELS = ['Nộp báo cáo khẩn', 'Fix bug production', 'Họp sprint review'];

const INITIAL_ORDERS = [
  { id: 'ord-8812', label: 'Đơn #8812 · SSD 1TB', amount: 250 },
  { id: 'ord-8841', label: 'Đơn #8841 · GPU RTX', amount: 400 },
];

function PatchSwitch({
  on,
  onToggle,
  labelOn,
  labelOff,
}: {
  on: boolean;
  onToggle: () => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <Button
      size="sm"
      variant={on ? 'default' : 'outline'}
      onClick={onToggle}
      className="h-7 text-[11px]"
    >
      {on ? <ShieldCheck className="mr-1 h-3 w-3" /> : <Skull className="mr-1 h-3 w-3" />}
      {on ? labelOn : labelOff}
    </Button>
  );
}

export function StateCorruptionLab() {
  const [defenseMode, setDefenseMode] = React.useState(false);

  // ── Vector 01 · Index-Key Identity Theft ──────────────────────────────
  const [todos, setTodos] = React.useState<TodoItem[]>(INITIAL_TODOS);
  // ❌ list trái: ghi chú lưu theo SLOT (vị trí) — đúng kiểu key={index} giữ state
  const [slotNotes, setSlotNotes] = React.useState<Record<number, SlotNote>>({});
  // ✅ list phải: ghi chú bám theo id — key={todo.id}
  const [notesById, setNotesById] = React.useState<Record<string, string>>({});
  const [prepends, setPrepends] = React.useState(0);

  const prependItem = () => {
    const label = PREPEND_LABELS[prepends % PREPEND_LABELS.length];
    setTodos((prev) => [{ id: `todo-new-${prepends + 1}`, label }, ...prev]);
    setPrepends((p) => p + 1);
  };

  const resetKeyDemo = () => {
    setTodos(INITIAL_TODOS);
    setSlotNotes({});
    setNotesById({});
    setPrepends(0);
  };

  const keySwapExploited = Object.entries(slotNotes).some(([idx, note]) => {
    const item = todos[Number(idx)];
    return note.text.trim() !== '' && !!item && item.label !== note.typedFor;
  });

  // ── Vector 02 · Direct Mutation Strike ────────────────────────────────
  const [fixImmutable, setFixImmutable] = React.useState(false);
  const cartRef = React.useRef<string[]>([]); // "data thật" — mảng bị mutate tại chỗ
  const [badgeCount, setBadgeCount] = React.useState(0); // số UI thực sự render được
  const [cartClicks, setCartClicks] = React.useState(0);
  const [sawPhantomJump, setSawPhantomJump] = React.useState(false);
  const [cartLog, setCartLog] = React.useState<string[]>([]);

  const pushCartLog = (lines: string[]) =>
    setCartLog((prev) => [...prev, ...lines].slice(-8));

  const toggleFixImmutable = () => {
    const next = !fixImmutable;
    setFixImmutable(next);
    cartRef.current = [];
    setBadgeCount(0);
    setCartClicks(0);
    setSawPhantomJump(false);
    setCartLog(
      next
        ? ['🛡️ Đã bật vá: immutable spread — mô phỏng lại từ đầu']
        : ['💀 ATTACK MODE: cart.push() + setCart(cart) — cùng tham chiếu']
    );
  };

  const addToCart = () => {
    if (!fixImmutable) {
      cartRef.current.push(`SKU-${1000 + cartRef.current.length}`);
      const real = cartRef.current.length;
      const clickNo = cartClicks + 1;
      setCartClicks(clickNo);
      pushCartLog([
        `$ addItem() · click #${clickNo} → cart.push ok · length=${real}`,
        '> setCart(cart) → Object.is(cart, cart) === true',
        'WARNING: React BAIL OUT — không schedule re-render · badge vẫn 0',
      ]);
    } else {
      const next = badgeCount + 1;
      setBadgeCount(next);
      pushCartLog([
        '$ addItem() → setCart(prev => [...prev, item])',
        `> tham chiếu MỚI → re-render ngay · badge = ${next}`,
      ]);
    }
  };

  const fireUnrelatedRerender = () => {
    if (!fixImmutable && cartRef.current.length > 0) {
      const real = cartRef.current.length;
      pushCartLog([
        '🔔 state khác đổi → React render lại component',
        `> render đọc lại mảng đã mutate (same ref) → badge: ${badgeCount} → ${real}`,
        ...(real >= 2
          ? ['CRITICAL: nhảy thẳng 0 → 2 — con số 1 KHÔNG TỒN TẠI trên UI']
          : ['> data cũ trồi lên bất ngờ sau một event vô liên quan']),
      ]);
      setBadgeCount(real);
      if (real >= 2) setSawPhantomJump(true);
    } else {
      pushCartLog([
        fixImmutable
          ? '🔔 re-render không liên quan — immutable state, badge vẫn khớp data'
          : '🔔 chưa có gì mutate — badge đứng yên',
      ]);
    }
  };

  const resetCartDemo = () => {
    cartRef.current = [];
    setBadgeCount(0);
    setCartClicks(0);
    setSawPhantomJump(false);
    setCartLog(['$ cart reset…']);
  };

  const mutationExploited = sawPhantomJump;
  const actualCartLength = fixImmutable ? badgeCount : cartClicks;

  // ── Vector 03 · Zero Render Trap ──────────────────────────────────────
  const [fixBool, setFixBool] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [zeroTouched, setZeroTouched] = React.useState(false);

  const bumpCount = (delta: number) => {
    setZeroTouched(true);
    setCount((c) => Math.min(9, Math.max(0, c + delta)));
  };

  const literalZeroOnScreen = !fixBool && count === 0 && zeroTouched;

  // ── Vector 04 · Impure Render + Mid-Render Mutation ───────────────────
  const [fixPure, setFixPure] = React.useState(false);
  const ledgerRef = React.useRef(0); // biến "module-level" bị cộng dồn GIỮA RENDER
  const [renderRuns, setRenderRuns] = React.useState(0);
  const [displayedProfit, setDisplayedProfit] = React.useState<number | null>(null);
  const truthProfit = INITIAL_ORDERS.reduce((s, o) => s + o.amount, 0);

  const runRenderCycle = () => {
    if (!fixPure) {
      // 💥 StrictMode double-invoke: body chạy 2 lần/lượt render,
      // mỗi lần cộng dồn vào biến ngoài (mid-render mutation)
      const sum = INITIAL_ORDERS.reduce((s, o) => s + o.amount, 0);
      ledgerRef.current += sum;
      ledgerRef.current += sum;
      setDisplayedProfit(ledgerRef.current);
      setRenderRuns((r) => r + 1);
    } else {
      // ✅ pure derive từ data — useMemo hit, cùng input → cùng output
      setDisplayedProfit(truthProfit);
      setRenderRuns((r) => r + 1);
    }
  };

  const resetPureDemo = () => {
    ledgerRef.current = 0;
    setRenderRuns(0);
    setDisplayedProfit(null);
  };

  const impureDrifted = displayedProfit !== null && displayedProfit !== truthProfit;

  // Master toggle đồng bộ toàn bộ mini-switch
  React.useEffect(() => {
    setFixImmutable(defenseMode);
    setFixBool(defenseMode);
    setFixPure(defenseMode);
  }, [defenseMode]);

  const allFound =
    keySwapExploited && mutationExploited && literalZeroOnScreen && impureDrifted;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {defenseMode ? (
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
          <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            tham nhũng{' '}
            {
              [
                keySwapExploited,
                mutationExploited,
                literalZeroOnScreen,
                impureDrifted,
              ].filter(Boolean).length
            }
            /4 vector
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={defenseMode ? 'ghost' : 'destructive'}
            onClick={() => setDefenseMode(false)}
            className="h-7 text-[11px]"
          >
            <Skull className="mr-1 h-3 w-3" />
            Viết code ẩu
          </Button>
          <Button
            size="sm"
            variant={defenseMode ? 'default' : 'ghost'}
            onClick={() => setDefenseMode(true)}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Bản vá
          </Button>
        </div>
      </div>

      {/* ── Sim 01 · Key swap side-by-side ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
              <ListTodo className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">
                01 · Index-Key Identity Theft
              </p>
              <p className="text-muted-foreground text-[10px]">
                Gõ vài chữ vào ô ghi chú của một dòng rồi bấm “Prepend item” — so sánh hai
                cột.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={prependItem}
              className="h-7 text-[11px]"
            >
              <Plus className="mr-1 h-3 w-3" />
              Prepend item
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetKeyDemo}
              className="h-7 text-[11px]"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* ❌ key=index */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-red-400">{'❌ key={index}'}</span>
              <span className="text-[10px] text-slate-500">state bám VỊ TRÍ</span>
            </div>
            {todos.map((todo, i) => {
              const note = slotNotes[i];
              const swapped =
                !!note && note.text.trim() !== '' && note.typedFor !== todo.label;
              return (
                <div
                  key={i}
                  className={`mb-1 rounded-lg border px-2 py-1.5 ${
                    swapped
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-slate-300">{todo.label}</span>
                    <input
                      value={note?.text ?? ''}
                      onChange={(e) =>
                        setSlotNotes((prev) => ({
                          ...prev,
                          [i]: { text: e.target.value, typedFor: todo.label },
                        }))
                      }
                      placeholder="ghi chú…"
                      className="w-24 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>
                  {swapped && (
                    <p className="mt-1 text-[10px] text-red-400">
                      ⚠️ note này được gõ cho “{note.typedFor}” — đã nhảy nhầm hàng!
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ✅ key=id */}
          <div className="rounded-xl border border-emerald-900/60 bg-slate-950 p-3 font-mono text-[11px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-emerald-400">{'✅ key={todo.id}'}</span>
              <span className="text-[10px] text-slate-500">state bám DỮ LIỆU</span>
            </div>
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="mb-1 rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-slate-300">{todo.label}</span>
                  <input
                    value={notesById[todo.id] ?? ''}
                    onChange={(e) =>
                      setNotesById((prev) => ({ ...prev, [todo.id]: e.target.value }))
                    }
                    placeholder="ghi chú…"
                    className="w-24 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {keySwapExploited && (
          <p className="text-destructive text-[11px] leading-relaxed">
            🎯 Cột trái: reconciliation tái sử dụng instance theo key=0,1,2 — note của
            user ở nguyên slot trong khi dữ liệu đã dịch. Không một warning nào trong
            console.
          </p>
        )}
      </Card>

      {/* ── Sim 02 · Mutation bail-out ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
              <ShoppingCart className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">
                02 · Direct Mutation Strike
              </p>
              <p className="text-muted-foreground text-[10px]">
                Bấm thêm hàng 2 lần rồi kích hoạt một re-render không liên quan.
              </p>
            </div>
          </div>
          <PatchSwitch
            on={fixImmutable}
            onToggle={toggleFixImmutable}
            labelOn="Vá: spread immutable"
            labelOff="Bật vá: spread immutable"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-slate-400" />
              {/* Badge chỉ render số mà React "commit" — đây là ranh giới mô phỏng */}
              <Badge
                variant={mutationExploited ? 'destructive' : 'secondary'}
                className="font-mono"
              >
                {badgeCount} món
              </Badge>
            </div>
            <span className="text-slate-500">
              data thật (length):{' '}
              <span className="text-amber-400">{actualCartLength}</span>
            </span>
            {!fixImmutable && badgeCount !== actualCartLength && (
              <span className="animate-pulse text-red-400">⚠ lệch pha model ↔ view</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={addToCart}
              className="h-7 text-[11px]"
            >
              <Plus className="mr-1 h-3 w-3" />
              Thêm vào giỏ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={fireUnrelatedRerender}
              className="h-7 text-[11px]"
            >
              <Bell className="mr-1 h-3 w-3" />
              Re-render không liên quan
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetCartDemo}
              className="h-7 text-[11px]"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
          <div className="mt-2 min-h-[52px] space-y-0.5 rounded-md bg-black/40 p-2 leading-relaxed">
            {cartLog.length === 0 ? (
              <span className="text-slate-600">$ chờ thao tác…</span>
            ) : (
              cartLog.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className={
                    line.startsWith('CRITICAL')
                      ? 'text-red-400'
                      : line.startsWith('WARNING')
                        ? 'text-amber-400'
                        : line.startsWith('🛡️')
                          ? 'text-emerald-400'
                          : line.startsWith('>') || line.startsWith('🔔')
                            ? 'text-slate-400'
                            : 'text-emerald-300'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* ── Sim 03 · Zero trap ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
              <Hash className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">03 · Zero Render Trap</p>
              <p className="text-muted-foreground text-[10px]">
                Đưa count về 0 và nhìn chữ “0” hiện hình từ toán tử &&.
              </p>
            </div>
          </div>
          <PatchSwitch
            on={fixBool}
            onToggle={() => setFixBool((v) => !v)}
            labelOn="Vá: Boolean(count)"
            labelOff="Bật vá: Boolean(count)"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <div
            className={`rounded-xl border p-3 font-mono text-[11px] ${
              literalZeroOnScreen
                ? 'border-destructive/50 bg-red-500/5'
                : 'border-slate-800 bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-slate-400" />
              {!fixBool ? (
                <>{count && <Badge variant="destructive">{count} món</Badge>}</>
              ) : (
                <>{Boolean(count) && <Badge variant="success">{count} món</Badge>}</>
              )}
              {count === 0 && !literalZeroOnScreen && (
                <span className="text-slate-600">(giỏ trống)</span>
              )}
            </div>
            {literalZeroOnScreen ? (
              <p className="mt-2 text-red-400">
                ⚠️ DOM: {'<div> … 0 … </div>'} — chữ “0” là TEXT NODE thật, không phải
                badge!
              </p>
            ) : fixBool ? (
              <p className="mt-2 text-emerald-400">
                ✅ Boolean(count) ép vế trái về true/false — false bị React bỏ qua, không
                node nào.
              </p>
            ) : (
              <p className="mt-2 text-slate-500">
                $ bấm “−” đưa count về 0 để kích hoạt…
              </p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <span className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
              count
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bumpCount(-1)}
                className="h-7 w-7 p-0 text-[11px]"
              >
                −
              </Button>
              <span className="text-foreground w-6 text-center font-mono text-sm">
                {count}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bumpCount(1)}
                className="h-7 w-7 p-0 text-[11px]"
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-slate-950/80 px-3 py-2 font-mono text-[11px] text-slate-400">
          {fixBool ? '{Boolean(count) && <Badge/>}' : '{count && <Badge/>}'}
          <span className="ml-2 text-slate-600">
            {fixBool
              ? '// ✅ luôn boolean'
              : '// ❌ trả về 0 — number vẫn là ReactNode hợp lệ'}
          </span>
        </div>
      </Card>

      {/* ── Sim 04 · Impure render + mid-render mutation ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
              <Bug className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">
                04 · Impure Render Sabotage
              </p>
              <p className="text-muted-foreground text-[10px]">
                Tổng lợi nhuận tính inline giữa render + StrictMode double-invoke → cộng
                dồn ×2.
              </p>
            </div>
          </div>
          <PatchSwitch
            on={fixPure}
            onToggle={() => setFixPure((v) => !v)}
            labelOn="Vá: pure derive + useMemo"
            labelOff="Bật vá: pure derive + useMemo"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              className={`rounded-lg border p-2 ${impureDrifted ? 'border-destructive/50 bg-red-500/10' : 'border-slate-800 bg-slate-900/40'}`}
            >
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                Lợi nhuận hiển thị
              </p>
              <p
                className={`text-base font-bold ${impureDrifted ? 'text-red-400' : 'text-emerald-400'}`}
              >
                {displayedProfit === null ? '—' : `${displayedProfit}tr₫`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                Sự thật từ data
              </p>
              <p className="text-base font-bold text-slate-200">{truthProfit}tr₫</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                Lượt render
              </p>
              <p className="text-base font-bold text-slate-200">{renderRuns}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={runRenderCycle}
              className="h-7 text-[11px]"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Re-render component
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetPureDemo}
              className="h-7 text-[11px]"
            >
              Reset
            </Button>
          </div>
          <p className="mt-2 leading-relaxed text-slate-500">
            {fixPure
              ? '// ✅ tổng derive thuần từ orders — memo hit an toàn, bấm lại bao nhiêu cũng ra 650'
              : '// 💥 ledger += sum chạy 2 lần giữa render (StrictMode ×2) — mid-render mutation vô hình với compiler'}
          </p>
          {impureDrifted && (
            <p className="mt-1 text-red-400">
              🎯 Hiển thị {displayedProfit}tr₫ nhưng data thật là {truthProfit}tr₫ — giá
              trên màn hình không còn khớp giá tính tiền.
            </p>
          )}
        </div>
      </Card>

      {/* Finding report */}
      <div className="space-y-2">
        {[
          {
            id: 'keyswap',
            icon: <ListTodo className="h-3.5 w-3.5" />,
            label: 'Index-Key Identity Theft',
            found: keySwapExploited,
            patched: defenseMode,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: state ô input/checkbox của row bị “trút” sang task khác sau một lần prepend.',
            idleText: 'Gõ ghi chú vào một dòng ở cột trái rồi bấm Prepend item.',
          },
          {
            id: 'mutation',
            icon: <ShoppingCart className="h-3.5 w-3.5" />,
            label: 'Direct Mutation Strike',
            found: mutationExploited,
            patched: fixImmutable,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: badge nhảy thẳng 0 → 2 sau re-render không liên quan — con số 1 không từng tồn tại trên UI.',
            idleText:
              'Thêm hàng 2 lần (badge đứng yên ở 0) rồi bấm re-render không liên quan.',
          },
          {
            id: 'zero',
            icon: <Hash className="h-3.5 w-3.5" />,
            label: 'Zero Render Trap',
            found: literalZeroOnScreen,
            patched: fixBool,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: chữ “0” được render thành text node đè lên icon giỏ hàng trên mọi tài khoản mới.',
            idleText: 'Đưa count về 0 với biểu thức {count && <Badge/>}.',
          },
          {
            id: 'impure',
            icon: <Bug className="h-3.5 w-3.5" />,
            label: 'Impure Render + Mid-Render Mutation',
            found: impureDrifted,
            patched: fixPure && displayedProfit !== null,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: tổng lợi nhuận cộng dồn qua mỗi lượt render — compiler memo trên kết quả SAI.',
            idleText: 'Bấm Re-render component vài lần khi chưa bật vá.',
          },
        ].map((finding) => (
          <Card
            key={finding.id}
            className={`glass-card flex items-start gap-3 p-3 ${
              finding.found && !finding.patched
                ? 'border-destructive/30'
                : finding.patched
                  ? 'border-emerald-500/20'
                  : ''
            }`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                finding.found && !finding.patched
                  ? 'bg-destructive/10 text-destructive'
                  : finding.patched
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {finding.found && !finding.patched ? (
                <Skull className="h-3.5 w-3.5" />
              ) : (
                finding.icon
              )}
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-foreground text-xs font-bold">{finding.label}</p>
              {finding.found && !finding.patched && (
                <p className="text-destructive text-[11px] leading-relaxed">
                  {finding.foundText}
                </p>
              )}
              {finding.patched && (
                <p className="text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                  Đã vá: key=id / immutable spread / boolean coercion / pure derive —
                  vector mất hoàn toàn điều kiện kích hoạt.
                </p>
              )}
              {!finding.found && !finding.patched && (
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {finding.idleText}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Verdict */}
      {(allFound || defenseMode) && (
        <Card
          className={`glass-card p-4 ${
            allFound && !defenseMode ? 'border-destructive/30' : 'border-emerald-500/30'
          }`}
        >
          {allFound && !defenseMode ? (
            <p className="text-foreground text-xs leading-relaxed">
              💀 <span className="font-bold">Blast Radius:</span> UI nói dối user trên cả
              bốn mặt trận — note dán nhầm task, giỏ hàng nhảy số ma, số 0 treo lơ lửng,
              lợi nhuận phình vô tội vạ. Toàn bộ diễn ra KHÔNG MỘT lỗi console nào; sprint
              review và báo cáo tài chính đều đọc dữ liệu đã bị tham nhũng ngay trước mắt.
            </p>
          ) : (
            <p className="text-foreground text-xs leading-relaxed">
              🛡️{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Defense Patch:
              </span>{' '}
              key bền vững theo id dữ liệu, mọi update trả tham chiếu mới qua spread, vế
              trái của && luôn được ép về boolean, và render là hàm thuần —
              randomness/cộng dồn dời sang handler hoặc effect. Compiler memo đúng, UI
              không còn cách nào nói dối.
            </p>
          )}
        </Card>
      )}

      {/* Footer */}
      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
        <Layers className="h-3 w-3" />
        Mọi mô phỏng là local state machine — không network, không code hại thật.
      </div>
    </div>
  );
}
