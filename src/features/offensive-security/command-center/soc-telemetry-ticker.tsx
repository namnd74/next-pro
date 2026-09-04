'use client';

import * as React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TelemetryEvent {
  id: string;
  source: string;
  badgeColor: string;
  tactic: string;
  timestamp: string;
  message: string;
}

const SOC_EVENTS: TelemetryEvent[] = [
  {
    id: 'evt-1',
    source: 'AUDITD',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
    tactic: 'TA0004 PrivEsc',
    timestamp: '14:22:01',
    message:
      'High-Privilege Process: /usr/bin/chmod 640 /etc/shadow executed by root (uid=0)',
  },
  {
    id: 'evt-2',
    source: 'ZEEK-NIDS',
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-950/40',
    tactic: 'TA0043 Recon',
    timestamp: '14:22:08',
    message: 'TCP SYN Stealth Scan detected on DMZ web01:80 from workstation 10.0.4.15',
  },
  {
    id: 'evt-3',
    source: 'SURICATA',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
    tactic: 'TA0001 Initial Access',
    timestamp: '14:22:15',
    message:
      'ET WEB_SERVER Possible In-Band SQL Injection Attempt: UNION SELECT admin record',
  },
  {
    id: 'evt-4',
    source: 'SYSMON-WIN',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
    tactic: 'TA0006 Discovery',
    timestamp: '14:22:30',
    message:
      'Event 1: Process Create whoami.exe /priv spawned from cmd.exe (Parent PID 4120)',
  },
  {
    id: 'evt-5',
    source: 'KERBEROS-KDC',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-950/40',
    tactic: 'TA0008 Lateral Movement',
    timestamp: '14:22:45',
    message: 'AS-REQ Pre-Authentication request for svc_backup@CORP.INTERNAL [RC4-HMAC]',
  },
];

export const SocTelemetryTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SOC_EVENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentEvent = SOC_EVENTS[currentIndex] || SOC_EVENTS[0]!;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-slate-950/80 px-4 py-2.5 shadow-md backdrop-blur-md transition-colors hover:border-emerald-500/40"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-400">
          <Activity className="h-4 w-4 animate-pulse text-emerald-400" />
          <span className="hidden sm:inline">LIVE SOC TELEMETRY:</span>
        </div>

        <Badge
          variant="outline"
          className={`font-mono text-[10px] uppercase ${currentEvent.badgeColor}`}
        >
          [{currentEvent.source}]
        </Badge>

        <Badge
          variant="outline"
          className="border-border/80 bg-secondary/30 font-mono text-[10px] text-slate-300"
        >
          {currentEvent.tactic}
        </Badge>

        <span className="font-mono text-[11px] text-slate-500">
          {currentEvent.timestamp}
        </span>

        <span className="max-w-[280px] truncate font-mono text-[11.5px] text-slate-200 sm:max-w-md lg:max-w-xl">
          {currentEvent.message}
        </span>
      </div>

      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
        <span>
          {currentIndex + 1}/{SOC_EVENTS.length}
        </span>
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % SOC_EVENTS.length)}
          className="p-1 text-slate-400 hover:text-emerald-400"
          title="Sự kiện tiếp theo"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
