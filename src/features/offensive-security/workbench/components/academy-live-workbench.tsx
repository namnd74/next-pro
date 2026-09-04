'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Columns2,
  Cpu,
  Database,
  Flame,
  Globe,
  HelpCircle,
  Layers,
  Shield,
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
import { DualTerminalWorkbench } from './dual-terminal-workbench';
import { CyberRangeTopologyMap } from './cyber-range-topology-map';
import { SqlLabView } from './sql-lab-view';
import { HttpRepeaterView } from './http-repeater-view';
import { SocTelemetryStudio } from './soc-telemetry-studio';
import { BloodhoundGraphView } from './bloodhound-graph-view';
import { MemoryExploitStudio } from './memory-exploit-studio';
import { telemetryBus } from '../telemetry/runtime-event-bus';
import {
  playFootholdChime,
  playRootCompromisedChime,
} from '../engines/cyber-audio-engine';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useOffensiveSecurityStore } from '../../stores/use-offensive-security-store';

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
  const [isObjectivesOpen, setIsObjectivesOpen] = React.useState<boolean>(true);
  const [unreadTelemetryCount, setUnreadTelemetryCount] = React.useState<number>(0);

  // Sync unread telemetry count
  React.useEffect(() => {
    const unsubscribe = telemetryBus.subscribe(() => {
      setUnreadTelemetryCount(telemetryBus.getUnreadCount());
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (activeMode === 'telemetry') {
      telemetryBus.markAllRead();
      setUnreadTelemetryCount(0);
    }
  }, [activeMode]);

  // Reset state when lesson config changes
  React.useEffect(() => {
    setActiveMode(config.mode);
    setVerificationContext({});
    setCompletedObjectives({});
    setShowHint({});
  }, [config]);

  // Check objective completion whenever context updates
  React.useEffect(() => {
    let newlyCompleted = false;
    config.objectives.forEach((obj) => {
      if (!completedObjectives[obj.id] && obj.isComplete(verificationContext)) {
        setCompletedObjectives((prev) => ({ ...prev, [obj.id]: true }));
        newlyCompleted = true;
      }
    });
    if (newlyCompleted) {
      try {
        if (localStorage.getItem('offsec_audio_enabled') === 'true') {
          playFootholdChime();
        }
      } catch {
        // Ignore
      }
    }
  }, [config.objectives, verificationContext, completedObjectives]);

  const handleTerminalExecution = (
    result: TerminalExecutionResult,
    command: string,
    hostId?: string
  ): void => {
    setVerificationContext((prev) => ({
      ...prev,
      vfs: result.updatedState,
      lastCommand: command,
      lastResult: result,
      activeHostId: hostId || 'sec-target-prod01',
    }));

    // Emit live telemetry for Purple Team detection
    telemetryBus.publishAttack({
      mode: 'terminal',
      rawCommand: command,
      host: hostId || config.targetHost || 'web01.corp.internal',
      user: result.updatedState.user.username,
      exitCode: result.exitCode,
    });
  };

  const handleSqlExecution = (result: SqlExecutionResult, query: string): void => {
    setVerificationContext((prev) => ({
      ...prev,
      lastCommand: query,
      lastSqlResult: result,
    }));

    telemetryBus.publishAttack({
      mode: 'sql',
      rawCommand: query,
      host: 'web01.corp.internal',
      user: 'nginx_www',
    });
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

    telemetryBus.publishAttack({
      mode: 'http',
      rawCommand: `${req.method} ${req.url}\n${req.rawHeaders}`,
      host: 'gateway.corp.internal',
    });
  };

  const totalObjectives = config.objectives.length;
  const completedCount = Object.values(completedObjectives).filter(Boolean).length;
  const progressPercent =
    totalObjectives > 0 ? Math.round((completedCount / totalObjectives) * 100) : 0;
  const isAllCompleted = totalObjectives > 0 && completedCount === totalObjectives;

  // Credit lesson completion in progress store when all objectives are satisfied
  React.useEffect(() => {
    if (isAllCompleted && config.lessonId) {
      useOffensiveSecurityStore.getState().completeAcademyLesson(config.lessonId);
      try {
        if (localStorage.getItem('offsec_audio_enabled') === 'true') {
          playRootCompromisedChime();
        }
      } catch {
        // Ignore
      }
    }
  }, [isAllCompleted, config.lessonId]);

  // Render mode tabs strictly matching what this lesson requires
  const availableModes = config.availableModes || [config.mode];
  const hasMultipleModes = availableModes.length > 1;

  return (
    <div className="space-y-6">
      {/* Workbench Header & Dynamic Mode Selector */}
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

        {/* Dynamic Mode Switcher (Rendered ONLY when lesson supports multiple modes) */}
        {hasMultipleModes && (
          <div className="border-border/80 bg-secondary/30 flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
            {availableModes.includes('terminal') && (
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

            {availableModes.includes('cyber-range') && (
              <button
                type="button"
                onClick={() => setActiveMode('cyber-range')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'cyber-range'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" />
                Cyber Range (2 Hosts)
              </button>
            )}

            {availableModes.includes('sql') && (
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

            {availableModes.includes('http') && (
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

            {availableModes.includes('packet') && (
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

            {availableModes.includes('telemetry') && (
              <button
                type="button"
                data-testid="mode-tab-telemetry"
                onClick={() => setActiveMode('telemetry')}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'telemetry'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                SOC Telemetry
                {unreadTelemetryCount > 0 && activeMode !== 'telemetry' && (
                  <span className="flex h-2 w-2 animate-ping rounded-full bg-rose-400" />
                )}
              </button>
            )}

            {availableModes.includes('ad-graph') && (
              <button
                type="button"
                data-testid="mode-tab-ad-graph"
                onClick={() => setActiveMode('ad-graph')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'ad-graph'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                AD BloodHound
              </button>
            )}

            {availableModes.includes('memory-exploit') && (
              <button
                type="button"
                data-testid="mode-tab-memory-exploit"
                onClick={() => setActiveMode('memory-exploit')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === 'memory-exploit'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                x86 Stack & Exploit
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

        {activeMode === 'cyber-range' && (
          <div className="space-y-4">
            <CyberRangeTopologyMap
              onRunNmapScan={() => {
                setActiveMode('cyber-range');
              }}
            />
            <DualTerminalWorkbench
              config={config}
              onExecution={handleTerminalExecution}
            />
          </div>
        )}

        {activeMode === 'sql' && (
          <SqlLabView config={config} onExecution={handleSqlExecution} />
        )}

        {(activeMode === 'http' || activeMode === 'packet') && (
          <HttpRepeaterView config={config} onExecution={handleHttpExecution} />
        )}

        {activeMode === 'telemetry' && <SocTelemetryStudio />}

        {activeMode === 'ad-graph' && <BloodhoundGraphView />}

        {activeMode === 'memory-exploit' && <MemoryExploitStudio />}
      </div>

      {/* Objective Checklist Card & Progress */}
      <Card className="border-border/80 bg-card rounded-2xl p-4 shadow-sm transition-all">
        <button
          type="button"
          onClick={() => setIsObjectivesOpen(!isObjectivesOpen)}
          className="group flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
            <h4 className="text-foreground group-hover:text-primary text-xs font-bold transition-colors sm:text-sm">
              Mục tiêu Thực chiến ({completedCount}/{totalObjectives})
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-secondary hidden h-1.5 w-24 overflow-hidden rounded-full sm:block">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              {progressPercent}%
            </span>
            {isAllCompleted && (
              <Badge className="gap-1 border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Hoàn thành Lab
              </Badge>
            )}
            {isObjectivesOpen ? (
              <ChevronUp className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
            ) : (
              <ChevronDown className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
            )}
          </div>
        </button>

        {isObjectivesOpen && (
          <div className="border-border/60 mt-3 space-y-3 border-t pt-3">
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
                            setShowHint((prev) => ({
                              ...prev,
                              [obj.id]: !prev[obj.id],
                            }))
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
                      <div className="border-border/40 mt-2.5 rounded-lg border-t bg-amber-500/5 p-2 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                        💡 Gợi ý: {obj.hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
