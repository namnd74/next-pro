'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Move,
  X,
} from 'lucide-react';

interface MermaidViewerProps {
  code: string;
  title?: string;
  caption?: string;
  className?: string;
}

export function MermaidViewer({
  code,
  title,
  caption,
  className = '',
}: MermaidViewerProps) {
  const { resolvedTheme } = useTheme();
  const [svgContent, setSvgContent] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [copied, setCopied] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Pan & Zoom state
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  // Tracking references for dragging & pinch gesture
  const dragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPinchDistRef = React.useRef<number | null>(null);
  const initialPinchZoomRef = React.useRef<number>(1);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const fullscreenCanvasRef = React.useRef<HTMLDivElement>(null);

  // Generate deterministic container ID
  const containerId = React.useId().replace(/:/g, '_');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Clean code string: handle cases where code is wrapped in ```mermaid ... ``` or comments
  const cleanCode = React.useMemo(() => {
    let raw = code.trim();
    if (raw.startsWith('```mermaid')) {
      raw = raw.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '');
    }
    if (raw.startsWith('/*') && raw.endsWith('*/')) {
      raw = raw.slice(2, -2).trim();
    }
    return raw.replace(/^\/\/[^\n]*\n/gm, '').trim();
  }, [code]);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function renderMermaid() {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        const isDark = resolvedTheme === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          themeVariables: isDark
            ? {
                primaryColor: '#1e293b',
                primaryTextColor: '#f8fafc',
                primaryBorderColor: '#3b82f6',
                lineColor: '#60a5fa',
                secondaryColor: '#0f172a',
                tertiaryColor: '#1e1b4b',
              }
            : {
                primaryColor: '#f1f5f9',
                primaryTextColor: '#0f172a',
                primaryBorderColor: '#2563eb',
                lineColor: '#2563eb',
                secondaryColor: '#ffffff',
                tertiaryColor: '#eff6ff',
              },
          securityLevel: 'loose',
          fontFamily: 'inherit',
          suppressErrorRendering: true,
        });

        const uniqueId = `mermaid_${containerId}_${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanCode);

        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
          setIsLoading(false);
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [cleanCode, resolvedTheme, containerId]);

  // Zoom controls
  const handleZoomIn = React.useCallback(() => {
    setZoom((z) => Math.min(3, Math.round((z + 0.2) * 100) / 100));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setZoom((z) => Math.max(0.3, Math.round((z - 0.2) * 100) / 100));
  }, []);

  const handleResetZoomAndPan = React.useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut for Escape to exit fullscreen, and +/-/0 for zoom
  React.useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoomAndPan();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleZoomIn, handleZoomOut, handleResetZoomAndPan]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button (0) or middle mouse button (1)
    if (e.button !== 0 && e.button !== 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: Math.round(panStartRef.current.x + dx),
      y: Math.round(panStartRef.current.y + dy),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan & pinch-to-zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
      initialPinchDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialPinchZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: Math.round(panStartRef.current.x + dx),
        y: Math.round(panStartRef.current.y + dy),
      });
    } else if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = dist / initialPinchDistRef.current;
      const newZoom = Math.min(
        3,
        Math.max(0.3, initialPinchZoomRef.current * scaleFactor)
      );
      setZoom(Math.round(newZoom * 100) / 100);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialPinchDistRef.current = null;
  };

  // Wheel zoom / pan handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Pinch on trackpad or Ctrl+Wheel -> Smooth Zoom
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.003;
      setZoom((prev) =>
        Math.min(3, Math.max(0.3, Math.round((prev + zoomFactor) * 100) / 100))
      );
    } else {
      // Normal scroll or trackpad pan -> Pan the canvas
      setPan((prev) => ({
        x: Math.round(prev.x - e.deltaX),
        y: Math.round(prev.y - e.deltaY),
      }));
    }
  };

  // Render Controls Component
  const renderControls = (inFullscreen: boolean) => (
    <div className="flex items-center gap-1">
      {/* Zoom controls */}
      <button
        type="button"
        onClick={handleZoomOut}
        title="Thu nhỏ (-)"
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition active:scale-95"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={handleResetZoomAndPan}
        title="Bấm để khôi phục 100% & giữa màn hình"
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold transition"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        type="button"
        onClick={handleZoomIn}
        title="Phóng to (+)"
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition active:scale-95"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={handleResetZoomAndPan}
        title="Khôi phục vị trí & tỉ lệ gốc (Reset)"
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>

      <div className="bg-border/60 mx-1 h-3.5 w-px" />

      {/* Copy DSL */}
      <button
        type="button"
        onClick={handleCopy}
        title="Sao chép mã Mermaid DSL"
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-[11px] transition"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-500">Đã chép</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy DSL</span>
          </>
        )}
      </button>

      {/* Fullscreen toggle button */}
      <button
        type="button"
        onClick={() => {
          setIsFullscreen((f) => !f);
        }}
        title={inFullscreen ? 'Thoát toàn màn hình (ESC)' : 'Mở rộng toàn màn hình'}
        className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition active:scale-95 ${
          inFullscreen
            ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
            : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400'
        }`}
      >
        {inFullscreen ? (
          <>
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Thu nhỏ (ESC)</span>
          </>
        ) : (
          <>
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Toàn màn hình</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Inline Standard Diagram Card */}
      <div
        className={`relative overflow-hidden rounded-xl border border-blue-500/20 bg-slate-50/50 shadow-sm dark:border-blue-500/15 dark:bg-slate-950/60 ${className}`}
      >
        {/* Header bar */}
        <div className="border-border/50 bg-muted/40 flex items-center justify-between border-b px-3.5 py-2 text-xs">
          <div className="text-foreground flex min-w-0 items-center gap-2 pr-2 font-medium">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span className="truncate">
              {title || 'Sơ đồ luồng kiến trúc (Interactive Diagram)'}
            </span>
          </div>

          {renderControls(false)}
        </div>

        {/* Pan & Drag Canvas Body */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`relative flex max-h-[560px] min-h-[220px] w-full items-center justify-center overflow-hidden p-4 select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {isLoading && (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10 text-xs">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Đang render sơ đồ kiến trúc...</span>
            </div>
          )}

          {error && (
            <div className="w-full space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Không thể render sơ đồ tự động. Hiển thị mã nguồn Mermaid:</span>
              </div>
              <pre className="max-h-48 overflow-auto rounded bg-slate-900 p-2 font-mono text-[11px] text-slate-200">
                {cleanCode}
              </pre>
            </div>
          )}

          {!isLoading && !error && svgContent && (
            <div
              className={`flex items-center justify-center will-change-transform [&_svg]:pointer-events-none [&_svg]:max-w-none ${
                isDragging ? '' : 'transition-transform duration-150 ease-out'
              }`}
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}

          {/* Interactive Pan Helper Badge */}
          {!isLoading && !error && (
            <div className="border-border/50 bg-background/80 text-muted-foreground pointer-events-none absolute bottom-2 left-2.5 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] opacity-70 backdrop-blur-sm transition-opacity hover:opacity-100">
              <Move className="h-3 w-3 text-blue-500" />
              <span>Kéo chuột để di chuyển • Cuộn để phóng to</span>
            </div>
          )}
        </div>

        {/* Caption footer if provided */}
        {caption && (
          <div className="border-border/40 bg-muted/20 text-muted-foreground border-t px-3.5 py-1.5 text-[11px] italic">
            💡 {caption}
          </div>
        )}
      </div>

      {/* High-Performance Fullscreen Modal Portal */}
      {isFullscreen &&
        mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="animate-in fade-in fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 text-slate-100 backdrop-blur-xl duration-150">
            {/* Fullscreen Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 shadow-md sm:px-6">
              <div className="flex min-w-0 items-center gap-2.5 pr-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20 text-blue-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-bold text-white sm:text-sm">
                    {title || 'Sơ đồ luồng kiến trúc (Interactive Diagram)'}
                  </h3>
                  {caption && (
                    <p className="hidden truncate text-[11px] text-slate-400 sm:block">
                      {caption}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Fullscreen controls */}
                <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="rounded p-1.5 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95"
                    title="Thu nhỏ (-)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoomAndPan}
                    className="min-w-[48px] px-1 text-center font-mono text-xs font-semibold text-white transition hover:text-blue-400"
                    title="Khôi phục 100%"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="rounded p-1.5 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95"
                    title="Phóng to (+)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoomAndPan}
                    className="rounded px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    title="Khôi phục vị trí ban đầu"
                  >
                    <RotateCcw className="mr-1 inline h-3 w-3" />
                    Reset
                  </button>
                </div>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white sm:flex"
                  title="Copy Mermaid Code"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Close Fullscreen */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30 hover:text-white active:scale-95"
                  title="Thoát toàn màn hình (ESC)"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Đóng (ESC)</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Pan & Zoom Canvas */}
            <div
              ref={fullscreenCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              className={`relative flex w-full flex-1 items-center justify-center overflow-hidden p-6 select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {!isLoading && !error && svgContent && (
                <div
                  className={`flex items-center justify-center will-change-transform [&_svg]:pointer-events-none [&_svg]:max-w-none [&_svg]:drop-shadow-2xl ${
                    isDragging ? '' : 'transition-transform duration-150 ease-out'
                  }`}
                  style={{
                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}

              {/* Helper Bar In Fullscreen */}
              <div className="pointer-events-none absolute bottom-4 left-6 flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs text-slate-300 shadow-xl backdrop-blur-md">
                <Move className="h-3.5 w-3.5 text-blue-400" />
                <span>
                  Kéo chuột để xem toàn bộ sơ đồ • Cuộn hoặc phím +/- để phóng to • ESC để
                  đóng
                </span>
              </div>
            </div>

            {/* Fullscreen Footer */}
            {caption && (
              <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-2 text-xs text-slate-400">
                💡 {caption}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
