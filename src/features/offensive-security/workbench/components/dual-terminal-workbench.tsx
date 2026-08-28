'use client';

import * as React from 'react';
import {
  Columns2,
  CornerDownLeft,
  Layers,
  Radio,
  Rows2,
  Server,
  Sparkles,
  Terminal as TerminalIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  DualTerminalLayoutMode,
  TerminalExecutionResult,
  VfsState,
  WorkbenchConfig,
} from '../types';
import {
  createInitialVfsState,
  executeBashCommand,
} from '../engines/virtual-posix-engine';
import { ENTERPRISE_CYBER_RANGE_SUBNET } from '../engines/virtual-network-engine';
import {
  playAlertSiren,
  playFootholdChime,
  playKeyPressSound,
  playRootCompromisedChime,
  playSonarPing,
} from '../engines/cyber-audio-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DualTerminalWorkbenchProps {
  config: WorkbenchConfig;
  onExecution?: (result: TerminalExecutionResult, command: string, host: string) => void;
}

interface TerminalSessionState {
  hostId: string;
  hostname: string;
  ip: string;
  role: string;
  vfs: VfsState;
  historyItems: Array<{
    id: string;
    command: string;
    cwd: string;
    stdout: string;
    stderr: string;
    exitCode: number;
  }>;
  currentInput: string;
  historyIndex: number | null;
}

