'use client';

import * as React from 'react';
import { XCircle, CheckCircle2, Copy, Check, Split } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';

export interface CodeDiffProps {
  title?: string;
  language?: string;
  antiPattern: {
    title?: string;
    code: string;
    explanation?: string;
  };
  seniorSolution: {
    title?: string;
    code: string;
    explanation?: string;
  };
  className?: string;
}

export function CodeDiffViewer({
  title = 'So sánh Đối chiếu: Anti-Pattern vs Senior Solution',
  language = 'typescript',
  antiPattern,
  seniorSolution,
  className = '',
}: CodeDiffProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopySolution = async () => {
    try {
      await navigator.clipboard.writeText(seniorSolution.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`rounded-xl border border-blue-500/20 bg-slate-50/50 p-3.5 space-y-3 dark:border-blue-500/15 dark:bg-slate-950/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Split className="h-4 w-4 text-blue-500" />
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={handleCopySolution}
          title="Sao chép Senior Solution"
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Đã chép giải pháp</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Solution</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Anti-Pattern Column */}
        <div className="rounded-lg border border-rose-500/30 bg-rose-50/50 p-2.5 space-y-2 dark:border-rose-500/20 dark:bg-rose-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{antiPattern.title || 'Lỗi thường gặp / Anti-Pattern'}</span>
          </div>

          <div className="rounded-md overflow-hidden border border-rose-500/20">
            <CodeBlock code={antiPattern.code} language={language} showCopyButton={false} />
          </div>

          {antiPattern.explanation && (
            <p className="text-[11px] text-rose-900/90 dark:text-rose-300/90 leading-relaxed italic">
              ⚠️ {antiPattern.explanation}
            </p>
          )}
        </div>

        {/* Senior Solution Column */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 p-2.5 space-y-2 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{seniorSolution.title || 'Giải pháp chuẩn Senior (Production-Ready)'}</span>
          </div>

          <div className="rounded-md overflow-hidden border border-emerald-500/20">
            <CodeBlock code={seniorSolution.code} language={language} showCopyButton={false} />
          </div>

          {seniorSolution.explanation && (
            <p className="text-[11px] text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed font-medium">
              💡 {seniorSolution.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
