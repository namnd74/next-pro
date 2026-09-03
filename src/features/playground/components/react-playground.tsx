'use client';

import * as React from 'react';
import {
  Code2,
  Maximize2,
  FileCode2,
  FileText,
  Files,
  Terminal,
  Play,
  CheckCircle2,
  Laptop,
  Target,
} from 'lucide-react';
import type { PlaygroundFile } from '../types';
import { usePlayground } from '../hooks/use-playground';
import { PlaygroundToolbar } from './playground-toolbar';
import { FileExplorer } from './file-explorer';
import { FileTabs } from './file-tabs';
import { CodeEditor } from './code-editor';
import { PreviewPanel } from './preview-panel';
import { ConsolePanel } from './console-panel';
import { PlaygroundErrorBoundary } from './playground-error-boundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface ReactPlaygroundProps {
  initialFiles: Record<string, string | PlaygroundFile>;
  entryPath?: string;
  instructions?: string;
  className?: string;
  minHeight?: string;
  platform?: string;
  scopeId?: string;
}

export function ReactPlayground({
  initialFiles,
  entryPath = '/App.tsx',
  instructions,
  className = '',
  minHeight = '320px',
  platform = 'react-lite',
  scopeId,
}: ReactPlaygroundProps) {
  const {
    project,
    activeFile,
    layout,
    compileErrors,
    saveStatus,
    fileStatusMap,
    bridge,
    updateFileContent,
    addFile,
    deleteFile,
    renameFile,
    setActivePath,
    resetProject,
    runProject,
    retryRunner,
    toggleConsole,
    toggleSidebar,
    togglePreview,
    setShowPreview,
    toggleFullscreen,
    setIsFullscreen,
    setOrientation,
    setViewport,
  } = usePlayground({ initialFiles, entryPath, platform, scopeId });

  const [inlineMode, setInlineMode] = React.useState(false);
  const [splitPercent, setSplitPercent] = React.useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = React.useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = React.useState<number>(220);
  const [isDraggingSidebar, setIsDraggingSidebar] = React.useState<boolean>(false);
  const [isNarrowViewport, setIsNarrowViewport] = React.useState(false);

  const workspaceContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mainSplitBodyRef = React.useRef<HTMLDivElement | null>(null);
  const hasInitializedMobileLayoutRef = React.useRef(false);

  const fileList = Object.values(project.files);
  const isHorizontal = layout.orientation === 'horizontal';
  const effectiveHorizontal = isHorizontal && !isNarrowViewport;

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncViewport = () => setIsNarrowViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  React.useEffect(() => {
    if (!isNarrowViewport || hasInitializedMobileLayoutRef.current) return;
    hasInitializedMobileLayoutRef.current = true;
    if (layout.showSidebar) toggleSidebar();
  }, [isNarrowViewport, layout.showSidebar, toggleSidebar]);

  // Handle Dragging Split Pane between Editor and Preview
  React.useEffect(() => {
    if (!isDraggingSplit) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!workspaceContainerRef.current) return;
      const rect = workspaceContainerRef.current.getBoundingClientRect();

      if (effectiveHorizontal) {
        const offset = e.clientX - rect.left;
        const newPercent = (offset / rect.width) * 100;
        setSplitPercent(Math.min(Math.max(newPercent, 15), 85));
      } else {
        const offset = e.clientY - rect.top;
        const newPercent = (offset / rect.height) * 100;
        setSplitPercent(Math.min(Math.max(newPercent, 15), 85));
      }
    };

    const handlePointerUp = () => {
      setIsDraggingSplit(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSplit, effectiveHorizontal]);

  // Handle Dragging Sidebar Width
  React.useEffect(() => {
    if (!isDraggingSidebar) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!mainSplitBodyRef.current) return;
      const rect = mainSplitBodyRef.current.getBoundingClientRect();
      // 44px is the width of activity bar (w-11)
      const offset = e.clientX - rect.left - 44;
      setSidebarWidth(Math.min(Math.max(offset, 160), 450));
    };

    const handlePointerUp = () => {
      setIsDraggingSidebar(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSidebar]);

  const handleSeparatorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 5;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setSplitPercent((prev) => Math.max(15, prev - step));
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setSplitPercent((prev) => Math.min(85, prev + step));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setSplitPercent(50);
    }
  };

  // 1. Compact Inline Preview Mode (before opening full editor)
  if (!inlineMode && !layout.isFullscreen) {
    return (
      <PlaygroundErrorBoundary fallbackTitle="React Playground Error">
        <Card
          style={{ minHeight }}
          className={`glass-card border-border/70 relative overflow-hidden transition-all duration-300 ${className}`}
        >
          <div className="border-border/60 bg-muted/30 flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Code2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-foreground text-xs font-bold sm:text-sm">
                  React 19 Playground
                </h3>
                <span className="text-muted-foreground hidden font-mono text-[10px] sm:inline">
                  Interactive Client Sandbox · Live Hot Reload
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-[10px]">
                {fileList.length} files
              </Badge>
              <Button
                size="sm"
                variant="default"
                onClick={() => setInlineMode(true)}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Open Studio</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-foreground text-sm font-bold">
                  {project.entryPath.replace(/^\//, '')}
                </h4>
                <Badge
                  variant="outline"
                  className="border-cyan-500/30 text-[10px] text-cyan-600 dark:text-cyan-400"
                >
                  Entry File
                </Badge>
              </div>

              {instructions && (
                <div className="border-primary/20 bg-primary/5 text-foreground rounded-xl border p-3.5 text-xs leading-relaxed">
                  <span className="text-primary mr-1 inline-flex items-center gap-1 font-bold">
                    <Target className="h-3.5 w-3.5" />
                    <span>Instructions:</span>
                  </span>
                  {instructions}
                </div>
              )}
            </div>

            {/* File Badges Overview */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                File Tree:
              </span>
              <div className="flex flex-wrap gap-2">
                {fileList.map((file) => {
                  const isEntry = file.path === project.entryPath;
                  return (
                    <div
                      key={file.path}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs shadow-2xs ${
                        isEntry
                          ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                          : 'border-border/60 bg-muted/40 text-foreground'
                      }`}
                    >
                      {file.path.endsWith('.tsx') || file.path.endsWith('.jsx') ? (
                        <FileCode2 className="h-3.5 w-3.5 text-sky-400" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span>{file.path.replace(/^\//, '')}</span>
                      {isEntry && (
                        <span className="bg-primary/20 rounded px-1 font-sans text-[9px] font-bold">
                          main
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action CTA buttons */}
            <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Supports React 19, Lucide Icons, TypeScript & Hot-Reload.</span>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInlineMode(true)}
                  className="w-full text-xs sm:w-auto"
                >
                  <Laptop className="mr-1.5 h-3.5 w-3.5" />
                  <span>Inline Studio</span>
                </Button>

                <Button
                  size="sm"
                  onClick={toggleFullscreen}
                  className="shadow-primary/25 bg-primary hover:bg-primary/90 w-full gap-2 text-xs font-semibold shadow-md sm:w-auto"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Open Fullscreen Studio</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </PlaygroundErrorBoundary>
    );
  }

  // 2. Fullscreen Studio Modal / Inline Mode
  const studioContainerClasses = layout.isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden'
    : `flex flex-col rounded-2xl border border-border/70 bg-card shadow-md overflow-hidden glass-card ${className}`;

  return (
    <PlaygroundErrorBoundary fallbackTitle="React Playground Error">
      <div
        style={layout.isFullscreen ? undefined : { minHeight: '600px' }}
        className={studioContainerClasses}
      >
        {/* Top Header / Toolbar */}
        <PlaygroundToolbar
          status={bridge.runnerStatus}
          layout={layout}
          logCount={bridge.consoleLogs.length}
          saveStatus={saveStatus}
          onRun={runProject}
          onReset={resetProject}
          onToggleConsole={toggleConsole}
          onToggleSidebar={toggleSidebar}
          onTogglePreview={togglePreview}
          onToggleFullscreen={toggleFullscreen}
          onClose={() => {
            if (layout.isFullscreen) setIsFullscreen(false);
            else setInlineMode(false);
          }}
          onSetOrientation={setOrientation}
          onSetViewport={setViewport}
        />

        {/* Main Split Body */}
        <div ref={mainSplitBodyRef} className="relative flex flex-1 overflow-hidden">
          {/* Activity Bar (Thin Left Icon Strip) */}
          <div className="border-border/50 flex w-11 flex-col items-center justify-between border-r bg-slate-950 py-3 text-slate-400 select-none">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Toggle Explorer"
                aria-pressed={layout.showSidebar}
                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                  layout.showSidebar
                    ? 'bg-primary/20 text-primary border-primary border-l-2'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}
                title="Explorer"
              >
                <Files className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggleConsole}
                aria-label="Toggle Console"
                aria-pressed={layout.showConsole}
                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                  layout.showConsole
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}
                title="Toggle Console"
              >
                <Terminal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={runProject}
                aria-label="Run React project (⌘↵)"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-950/40"
                title="Run code (⌘↵)"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>

          {/* File Explorer Sidebar & Resizer Gutter */}
          {layout.showSidebar && (
            <>
              <div
                className={
                  isNarrowViewport
                    ? 'absolute inset-y-0 left-11 z-30 shadow-2xl'
                    : 'flex shrink-0'
                }
              >
                <FileExplorer
                  files={project.files}
                  activePath={project.activePath}
                  entryPath={project.entryPath}
                  fileStatusMap={fileStatusMap}
                  width={isNarrowViewport ? undefined : sidebarWidth}
                  onSelectFile={(path) => {
                    setActivePath(path);
                    if (isNarrowViewport) toggleSidebar();
                  }}
                  onAddFile={addFile}
                  onRenameFile={renameFile}
                  onDeleteFile={deleteFile}
                />
              </div>

              {!isNarrowViewport && (
                <div
                  role="separator"
                  tabIndex={0}
                  aria-label="Resize Sidebar"
                  aria-orientation="vertical"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setIsDraggingSidebar(true);
                  }}
                  onDoubleClick={() => setSidebarWidth(220)}
                  className={`group bg-border/40 hover:bg-primary/50 relative z-20 flex w-1.5 shrink-0 cursor-col-resize touch-none items-center justify-center transition-colors select-none focus-visible:ring-2 focus-visible:outline-none ${
                    isDraggingSidebar ? 'bg-primary/70' : ''
                  }`}
                  title="Drag to resize sidebar (Double click to reset)"
                />
              )}
            </>
          )}

          {/* Workspace Area: Resizable Editor & Live Preview */}
          <div
            ref={workspaceContainerRef}
            className={`relative flex flex-1 overflow-hidden ${
              effectiveHorizontal ? 'flex-row' : 'flex-col'
            } ${isDraggingSplit ? 'select-none' : ''}`}
          >
            {/* Editor Section */}
            <div
              style={
                layout.showPreview === false
                  ? { width: '100%', height: '100%' }
                  : effectiveHorizontal
                    ? { width: `${splitPercent}%` }
                    : { width: '100%', height: `${splitPercent}%` }
              }
              className={`border-border/60 flex min-h-[140px] min-w-[160px] flex-1 flex-col overflow-hidden ${
                layout.showPreview === false
                  ? ''
                  : effectiveHorizontal
                    ? 'border-r'
                    : 'border-b'
              }`}
            >
              <FileTabs
                files={project.files}
                activePath={project.activePath}
                entryPath={project.entryPath}
                fileStatusMap={fileStatusMap}
                onSelectFile={setActivePath}
                onAddFile={addFile}
                onDeleteFile={deleteFile}
              />

              <div className="flex-1 overflow-hidden">
                {activeFile ? (
                  <CodeEditor
                    code={activeFile.content}
                    onChange={(val) => updateFileContent(activeFile.path, val)}
                    onRun={runProject}
                    readOnly={activeFile.readOnly}
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    No file selected.
                  </div>
                )}
              </div>
            </div>

            {/* Draggable Resizer Gutter between Editor & Preview */}
            {layout.showPreview !== false && (
              <div
                role="separator"
                tabIndex={0}
                aria-label="Resize Editor and Preview"
                aria-orientation={effectiveHorizontal ? 'vertical' : 'horizontal'}
                aria-valuemin={15}
                aria-valuemax={85}
                aria-valuenow={Math.round(splitPercent)}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsDraggingSplit(true);
                }}
                onKeyDown={handleSeparatorKeyDown}
                onDoubleClick={() => setSplitPercent(50)}
                className={`group focus-visible:ring-primary bg-border/40 hover:bg-primary/50 relative z-20 flex shrink-0 touch-none items-center justify-center transition-colors select-none focus-visible:ring-2 focus-visible:outline-none ${
                  effectiveHorizontal
                    ? 'w-2 cursor-col-resize before:absolute before:inset-y-0 before:-right-4 before:-left-4'
                    : 'h-2 cursor-row-resize before:absolute before:inset-x-0 before:-top-4 before:-bottom-4'
                } ${isDraggingSplit ? 'bg-primary/70' : ''}`}
                title="Drag to resize Editor / Preview (Double-click to reset 50/50)"
              >
                <div
                  className={`group-hover:bg-primary rounded-full bg-slate-500/50 transition-colors ${
                    effectiveHorizontal ? 'h-8 w-1' : 'h-1 w-8'
                  } ${isDraggingSplit ? 'bg-primary' : ''}`}
                />
              </div>
            )}

            {/* Preview & Console Section */}
            <div
              style={
                layout.showPreview === false
                  ? { display: 'none' }
                  : effectiveHorizontal
                    ? { width: `calc(${100 - splitPercent}% - 8px)` }
                    : {
                        width: '100%',
                        height: `calc(${100 - splitPercent}% - 8px)`,
                      }
              }
              className={`relative min-h-[140px] min-w-[160px] flex-col overflow-hidden ${
                layout.showPreview === false ? 'hidden' : 'flex'
              }`}
            >
              {/* Overlay during drag to prevent iframe from trapping mouse events */}
              {isDraggingSplit && (
                <div
                  className={`absolute inset-0 z-50 bg-transparent select-none ${
                    effectiveHorizontal ? 'cursor-col-resize' : 'cursor-row-resize'
                  }`}
                />
              )}

              {/* Live Preview Area */}
              <div className="relative flex-1 overflow-hidden">
                <PreviewPanel
                  iframeRef={bridge.iframeRef}
                  iframeKey={bridge.iframeKey}
                  sessionId={bridge.sessionId}
                  runnerStatus={bridge.runnerStatus}
                  runtimeError={bridge.runtimeError}
                  compileErrors={compileErrors}
                  layout={layout}
                  onReboot={retryRunner}
                  onClosePreview={() => setShowPreview(false)}
                />
              </div>

              {/* Console Drawer */}
              {layout.showConsole && (
                <ConsolePanel
                  logs={bridge.consoleLogs}
                  onClear={bridge.clearLogs}
                  className="max-h-56"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="border-border/50 flex items-center justify-between border-t bg-slate-950 px-3 py-1 font-mono text-[10px] text-slate-400 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <span>Ln 1, Col 1</span>
            </span>
            <span className="hidden sm:inline">Spaces: 2</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span className="font-semibold text-sky-400">
              {activeFile?.path.endsWith('.tsx')
                ? 'TypeScript JSX'
                : activeFile?.path.endsWith('.ts')
                  ? 'TypeScript'
                  : 'JavaScript'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {compileErrors.length > 0 ? (
              <span className="text-destructive font-semibold">
                {compileErrors.length} error{compileErrors.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>0 errors</span>
              </span>
            )}
            <span className="text-slate-500">React 19</span>
          </div>
        </div>
      </div>
    </PlaygroundErrorBoundary>
  );
}