export const DualTerminalWorkbench: React.FC<DualTerminalWorkbenchProps> = ({
  config,
  onExecution,
}) => {
  const [layoutMode, setLayoutMode] =
    React.useState<DualTerminalLayoutMode>('split-horizontal');
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'attacker' | 'target'>('attacker');

  // Terminal 1: Attacker Station (operator@kali-box, 10.0.4.15)
  const [term1, setTerm1] = React.useState<TerminalSessionState>(() => ({
    hostId: 'attacker-kali',
    hostname: 'kali-station',
    ip: '10.0.4.15',
    role: 'Attacker Recon Workstation',
    vfs: createInitialVfsState(config.initialVfs),
    historyItems: [
      {
        id: 'init-t1',
        command: '',
        cwd: '/home/operator',
        stdout:
          'Kali GNU/Linux Rolling 2024.4 (x86_64) - Network Range Connected (10.0.4.15/24)\n' +
          'Recon tools active: nmap, curl, dig, nc, ping, ssh, grep, awk, sed.\n',
        stderr: '',
        exitCode: 0,
      },
    ],
    currentInput: '',
    historyIndex: null,
  }));

  // Terminal 2: Target Host (www-data@web01, 10.0.4.10)
  const [term2, setTerm2] = React.useState<TerminalSessionState>(() => {
    const targetVfs = createInitialVfsState();
    targetVfs.user = { uid: 33, gid: 33, username: 'www-data', groups: ['www-data'] };
    targetVfs.cwd = '/var/www/html';
    targetVfs.env.HOSTNAME = 'web01.corp.internal';
    targetVfs.env.USER = 'www-data';

    return {
      hostId: '10.0.4.10',
      hostname: 'web01.corp.internal',
      ip: '10.0.4.10',
      role: 'Production Web Server',
      vfs: targetVfs,
      historyItems: [
        {
          id: 'init-t2',
          command: '',
          cwd: '/var/www/html',
          stdout:
            'Ubuntu 24.04 LTS (GNU/Linux 6.8.0-45-generic x86_64)\n' +
            'Service active: nginx/1.24.0, nodejs/v20.12.2, php-fpm8.3\n' +
            'Use "tail /var/log/nginx/access.log" or "id" to inspect target state.\n',
          stderr: '',
          exitCode: 0,
        },
      ],
      currentInput: '',
      historyIndex: null,
    };
  });

  const term1OutputRef = React.useRef<HTMLDivElement>(null);
  const term2OutputRef = React.useRef<HTMLDivElement>(null);
  const isMountedRef = React.useRef(false);

  // Auto scroll output on execution only
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (term1OutputRef.current) {
      term1OutputRef.current.scrollTop = term1OutputRef.current.scrollHeight;
    }
    if (term2OutputRef.current) {
      term2OutputRef.current.scrollTop = term2OutputRef.current.scrollHeight;
    }
  }, [term1.historyItems, term2.historyItems]);

  const handleRunTerm1 = (cmdToRun: string): void => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    if (!isAudioMuted) {
      if (trimmed.startsWith('nmap')) playSonarPing();
      else if (trimmed.includes('curl') || trimmed.includes('nc')) playKeyPressSound();
      else playKeyPressSound();
    }

    if (trimmed === 'clear') {
      setTerm1((prev) => ({
        ...prev,
        historyItems: [],
        currentInput: '',
        historyIndex: null,
      }));
      return;
    }

    const result = executeBashCommand(trimmed, term1.vfs);

    // Cross-host telemetry side-effect: If Attacker runs nmap/curl against 10.0.4.10, log to Terminal 2!
    if (trimmed.includes('10.0.4.10') || trimmed.includes('web01')) {
      const timestamp = new Date().toISOString().substring(11, 19);
      const logLine = `[AUDIT ${timestamp}] INBOUND ${trimmed.includes('nmap') ? 'TCP SYN SCAN' : 'HTTP REQUEST'} FROM 10.0.4.15`;
      setTerm2((prev) => ({
        ...prev,
        historyItems: [
          ...prev.historyItems,
          {
            id: `audit-${Date.now()}`,
            command: '',
            cwd: prev.vfs.cwd,
            stdout: `${logLine}\n`,
            stderr: '',
            exitCode: 0,
          },
        ],
      }));
    }

    setTerm1((prev) => ({
      ...prev,
      vfs: result.updatedState,
      historyItems: [
        ...prev.historyItems,
        {
          id: `${Date.now()}`,
          command: trimmed,
          cwd: prev.vfs.cwd,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        },
      ],
      currentInput: '',
      historyIndex: null,
    }));

    onExecution?.(result, trimmed, 'attacker-kali');
  };

  const handleRunTerm2 = (cmdToRun: string): void => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    if (!isAudioMuted) {
      if (trimmed.includes('sudo') || trimmed.includes('su')) playAlertSiren();
      else if (trimmed.includes('chmod') || trimmed.includes('find')) playFootholdChime();
      else playKeyPressSound();
    }

    if (trimmed === 'clear') {
      setTerm2((prev) => ({
        ...prev,
        historyItems: [],
        currentInput: '',
        historyIndex: null,
      }));
      return;
    }

    const result = executeBashCommand(trimmed, term2.vfs);

    // Check privilege escalation victory condition
    if (result.stdout.includes('uid=0(root)') || trimmed === 'su root') {
      if (!isAudioMuted) playRootCompromisedChime();
    }

    setTerm2((prev) => ({
      ...prev,
      vfs: result.updatedState,
      historyItems: [
        ...prev.historyItems,
        {
          id: `${Date.now()}`,
          command: trimmed,
          cwd: prev.vfs.cwd,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        },
      ],
      currentInput: '',
      historyIndex: null,
    }));

    onExecution?.(result, trimmed, term2.hostId);
  };

  const handleSwitchTargetHost = (hostIp: string): void => {
    const targetNode = ENTERPRISE_CYBER_RANGE_SUBNET[hostIp];
    if (!targetNode) return;

    const freshVfs = createInitialVfsState();
    freshVfs.env.HOSTNAME = targetNode.hostname;
    freshVfs.env.USER = targetNode.role.includes('Domain') ? 'Administrator' : 'operator';
    freshVfs.user = {
      uid: 1000,
      gid: 1000,
      username: freshVfs.env.USER,
      groups: [freshVfs.env.USER],
    };

    setTerm2({
      hostId: targetNode.ip,
      hostname: targetNode.hostname,
      ip: targetNode.ip,
      role: targetNode.role,
      vfs: freshVfs,
      historyItems: [
        {
          id: `switch-${Date.now()}`,
          command: '',
          cwd: freshVfs.cwd,
          stdout: `Connected to host session: ${targetNode.hostname} (${targetNode.ip})\nOS: ${targetNode.os}\nRole: ${targetNode.role}\n`,
          stderr: '',
          exitCode: 0,
        },
      ],
      currentInput: '',
      historyIndex: null,
    });
  };

  return (
    <div className="space-y-4">
      {/* Sample Recon / Exploit Bar */}
      {config.sampleCommands && config.sampleCommands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Lệnh mẫu:
          </span>
          {config.sampleCommands.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setTerm1((prev) => ({ ...prev, currentInput: cmd }));
              }}
              className="border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/40 group text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <span>{cmd}</span>
              <CornerDownLeft className="text-muted-foreground group-hover:text-primary h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* Control HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Badge className="gap-1 border-cyan-500/40 bg-cyan-950/60 font-mono text-[10px] text-cyan-300">
            <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
            DUAL TERMINAL SYNC ACTIVE
          </Badge>
        </div>

        {/* Layout Mode Toggles & Audio */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="h-7 gap-1 px-2 text-slate-400 hover:text-white"
            title={isAudioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isAudioMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </Button>

          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode('split-horizontal')}
              className={`rounded p-1.5 transition-colors ${
                layoutMode === 'split-horizontal'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chia đôi màn hình ngang (Side-by-Side)"
            >
              <Columns2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('split-vertical')}
              className={`rounded p-1.5 transition-colors ${
                layoutMode === 'split-vertical'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chia đôi màn hình dọc (Stacked)"
            >
              <Rows2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('tabs')}
              className={`rounded p-1.5 transition-colors ${
                layoutMode === 'tabs'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Tabs"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dual Terminal Display Matrix */}
      {layoutMode === 'tabs' && (
        <div className="mb-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('attacker')}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === 'attacker'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            💻 Attacker ({term1.hostname})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === 'target'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            🎯 Target ({term2.hostname})
          </button>
        </div>
      )}

      <div
        className={`grid gap-4 ${
          layoutMode === 'split-horizontal'
            ? 'grid-cols-1 lg:grid-cols-2'
            : layoutMode === 'split-vertical'
              ? 'grid-cols-1'
              : 'grid-cols-1'
        }`}
      >
        {/* Terminal 1: Attacker Workstation */}
        {(layoutMode !== 'tabs' || activeTab === 'attacker') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl ring-1 ring-slate-800">
            {/* Terminal Header */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                  <TerminalIcon className="h-3.5 w-3.5 text-cyan-400" />
                  <span>
                    [ATTACKER] {term1.vfs.user.username}@{term1.hostname} ({term1.ip})
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="border-cyan-500/40 bg-cyan-950/40 text-[9px] text-cyan-400"
              >
                KALI 10.0.4.15
              </Badge>
            </div>

            {/* Output Stream */}
            <div
              ref={term1OutputRef}
              className="max-h-[340px] min-h-[220px] space-y-2 overflow-y-auto pr-1"
            >
              {term1.historyItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  {item.command && (
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <span className="text-slate-500 select-none">
                        {term1.vfs.user.username}@{term1.hostname}:{item.cwd}$
                      </span>
                      <span className="font-bold text-white">{item.command}</span>
                    </div>
                  )}
                  {item.stdout && (
                    <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                      {item.stdout}
                    </pre>
                  )}
                  {item.stderr && (
                    <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-rose-400">
                      {item.stderr}
                    </pre>
                  )}
                </div>
              ))}

              {/* Input Prompt */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="shrink-0 text-[11px] text-slate-500 select-none">
                  {term1.vfs.user.username}@{term1.hostname}:{term1.vfs.cwd}$
                </span>
                <input
                  type="text"
                  value={term1.currentInput}
                  onChange={(e) => setTerm1({ ...term1, currentInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRunTerm1(term1.currentInput);
                    }
                  }}
                  className="flex-1 bg-transparent font-mono text-[11px] text-cyan-300 caret-cyan-400 outline-none"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Gõ lệnh nmap, curl, nc, ssh..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Terminal 2: Target Host Console */}
        {(layoutMode !== 'tabs' || activeTab === 'target') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl ring-1 ring-slate-800">
            {/* Terminal Header & Target Host Selector */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                  <Server className="h-3.5 w-3.5 text-amber-400" />
                  <span>
                    [TARGET] {term2.vfs.user.username}@{term2.hostname}
                  </span>
                </div>
              </div>

              {/* Switch Target Node Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={term2.hostId}
                  onChange={(e) => handleSwitchTargetHost(e.target.value)}
                  className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] text-amber-300 outline-none"
                >
                  <option value="10.0.4.10">web01 (10.0.4.10)</option>
                  <option value="10.0.4.50">db-cluster01 (10.0.4.50)</option>
                  <option value="10.0.4.20">ad-dc01 (10.0.4.20)</option>
                  <option value="10.0.4.1">gateway (10.0.4.1)</option>
                </select>
              </div>
            </div>

            {/* Output Stream */}
            <div
              ref={term2OutputRef}
              className="max-h-[340px] min-h-[220px] space-y-2 overflow-y-auto pr-1"
            >
              {term2.historyItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  {item.command && (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <span className="text-slate-500 select-none">
                        {term2.vfs.user.username}@{term2.hostname}:{item.cwd}$
                      </span>
                      <span className="font-bold text-white">{item.command}</span>
                    </div>
                  )}
                  {item.stdout && (
                    <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                      {item.stdout}
                    </pre>
                  )}
                  {item.stderr && (
                    <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-rose-400">
                      {item.stderr}
                    </pre>
                  )}
                </div>
              ))}

              {/* Input Prompt */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="shrink-0 text-[11px] text-slate-500 select-none">
                  {term2.vfs.user.username}@{term2.hostname}:{term2.vfs.cwd}$
                </span>
                <input
                  type="text"
                  value={term2.currentInput}
                  onChange={(e) => setTerm2({ ...term2, currentInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRunTerm2(term2.currentInput);
                    }
                  }}
                  className="flex-1 bg-transparent font-mono text-[11px] text-amber-300 caret-amber-400 outline-none"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Gõ lệnh trên máy nạn nhân (ls, cat /var/log/..., chmod...)"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
