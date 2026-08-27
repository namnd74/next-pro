'use client';

import * as React from 'react';
import {
  CornerDownLeft,
  Globe,
  Layers,
  Play,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import type { HttpRequestState, HttpResponseState, WorkbenchConfig } from '../types';
import {
  createDefaultHttpRequest,
  decodePacketLayers,
  executeHttpRequest,
  parseRawHeaders,
} from '../engines/http-packet-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HttpRepeaterViewProps {
  config: WorkbenchConfig;
  onExecution?: (result: HttpResponseState, req: HttpRequestState) => void;
}

export const HttpRepeaterView: React.FC<HttpRepeaterViewProps> = ({
  config,
  onExecution,
}) => {
  const [request, setRequest] = React.useState<HttpRequestState>(
    () => config.initialHttpRequest || createDefaultHttpRequest()
  );
  const [response, setResponse] = React.useState<HttpResponseState | null>(null);
  const [activeTab, setActiveTab] = React.useState<'response' | 'packet'>('response');

  const handleSend = (): void => {
    const parsedHeaders = parseRawHeaders(request.rawHeaders);
    const updatedReq: HttpRequestState = {
      ...request,
      headers: parsedHeaders,
    };
    const res = executeHttpRequest(updatedReq);
    setResponse(res);
    onExecution?.(res, updatedReq);
  };

  const handleReset = (): void => {
    const fresh = config.initialHttpRequest || createDefaultHttpRequest();
    setRequest(fresh);
    setResponse(null);
  };

  const packetLayers = React.useMemo(() => decodePacketLayers(request), [request]);

  return (
    <div className="space-y-4">
      {/* Sample Header Payloads */}
      {config.samplePayloads && config.samplePayloads.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Header mẫu:
          </span>
          {config.samplePayloads.map((payload) => (
            <button
              key={payload}
              type="button"
              onClick={() => {
                if (
                  payload.startsWith('X-Forwarded-For') ||
                  payload.startsWith('X-Real-IP') ||
                  payload.startsWith('Authorization')
                ) {
                  setRequest((prev) => ({
                    ...prev,
                    rawHeaders: `${prev.rawHeaders}\n${payload}`,
                  }));
                } else {
                  setRequest((prev) => ({
                    ...prev,
                    url: payload.startsWith('/') ? payload : prev.url,
                  }));
                }
              }}
              className="border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/40 group text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <span>{payload}</span>
              <CornerDownLeft className="text-muted-foreground group-hover:text-primary h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* HTTP Repeater Panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Request Builder Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl ring-1 ring-slate-800">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">
                  HTTP Repeater & Request Forge
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 gap-1 px-2 text-[10px] text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Req
              </Button>
            </div>

            {/* Method & URL Input Bar */}
            <div className="mb-3 flex items-center gap-2">
              <select
                value={request.method}
                onChange={(e) =>
                  setRequest({
                    ...request,
                    method: e.target.value as HttpRequestState['method'],
                  })
                }
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-amber-400 outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
              <input
                type="text"
                value={request.url}
                onChange={(e) => setRequest({ ...request, url: e.target.value })}
                placeholder="/api/v1/resource"
                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            {/* Raw Headers Editor */}
            <div className="space-y-1.5">
              <div className="font-sans text-[11px] text-slate-400">
                Raw HTTP Headers (Key: Value)
              </div>
              <textarea
                value={request.rawHeaders}
                onChange={(e) => setRequest({ ...request, rawHeaders: e.target.value })}
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 font-mono text-[11.5px] text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500/40"
                spellCheck="false"
              />
            </div>

            {/* Request Body Editor (if not GET) */}
            {request.method !== 'GET' && (
              <div className="mt-2 space-y-1.5">
                <div className="font-sans text-[11px] text-slate-400">
                  Request Body (JSON / Payload)
                </div>
                <textarea
                  value={request.body}
                  onChange={(e) => setRequest({ ...request, body: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 font-mono text-[11.5px] text-slate-300 outline-none"
                  placeholder='{"username": "admin", "password": "..."}'
                  spellCheck="false"
                />
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end border-t border-slate-800/80 pt-3">
            <Button
              onClick={handleSend}
              className="h-8 gap-1.5 bg-emerald-600 px-4 text-xs font-medium text-white hover:bg-emerald-500"
            >
              <Send className="h-3.5 w-3.5" />
              Send Request
            </Button>
          </div>
        </div>

        {/* Response & Packet Decoder Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl ring-1 ring-slate-800">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('response')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
                  activeTab === 'response'
                    ? 'bg-emerald-500/20 font-semibold text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                Response Data
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('packet')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
                  activeTab === 'packet'
                    ? 'bg-emerald-500/20 font-semibold text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Packet Decoder (L2-L7)
              </button>
            </div>

            {response && (
              <Badge
                className={
                  response.statusCode === 200
                    ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                    : response.statusCode === 403
                      ? 'border-rose-500/40 bg-rose-950/60 text-rose-300'
                      : 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                }
              >
                HTTP {response.statusCode} {response.statusText} · {response.durationMs}ms
              </Badge>
            )}
          </div>

          {/* Response Tab */}
          {activeTab === 'response' && (
            <div>
              {response ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                    <div className="mb-1 text-[10px] text-slate-500">
                      Response Headers
                    </div>
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k} className="text-[11px] text-slate-400">
                        <span className="text-slate-500">{k}:</span> {v}
                      </div>
                    ))}
                  </div>

                  <div className="max-h-[220px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <pre className="font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-emerald-300">
                      {response.body}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center font-sans text-xs text-slate-500">
                  Nhấn Send Request để gửi yêu cầu và kiểm tra phản hồi từ backend.
                </div>
              )}
            </div>
          )}

          {/* Packet Decoder Tab */}
          {activeTab === 'packet' && (
            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
              {packetLayers.map((layer) => (
                <div
                  key={layer.layer}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5"
                >
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-semibold text-slate-200">
                    <span>{layer.title}</span>
                    <Badge
                      variant="outline"
                      className="border-slate-700 text-[9px] text-slate-400"
                    >
                      {layer.layer}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {layer.fields.map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <span className="text-slate-400">{f.name}:</span>
                        <span className="font-mono text-emerald-300">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
