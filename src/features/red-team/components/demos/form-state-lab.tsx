'use client';

import * as React from 'react';
import {
  Zap,
  EyeOff,
  MousePointerClick,
  RotateCcw,
  Terminal,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_LOG_LINES = 6;

// Đúng nguyên văn cảnh báo của React khi `checked` thiếu `onChange`
const REACT_CHECKED_WARNING =
  'Warning: You provided a `checked` prop to a form field without an `onChange` handler. ' +
  'This will render a read-only field. If the field should be mutable use `defaultChecked`. ' +
  'Otherwise, set either `onChange` or `readOnly`.';

interface SubmitSummary {
  ctrlName: string;
  ctrlEmail: string;
  uncName: string;
  uncEmail: string;
}

export function FormStateLab() {
  // ─── Side A: Controlled — React sở hữu state ────────────────────────
  const [ctrlName, setCtrlName] = React.useState('');
  const [ctrlEmail, setCtrlEmail] = React.useState('');
  const [ctrlRenders, setCtrlRenders] = React.useState(0);
  const [ctrlLog, setCtrlLog] = React.useState<string[]>([]);

  // ─── Side B: Uncontrolled — DOM tự quản lý, đọc qua ref ────────────
  const uncNameRef = React.useRef<HTMLInputElement>(null);
  const uncEmailRef = React.useRef<HTMLInputElement>(null);
  const uncLogBoxRef = React.useRef<HTMLDivElement>(null);
  const uncKeysRef = React.useRef(0);
  const uncKeysElRef = React.useRef<HTMLSpanElement>(null);

  const [summary, setSummary] = React.useState<SubmitSummary | null>(null);

  // ─── Bug kinh điển: checked mà không có onChange ───────────────────
  const [checkboxMode, setCheckboxMode] = React.useState<'broken' | 'fixed'>('broken');
  const [agree, setAgree] = React.useState(false);

  const handleCtrlChange = (field: 'name' | 'email', value: string) => {
    if (field === 'name') setCtrlName(value);
    else setCtrlEmail(value);
    // Hai setState được batch trong cùng event ⇒ đúng 1 re-render mỗi keystroke
    setCtrlRenders((r) => r + 1);
    setCtrlLog((prev) => [
      ...prev.slice(-(MAX_LOG_LINES - 1)),
      `$ onChange("${field}") → setState → re-render #${ctrlRenders + 1}`,
    ]);
  };

  // Ghi log thẳng vào DOM — cố tình KHÔNG dùng state để minh họa rằng
  // React hoàn toàn không hay biết những keystroke này.
  const pushUncLog = (line: string) => {
    const box = uncLogBoxRef.current;
    if (!box) return;
    const row = document.createElement('div');
    row.textContent = line;
    row.className = 'text-slate-300';
    box.appendChild(row);
    // Giữ tối đa MAX_LOG_LINES dòng động (dòng đầu tiên là caption tĩnh)
    while (box.children.length > MAX_LOG_LINES && box.children[1]) {
      box.removeChild(box.children[1]);
    }
    box.scrollTop = box.scrollHeight;
  };

  const handleUncInput = () => {
    uncKeysRef.current += 1;
    if (uncKeysElRef.current) uncKeysElRef.current.textContent = String(uncKeysRef.current);
    pushUncLog(
      `$ keystroke #${uncKeysRef.current} → value nằm trong DOM, không state nào thay đổi`
    );
  };

  const handleSubmitBoth = () => {
    setSummary({
      ctrlName: ctrlName.trim(),
      ctrlEmail: ctrlEmail.trim(),
      uncName: uncNameRef.current?.value ?? '',
      uncEmail: uncEmailRef.current?.value ?? '',
    });
  };

  const resetAll = () => {
    setCtrlName('');
    setCtrlEmail('');
    setCtrlRenders(0);
    setCtrlLog([]);
    setSummary(null);
    setAgree(false);
    setCheckboxMode('broken');
    if (uncNameRef.current) uncNameRef.current.value = '';
    if (uncEmailRef.current) uncEmailRef.current.value = '';
    uncKeysRef.current = 0;
    if (uncKeysElRef.current) uncKeysElRef.current.textContent = '0';
    if (uncLogBoxRef.current) uncLogBoxRef.current.innerHTML = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ════════ SIDE A: CONTROLLED ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Zap className="h-4 w-4 text-sky-500" />
              Side A · Controlled Form
            </h3>
            <Badge variant="info" className="font-mono text-[10px]">
              re-render: {ctrlRenders}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <code className="font-mono text-[11px] text-foreground">value</code> +{' '}
            <code className="font-mono text-[11px] text-foreground">onChange</code> bind chặt
            vào state — mỗi phím gõ đều đi một vòng qua React.
          </p>

          <Input
            value={ctrlName}
            onChange={(e) => handleCtrlChange('name', e.target.value)}
            placeholder="Tên (controlled)..."
            className="text-xs"
          />
          <Input
            value={ctrlEmail}
            onChange={(e) => handleCtrlChange('email', e.target.value)}
            placeholder="Email (controlled)..."
            className="text-xs"
          />

          <div className="min-h-[88px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
            {ctrlLog.length === 0 ? (
              <span className="text-slate-500">$ chờ keystroke đầu tiên…</span>
            ) : (
              ctrlLog.map((line, i) => (
                <div
                  key={i}
                  className={i === ctrlLog.length - 1 ? 'text-sky-300' : 'text-slate-400'}
                >
                  {line}
                </div>
              ))
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Counter tăng từng nhịp ⇒ validation tức thời, UI luôn đồng bộ với state.
          </p>
        </Card>

        {/* ════════ SIDE B: UNCONTROLLED ════════ */}
        <Card className="glass-card space-y-3 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <EyeOff className="h-4 w-4 text-amber-500" />
              Side B · Uncontrolled Form
            </h3>
            <Badge variant="warning" className="font-mono text-[10px]">
              re-render: 0
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <code className="font-mono text-[11px] text-foreground">defaultValue</code> +{' '}
            <code className="font-mono text-[11px] text-foreground">useRef</code> — DOM giữ
            value; React chỉ đọc lại lúc submit:{' '}
            <span
              ref={uncKeysElRef}
              className="font-mono font-bold text-amber-600 dark:text-amber-400"
            >
              0
            </span>{' '}
            ký tự đã gõ mà counter vẫn đứng yên.
          </p>

          <Input
            defaultValue=""
            onInput={handleUncInput}
            placeholder="Tên (uncontrolled)..."
            className="text-xs"
          />
          <Input
            defaultValue=""
            onInput={handleUncInput}
            placeholder="Email (uncontrolled)..."
            className="text-xs"
          />

          <div
            ref={uncLogBoxRef}
            className="min-h-[88px] space-y-0.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]"
          >
            <div className="text-slate-500">$ DOM tự quản lý state — React không hay biết</div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Log bên dưới được ghi thẳng vào DOM (như trình duyệt vẫn làm) — không một lần
            setState nào xảy ra khi gõ.
          </p>
        </Card>
      </div>

      {/* ════════ SUBMIT CẢ HAI ════════ */}
      <Card className="glass-card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <MousePointerClick className="h-4 w-4 text-primary" />
            Submit cả hai — data lấy từ đâu?
          </h3>
          <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1 text-[11px]">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <Button onClick={handleSubmitBoth} className="w-full gap-2 text-xs font-bold">
          📨 Submit cả hai form
        </Button>

        {summary && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
              <Badge variant="info" className="mb-1.5 font-mono text-[10px]">
                controlled · nguồn: React state
              </Badge>
              <p className="truncate font-mono text-[11px] text-foreground">
                name: “{summary.ctrlName || '—'}”
              </p>
              <p className="truncate font-mono text-[11px] text-foreground">
                email: “{summary.ctrlEmail || '—'}”
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <Badge variant="warning" className="mb-1.5 font-mono text-[10px]">
                uncontrolled · nguồn: ref.current.value
              </Badge>
              <p className="truncate font-mono text-[11px] text-foreground">
                name: “{summary.uncName || '—'}”
              </p>
              <p className="truncate font-mono text-[11px] text-foreground">
                email: “{summary.uncEmail || '—'}”
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Lightbulb className="h-3.5 w-3.5" />
            Insight
          </p>
          <ul className="mt-1 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>
              ✅ <span className="font-semibold text-foreground">Controlled</span>: React sở hữu
              state từng keystroke — validation tức thời, dễ sync UI (disable nút, hiện lỗi
              live, format tự động).
            </li>
            <li>
              ✅ <span className="font-semibold text-foreground">Uncontrolled</span>: DOM sở hữu
              giá trị — gần như 0 re-render khi gõ, code đơn giản; hợp với input tìm kiếm, file,
              hoặc form ngắn chỉ cần đọc 1 lần lúc submit.
            </li>
          </ul>
        </div>
      </Card>

      {/* ════════ CLASSIC BUG: checked WITHOUT onChange ════════ */}
      <Card className="glass-card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Bug kinh điển: <code className="font-mono text-xs">checked</code> mà thiếu{' '}
            <code className="font-mono text-xs">onChange</code>
          </h3>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/40 p-1">
            <button
              type="button"
              onClick={() => setCheckboxMode('broken')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                checkboxMode === 'broken'
                  ? 'bg-destructive/15 text-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ❌ broken
            </button>
            <button
              type="button"
              onClick={() => setCheckboxMode('fixed')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                checkboxMode === 'fixed'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✅ fixed
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
          {checkboxMode === 'broken' ? (
            // Cố tình vi phạm: checked là "controlled" nhưng chẳng ai lắng nghe sự kiện change
            <input type="checkbox" checked={false} className="h-4 w-4 accent-destructive" />
          ) : (
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          )}
          <span className="text-xs text-foreground">Tôi đồng ý với điều khoản bảo mật</span>
          {checkboxMode === 'fixed' && (
            <Badge variant={agree ? 'success' : 'outline'} className="ml-auto font-mono text-[10px]">
              agree = {String(agree)}
            </Badge>
          )}
        </div>

        {checkboxMode === 'broken' && (
          <>
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
              <div className="text-red-400">{REACT_CHECKED_WARNING}</div>
              <div className="text-slate-500">
                ↳ click thử checkbox phía trên — nó không bao giờ tick được.
              </div>
            </div>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
              Cảnh báo THẬT vừa được React ghi vào Console của bạn (chỉ log một lần). Vì{' '}
              <code className="mx-1 font-mono text-[10px]">checked</code> là prop có kiểm soát,
              thiếu handler thì field bị khóa cứng thành read-only.
            </p>
          </>
        )}

        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
          Ba lối thoát: thêm <code className="mx-1 font-mono text-[10px]">onChange</code> nếu cần
          tương tác; thêm <code className="mx-1 font-mono text-[10px]">readOnly</code> nếu cố ý
          hiển thị giá trị tĩnh; hoặc chuyển sang{' '}
          <code className="mx-1 font-mono text-[10px]">defaultChecked</code> cho DOM tự quản lý.
        </p>
      </Card>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <FlaskConical className="mt-0.5 h-3 w-3 shrink-0" />
        Toàn bộ mô phỏng chạy client-side an toàn — không submit tới server nào, dữ liệu chỉ
        sống trong state và DOM của tab này.
      </p>
    </div>
  );
}
