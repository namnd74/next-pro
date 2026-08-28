'use client';

import * as React from 'react';
import { Check, Copy, RotateCcw, Sparkles, Zap } from 'lucide-react';
import type { ArenaChallenge } from '../types';
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
  const config = challenge.repeaterConfig;

  const [method, setMethod] = React.useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>(
    config?.defaultMethod ?? 'GET'
  );
  const [url, setUrl] = React.useState(config?.defaultUrl ?? '/');
  const [rawHeaders, setRawHeaders] = React.useState(config?.defaultRawHeaders ?? '');
  const [body, setBody] = React.useState(config?.defaultBody ?? '');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedProof, setCopiedProof] = React.useState(false);

  // Response state
  const [response, setResponse] = React.useState<{
    statusCode: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    proofFlag?: string;
    isExploited: boolean;
  } | null>(() => {
    if (!config) return null;
    return {
      statusCode: config.simulatedResponses.baseResponse.statusCode,
      statusText: config.simulatedResponses.baseResponse.statusText,
      headers: config.simulatedResponses.baseResponse.headers,
      body: config.simulatedResponses.baseResponse.body,
      isExploited: false,
    };
  });

  // Sync state when challenge changes
  React.useEffect(() => {
    if (config) {
      setMethod(config.defaultMethod);
      setUrl(config.defaultUrl);
      setRawHeaders(config.defaultRawHeaders);
      setBody(config.defaultBody);
      setResponse({
        statusCode: config.simulatedResponses.baseResponse.statusCode,
        statusText: config.simulatedResponses.baseResponse.statusText,
        headers: config.simulatedResponses.baseResponse.headers,
        body: config.simulatedResponses.baseResponse.body,
        isExploited: false,
      });
    }
  }, [challenge.id, config]);

  const handleSendRequest = () => {
    if (!config) return;
    setIsLoading(true);

    setTimeout(() => {
      // Logic checking if request matches exploit characteristics
      let isExploit = false;

      // 1. Citrix Bleed check: Authorization header with long padding (> 40 A's) or over-read marker
      if (
        challenge.id.includes('citrix-bleed') &&
        rawHeaders.includes('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
      ) {
        isExploit = true;
      }
      // 2. Log4shell check: User-Agent or body contains ${jndi:
      else if (
        challenge.id.includes('log4shell') &&
        (rawHeaders.toLowerCase().includes('${jndi:') || body.includes('${jndi:'))
      ) {
        isExploit = true;
      }
      // 3. AWS SSRF check: 2852039166 or metadata path in body/url
      else if (
        challenge.id.includes('aws') &&
        (body.includes('2852039166') ||
          body.includes('169.254.169.254') ||
          url.includes('meta-data'))
      ) {
        isExploit = true;
      }
      // 4. Prototype pollution check: __proto__ in body
      else if (challenge.id.includes('proto') && body.includes('__proto__')) {
        isExploit = true;
      }
      // 5. Race condition check: X-Concurrency-Burst header or burst flag
      else if (
        challenge.id.includes('race') &&
        (rawHeaders.includes('Concurrency') || body.includes('1000'))
      ) {
        isExploit = true;
      } else {
        // Fallback default: if user pressed send with preloaded exploit payload
        isExploit = true;
      }

      if (isExploit) {
        const exp = config.simulatedResponses.exploitedResponse;
        setResponse({
          statusCode: exp.statusCode,
          statusText: exp.statusText,
          headers: exp.headers,
          body: exp.body,
          proofFlag: exp.proofFlag,
          isExploited: true,
        });
        if (onProofExtracted && exp.proofFlag) {
          onProofExtracted(exp.proofFlag);
        }
      } else {
        const base = config.simulatedResponses.baseResponse;
        setResponse({
          statusCode: base.statusCode,
          statusText: base.statusText,
          headers: base.headers,
          body: base.body,
          isExploited: false,
        });
      }

      setIsLoading(false);
    }, 450);
  };

  const handleResetPayload = () => {
    if (!config) return;
    setMethod(config.defaultMethod);
    setUrl(config.defaultUrl);
    setRawHeaders(config.defaultRawHeaders);
    setBody(config.defaultBody);
  };

  const handleCopyProof = () => {
    if (response?.proofFlag) {
      navigator.clipboard.writeText(response.proofFlag);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    }
  };

  if (!config) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Thử thách này không yêu cầu HTTP Repeater.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Target & URL Control Bar */}
      <div className="border-border/80 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-slate-950 p-3 shadow-md">
        <div className="flex min-w-[280px] flex-1 items-center gap-2">
          <select
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')
            }
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-mono text-xs font-black text-rose-400 focus:ring-1 focus:ring-rose-500 focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <div className="flex flex-1 items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white">
            <span className="mr-1 text-slate-500 select-none">
              https://{challenge.targetHost}:{challenge.targetPort}
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-emerald-400 focus:outline-none"
              placeholder="/api/v1/..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetPayload}
            className="h-8 rounded-xl border-slate-800 bg-slate-900 text-xs text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>

          <Button
            size="sm"
            onClick={handleSendRequest}
            disabled={isLoading}
            className="h-8 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang gửi...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                GỬI PAYLOAD
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Grid 2 Panes: Raw Request (Left) & Raw Response (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT PANE: REQUEST */}
        <Card className="flex flex-col rounded-2xl border-slate-800 bg-slate-950 p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              1. Raw Request Headers
            </span>
            <span className="font-mono text-[10px] text-rose-400">RFC 7230 Stream</span>
          </div>

          <textarea
            value={rawHeaders}
            onChange={(e) => setRawHeaders(e.target.value)}
            rows={method === 'GET' ? 12 : 6}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-xs leading-relaxed text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            placeholder="Host: ...&#10;User-Agent: ..."
          />

          {method !== 'GET' && (
            <div className="mt-3 flex flex-1 flex-col">
              <span className="mb-1 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                2. Request Body (Payload)
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-xs leading-relaxed text-emerald-400 focus:border-emerald-500/50 focus:outline-none"
                placeholder='{"param": "value"}'
              />
            </div>
          )}
        </Card>

        {/* RIGHT PANE: RESPONSE & PROOF EXTRACTION */}
        <Card className="flex flex-col rounded-2xl border-slate-800 bg-slate-950 p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Target Response & Leaked Memory
            </span>
            {response && (
              <Badge
                variant="outline"
                className={`font-mono text-[10px] font-bold uppercase ${
                  response.isExploited
                    ? 'animate-pulse border-rose-500/40 bg-rose-500/10 text-rose-400'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {response.statusCode} {response.statusText}
              </Badge>
            )}
          </div>

          <div className="h-64 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-xs leading-relaxed whitespace-pre text-slate-200">
            {response ? (
              <div className="space-y-2">
                <div className="text-slate-500">
                  HTTP/1.1 {response.statusCode} {response.statusText}
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="text-slate-400">
                      {k}: {v}
                    </div>
                  ))}
                </div>
                <div
                  className={`mt-2 border-t border-slate-800 pt-2 ${
                    response.isExploited ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {response.body}
                </div>
              </div>
            ) : (
              <span className="text-slate-600">
                Nhấn &quot;Gửi Payload&quot; để xem phản hồi...
              </span>
            )}
          </div>

          {/* PROOF EXTRACTION BANNER */}
          {response?.proofFlag && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <div className="font-mono text-xs font-extrabold text-emerald-300">
                  Flag bóc tách được:{' '}
                  <span className="text-white">{response.proofFlag}</span>
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
                {copiedProof ? 'Đã copy' : 'Copy Flag'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
