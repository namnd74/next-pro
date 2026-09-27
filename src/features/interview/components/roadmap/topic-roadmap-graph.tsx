'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInterviewStore } from '../../stores/use-interview-store';
import type { TopicRoadmapSpec, RoadmapStageSpec } from '../../types/roadmap';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicRoadmapGraphProps {
  roadmap: TopicRoadmapSpec;
  activeStageId: string | null;
  onSelectStage: (stageId: string | null) => void;
  onOpenStageDrawer: (stage: RoadmapStageSpec) => void;
}

interface NodeLayout {
  id: string;
  stage: RoadmapStageSpec;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function TopicRoadmapGraph({
  roadmap,
  activeStageId,
  onSelectStage,
  onOpenStageDrawer,
}: TopicRoadmapGraphProps) {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const masteredQuestionIds = useInterviewStore(
    (s) => s.masteredQuestionIds || []
  );

  // Compute total topic progress
  const allTopicQuestionIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const stage of roadmap.stages) {
      for (const qId of stage.questionIds) set.add(qId);
    }
    return Array.from(set);
  }, [roadmap.stages]);

  const totalMasteredTopicQuestions = React.useMemo(() => {
    return allTopicQuestionIds.filter((id) =>
      masteredQuestionIds.includes(id)
    ).length;
  }, [allTopicQuestionIds, masteredQuestionIds]);

  const totalTopicPercent =
    allTopicQuestionIds.length > 0
      ? Math.round(
          (totalMasteredTopicQuestions / allTopicQuestionIds.length) * 100
        )
      : 0;

  // Layout configuration for nodes in a clean DAG structure
  // Stage 1 (Root) -> Stage 2 (Tier 2 left) & Stage 3 (Tier 2 right) -> Stage 4 (Tier 3) -> Stage 5 (Tier 4)
  const nodeWidth = 240;
  const nodeHeight = 110;

  const nodeLayouts = React.useMemo<NodeLayout[]>(() => {
    const stages = roadmap.stages;
    const layouts: NodeLayout[] = [];

    // Coordinates in a 760x420 virtual canvas
    const presetCoords = [
      { x: 50, y: 50 },    // Stage 1: Root Foundations
      { x: 340, y: 50 },   // Stage 2: Internals
      { x: 630, y: 50 },   // Stage 3: State & Concurrency
      { x: 340, y: 220 },  // Stage 4: Architecture & Scale
      { x: 630, y: 220 },  // Stage 5: Production Pitfalls
    ];

    stages.forEach((stage, idx) => {
      const coords =
        stage.layoutPosition ||
        presetCoords[idx] || {
          x: 50 + (idx % 3) * 290,
          y: 50 + Math.floor(idx / 3) * 170,
        };

      layouts.push({
        id: stage.id,
        stage,
        x: coords.x,
        y: coords.y,
        width: nodeWidth,
        height: nodeHeight,
      });
    });

    return layouts;
  }, [roadmap.stages]);

  // Edges connecting nodes
  const edges = React.useMemo(() => {
    if (roadmap.edges && roadmap.edges.length > 0) {
      return roadmap.edges;
    }
    // Default pedagogical flow: 1 -> 2, 2 -> 3, 2 -> 4, 3 -> 4, 4 -> 5
    if (roadmap.stages.length >= 5) {
      return [
        { from: roadmap.stages[0].id, to: roadmap.stages[1].id },
        { from: roadmap.stages[1].id, to: roadmap.stages[2].id },
        { from: roadmap.stages[1].id, to: roadmap.stages[3].id },
        { from: roadmap.stages[2].id, to: roadmap.stages[4].id },
        { from: roadmap.stages[3].id, to: roadmap.stages[4].id },
      ];
    }
    // Fallback: sequential linear connections
    const defaultEdges = [];
    for (let i = 0; i < roadmap.stages.length - 1; i++) {
      defaultEdges.push({
        from: roadmap.stages[i].id,
        to: roadmap.stages[i + 1].id,
      });
    }
    return defaultEdges;
  }, [roadmap]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.4));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-3">
      {/* NeetCode Overall Progress Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-indigo-500/20 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Tiến độ NeetCode Roadmap:
              </span>
              <span className="font-mono text-xs font-extrabold text-primary">
                {totalMasteredTopicQuestions} / {allTopicQuestionIds.length} câu (
                {totalTopicPercent}%)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đánh dấu các câu hỏi đã nắm vững để mở khóa toàn bộ cây tri thức
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0"
            title="Thu nhỏ"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[42px] text-center font-mono text-xs text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0"
            title="Phóng to"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-7 px-2 text-[11px] text-muted-foreground"
            title="Mặc định 100%"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Interactive DAG Graph Canvas */}
      <div className="relative overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-4 shadow-inner dark:bg-zinc-950/60">
        <div
          className="relative min-h-[380px] min-w-[920px] transition-transform duration-200 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Connector Layer */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ width: 920, height: 380 }}
          >
            <defs>
              <marker
                id="arrowhead-default"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  className="fill-border dark:fill-zinc-600"
                />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-primary" />
              </marker>
              <marker
                id="arrowhead-mastered"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-emerald-500" />
              </marker>
            </defs>

            {edges.map((edge, idx) => {
              const fromNode = nodeLayouts.find((n) => n.id === edge.from);
              const toNode = nodeLayouts.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              // Calculate start and end coordinates
              const isDownward = toNode.y > fromNode.y;
              let startX = fromNode.x + fromNode.width;
              let startY = fromNode.y + fromNode.height / 2;
              let endX = toNode.x;
              let endY = toNode.y + toNode.height / 2;

              if (isDownward && Math.abs(fromNode.x - toNode.x) < 50) {
                // Vertical flow
                startX = fromNode.x + fromNode.width / 2;
                startY = fromNode.y + fromNode.height;
                endX = toNode.x + toNode.width / 2;
                endY = toNode.y;
              } else if (isDownward) {
                // Diagonal flow
                startX = fromNode.x + fromNode.width / 2;
                startY = fromNode.y + fromNode.height;
                endX = toNode.x;
                endY = toNode.y + toNode.height / 2;
              }

              // Bezier control points
              const dx = (endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${
                endX - dx
              } ${endY}, ${endX} ${endY}`;

              // Determine arrow style
              const fromMastered = fromNode.stage.questionIds.every((id) =>
                masteredQuestionIds.includes(id)
              );
              const isStageActive =
                activeStageId === fromNode.id || activeStageId === toNode.id;

              return (
                <path
                  key={`${edge.from}-${edge.to}-${idx}`}
                  d={pathD}
                  fill="none"
                  className={cn(
                    'transition-all duration-300',
                    fromMastered
                      ? 'stroke-emerald-500/70 stroke-[2.5]'
                      : isStageActive
                      ? 'stroke-primary stroke-[2.5]'
                      : 'stroke-border/80 dark:stroke-zinc-700/80 stroke-2'
                  )}
                  markerEnd={
                    fromMastered
                      ? 'url(#arrowhead-mastered)'
                      : isStageActive
                      ? 'url(#arrowhead-active)'
                      : 'url(#arrowhead-default)'
                  }
                />
              );
            })}
          </svg>

          {/* Interactive Node Cards */}
          {nodeLayouts.map((node) => {
            const isActive = activeStageId === node.id;
            const masteredCount = node.stage.questionIds.filter((id) =>
              masteredQuestionIds.includes(id)
            ).length;
            const totalCount = node.stage.questionIds.length;
            const percent =
              totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
            const isCompleted = totalCount > 0 && masteredCount === totalCount;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: node.width,
                }}
                className="group select-none"
              >
                <div
                  onClick={() => onSelectStage(isActive ? null : node.id)}
                  className={cn(
                    'relative cursor-pointer rounded-xl border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    isCompleted
                      ? 'border-emerald-500/80 bg-emerald-500/10 dark:bg-emerald-950/30 ring-1 ring-emerald-500/40'
                      : isActive
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-primary/10'
                      : 'border-border/80 bg-card/90 hover:border-primary/60 hover:bg-card dark:bg-zinc-900/90'
                  )}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted ? '✓' : node.stage.stepNumber}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                        Trạm {node.stage.stepNumber}
                      </span>
                    </div>

                    <Badge
                      variant={isCompleted ? 'default' : isActive ? 'default' : 'secondary'}
                      className={cn(
                        'h-4 px-1.5 text-[9px] font-medium uppercase',
                        isCompleted && 'bg-emerald-600 text-white hover:bg-emerald-700'
                      )}
                    >
                      {node.stage.targetLevel}
                    </Badge>
                  </div>

                  {/* Stage Title */}
                  <h4
                    className={cn(
                      'mt-1.5 line-clamp-1 text-xs font-bold transition-colors',
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isActive
                        ? 'text-primary'
                        : 'text-foreground group-hover:text-primary'
                    )}
                    title={node.stage.title}
                  >
                    {node.stage.title.replace(/^Trạm \d+: /, '')}
                  </h4>

                  {/* NeetCode Style Progress Bar inside Node */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">
                        {masteredCount}/{totalCount} câu
                      </span>
                      <span
                        className={cn(
                          'font-mono font-bold',
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {percent}%
                      </span>
                    </div>
                    <Progress
                      value={masteredCount}
                      max={totalCount}
                      className="h-1.5 bg-muted/60"
                      indicatorClassName={
                        isCompleted
                          ? 'bg-emerald-500 from-emerald-500 to-teal-400'
                          : 'from-primary to-indigo-400'
                      }
                    />
                  </div>

                  {/* Quick Action to open drawer */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px]">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStageDrawer(node.stage);
                      }}
                      className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <span>Mở danh sách</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </span>

                    <span className="text-[10px] text-muted-foreground">
                      {isActive ? 'Đang lọc' : 'Click lọc'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
