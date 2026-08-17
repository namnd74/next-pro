'use client';

import * as React from 'react';
import {
  Briefcase,
  PlayCircle,
  BookOpen,
  Bug,
  Filter,
  Bookmark,
  Search,
  FileJson,
  PlusCircle,
} from 'lucide-react';
import {
  MOCK_INTERVIEW_QUESTIONS,
  MOCK_BUG_HUNT_CHALLENGES,
  QuestionCard,
  MockSimulator,
  BugHunter,
  InterviewStats,
  InterviewCategory,
  useInterviewStore,
  JSONManagerModal,
  CreateQuestionModal,
} from '@/features/interview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function InterviewPage() {
  const { bookmarkedQuestionIds, customQuestions } = useInterviewStore();

  const [selectedCategory, setSelectedCategory] =
    React.useState<InterviewCategory>('all');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [isJsonModalOpen, setIsJsonModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const allQuestions = React.useMemo(() => {
    return [...MOCK_INTERVIEW_QUESTIONS, ...customQuestions];
  }, [customQuestions]);

  const filteredQuestions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allQuestions.filter((q) => {
      const matchCategory = selectedCategory === 'all' || q.category === selectedCategory;
      const matchLevel = selectedLevel === 'all' || q.level === selectedLevel;
      const matchBookmark = !onlyBookmarked || bookmarkedQuestionIds.includes(q.id);

      const matchSearch =
        !query ||
        q.question.toLowerCase().includes(query) ||
        q.interviewerIntent.toLowerCase().includes(query) ||
        q.seniorAnswer.summary.toLowerCase().includes(query) ||
        q.expectedKeywords.some((kw) => kw.toLowerCase().includes(query));

      return matchCategory && matchLevel && matchBookmark && matchSearch;
    });
  }, [
    allQuestions,
    selectedCategory,
    selectedLevel,
    onlyBookmarked,
    searchQuery,
    bookmarkedQuestionIds,
  ]);

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Briefcase className="h-4 w-4" />
            <span>Senior Frontend Interview Simulator</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Luyện Phỏng Vấn React 19 & Next.js 15
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
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
            <FileJson className="h-4 w-4 text-primary" />
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
            <TabsTrigger value="simulator" className="gap-2 text-xs sm:text-sm">
              <PlayCircle className="h-4 w-4" />
              <span>Mock Simulator</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-2 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              <span>Senior Q&A Bank ({allQuestions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="bughunt" className="gap-2 text-xs sm:text-sm">
              <Bug className="h-4 w-4" />
              <span>Bug Hunting</span>
            </TabsTrigger>
          </TabsList>

          {/* Mode 1: Mock Simulator */}
          <TabsContent value="simulator" className="space-y-4">
            <MockSimulator />
          </TabsContent>

          {/* Mode 2: Senior Question Bank */}
          <TabsContent value="bank" className="space-y-6">
            {/* Search and Filter controls */}
            <Card className="glass-card relative z-20 space-y-3 p-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, từ khóa kỹ thuật (VD: RSC, Hydration, useOptimistic...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Chủ đề:</span>
                  </div>

                  <Select
                    value={selectedCategory}
                    onValueChange={(val) => setSelectedCategory(val as InterviewCategory)}
                    options={[
                      { value: 'all', label: 'Tất cả chủ đề' },
                      { value: 'react-19', label: 'React 19 Core' },
                      { value: 'next-app-router', label: 'Next.js App Router' },
                      {
                        value: 'javascript-typescript',
                        label: 'JavaScript & TypeScript',
                      },
                      { value: 'state-data', label: 'State & Data Query' },
                      {
                        value: 'performance-optimization',
                        label: 'Performance & Security',
                      },
                      {
                        value: 'frontend-system-design',
                        label: 'Frontend System Design',
                      },
                    ]}
                    className="w-48"
                  />

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
                    className="w-36"
                  />
                </div>

                <Button
                  variant={onlyBookmarked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className="gap-1.5 text-xs"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Đã Bookmark ({bookmarkedQuestionIds.length})</span>
                </Button>
              </div>
            </Card>

            {/* Questions list */}
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <Card className="glass-card p-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy câu hỏi nào phù hợp với từ khóa hoặc bộ lọc hiện tại.
                </Card>
              ) : (
                filteredQuestions.map((q) => <QuestionCard key={q.id} question={q} />)
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
