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
  ArrowRight,
  Workflow,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicRoadmapGraphProps {
  roadmap: TopicRoadmapSpec;
  activeStageId: string | null;
  onSelectStage: (stageId: string | null) => void;
  onOpenStageDrawer: (stage: RoadmapStageSpec) => void;
}

interface TreeNodeLayout {
  id: string;
  stage: RoadmapStageSpec;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number; // 0 = Root, 1 = Branch, 2 = Core Hub, 3 = Capstone
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

  // Fixed virtual canvas dimensions for a beautiful hierarchical tree
  // Center X = 440px. Canvas Width = 880px, Height = 560px
  const canvasWidth = 880;
  const canvasHeight = 560;
  const nodeWidth = 260;
  const nodeHeight = 100;

  // Hierarchical Tree Positions (NeetCode Style Branching DAG)
  // Stage 1: Top Center (Root Foundations)
  // Stage 2: Left Branch (Internals & Mechanics)
  // Stage 3: Right Branch (State & Concurrency)
  // Stage 4: Center Convergence (Architecture & Scale)
  // Stage 5: Bottom Center (Production Traps & Mastery)
  const treeNodes = React.useMemo<TreeNodeLayout[]>(() => {
    const stages = roadmap.stages;
    const layouts: TreeNodeLayout[] = [];

    // Tree positions mapped to hierarchical levels
    const treePositions = [
      { x: (canvasWidth - nodeWidth) / 2, y: 25, level: 0 }, // Root: (310, 25)
      { x: 120, y: 160, level: 1 },                          // Left Branch: (120, 160)
      { x: canvasWidth - nodeWidth - 120, y: 160, level: 1 },// Right Branch: (500, 160)
      { x: (canvasWidth - nodeWidth) / 2, y: 300, level: 2 }, // Hub: (310, 300)
      { x: (canvasWidth - nodeWidth) / 2, y: 435, level: 3 }, // Capstone: (310, 435)
    ];

    stages.forEach((stage, idx) => {
      const pos = treePositions[idx] || {
        x: (canvasWidth - nodeWidth) / 2,
        y: 25 + idx * 110,
        level: idx,
      };

      layouts.push({
        id: stage.id,
        stage,
        x: pos.x,
        y: pos.y,
        width: nodeWidth,
        height: nodeHeight,
        level: pos.level,
      });
    });

    return layouts;
  }, [roadmap.stages]);

