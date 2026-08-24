'use client';

import * as React from 'react';
import {
  Mail,
  KeyRound,
  Cake,
  Globe,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Terminal,
  Braces,
  FlaskConical,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';

type FieldKey = 'email' | 'password' | 'age' | 'website';
type FieldStatus = 'idle' | 'valid' | 'invalid';

const FIELD_ORDER: FieldKey[] = ['email', 'password', 'age', 'website'];
const IDLE_STATUSES: Record<FieldKey, FieldStatus> = {
  email: 'idle',
  password: 'idle',
  age: 'idle',
  website: 'idle',
};

const FIELD_META: Record<FieldKey, { icon: LucideIcon; placeholder: string }> = {
  email: { icon: Mail, placeholder: 'you@example.com' },
  password: { icon: KeyRound, placeholder: 'tối thiểu 8 ký tự' },
  age: { icon: Cake, placeholder: 'ví dụ: 28' },
  website: { icon: Globe, placeholder: 'https://... (optional)' },
};

// Payload "valid" cố tình chứa khoảng trắng + chữ hoa để thấy rõ trim/lowercase
const VALID_PAYLOAD: Record<FieldKey, string> = {
  email: '   Linh.NGUYEN@Example.COM   ',
  password: 'supersecret123',
  age: '28',
  website: 'https://example.com/portfolio',
};

const DIRTY_PRESETS: Array<{
  tone: 'bad' | 'good';
  label: string;
  patch: Partial<Record<FieldKey, string>>;
}> = [
  { tone: 'bad', label: '📧 empty email', patch: { email: '' } },
  { tone: 'bad', label: "🔑 weak password ('abc')", patch: { password: 'abc' } },
  { tone: 'bad', label: "🎂 age='abc' (string)", patch: { age: 'abc' } },
  { tone: 'bad', label: "🌐 website='not-a-url'", patch: { website: 'not-a-url' } },
  {
    tone: 'bad',
    label: '💀 all-broken combo',
    patch: { email: 'khong-hople', password: '123', age: '-5', website: 'not-a-url' },
  },
  { tone: 'good', label: '✅ valid payload', patch: { ...VALID_PAYLOAD } },
];

// Mô phỏng y hệt message của Zod cho từng rule
function validateField(key: FieldKey, raw: string): { ok: boolean; message: string } {
  const v = raw.trim();
  switch (key) {
    case 'email':
      if (!v) return { ok: false, message: 'Required' };
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        ? { ok: true, message: 'email hợp lệ ✓' }
        : { ok: false, message: 'Invalid email' };
    case 'password':
      return v.length < 8
        ? { ok: false, message: 'String must contain at least 8 character(s)' }
        : { ok: true, message: `đủ ${v.length} ký tự ✓` };
    case 'age': {
      if (!v) return { ok: false, message: 'Required' };
      if (!/^-?\d+$/.test(v)) return { ok: false, message: 'Expected number, received string' };
      return Number(v) > 0 && Number(v) < 130
        ? { ok: true, message: `coerce → ${Number(v)} ✓` }
        : { ok: false, message: 'Number must be greater than 0' };
    }
    case 'website': {
      if (!v) return { ok: true, message: 'optional — rỗng vẫn pass ✓' };
      try {
        new URL(v);
        return { ok: true, message: 'url hợp lệ ✓' };
      } catch {
        return { ok: false, message: 'Invalid url' };
      }
    }
  }
}

// Placeholder hash deterministic (demo-only — production phải hash ở server)
function fakeHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0');
}

interface TransformRow {
  key: FieldKey;
  before: string;
  after: string;
  note: string;
}

function buildTransformOutput(form: Record<FieldKey, string>): TransformRow[] {
  return [
    {
      key: 'email',
      before: form.email,
      after: form.email.trim().toLowerCase(),
      note: '.trim().toLowerCase()',
    },
    {
      key: 'age',
      before: `"${form.age}" (string)`,
      after: `${Number(form.age.trim())} (number)`,
      note: 'z.coerce.number()',
    },
    {
      key: 'password',
      before: `${form.password.length} ký tự plaintext`,
      after: `sha256:${fakeHash(form.password)}…`,
      note: 'hash trước khi lưu, không giữ plaintext',
    },
    {
      key: 'website',
      before: form.website || '(empty)',
      after: form.website.trim(),
      note: '.trim()',
    },
  ];
}

