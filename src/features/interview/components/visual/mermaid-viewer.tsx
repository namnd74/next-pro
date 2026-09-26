'use client';

import * as React from 'react';
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2, Math.round((z + 0.15) * 100) / 100));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.15) * 100) / 100));
  const handleResetZoom = () => setZoom(1);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-blue-500/20 bg-slate-50/50 dark:border-blue-500/15 dark:bg-slate-950/60 ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col bg-background/95 backdrop-blur-md shadow-2xl' : ''
      }`}
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
            title="Thu nhỏ"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Tỷ lệ 100%"
            className="px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition rounded"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Phóng to"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Khôi phục mặc định"
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

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Xem toàn màn hình'}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5 text-blue-500" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Diagram Canvas Body */}
      <div
        className={`relative flex min-h-[160px] w-full items-center justify-center overflow-auto p-4 transition-all ${
          isFullscreen ? 'flex-1' : 'max-h-[560px]'
        }`}
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
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
            className="flex items-center justify-center transition-transform duration-150 ease-out select-none"
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
  );
}
