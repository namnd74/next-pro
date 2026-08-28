'use client';

import * as React from 'react';
import { CornerDownLeft, Sparkles } from 'lucide-react';
import type { ArenaChallenge } from '../types';
import { Button } from '@/components/ui/button';
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

  const [history, setHistory] = React.useState<
    Array<{ command: string; output: string; isError?: boolean }>
  >(() => [
    {
      command: '',
      output:
        (terminalConfig?.bannerText ??
          '[*] Kali GNU/Linux Rolling 2026.3 - Cyber Range Terminal Ready\n') +
        `[*] Target: ${challenge.targetHost}:${challenge.targetPort}\n`,
    },
  ]);
  const [currentInput, setCurrentInput] = React.useState('');
  const terminalBottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    let output = '';

    // Specialized command simulations per challenge
    if (trimmed.startsWith('nmap')) {
      output =
        `Starting Nmap 7.94 ( https://nmap.org )\n` +
        `Nmap scan report for ${challenge.targetHost}\n` +
        `Host is up (0.0012s latency).\n` +
        `PORT     STATE SERVICE       VERSION\n` +
        `${challenge.targetPort}/tcp OPEN  target-svc     Active Service (${challenge.title})\n\n` +
        `Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
    } else if (trimmed.startsWith('impacket-GetUserSPNs')) {
      output =
        `[*] Requesting TGS for SPN: MSSQLSvc/db01.corp.internal:1433\n` +
        `[*] Hash extracted successfully:\n` +
        `$krb5tgs$23$*svc_mssql$corp.internal*$MSSQLSvc/db01.corp.internal:1433*...hash_data...\n` +
        `[+] Hash written to /home/operator/ad-tools/hashes.kerb`;
    } else if (trimmed.startsWith('john') || trimmed.startsWith('hashcat')) {
      output =
        `Using default wordlist: /usr/share/wordlists/rockyou.txt\n` +
        `Loaded 1 password hash (Kerberos 5 TGS-REP etype 23 [MD4 HMAC-MD5 RC4])\n` +
        `Summer2026!      (svc_mssql)\n` +
        `1g 0:00:00:02 DONE 3/3 (2026-08-28 09:27) 0.4444g/s 452.0p/s 452.0c/s 452.0C/s Summer2026!..password\n` +
        `[+] CRACKED PASSWORD: Summer2026!\n` +
        `[!] FLAG: ${challenge.expectedFlag}`;
      if (onProofExtracted) {
        onProofExtracted(challenge.expectedFlag);
      }
    } else if (trimmed.startsWith('curl')) {
      output =
        `HTTP/1.1 200 OK\n` +
        `Server: Exploit-Target/1.0\n` +
        `Content-Type: application/json\n\n` +
        `{\n` +
        `  "status": "EXPLOITED",\n` +
        `  "proof": "${challenge.expectedFlag}"\n` +
        `}`;
      if (onProofExtracted) {
        onProofExtracted(challenge.expectedFlag);
      }
    } else if (trimmed === 'clear') {
      setHistory([]);
      setCurrentInput('');
      return;
    } else if (trimmed.startsWith('cat') || trimmed.startsWith('ls')) {
      output =
        `total 24\n` +
        `-rwxr-xr-x 1 operator operator 1240 Aug 28 09:00 exploit.py\n` +
        `-rw-r--r-- 1 operator operator  512 Aug 28 09:05 target_notes.txt\n` +
        `-rw-r--r-- 1 operator operator   64 Aug 28 09:10 proof.txt`;
    } else {
      output = `zsh: command executed: ${trimmed}\n[!] Target responded with standard ACK. Try nmap or specific exploit script.`;
    }

    setHistory((prev) => [...prev, { command: trimmed, output }]);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(currentInput);
    }
  };

  return (
    <div className="space-y-3">
      {/* Sample Quick Commands Bar */}
      {terminalConfig?.sampleCommands && terminalConfig.sampleCommands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Lệnh gợi ý nhanh:
          </span>
          {terminalConfig.sampleCommands.map((cmd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => executeCommand(cmd)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-[10px] text-emerald-400 transition hover:border-emerald-500 hover:bg-slate-800"
            >
              $ {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Terminal Screen */}
      <Card className="flex flex-col rounded-2xl border-slate-800 bg-black p-4 font-mono text-xs shadow-2xl">
        <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2 text-slate-500">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {terminalConfig?.user ?? 'operator'}@{terminalConfig?.hostname ?? 'kali-box'}{' '}
            ({terminalConfig?.ip ?? '10.0.4.15'})
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setHistory([])}
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-white"
          >
            Clear Screen
          </Button>
        </div>

        {/* History Log */}
        <div className="custom-scrollbar h-72 space-y-2 overflow-y-auto leading-relaxed text-slate-200">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              {item.command && (
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <span className="text-slate-500">operator@kali:~$</span>
                  <span>{item.command}</span>
                </div>
              )}
              <div className="text-[11.5px] leading-relaxed whitespace-pre text-slate-300">
                {item.output}
              </div>
            </div>
          ))}
          <div ref={terminalBottomRef} />
        </div>

        {/* Input Line */}
        <div className="mt-3 flex items-center gap-2 border-t border-slate-800/80 pt-3">
          <span className="font-bold text-emerald-400">operator@kali:~$</span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập lệnh bash (nmap, curl, john, impacket...)"
            className="flex-1 bg-transparent font-mono text-xs text-white placeholder-slate-600 focus:outline-none"
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => executeCommand(currentInput)}
            className="h-7 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
