'use client';

import * as React from 'react';
import { Gauge, CheckCircle2, AlertCircle } from 'lucide-react';

export interface BenchmarkMetric {
  label: string;
  value: number; // 0 - 100 percentage
  displayValue?: string; // e.g. '< 5ms', 'High', '100k+ rps'
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
}

export interface BenchmarkOption {
  name: string;
  badge?: string;
  isRecommended?: boolean;
  metrics: BenchmarkMetric[];
  pros?: string[];
  cons?: string[];
}

export interface BenchmarkMatrixProps {
  title?: string;
  caption?: string;
  options: BenchmarkOption[];
  className?: string;
}

function getBarColorClass(color?: BenchmarkMetric['color'], value = 50) {
  if (color === 'emerald') return 'bg-emerald-500';
  if (color === 'rose') return 'bg-rose-500';
  if (color === 'amber') return 'bg-amber-500';
  if (color === 'purple') return 'bg-purple-500';
  if (color === 'blue') return 'bg-blue-500';

  if (value >= 75) return 'bg-emerald-500';
  if (value >= 45) return 'bg-blue-500';
  return 'bg-amber-500';
}

export function BenchmarkMatrix({
  title = 'So sánh định lượng & Trade-off Benchmark',
  caption,
  options,
  className = '',
}: BenchmarkMatrixProps) {
  if (!options || options.length === 0) return null;

  return (
    <div
      className={`rounded-xl border border-blue-500/20 bg-slate-50/50 p-3.5 space-y-3 dark:border-blue-500/15 dark:bg-slate-950/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Gauge className="h-4 w-4 text-blue-500" />
          <span>{title}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {options.length} Phương án so sánh
        </span>
      </div>

      {/* Grid of Options */}
      <div
        className={`grid gap-2.5 ${
          options.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : options.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {options.map((opt) => (
          <div
            key={opt.name}
            className={`rounded-lg border p-3 space-y-2.5 transition ${
              opt.isRecommended
                ? 'border-blue-500/40 bg-blue-500/5 dark:bg-blue-500/10 shadow-xs'
                : 'border-border/60 bg-card hover:border-border'
            }`}
          >
            {/* Option Name & Badge */}
            <div className="flex items-center justify-between gap-1.5">
              <h4 className="font-bold text-xs text-foreground">{opt.name}</h4>
              {opt.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    opt.isRecommended
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </div>

            {/* Metrics Bars */}
            <div className="space-y-2">
              {opt.metrics.map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold text-foreground">
                      {m.displayValue || `${m.value}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getBarColorClass(
                        m.color,
                        m.value
                      )}`}
                      style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pros / Cons list if provided */}
            {(opt.pros || opt.cons) && (
              <div className="pt-2 border-t border-border/40 space-y-1.5 text-[11px]">
                {opt.pros &&
                  opt.pros.map((pro, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{pro}</span>
                    </div>
                  ))}
                {opt.cons &&
                  opt.cons.map((con, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{con}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {caption && (
        <div className="pt-1 text-[11px] text-muted-foreground italic border-t border-border/40">
          💡 {caption}
        </div>
      )}
    </div>
  );
}
