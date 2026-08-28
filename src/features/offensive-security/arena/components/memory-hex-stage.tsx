'use client';

import * as React from 'react';
import { Binary, Check, Copy, Sparkles } from 'lucide-react';
import type { ArenaChallenge } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MemoryHexStageProps {
  challenge: ArenaChallenge;
  onProofExtracted?: (proof: string) => void;
}

export const MemoryHexStage: React.FC<MemoryHexStageProps> = ({
  challenge,
  onProofExtracted,
}) => {
  const mem = challenge.memoryConfig;
  const [copied, setCopied] = React.useState(false);
  const [selectedLineIdx, setSelectedLineIdx] = React.useState<number | null>(null);

  if (!mem) {
    return (
      <div className="text-muted-foreground rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center">
        Thử thách này không yêu cầu Memory Hex Dump.
      </div>
    );
  }

  const handleCopySecret = () => {
    if (mem.secretPayload) {
      navigator.clipboard.writeText(mem.secretPayload);
      setCopied(true);
      if (onProofExtracted) {
        onProofExtracted(mem.secretPayload);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Memory Region Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-white">
                {mem.regionName}
              </span>
              <Badge
                variant="outline"
                className="border-sky-500/30 bg-sky-500/10 font-mono text-[10px] text-sky-400"
              >
                Base: {mem.baseAddress}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Virtual Memory Buffer Analyzer (Hexadecimal + Raw ASCII Stream)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCopySecret}
            className="h-8 rounded-xl bg-sky-600 px-3.5 text-xs font-black text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500"
          >
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5 text-white" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {copied ? 'Đã copy Flag' : 'Trích xuất Flag'}
          </Button>
        </div>
      </div>

      {/* Memory Hint Card */}
      <Card className="flex items-start gap-2 rounded-2xl border-sky-500/20 bg-sky-500/5 p-3.5 text-xs text-sky-300">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
        <span>
          <strong className="text-white">Gợi ý phân tích bộ nhớ:</strong> {mem.hint}
        </span>
      </Card>

      {/* Hex Dump Interactive Table Viewer */}
      <Card className="overflow-hidden rounded-2xl border-slate-800 bg-slate-950 shadow-xl">
        <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/60 px-4 py-2 font-mono text-[11px] font-bold text-slate-400">
          <div className="col-span-3 text-slate-500">OFFSET</div>
          <div className="col-span-6 text-slate-400">HEX BYTES DUMP (16 BYTES/LINE)</div>
          <div className="col-span-3 text-right text-slate-400">ASCII DECODE</div>
        </div>

        <div className="divide-y divide-slate-800/40 font-mono text-xs">
          {mem.rawHexLines.map((line, idx) => {
            const isSelected = selectedLineIdx === idx;
            return (
              <div
                key={line.offset}
                onClick={() => setSelectedLineIdx(idx)}
                className={`grid cursor-pointer grid-cols-12 items-center px-4 py-2.5 transition-colors ${
                  line.isSecretOffset
                    ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'
                    : isSelected
                      ? 'bg-slate-800/60 text-white'
                      : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                {/* OFFSET */}
                <div className="col-span-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>{line.offset}</span>
                  {line.tag && (
                    <span className="py-0.2 rounded border border-rose-500/30 bg-rose-500/20 px-1 text-[9px] font-bold text-rose-400">
                      {line.tag}
                    </span>
                  )}
                </div>

                {/* HEX BYTES */}
                <div className="col-span-6 font-bold tracking-wider">{line.hex}</div>

                {/* ASCII */}
                <div className="col-span-3 text-right font-bold text-emerald-400">
                  |{line.ascii}|
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
