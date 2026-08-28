'use client';

import * as React from 'react';
import { AlertTriangle, FileCode, Flame, ShieldCheck } from 'lucide-react';
import type { ArenaChallenge } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface PatchDiffStageProps {
  challenge: ArenaChallenge;
}

export const PatchDiffStage: React.FC<PatchDiffStageProps> = ({ challenge }) => {
  const diff = challenge.diffConfig;

  if (!diff) {
    return (
      <div className="text-muted-foreground rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center">
        Thử thách này không có dữ liệu đối chiếu Patch Diff.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File & Taint Analysis Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 shadow-md">
        <div className="flex items-center gap-2.5">
          <FileCode className="h-5 w-5 text-amber-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-white">
                {diff.filename}
              </span>
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-400 uppercase"
              >
                {diff.language}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Phân tích Taint Flow & Đối chiếu bản vá bảo mật của Vendor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Lỗ hổng (Vulnerable)
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Bản vá (Fixed)
          </span>
        </div>
      </div>

      {/* Root Cause & Taint Sink Callout */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="rounded-2xl border-rose-500/30 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Nguyên nhân gốc rễ (Root Cause)
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
            {diff.rootCauseExplanation}
          </p>
        </Card>

        <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Flame className="h-4 w-4 shrink-0" />
            Điểm thực thi nguy hiểm (Taint Sink)
          </div>
          <div className="mt-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2 font-mono text-[11px] text-amber-300">
            {diff.taintSink}
          </div>
        </Card>
      </div>

      {/* Side-by-Side Code Diff Panes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* VULNERABLE CODE (LEFT) */}
        <Card className="overflow-hidden rounded-2xl border-rose-900/40 bg-slate-950 shadow-xl">
          <div className="flex items-center justify-between border-b border-rose-950 bg-rose-950/20 px-4 py-2.5">
            <span className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-rose-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              🔴 Vulnerable Code (Trước khi vá)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Unsafe Implementation
            </span>
          </div>
          <div className="h-80 overflow-y-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed whitespace-pre text-rose-300/90">
            {diff.vulnerableCode}
          </div>
        </Card>

        {/* PATCHED CODE (RIGHT) */}
        <Card className="overflow-hidden rounded-2xl border-emerald-900/40 bg-slate-950 shadow-xl">
          <div className="flex items-center justify-between border-b border-emerald-950 bg-emerald-950/20 px-4 py-2.5">
            <span className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              🟢 Patched Code (Bản vá an toàn)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Remediated & Hardened
            </span>
          </div>
          <div className="h-80 overflow-y-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed whitespace-pre text-emerald-300/90">
            {diff.patchedCode}
          </div>
        </Card>
      </div>
    </div>
  );
};
