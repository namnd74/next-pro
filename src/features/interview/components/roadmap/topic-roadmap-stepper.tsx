'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TopicRoadmapSpec, RoadmapStageSpec } from '../../types/roadmap';
import type { InterviewQuestion } from '../../types';
import { TopicRoadmapGraph } from './topic-roadmap-graph';
import { StageQuestionsDrawer } from './stage-questions-drawer';
import {
  Compass,
  RotateCcw,
  Sparkles,
  ListTodo,
} from 'lucide-react';

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
  const [drawerStage, setDrawerStage] = React.useState<RoadmapStageSpec | null>(null);

  const activeStage = React.useMemo<RoadmapStageSpec | undefined>(() => {
    if (!activeStageId) return undefined;
    return roadmap.stages.find((s) => s.id === activeStageId);
  }, [roadmap.stages, activeStageId]);

  return (
    <Card className="glass-card relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5 p-4 shadow-sm sm:p-5">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold">
              <Compass className="h-3.5 w-3.5" />
              <span>Cây Tri Thức Chuẩn Hóa</span>
            </div>
            <h3 className="text-foreground text-base font-bold sm:text-lg">
              {roadmap.title}
            </h3>
            <Badge
              variant="outline"
              className="border-indigo-500/30 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
            >
              {roadmap.stages.length} Trạm Trọng Tâm
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {roadmap.tagline}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-2">
          {activeStageId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectStage(null)}
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs font-semibold"
              title="Xem toàn bộ câu hỏi trong chủ đề"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xem Tất Cả ({totalCategoryQuestions})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hero: Single Unified Tree DAG Visualizer */}
      <div className="mt-3 border-t border-border/50 pt-4">
        <TopicRoadmapGraph
          roadmap={roadmap}
          activeStageId={activeStageId}
          onSelectStage={onSelectStage}
          onOpenStageDrawer={(stg) => setDrawerStage(stg)}
        />
      </div>

      {/* Active Stage Detail Goal Box (Shows when a stage is active) */}
      {activeStage && (
        <div className="animate-in fade-in-50 mt-4 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground">
                  Chủ Điểm #{activeStage.stepNumber}: {activeStage.title}
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary text-[10px] font-semibold"
                >
                  {activeStage.questionIds.length} câu hỏi trọng tâm
                </Badge>
              </div>
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
              className="h-7 gap-1.5 text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary/10"
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>Bảng Bài Tập ({activeStage.questionIds.length})</span>
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
