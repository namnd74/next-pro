'use client';

import * as React from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { playFootholdChime } from '../engines/cyber-audio-engine';

interface ResizableSplitWorkspaceProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  title: string;
  difficulty?: string;
  tactic?: string;
  totalObjectives?: number;
  completedObjectivesCount?: number;
}

export const ResizableSplitWorkspace: React.FC<ResizableSplitWorkspaceProps> = ({
  leftContent,
  rightContent,
  title,
  difficulty = 'foundation',
  tactic,
  totalObjectives = 0,
  completedObjectivesCount = 0,
}) => {
  const [splitRatio, setSplitRatio] = React.useState<number>(48); // % for left panel
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isZenMode, setIsZenMode] = React.useState<boolean>(false);
  const [activeTabMobile, setActiveTabMobile] = React.useState<'briefing' | 'workbench'>(
    'workbench'
  );
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(false);
  const [isDesktop, setIsDesktop] = React.useState<boolean>(true);

  React.useEffect(() => {
    const updateMedia = () => setIsDesktop(window.innerWidth >= 1024);
    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  // Load saved preferences
  React.useEffect(() => {
    try {
      const savedRatio = localStorage.getItem('offsec_split_ratio');
      if (savedRatio) {
        const parsed = parseFloat(savedRatio);
        if (!isNaN(parsed) && parsed >= 25 && parsed <= 75) {
          setSplitRatio(parsed);
        }
      }
      const savedAudio = localStorage.getItem('offsec_audio_enabled');
      if (savedAudio === 'true') {
        setAudioEnabled(true);
      }
    } catch {
      // Ignore SSR / localStorage issues
    }
  }, []);

  // Keyboard shortcut: Escape exits Zen Mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // Pointer drag resizing logic
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const totalWidth = window.innerWidth;
      if (totalWidth <= 0) return;
      const rawPercent = (moveEvent.clientX / totalWidth) * 100;
      const clamped = Math.min(72, Math.max(28, Math.round(rawPercent)));
      setSplitRatio(clamped);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const totalWidth = window.innerWidth;
      const rawPercent = (upEvent.clientX / totalWidth) * 100;
      const finalRatio = Math.min(72, Math.max(28, Math.round(rawPercent)));
      try {
        localStorage.setItem('offsec_split_ratio', String(finalRatio));
      } catch {
        // Ignore
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) {
      playFootholdChime();
    }
    try {
      localStorage.setItem('offsec_audio_enabled', String(next));
    } catch {
      // Ignore
    }
  };

  const isAllComplete =
    totalObjectives > 0 && completedObjectivesCount >= totalObjectives;

  return (
    <div
      className={`relative w-full ${
        isZenMode
          ? 'fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950 p-4'
          : 'space-y-4'
      }`}
    >
      {/* Cockpit Top Bar */}
      <div className="border-border/60 bg-card/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-b px-4 py-2.5 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="tracking-wider uppercase">ADAPTIVE COCKPIT</span>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-950/30 font-mono text-[10px] text-emerald-400"
          >
            {difficulty.toUpperCase()}
          </Badge>

          <span className="text-foreground hidden max-w-[200px] truncate text-xs font-semibold md:inline">
            {title}
          </span>

          {tactic && (
            <Badge
              variant="outline"
              className="hidden border-sky-500/40 bg-sky-950/30 font-mono text-[10px] text-sky-400 sm:inline-flex"
            >
              {tactic}
            </Badge>
          )}

          {totalObjectives > 0 && (
            <Badge
              variant="outline"
              data-testid="cockpit-progress-badge"
              className={`font-mono text-[10px] ${
                isAllComplete
                  ? 'border-emerald-500 bg-emerald-500/20 font-bold text-emerald-300'
                  : 'border-border/80 bg-secondary/30 text-slate-300'
              }`}
            >
              {isAllComplete
                ? '🏆 LAB COMPLETED'
                : `OBJECTIVES: ${completedObjectivesCount}/${totalObjectives}`}
            </Badge>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Audio toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            data-testid="toggle-audio-button"
            className={`h-7 gap-1 px-2 font-mono text-xs transition-colors ${
              audioEnabled
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={
              audioEnabled
                ? 'Tắt âm thanh phản hồi'
                : 'Bật âm thanh phản hồi xúc giác (Cyber Audio)'
            }
          >
            {audioEnabled ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">
              {audioEnabled ? 'AUDIO ON' : 'MUTED'}
            </span>
          </Button>

          {/* Zen mode toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsZenMode(!isZenMode)}
            data-testid="toggle-zen-mode"
            className="h-7 gap-1 px-2 font-mono text-xs text-slate-300 transition-colors hover:text-emerald-400"
            title={isZenMode ? 'Thoát Zen Mode (Esc)' : 'Chế độ Toàn Màn Hình Zen Mode'}
          >
            {isZenMode ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isZenMode ? 'EXIT ZEN' : 'ZEN MODE'}
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher (< 1024px) */}
      {!isZenMode && (
        <div className="border-border/80 bg-secondary/40 flex items-center rounded-xl border p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setActiveTabMobile('briefing')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTabMobile === 'briefing'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📖 Tài Liệu & Lý Thuyết
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile('workbench')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTabMobile === 'workbench'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🚀 Thao Trường Workbench
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      {isZenMode ? (
        /* Zen Fullscreen View */
        <div className="relative flex min-h-0 flex-1 flex-col pt-2">
          <div className="cyber-scrollbar flex-1 overflow-y-auto">{rightContent}</div>
        </div>
      ) : (
        /* Normal Layout: Single DOM tree, responsive layout */
        <div
          className={`flex w-full flex-col items-stretch gap-0 select-none lg:flex-row ${
            isDragging ? 'cursor-col-resize' : ''
          }`}
          style={{ minHeight: '620px' }}
        >
          {/* Left Panel: Briefing, Concepts, Sticky Objectives */}
          <div
            className={`cyber-scrollbar space-y-6 overflow-y-auto overscroll-contain lg:pr-3 ${
              activeTabMobile === 'workbench' ? 'hidden lg:block' : 'block'
            }`}
            style={{
              width: isDesktop ? `${splitRatio}%` : '100%',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            {leftContent}
          </div>

          {/* Draggable Divider Handle (Desktop only) */}
          <div
            onPointerDown={handlePointerDown}
            onDoubleClick={() => setSplitRatio(48)}
            title="Kéo thả để chia đôi màn hình (Nhấp đúp để đặt lại 48/52)"
            className="group relative hidden w-3.5 shrink-0 cursor-col-resize items-center justify-center px-0.5 transition-colors hover:bg-emerald-500/10 lg:flex"
          >
            <div className="bg-border/80 h-full w-[1.5px] rounded-full transition-colors group-hover:bg-emerald-500/80" />
            <div className="border-border/80 absolute top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-full border bg-slate-900 p-1 shadow-md group-hover:border-emerald-500/50">
              <div className="h-1 w-1 rounded-full bg-slate-400 group-hover:bg-emerald-400" />
              <div className="h-1 w-1 rounded-full bg-slate-400 group-hover:bg-emerald-400" />
              <div className="h-1 w-1 rounded-full bg-slate-400 group-hover:bg-emerald-400" />
            </div>
          </div>

          {/* Right Panel: Interactive Workbench */}
          <div
            className={`cyber-scrollbar space-y-4 overflow-y-auto overscroll-contain lg:pl-3 ${
              activeTabMobile === 'briefing' ? 'hidden lg:block' : 'block'
            }`}
            style={{
              width: isDesktop ? `${100 - splitRatio}%` : '100%',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            {rightContent}
          </div>
        </div>
      )}
    </div>
  );
};
