'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInterviewStore } from '../../stores/use-interview-store';
import type { RoadmapStageSpec } from '../../types/roadmap';
import type { InterviewQuestion } from '../../types';
import {
  X,
  CheckCircle2,
  Circle,
  Bookmark,
  ChevronRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageQuestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stage: RoadmapStageSpec | null;
  roadmapTitle: string;
  allQuestions: InterviewQuestion[];
  onOpenQuestionDetail?: (questionId: string) => void;
}

export function StageQuestionsDrawer({
  isOpen,
  onClose,
  stage,
  roadmapTitle,
  allQuestions,
  onOpenQuestionDetail,
}: StageQuestionsDrawerProps) {
  const [searchFilter, setSearchFilter] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState<'all' | 'junior' | 'middle' | 'senior'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = React.useState<string | null>(null);

  const masteredQuestionIds = useInterviewStore(
    (s) => s.masteredQuestionIds || []
  );
  const toggleMasteredQuestion = useInterviewStore((s) => s.toggleMasteredQuestion);
  const bookmarkedQuestionIds = useInterviewStore(
    (s) => s.bookmarkedQuestionIds || []
  );
  const toggleBookmark = useInterviewStore((s) => s.toggleBookmark);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchFilter('');
      setLevelFilter('all');
      setExpandedQuestionId(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const stageQuestions = React.useMemo(() => {
    if (!stage) return [];
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
    const result: InterviewQuestion[] = [];
    for (const qId of stage.questionIds) {
      const q = questionMap.get(qId);
      if (q) result.push(q);
    }
    return result;
  }, [stage, allQuestions]);

  const juniorQuestions = React.useMemo(
    () => stageQuestions.filter((q) => q.level === 'junior'),
    [stageQuestions]
  );
  const middleQuestions = React.useMemo(
    () => stageQuestions.filter((q) => q.level === 'middle'),
    [stageQuestions]
  );
  const seniorQuestions = React.useMemo(
    () => stageQuestions.filter((q) => q.level === 'senior' || q.level === 'lead'),
    [stageQuestions]
  );

  const filteredStageQuestions = React.useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return stageQuestions.filter((q) => {
      const matchLevel =
        levelFilter === 'all'
          ? true
          : levelFilter === 'senior'
          ? q.level === 'senior' || q.level === 'lead'
          : q.level === levelFilter;

      if (!matchLevel) return false;

      if (!query) return true;
      return (
        q.question.toLowerCase().includes(query) ||
        q.seniorAnswer.summary.toLowerCase().includes(query) ||
        q.expectedKeywords.some((kw) => kw.toLowerCase().includes(query))
      );
    });
  }, [stageQuestions, searchFilter, levelFilter]);

  if (!isOpen || !stage) return null;

  const masteredCount = stage.questionIds.filter((id) =>
    masteredQuestionIds.includes(id)
  ).length;
  const totalCount = stage.questionIds.length;
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const isAllMastered = totalCount > 0 && masteredCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200">
      {/* Background overlay click */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Đóng bảng câu hỏi"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
                {roadmapTitle}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Chủ Điểm Kiến Thức #{stage.stepNumber}
              </span>
            </div>

            <h2 className="text-foreground text-lg font-bold sm:text-xl">
              {stage.title}
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {stage.shortGoal}
            </p>

            {/* Level Spectrum Badge Row */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground font-medium">Bao gồm:</span>
              {juniorQuestions.length > 0 && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  🟢 {juniorQuestions.length} Junior
                </span>
              )}
              {middleQuestions.length > 0 && (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  🟡 {middleQuestions.length} Middle
                </span>
              )}
              {seniorQuestions.length > 0 && (
                <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/25">
                  🔴 {seniorQuestions.length} Senior
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg p-0"
            title="Đóng (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Card (NeetCode Style) */}
        <div className="my-3 rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Tiến độ nắm vững chủ điểm</span>
            </span>
            <span
              className={cn(
                'font-bold',
                isAllMastered ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
              )}
            >
              {masteredCount} / {totalCount} câu ({progressPercent}%)
            </span>
          </div>

          <Progress
            value={masteredCount}
            max={totalCount}
            indicatorClassName={
              isAllMastered
                ? 'bg-emerald-500 from-emerald-500 to-teal-400'
                : 'from-indigo-500 to-purple-500'
            }
          />
        </div>

        {/* Filter by Level Tabs inside this Knowledge Stage */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-2">
          <span className="text-[10px] font-bold text-muted-foreground mr-1">Lọc theo độ khó:</span>
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={cn(
              'rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all',
              levelFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            )}
          >
            Tất cả ({stageQuestions.length})
          </button>
          {juniorQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setLevelFilter('junior')}
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all',
                levelFilter === 'junior'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted/70 text-emerald-600 dark:text-emerald-400 hover:bg-muted'
              )}
            >
              🟢 Junior ({juniorQuestions.length})
            </button>
          )}
          {middleQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setLevelFilter('middle')}
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all',
                levelFilter === 'middle'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-muted/70 text-amber-600 dark:text-amber-400 hover:bg-muted'
              )}
            >
              🟡 Middle ({middleQuestions.length})
            </button>
          )}
          {seniorQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setLevelFilter('senior')}
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all',
                levelFilter === 'senior'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-muted/70 text-rose-600 dark:text-rose-400 hover:bg-muted'
              )}
            >
              🔴 Senior ({seniorQuestions.length})
            </button>
          )}
        </div>

        {/* Quick Filter Search inside Drawer */}
        <div className="relative mb-3">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi trong chủ điểm này..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="border-input placeholder:text-muted-foreground focus-visible:ring-primary/40 bg-muted/40 h-8 w-full rounded-lg border pl-8 pr-3 text-xs transition-all focus:outline-none focus-visible:ring-2"
          />
        </div>

        {/* Questions List */}
        <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto pr-1">
          {filteredStageQuestions.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-xs">
              Không tìm thấy câu hỏi nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm.
            </div>
          ) : (
            filteredStageQuestions.map((q, idx) => {
              const isMastered = masteredQuestionIds.includes(q.id);
              const isBookmarked = bookmarkedQuestionIds.includes(q.id);
              const isExpanded = expandedQuestionId === q.id;

              return (
                <Card
                  key={q.id}
                  className={cn(
                    'group border p-3 transition-all',
                    isMastered
                      ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
                      : 'border-border/60 bg-card hover:border-primary/40'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={() => toggleMasteredQuestion(q.id)}
                      className="mt-0.5 shrink-0 rounded-md p-0.5 text-muted-foreground transition-transform active:scale-90 hover:text-emerald-500"
                      title={
                        isMastered
                          ? 'Đã nắm vững (Click để bỏ đánh dấu)'
                          : 'Đánh dấu đã nắm vững (Mastered)'
                      }
                    >
                      {isMastered ? (
                        <CheckCircle2 className="h-5 w-5 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/60 hover:text-foreground" />
                      )}
                    </button>

                    {/* Question Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-4 px-1.5 text-[9px] uppercase tracking-wider font-semibold',
                            q.level === 'junior' && 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                            q.level === 'middle' && 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10',
                            (q.level === 'senior' || q.level === 'lead') && 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                          )}
                        >
                          {q.level}
                        </Badge>
                        {isMastered && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Đã nắm vững
                          </span>
                        )}
                      </div>

                      <h4
                        className={cn(
                          'text-xs font-bold leading-snug cursor-pointer transition-colors hover:text-primary',
                          isMastered ? 'text-foreground' : 'text-foreground'
                        )}
                        onClick={() =>
                          setExpandedQuestionId(isExpanded ? null : q.id)
                        }
                      >
                        {q.question}
                      </h4>

                      {/* Expandable Quick Answer Snippet */}
                      {isExpanded && (
                        <div className="mt-2 space-y-2 rounded-lg border border-border/50 bg-muted/40 p-2.5 text-[11px] animate-in fade-in-50">
                          <div>
                            <span className="font-bold text-primary">Tóm tắt cốt lõi: </span>
                            <span className="text-muted-foreground leading-relaxed">
                              {q.seniorAnswer.summary}
                            </span>
                          </div>

                          {q.seniorAnswer.mentalModel && (
                            <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-2 text-indigo-950 dark:text-indigo-200">
                              <span className="font-bold">🧠 Mental Model: </span>
                              <span>{q.seniorAnswer.mentalModel}</span>
                            </div>
                          )}

                          {onOpenQuestionDetail && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onOpenQuestionDetail(q.id);
                                onClose();
                              }}
                              className="mt-1 h-6 gap-1 text-[10px] font-semibold text-primary"
                            >
                              <span>Xem toàn bộ sơ đồ & code chi tiết</span>
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(q.id)}
                        className="h-7 w-7 rounded-md p-0 text-muted-foreground"
                        title={isBookmarked ? 'Bỏ bookmark' : 'Bookmark'}
                      >
                        <Bookmark
                          className={cn(
                            'h-3.5 w-3.5',
                            isBookmarked && 'fill-purple-500 text-purple-500'
                          )}
                        />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedQuestionId(isExpanded ? null : q.id)
                        }
                        className="h-7 w-7 rounded-md p-0 text-muted-foreground"
                        title={isExpanded ? 'Thu gọn' : 'Xem tóm tắt'}
                      >
                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            isExpanded && 'rotate-90 text-primary'
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
          <span>
            Hiển thị {filteredStageQuestions.length} / {totalCount} câu
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-7 px-3 text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
