'use client';

import * as React from 'react';
import { CornerDownLeft, Terminal as TerminalIcon } from 'lucide-react';
import type { ArenaChallenge } from '../types';
import { useArenaStore } from '../store/use-arena-store';
import { Card } from '@/components/ui/card';

interface ArenaTerminalStageProps {
  challenge: ArenaChallenge;
  onProofExtracted?: (proof: string) => void;
}

export const ArenaTerminalStage: React.FC<ArenaTerminalStageProps> = ({
  challenge,
  onProofExtracted,
}) => {
  const terminalConfig = challenge.terminalConfig;
  const { getOrCreateTargetSession, executeTerminalCommand } = useArenaStore();
  const session = getOrCreateTargetSession(challenge.id);

  const [history, setHistory] = React.useState<
    Array<{
      command: string;
      output: string;
      isError?: boolean;
      user?: string;
      cwd?: string;
    }>
  >(() => [
    {
      command: '',
      output:
        (terminalConfig?.bannerText ??
          '[*] Kali GNU/Linux Rolling 2026.3 - Cyber Range Terminal Ready\n') +
        `[*] Target Host: ${challenge.targetHost}:${challenge.targetPort} (${challenge.title})\n` +
        `[*] Type 'help' to view all 45+ POSIX utilities, or run 'nmap' to begin reconnaissance.\n`,
      user: session.activeUser,
      cwd: session.vfsState.cwd,
    },
  ]);
  const [currentInput, setCurrentInput] = React.useState('');
  const [commandHistoryIndex, setCommandHistoryIndex] = React.useState(-1);
  const terminalBottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const isRoot = session.vfsState.user.uid === 0;
  const isFoothold =
    session.vfsState.user.username === 'www-data' || session.stage === 'foothold';

  const promptUser = session.vfsState.user.username;
  const promptHost = session.currentHost === '10.0.4.15' ? 'kali' : 'target';
  const promptSymbol = isRoot ? '#' : '$';
  const promptColor = isRoot
    ? 'text-rose-400 font-black'
    : isFoothold
      ? 'text-amber-400 font-bold'
      : 'text-emerald-400 font-bold';

  const handleRunCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      setCurrentInput('');
      return;
    }

    const res = executeTerminalCommand(challenge.id, trimmed);

    // Check if output contains user or root flag
    if (res.stdout.includes('OS_0DAY{') || res.stdout.includes('OS_ROOT{')) {
      const match = res.stdout.match(/OS_[A-Z0-9_]+\{[^}]+\}/);
      if (match && onProofExtracted) {
        onProofExtracted(match[0]);
      }
    }

    setHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        output: res.stdout || res.stderr,
        isError: res.exitCode !== 0,
        user: session.activeUser,
        cwd: session.vfsState.cwd,
      },
    ]);
    setCurrentInput('');
    setCommandHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const userCmds = history.map((h) => h.command).filter(Boolean);
      if (userCmds.length === 0) return;
      const nextIdx =
        commandHistoryIndex === -1
          ? userCmds.length - 1
          : Math.max(0, commandHistoryIndex - 1);
      setCommandHistoryIndex(nextIdx);
      setCurrentInput(userCmds[nextIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const userCmds = history.map((h) => h.command).filter(Boolean);
      if (commandHistoryIndex === -1) return;
      const nextIdx = commandHistoryIndex + 1;
      if (nextIdx >= userCmds.length) {
        setCommandHistoryIndex(-1);
        setCurrentInput('');
      } else {
        setCommandHistoryIndex(nextIdx);
        setCurrentInput(userCmds[nextIdx] ?? '');
      }
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-black font-mono shadow-2xl">
      {/* TERMINAL TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs font-bold text-slate-300">
            <TerminalIcon className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />
            {promptUser}@{promptHost}:{session.vfsState.cwd}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${
              isRoot
                ? 'animate-pulse border border-rose-500/50 bg-rose-500/20 text-rose-300'
                : isFoothold
                  ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {isRoot
              ? '👑 ROOT (UID 0)'
              : isFoothold
                ? '⚡ FOOTHOLD (UID 1000)'
                : '🌐 ATTACKER'}
          </span>
          <span className="text-[11px] text-slate-500">{session.currentHost}</span>
        </div>
      </div>

      {/* QUICK COMMAND CHIPS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-900 bg-slate-950/60 px-4 py-2">
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Gợi ý lệnh:
        </span>
        {terminalConfig?.sampleCommands.map((cmd, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleRunCommand(cmd)}
            className="rounded-lg border border-slate-800 bg-slate-900/90 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <code>{cmd}</code>
          </button>
        ))}
      </div>

      {/* TERMINAL OUTPUT STREAM */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="h-[420px] overflow-y-auto p-4 text-xs leading-relaxed text-slate-300 select-text"
      >
        {history.map((h, i) => (
          <div key={i} className="mb-2">
            {h.command && (
              <div className="flex items-center gap-1 text-slate-400">
                <span className={promptColor}>
                  {h.user || promptUser}@{promptHost}:{h.cwd || '~'}
                  {promptSymbol}
                </span>
                <span className="font-bold text-white">{h.command}</span>
              </div>
            )}
            <pre
              className={`mt-1 font-mono whitespace-pre-wrap ${
                h.isError ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {h.output}
            </pre>
          </div>
        ))}

        {/* ACTIVE INPUT LINE */}
        <div className="flex items-center gap-2 pt-1">
          <span className={promptColor}>
            {promptUser}@{promptHost}:{session.vfsState.cwd}
            {promptSymbol}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none bg-transparent font-mono text-xs text-white focus:outline-none"
            placeholder="gõ lệnh (vd: ls -la, sudo -l, cat /root/root.txt)..."
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleRunCommand(currentInput)}
            className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <CornerDownLeft className="h-3 w-3" />
          </button>
        </div>

        <div ref={terminalBottomRef} />
      </div>
    </Card>
  );
};