const ZOD_SCHEMA_SNIPPET = `import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase()
    .min(1, 'Required')
    .email('Invalid email'),
  password: z.string().min(8, 'String must contain at least 8 character(s)'),
  age: z.coerce.number().int().positive('Number must be greater than 0'),
  website: z.union([z.literal(''), z.string().trim().url('Invalid url')]),
});

export type SignupInput = z.infer<typeof signupSchema>;

// Trong Server Action / route handler:
const parsed = signupSchema.safeParse(rawPayload);
if (!parsed.success) {
  return { ok: false, issues: parsed.error.flatten().fieldErrors };
}
return { ok: true, data: parsed.data }; // đã trim/lowercase/coerce sẵn`;

export function SchemaValidationRange() {
  const [form, setForm] = React.useState<Record<FieldKey, string>>({
    email: '',
    password: '',
    age: '',
    website: '',
  });
  const [statuses, setStatuses] = React.useState<Record<FieldKey, FieldStatus>>(IDLE_STATUSES);
  const [messages, setMessages] = React.useState<Partial<Record<FieldKey, string>>>({});
  const [resolvedCount, setResolvedCount] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [transformOut, setTransformOut] = React.useState<TransformRow[] | null>(null);

  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const runTokenRef = React.useRef(0);

  // Dọn sạch timer khi unmount — cascade không được "sống" lâu hơn component
  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const applyPreset = (patch: Partial<Record<FieldKey, string>>) => {
    clearTimers();
    runTokenRef.current += 1;
    setIsRunning(false);
    // Base hợp lệ để mỗi preset chỉ "gãy" đúng điểm nó nhắm tới
    setForm({
      email: 'user@mail.com',
      password: 'Str0ngPass!9x',
      age: '28',
      website: 'https://example.com',
      ...patch,
    });
    setStatuses(IDLE_STATUSES);
    setMessages({});
    setResolvedCount(0);
    setTransformOut(null);
  };

  const runSafeParse = () => {
    clearTimers();
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;

    setStatuses(IDLE_STATUSES);
    setMessages({});
    setResolvedCount(0);
    setTransformOut(null);
    setIsRunning(true);

    // Cascade: mỗi ~350ms một field "được giải quyết" như Zod duyệt tuần tự
    FIELD_ORDER.forEach((key, idx) => {
      const t = setTimeout(() => {
        if (runTokenRef.current !== token) return; // một lượt chạy mới đã đè lên
        const verdict = validateField(key, form[key]);
        setStatuses((prev) => ({ ...prev, [key]: verdict.ok ? 'valid' : 'invalid' }));
        setMessages((prev) => ({ ...prev, [key]: verdict.message }));
        setResolvedCount(idx + 1);
        if (idx === FIELD_ORDER.length - 1) {
          setIsRunning(false);
          const allOk = FIELD_ORDER.every((k) => validateField(k, form[k]).ok);
          if (allOk) setTransformOut(buildTransformOutput(form));
        }
      }, 350 * (idx + 1));
      timersRef.current.push(t);
    });
  };

  const resetRange = () => {
    clearTimers();
    runTokenRef.current += 1;
    setForm({ email: '', password: '', age: '', website: '' });
    setStatuses(IDLE_STATUSES);
    setMessages({});
    setResolvedCount(0);
    setTransformOut(null);
    setIsRunning(false);
  };

  const errorCount = FIELD_ORDER.filter((k) => statuses[k] === 'invalid').length;
  const passCount = FIELD_ORDER.filter((k) => statuses[k] === 'valid').length;
  const allValid = passCount === FIELD_ORDER.length;
  const hasRun = resolvedCount > 0;

  return (
    <div className="space-y-4">
      <Card className="glass-card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FlaskConical className="h-4 w-4 text-primary" />
            Range 02 · Schema Validation Range
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              zod · safeParse()
            </Badge>
            <Button variant="ghost" size="sm" onClick={resetRange} className="gap-1 text-[11px]">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        {/* Dirty-data presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Đổ dirty-data vào payload
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DIRTY_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.patch)}
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] transition-colors ${
                  p.tone === 'good'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                    : 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payload editor */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FIELD_ORDER.map((key) => {
            const meta = FIELD_META[key];
            const Icon = meta.icon;
            return (
              <div key={key} className="space-y-1">
                <label className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {key}
                </label>
                <Input
                  value={form[key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={meta.placeholder}
                  className="font-mono text-xs"
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="glass-card space-y-3 p-5">
        <Button
          onClick={runSafeParse}
          disabled={isRunning}
          className="w-full gap-2 text-xs font-bold"
        >
          <Play className="h-3.5 w-3.5" />
          ▶ Chạy safeParse()
        </Button>

        <Progress value={(resolvedCount / FIELD_ORDER.length) * 100} className="h-2" />

        {/* Cascade kết quả từng field */}
        <div className="space-y-1.5">
          {FIELD_ORDER.map((key) => {
            const st = statuses[key];
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                  st === 'invalid'
                    ? 'border-destructive/40 bg-destructive/5'
                    : st === 'valid'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/60 bg-secondary/20'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {st === 'valid' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : st === 'invalid' ? (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  ) : (
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-dashed border-muted-foreground/50" />
                  )}
                  <span className="truncate font-mono text-[11px] font-bold text-foreground">
                    {key}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`truncate font-mono text-[11px] ${
                      st === 'invalid'
                        ? 'text-destructive'
                        : st === 'valid'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                    } ${isRunning && st === 'idle' ? 'animate-pulse' : ''}`}
                  >
                    {messages[key] ?? (isRunning ? 'đang quét…' : 'chờ safeParse()')}
                  </span>
                  <Badge
                    variant={
                      st === 'valid' ? 'success' : st === 'invalid' ? 'destructive' : 'outline'
                    }
                    className="shrink-0 font-mono text-[9px]"
                  >
                    {st === 'valid' ? '✓ PASS' : st === 'invalid' ? '✗ FAIL' : 'IDLE'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary line */}
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
          <span
            className={`font-mono text-[11px] font-bold ${
              errorCount > 0
                ? 'text-destructive'
                : allValid
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground'
            }`}
          >
            {errorCount} lỗi · {passCount}/{FIELD_ORDER.length} field pass
          </span>
          <Badge
            variant={
              allValid && hasRun ? 'success' : errorCount > 0 ? 'destructive' : 'outline'
            }
            className="font-mono text-[10px]"
          >
            {allValid && hasRun
              ? '🛡️ payload an toàn'
              : errorCount > 0
                ? '⛔ chặn ngay tại cổng'
                : '⏳ chưa chạy'}
          </Badge>
        </div>

        {/* Transform output khi tất cả PASS */}
        {transformOut && (
          <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Braces className="h-3.5 w-3.5" />
              transform output — result.data (pipeline đã chạy)
            </p>
            {transformOut.map((row) => (
              <div
                key={row.key}
                className="rounded-lg border border-emerald-500/20 bg-background/60 p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-foreground">{row.key}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{row.note}</span>
                </div>
                <p className="truncate font-mono text-[11px]">
                  <span className="text-muted-foreground">{row.before}</span>{' '}
                  <span className="text-emerald-500">→</span>{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.after}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-card space-y-3 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Terminal className="h-4 w-4 text-primary" />
          Schema thật tương ứng — demo vừa mô phỏng chính xác cái này
        </h3>
        <CodeBlock code={ZOD_SCHEMA_SNIPPET} language="tsx" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Mỗi chip PASS/FAIL ánh xạ 1:1 sang một rule của Zod: message hiển thị chính là message
          trong <code className="font-mono text-[10px]">parsed.error.flatten().fieldErrors</code>,
          còn panel transform chính là{' '}
          <code className="font-mono text-[10px]">result.data</code> sau các side-effect{' '}
          <code className="font-mono text-[10px]">.trim().toLowerCase()</code>,{' '}
          <code className="font-mono text-[10px]">z.coerce.number()</code> và{' '}
          <code className="font-mono text-[10px]">.transform()</code>.
        </p>
      </Card>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <FlaskConical className="mt-0.5 h-3 w-3 shrink-0" />
        Toàn bộ mô phỏng chạy client-side an toàn — không cài zod, không gọi server; mọi message
        và pipeline đều được tái hiện thủ công đúng tinh thần schema-first validation.
      </p>
    </div>
  );
}
