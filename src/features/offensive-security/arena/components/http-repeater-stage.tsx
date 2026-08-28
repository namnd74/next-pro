'use client';

import * as React from 'react';
import { Check, Copy, LayoutGrid, Rows, Send, Sparkles, Zap } from 'lucide-react';
import type { ArenaChallenge } from '../types';
import { useArenaStore } from '../store/use-arena-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HttpRepeaterStageProps {
  challenge: ArenaChallenge;
  onProofExtracted?: (proof: string) => void;
}

export const HttpRepeaterStage: React.FC<HttpRepeaterStageProps> = ({
  challenge,
  onProofExtracted,
}) => {
  const repeaterConfig = challenge.repeaterConfig;
  const triggerFootholdExploit = useArenaStore((s) => s.triggerFootholdExploit);

  const [method, setMethod] = React.useState(repeaterConfig?.defaultMethod ?? 'GET');
  const [url, setUrl] = React.useState(repeaterConfig?.defaultUrl ?? '/');
  const [rawHeaders, setRawHeaders] = React.useState(
    repeaterConfig?.defaultRawHeaders ??
      `Host: ${challenge.targetHost}:${challenge.targetPort}\nUser-Agent: Mozilla/5.0\nAccept: */*\nConnection: close`
  );
  const [body, setBody] = React.useState(repeaterConfig?.defaultBody ?? '');
  const [activeRequestTab, setActiveRequestTab] = React.useState<'headers' | 'body'>(
    'headers'
  );
  const [layoutMode, setLayoutMode] = React.useState<'side' | 'stacked'>('side');

  const [response, setResponse] = React.useState<{
    statusCode: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    proofFlag?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedProof, setCopiedProof] = React.useState(false);

  const handleSendRequest = () => {
    setIsLoading(true);

    setTimeout(() => {
      let isExploit = false;
      const combinedPayload = `${rawHeaders}\n${body}`;

      // Challenge-Specific Dynamic Exploit Triggers
      if (challenge.id === 'cve-2023-4966-citrix-bleed') {
        // Must contain Authorization with >64 padding chars
        const authMatch = rawHeaders.match(
          /Authorization:\s*Bearer\s+([A-Za-z0-9+/=_-]{50,})/i
        );
        if (authMatch) {
          isExploit = true;
        }
      } else if (challenge.id === 'cve-2021-44228-log4shell') {
        // Must contain JNDI expression
        if (
          combinedPayload.includes('${jndi:ldap:') ||
          combinedPayload.includes('${jndi:rmi:') ||
          combinedPayload.includes('${jndi:dns:')
        ) {
          isExploit = true;
        }
      } else if (challenge.id === 'bb-aws-01-imdsv2-ssrf') {
        // Must contain decimal IP 2852039166 or metadata path
        if (
          combinedPayload.includes('2852039166') ||
          combinedPayload.includes('security-credentials')
        ) {
          isExploit = true;
        }
      } else if (challenge.id === '0d-taint-01-proto-pollution') {
        // Must contain prototype pollution payload
        if (
          combinedPayload.includes('__proto__') ||
          combinedPayload.includes('prototype')
        ) {
          isExploit = true;
        }
      } else if (challenge.id === 'bb-race-03-limit-overrun') {
        // Concurrency burst header
        if (
          combinedPayload.includes('X-Concurrency-Burst') ||
          combinedPayload.includes('concurrency')
        ) {
          isExploit = true;
        }
      } else {
        isExploit = true;
      }

      if (isExploit && repeaterConfig?.simulatedResponses.exploitedResponse) {
        const exp = repeaterConfig.simulatedResponses.exploitedResponse;
        setResponse(exp);
        if (exp.proofFlag && onProofExtracted) {
          onProofExtracted(exp.proofFlag);
        }
        // Trigger session broker to spawn live reverse shell
        triggerFootholdExploit(challenge.id);
      } else if (repeaterConfig?.simulatedResponses.baseResponse) {
        setResponse(repeaterConfig.simulatedResponses.baseResponse);
      } else {
        setResponse({
          statusCode: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
          body: '{"status": "ok", "message": "Standard server response"}',
        });
      }

      setIsLoading(false);
    }, 350);
  };

  const handleCopyProof = () => {
    if (response?.proofFlag) {
      navigator.clipboard.writeText(response.proofFlag);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 font-mono shadow-2xl">
      {/* HTTP TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 p-3">
        <div className="flex flex-1 items-center gap-2">
          <select
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')
            }
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-200 focus:border-slate-700 focus:outline-none"
            placeholder="/endpoint"
          />

          <Button
            size="sm"
            onClick={handleSendRequest}
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-4 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-red-400"
          >
            {isLoading ? (
              <Zap className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            GỬI PAYLOAD
          </Button>
        </div>

        {/* LAYOUT SWITCHER */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setLayoutMode('side')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
              layoutMode === 'side'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Hiển thị 2 Cột (Side-by-Side)"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('stacked')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
              layoutMode === 'stacked'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Hiển thị Hàng Dọc (Stacked)"
          >
            <Rows className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* REQUEST / RESPONSE PANES */}
      <div
        className={`grid gap-4 p-4 ${
          layoutMode === 'side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* REQUEST PANE */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              HTTP Raw Request
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveRequestTab('headers')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeRequestTab === 'headers'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Headers
              </button>
              <button
                type="button"
                onClick={() => setActiveRequestTab('body')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeRequestTab === 'body'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Body Payload
              </button>
            </div>
          </div>

          {activeRequestTab === 'headers' ? (
            <textarea
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              className="h-[360px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-400 focus:border-slate-700 focus:outline-none"
              placeholder="Host: target&#10;Authorization: Bearer ..."
            />
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="h-[360px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-amber-300 focus:border-slate-700 focus:outline-none"
              placeholder='{"username": "admin"}'
            />
          )}
        </div>

        {/* RESPONSE PANE */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              Server Response
            </span>
            {response && (
              <Badge
                className={`font-mono text-[10px] font-bold ${
                  response.statusCode >= 200 && response.statusCode < 300
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                    : 'border-rose-500/40 bg-rose-500/20 text-rose-400'
                }`}
              >
                {response.statusCode} {response.statusText}
              </Badge>
            )}
          </div>

          <div className="relative h-[360px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
            {response ? (
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-500">{k}:</span> {v}
                    </div>
                  ))}
                </div>
                <pre className="font-mono text-xs whitespace-pre-wrap text-slate-200">
                  {response.body}
                </pre>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-600">
                Nhấn &quot;GỬI PAYLOAD&quot; để quan sát phản hồi máy chủ...
              </div>
            )}
          </div>

          {response?.proofFlag && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <div className="font-mono text-xs font-extrabold text-emerald-300">
                  Proof Flag: <span className="text-white">{response.proofFlag}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyProof}
                className="h-7 rounded-lg px-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
              >
                {copiedProof ? (
                  <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="mr-1 h-3.5 w-3.5" />
                )}
                {copiedProof ? 'Đã copy' : 'Copy'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
