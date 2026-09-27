'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TopicRoadmapSpec, RoadmapStageSpec } from '../../types/roadmap';
import { RoadmapMindmapModal } from './roadmap-mindmap-modal';
import {
  Compass,
  Map,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TopicRoadmapStepperProps {
  roadmap: TopicRoadmapSpec;
  activeStageId: string | null;
  onSelectStage: (stageId: string | null) => void;
  totalCategoryQuestions: number;
}

export function TopicRoadmapStepper({
  roadmap,
  activeStageId,
  onSelectStage,
  totalCategoryQuestions,
}: TopicRoadmapStepperProps) {
  const [isMindmapOpen, setIsMindmapOpen] = React.useState(false);

  const activeStage = React.useMemo<RoadmapStageSpec | undefined>(() => {
    if (!activeStageId) return undefined;
    return roadmap.stages.find((s) => s.id === activeStageId);
  }, [roadmap.stages, activeStageId]);

  return (
    <Card className="glass-card relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5 p-4 shadow-sm sm:p-5">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold">
              <Compass className="h-3.5 w-3.5" />
              <span>Lộ Trình Chuẩn Hóa</span>
            </div>
            <h3 className="text-foreground text-base font-bold sm:text-lg">
              {roadmap.title}
            </h3>
            <Badge variant="outline" className="border-indigo-500/30 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
              5 Trạm Đào Tạo
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {roadmap.tagline}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-2">
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
            <span>Xem Bản Đồ Toàn Cảnh</span>
          </Button>
        </div>
      </div>

      {/* 5-Stage Stepper Track */}
      <div className="mt-4 border-t border-border/50 pt-4">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:gap-2">
          {roadmap.stages.map((stage) => {
            const isActive = activeStageId === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(isActive ? null : stage.id)}
                className={`group relative flex min-w-[200px] flex-col items-start rounded-xl border p-3 text-left transition-all sm:min-w-0 ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                    : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-card'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                      }`}
                    >
                      {stage.stepNumber}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                      Trạm {stage.stepNumber}
                    </span>
                  </div>

                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className="h-4 px-1.5 text-[9px] font-medium uppercase"
                  >
                    {stage.targetLevel}
                  </Badge>
                </div>

                <h4
                  className={`mt-2 line-clamp-1 text-xs font-bold transition-colors ${
                    isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                  }`}
                  title={stage.title}
                >
                  {stage.title.replace(/^Trạm \d+: /, '')}
                </h4>

                <div className="mt-2 flex items-center justify-between w-full text-[11px] text-muted-foreground">
                  <span>{stage.questionIds.length} câu trọng tâm</span>
                  <ChevronRight
                    className={`h-3 w-3 transition-transform ${
                      isActive ? 'text-primary translate-x-0.5' : 'opacity-40'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
    </Card>
  );
}
