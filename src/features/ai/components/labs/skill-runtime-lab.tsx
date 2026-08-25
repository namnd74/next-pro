'use client';

import * as React from 'react';
import {
  BookOpenText,
  Box,
  CirclePlay,
  FileCode2,
  FileText,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RUNTIME_STEPS = [
  {
    title: 'Catalog routing',
    actor: 'Harness + model',
    detail:
      'Harness đưa name, description và path vào danh sách skill. Model so khớp task; chưa đọc toàn bộ SKILL.md.',
    impact: 'Context nhỏ · chưa có side effect',
  },
  {
    title: 'Đọc SKILL.md',
    actor: 'Model qua file tool',
    detail:
      'Sau khi activation, toàn bộ instruction chính đi vào context và điều hướng workflow.',
    impact: 'Context tăng · vẫn chưa chạy code',
  },
  {
    title: 'Mở reference cần thiết',
    actor: 'Model theo decision branch',
    detail:
      'Chỉ file được SKILL.md chỉ điểm cho nhánh hiện tại mới nên được đọc. Nội dung reference trở thành evidence trong context.',
    impact: 'Context tăng có điều kiện · không side effect',
  },
  {
    title: 'Đề xuất chạy script',
    actor: 'Model tạo tool call',
    detail:
      'Dòng lệnh không tự chạy vì file nằm trong scripts/. Model phải phát ra yêu cầu thực thi với command, arguments và working directory.',
    impact: 'Ý định hành động · chưa được cấp quyền',
  },
  {
    title: 'Harness kiểm soát execution',
    actor: 'Sandbox + approval policy',
    detail:
      'Runtime kiểm tra quyền, network và write scope rồi mới tạo process. Skill text không thể tự cấp thêm quyền cho script.',
    impact: 'Side effect chỉ xuất hiện nếu được cho phép',
  },
  {
    title: 'Observation quay lại model',
    actor: 'stdout · stderr · exit code',
    detail:
      'Kết quả process trở thành observation. Model diễn giải evidence, xử lý failure và xác minh artifact trước khi trả lời.',
    impact: 'Fact mới vào context · workflow tiếp tục',
  },
] as const;

const PACKAGE_FILES = [
  {
    id: 'skill',
    path: 'SKILL.md',
    kind: 'Portable core · required',
    reader: 'Mọi host hỗ trợ Agent Skills',
    when: 'Được đọc đầy đủ sau khi skill được chọn.',
    context:
      'Frontmatter name/description phục vụ discovery; phần body định nghĩa workflow, input, output và done-condition.',
    effect:
      'Chỉ thay đổi quyết định của model. Bản thân Markdown không chạy command và không cấp permission.',
    failure: 'Description mơ hồ gây route sai; body mơ hồ gây workflow thiếu bước.',
    icon: FileText,
  },
  {
    id: 'script',
    path: 'scripts/inspect_bundle.py',
    kind: 'Executable · optional',
    reader: 'Shell/Python process do harness khởi tạo',
    when: 'Chỉ khi model tạo tool call và runtime cho phép.',
    context:
      'Source code không nhất thiết phải được nhét toàn bộ vào prompt; output của script mới quay lại context dưới dạng observation.',
    effect:
      'Có thể đọc/ghi file hoặc gọi mạng trong đúng capability mà sandbox và approval cho phép.',
    failure:
      'Input contract, cwd, timeout, exit code hoặc write scope không rõ sẽ tạo kết quả khó lặp lại và khó phục hồi.',
    icon: TerminalSquare,
  },
  {
    id: 'reference',
    path: 'references/budget-policy.md',
    kind: 'Knowledge · optional',
    reader: 'Model qua file/resource tool',
    when: 'Đọc theo điều kiện cụ thể trong SKILL.md.',
    context:
      'Toàn bộ phần đã đọc chiếm context. Reference quá rộng hoặc lỗi thời làm tăng nhiễu và token cost.',
    effect: 'Không tự tạo side effect; nó thay đổi evidence mà model dùng để quyết định.',
    failure:
      'Pointer chung chung khiến model đọc thừa, đọc thiếu hoặc đi theo chuỗi link quá sâu.',
    icon: BookOpenText,
  },
  {
    id: 'asset',
    path: 'assets/report-template.md',
    kind: 'Output material · optional',
    reader: 'Workflow sao chép, render hoặc điền dữ liệu',
    when: 'Khi cần tạo artifact theo template.',
    context:
      'Asset không nên mặc định được coi là instruction. Chỉ đọc phần cần thiết để tạo output.',
    effect: 'Có thể trở thành file đầu ra sau một tool call ghi file.',
    failure:
      'Trộn instruction vào asset làm boundary mờ và tăng rủi ro đọc nội dung không tin cậy như lệnh.',
    icon: Box,
  },
  {
    id: 'openai',
    path: 'agents/openai.yaml',
    kind: 'OpenAI extension · optional',
    reader: 'ChatGPT/Codex host',
    when: 'Khi host OpenAI index hoặc hiển thị skill.',
    context:
      'Cấu hình display metadata, default prompt, implicit-invocation policy và tool dependencies; không thay thế body SKILL.md.',
    effect:
      'Có thể đổi cách skill xuất hiện, có được implicit invoke hay không và dependency nào host cần chuẩn bị.',
    failure:
      'Đặt workflow cốt lõi ở đây làm skill mất tính portable; host khác có thể bỏ qua toàn bộ file.',
    icon: Sparkles,
  },
] as const;

export function SkillRuntimeLab() {
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState('skill');

  React.useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= RUNTIME_STEPS.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1500);

    return () => window.clearInterval(timer);
  }, [playing]);

  const active = RUNTIME_STEPS[step];
  const file = PACKAGE_FILES.find((item) => item.id === selectedFile) ?? PACKAGE_FILES[0];

  const replay = () => {
    setStep(0);
    setPlaying(true);
  };

  return (
    <div className="space-y-5">
      <section className="border-border/60 bg-background/75 space-y-5 rounded-2xl border p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-widest text-violet-500 uppercase">
              Animated runtime trace
            </p>
            <h3 className="text-foreground mt-1 text-base font-extrabold">
              Từ prompt đến khi script thực sự chạy
            </h3>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed">
              Đây là mental model của agent loop: instruction tạo quyết định, còn harness
              mới tạo execution và kiểm soát side effect.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? 'Tạm dừng animation' : 'Phát animation'}
            >
              {playing ? (
                <Pause className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {playing ? 'Pause' : 'Play'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={replay}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Replay
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="bg-muted absolute top-5 right-5 left-5 hidden h-1 rounded-full sm:block" />
          <div
            className="absolute top-5 left-5 hidden h-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-[width] duration-500 motion-reduce:transition-none sm:block"
            style={{
              width:
                step === 0
                  ? '0px'
                  : `calc(${(step / (RUNTIME_STEPS.length - 1)) * 100}% - 2.5rem)`,
            }}
          />
          <ol className="relative grid gap-2 sm:grid-cols-6">
            {RUNTIME_STEPS.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setStep(index);
                  }}
                  className="group flex w-full cursor-pointer items-center gap-3 text-left sm:flex-col sm:text-center"
                  aria-current={index === step ? 'step' : undefined}
                >
                  <span
                    className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold transition-all duration-300 motion-reduce:transition-none',
                      index <= step
                        ? 'border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                        : 'border-border bg-background text-muted-foreground group-hover:border-violet-500/50'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] leading-tight font-semibold',
                      index === step ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-3 rounded-xl bg-slate-950 p-4 text-slate-100 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <CirclePlay className="h-6 w-6 text-cyan-300" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-sm">{active.title}</strong>
              <span className="font-mono text-[10px] text-violet-300">
                {active.actor}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{active.detail}</p>
          </div>
          <Badge variant="info" className="w-fit">
            {active.impact}
          </Badge>
        </div>
      </section>

      <section className="border-border/60 bg-background/75 grid gap-4 rounded-2xl border p-4 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-widest text-cyan-500 uppercase">
            Clickable package anatomy
          </p>
          <h3 className="text-foreground mt-1 text-base font-extrabold">
            File nào được ai đọc, vào lúc nào?
          </h3>
          <div className="mt-4 space-y-1 font-mono text-xs">
            <div className="text-muted-foreground pb-1">frontend-review/</div>
            {PACKAGE_FILES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFile(item.id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                    selectedFile === item.id
                      ? 'bg-violet-500/12 text-violet-600 dark:text-violet-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  aria-pressed={selectedFile === item.id}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-secondary/45 rounded-xl p-4" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <FileCode2 className="h-4 w-4 text-violet-500" aria-hidden="true" />
            <code className="text-sm font-bold">{file.path}</code>
            <Badge variant={file.id === 'openai' ? 'warning' : 'secondary'}>
              {file.kind}
            </Badge>
          </div>
          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
            <Detail label="Ai đọc?" value={file.reader} />
            <Detail label="Khi nào?" value={file.when} />
            <Detail label="Ảnh hưởng context" value={file.context} />
            <Detail label="Ảnh hưởng side effect" value={file.effect} />
          </dl>
          <div className="mt-3 flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 p-3 text-xs leading-relaxed">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            <p>
              <strong>Failure mode:</strong> {file.failure}
            </p>
          </div>
          {file.id === 'openai' && (
            <div className="mt-3 space-y-2 rounded-lg border border-violet-500/25 bg-violet-500/8 p-3 text-xs leading-relaxed">
              <p className="font-bold text-violet-700 dark:text-violet-300">
                Vì sao chỉ có <code>openai.yaml</code>?
              </p>
              <p>
                Vì package mẫu này chỉ khai báo extension cho host OpenAI. Điều đó không
                có nghĩa <code>agents/</code> bắt buộc phải chứa một file cho mọi hãng,
                cũng không chứng minh <code>claude.yaml</code> hay{' '}
                <code>google.yaml</code>
                là tên hợp lệ.
              </p>
              <p>
                Host khác vẫn có thể dùng portable core <code>SKILL.md</code>, rồi đọc
                manifest hoặc convention riêng do tài liệu của chính host đó định nghĩa.
                Nếu không hiểu <code>agents/openai.yaml</code>, host nên bỏ qua extension
                này; workflow cốt lõi vẫn phải hoạt động mà không phụ thuộc vào nó.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase">
        {label}
      </dt>
      <dd className="text-foreground leading-relaxed">{value}</dd>
    </div>
  );
}
