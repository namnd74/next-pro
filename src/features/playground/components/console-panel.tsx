'use client';

import * as React from 'react';
import { Trash2, Terminal, ChevronRight, ChevronDown } from 'lucide-react';
import type { ConsoleMessage, SerializedValue } from '../types';

interface ConsolePanelProps {
  logs: ConsoleMessage[];
  onClear: () => void;
  className?: string;
}

function ValueNode({ value, depth = 0 }: { value: SerializedValue; depth?: number }) {
  const [isExpanded, setIsExpanded] = React.useState(depth < 1);

  if (value.type === 'null') {
    return <span className="text-slate-400 italic">null</span>;
  }
  if (value.type === 'undefined') {
    return <span className="text-slate-500 italic">undefined</span>;
  }
  if (value.type === 'string') {
    return <span className="font-mono text-emerald-400">&quot;{value.value}&quot;</span>;
  }
  if (value.type === 'number') {
    return <span className="font-mono text-amber-400">{value.value}</span>;
  }
  if (value.type === 'boolean') {
    return <span className="font-mono text-purple-400">{String(value.value)}</span>;
  }
  if (value.type === 'bigint') {
    return <span className="font-mono text-amber-300">{value.value}</span>;
  }
  if (value.type === 'symbol') {
    return <span className="font-mono text-cyan-400">{value.value}</span>;
  }
  if (value.type === 'function') {
    return <span className="font-mono text-sky-300 italic">ƒ {value.name}()</span>;
  }
  if (value.type === 'error') {
    return (
      <span className="font-mono text-rose-400">
        Error: {value.message}
        {value.stack && (
          <details className="mt-1 text-[10px] text-rose-300/80">
            <summary className="cursor-pointer opacity-70">Stack trace</summary>
            <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap">
              {value.stack}
            </pre>
          </details>
        )}
      </span>
    );
  }

  if (value.type === 'array') {
    return (
      <span className="font-mono text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-0.5 text-slate-400 hover:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span>Array({value.value.length})</span>
        </button>

        {isExpanded && (
          <div className="mt-1 ml-3 space-y-0.5 border-l border-slate-700/60 pl-2">
            {value.value.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <span className="text-slate-500">{idx}:</span>
                <ValueNode value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (value.type === 'object') {
    const keys = Object.keys(value.value);
    return (
      <span className="font-mono text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-0.5 text-slate-400 hover:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span>{'{...}'}</span>
        </button>

        {isExpanded && (
          <div className="mt-1 ml-3 space-y-0.5 border-l border-slate-700/60 pl-2">
            {keys.map((k) => (
              <div key={k} className="flex items-start gap-1">
                <span className="text-indigo-300">{k}:</span>
                <ValueNode value={value.value[k]!} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  return <span className="text-slate-300">{String(value)}</span>;
}

export function ConsolePanel({ logs, onClear, className = '' }: ConsolePanelProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelStyle = (level: ConsoleMessage['level']) => {
    switch (level) {
      case 'error':
        return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
      case 'warn':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
      case 'info':
        return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
      default:
        return 'border-border/20 text-slate-200';
    }
  };

  return (
    <div
      className={`border-border/60 flex flex-col border-t bg-slate-950 text-slate-200 ${className}`}
    >
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Terminal className="text-primary h-3.5 w-3.5" />
          <span className="font-semibold text-slate-300">Console</span>
          <span className="text-[10px] text-slate-500">({logs.length})</span>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Clear console"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Log items stream */}
      <div
        ref={containerRef}
        className="max-h-48 flex-1 space-y-1 overflow-y-auto p-2 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-slate-500 italic">
            No console output yet. Use <code>console.log(...)</code> in your code to see
            output here.
          </div>
        ) : (
          logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 rounded border px-2 py-1 text-[11px] leading-relaxed ${getLevelStyle(log.level)}`}
              >
                <span className="shrink-0 text-[10px] text-slate-500 select-none">
                  {timeStr}
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-2 overflow-x-auto">
                  {log.args.map((arg, idx) => (
                    <ValueNode key={idx} value={arg} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
