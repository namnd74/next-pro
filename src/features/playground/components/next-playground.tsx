'use client';

import * as React from 'react';
import {
  Code2,
  Maximize2,
  FileCode2,
  Files,
  Terminal,
  Play,
  CheckCircle2,
  Laptop,
  Target,
  Globe,
  ExternalLink,
  RotateCcw,
  Loader2,
  Server,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { PlaygroundFile, PlaygroundLayoutConfig, RunnerStatus } from '../types';
import { PlaygroundToolbar } from './playground-toolbar';
import { FileExplorer } from './file-explorer';
import { FileTabs } from './file-tabs';
import { CodeEditor } from './code-editor';
import { TerminalPanel } from './terminal-panel';
import { PlaygroundErrorBoundary } from './playground-error-boundary';
import { useWebContainer } from '../engines/webcontainer/hooks/use-webcontainer';
import { useTerminalStream } from '../engines/webcontainer/hooks/use-terminal-stream';
import {
  getPlatformProject,
  deletePlatformProject,
  savePlatformDelta,
  resolveEffectiveFiles,
  computeDelta,
} from '@/lib/storage/platform-db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { INITIAL_NEXT_FILES, toFileSystemTree } from '../templates/nextjs/initial-files';
import { useResizableSplit } from '../hooks/use-resizable-split';

export interface NextPlaygroundProps {
  title?: string;
  initialFiles?: Record<string, string | PlaygroundFile>;
  entryPath?: string;
  instructions?: string;
  className?: string;
  minHeight?: string;
  scopeId?: string;
}

export function NextPlayground({
  title = 'Next.js Curriculum Studio',
  initialFiles,
  entryPath = '/app/page.tsx',
  instructions,
  className = '',
  minHeight = '320px',
  scopeId = 'next-studio',
}: NextPlaygroundProps) {
  const baseFiles = React.useMemo(() => {
    if (!initialFiles) return INITIAL_NEXT_FILES;
    const res: Record<string, PlaygroundFile> = { ...INITIAL_NEXT_FILES };
    for (const [k, v] of Object.entries(initialFiles)) {
      const p = k.startsWith('/') ? k : `/${k}`;
      res[p] = typeof v === 'string' ? { path: p, content: v } : { ...v, path: p };
    }
    // Safety guard: Next.js 15+ App Router crashes if /app/page.tsx has 'use client' directly (workStore invariant bug)
    const pageItem = res['/app/page.tsx'];
    if (pageItem && pageItem.content.includes("'use client'")) {
      if (!res['/app/client-demo.tsx']) {
        res['/app/client-demo.tsx'] = {
          path: '/app/client-demo.tsx',
          content: pageItem.content,
        };
      }
      res['/app/page.tsx'] = {
        path: '/app/page.tsx',
        content: `import { Suspense } from 'react';\nimport ClientDemo from './client-demo';\n\nexport default function Page() {\n  return (\n    <Suspense fallback={<div className="p-6 text-slate-400 font-mono text-xs">Loading...</div>}>\n      <ClientDemo />\n    </Suspense>\n  );\n}\n`,
      };
    }
    return res;
  }, [initialFiles]);

  const [files, setFiles] = React.useState<Record<string, PlaygroundFile>>(baseFiles);
  const [activePath, setActivePath] = React.useState<string>(entryPath);
  const [inlineMode, setInlineMode] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState<number>(0);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [isHydrated, setIsHydrated] = React.useState(false);
  const workspaceContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mainSplitBodyRef = React.useRef<HTMLDivElement | null>(null);
  const terminalStartDevRef = React.useRef<() => void>(() => {});

  const { statusMap: fileStatusMap } = React.useMemo(() => {
    return computeDelta(baseFiles, files);
  }, [baseFiles, files]);

  const [layout, setLayout] = React.useState<PlaygroundLayoutConfig>({
    orientation: 'horizontal',
    viewport: 'desktop',
    showSidebar: true,
    showConsole: true,
    showPreview: true,
    isFullscreen: false,
  });

  const togglePreview = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, showPreview: prev.showPreview === false }));
  }, []);

  // Hydrate persistence from Platform DB per scopeId
  React.useEffect(() => {
    if (!scopeId) {
      setIsHydrated(true);
      return;
    }
    let isMounted = true;
    getPlatformProject('webcontainer', scopeId)
      .then((stored) => {
        if (isMounted && stored) {
          const effective = resolveEffectiveFiles(baseFiles, stored);
          // Safety guard on hydrated files from IndexedDB:
          const pageItem = effective['/app/page.tsx'];
          if (pageItem && pageItem.content.includes("'use client'")) {
            if (!effective['/app/client-demo.tsx']) {
              effective['/app/client-demo.tsx'] = {
                path: '/app/client-demo.tsx',
                content: pageItem.content,
              };
            }
            effective['/app/page.tsx'] = {
              path: '/app/page.tsx',
              content: `import { Suspense } from 'react';\nimport ClientDemo from './client-demo';\n\nexport default function Page() {\n  return (\n    <Suspense fallback={<div className="p-6 text-slate-400 font-mono text-xs">Loading...</div>}>\n      <ClientDemo />\n    </Suspense>\n  );\n}\n`,
            };
          }
          setFiles(effective);
          if (stored.activePath && effective[stored.activePath]) {
            setActivePath(stored.activePath);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsHydrated(true);
      });
    return () => {
      isMounted = false;
    };
  }, [scopeId, baseFiles]);

  // Terminal & WebContainer Integration
  const {
    initTerminal,
    fit: fitTerminal,
    focus: focusTerminal,
    clear: clearTerminal,
    isAttached,
    write: writeTerminal,
  } = useTerminalStream({
    files,
    onStartDev: () => terminalStartDevRef.current(),
  });

  const {
    status,
    serverUrl,
    error,
    guard,
    boot,
    writeFile,
    removeFile,
    restartDevServer,
  } = useWebContainer({
    autoBoot: false,
    onTerminalOutput: writeTerminal,
  });

  const isHorizontal = layout.orientation === 'horizontal';

  const {
    splitPercent,
    setSplitPercent,
    isDraggingSplit,
    setIsDraggingSplit,
    sidebarWidth,
    setSidebarWidth,
    isDraggingSidebar,
    setIsDraggingSidebar,
  } = useResizableSplit({
    containerRef: workspaceContainerRef,
    bodyRef: mainSplitBodyRef,
    isHorizontal,
    onResize: fitTerminal,
  });

  // File mutations
  const handleCodeChange = React.useCallback(
    (newContent: string) => {
      setFiles((prev) => {
        const target = prev[activePath] || { path: activePath, content: '' };
        const next = {
          ...prev,
          [activePath]: { ...target, content: newContent },
        };
        // Debounced persistence
        setSaveStatus('saving');
        setTimeout(() => {
          savePlatformDelta('webcontainer', scopeId, baseFiles, next, activePath);
          setSaveStatus('saved');
        }, 400);
        return next;
      });

      // Synchronize file with WebContainer virtual filesystem
      if (status === 'ready') {
        writeFile(activePath, newContent);
      }
    },
    [activePath, scopeId, baseFiles, status, writeFile]
  );

  const handleAddFile = React.useCallback(
    (newPath: string) => {
      const p = newPath.startsWith('/') ? newPath : `/${newPath}`;
      setFiles((prev) => {
        const next = {
          ...prev,
          [p]: { path: p, content: '// New file\n' },
        };
        savePlatformDelta('webcontainer', scopeId, baseFiles, next, activePath);
        return next;
      });
      setActivePath(p);
      if (status === 'ready') {
        writeFile(p, '// New file\n');
      }
    },
    [activePath, scopeId, baseFiles, status, writeFile]
  );

  const handleRenameFile = React.useCallback(
    (oldPath: string, newPath: string) => {
      const pNew = newPath.startsWith('/') ? newPath : `/${newPath}`;
      const renamedFile = files[oldPath];
      if (!renamedFile || pNew === oldPath) return;

      setFiles((prev) => {
        const file = prev[oldPath];
        if (!file) return prev;
        const next = { ...prev };
        delete next[oldPath];
        next[pNew] = { ...file, path: pNew };
        savePlatformDelta(
          'webcontainer',
          scopeId,
          baseFiles,
          next,
          activePath === oldPath ? pNew : activePath
        );
        return next;
      });
      if (activePath === oldPath) {
        setActivePath(pNew);
      }

      if (status === 'ready') {
        void writeFile(pNew, renamedFile.content)
          .then(() => removeFile(oldPath))
          .catch((reason) => console.error('Rename sync failed:', reason));
      }
    },
    [activePath, baseFiles, files, removeFile, scopeId, status, writeFile]
  );

  const handleDeleteFile = React.useCallback(
    (pathToDelete: string) => {
      setFiles((prev) => {
        const next = { ...prev };
        delete next[pathToDelete];
        savePlatformDelta('webcontainer', scopeId, baseFiles, next, activePath);
        return next;
      });
      if (activePath === pathToDelete) {
        const remaining = Object.keys(files).filter((k) => k !== pathToDelete);
        if (remaining.length > 0) {
          setActivePath(remaining[0]);
        }
      }
      if (status === 'ready') {
        void removeFile(pathToDelete).catch((reason) =>
          console.error('Delete sync failed:', reason)
        );
      }
    },
    [activePath, baseFiles, files, removeFile, scopeId, status]
  );

  const toggleSidebar = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, showSidebar: !prev.showSidebar }));
  }, []);

  const toggleConsole = React.useCallback(() => {
    setLayout((prev) => {
      const nextShow = !prev.showConsole;
      if (nextShow) {
        setTimeout(() => {
          fitTerminal();
          focusTerminal();
        }, 60);
      }
      return { ...prev, showConsole: nextShow };
    });
  }, [fitTerminal, focusTerminal]);

  const toggleFullscreen = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const setOrientation = React.useCallback((orientation: 'horizontal' | 'vertical') => {
    setLayout((prev) => ({ ...prev, orientation }));
  }, []);

  const setViewport = React.useCallback((viewport: 'desktop' | 'tablet' | 'mobile') => {
    setLayout((prev) => ({ ...prev, viewport }));
  }, []);

  const handleReset = React.useCallback(async () => {
    setFiles(baseFiles);
    setActivePath(baseFiles[entryPath] ? entryPath : Object.keys(baseFiles)[0]);
    setSaveStatus('idle');
    if (scopeId) await deletePlatformProject('webcontainer', scopeId);

    if (status === 'ready' || status === 'error') {
      await restartDevServer(toFileSystemTree(baseFiles));
      setIframeKey((key) => key + 1);
    }
  }, [baseFiles, entryPath, restartDevServer, scopeId, status]);

  // Run execution: hydrate persisted code, reconcile the virtual FS, then boot/restart.
  const handleRun = React.useCallback(async () => {
    // Automatically ensure preview is visible when running
    setLayout((prev) =>
      prev.showPreview === false ? { ...prev, showPreview: true } : prev
    );

    try {
      let runFiles = files;
      if (!isHydrated && scopeId) {
        const stored = await getPlatformProject('webcontainer', scopeId);
        if (stored) {
          runFiles = resolveEffectiveFiles(baseFiles, stored);
          setFiles(runFiles);
          if (stored.activePath && runFiles[stored.activePath]) {
            setActivePath(stored.activePath);
          }
        }
        setIsHydrated(true);
      }

      const runTree = toFileSystemTree(runFiles);
      if (status === 'ready' || status === 'error') {
        await restartDevServer(runTree);
        setIframeKey((k) => k + 1);
      } else {
        await boot(runTree);
      }
    } catch (reason) {
      console.error('Run execution error:', reason);
    }
  }, [baseFiles, boot, files, isHydrated, restartDevServer, scopeId, status]);

  // Refresh preview when unhidden if server is ready
  const prevShowPreviewRef = React.useRef(layout.showPreview);
  React.useEffect(() => {
    if (prevShowPreviewRef.current === false && layout.showPreview !== false) {
      if (status === 'ready') {
        setIframeKey((k) => k + 1);
      }
    }
    prevShowPreviewRef.current = layout.showPreview;
  }, [layout.showPreview, status]);

  React.useEffect(() => {
    terminalStartDevRef.current = () => {
      void handleRun();
    };
  }, [handleRun]);

  const fileList = Object.values(files);
  const activeFile = files[activePath] || files['/app/page.tsx'];

  // Map runner status for PlaygroundToolbar
  const runnerStatus: RunnerStatus =
    status === 'ready'
      ? 'ready'
      : status === 'booting' ||
          status === 'installing' ||
          status === 'starting' ||
          status === 'mounting'
        ? 'compiling'
        : status === 'error'
          ? 'error'
          : 'idle';

  // 1. Lab Launcher Card
  if (!layout.isFullscreen && !inlineMode) {
    return (
      <PlaygroundErrorBoundary fallbackTitle="Next.js Playground Error">
        <Card
          style={{ minHeight }}
          className={`glass-card from-card via-card/90 relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br to-indigo-500/5 p-6 shadow-lg ${className}`}
        >
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="flex h-full flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 shadow-xs">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                      <span>{title}</span>
                      <Badge
                        variant="outline"
                        className="border-indigo-500/40 bg-indigo-500/10 font-mono text-[10px] font-semibold text-indigo-400"
                      >
                        Next.js v15.4 · React v19.2
                      </Badge>
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Next.js curriculum running on WebContainer-compatible Node.js Wasm
                      runtime with App Router & Route Handlers.
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="border-border/60 bg-muted/40 font-mono text-[11px]"
                >
                  <Files className="mr-1 h-3 w-3" />
                  {fileList.length} files
                </Badge>
              </div>

              {instructions && (
                <div className="text-foreground/90 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                    <Target className="h-4 w-4 shrink-0" />
                    <span>Instructions:</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                    {instructions}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                  <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>App Router File Tree:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fileList.map((f) => (
                    <span
                      key={f.path}
                      className="border-border/60 bg-muted/30 text-foreground/80 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px]"
                    >
                      <span className="text-indigo-400">📄</span>
                      <span>{f.path}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>WebContainer Node.js 22 Wasm Runtime Ready</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setLayout((p) => ({ ...p, isFullscreen: true }));
                    handleRun();
                  }}
                  className="cursor-pointer bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                >
                  <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
                  <span>Open Fullscreen Studio</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInlineMode(true);
                    handleRun();
                  }}
                  className="cursor-pointer text-xs"
                >
                  <Laptop className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                  <span>Inline Studio</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </PlaygroundErrorBoundary>
    );
  }

  // 2. Full Studio View
  const containerClasses = layout.isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans'
    : `flex flex-col rounded-2xl border border-border/70 bg-card shadow-md overflow-hidden glass-card font-sans ${className}`;

  const viewportMaxWidth =
    layout.viewport === 'mobile'
      ? 'max-w-[375px]'
      : layout.viewport === 'tablet'
        ? 'max-w-[768px]'
        : 'max-w-full';

  return (
    <PlaygroundErrorBoundary fallbackTitle="Next.js Playground Studio Error">
      <div
        className={containerClasses}
        style={layout.isFullscreen ? undefined : { minHeight: '620px' }}
      >
        {/* Top Studio Toolbar */}
        <PlaygroundToolbar
          status={runnerStatus}
          layout={layout}
          logCount={0}
          saveStatus={saveStatus}
          onRun={handleRun}
          onReset={handleReset}
          onToggleConsole={toggleConsole}
          onToggleSidebar={toggleSidebar}
          onTogglePreview={togglePreview}
          onToggleFullscreen={toggleFullscreen}
          onClose={() => {
            if (layout.isFullscreen) setLayout((p) => ({ ...p, isFullscreen: false }));
            else setInlineMode(false);
          }}
          onSetOrientation={setOrientation}
          onSetViewport={setViewport}
        />

        {/* Main Body */}
        <div ref={mainSplitBodyRef} className="flex flex-1 overflow-hidden">
          {/* Activity Bar */}
          <div className="border-border/50 flex w-11 flex-col items-center justify-between border-r bg-slate-950 py-3 text-slate-400 select-none">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                className={`cursor-pointer rounded-lg p-2 transition-colors ${
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
                className={`cursor-pointer rounded-lg p-2 transition-colors ${
                  layout.showConsole
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}
                title="Toggle Terminal"
              >
                <Terminal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleRun}
                className="cursor-pointer rounded-lg p-2 text-emerald-400 transition-colors hover:bg-emerald-950/40"
                title={
                  status === 'ready'
                    ? 'Restart Server & Reload Preview (⌘↵)'
                    : 'Start Server (Node.js Wasm)'
                }
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>

          {/* File Explorer Sidebar & Resizer Gutter */}
          {layout.showSidebar && (
            <>
              <div className="flex shrink-0">
                <FileExplorer
                  files={files}
                  activePath={activePath}
                  entryPath={entryPath}
                  fileStatusMap={fileStatusMap}
                  width={sidebarWidth}
                  onSelectFile={setActivePath}
                  onAddFile={handleAddFile}
                  onRenameFile={handleRenameFile}
                  onDeleteFile={handleDeleteFile}
                />
              </div>

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
            </>
          )}

          {/* Workspace Area */}
          <div
            ref={workspaceContainerRef}
            className={`relative flex flex-1 overflow-hidden ${
              isHorizontal ? 'flex-col md:flex-row' : 'flex-col'
            } ${isDraggingSplit ? 'select-none' : ''}`}
          >
            {/* Editor Section */}
            <div
              style={
                layout.showPreview === false
                  ? { width: '100%', height: '100%' }
                  : isHorizontal
                    ? { width: `${splitPercent}%` }
                    : { height: `${splitPercent}%` }
              }
              className={`border-border/60 flex min-h-[140px] min-w-[160px] flex-1 flex-col overflow-hidden ${
                layout.showPreview === false
                  ? ''
                  : isHorizontal
                    ? 'border-r border-b md:border-b-0'
                    : 'border-b'
              }`}
            >
              <FileTabs
                files={files}
                activePath={activePath}
                entryPath={entryPath}
                fileStatusMap={fileStatusMap}
                onSelectFile={setActivePath}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
              />

              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  code={activeFile?.content ?? ''}
                  onChange={handleCodeChange}
                  onRun={handleRun}
                />
              </div>
            </div>

            {/* Draggable Resizer Gutter between Editor & Preview */}
            {layout.showPreview !== false && (
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
                title="Drag to resize Editor / Preview (Double-click to reset 50/50)"
              >
                <div
                  className={`group-hover:bg-primary rounded-full bg-slate-500/50 transition-colors ${
                    isHorizontal ? 'h-8 w-1' : 'h-1 w-8'
                  } ${isDraggingSplit ? 'bg-primary' : ''}`}
                />
              </div>
            )}

            {/* Preview & Terminal Section */}
            <div
              style={
                layout.showPreview === false
                  ? { display: 'none' }
                  : isHorizontal
                    ? { width: `${100 - splitPercent}%` }
                    : { height: `${100 - splitPercent}%` }
              }
              className={`min-h-[180px] min-w-[200px] flex-1 flex-col overflow-hidden bg-slate-950 ${
                layout.showPreview === false ? 'hidden' : 'flex'
              }`}
            >
              {/* Live Preview Pane */}
              <div className="relative flex flex-1 flex-col overflow-hidden bg-slate-950">
                {/* Preview Toolbar Header */}
                <div className="flex h-8 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {serverUrl || 'http://localhost:3000'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {status === 'ready' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRun}
                        className="h-6 w-6 cursor-pointer p-0 text-slate-400 hover:text-white"
                        title="Reload Server"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}

                    {serverUrl && (
                      <a
                        href={serverUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-white"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setLayout((p) => ({ ...p, showPreview: false }))}
                      className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-white"
                      title="Hide Preview (Code-only mode)"
                      aria-label="Hide Preview"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview Viewport Container */}
                <div className="relative flex flex-1 items-center justify-center overflow-auto bg-slate-950 p-2">
                  {/* Invisible Drag Shield */}
                  {isDraggingSplit && (
                    <div className="pointer-events-auto absolute inset-0 z-30 bg-transparent" />
                  )}

                  <div
                    className={`h-full w-full ${viewportMaxWidth} overflow-hidden rounded-xl border border-slate-800/80 shadow-2xl transition-all duration-200`}
                  >
                    {serverUrl ? (
                      <iframe
                        key={iframeKey}
                        src={serverUrl}
                        title="Next.js WebContainer Live Preview"
                        className="h-full w-full border-0 bg-[#020617]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-400">
                        {status === 'booting' ||
                        status === 'installing' ||
                        status === 'starting' ||
                        status === 'mounting' ? (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-200">
                                {status === 'installing'
                                  ? 'Installing dependencies...'
                                  : 'Starting Node.js Wasm Server...'}
                              </p>
                              <p className="text-xs text-slate-400">
                                First boot may take a moment to download packages.
                              </p>
                            </div>
                          </>
                        ) : status === 'error' ? (
                          <div
                            role="alert"
                            className="max-w-md space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-left text-xs text-rose-200"
                          >
                            <div className="flex items-center gap-2 font-bold text-rose-400">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <span>Failed to start Next.js dev server</span>
                            </div>
                            <p className="text-[11px] leading-relaxed break-words text-rose-200/90">
                              {error ||
                                'An unexpected error occurred. See Terminal output for details.'}
                            </p>
                            <Button
                              size="sm"
                              onClick={handleRun}
                              className="bg-rose-600 text-xs font-bold text-white hover:bg-rose-500"
                            >
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                              Retry
                            </Button>
                          </div>
                        ) : status === 'unsupported' ? (
                          <div className="max-w-md space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-xs text-amber-200">
                            <div className="flex items-center gap-2 font-bold text-amber-400">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <span>Browser requires Cross-Origin Isolation</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-amber-300/90">
                              {guard.message ||
                                'COOP/COEP Service Worker required for multithreaded Node.js WebAssembly.'}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => window.location.reload()}
                              className="mt-2 cursor-pointer bg-amber-600 text-xs font-bold text-white hover:bg-amber-500"
                            >
                              <span>Reload Page (Enable COI)</span>
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Server className="h-10 w-10 text-indigo-400/60" />
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-200">
                                Next.js Server is not running
                              </p>
                              <p className="text-xs text-slate-400">
                                Click &quot;Start Next.js Server&quot; to launch the dev
                                environment
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={handleRun}
                              className="mt-2 cursor-pointer bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                            >
                              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                              <span>Start Next.js Server</span>
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terminal Panel - Always Mounted with CSS Transition for Fast Toggle & Unbroken Listeners */}
              <div
                className={`shrink-0 overflow-hidden transition-all duration-200 ${
                  layout.showConsole
                    ? 'h-[200px] border-t border-slate-800'
                    : 'h-0 border-0'
                }`}
              >
                <TerminalPanel
                  onMountTerminal={initTerminal}
                  onClear={clearTerminal}
                  onResize={fitTerminal}
                  onFocus={focusTerminal}
                  isAttached={isAttached}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="border-border/40 bg-muted/40 text-muted-foreground flex h-7 shrink-0 items-center justify-between border-t px-3 font-mono text-[11px] select-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === 'ready'
                    ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                    : status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                }`}
              />
              <span>Next.js v15.4 Wasm Runtime</span>
            </span>
            <span>·</span>
            <span className="text-foreground">{activePath}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-400">
              Next 15.4 Runtime + React 19 · WebContainer
            </span>
            {layout.isFullscreen && (
              <button
                type="button"
                onClick={() => setLayout((p) => ({ ...p, isFullscreen: false }))}
                className="cursor-pointer text-slate-400 hover:text-slate-200"
              >
                [Esc to exit]
              </button>
            )}
          </div>
        </div>
      </div>
    </PlaygroundErrorBoundary>
  );
}
