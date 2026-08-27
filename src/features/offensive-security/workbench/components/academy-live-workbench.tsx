'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Circle,
  Database,
  Globe,
  HelpCircle,
  Layers,
  Sparkles,
  Terminal,
  Trophy,
} from 'lucide-react';
import type {
  HttpRequestState,
  HttpResponseState,
  ObjectiveVerificationContext,
  SqlExecutionResult,
  TerminalExecutionResult,
  WorkbenchConfig,
  WorkbenchMode,
} from '../types';
import { TerminalView } from './terminal-view';
import { SqlLabView } from './sql-lab-view';
import { HttpRepeaterView } from './http-repeater-view';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AcademyLiveWorkbenchProps {
  config: WorkbenchConfig;
}

export const AcademyLiveWorkbench: React.FC<AcademyLiveWorkbenchProps> = ({ config }) => {
  const [activeMode, setActiveMode] = React.useState<WorkbenchMode>(config.mode);
  const [verificationContext, setVerificationContext] =
    React.useState<ObjectiveVerificationContext>({});
  const [completedObjectives, setCompletedObjectives] = React.useState<
    Record<string, boolean>
  >({});
  const [showHint, setShowHint] = React.useState<Record<string, boolean>>({});

  // Reset state when lesson config changes
  React.useEffect(() => {
    setActiveMode(config.mode);
    setVerificationContext({});
    setCompletedObjectives({});
    setShowHint({});
  }, [config]);

  // Check objective completion whenever context updates
  React.useEffect(() => {
    config.objectives.forEach((obj) => {
      if (!completedObjectives[obj.id] && obj.isComplete(verificationContext)) {
        setCompletedObjectives((prev) => ({ ...prev, [obj.id]: true }));
      }
    });
  }, [config.objectives, verificationContext, completedObjectives]);

  const handleTerminalExecution = (
    result: TerminalExecutionResult,
    command: string
  ): void => {
    setVerificationContext((prev) => ({
      ...prev,
      vfs: result.updatedState,
      lastCommand: command,
      lastResult: result,
    }));
  };

  const handleSqlExecution = (result: SqlExecutionResult, query: string): void => {
    setVerificationContext((prev) => ({
      ...prev,
      lastCommand: query,
      lastSqlResult: result,
    }));
  };

  const handleHttpExecution = (
    result: HttpResponseState,
    req: HttpRequestState
  ): void => {
    setVerificationContext((prev) => ({
      ...prev,
      lastHttpRes: result,
      lastHttpReq: req,
    }));
  };

  const totalObjectives = config.objectives.length;
  const completedCount = Object.values(completedObjectives).filter(Boolean).length;
  const progressPercent =
    totalObjectives > 0 ? Math.round((completedCount / totalObjectives) * 100) : 0;
  const isAllCompleted = totalObjectives > 0 && completedCount === totalObjectives;

  return (
    <div className="space-y-6">
      {/* Workbench Header & Mode Selector */}
      <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <h3 className="text-foreground text-lg font-bold tracking-tight">
              {config.title}
            </h3>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{config.summary}</p>
        </div>

        {/* Mode Selector Tabs */}
        {config.availableModes && config.availableModes.length > 1 && (
          <div className="border-border/80 bg-secondary/30 flex items-center gap-1.5 rounded-xl border p-1">
            {config.availableModes.includes('terminal') && (
              <button
                type="button"
                onClick={() => setActiveMode('terminal')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'terminal'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                Terminal
              </button>
            )}
            {config.availableModes.includes('sql') && (
              <button
                type="button"
                onClick={() => setActiveMode('sql')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'sql'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                SQL Lab (AST)
              </button>
            )}
            {config.availableModes.includes('http') && (
              <button
                type="button"
                onClick={() => setActiveMode('http')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'http'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                HTTP Repeater
              </button>
            )}
            {config.availableModes.includes('packet') && (
              <button
                type="button"
                onClick={() => setActiveMode('packet')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'packet'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Packet Inspector
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Interactive Tool Screen */}
      <div className="space-y-4">
        {activeMode === 'terminal' && (
          <TerminalView config={config} onExecution={handleTerminalExecution} />
        )}
        {activeMode === 'sql' && (
          <SqlLabView config={config} onExecution={handleSqlExecution} />
        )}
        {(activeMode === 'http' || activeMode === 'packet') && (
          <HttpRepeaterView config={config} onExecution={handleHttpExecution} />
        )}
      </div>

      {/* Objective Checklist Card & Progress */}
      <Card className="border-border/80 bg-card space-y-4 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h4 className="text-foreground text-sm font-bold">
              Mục tiêu Thực chiến (Challenge Objectives)
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-xs">
              {completedCount}/{totalObjectives} ({progressPercent}%)
            </span>
            {isAllCompleted && (
              <Badge className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Hoàn thành Lab
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Objective List */}
        <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
          {config.objectives.map((obj, idx) => {
            const isDone = !!completedObjectives[obj.id];
            const isHintOpen = !!showHint[obj.id];

            return (
              <div
                key={obj.id}
                className={`rounded-xl border p-3.5 transition-all ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                    : 'border-border/60 bg-secondary/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="text-muted-foreground/60 mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          isDone
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-foreground'
                        }`}
                      >
                        {idx + 1}. {obj.title}
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                        {obj.description}
                      </p>
                    </div>
                  </div>

                  {obj.hint && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowHint((prev) => ({ ...prev, [obj.id]: !prev[obj.id] }))
                      }
                      className="text-muted-foreground hover:text-primary p-1 transition-colors"
                      title="Xem gợi ý"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Hint Drawer */}
                {isHintOpen && obj.hint && (
                  <div className="border-border/40 mt-2.5 rounded-lg border-t bg-amber-500/5 p-2 pt-2 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                    💡 Gợi ý: {obj.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
