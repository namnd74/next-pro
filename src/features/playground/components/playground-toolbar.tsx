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
            className="gap-1 border-amber-500/30 bg-amber-500/10 py-0.5 text-[10px] text-amber-500"
          >
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            <span>Biên dịch...</span>
          </Badge>
        );
      case 'ready':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 py-0.5 text-[10px] text-emerald-500"
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>Sẵn sàng</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30 gap-1 py-0.5 text-[10px]"
          >
            <AlertCircle className="h-2.5 w-2.5" />
            <span>Lỗi</span>
          </Badge>
        );
      case 'timeout':
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30 gap-1 py-0.5 text-[10px]"
          >
            <AlertCircle className="h-2.5 w-2.5" />
            <span>Timeout</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="py-0.5 text-[10px]">
            <span>Chờ chạy</span>
          </Badge>
        );
    }
  };

  return (
    <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 select-none">
      {/* Left actions: Sidebar, Run, Reset, Status */}
      <div className="flex items-center gap-1.5">
        {onToggleSidebar && (
          <Button
            variant={layout.showSidebar ? 'secondary' : 'outline'}
            size="sm"
            onClick={onToggleSidebar}
            className="h-7 w-7 p-0"
            title={layout.showSidebar ? 'Thu gọn Explorer' : 'Mở Explorer'}
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          size="sm"
          onClick={onRun}
          className="h-7 gap-1.5 px-2.5 text-xs font-semibold shadow-xs"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>Chạy</span>
          <kbd className="bg-primary-foreground/20 py-0.2 hidden rounded px-1 font-mono text-[9px] font-normal sm:inline-block">
            ⌘↵
          </kbd>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-7 gap-1 px-2 text-xs"
          title="Khôi phục trạng thái ban đầu"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        {getStatusBadge()}

        {saveStatus === 'saving' && (
          <span className="text-muted-foreground/80 flex items-center gap-1 font-mono text-[10px]">
            <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-400" />
            <span className="hidden md:inline">Đang lưu...</span>
          </span>
        )}

        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span className="hidden md:inline">Đã lưu IDB</span>
          </span>
        )}
      </div>

      {/* Right controls: Viewport, Orientation, Console, Fullscreen / Close */}
      <div className="flex items-center gap-1">
        {/* Viewport switcher */}
        <div className="border-border/50 bg-background/60 hidden items-center rounded-lg border p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => onSetViewport('desktop')}
            className={`rounded p-1 transition-colors ${layout.viewport === 'desktop' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Desktop View (100%)"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSetViewport('tablet')}
            className={`rounded p-1 transition-colors ${layout.viewport === 'tablet' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Tablet View (768px)"
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSetViewport('mobile')}
            className={`rounded p-1 transition-colors ${layout.viewport === 'mobile' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Mobile View (375px)"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Orientation switcher */}
        <div className="border-border/50 bg-background/60 hidden items-center rounded-lg border p-0.5 md:flex">
          <button
            type="button"
            onClick={() => onSetOrientation('horizontal')}
            className={`rounded p-1 transition-colors ${layout.orientation === 'horizontal' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Chia cột ngang"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSetOrientation('vertical')}
            className={`rounded p-1 transition-colors ${layout.orientation === 'vertical' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Chia hàng dọc"
          >
            <Rows2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Console toggle button */}
        <Button
          variant={layout.showConsole ? 'secondary' : 'outline'}
          size="sm"
          onClick={onToggleConsole}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Terminal className="h-3 w-3" />
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
            className={`text-primary border-primary/30 h-7 text-xs ${
              layout.isFullscreen ? 'w-7 p-0' : 'gap-1 px-2'
            }`}
            title={
              layout.isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình (F11)'
            }
          >
            {layout.isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Toàn màn hình</span>
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
            className="h-7 w-7 p-0 text-slate-400 hover:bg-rose-950 hover:text-white"
            title="Đóng VS Code Studio (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