  // Directed Tree Edges with Bezier S-Curves
  // 1 -> 2 (Root to Left Branch)
  // 1 -> 3 (Root to Right Branch)
  // 2 -> 4 (Left Branch to Hub)
  // 3 -> 4 (Right Branch to Hub)
  // 4 -> 5 (Hub to Capstone)
  const treeEdges = React.useMemo(() => {
    if (roadmap.stages.length >= 5) {
      return [
        { from: roadmap.stages[0].id, to: roadmap.stages[1].id, label: 'Nền tảng' },
        { from: roadmap.stages[0].id, to: roadmap.stages[2].id, label: 'Phát triển' },
        { from: roadmap.stages[1].id, to: roadmap.stages[3].id, label: 'Hội tụ' },
        { from: roadmap.stages[2].id, to: roadmap.stages[3].id, label: 'Hội tụ' },
        { from: roadmap.stages[3].id, to: roadmap.stages[4].id, label: 'Thực chiến' },
      ];
    }
    // Sequential fallback for fewer stages
    const edges = [];
    for (let i = 0; i < roadmap.stages.length - 1; i++) {
      edges.push({
        from: roadmap.stages[i].id,
        to: roadmap.stages[i + 1].id,
        label: `Bước ${i + 1}`,
      });
    }
    return edges;
  }, [roadmap.stages]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.4));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-3">
      {/* Top Header Controls & NeetCode Style Progress Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Workflow className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Cây Tri Thức Chuẩn NeetCode (Tree DAG):
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  'font-mono text-[10px] font-bold px-1.5 py-0',
                  totalTopicPercent === 100
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-primary'
                )}
              >
                {totalMasteredTopicQuestions} / {allTopicQuestionIds.length} câu ({totalTopicPercent}%)
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Các trạm liên kết theo điều kiện tiên quyết. Click vào trạm để lọc câu hỏi hoặc mở bảng bài tập.
            </p>
          </div>
        </div>

        {/* Zoom & Canvas Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <div className="flex items-center rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[44px] text-center font-mono text-[11px] font-semibold text-foreground">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Phóng to (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="h-7 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
              title="Đặt lại tỉ lệ 100%"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              <span>100%</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tree Canvas Wrapper with Blueprint Dot Pattern */}
      <div className="relative overflow-x-auto rounded-2xl border border-border/80 bg-zinc-50/80 p-4 shadow-inner dark:bg-zinc-950/80">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(99, 102, 241, 0.25) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div
          className="relative transition-transform duration-200 origin-top-center mx-auto"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* SVG Connectors Layer */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            <defs>
              {/* Arrowheads */}
              <marker
                id="tree-arrow-default"
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
                id="tree-arrow-active"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-primary" />
              </marker>
              <marker
                id="tree-arrow-mastered"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-emerald-500" />
              </marker>

              {/* Glow filter */}
              <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
              </filter>
            </defs>

            {treeEdges.map((edge, idx) => {
              const fromNode = treeNodes.find((n) => n.id === edge.from);
              const toNode = treeNodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              // Vertical Tree Flow:
              // Source: bottom-center of fromNode
              // Target: top-center of toNode
              const startX = fromNode.x + fromNode.width / 2;
              const startY = fromNode.y + fromNode.height;
              const endX = toNode.x + toNode.width / 2;
              const endY = toNode.y;

              // Smooth vertical S-curve
              const deltaY = endY - startY;
              const controlPointY1 = startY + deltaY * 0.55;
              const controlPointY2 = startY + deltaY * 0.45;
              const pathD = `M ${startX} ${startY} C ${startX} ${controlPointY1}, ${endX} ${controlPointY2}, ${endX} ${endY}`;

              const fromMastered = fromNode.stage.questionIds.every((id) =>
                masteredQuestionIds.includes(id)
              );
              const toMastered = toNode.stage.questionIds.every((id) =>
                masteredQuestionIds.includes(id)
              );
              const isPathMastered = fromMastered && toMastered;
              const isPathActive =
                activeStageId === fromNode.id || activeStageId === toNode.id;

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  {/* Background shadow stroke */}
                  <path
                    d={pathD}
                    fill="none"
                    strokeWidth={isPathMastered || isPathActive ? 5 : 3}
                    className={cn(
                      'transition-all duration-300',
                      isPathMastered
                        ? 'stroke-emerald-500/20'
                        : isPathActive
                        ? 'stroke-primary/20'
                        : 'stroke-transparent'
                    )}
                  />
                  {/* Foreground stroke */}
                  <path
                    d={pathD}
                    fill="none"
                    strokeWidth={isPathMastered || isPathActive ? 2.5 : 2}
                    className={cn(
                      'transition-all duration-300',
                      isPathMastered
                        ? 'stroke-emerald-500'
                        : isPathActive
                        ? 'stroke-primary'
                        : 'stroke-border dark:stroke-zinc-700/80 stroke-dasharray-[4,4]'
                    )}
                    markerEnd={
                      isPathMastered
                        ? 'url(#tree-arrow-mastered)'
                        : isPathActive
                        ? 'url(#tree-arrow-active)'
                        : 'url(#tree-arrow-default)'
                    }
                  />
                </g>
              );
            })}
          </svg>

          {/* Hierarchical Tree Nodes */}
          {treeNodes.map((node) => {
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
                className="select-none"
              >
                <div
                  onClick={() => onSelectStage(isActive ? null : node.id)}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500/[0.08] dark:bg-emerald-950/40 ring-1 ring-emerald-500/40 shadow-emerald-500/10'
                      : isActive
                      ? 'border-primary bg-primary/[0.08] ring-2 ring-primary/50 shadow-primary/20 shadow-md'
                      : 'border-border/80 bg-card/95 hover:border-primary/50 hover:bg-card dark:bg-zinc-900/90'
                  )}
                >
                  {/* Top Row: Pill number + Total Question Counter / Mastered Badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold',
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
                        Chủ Điểm #{node.stage.stepNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <Badge className="h-4.5 bg-emerald-600 px-1.5 text-[9px] font-bold text-white hover:bg-emerald-700 uppercase tracking-wide">
                          ✓ Đã xong
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-4.5 px-1.5 font-mono text-[9px] font-semibold text-muted-foreground bg-muted/80"
                        >
                          {totalCount} câu hỏi
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Node Title */}
                  <h4
                    className={cn(
                      'mt-2 line-clamp-1 text-xs font-bold transition-colors',
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isActive
                        ? 'text-primary'
                        : 'text-foreground'
                    )}
                    title={node.stage.title}
                  >
                    {node.stage.title.replace(/^Trạm \d+: /, '')}
                  </h4>

                  {/* NeetCode Style Progress Bar inside Node */}
                  <div className="mt-2.5 space-y-1">
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
                          : 'from-indigo-500 to-purple-500'
                      }
                    />
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px]">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStageDrawer(node.stage);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                      title="Mở danh sách bài tập trạm này"
                    >
                      <ListTodo className="h-3 w-3" />
                      <span>Bài tập</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </span>

                    <span
                      className={cn(
                        'text-[10px]',
                        isActive ? 'font-bold text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {isActive ? '● Đang lọc' : 'Xem câu hỏi ↓'}
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
