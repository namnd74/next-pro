'use client';

import * as React from 'react';
import { Briefcase, PlayCircle, BookOpen, Bug, Filter, Bookmark } from 'lucide-react';
import {
  MOCK_INTERVIEW_QUESTIONS,
  MOCK_BUG_HUNT_CHALLENGES,
  QuestionCard,
  MockSimulator,
  BugHunter,
  InterviewStats,
  InterviewCategory,
  useInterviewStore,
} from '@/features/interview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function InterviewPage() {
  const { bookmarkedQuestionIds } = useInterviewStore();

  const [selectedCategory, setSelectedCategory] =
    React.useState<InterviewCategory>('all');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = React.useState(false);

  const filteredQuestions = React.useMemo(() => {
    return MOCK_INTERVIEW_QUESTIONS.filter((q) => {
      const matchCategory = selectedCategory === 'all' || q.category === selectedCategory;
      const matchLevel = selectedLevel === 'all' || q.level === selectedLevel;
      const matchBookmark = !onlyBookmarked || bookmarkedQuestionIds.includes(q.id);
      return matchCategory && matchLevel && matchBookmark;
    });
  }, [selectedCategory, selectedLevel, onlyBookmarked, bookmarkedQuestionIds]);

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="space-y-4 text-center sm:text-left">
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
              <span>Senior Q&A Bank</span>
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
            {/* Filter controls */}
            <Card className="glass-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Chủ đề:</span>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as InterviewCategory)
                    }
                    className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Tất cả chủ đề</option>
                    <option value="react-19">React 19 Core</option>
                    <option value="next-app-router">Next.js App Router</option>
                    <option value="state-data">State & Data Query</option>
                    <option value="performance-optimization">Performance</option>
                  </select>

                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Tất cả Level</option>
                    <option value="junior">Junior</option>
                    <option value="middle">Middle</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
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
                  Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
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
    </div>
  );
}
