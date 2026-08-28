'use client';

import * as React from 'react';
import { Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';
import type { PlaygroundLayoutConfig, RunnerStatus } from '../types';
import { generateIframeSrcDoc } from '../runner/runner-entry';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  iframeKey: number;
  sessionId: string;
  runnerStatus: RunnerStatus;
  runtimeError: string | null;
  compileErrors: { path: string; message: string }[];
  layout: PlaygroundLayoutConfig;
  onReboot: () => void;
}

export function PreviewPanel({
  iframeRef,
  iframeKey,
  sessionId,
  runnerStatus,
  runtimeError,
  compileErrors,
  layout,
  onReboot,
}: PreviewPanelProps) {
  const srcDoc = React.useMemo(() => generateIframeSrcDoc(sessionId), [sessionId]);

  const getViewportWidthClass = () => {
    switch (layout.viewport) {
      case 'mobile':
        return 'max-w-[375px] my-2 rounded-xl shadow-lg border border-border/80';
      case 'tablet':
        return 'max-w-[768px] my-2 rounded-xl shadow-md border border-border/80';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="bg-background/50 relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Compile Errors Overlay */}
      {compileErrors.length > 0 && (
        <div className="border-destructive/40 bg-destructive/15 text-destructive absolute inset-x-3 top-3 z-20 rounded-xl border p-4 text-xs backdrop-blur-md">
          <div className="mb-1 flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Lỗi cú pháp (Compile Error)</span>
          </div>
          <ul className="list-disc space-y-1 pl-5 font-mono text-[11px]">
            {compileErrors.map((err, idx) => (
              <li key={idx}>
                <span className="font-bold">{err.path}:</span> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Runtime/Timeout Error Banner */}
      {runtimeError && (
        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/15 p-4 text-xs text-rose-300 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Runtime Error</span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed">{runtimeError}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onReboot}
            className="h-7 shrink-0 gap-1 border-rose-500/30 text-[11px] hover:bg-rose-500/20"
          >
            <RefreshCcw className="h-3 w-3" />
            <span>Khởi động lại</span>
          </Button>
        </div>
      )}

      {/* Loading Spinner Indicator */}
      {(runnerStatus === 'compiling' || runnerStatus === 'starting') && (
        <div className="bg-background/80 text-muted-foreground border-border/40 absolute right-3 bottom-3 z-10 flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm">
          <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
          <span className="text-[11px]">Đang nạp preview...</span>
        </div>
      )}

      {/* The Sandboxed Iframe Container */}
      <div
        className={`bg-background relative h-full overflow-hidden transition-all duration-300 ${getViewportWidthClass()}`}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-forms allow-modals"
          className="h-full w-full border-none bg-transparent"
          title="React Sandbox Preview"
        />
      </div>
    </div>
  );
}
