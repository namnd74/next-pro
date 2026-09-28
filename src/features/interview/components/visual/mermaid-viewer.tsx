'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import {
  Copy,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  X,
} from 'lucide-react';

interface MermaidViewerProps {
  code: string;
  title?: string;
  caption?: string;
  className?: string;
}

export function MermaidViewer({ code, title, caption, className = '' }: MermaidViewerProps) {
  const { resolvedTheme } = useTheme();
  const [svgContent, setSvgContent] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [copied, setCopied] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic/unique container ID
  const containerId = React.useId().replace(/:/g, '_');

  // Clean code string: handle cases where code might be wrapped in ```mermaid ... ```
  const cleanCode = React.useMemo(() => {
    let raw = code.trim();
    if (raw.startsWith('```mermaid')) {
      raw = raw.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '');
    }
    // Also strip JS/TS multi-line comment markers if embedded in codeExample
    if (raw.startsWith('/*') && raw.endsWith('*/')) {
      raw = raw.slice(2, -2).trim();
    }
    // Strip leading single-line comments if any
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
                fontSize: '14px',
                primaryColor: '#1e293b',
                primaryTextColor: '#f8fafc',
                primaryBorderColor: '#3b82f6',
                lineColor: '#60a5fa',
                secondaryColor: '#0f172a',
                tertiaryColor: '#1e1b4b',
              }
            : {
                fontSize: '14px',
                primaryColor: '#f1f5f9',
                primaryTextColor: '#0f172a',
                primaryBorderColor: '#2563eb',
                lineColor: '#2563eb',
                secondaryColor: '#ffffff',
                tertiaryColor: '#eff6ff',
              },
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        });

        const uniqueId = `mermaid_${containerId}_${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanCode);

        if (isMounted) {
          // Remove restrictive inline max-width from Mermaid output to allow responsive scaling
          const responsiveSvg = svg
            .replace(/style="max-width:[^"]*"/i, 'style="width: 100%; height: auto;"')
            .replace(/height="[0-9]+"/i, '');

          setSvgContent(responsiveSvg);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, Math.round((z + 0.15) * 100) / 100));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, Math.round((z - 0.15) * 100) / 100));
  const handleResetZoom = () => setZoom(1);

  // Native Fullscreen & Viewport Portal Toggle
  const handleToggleFullscreen = React.useCallback(async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setZoom(1.2); // Comfortable spacious view in fullscreen
      try {
        if (typeof document !== 'undefined' && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen?.();
        }
      } catch {
        // Fallback to portal modal if native requestFullscreen is denied
      }
    } else {
      setIsFullscreen(false);
      setZoom(1);
      try {
        if (typeof document !== 'undefined' && document.fullscreenElement) {
          await document.exitFullscreen?.();
        }
      } catch {
        // Ignore
      }
    }
  }, [isFullscreen]);

  // Sync native fullscreen changes (e.g. user presses ESC in browser)
  React.useEffect(() => {
    if (!mounted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        setZoom(1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, mounted, handleToggleFullscreen]);

  return (
    <>
      {/* Standard Inline Card View */}
      <div
        className={`relative overflow-hidden rounded-xl border border-blue-500/25 bg-slate-50/70 dark:border-blue-500/20 dark:bg-slate-950/70 shadow-xs ${className}`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>{title || 'Sơ đồ luồng kiến trúc (Interactive Diagram)'}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <button
              type="button"
              onClick={handleZoomOut}
              title="Thu nhỏ (-)"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[42px] text-center font-mono text-[10px] text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Phóng to (+)"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Khôi phục 100%"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <div className="mx-1 h-3.5 w-px bg-border" />

            {/* Copy DSL */}
            <button
              type="button"
              onClick={handleCopy}
              title="Sao chép mã Mermaid DSL"
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy DSL</span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              title="Xem toàn màn hình thật (Fullscreen)"
              className="flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400 transition"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Toàn màn hình</span>
            </button>
          </div>
        </div>

        {/* Diagram Canvas Body */}
        <div className="relative flex min-h-[260px] max-h-[620px] w-full items-center justify-center overflow-auto p-4 transition-all scrollbar-thin">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Đang khởi tạo sơ đồ trực quan...</span>
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
              className="flex items-center justify-center transition-transform duration-150 ease-out select-none [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[1050px] [&_svg]:min-w-[550px]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
        </div>

        {/* Caption footer if provided */}
        {caption && (
          <div className="border-t border-border/40 bg-muted/20 px-3.5 py-1.5 text-[11px] text-muted-foreground italic">
            💡 {caption}
          </div>
        )}
      </div>

      {/* True Fullscreen Modal Portaled to Document Body */}
      {isFullscreen &&
        mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/98 text-slate-100 backdrop-blur-2xl animate-in fade-in duration-200">
            {/* Fullscreen Header Bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3.5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {title || 'Sơ đồ luồng kiến trúc (Interactive Diagram)'}
                  </h3>
                  {caption && (
                    <p className="text-xs text-slate-400 line-clamp-1">{caption}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Fullscreen Zoom Controls */}
                <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="rounded p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
                    title="Thu nhỏ (-)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="min-w-[50px] text-center font-mono text-xs font-semibold text-white">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="rounded p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
                    title="Phóng to (+)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="rounded px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    title="Tỉ lệ 100%"
                  >
                    <RotateCcw className="h-3 w-3 mr-1 inline" />
                    100%
                  </button>
                </div>

                {/* Copy DSL */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy DSL</span>
                    </>
                  )}
                </button>

                {/* Close Fullscreen */}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/40 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 hover:text-white transition"
                  title="Thoát toàn màn hình (ESC)"
                >
                  <X className="h-4 w-4" />
                  <span>Đóng (ESC)</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Diagram Viewport */}
            <div className="relative flex-1 overflow-auto p-8 flex items-center justify-center">
              <div
                className="flex items-center justify-center transition-transform duration-150 ease-out select-none [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[1600px] [&_svg]:max-h-[85vh] [&_svg]:drop-shadow-2xl"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Fullscreen Footer */}
            {caption && (
              <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-2.5 text-xs text-slate-400">
                💡 {caption}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
