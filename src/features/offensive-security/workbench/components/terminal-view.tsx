'use client';

import * as React from 'react';
import {
  Check,
  Copy,
  CornerDownLeft,
  RotateCcw,
  Sparkles,
  Terminal as TerminalIcon,
} from 'lucide-react';
import type { TerminalExecutionResult, VfsState, WorkbenchConfig } from '../types';
import {
  createInitialVfsState,
  executeBashCommand,
} from '../engines/virtual-posix-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TerminalViewProps {
  config: WorkbenchConfig;
  onExecution?: (result: TerminalExecutionResult, command: string) => void;
}

interface TerminalHistoryItem {
  id: string;
  command: string;
  cwd: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ config, onExecution }) => {
  const [vfsState, setVfsState] = React.useState<VfsState>(() =>
    createInitialVfsState(config.initialVfs)
  );
  const [historyItems, setHistoryItems] = React.useState<TerminalHistoryItem[]>([
    {
      id: 'init-1',
      command: '',
      cwd: '/home/operator',
      stdout:
        'Linux sec-target-prod01 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64\n' +
        'Type "help" for 45+ available Linux utilities (ls, grep, awk, sed, nmap, curl, etc.).\n',
      stderr: '',
      exitCode: 0,
    },
  ]);
  const [currentInput, setCurrentInput] = React.useState('');
  const [historyIndex, setHistoryIndex] = React.useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  const terminalEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historyItems]);

  const handleRunCommand = (cmdToRun: string): void => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistoryItems([]);
      setCurrentInput('');
      setHistoryIndex(null);
      return;
    }

    const result = executeBashCommand(trimmed, vfsState);
    setVfsState(result.updatedState);

    const newItem: TerminalHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      command: trimmed,
      cwd: vfsState.cwd,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };

    setHistoryItems((prev) => [...prev, newItem]);
    setCurrentInput('');
    setHistoryIndex(null);

    onExecution?.(result, trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(currentInput);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const userCmds = vfsState.history;
      if (userCmds.length === 0) return;
      const nextIdx =
        historyIndex === null ? userCmds.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCurrentInput(userCmds[nextIdx] || '');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const userCmds = vfsState.history;
      if (historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= userCmds.length) {
        setHistoryIndex(null);
        setCurrentInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCurrentInput(userCmds[nextIdx] || '');
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const parts = currentInput.split(' ');
      const lastWord = parts[parts.length - 1];
      const commonCommands = [
        'ls',
        'cat',
        'chmod',
        'chown',
        'grep',
        'awk',
        'sed',
        'cut',
        'sort',
        'uniq',
        'find',
        'whoami',
        'id',
        'nmap',
        'ping',
        'ifconfig',
        'curl',
        'hexdump',
        'base64',
        'pwd',
        'cd',
        'clear',
        'help',
        'uname',
        'ps',
        'kill',
      ];
      const match = commonCommands.find((c) => c.startsWith(lastWord));
      if (match) {
        parts[parts.length - 1] = match;
        setCurrentInput(parts.join(' '));
      }
    }
  };

  const handleReset = (): void => {
    const fresh = createInitialVfsState(config.initialVfs);
    setVfsState(fresh);
    setHistoryItems([
      {
        id: 'reset-1',
        command: '',
        cwd: '/home/operator',
        stdout: 'Terminal session reset to fresh state.\n',
        stderr: '',
        exitCode: 0,
      },
    ]);
    setCurrentInput('');
    setHistoryIndex(null);
  };

  const handleCopy = (text: string): void => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Sample Commands Bar */}
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
                setCurrentInput(cmd);
                inputRef.current?.focus();
              }}
              className="border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/40 group text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <span>{cmd}</span>
              <CornerDownLeft className="text-muted-foreground group-hover:text-primary h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* Terminal Screen Container */}
      <div
        className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-100 shadow-2xl ring-1 ring-slate-800 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header Bar */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <TerminalIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>operator@sec-target-prod01: {vfsState.cwd}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-950/40 text-[9px] text-emerald-400"
            >
              POSIX RUNTIME · 45+ CMDS
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="h-6 gap-1 px-2 text-[10px] text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Reset OS
            </Button>
          </div>
        </div>

        {/* Output Stream */}
        <div className="max-h-[380px] min-h-[240px] space-y-2 overflow-y-auto pr-1">
          {historyItems.map((item) => (
            <div key={item.id} className="space-y-1">
              {item.command && (
                <div className="group flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="text-slate-500 select-none">
                      operator@sec-target:{item.cwd}$
                    </span>
                    <span className="font-bold text-white">{item.command}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.command);
                    }}
                    className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                  >
                    {copiedCmd === item.command ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              )}
              {item.stdout && (
                <pre className="font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-slate-300">
                  {item.stdout}
                </pre>
              )}
              {item.stderr && (
                <pre className="font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-rose-400">
                  {item.stderr}
                </pre>
              )}
            </div>
          ))}

          {/* Active Input Prompt */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="shrink-0 text-slate-500 select-none">
              operator@sec-target:{vfsState.cwd}$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent font-mono text-[11.5px] text-emerald-300 caret-emerald-400 outline-none"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </div>
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
