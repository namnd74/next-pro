'use client';

import * as React from 'react';
import {
  Play,
  RotateCcw,
  Terminal,
  Columns2,
  Rows2,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PanelLeft,
  Maximize2,
  Minimize2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RunnerStatus, PlaygroundLayoutConfig } from '../types';

interface PlaygroundToolbarProps {
  status: RunnerStatus;
  layout: PlaygroundLayoutConfig;
  logCount: number;
  saveStatus?: 'idle' | 'saving' | 'saved';
  onRun: () => void;
  onReset: () => void;
  onToggleConsole: () => void;
  onToggleSidebar?: () => void;
  onTogglePreview?: () => void;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
  onSetOrientation: (orientation: 'horizontal' | 'vertical') => void;
  onSetViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
}

export function PlaygroundToolbar({
  status,
  layout,
  logCount,
  saveStatus = 'idle',
  onRun,
  onReset,
  onToggleConsole,
  onToggleSidebar,
  onTogglePreview,
  onToggleFullscreen,
  onClose,
  onSetOrientation,
  onSetViewport,
}: PlaygroundToolbarProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'compiling':
      case 'starting':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/40 bg-amber-500/10 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
          >
            <Loader2 aria-hidden="true" className="h-2.5 w-2.5 animate-spin" />
            <span>Compiling...</span>
          </Badge>
        );
      case 'ready':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/40 bg-emerald-500/10 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 aria-hidden="true" className="h-2.5 w-2.5" />
            <span>Ready</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30 gap-1 py-0.5 text-[10px]"
          >
            <AlertCircle aria-hidden="true" className="h-2.5 w-2.5" />
            <span>Error</span>
          </Badge>
        );
      case 'timeout':
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30 gap-1 py-0.5 text-[10px]"
          >
            <AlertCircle aria-hidden="true" className="h-2.5 w-2.5" />
            <span>Timeout</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="py-0.5 text-[10px]">
            <span>Idle</span>
          </Badge>
        );
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Playground Controls"
      className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 select-none"
    >
      {/* Left actions: Sidebar, Run, Reset, Status */}
      <div className="flex items-center gap-1.5">
        {onToggleSidebar && (
          <Button
            variant={layout.showSidebar ? 'secondary' : 'outline'}
            size="sm"
            onClick={onToggleSidebar}
            className="min-h-11 min-w-11 p-0"
            title={layout.showSidebar ? 'Collapse Explorer' : 'Expand Explorer'}
            aria-label={layout.showSidebar ? 'Collapse Explorer' : 'Expand Explorer'}
            aria-pressed={layout.showSidebar}
          >
            <PanelLeft aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          size="sm"
          onClick={onRun}
          className="min-h-11 gap-1.5 px-2.5 text-xs font-semibold shadow-xs"
          aria-label="Run code (Cmd+Enter)"
          title="Run code (⌘↵)"
        >
          <Play aria-hidden="true" className="h-3 w-3 fill-current" />
          <span>Run</span>
          <kbd className="bg-primary-foreground/20 py-0.2 hidden rounded px-1 font-mono text-[9px] font-normal sm:inline-block">
            ⌘↵
          </kbd>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="min-h-11 gap-1 px-2 text-xs"
          title="Reset project to starter template"
          aria-label="Reset project to starter template"
        >
          <RotateCcw aria-hidden="true" className="h-3 w-3" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        <div aria-live="polite" aria-atomic="true">
          {getStatusBadge()}
        </div>

        {saveStatus === 'saving' && (
          <span
            role="status"
            className="text-muted-foreground/80 flex items-center gap-1 font-mono text-[10px]"
          >
            <Loader2
              aria-hidden="true"
              className="h-2.5 w-2.5 animate-spin text-cyan-400"
            />
            <span className="hidden md:inline">Saving...</span>
          </span>
        )}

        {saveStatus === 'saved' && (
          <span
            role="status"
            className="flex items-center gap-1 font-mono text-[10px] text-emerald-400"
          >
            <CheckCircle2 aria-hidden="true" className="h-2.5 w-2.5" />
            <span className="hidden md:inline">Saved</span>
          </span>
        )}
      </div>

      {/* Right controls: Viewport, Orientation, Preview Toggle, Console, Fullscreen / Close */}
      <div className="flex items-center gap-1">
        {/* Viewport switcher */}
        {layout.showPreview !== false && (
          <div
            role="group"
            aria-label="Viewport size"
            className="border-border/50 bg-background/60 hidden items-center rounded-lg border p-0.5 sm:flex"
          >
            <button
              type="button"
              onClick={() => onSetViewport('desktop')}
              aria-label="Desktop viewport"
              aria-pressed={layout.viewport === 'desktop'}
              className={`focus-visible:ring-primary flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-95 ${
                layout.viewport === 'desktop'
                  ? 'bg-muted text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSetViewport('tablet')}
              aria-label="Tablet viewport 768px"
              aria-pressed={layout.viewport === 'tablet'}
              className={`focus-visible:ring-primary flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-95 ${
                layout.viewport === 'tablet'
                  ? 'bg-muted text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSetViewport('mobile')}
              aria-label="Mobile viewport 375px"
              aria-pressed={layout.viewport === 'mobile'}
              className={`focus-visible:ring-primary flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-95 ${
                layout.viewport === 'mobile'
                  ? 'bg-muted text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Orientation switcher */}
        {layout.showPreview !== false && (
          <div
            role="group"
            aria-label="Split layout orientation"
            className="border-border/50 bg-background/60 hidden items-center rounded-lg border p-0.5 md:flex"
          >
            <button
              type="button"
              onClick={() => onSetOrientation('horizontal')}
              aria-label="Split horizontally"
              aria-pressed={layout.orientation === 'horizontal'}
              className={`focus-visible:ring-primary flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-95 ${
                layout.orientation === 'horizontal'
                  ? 'bg-muted text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Horizontal Split"
            >
              <Columns2 aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSetOrientation('vertical')}
              aria-label="Split vertically"
              aria-pressed={layout.orientation === 'vertical'}
              className={`focus-visible:ring-primary flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-95 ${
                layout.orientation === 'vertical'
                  ? 'bg-muted text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vertical Split"
            >
              <Rows2 aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Toggle Preview Button */}
        {onTogglePreview && (
          <Button
            variant={layout.showPreview !== false ? 'secondary' : 'outline'}
            size="sm"
            onClick={onTogglePreview}
            className="min-h-11 gap-1 px-2 text-xs"
            aria-pressed={layout.showPreview !== false}
            title={
              layout.showPreview !== false
                ? 'Hide Preview (Code-only mode)'
                : 'Show Preview'
            }
            aria-label={layout.showPreview !== false ? 'Hide Preview' : 'Show Preview'}
          >
            {layout.showPreview !== false ? (
              <Eye className="text-primary h-3.5 w-3.5" />
            ) : (
              <EyeOff className="text-muted-foreground h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Preview</span>
          </Button>
        )}

        {/* Console toggle button */}
        <Button
          variant={layout.showConsole ? 'secondary' : 'outline'}
          size="sm"
          onClick={onToggleConsole}
          className="min-h-11 gap-1 px-2 text-xs"
          aria-pressed={layout.showConsole}
          aria-label={`${layout.showConsole ? 'Hide' : 'Open'} console${logCount > 0 ? `, ${logCount} messages` : ''}`}
          title={layout.showConsole ? 'Hide Console' : 'Show Console'}
        >
          <Terminal aria-hidden="true" className="h-3 w-3" />
          <span className="hidden sm:inline">Console</span>
          {logCount > 0 && (
            <span className="bg-primary/20 py-0.2 text-primary rounded-full px-1.5 text-[9px] font-bold">
              {logCount}
            </span>
          )}
        </Button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <Button
            variant={layout.isFullscreen ? 'secondary' : 'outline'}
            size="sm"
            onClick={onToggleFullscreen}
            className={`text-primary border-primary/30 min-h-11 text-xs ${
              layout.isFullscreen ? 'min-w-11 p-0' : 'gap-1 px-2'
            }`}
            title={layout.isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F11)'}
            aria-pressed={layout.isFullscreen}
            aria-label={layout.isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen'}
          >
            {layout.isFullscreen ? (
              <Minimize2 aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <>
                <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </Button>
        )}

        {/* Close Button in Fullscreen mode */}
        {layout.isFullscreen && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="min-h-11 min-w-11 p-0 text-slate-400 hover:bg-rose-950 hover:text-white"
            title="Close Studio (Esc)"
            aria-label="Close Studio"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
