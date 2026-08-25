'use client';

import * as React from 'react';
import {
  Bomb,
  ClipboardList,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  ShieldX,
  ShoppingBag,
  Skull,
  TextCursorInput,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * FIRING RANGE · form-input-abuse
 * Lạm dụng tầng form: field không name biến mất khỏi FormData, controlled
 * lật uncontrolled giữa chừng, nút đặt hàng không khóa nhân bản đơn theo
 * số lần click, validation chỉ trang trí ở client và .parse() nổ tung cả
 * route. Bật Defense Mode để thấy name contract / safeParse / idempotency
 * vô hiệu hóa toàn bộ vector.
 */

const EXPECTED_FIELDS = [
  { key: 'fullName', label: 'Họ tên người nhận' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'shippingMethod', label: 'Phương thức vận chuyển' },
  { key: 'referralCode', label: 'Mã giới thiệu' },
] as const;

const ORDER_AMOUNT = 12500000;

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

function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="bg-secondary text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </span>
      <div>
        <p className="text-foreground text-xs font-bold">{title}</p>
        <p className="text-muted-foreground text-[10px]">{hint}</p>
      </div>
    </div>
  );
}

export function FormAbuseRange() {
  const [defenseMode, setDefenseMode] = React.useState(false);

  // ── Vector 01 · Ghost Field Vanishing ─────────────────────────────────
  const [fixName, setFixName] = React.useState(false);
  const [dumpEntries, setDumpEntries] = React.useState<[string, string][] | null>(null);

  const submitGhostForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Serialize y hệt handler thật: FormData chỉ thu field CÓ name
    const fd = new FormData(e.currentTarget);
    setDumpEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)]));
  };

  const missingKeys = dumpEntries
    ? EXPECTED_FIELDS.map((f) => f.key).filter(
        (k) => !dumpEntries.some(([ek]) => ek === k)
      )
    : [];
  const ghostFieldExploited =
    dumpEntries !== null && missingKeys.includes('referralCode');

  const toggleFixName = () => {
    setFixName((v) => !v);
    setDumpEntries(null);
  };

  // ── Vector 02 · Controlled Mode Flip ──────────────────────────────────
  const [fixControlled, setFixControlled] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [code, setCode] = React.useState('');
  const domCouponRef = React.useRef(''); // DOM tự ôm chữ khi uncontrolled — state không biết
  const [lostText, setLostText] = React.useState(false);

  const runVerify = () => {
    if (!fixControlled && domCouponRef.current.trim() !== '') {
      setLostText(true); // flip chế độ → DOM bị ghi đè bởi value='' của state
    }
    setVerified(true);
  };

  const resetCouponDemo = () => {
    setVerified(false);
    setCode('');
    setLostText(false);
    domCouponRef.current = '';
  };

  const toggleFixControlled = () => {
    setFixControlled((v) => !v);
    resetCouponDemo();
  };

  // ── Vector 03 · Double Submit Fraud ───────────────────────────────────
  const [fixIdempotency, setFixIdempotency] = React.useState(false);
  interface FakeOrder {
    id: string;
    seq: number;
    amount: number;
    dup: boolean;
  }
  const [orders, setOrders] = React.useState<FakeOrder[]>([]);
  const [orderClicks, setOrderClicks] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const [idemKey, setIdemKey] = React.useState(() => crypto.randomUUID());

  const placeOrder = () => {
    setOrderClicks((c) => c + 1);
    if (!fixIdempotency) {
      // ❌ không khóa pending — mỗi click là một POST mới, server tạo đơn mới
      setOrders((prev) => [
        ...prev,
        {
          id: `ord-${8840 + prev.length + 1}`,
          seq: prev.length + 1,
          amount: ORDER_AMOUNT,
          dup: prev.length > 0,
        },
      ]);
      return;
    }
    // ✅ pending lock + idempotency-key: mọi click trong cửa sổ xử lý bị gộp
    if (pending) return;
    setPending(true);
    window.setTimeout(() => {
      setOrders((prev) =>
        prev.length === 0
          ? [{ id: 'ord-8841', seq: 1, amount: ORDER_AMOUNT, dup: false }]
          : prev
      );
      setPending(false);
    }, 900);
  };

  const resetOrderDemo = () => {
    setOrders([]);
    setOrderClicks(0);
    setPending(false);
    setIdemKey(crypto.randomUUID());
  };

  const duplicateCount = orders.filter((o) => o.dup).length;
  const doubleSubmitExploited = duplicateCount > 0;

  // ── Vector 04 · Client-Only Validation Bypass ─────────────────────────
  const [fixServerValidation, setFixServerValidation] = React.useState(false);
  interface ReviewRow {
    id: string;
    author: string;
    rating: number;
    comment: string;
    poisoned?: boolean;
  }
  const [reviews, setReviews] = React.useState<ReviewRow[]>([
    { id: 'rv-1', author: 'Khánh', rating: 5, comment: 'Sản phẩm đúng mô tả' },
    { id: 'rv-2', author: 'Lan', rating: 4, comment: 'Giao nhanh, đóng gói kĩ' },
  ]);
  const [serverReject, setServerReject] = React.useState<Record<string, string[]> | null>(
    null
  );
  const [curlLog, setCurlLog] = React.useState<string[]>([]);

  const ATTACK_COMMENT = '<img src=x onerror=steal()>' + 'rác '.repeat(130);

  const fireCurl = () => {
    if (!fixServerValidation) {
      setReviews((prev) => [
        ...prev,
        {
          id: `rv-x-${prev.length}`,
          author: 'attacker@curl',
          rating: -999,
          comment: ATTACK_COMMENT,
          poisoned: true,
        },
      ]);
      setCurlLog([
        '$ curl -X POST /api/reviews -d \'{rating:-999, comment:"<img onerror>…"}\'',
        '> db.review.create(body) — 0% validation',
        'CRITICAL: payload độc COMMIT vào DB · stored XSS nhập cư',
      ]);
      return;
    }
    setServerReject({
      rating: ['Number must be greater than or equal to 1'],
      comment: ['String must contain at most 500 character(s)'],
      productId: ['Invalid cuid'],
    });
    setCurlLog([
      "$ curl -X POST /api/reviews -d '{rating:-999, …}'",
      '> ReviewSchema.safeParse(body) → success:false',
      '✅ 400 Bad Request — payload độc bị chặn tại biên giới tin cậy',
    ]);
  };

  const poisoned = reviews.some((r) => r.poisoned);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const validationBypassExploited = poisoned;

  const toggleFixServerValidation = () => {
    setFixServerValidation((v) => !v);
    setServerReject(null);
    setCurlLog([]);
    setReviews((prev) => prev.filter((r) => !r.poisoned));
  };

  // ── Vector 05 · parse() Landmine ──────────────────────────────────────
  const [fixSafeParse, setFixSafeParse] = React.useState(false);
  const [port, setPort] = React.useState('3000');
  const [saveResult, setSaveResult] = React.useState<'ok' | 'field-error' | null>(null);
  const [crashView, setCrashView] = React.useState(false);
  const [everCrashed, setEverCrashed] = React.useState(false);

  const portInvalid =
    port.trim() === '' || !/^\d+$/.test(port.trim()) || Number(port) > 65535;

  const saveSettings = () => {
    if (portInvalid && !fixSafeParse) {
      // 💣 .parse() ném ZodError — không ai bắt → error boundary trắng trang
      setCrashView(true);
      setEverCrashed(true);
      return;
    }
    setCrashView(false);
    setSaveResult(portInvalid ? 'field-error' : 'ok');
  };

  const parseLandmineExploited = everCrashed;

  const toggleFixSafeParse = () => {
    setFixSafeParse((v) => !v);
    setCrashView(false);
    setSaveResult(null);
  };

  // Master toggle đồng bộ toàn bộ mini-switch
  React.useEffect(() => {
    setFixName(defenseMode);
    setFixControlled(defenseMode);
    setFixIdempotency(defenseMode);
    setFixServerValidation(defenseMode);
    setFixSafeParse(defenseMode);
    if (defenseMode) {
      setDumpEntries(null);
      setReviews((prev) => prev.filter((r) => !r.poisoned));
    }
  }, [defenseMode]);

  const allFound =
    ghostFieldExploited &&
    lostText &&
    doubleSubmitExploited &&
    validationBypassExploited &&
    parseLandmineExploited;

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
            khai thác{' '}
            {
              [
                ghostFieldExploited,
                lostText,
                doubleSubmitExploited,
                validationBypassExploited,
                parseLandmineExploited,
              ].filter(Boolean).length
            }
            /5 vector
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
            Bỏ qua hợp đồng
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

      {/* ── Sim 01 · FormData inspector ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader
            icon={<ClipboardList className="h-3.5 w-3.5" />}
            title="01 · Ghost Field Vanishing"
            hint="Submit form rồi đọc dump FormData — tìm field bốc hơi."
          />
          <PatchSwitch
            on={fixName}
            onToggle={toggleFixName}
            labelOn={'Vá: name="referralCode"'}
            labelOff={'Bật vá: name="referralCode"'}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Mock form — inputs uncontrolled, serialize bằng FormData thật */}
          <form
            onSubmit={submitGhostForm}
            className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]"
          >
            <div className="text-emerald-400">{'// order-form.tsx'}</div>
            <label className="block space-y-1">
              <span className="text-slate-400">Họ tên người nhận</span>
              <input
                name="fullName"
                defaultValue="An Nguyễn"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 focus:border-sky-500/60 focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-slate-400">Số điện thoại</span>
              <input
                name="phone"
                defaultValue="0912345678"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 focus:border-sky-500/60 focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-slate-400">Vận chuyển</span>
              <select
                name="shippingMethod"
                defaultValue="express"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 focus:border-sky-500/60 focus:outline-none"
              >
                <option value="standard">Giao thường (3-5 ngày)</option>
                <option value="express">Giao nhanh (2 giờ)</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className={fixName ? 'text-slate-400' : 'text-red-400'}>
                Mã giới thiệu{!fixName && ' (thiếu name!)'}
              </span>
              <input
                defaultValue="FRIEND2025"
                {...(fixName ? { name: 'referralCode' } : {})}
                className={`w-full rounded border px-2 py-1 focus:outline-none ${
                  fixName
                    ? 'border-emerald-700 bg-slate-900 text-slate-200 focus:border-emerald-500/60'
                    : 'border-red-800 bg-red-950/30 text-slate-200 focus:border-red-500/60'
                }`}
              />
            </label>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="h-7 w-full text-[11px]"
            >
              <Send className="mr-1 h-3 w-3" />
              Đặt hàng — COD
            </Button>
          </form>

          {/* Dump panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed">
            <div className="text-slate-500">$ new FormData(form).entries()</div>
            {dumpEntries === null ? (
              <div className="mt-1 text-slate-600">$ chờ submit…</div>
            ) : (
              <>
                <div className="mt-1 text-sky-300">
                  [{`[${dumpEntries.map(([k, v]) => `['${k}','${v}']`).join(', ')}]`}]
                </div>
                <div className="mt-2 text-slate-500">$ POST /api/orders</div>
                <div className="text-amber-300">
                  {JSON.stringify(Object.fromEntries(dumpEntries))}
                </div>
                <div className="mt-2 space-y-1">
                  {EXPECTED_FIELDS.map((f) => {
                    const present = dumpEntries.some(([k]) => k === f.key);
                    return (
                      <div
                        key={f.key}
                        className={present ? 'text-emerald-400' : 'text-red-400'}
                      >
                        {present
                          ? `✓ ${f.key}`
                          : `☠️ ${f.key} — KHÔNG TỒN TẠI trong payload`}
                      </div>
                    );
                  })}
                </div>
                {missingKeys.length > 0 ? (
                  <div className="mt-2 text-red-400">
                    Server âm thầm fallback shipping/giá mặc định — user chọn express
                    nhưng nhận giao thường.
                  </div>
                ) : (
                  <div className="mt-2 text-emerald-400">
                    ✅ Đủ 4/4 field — payload khớp những gì UI hiển thị.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── Sim 02 · Controlled flip ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader
            icon={<TextCursorInput className="h-3.5 w-3.5" />}
            title="02 · Controlled Mode Flip"
            hint="Gõ mã giảm giá trước, rồi bấm verify quyền user."
          />
          <PatchSwitch
            on={fixControlled}
            onToggle={toggleFixControlled}
            labelOn="Vá: luôn controlled"
            labelOff="Bật vá: luôn controlled"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block flex-1 space-y-1">
              <span className="text-slate-400">Mã giảm giá</span>
              {/* key đổi giữa hai chế độ → mô phỏng remount, tránh warning thật spam console */}
              {!fixControlled && !verified ? (
                <input
                  key="coupon-uncontrolled"
                  defaultValue=""
                  onChange={(e) => {
                    domCouponRef.current = e.target.value;
                  }}
                  placeholder="VD: SALE50"
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 placeholder:text-slate-600 focus:border-red-500/60 focus:outline-none"
                />
              ) : (
                <input
                  key="coupon-controlled"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VD: SALE50"
                  className={`w-full rounded border bg-slate-900 px-2 py-1 text-slate-200 placeholder:text-slate-600 focus:outline-none ${
                    lostText
                      ? 'border-red-600'
                      : 'border-emerald-700 focus:border-emerald-500/60'
                  }`}
                />
              )}
              <span className="block text-[10px] text-slate-500">
                {!fixControlled && !verified
                  ? "// value=undefined → UNCONTROLLED — DOM tự quản, state vẫn ''"
                  : '// value={code} → CONTROLLED — React sở hữu giá trị'}
              </span>
            </label>
            <div className="flex gap-2 pb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={runVerify}
                className="h-7 text-[11px]"
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Verify xong → bật editable
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetCouponDemo}
                className="h-7 text-[11px]"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>

          {lostText && (
            <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 p-2 leading-relaxed">
              <p className="text-red-400">
                WARNING: A component is changing an uncontrolled input to be controlled…
              </p>
              <p className="mt-1 text-red-300">
                💀 “SALE50” sống trong DOM, state vẫn rỗng ({'value = ""'}) → flip ghi đè
                bằng chuỗi rỗng đó. Coupon bốc hơi ngay trước mắt khách hàng.
              </p>
            </div>
          )}
          {fixControlled && verified && !lostText && (
            <p className="mt-2 text-emerald-400">
              ✅ Input controlled xuyên suốt — verify chỉ đổi cờ disabled, chữ user gõ giữ
              nguyên.
            </p>
          )}
        </div>
      </Card>

      {/* ── Sim 03 · Double submit ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader
            icon={<ShoppingBag className="h-3.5 w-3.5" />}
            title="03 · Double Submit Fraud"
            hint="Spam-click “Đặt hàng” trong cửa sổ latency của request."
          />
          <PatchSwitch
            on={fixIdempotency}
            onToggle={() => setFixIdempotency((v) => !v)}
            labelOn="Vá: pending lock + Idempotency-Key"
            labelOff="Bật vá: pending lock + Idempotency-Key"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={placeOrder}
                disabled={fixIdempotency && pending}
                className="h-7 text-[11px]"
              >
                {fixIdempotency && pending ? (
                  <>Đang xử lý…</>
                ) : (
                  <>
                    <ShoppingBag className="mr-1 h-3 w-3" />
                    Đặt hàng
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetOrderDemo}
                className="h-7 text-[11px]"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>
                clicks: <span className="text-amber-400">{orderClicks}</span>
              </span>
              <span>
                đơn tạo:{' '}
                <span
                  className={duplicateCount > 0 ? 'text-red-400' : 'text-emerald-400'}
                >
                  {orders.length}
                </span>
              </span>
              {fixIdempotency && (
                <span className="hidden items-center gap-1 text-emerald-400 sm:inline-flex">
                  <Lock className="h-3 w-3" />
                  key: {idemKey.slice(0, 8)}…
                </span>
              )}
            </div>
          </div>

          {orders.length > 0 && (
            <div className="mt-2 space-y-1">
              {orders.map((o) => (
                <div
                  key={`${o.id}-${o.seq}`}
                  className={`flex items-center justify-between rounded-md border px-2 py-1 ${
                    o.dup
                      ? 'border-destructive/50 bg-destructive/10 text-red-300'
                      : 'border-slate-800 bg-slate-900/40 text-slate-300'
                  }`}
                >
                  <span>
                    {o.id} {o.dup && '· TRÙNG ĐƠN 💀'}
                  </span>
                  <span>{o.amount.toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-2 leading-relaxed text-slate-500">
            {fixIdempotency
              ? '// ✅ click trong lúc pending bị chặn; server dedupe theo Idempotency-Key → N click = 1 đơn'
              : doubleSubmitExploited
                ? `// 💀 ${orderClicks} click → ${orders.length} POST song song → trừ thẻ ${(ORDER_AMOUNT * orders.length).toLocaleString('vi-VN')}₫`
                : '// ❌ nút không khóa — mạng lag 900ms là cửa sổ khai hoang cho double-click'}
          </p>
        </div>
      </Card>

      {/* ── Sim 04 · Validation bypass ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader
            icon={<ShieldX className="h-3.5 w-3.5" />}
            title="04 · Client-Only Validation Bypass"
            hint="Attacker chẳng buồn mở UI — curl thẳng vào endpoint."
          />
          <PatchSwitch
            on={fixServerValidation}
            onToggle={toggleFixServerValidation}
            labelOn="Vá: server re-validate"
            labelOff="Bật vá: server re-validate"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[auto_1fr]">
          {/* Client-side validation — chỉ là UX */}
          <div className="rounded-xl border border-emerald-900/50 bg-slate-950 p-3 font-mono text-[11px]">
            <div className="mb-2 text-emerald-400">UI review form (client ✓)</div>
            <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-2">
              <p className="text-slate-300">Đánh giá: ★★★★★ (1–5)</p>
              <p className="mt-1 truncate text-slate-400">Bình luận (tối đa 50 ký tự)…</p>
              <p className="mt-1 text-emerald-400">✓ client validation: PASS</p>
            </div>
            <p className="mt-2 max-w-[220px] text-[10px] leading-relaxed text-slate-500">
              zodResolver chỉ chạy khi đi QUA form này. Attacker đi đường khác.
            </p>
          </div>

          {/* Attacker + server */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
            <div className="min-h-[48px] space-y-0.5 leading-relaxed">
              {curlLog.length === 0 ? (
                <span className="text-slate-600">$ curl đang chờ được bấm…</span>
              ) : (
                curlLog.map((line, i) => (
                  <div
                    key={`${i}-${line}`}
                    className={
                      line.startsWith('CRITICAL')
                        ? 'text-red-400'
                        : line.startsWith('>') || line.startsWith('$')
                          ? 'text-slate-400'
                          : 'text-emerald-400'
                    }
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={fireCurl}
              className="h-7 text-[11px]"
            >
              <Send className="mr-1 h-3 w-3" />
              curl -X POST /api/reviews
            </Button>

            {serverReject && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-amber-300">
                400 Bad Request — flatten().fieldErrors:
                {Object.entries(serverReject).map(([field, errs]) => (
                  <div key={field}>
                    · {field}: {errs[0]}
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-md border border-slate-800 bg-black/40 p-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">db.review ({reviews.length} rows)</span>
                <span className={poisoned ? 'text-red-400' : 'text-slate-400'}>
                  avg rating:{' '}
                  {poisoned
                    ? `${avgRating.toFixed(1)} ★ — aggregate HỎNG 💀`
                    : `${avgRating.toFixed(1)} ★`}
                </span>
              </div>
              {reviews.slice(-3).map((r) => (
                <div
                  key={r.id}
                  className={`mt-1 truncate rounded px-1.5 py-0.5 ${
                    r.poisoned
                      ? 'bg-destructive/15 text-red-300'
                      : 'bg-slate-900/60 text-slate-400'
                  }`}
                >
                  {r.poisoned
                    ? `☠️ ${r.author}: rating=${r.rating} · comment="${r.comment.slice(0, 42)}…"`
                    : `${r.author}: ${r.rating}★ · ${r.comment}`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Sim 05 · parse() landmine ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader
            icon={<Bomb className="h-3.5 w-3.5" />}
            title="05 · parse() Landmine"
            hint="Nhập port > 65535 rồi lưu — xem cả route chết thế nào."
          />
          <PatchSwitch
            on={fixSafeParse}
            onToggle={toggleFixSafeParse}
            labelOn="Vá: safeParse + guard"
            labelOff="Bật vá: safeParse + guard"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          {crashView ? (
            /* Error boundary crash card */
            <div className="rounded-lg border border-red-500/50 bg-[#1a0505] p-3">
              <p className="text-xs font-bold text-red-400">Unhandled Runtime Error</p>
              <pre className="mt-1 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap text-red-300">
                {`ZodError: [
  { path: ['port'],
    message: 'Number must be less than or equal to 65535' }
]`}
              </pre>
              <p className="mt-1 text-red-400/80">
                .parse() ném giữa render/handler → root unmount → TRẮNG TOÁT TOÀN TRANG.
                Form soạn dở mất sạch.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCrashView(false)}
                className="mt-2 h-7 text-[11px]"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset Error Boundary
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <label className="block space-y-1">
                  <span className={portInvalid ? 'text-red-400' : 'text-slate-400'}>
                    Port {portInvalid && '(ngoài 1–65535!)'}
                  </span>
                  <input
                    value={port}
                    onChange={(e) => {
                      setPort(e.target.value);
                      setSaveResult(null);
                    }}
                    className={`w-28 rounded border bg-slate-900 px-2 py-1 text-slate-200 focus:outline-none ${
                      portInvalid
                        ? 'border-red-700 focus:border-red-500/60'
                        : 'border-slate-700 focus:border-sky-500/60'
                    }`}
                  />
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPort('99999');
                    setSaveResult(null);
                  }}
                  className="h-7 text-[11px]"
                >
                  📋 Dán dữ liệu hỏng từ Excel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={saveSettings}
                  className="h-7 text-[11px]"
                >
                  <Send className="mr-1 h-3 w-3" />
                  Lưu settings
                </Button>
              </div>
              {saveResult === 'ok' && (
                <p className="mt-2 text-emerald-400">
                  ✅ SettingsSchema.safeParse → success — đã lưu.
                </p>
              )}
              {saveResult === 'field-error' && (
                <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-amber-300">
                  safeParse → success:false · port: “Number must be less than or equal to
                  65535” — lỗi hiển thị CÓ KIỂM SOÁT, UI vẫn sống.
                </div>
              )}
              {!saveResult && (
                <p className="mt-2 leading-relaxed text-slate-500">
                  {fixSafeParse
                    ? '// ✅ safeParse trả union {success,data|error} — dữ liệu xấu thành nhánh code bình thường'
                    : '// 💣 .parse() throw-on-invalid — hợp lệ với config tin cậy, TỬ THẦN với input user'}
                </p>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Finding report */}
      <div className="space-y-2">
        {[
          {
            id: 'ghost-field',
            icon: <ClipboardList className="h-3.5 w-3.5" />,
            label: 'Ghost Field Vanishing',
            found: ghostFieldExploited,
            patched: fixName,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: referralCode có trên màn hình nhưng vắng mặt trong payload — server fallback ngầm.',
            idleText: 'Submit form khi chưa gắn name cho mã giới thiệu.',
          },
          {
            id: 'controlled-flip',
            icon: <TextCursorInput className="h-3.5 w-3.5" />,
            label: 'Controlled Mode Flip',
            found: lostText,
            patched: fixControlled,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: input lật uncontrolled → controlled giữa phiên — mã giảm giá bốc hơi cùng console warning.',
            idleText: 'Gõ mã giảm giá rồi bấm verify quyền user.',
          },
          {
            id: 'double-submit',
            icon: <ShoppingBag className="h-3.5 w-3.5" />,
            label: 'Double Submit Fraud',
            found: doubleSubmitExploited,
            patched: fixIdempotency,
            foundText: `ĐÃ XÁC NHẬN LỘ: ${duplicateCount} đơn trùng được tạo chỉ bằng spam-click — thẻ bị trừ ${duplicateCount} lần.`,
            idleText: 'Bấm “Đặt hàng” liên tiếp nhiều lần khi chưa bật vá.',
          },
          {
            id: 'validation-bypass',
            icon: <ShieldX className="h-3.5 w-3.5" />,
            label: 'Client-Only Validation Bypass',
            found: validationBypassExploited,
            patched: fixServerValidation,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: rating=-999 + stored XSS ghi thẳng vào DB — aggregate điểm số tính ra NaN.',
            idleText: 'Bấm curl POST để tấn công thẳng endpoint, bỏ qua toàn bộ UI.',
          },
          {
            id: 'parse-landmine',
            icon: <Bomb className="h-3.5 w-3.5" />,
            label: 'parse() Landmine',
            found: parseLandmineExploited,
            patched: fixSafeParse,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: ZodError thoát tự do — error boundary trắng trang, draft của user mất sạch.',
            idleText: 'Dán dữ liệu hỏng rồi lưu settings khi chưa bật vá.',
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
                  Đã vá: name contract / single-mode input / pending lock + idempotency /
                  shared schema re-validate / safeParse — vector hết đường khai thác.
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
              💀 <span className="font-bold">Blast Radius:</span> một form duy nhất gây
              năm lớp thiệt hại — đơn giao sai cam kết, coupon bốc hơi, thẻ khách trừ tiền
              N lần, stored XSS nhập cư vào DB và toàn trang trắng khi parse nổ. Không
              vector nào cần exploit tinh vi: chỉ cần form chạy “bình thường”.
            </p>
          ) : (
            <p className="text-foreground text-xs leading-relaxed">
              🛡️{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Defense Patch:
              </span>{' '}
              mọi control có name khớp schema, input giữ một chế độ suốt vòng đời, submit
              tiền bạc có pending lock + Idempotency-Key, cùng một Zod schema chạy ở cả
              hai đầu với safeParse tại biên giới — client validation chỉ còn là UX,
              security nằm ở server.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
