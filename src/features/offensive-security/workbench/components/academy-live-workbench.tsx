'use client';

import * as React from 'react';
import {
  Activity,
  CheckCircle2,
  Circle,
  Database,
  Flame,
  Globe,
  HelpCircle,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import type {
  HttpRequestState,
  HttpResponseState,
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

export function AcademyLiveWorkbench({ config }: AcademyLiveWorkbenchProps) {
  const [activeMode, setActiveMode] = React.useState<WorkbenchMode>(config.mode);
  const [completedObjectiveIds, setCompletedObjectiveIds] = React.useState<string[]>([]);
  const [showHintId, setShowHintId] = React.useState<string | null>(null);

  // Check objectives dynamically
  const evaluateObjectives = (context: {
    lastCommand?: string;
    lastResult?: TerminalExecutionResult;
    lastSqlResult?: SqlExecutionResult;
    lastHttpRes?: HttpResponseState;
    lastHttpReq?: HttpRequestState;
  }) => {
    setCompletedObjectiveIds((prev) => {
      const updated = new Set(prev);
      config.objectives.forEach((obj) => {
        if (obj.isComplete({ ...context, vfs: context.lastResult?.updatedState })) {
          updated.add(obj.id);
        }
      });
      return Array.from(updated);
    });
  };

  const isAllComplete =
    config.objectives.length > 0 &&
    config.objectives.every((obj) => completedObjectiveIds.includes(obj.id));

  return (
    <section className="space-y-6" aria-label="Academy Live Workbench">
      {/* Header Banner */}
      <Card className="glass-card relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-foreground text-base font-extrabold">
                  {config.title}
                </h3>
                <p className="text-muted-foreground text-xs">{config.summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAllComplete ? (
                <Badge variant="success" className="gap-1.5 py-1 text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  Mục tiêu đã hoàn thành 100%
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 text-xs text-amber-500"
                >
                  <Activity className="h-3 w-3 animate-pulse" />
                  {completedObjectiveIds.length}/{config.objectives.length} Mục tiêu
                </Badge>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="border-border/50 flex flex-wrap items-center gap-2 border-t pt-1">
            <span className="text-muted-foreground mr-1 text-[11px] font-bold tracking-wider uppercase">
              Engine Lab:
            </span>
            {(config.availableModes || [config.mode]).map((mode) => {
              const isActive = activeMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'border-border/60 bg-background/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border'
                  }`}
                >
                  {mode === 'terminal' && <Terminal className="h-3.5 w-3.5" />}
                  {mode === 'sql' && <Database className="h-3.5 w-3.5" />}
                  {mode === 'http' && <Globe className="h-3.5 w-3.5" />}
                  {mode === 'packet' && <Network className="h-3.5 w-3.5" />}
                  <span className="capitalize">{mode} Sandbox</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Objectives Checklist & Instructions Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left 2 Cols: Interactive Workbench Active View */}
        <div className="space-y-4 lg:col-span-2">
          {activeMode === 'terminal' && (
            <TerminalView
              config={config}
              onExecution={(result, cmd) =>
                evaluateObjectives({ lastCommand: cmd, lastResult: result })
              }
            />
          )}

          {activeMode === 'sql' && (
            <SqlLabView
              config={config}
              onExecution={(res) => evaluateObjectives({ lastSqlResult: res })}
            />
          )}

          {(activeMode === 'http' || activeMode === 'packet') && (
            <HttpRepeaterView
              config={config}
              onExecution={(res, req) =>
                evaluateObjectives({ lastHttpRes: res, lastHttpReq: req })
              }
            />
          )}
        </div>

        {/* Right 1 Col: Challenge Objectives Checklist */}
        <div className="space-y-4">
          <Card className="glass-card space-y-3 p-4">
            <div className="border-border/60 flex items-center justify-between border-b pb-2">
              <h4 className="text-foreground flex items-center gap-1.5 text-xs font-extrabold tracking-wider uppercase">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                Mục tiêu Thử thách
              </h4>
              <span className="text-muted-foreground font-mono text-[10px]">
                {completedObjectiveIds.length}/{config.objectives.length} pass
              </span>
            </div>

            <div className="space-y-2.5">
              {config.objectives.map((obj, idx) => {
                const completed = completedObjectiveIds.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={`rounded-xl border p-3 transition-all ${
                      completed
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-border/60 bg-background/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="text-muted-foreground/60 mt-0.5 h-4 w-4 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <span className="text-foreground block text-xs font-bold">
                          {idx + 1}. {obj.title}
                        </span>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {obj.description}
                        </p>

                        {obj.hint && (
                          <div className="pt-1">
                            {showHintId === obj.id ? (
                              <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-1.5 font-mono text-[10px] text-amber-400">
                                Gợi ý: {obj.hint}
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowHintId(obj.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500/80 hover:text-amber-400"
                              >
                                <HelpCircle className="h-3 w-3" />
                                Xem gợi ý
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Instructions Box */}
          <Card className="glass-card space-y-2.5 p-4">
            <h4 className="text-foreground flex items-center gap-1.5 text-xs font-extrabold tracking-wider uppercase">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              Hướng dẫn Thực hiện
            </h4>
            <ul className="text-muted-foreground space-y-1.5 text-xs leading-relaxed">
              {config.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
