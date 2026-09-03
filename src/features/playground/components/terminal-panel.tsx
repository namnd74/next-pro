'use client';

import * as React from 'react';
import { Terminal as TerminalIcon, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import '@xterm/xterm/css/xterm.css';

interface TerminalPanelProps {
  onMountTerminal: (element: HTMLDivElement) => void;
  onClear?: () => void;
  onResize?: () => void;
  onFocus?: () => void;
  isAttached?: boolean;
  className?: string;
}

export function TerminalPanel({
  onMountTerminal,
  onClear,
  onResize,
  onFocus,
  isAttached = false,
  className = '',
}: TerminalPanelProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (containerRef.current) {
      onMountTerminal(containerRef.current);
    }
  }, [onMountTerminal]);

  // Observe container size changes and auto-fit
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !onResize) return;

    const observer = new ResizeObserver(() => {
      onResize();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [onResize]);

  // Trigger resize when isExpanded changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onResize?.();
    }, 150);
    return () => clearTimeout(timer);
  }, [isExpanded, onResize]);

  const handleContainerClick = React.useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  return (
    <div
      onClick={handleContainerClick}
      className={`flex cursor-text flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#090d16] shadow-lg transition-all ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full w-full'
      } ${className}`}
    >
      {/* Terminal Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-9 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-3 backdrop-blur-sm select-none"
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-sky-400" />
          <span className="font-mono text-xs font-bold text-slate-200">
            Node.js Terminal (jsh)
          </span>
          <Badge
            variant="outline"
            className={`cursor-default px-1.5 py-0 font-mono text-[10px] transition-colors ${
              isAttached
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
            }`}
          >
            {isAttached ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 cursor-pointer p-0 text-slate-400 transition-colors hover:text-white"
              title="Clear terminal"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 cursor-pointer p-0 text-slate-400 transition-colors hover:text-white"
            title={isExpanded ? 'Minimize terminal' : 'Maximize terminal'}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* xterm Container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden p-2 text-xs"
        style={{ minHeight: '140px' }}
      />
    </div>
  );
}
