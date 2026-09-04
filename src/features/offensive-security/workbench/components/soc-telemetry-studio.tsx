'use client';

import * as React from 'react';
import {
  Activity,
  Check,
  Copy,
  Filter,
  Pause,
  Play,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { telemetryBus } from '../telemetry/runtime-event-bus';
import type {
  TelemetryEventSource,
  TelemetryRecord,
  TelemetrySeverity,
} from '../telemetry/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const SocTelemetryStudio: React.FC = () => {
  const [events, setEvents] = React.useState<TelemetryRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = React.useState<string>('all');
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'parsed' | 'raw' | 'sigma'>('parsed');

  // Sync with reactive Telemetry Bus
  React.useEffect(() => {
    // Initial history
    setEvents(telemetryBus.getHistory());
    telemetryBus.markAllRead();

    const unsubscribe = telemetryBus.subscribe((newRecord) => {
      if (!isPaused) {
        setEvents((prev) => [newRecord, ...prev]);
      }
    });

    return unsubscribe;
  }, [isPaused]);

  // Set default selected event
  React.useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0]?.id || null);
    }
  }, [events, selectedEventId]);

  const filteredEvents = React.useMemo(() => {
    if (sourceFilter === 'all') return events;
    return events.filter((e) => e.source === sourceFilter);
  }, [events, sourceFilter]);

  const selectedEvent = React.useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  const handleCopyRaw = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const getSeverityBadge = (severity: TelemetrySeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge className="border-rose-500/50 bg-rose-950/80 px-1.5 py-0.5 font-mono text-[9px] text-rose-300 uppercase">
            CRITICAL
          </Badge>
        );
      case 'high':
        return (
          <Badge className="border-orange-500/50 bg-orange-950/80 px-1.5 py-0.5 font-mono text-[9px] text-orange-300 uppercase">
            HIGH
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="border-amber-500/50 bg-amber-950/80 px-1.5 py-0.5 font-mono text-[9px] text-amber-300 uppercase">
            MEDIUM
          </Badge>
        );
      case 'low':
        return (
          <Badge className="border-cyan-500/50 bg-cyan-950/80 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300 uppercase">
            LOW
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="px-1.5 py-0.5 font-mono text-[9px] text-slate-400"
          >
            INFO
          </Badge>
        );
    }
  };

  const getSourceBadge = (source: TelemetryEventSource) => {
    switch (source) {
      case 'auditd':
        return 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40';
      case 'sysmon':
        return 'border-purple-500/40 text-purple-400 bg-purple-950/40';
      case 'zeek':
        return 'border-sky-500/40 text-sky-400 bg-sky-950/40';
      case 'waf':
      case 'suricata':
        return 'border-amber-500/40 text-amber-400 bg-amber-950/40';
      default:
        return 'border-slate-700 text-slate-300 bg-slate-900';
    }
  };

  return (
    <div
      data-testid="soc-telemetry-studio"
      className="border-border/80 bg-card flex flex-col space-y-3 rounded-2xl border p-3 shadow-sm sm:p-4"
    >
      {/* Studio Header Bar */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <Shield className="h-4 w-4 animate-pulse text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-xs font-extrabold tracking-tight sm:text-sm">
                SOC TELEMETRY STUDIO · PURPLE TEAMING
              </h3>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 font-mono text-[9px] text-emerald-400"
              >
                {events.length} SỰ KIỆN
              </Badge>
            </div>
            <p className="text-muted-foreground text-[10.5px]">
              Góc nhìn phòng thủ: Mọi lệnh tấn công đều phát sinh log viễn trắc & đối
              chiếu luật phát hiện Sigma
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsPaused(!isPaused)}
            className="h-7 px-2.5 font-mono text-xs"
            title={isPaused ? 'Tiếp tục nhận log' : 'Tạm dừng nhận log'}
          >
            {isPaused ? (
              <>
                <Play className="mr-1 h-3 w-3 text-emerald-400" /> RESUME
              </>
            ) : (
              <>
                <Pause className="mr-1 h-3 w-3 text-amber-400" /> PAUSE
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              telemetryBus.clearHistory();
              setEvents([]);
              setSelectedEventId(null);
            }}
            className="text-muted-foreground hover:text-foreground h-7 px-2 font-mono text-xs"
            title="Xóa toàn bộ lịch sử viễn trắc"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Source Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-muted-foreground mr-1 flex items-center gap-1 font-mono text-[10px]">
          <Filter className="h-3 w-3" /> NGUỒN:
        </span>
        {['all', 'auditd', 'sysmon', 'zeek', 'waf', 'suricata'].map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => setSourceFilter(src)}
            className={`rounded-md px-2 py-0.5 font-mono text-[10.5px] uppercase transition-all ${
              sourceFilter === src
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground bg-secondary/40'
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Main Studio Work Area: Split Event List & Inspector */}
      <div className="grid min-h-[360px] grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left Column: Live Event Stream (5 cols) */}
        <div className="border-border/60 flex flex-col overflow-hidden rounded-xl border bg-slate-950/90 p-2 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-2 pb-1.5 font-mono text-[10px] font-bold text-slate-400">
            <span>EVENT STREAM ({filteredEvents.length})</span>
            <span className="text-[9px] text-slate-500">CLICK ĐỂ MỔ XẺ</span>
          </div>

          <div className="cyber-scrollbar max-h-[320px] flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-1 lg:max-h-[390px]">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center font-mono text-xs text-slate-500">
                <Activity className="mb-2 h-6 w-6 animate-pulse text-slate-600" />
                Chưa có sự kiện nào. Hãy chạy lệnh trong Terminal, SQL Lab hoặc Packet
                Inspector!
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isSelected = evt.id === selectedEventId;
                const timeOnly =
                  evt.timestamp.split('T')[1]?.slice(0, 8) || evt.timestamp;

                return (
                  <div
                    key={evt.id}
                    data-testid={`telemetry-row-${evt.source}`}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`cursor-pointer rounded-lg border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500/70 bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/40'
                        : 'border-slate-800/70 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`px-1 py-0 font-mono text-[9px] uppercase ${getSourceBadge(evt.source)}`}
                        >
                          {evt.source}
                        </Badge>
                        <span className="font-mono text-[9.5px] text-slate-400">
                          {timeOnly}
                        </span>
                      </div>
                      {getSeverityBadge(evt.severity)}
                    </div>

                    <div className="truncate font-mono text-xs font-bold text-slate-200">
                      {evt.processName || evt.mitre.techniqueName}
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[10px] text-slate-400">
                      <span className="max-w-[170px] truncate text-slate-300">
                        {evt.commandLine || evt.mitre.techniqueId}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-slate-700 bg-slate-800/60 font-mono text-[9px] text-emerald-400"
                      >
                        {evt.mitre.techniqueId}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Telemetry & Sigma Rule Inspector (7 cols) */}
        <div className="border-border/60 flex flex-col overflow-hidden rounded-xl border bg-slate-950/90 p-3 lg:col-span-7">
          {selectedEvent ? (
            <div className="flex h-full flex-col space-y-3">
              {/* Event Header Card */}
              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${getSourceBadge(
                        selectedEvent.source
                      )}`}
                    >
                      {selectedEvent.source}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {selectedEvent.host}
                    </span>
                  </div>
                  {getSeverityBadge(selectedEvent.severity)}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge className="border-emerald-500/40 bg-emerald-950/60 font-mono text-[10px] text-emerald-400">
                    MITRE {selectedEvent.mitre.techniqueId}:{' '}
                    {selectedEvent.mitre.techniqueName}
                  </Badge>
                  <span className="font-mono text-[10px] text-slate-400">
                    Tactic: {selectedEvent.mitre.tactic} ({selectedEvent.mitre.tacticId})
                  </span>
                </div>
              </div>

              {/* Inspector View Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('parsed')}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs transition-all ${
                    activeTab === 'parsed'
                      ? 'bg-emerald-500 font-bold text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Parsed Fields
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs transition-all ${
                    activeTab === 'raw'
                      ? 'bg-emerald-500 font-bold text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw System Log
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sigma')}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs transition-all ${
                    activeTab === 'sigma'
                      ? 'bg-emerald-500 font-bold text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sigma Detection Rule {selectedEvent.sigmaRuleMatch ? '⚡' : ''}
                </button>
              </div>

              {/* Tab 1: Parsed Key-Value Fields */}
              {activeTab === 'parsed' && (
                <div className="cyber-scrollbar max-h-[260px] flex-1 space-y-2 overflow-y-auto overscroll-contain rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="text-slate-400">Process Name:</div>
                    <div className="break-all text-emerald-300">
                      {selectedEvent.processName || 'N/A'}
                    </div>

                    <div className="text-slate-400">Command Line:</div>
                    <div className="break-all text-cyan-300">
                      {selectedEvent.commandLine || 'N/A'}
                    </div>

                    <div className="text-slate-400">User / Identity:</div>
                    <div className="text-slate-200">{selectedEvent.user || 'system'}</div>

                    <div className="text-slate-400">Timestamp:</div>
                    <div className="text-slate-300">{selectedEvent.timestamp}</div>

                    {Object.entries(selectedEvent.parsedFields).map(([k, v]) => (
                      <React.Fragment key={k}>
                        <div className="text-slate-400 capitalize">
                          {k.replace(/_/g, ' ')}:
                        </div>
                        <div className="break-all text-slate-200">{String(v)}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Raw System Log with Copy */}
              {activeTab === 'raw' && (
                <div className="cyber-scrollbar relative max-h-[260px] flex-1 overflow-y-auto overscroll-contain rounded-lg border border-slate-800/80 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyRaw(selectedEvent.rawLog)}
                    className="absolute top-2 right-2 h-6 border-slate-700 bg-slate-900 px-2 font-mono text-[10px] text-slate-300"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-emerald-400" /> COPIED
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" /> COPY LOG
                      </>
                    )}
                  </Button>
                  <pre className="pr-16 break-all whitespace-pre-wrap">
                    {selectedEvent.rawLog}
                  </pre>
                </div>
              )}

              {/* Tab 3: Sigma Detection Rule */}
              {activeTab === 'sigma' && (
                <div className="cyber-scrollbar max-h-[260px] flex-1 space-y-2.5 overflow-y-auto overscroll-contain rounded-lg border border-slate-800/80 bg-slate-950 p-3">
                  {selectedEvent.sigmaRuleMatch ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-300">
                          {selectedEvent.sigmaRuleMatch.title}
                        </span>
                        <Badge className="border-emerald-500/40 bg-emerald-950/60 font-mono text-[9px] text-emerald-400">
                          STATUS: {selectedEvent.sigmaRuleMatch.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2 font-mono text-[11px] text-amber-200">
                        🛡️ Khuyến nghị phòng thủ:{' '}
                        {selectedEvent.sigmaRuleMatch.remediationHint}
                      </div>

                      <pre className="rounded border border-slate-800 bg-slate-900/80 p-2 font-mono text-[10.5px] leading-relaxed whitespace-pre-wrap text-slate-300">
                        {selectedEvent.sigmaRuleMatch.detectionYaml}
                      </pre>
                    </>
                  ) : (
                    <div className="py-8 text-center font-mono text-xs text-slate-500">
                      Chưa có luật Sigma cụ thể cho sự kiện thông thường này. Hãy thử lệnh
                      can thiệp đặc quyền hoặc SQLi!
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center font-mono text-xs text-slate-500">
              Chọn một sự kiện từ danh sách bên trái để mổ xẻ chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
