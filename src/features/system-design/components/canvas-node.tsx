'use client';

import * as React from 'react';
import {
  Server,
  Laptop,
  Layers,
  Zap,
  Database,
  Globe,
  Boxes,
  Trash2,
  Link2,
  Activity,
} from 'lucide-react';
import { SystemNode, NodeType } from '../types';
import { useSystemDesignStore } from '../stores/use-system-design-store';

interface CanvasNodeProps {
  node: SystemNode;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}

const TYPE_CONFIG: Record<
  NodeType,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderActive: string;
    headerBg: string;
    tag: string;
  }
> = {
  rsc: {
    icon: Server,
    accentColor: 'text-indigo-400',
    borderActive: 'border-indigo-500 ring-indigo-500/30',
    headerBg: 'bg-indigo-500/10',
    tag: 'RSC',
  },
  client: {
    icon: Laptop,
    accentColor: 'text-sky-400',
    borderActive: 'border-sky-500 ring-sky-500/30',
    headerBg: 'bg-sky-500/10',
    tag: "'use client'",
  },
  suspense: {
    icon: Layers,
    accentColor: 'text-emerald-400',
    borderActive: 'border-emerald-500 ring-emerald-500/30',
    headerBg: 'bg-emerald-500/10',
    tag: 'Streaming',
  },
  serverAction: {
    icon: Zap,
    accentColor: 'text-amber-400',
    borderActive: 'border-amber-500 ring-amber-500/30',
    headerBg: 'bg-amber-500/10',
    tag: 'Server Action',
  },
  cacheStore: {
    icon: Boxes,
    accentColor: 'text-purple-400',
    borderActive: 'border-purple-500 ring-purple-500/30',
    headerBg: 'bg-purple-500/10',
    tag: 'Cache / Store',
  },
  edgeGateway: {
    icon: Globe,
    accentColor: 'text-teal-400',
    borderActive: 'border-teal-500 ring-teal-500/30',
    headerBg: 'bg-teal-500/10',
    tag: 'Edge CDN',
  },
  database: {
    icon: Database,
    accentColor: 'text-rose-400',
    borderActive: 'border-rose-500 ring-rose-500/30',
    headerBg: 'bg-rose-500/10',
    tag: 'Database',
  },
};

export function CanvasNode({ node, onDragStart }: CanvasNodeProps) {
  const selectedNodeId = useSystemDesignStore((s) => s.selectedNodeId);
  const isConnectingFrom = useSystemDesignStore((s) => s.isConnectingFrom);
  const selectNode = useSystemDesignStore((s) => s.selectNode);
  const removeNode = useSystemDesignStore((s) => s.removeNode);
  const setConnectingFrom = useSystemDesignStore((s) => s.setConnectingFrom);
  const addEdge = useSystemDesignStore((s) => s.addEdge);

  const isSelected = selectedNodeId === node.id;
  const isTargetOfConnection = isConnectingFrom !== null && isConnectingFrom !== node.id;
  const isSourceOfConnection = isConnectingFrom === node.id;

  const config = TYPE_CONFIG[node.type];
  const Icon = config.icon;

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnectingFrom === null) {
      setConnectingFrom(node.id);
    } else if (isConnectingFrom === node.id) {
      setConnectingFrom(null);
    } else {
      addEdge(isConnectingFrom, node.id);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: '240px',
        touchAction: 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isConnectingFrom && isConnectingFrom !== node.id) {
          addEdge(isConnectingFrom, node.id);
        } else {
          selectNode(node.id);
        }
      }}
      className={`group cursor-grab rounded-2xl border bg-card/90 shadow-xl backdrop-blur-md transition-shadow active:cursor-grabbing ${
        isSelected
          ? `ring-2 ${config.borderActive} border-transparent shadow-primary/10`
          : 'border-border/80 hover:border-border'
      } ${
        isSourceOfConnection
          ? 'animate-pulse ring-2 ring-primary'
          : isTargetOfConnection
            ? 'hover:ring-2 hover:ring-primary/60'
            : ''
      }`}
    >
      {/* Node Header & Drag Bar */}
      <div
        onMouseDown={(e) => onDragStart(e, node.id)}
        className={`flex items-center justify-between rounded-t-2xl border-b border-border/40 px-3 py-2 ${config.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.accentColor}`} />
          <span className="shadow-xs rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold text-foreground">
            {config.tag}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Connect node to another"
            onClick={handleConnectClick}
            className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs transition-colors ${
              isSourceOfConnection
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
            }`}
          >
            <Link2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Delete node"
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Node Body */}
      <div className="space-y-1.5 p-3">
        <h4 className="text-xs font-bold leading-tight text-foreground">{node.title}</h4>
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {node.description}
        </p>

        {/* Metadata Telemetry */}
        {node.metadata && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {node.metadata.latencyMs !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                <Activity className="h-2.5 w-2.5 text-primary" />
                {node.metadata.latencyMs}ms
              </span>
            )}
            {node.metadata.cacheStrategy && (
              <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                {node.metadata.cacheStrategy}
              </span>
            )}
            {node.metadata.isStreaming && (
              <span className="animate-pulse rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                Streaming Active
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
