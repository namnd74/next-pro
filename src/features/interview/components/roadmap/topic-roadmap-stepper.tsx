'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInterviewStore } from '../../stores/use-interview-store';
import type { TopicRoadmapSpec, RoadmapStageSpec } from '../../types/roadmap';
import type { InterviewQuestion } from '../../types';
import { RoadmapMindmapModal } from './roadmap-mindmap-modal';
import { TopicRoadmapGraph } from './topic-roadmap-graph';
import { StageQuestionsDrawer } from './stage-questions-drawer';
import {
  Compass,
  Map,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Network,
  ListOrdered,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicRoadmapStepperProps {
  roadmap: TopicRoadmapSpec;
  activeStageId: string | null;
  onSelectStage: (stageId: string | null) => void;
  totalCategoryQuestions: number;
  allQuestions?: InterviewQuestion[];
  onOpenQuestionDetail?: (questionId: string) => void;
}

export function TopicRoadmapStepper({
  roadmap,
  activeStageId,
  onSelectStage,
  totalCategoryQuestions,
  allQuestions = [],
  onOpenQuestionDetail,
}: TopicRoadmapStepperProps) {
  const [viewMode, setViewMode] = React.useState<'stepper' | 'graph'>('stepper');
  const [isMindmapOpen, setIsMindmapOpen] = React.useState(false);
  const [drawerStage, setDrawerStage] = React.useState<RoadmapStageSpec | null>(null);

  const masteredQuestionIds = useInterviewStore(
    (s) => s.masteredQuestionIds || []
  );

  const activeStage = React.useMemo<RoadmapStageSpec | undefined>(() => {
    if (!activeStageId) return undefined;
    return roadmap.stages.find((s) => s.id === activeStageId);
  }, [roadmap.stages, activeStageId]);

  // Overall topic progress calculation
  const allTopicQuestionIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const stage of roadmap.stages) {
      for (const qId of stage.questionIds) set.add(qId);
    }
    return Array.from(set);
  }, [roadmap.stages]);

  const totalMasteredCount = React.useMemo(() => {
    return allTopicQuestionIds.filter((id) =>
      masteredQuestionIds.includes(id)
    ).length;
  }, [allTopicQuestionIds, masteredQuestionIds]);

  const totalPercent =
    allTopicQuestionIds.length > 0
      ? Math.round((totalMasteredCount / allTopicQuestionIds.length) * 100)
      : 0;

  return (
    <Card className="glass-card relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5 p-4 shadow-sm sm:p-5">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold">
              <Compass className="h-3.5 w-3.5" />
              <span>NeetCode Style Roadmap</span>
            </div>
            <h3 className="text-foreground text-base font-bold sm:text-lg">
              {roadmap.title}
            </h3>
            <Badge
              variant="outline"
              className="border-indigo-500/30 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
            >
              {roadmap.stages.length} Trạm Đào Tạo
            </Badge>

            {/* Total Mastered Badge */}
            <Badge
              variant="secondary"
              className={cn(
                'h-5 px-2 font-mono text-[10px] font-bold',
                totalPercent === 100
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-primary'
              )}
            >
              {totalMasteredCount}/{allTopicQuestionIds.length} đã luyện ({totalPercent}%)
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {roadmap.tagline}
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* View Mode Toggle: Stepper vs Graph */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('stepper')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
                viewMode === 'stepper'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dạng Trạm</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
                viewMode === 'graph'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Network className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đồ Thị DAG</span>
            </button>
          </div>

          {activeStageId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectStage(null)}
              className="text-muted-foreground hover:text-foreground h-8 gap-1 text-xs"
              title="Xem toàn bộ câu hỏi trong chủ đề"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xem Tất Cả ({totalCategoryQuestions})</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMindmapOpen(true)}
            className="border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary h-8 gap-1.5 text-xs font-semibold"
          >
            <Map className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bản Đồ</span> Toàn Cảnh
          </Button>
        </div>
      </div>

      {/* View Mode Content */}
      {viewMode === 'graph' ? (
        <div className="mt-4 border-t border-border/50 pt-4 animate-in fade-in-30">
          <TopicRoadmapGraph
            roadmap={roadmap}
            activeStageId={activeStageId}
            onSelectStage={onSelectStage}
            onOpenStageDrawer={(stg) => setDrawerStage(stg)}
          />
        </div>
      ) : (
        /* 5-Stage Stepper Track with NeetCode Progress */
        <div className="mt-4 border-t border-border/50 pt-4 animate-in fade-in-30">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:gap-2">
            {roadmap.stages.map((stage) => {
              const isActive = activeStageId === stage.id;
              const masteredCount = stage.questionIds.filter((id) =>
                masteredQuestionIds.includes(id)
              ).length;
              const totalCount = stage.questionIds.length;
              const percent =
                totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
              const isCompleted = totalCount > 0 && masteredCount === totalCount;

              return (
                <div
                  key={stage.id}
                  onClick={() => onSelectStage(isActive ? null : stage.id)}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'group relative flex min-w-[200px] flex-col items-start rounded-xl border p-3 text-left transition-all sm:min-w-0 cursor-pointer select-none',
                    isCompleted
                      ? 'border-emerald-500/70 bg-emerald-500/[0.06] shadow-sm hover:border-emerald-500'
                      : isActive
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                      : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-card'
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                        )}
                      >
                        {isCompleted ? '✓' : stage.stepNumber}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Trạm {stage.stepNumber}
                      </span>
                    </div>

                    <Badge
                      variant={isCompleted ? 'default' : isActive ? 'default' : 'secondary'}
                      className={cn(
                        'h-4 px-1.5 text-[9px] font-medium uppercase',
                        isCompleted && 'bg-emerald-600 text-white'
                      )}
                    >
                      {stage.targetLevel}
                    </Badge>
                  </div>

                  <h4
                    className={cn(
                      'mt-2 line-clamp-1 text-xs font-bold transition-colors',
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isActive
                        ? 'text-primary'
                        : 'text-foreground group-hover:text-primary'
                    )}
                    title={stage.title}
                  >
                    {stage.title.replace(/^Trạm \d+: /, '')}
                  </h4>

                  {/* Progress Bar (NeetCode Style) */}
                  <div className="mt-2 w-full space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {masteredCount}/{totalCount} câu
                      </span>
                      <span
                        className={cn(
                          'font-mono font-bold',
                          isCompleted && 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {percent}%
                      </span>
                    </div>
                    <Progress
                      value={masteredCount}
                      max={totalCount}
                      className="h-1 bg-muted/60"
                      indicatorClassName={
                        isCompleted
                          ? 'bg-emerald-500 from-emerald-500 to-teal-400'
                          : 'from-indigo-500 to-purple-500'
                      }
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between w-full text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawerStage(stage);
                      }}
                      className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                      title="Mở danh sách bài tập trạm này"
                    >
                      <ListTodo className="h-3 w-3" />
                      <span>Chi tiết</span>
                    </span>

                    <ChevronRight
                      className={cn(
                        'h-3 w-3 transition-transform',
                        isActive ? 'text-primary translate-x-0.5' : 'opacity-40'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Stage Detail Goal Box */}
      {activeStage && (
        <div className="animate-in fade-in-50 mt-3.5 flex flex-col gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-foreground">
                Mục tiêu Trạm {activeStage.stepNumber}: {activeStage.title}
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {activeStage.shortGoal}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerStage(activeStage)}
              className="h-7 gap-1 text-[11px] font-semibold border-primary/30 text-primary"
            >
              <ListTodo className="h-3 w-3" />
              <span>Bảng Câu Hỏi Trạm</span>
            </Button>

            <Badge variant="default" className="text-[10px]">
              Đang lọc {activeStage.questionIds.length} câu hỏi
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectStage(null)}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              ✕ Bỏ lọc
            </Button>
          </div>
        </div>
      )}

      {/* Mindmap Modal */}
      <RoadmapMindmapModal
        isOpen={isMindmapOpen}
        onClose={() => setIsMindmapOpen(false)}
        roadmap={roadmap}
      />

      {/* Quick Stage Questions Drawer */}
      <StageQuestionsDrawer
        isOpen={Boolean(drawerStage)}
        onClose={() => setDrawerStage(null)}
        stage={drawerStage}
        roadmapTitle={roadmap.title}
        allQuestions={allQuestions}
        onOpenQuestionDetail={onOpenQuestionDetail}
      />
    </Card>
  );
}
