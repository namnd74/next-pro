'use client';

import * as React from 'react';
import {
  BookOpen,
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
  executeHonestShellCommand,
} from '../../fixtures/default-vfs-fixture';
import { indexedDbStorageEngine } from '../storage/indexeddb-storage-engine';
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
  const [isRestoredFromDb, setIsRestoredFromDb] = React.useState(false);
  const [showCheatSheet, setShowCheatSheet] = React.useState(false);

  const outputContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isMountedRef = React.useRef(false);

  // Restore session snapshot from IndexedDB on lesson mount
  React.useEffect(() => {
    let isCancelled = false;
    indexedDbStorageEngine.loadSnapshot(config.lessonId).then((snapshot) => {
      if (isCancelled || !snapshot?.vfs) return;
      const restoredVfs = snapshot.vfs as VfsState;
      setVfsState(restoredVfs);
      setIsRestoredFromDb(true);
      setHistoryItems((prev) => [
        ...prev,
        {
          id: `restore-${Date.now()}`,
          command: '',
          cwd: restoredVfs.cwd || '/home/operator',
          stdout:
            '💾 [INDEXEDDB] Đã khôi phục trạng thái môi trường làm việc từ phiên trước.\n',
          stderr: '',
          exitCode: 0,
        },
      ]);
    });
    return () => {
      isCancelled = true;
    };
  }, [config.lessonId]);

  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
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

    const result = executeHonestShellCommand(trimmed, vfsState);
    setVfsState(result.updatedState);

    // Persist snapshot to IndexedDB asynchronously (zero UI blocking)
    indexedDbStorageEngine
      .saveSnapshot(config.lessonId, {
        schemaVersion: 1,
        timestamp: Date.now(),
        vfs: result.updatedState,
        history: result.updatedState.history,
      })
      .catch((err) => console.warn('[TerminalView] Failed to save snapshot:', err));

    const newItem: TerminalHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      command: trimmed,
      cwd: vfsState.cwd,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };

    // Keep DOM buffer lean: cap at last 150 items to eliminate scroll jank
    setHistoryItems((prev) => [...prev, newItem].slice(-150));
    setCurrentInput('');
    setHistoryIndex(null);

    onExecution?.(result, trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Ctrl+L or Cmd+K: Clear screen
    if ((e.ctrlKey && e.key === 'l') || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
      e.preventDefault();
      setHistoryItems([]);
      setCurrentInput('');
      setHistoryIndex(null);
      return;
    }

    // Ctrl+C: Cancel current input line
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      const cancelItem: TerminalHistoryItem = {
        id: `cancel-${Date.now()}`,
        command: currentInput,
        cwd: vfsState.cwd,
        stdout: '^C',
        stderr: '',
        exitCode: 130,
      };
      setHistoryItems((prev) => [...prev, cancelItem].slice(-150));
      setCurrentInput('');
      setHistoryIndex(null);
      return;
    }

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

  const handleReset = async (): Promise<void> => {
    await indexedDbStorageEngine.clearSnapshot(config.lessonId);
    setIsRestoredFromDb(false);
    const fresh = createInitialVfsState(config.initialVfs);
    setVfsState(fresh);
    setHistoryItems([
      {
        id: `reset-${Date.now()}`,
        command: '',
        cwd: '/home/operator',
        stdout: '🔄 [RESET] Môi trường VFS đã được đặt lại về trạng thái sạch ban đầu.\n',
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
            {isRestoredFromDb && (
              <Badge
                variant="outline"
                className="border-sky-500/40 bg-sky-950/40 text-[9px] text-sky-400"
              >
                💾 INDEXEDDB RESTORED
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-slate-700 bg-slate-900/60 font-mono text-[9px] text-slate-400"
            >
              SIMULATION SHELL · DEMO MODE
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowCheatSheet((prev) => !prev);
              }}
              className="h-6 gap-1 px-2 text-[10px] text-amber-400 hover:text-white"
            >
              <BookOpen className="h-3 w-3 text-amber-400" />
              Cheat Sheet
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-testid="reset-vfs-button"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="h-6 gap-1 px-2 text-[10px] text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Reset VFS
            </Button>
          </div>
        </div>

        {/* Quick Help / Cheat Sheet Drawer */}
        {showCheatSheet && (
          <div className="mb-3 space-y-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 font-mono text-[11px] text-slate-300">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-1 font-bold text-amber-400">
              <span>📖 POSIX CHEAT SHEET (45+ UTILITIES & SHORTCUTS)</span>
              <span className="text-[10px] text-slate-400">
                Ctrl+L (Clear) · Ctrl+C (Interrupt) · Tab (Complete)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px] sm:grid-cols-4">
              <div>
                <span className="font-bold text-emerald-400">Permissions:</span>
                <div>chmod 640 /etc/shadow</div>
                <div>chmod 4755 /bin/suid</div>
                <div>find / -perm -4000</div>
              </div>
              <div>
                <span className="font-bold text-sky-400">Recon & Net:</span>
                <div>nmap -sV 10.0.4.10</div>
                <div>curl -I http://10.0.4.10</div>
                <div>ping -c 3 10.0.4.1</div>
              </div>
              <div>
                <span className="font-bold text-purple-400">Files & Text:</span>
                <div>cat /etc/passwd | grep root</div>
                <div>touch, ls -la, head, tail</div>
                <div>wc -l, sort, uniq, cut</div>
              </div>
              <div>
                <span className="font-bold text-rose-400">Identity & System:</span>
                <div>whoami, id, uname -a</div>
                <div>ps aux, kill -9 &lt;pid&gt;</div>
                <div>history, pwd, cd, env</div>
              </div>
            </div>
          </div>
        )}

        {/* Output Stream */}
        <div
          ref={outputContainerRef}
          className="cyber-scrollbar max-h-[380px] min-h-[240px] space-y-2 overflow-y-auto pr-1"
        >
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
              data-testid="terminal-input"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent font-mono text-[11.5px] text-emerald-300 caret-emerald-400 outline-none"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
