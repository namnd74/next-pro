'use client';

import * as React from 'react';
import { Globe, Layers, Network, Send, Sparkles } from 'lucide-react';
import type {
  HttpRequestState,
  HttpResponseState,
  PacketHeaderInfo,
  WorkbenchConfig,
} from '../types';
import {
  createDefaultHttpRequest,
  decodePacketHeaders,
  executeHttpRequest,
} from '../engines/http-packet-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HttpRepeaterViewProps {
  config: WorkbenchConfig;
  onExecution?: (res: HttpResponseState, req: HttpRequestState) => void;
}

export function HttpRepeaterView({ config, onExecution }: HttpRepeaterViewProps) {
  const [request, setRequest] = React.useState<HttpRequestState>(
    () => config.initialHttpRequest || createDefaultHttpRequest()
  );
  const [response, setResponse] = React.useState<HttpResponseState | null>(null);
  const [packetHeaders, setPacketHeaders] = React.useState<PacketHeaderInfo[]>([]);
  const [activeTab, setActiveTab] = React.useState<'http' | 'packet'>('http');

  const handleSend = (targetReq: HttpRequestState = request) => {
    const res = executeHttpRequest(targetReq);
    setResponse(res);
    const decoded = decodePacketHeaders(targetReq);
    setPacketHeaders(decoded);
    onExecution?.(res, targetReq);
  };

  React.useEffect(() => {
    handleSend(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Sample Header/Payload shortcuts */}
      {config.samplePayloads && config.samplePayloads.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Headers / Payloads mẫu:
          </span>
          {config.samplePayloads.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setRequest((prev) => ({
                  ...prev,
                  rawHeaders: `${prev.rawHeaders.trim()}\n${sample}`,
                }));
              }}
              className="border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/40 group text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <span>+ {sample}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Mode Toggle: HTTP Repeater vs Packet Layer Inspector */}
      <div className="border-border/60 flex items-center justify-between border-b pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('http')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'http'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            HTTP Request Repeater
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packet')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'packet'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            Mổ xẻ TCP/IP Packet Layers
          </button>
        </div>
        {response && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <Badge
              variant={response.statusCode < 400 ? 'success' : 'destructive'}
              className="text-[10px] font-bold"
            >
              {response.statusCode} {response.statusText}
            </Badge>
            <span className="text-muted-foreground text-[11px]">
              {response.durationMs.toFixed(2)} ms
            </span>
          </div>
        )}
      </div>

      {activeTab === 'http' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Request Editor */}
          <Card className="glass-card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-extrabold uppercase">
                Raw HTTP Request
              </span>
              <Button
                type="button"
                onClick={() => handleSend()}
                size="sm"
                className="h-7 gap-1 text-xs font-bold"
              >
                <Send className="h-3 w-3" />
                Send Request
              </Button>
            </div>

            {/* Request Line Controls */}
            <div className="flex gap-2 font-mono text-xs">
              <select
                value={request.method}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    method: e.target.value as HttpRequestState['method'],
                  }))
                }
                className="border-border/80 bg-background text-primary rounded-lg border px-2.5 py-1.5 font-bold outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
              <input
                type="text"
                value={request.url}
                onChange={(e) => setRequest((prev) => ({ ...prev, url: e.target.value }))}
                className="border-border/80 bg-background text-foreground ring-primary/20 flex-1 rounded-lg border px-3 py-1.5 font-mono text-xs outline-none focus:ring-2"
              />
            </div>

            {/* Raw Headers Textarea */}
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-semibold">
                Headers (key: value):
              </label>
              <textarea
                value={request.rawHeaders}
                onChange={(e) =>
                  setRequest((prev) => ({ ...prev, rawHeaders: e.target.value }))
                }
                rows={7}
                className="ring-primary/20 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 outline-none focus:ring-1"
                spellCheck="false"
              />
            </div>
          </Card>

          {/* Response Viewer */}
          <Card className="glass-card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-extrabold uppercase">
                Raw HTTP Response
              </span>
              {response && (
                <span className="text-muted-foreground font-mono text-[10px]">
                  Content-Type: {response.contentType}
                </span>
              )}
            </div>

            {/* Status Line */}
            {response ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
                  <div className="mb-2 border-b border-slate-800 pb-1.5 font-bold text-emerald-400">
                    HTTP/1.1 {response.statusCode} {response.statusText}
                  </div>
                  {/* Response Headers */}
                  <div className="mb-2 space-y-0.5 border-b border-slate-800/80 pb-2 text-[11px] text-slate-400">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-500">{k}:</span> {v}
                      </div>
                    ))}
                  </div>
                  {/* Response Body */}
                  <pre className="max-h-[220px] overflow-y-auto text-[11.5px] leading-relaxed whitespace-pre-wrap text-slate-100">
                    {response.body}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground p-8 text-center text-xs">
                Chưa có phản hồi. Bấm &quot;Send Request&quot; để gửi gói tin.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Packet Decoder View */}
      {activeTab === 'packet' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {packetHeaders.map((packetLayer) => (
              <Card key={packetLayer.layer} className="glass-card space-y-3 p-4">
                <div className="border-border/50 flex items-center justify-between border-b pb-2">
                  <h4 className="text-primary flex items-center gap-1.5 text-xs font-extrabold">
                    <Layers className="h-3.5 w-3.5" />
                    {packetLayer.title}
                  </h4>
                  <Badge variant="outline" className="text-[9px]">
                    {packetLayer.layer}
                  </Badge>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  {packetLayer.fields.map((f) => (
                    <div key={f.name} className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-foreground font-bold">{f.name}:</span>
                        <p className="text-muted-foreground text-[10px]">
                          {f.description}
                        </p>
                      </div>
                      <span className="text-right font-semibold text-emerald-500 dark:text-emerald-400">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
