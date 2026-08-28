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
}

export function ReactPlayground({
  initialFiles,
  entryPath = '/App.tsx',
  instructions,
  className = '',
  minHeight = '320px',
}: ReactPlaygroundProps) {
  const {
    project,
    activeFile,
    layout,
    compileErrors,
    bridge,
    updateFileContent,
    addFile,
    deleteFile,
    renameFile,
    setActivePath,
    resetProject,
    runProject,
    toggleConsole,
    toggleSidebar,
    toggleFullscreen,
    setIsFullscreen,
    setOrientation,
    setViewport,
  } = usePlayground({ initialFiles, entryPath });

  const [inlineMode, setInlineMode] = React.useState(false);
  const [splitPercent, setSplitPercent] = React.useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = React.useState<boolean>(false);
  const workspaceContainerRef = React.useRef<HTMLDivElement | null>(null);

  const fileList = Object.values(project.files);
  const isHorizontal = layout.orientation === 'horizontal';

  // Handle Dragging Split Pane
  React.useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!workspaceContainerRef.current) return;
      const rect = workspaceContainerRef.current.getBoundingClientRect();

      if (isHorizontal) {
        const offset = e.clientX - rect.left;
        const newPercent = (offset / rect.width) * 100;
        setSplitPercent(Math.min(Math.max(newPercent, 15), 85));
      } else {
        const offset = e.clientY - rect.top;
        const newPercent = (offset / rect.height) * 100;
        setSplitPercent(Math.min(Math.max(newPercent, 15), 85));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, isHorizontal]);

  // 1. Lab Launcher Card (When not in fullscreen and inlineMode is false)
  if (!layout.isFullscreen && !inlineMode) {
    return (
      <PlaygroundErrorBoundary fallbackTitle="React Playground Error">
        <Card
          style={{ minHeight }}
          className={`glass-card border-primary/30 from-card via-card/90 to-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-lg ${className}`}
        >
          {/* Background Ambient Glow */}
          <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl" />

          <div className="flex h-full flex-col justify-between space-y-6">
            {/* Header section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-xs">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                      <span>React Multi-File Playground</span>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/40 text-[10px]"
                      >
                        React 19 + TypeScript
                      </Badge>
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Môi trường thực thi code đa file trực tiếp trong trình duyệt
                    </p>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className="gap-1.5 bg-slate-800/60 font-mono text-[11px] text-slate-200"
                >
                  <Files className="text-primary h-3 w-3" />
                  <span>{fileList.length} files trong project</span>
                </Badge>
              </div>

              {instructions && (
                <div className="border-primary/20 bg-primary/5 text-foreground rounded-xl border p-3.5 text-xs leading-relaxed">
                  <span className="text-primary mr-1 font-bold">🎯 Yêu cầu:</span>
                  {instructions}
                </div>
              )}
            </div>

            {/* File Badges Overview */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                Cấu trúc Files:
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
                <span>
                  Hỗ trợ React 19 Hooks, Lucide Icons, TypeScript và Live Hot-Reload.
                </span>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInlineMode(true)}
                  className="w-full text-xs sm:w-auto"
                >
                  <Laptop className="mr-1.5 h-3.5 w-3.5" />
                  <span>Xem nhanh tại đây</span>
                </Button>

                <Button
                  size="sm"
                  onClick={toggleFullscreen}
                  className="shadow-primary/25 bg-primary hover:bg-primary/90 w-full gap-2 text-xs font-semibold shadow-md sm:w-auto"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Khởi động VS Code Studio (Toàn màn hình)</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </PlaygroundErrorBoundary>
    );
  }

  // 2. Fullscreen VS Code Studio Modal / Inline Mode
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
          onRun={runProject}
          onReset={resetProject}
          onToggleConsole={toggleConsole}
          onToggleSidebar={toggleSidebar}
          onToggleFullscreen={toggleFullscreen}
          onClose={() => {
            if (layout.isFullscreen) setIsFullscreen(false);
            else setInlineMode(false);
          }}
          onSetOrientation={setOrientation}
          onSetViewport={setViewport}
        />

        {/* Main Split Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Activity Bar (Thin Left Icon Strip) */}
          <div className="border-border/50 flex w-11 flex-col items-center justify-between border-r bg-slate-950 py-3 text-slate-400 select-none">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                className={`rounded-lg p-2 transition-colors ${
                  layout.showSidebar
                    ? 'bg-primary/20 text-primary border-primary border-l-2'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}
                title="Explorer (Cây thư mục file)"
              >
                <Files className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggleConsole}
                className={`rounded-lg p-2 transition-colors ${
                  layout.showConsole
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}
                title="Bật/Tắt Console"
              >
                <Terminal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={runProject}
                className="rounded-lg p-2 text-emerald-400 transition-colors hover:bg-emerald-950/40"
                title="Chạy code (⌘↵)"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>

          {/* File Explorer Sidebar */}
          {layout.showSidebar && (
            <FileExplorer
              files={project.files}
              activePath={project.activePath}
              entryPath={project.entryPath}
              onSelectFile={setActivePath}
              onAddFile={addFile}
              onRenameFile={renameFile}
              onDeleteFile={deleteFile}
            />
          )}

          {/* Workspace Area: Resizable Editor & Live Preview */}
          <div
            ref={workspaceContainerRef}
            className={`relative flex flex-1 overflow-hidden ${
              isHorizontal ? 'flex-col md:flex-row' : 'flex-col'
            } ${isDraggingSplit ? 'select-none' : ''}`}
          >
            {/* Editor Section */}
            <div
              style={
                isHorizontal
                  ? { width: `${splitPercent}%` }
                  : { height: `${splitPercent}%` }
              }
              className={`border-border/60 flex min-h-[140px] min-w-[160px] flex-col overflow-hidden ${
                isHorizontal ? 'border-b md:border-b-0' : 'border-b'
              }`}
            >
              <FileTabs
                files={project.files}
                activePath={project.activePath}
                entryPath={project.entryPath}
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
                    Không có file nào được chọn.
                  </div>
                )}
              </div>
            </div>

            {/* Draggable Resizer Gutter */}
            <div
              role="separator"
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingSplit(true);
              }}
              onDoubleClick={() => setSplitPercent(50)}
              className={`group relative z-20 flex shrink-0 items-center justify-center transition-colors select-none ${
                isHorizontal
                  ? 'hover:bg-primary/50 bg-border/40 w-2 cursor-col-resize'
                  : 'hover:bg-primary/50 bg-border/40 h-2 cursor-row-resize'
              } ${isDraggingSplit ? 'bg-primary/70' : ''}`}
              title="Kéo để chia tỷ lệ Editor / Preview (Nhấp đúp để đặt lại 50/50)"
            >
              <div
                className={`group-hover:bg-primary rounded-full bg-slate-500/50 transition-colors ${
                  isHorizontal ? 'h-8 w-1' : 'h-1 w-8'
                } ${isDraggingSplit ? 'bg-primary' : ''}`}
              />
            </div>

            {/* Preview & Console Section */}
            <div
              style={
                isHorizontal
                  ? { width: `calc(${100 - splitPercent}% - 8px)` }
                  : { height: `calc(${100 - splitPercent}% - 8px)` }
              }
              className={`relative flex min-h-[140px] min-w-[160px] flex-col overflow-hidden`}
            >
              {/* Overlay during drag to prevent iframe from trapping mouse events */}
              {isDraggingSplit && (
                <div className="absolute inset-0 z-50 cursor-col-resize bg-transparent select-none" />
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
                  onReboot={bridge.rebootIframe}
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

        {/* VS Code Bottom Status Bar */}
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
            <button
              type="button"
              onClick={() => setSplitPercent(50)}
              className="hover:text-primary hidden cursor-pointer text-slate-400 transition-colors sm:inline"
              title="Nhấp để đặt lại tỷ lệ 50:50"
            >
              Tỷ lệ: {Math.round(splitPercent)}% : {Math.round(100 - splitPercent)}%
            </button>
            <button
              type="button"
              onClick={toggleConsole}
              className={`hover:text-primary flex cursor-pointer items-center gap-1 transition-colors ${
                layout.showConsole ? 'text-primary font-semibold' : 'text-slate-400'
              }`}
              title="Bật/Tắt Console Drawer"
            >
              <Terminal className="h-3 w-3" />
              <span>
                Console
                {bridge.consoleLogs.length > 0 ? ` (${bridge.consoleLogs.length})` : ''}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {bridge.runnerStatus === 'ready' && (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span>Sandbox Live</span>
              </span>
            )}
            <span className="hidden text-slate-500 sm:inline">Phím tắt: ⌘↵ Chạy</span>
            {layout.isFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                [Esc để thu nhỏ]
              </button>
            )}
          </div>
        </div>
      </div>
    </PlaygroundErrorBoundary>
  );
}
