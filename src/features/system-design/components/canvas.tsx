'use client';

import * as React from 'react';
import { RefreshCw, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSystemDesignStore } from '../stores/use-system-design-store';
import { CanvasNode } from './canvas-node';

export function Canvas() {
  const nodes = useSystemDesignStore((s) => s.nodes);
  const edges = useSystemDesignStore((s) => s.edges);
  const isConnectingFrom = useSystemDesignStore((s) => s.isConnectingFrom);
  const setConnectingFrom = useSystemDesignStore((s) => s.setConnectingFrom);
  const updateNodePosition = useSystemDesignStore((s) => s.updateNodePosition);
  const selectNode = useSystemDesignStore((s) => s.selectNode);
  const removeEdge = useSystemDesignStore((s) => s.removeEdge);
  const clearCanvas = useSystemDesignStore((s) => s.clearCanvas);
  const runAudit = useSystemDesignStore((s) => s.runAudit);

  const [draggingNodeId, setDraggingNodeId] = React.useState<string | null>(null);
  const dragOffsetRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    setDraggingNodeId(id);
    dragOffsetRef.current = {
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(
      10,
      Math.min(rect.width - 250, e.clientX - dragOffsetRef.current.x)
    );
    const newY = Math.max(
      10,
      Math.min(rect.height - 180, e.clientY - dragOffsetRef.current.y)
    );
    updateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Calculate SVG curve paths between nodes
  const calculatePath = (fromId: string, toId: string) => {
    const from = nodes.find((n) => n.id === fromId);
    const to = nodes.find((n) => n.id === toId);
    if (!from || !to) return '';

    const startX = from.x + 240; // right middle of from node
    const startY = from.y + 60;
    const endX = to.x; // left middle of to node
    const endY = to.y + 60;

    const dx = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => {
        selectNode(null);
        if (isConnectingFrom) setConnectingFrom(null);
      }}
      className="relative h-[620px] w-full select-none overflow-hidden rounded-2xl border border-border/80 bg-background shadow-inner"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(140, 140, 160, 0.15) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Floating Controls */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 p-1.5 shadow-lg backdrop-blur-md">
        <Button
          size="sm"
          variant="outline"
          onClick={() => runAudit()}
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Audit Architecture</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={clearCanvas}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear</span>
        </Button>
      </div>

      {/* Connection Indicator Banner */}
      {isConnectingFrom && (
        <div className="absolute left-4 top-4 z-20 flex animate-bounce items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
          <Zap className="h-3 w-3" />
          <span>Click on target node to establish connection protocol</span>
        </div>
      )}

      {/* SVG Canvas for Edges */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {edges.map((edge) => {
          const pathD = calculatePath(edge.from, edge.to);
          if (!pathD) return null;

          return (
            <g
              key={edge.id}
              className="group pointer-events-auto cursor-pointer"
              onClick={() => removeEdge(edge.id)}
            >
              {/* Outer stroke for easier hover hit target */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                className="hover:stroke-destructive/20"
              />

              {/* Visible edge line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#edge-gradient)"
                strokeWidth={2.5}
                strokeDasharray={edge.isAnimated ? '6, 6' : undefined}
                className={edge.isAnimated ? 'animate-pulse' : ''}
              />

              {/* Protocol Badge */}
              {edge.protocol && (
                <text
                  className="fill-muted-foreground text-[10px] font-semibold"
                  textAnchor="middle"
                >
                  <textPath href={`#${edge.id}`} startOffset="50%">
                    {edge.protocol}
                  </textPath>
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render Node Components */}
      {nodes.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary/40 text-muted-foreground">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Blank Architecture Canvas
            </h4>
            <p className="text-xs text-muted-foreground">
              Click elements from the Palette on the left or load a Senior Template above.
            </p>
          </div>
        </div>
      ) : (
        nodes.map((node) => (
          <CanvasNode key={node.id} node={node} onDragStart={handleDragStart} />
        ))
      )}
    </div>
  );
}
