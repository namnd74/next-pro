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
  VirtualQuestionList,
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
import { TechIcon } from '@/components/common/tech-icon';

export default function InterviewPage() {
  const { bookmarkedQuestionIds, customQuestions } = useInterviewStore();

  const [selectedCategory, setSelectedCategory] =
    React.useState<InterviewCategory>('all');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const isPendingSearch = searchQuery !== deferredSearchQuery;

  const [isJsonModalOpen, setIsJsonModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const allQuestions = React.useMemo(() => {
    return [...MOCK_INTERVIEW_QUESTIONS, ...customQuestions];
  }, [customQuestions]);

  const languageCounts = React.useMemo(() => {
    return {
      all: allQuestions.length,
      react: allQuestions.filter(
        (q) => q.category === 'react' || q.category === 'react-19'
      ).length,
      nextjs: allQuestions.filter(
        (q) => q.category === 'nextjs' || q.category === 'next-app-router'
      ).length,
      typescript: allQuestions.filter(
        (q) => q.category === 'typescript' || q.category === 'javascript-typescript'
      ).length,
      javascript: allQuestions.filter(
        (q) => q.category === 'javascript' || q.category === 'javascript-typescript'
      ).length,
      html: allQuestions.filter((q) => q.category === 'html').length,
      css: allQuestions.filter((q) => q.category === 'css').length,
      systemDesign: allQuestions.filter(
        (q) => q.category === 'system-design' || q.category === 'frontend-system-design'
      ).length,
      designPatterns: allQuestions.filter((q) => q.category === 'design-patterns').length,
      microFrontend: allQuestions.filter((q) => q.category === 'micro-frontend').length,
      go: allQuestions.filter((q) => q.category === 'go').length,
      nestjs: allQuestions.filter((q) => q.category === 'nestjs').length,
      nodejs: allQuestions.filter((q) => q.category === 'nodejs').length,
      python: allQuestions.filter((q) => q.category === 'python').length,
      django: allQuestions.filter((q) => q.category === 'django').length,
    };
  }, [allQuestions]);

  const levelCounts = React.useMemo(() => {
    const langSubset = allQuestions.filter((q) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'react')
        return q.category === 'react' || q.category === 'react-19';
      if (selectedCategory === 'nextjs')
        return q.category === 'nextjs' || q.category === 'next-app-router';
      if (selectedCategory === 'typescript')
        return q.category === 'typescript' || q.category === 'javascript-typescript';
      if (selectedCategory === 'javascript')
        return q.category === 'javascript' || q.category === 'javascript-typescript';
      if (selectedCategory === 'system-design')
        return q.category === 'system-design' || q.category === 'frontend-system-design';
      if (selectedCategory === 'go') return q.category === 'go';
      return q.category === selectedCategory;
    });

    return {
      all: langSubset.length,
      junior: langSubset.filter((q) => q.level === 'junior').length,
      middle: langSubset.filter((q) => q.level === 'middle').length,
      senior: langSubset.filter((q) => q.level === 'senior').length,
    };
  }, [allQuestions, selectedCategory]);

  const filteredQuestions = React.useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const bookmarkSet = onlyBookmarked ? new Set(bookmarkedQuestionIds) : null;

    return allQuestions.filter((q) => {
      const matchCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'react'
            ? q.category === 'react' || q.category === 'react-19'
            : selectedCategory === 'nextjs'
              ? q.category === 'nextjs' || q.category === 'next-app-router'
              : selectedCategory === 'typescript'
                ? q.category === 'typescript' || q.category === 'javascript-typescript'
                : selectedCategory === 'javascript'
                  ? q.category === 'javascript' || q.category === 'javascript-typescript'
                  : selectedCategory === 'system-design'
                    ? q.category === 'system-design' ||
                      q.category === 'frontend-system-design'
                    : selectedCategory === 'go'
                      ? q.category === 'go'
                      : q.category === selectedCategory;

      const matchLevel = selectedLevel === 'all' || q.level === selectedLevel;
      const matchBookmark = !bookmarkSet || bookmarkSet.has(q.id);

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
    deferredSearchQuery,
    bookmarkedQuestionIds,
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
            <Card className="glass-card relative z-20 space-y-3.5 p-4">
              {/* Language Classification Quick Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>🌐 Tất cả</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.all}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('react')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'react' || selectedCategory === 'react-19'
                      ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="react" className="h-3.5 w-3.5" />
                  <span>React</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.react}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('nextjs')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'nextjs' ||
                    selectedCategory === 'next-app-router'
                      ? 'bg-zinc-800 text-white shadow-sm dark:bg-zinc-200 dark:text-zinc-900'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="nextjs" className="h-3.5 w-3.5" />
                  <span>Next.js</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.nextjs}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('typescript')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'typescript'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="typescript" className="h-3.5 w-3.5" />
                  <span>TypeScript</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.typescript}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('javascript')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'javascript'
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="javascript" className="h-3.5 w-3.5" />
                  <span>JavaScript</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.javascript}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('go')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'go'
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="go" className="h-3.5 w-3.5" />
                  <span>Go (Golang)</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.go}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('nestjs')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'nestjs'
                      ? 'bg-red-500 text-white shadow-sm shadow-red-500/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="nestjs" className="h-3.5 w-3.5" />
                  <span>NestJS</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.nestjs}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('nodejs')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'nodejs'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="nodejs" className="h-3.5 w-3.5" />
                  <span>Node.js</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.nodejs}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('python')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'python'
                      ? 'bg-yellow-600 text-white shadow-sm shadow-yellow-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="python" className="h-3.5 w-3.5" />
                  <span>Python</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.python}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('django')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'django'
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="django" className="h-3.5 w-3.5" />
                  <span>Django</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.django}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('html')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'html'
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>HTML</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.html}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('css')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'css'
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>CSS</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.css}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('system-design')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'system-design'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="architecture" className="h-3.5 w-3.5" />
                  <span>System Design</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.systemDesign}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('design-patterns')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'design-patterns'
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="architecture" className="h-3.5 w-3.5" />
                  <span>Design Patterns</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.designPatterns}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('micro-frontend')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === 'micro-frontend'
                      ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TechIcon name="architecture" className="h-3.5 w-3.5" />
                  <span>Micro-Frontend</span>
                  <span className="bg-background/40 py-0.2 rounded-full px-1.5 text-[10px]">
                    {languageCounts.microFrontend}
                  </span>
                </button>
              </div>

              {/* Level Classification Quick Filter Pills */}
              <div className="border-border/40 flex flex-wrap items-center gap-1.5 border-t pt-2 pb-1">
                <span className="text-muted-foreground mr-1 text-[11px] font-semibold">
                  Level:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLevel('all')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedLevel === 'all'
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>Tất cả</span>
                  <span className="bg-background/20 py-0.2 rounded-full px-1.5 text-[10px]">
                    {levelCounts.all}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel('junior')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedLevel === 'junior'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>🟢 Cơ bản (Junior)</span>
                  <span className="bg-background/20 py-0.2 rounded-full px-1.5 text-[10px]">
                    {levelCounts.junior}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel('middle')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedLevel === 'middle'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>🟡 Trung bình (Middle)</span>
                  <span className="bg-background/20 py-0.2 rounded-full px-1.5 text-[10px]">
                    {levelCounts.middle}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel('senior')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedLevel === 'senior'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>🔴 Nâng cao (Senior)</span>
                  <span className="bg-background/20 py-0.2 rounded-full px-1.5 text-[10px]">
                    {levelCounts.senior}
                  </span>
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search
                  className={`text-muted-foreground absolute top-2.5 left-3 h-4 w-4 transition-all duration-200 ${
                    isPendingSearch ? 'text-primary animate-spin' : ''
                  }`}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, từ khóa kỹ thuật (VD: RSC, Hydration, useOptimistic...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-xl border py-2 pr-4 pl-9 text-xs focus:ring-2 focus:outline-none"
                />
              </div>

              {/* Filters row */}
              <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Chủ đề:</span>
                  </div>

                  <Select
                    value={selectedCategory}
                    onValueChange={(val) => setSelectedCategory(val as InterviewCategory)}
                    options={[
                      { value: 'all', label: 'Tất cả chủ đề' },
                      { value: 'react', label: 'React Interview Bank' },
                      { value: 'nextjs', label: 'Next.js Interview Bank' },
                      { value: 'typescript', label: 'TypeScript Bank' },
                      { value: 'javascript', label: 'JavaScript Core Bank' },
                      { value: 'html', label: 'HTML5 & Web Bank' },
                      { value: 'css', label: 'CSS3 & Styling Bank' },
                      { value: 'system-design', label: 'System Design Bank' },
                      { value: 'design-patterns', label: 'Design Patterns & SOLID' },
                      { value: 'micro-frontend', label: 'Micro-Frontend Bank' },
                      { value: 'go', label: 'Go (Golang) Bank' },
                      { value: 'nestjs', label: 'NestJS Enterprise Bank' },
                      { value: 'nodejs', label: 'Node.js Backend Bank' },
                      { value: 'python', label: 'Python & FastAPI Bank' },
                      { value: 'django', label: 'Django & DRF Bank' },
                      { value: 'react-19', label: 'React Core' },
                      { value: 'next-app-router', label: 'Next.js App Router' },
                      {
                        value: 'javascript-typescript',
                        label: 'JavaScript & TypeScript',
                      },
                      {
                        value: 'browser-runtime-workers',
                        label: 'Browser Runtime & Workers',
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

            {/* Questions list with Progressive Virtual Loading */}
            {/* Questions list with Virtual Windowing */}
            {filteredQuestions.length === 0 ? (
              <Card className="glass-card text-muted-foreground p-8 text-center text-sm">
                Không tìm thấy câu hỏi nào phù hợp với từ khóa hoặc bộ lọc hiện tại.
              </Card>
            ) : (
              <VirtualQuestionList questions={filteredQuestions} />
            )}
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
