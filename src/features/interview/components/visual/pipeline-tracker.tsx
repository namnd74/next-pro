'use client';

import * as React from 'react';
import type { PipelineStage } from '../../types';
import { CheckCircle2, ChevronRight, ShieldCheck, Target, Layers } from 'lucide-react';

interface PipelineTrackerProps {
  stages: PipelineStage[];
  title?: string;
  className?: string;
}

export function PipelineTracker({ stages, title, className = '' }: PipelineTrackerProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!stages || stages.length === 0) return null;
  const currentStage = stages[activeIndex] ?? stages[0];

  return (
    <div
      className={`rounded-xl border border-blue-500/20 bg-slate-50/50 p-3.5 space-y-3 dark:border-blue-500/15 dark:bg-slate-950/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Layers className="h-4 w-4 text-blue-500" />
          <span>{title || 'Chuỗi tiến trình thực thi (Interactive Pipeline Tracker)'}</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          Bước {activeIndex + 1}/{stages.length}
        </span>
      </div>

      {/* Stages Horizontal Grid */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {stages.map((stage, idx) => {
          const isActive = idx === activeIndex;
          return (
            <React.Fragment key={stage.name}>
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group flex flex-1 min-w-[110px] cursor-pointer flex-col items-start rounded-lg border p-2 text-left transition ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/10 shadow-xs dark:bg-blue-500/15'
                    : 'border-border/60 bg-card hover:border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isActive ? 'text-blue-500' : 'text-muted-foreground'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <CheckCircle2
                    className={`h-3 w-3 ${
                      isActive ? 'text-blue-500' : 'text-muted-foreground/40 group-hover:text-muted-foreground'
                    }`}
                  />
                </div>
                <div
                  className={`mt-1 line-clamp-1 text-xs font-semibold ${
                    isActive ? 'text-foreground' : 'text-foreground/80'
                  }`}
                >
                  {stage.name}
                </div>
                {stage.tool && (
                  <span className="line-clamp-1 font-mono text-[10px] text-muted-foreground">
                    {stage.tool}
                  </span>
                )}
              </button>
              {idx < stages.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage Detail Inspector */}
      {currentStage && (
        <div className="rounded-lg border border-border/60 bg-background/80 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-blue-600 dark:text-blue-400">
              {currentStage.name} {currentStage.tool ? `(${currentStage.tool})` : ''}
            </h4>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed">
            {currentStage.description}
          </p>

          {(currentStage.metric || currentStage.rollback) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/40 text-[11px]">
              {currentStage.metric && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Target className="h-3.5 w-3.5 shrink-0" />
                  <span>{currentStage.metric}</span>
                </div>
              )}
              {currentStage.rollback && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>{currentStage.rollback}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
