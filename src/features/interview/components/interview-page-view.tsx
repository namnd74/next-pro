'use client';

import * as React from 'react';
import {
  Briefcase,
  PlayCircle,
  BookOpen,
  Bug,
  Filter,
  Bookmark,
  FileJson,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { SearchInput, FilterChipGroup } from '@/components/shared';
import {
  MOCK_BUG_HUNT_CHALLENGES,
  VirtualQuestionList,
  MockSimulator,
  BugHunter,
  InterviewStats,
  InterviewCategory,
  JSONManagerModal,
  CreateQuestionModal,
  TopicRoadmapStepper,
  getTopicRoadmap,
  useInterviewStore,
} from '@/features/interview';
import { CATEGORY_ITEMS } from '../config/categories.config';
import { useInterviewFilter } from '../hooks/use-interview-filter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TechIcon } from '@/components/common/tech-icon';
import { cn } from '@/lib/utils';

export function InterviewPageView() {
  const [isJsonModalOpen, setIsJsonModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const {
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    onlyBookmarked,
    setOnlyBookmarked,
    searchQuery,
    setSearchQuery,
    isPendingSearch,
    allQuestions,
    categoryCounts,
    levelFilterItems,
    filteredQuestions,
    bookmarkedQuestionIds,
  } = useInterviewFilter();

  const [selectedStageId, setSelectedStageId] = React.useState<string | null>(null);
  const [onlyMastered, setOnlyMastered] = React.useState(false);
  const masteredQuestionIds = useInterviewStore(
    (s) => s.masteredQuestionIds || []
  );

  const questionsSectionRef = React.useRef<HTMLDivElement | null>(null);
  const [targetExpandedQuestionId, setTargetExpandedQuestionId] = React.useState<string | null>(null);

  // Reset stage selection when category changes
  React.useEffect(() => {
    setSelectedStageId(null);
    setTargetExpandedQuestionId(null);
  }, [selectedCategory]);

  const currentRoadmap = React.useMemo(() => {
    return getTopicRoadmap(selectedCategory, allQuestions);
  }, [selectedCategory, allQuestions]);

  const handleSelectStage = React.useCallback((stageId: string | null) => {
    setSelectedStageId(stageId);
    if (stageId && questionsSectionRef.current) {
      setTimeout(() => {
        questionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, []);

  const handleOpenQuestionDetail = React.useCallback(
    (questionId: string) => {
      if (currentRoadmap) {
        const stage = currentRoadmap.stages.find((s) => s.questionIds.includes(questionId));
        if (stage) {
          setSelectedStageId(stage.id);
        }
      }
      setTargetExpandedQuestionId(questionId);
      if (questionsSectionRef.current) {
        setTimeout(() => {
          questionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    },
    [currentRoadmap]
  );

  const displayedQuestions = React.useMemo(() => {
    const masteredSet = onlyMastered ? new Set(masteredQuestionIds) : null;

    let base = filteredQuestions;

    if (currentRoadmap && selectedStageId) {
      const stage = currentRoadmap.stages.find((s) => s.id === selectedStageId);
      if (stage) {
        const stageIdSet = new Set(stage.questionIds);
        base = base.filter((q) => stageIdSet.has(q.id));
      }
    }

    if (onlyMastered) {
      base = base.filter((q) => masteredSet?.has(q.id));
    }

    return base;
  }, [
    filteredQuestions,
    currentRoadmap,
    selectedStageId,
    onlyMastered,
    masteredQuestionIds,
  ]);

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="space-y-3">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Briefcase className="h-4 w-4" />
            <span>Senior Technical Interview Hub</span>
          </div>

          <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
            Luyện Phỏng Vấn Kỹ Thuật Chuyên Sâu
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
            Mô phỏng phỏng vấn kỹ thuật thực tế với bộ câu hỏi Senior, bẫy tuyển dụng
            (Pitfalls), chấm điểm tự động và các thử thách bắt lỗi bug kiến trúc.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJsonModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <FileJson className="text-primary h-4 w-4" />
            <span>Import / Export JSON</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Thêm Câu Hỏi Mới</span>
          </Button>
        </div>
      </section>

      {/* Stats Summary */}
      <section>
        <InterviewStats />
      </section>

      {/* Main 3 Modes Tab Switcher */}
      <section>
        <Tabs defaultValue="simulator" className="w-full space-y-6">
          <TabsList className="mx-auto grid w-full max-w-xl grid-cols-3 sm:mx-0">
            <TabsTrigger
              value="simulator"
              className="gap-1.5 px-2 py-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
            >
              <PlayCircle className="h-4 w-4 shrink-0" />
              <span>
                <span className="hidden sm:inline">Mock </span>Simulator
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="bank"
              className="gap-1.5 px-2 py-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>
                <span className="hidden sm:inline">Senior </span>Q&A (
                {allQuestions.length})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="bughunt"
              className="gap-1.5 px-2 py-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
            >
              <Bug className="h-4 w-4 shrink-0" />
              <span>
                Bug Hunt<span className="hidden sm:inline">ing</span>
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Mode 1: Mock Simulator */}
          <TabsContent value="simulator" className="space-y-4">
            <MockSimulator />
          </TabsContent>

          {/* Mode 2: Senior Question Bank */}
          <TabsContent value="bank" className="space-y-6">
            {/* 1. Category Classification Quick Filter Bar */}
            <Card className="glass-card relative z-20 space-y-2.5 p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Chọn chủ đề kỹ thuật ({CATEGORY_ITEMS.length} chủ đề):</span>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Tổng {allQuestions.length} câu hỏi
                </span>
              </div>
              <div className="no-scrollbar flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                {CATEGORY_ITEMS.map((item) => {
                  const isSelected =
                    selectedCategory === item.id ||
                    (item.id === 'react' && selectedCategory === 'react-19') ||
                    (item.id === 'nextjs' && selectedCategory === 'next-app-router') ||
                    (item.id === 'system-design' &&
                      selectedCategory === 'frontend-system-design');
                  const count = categoryCounts[item.id] || 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedCategory(item.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? item.activeColor
                          : 'border-border/50 bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border'
                      }`}
                    >
                      {item.iconName && (
                        <TechIcon name={item.iconName} className="h-3.5 w-3.5" />
                      )}
                      <span>{item.label}</span>
                      <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 2. Topic Roadmap Tree DAG (If available) */}
            {currentRoadmap && (
              <TopicRoadmapStepper
                roadmap={currentRoadmap}
                activeStageId={selectedStageId}
                onSelectStage={handleSelectStage}
                totalCategoryQuestions={filteredQuestions.length}
                allQuestions={allQuestions}
                onOpenQuestionDetail={handleOpenQuestionDetail}
              />
            )}

            {/* 3. Search and Filter Controls ("Filter dưới" đồng bộ chặt chẽ với DAG) */}
            <div ref={questionsSectionRef} className="space-y-4">
              <Card className="glass-card relative z-20 space-y-3.5 p-4 border-primary/20 shadow-sm">
                {/* Synchronized Stage Filter Chips */}
                {currentRoadmap && (
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-2.5">
                    <span className="text-muted-foreground mr-1 text-[11px] font-bold uppercase tracking-wider">
                      Trạm Tri Thức:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectStage(null)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                        !selectedStageId
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'border-border/50 bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border'
                      )}
                    >
                      <span>Tất cả các trạm</span>
                      <span className="rounded-full bg-background/30 px-1.5 py-0.2 text-[10px]">
                        {currentRoadmap.stages.reduce((acc, s) => acc + s.questionIds.length, 0)}
                      </span>
                    </button>
                    {currentRoadmap.stages.map((stg) => {
                      const isSelected = selectedStageId === stg.id;
                      return (
                        <button
                          key={stg.id}
                          type="button"
                          onClick={() => handleSelectStage(isSelected ? null : stg.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/40'
                              : 'border-border/50 bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border'
                          )}
                        >
                          <span>Trạm #{stg.stepNumber}</span>
                          <span className="rounded-full bg-background/30 px-1.5 py-0.2 text-[10px]">
                            {stg.questionIds.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Level Classification Quick Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  <span className="text-muted-foreground mr-1 text-[11px] font-semibold">
                    Độ khó:
                  </span>
                  <FilterChipGroup
                    items={levelFilterItems}
                    selectedId={selectedLevel}
                    onChange={setSelectedLevel}
                  />
                </div>

                {/* Search bar */}
                <SearchInput
                  placeholder="Tìm kiếm câu hỏi, từ khóa kỹ thuật (VD: RSC, Hydration, useOptimistic...)"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  isPending={isPendingSearch}
                />

                {/* Filters row */}
                <div className="border-border/40 flex flex-col gap-3 border-t pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Bộ lọc:</span>
                    </div>

                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => setSelectedCategory(val as InterviewCategory)}
                      options={CATEGORY_ITEMS.map((item) => ({
                        value: item.id,
                        label: `${item.label} (${categoryCounts[item.id] || 0})`,
                      }))}
                      className="w-full sm:w-52"
                    />

                    {currentRoadmap && (
                      <Select
                        value={selectedStageId || 'all'}
                        onValueChange={(val) => handleSelectStage(val === 'all' ? null : val)}
                        options={[
                          {
                            value: 'all',
                            label: `Tất cả trạm (${currentRoadmap.stages.reduce((acc, s) => acc + s.questionIds.length, 0)} câu)`,
                          },
                          ...currentRoadmap.stages.map((stg) => ({
                            value: stg.id,
                            label: `Trạm #${stg.stepNumber}: ${stg.title.replace(/^Trạm \d+: /, '')} (${stg.questionIds.length} câu)`,
                          })),
                        ]}
                        className="w-full sm:w-60"
                      />
                    )}

                    <Select
                      value={selectedLevel}
                      onValueChange={setSelectedLevel}
                      options={[
                        { value: 'all', label: 'Tất cả Level' },
                        { value: 'junior', label: 'Junior' },
                        { value: 'middle', label: 'Middle' },
                        { value: 'senior', label: 'Senior' },
                        { value: 'lead', label: 'Lead' },
                      ]}
                      className="w-full sm:w-36"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={onlyMastered ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOnlyMastered(!onlyMastered)}
                      className={cn(
                        'w-full gap-1.5 text-xs sm:w-auto',
                        onlyMastered && 'bg-emerald-600 text-white hover:bg-emerald-700'
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Đã Nắm Vững ({masteredQuestionIds.length})</span>
                    </Button>

                    <Button
                      variant={onlyBookmarked ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                      className="w-full gap-1.5 text-xs sm:w-auto"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Đã Bookmark ({bookmarkedQuestionIds.length})</span>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Questions list with Virtual Windowing */}
              {displayedQuestions.length === 0 ? (
                <Card className="glass-card text-muted-foreground p-8 text-center text-sm">
                  Không tìm thấy câu hỏi nào phù hợp với từ khóa hoặc bộ lọc hiện tại.
                </Card>
              ) : (
                <VirtualQuestionList
                  questions={displayedQuestions}
                  expandedQuestionId={targetExpandedQuestionId}
                />
              )}
            </div>
          </TabsContent>

          {/* Mode 3: Bug Hunting Challenge */}
          <TabsContent value="bughunt" className="space-y-4">
            <BugHunter challenges={MOCK_BUG_HUNT_CHALLENGES} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Modals */}
      <JSONManagerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
