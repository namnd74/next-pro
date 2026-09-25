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
} from 'lucide-react';
import { SearchInput, FilterChipGroup, type FilterChipItem } from '@/components/shared';
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

interface CategoryFilterItem {
  id: InterviewCategory;
  label: string;
  iconName?: string;
  activeColor: string;
}

const CATEGORY_ITEMS: CategoryFilterItem[] = [
  {
    id: 'all',
    label: '🌐 Tất cả',
    activeColor: 'bg-primary text-primary-foreground shadow-sm',
  },
  {
    id: 'react',
    label: 'React',
    iconName: 'react',
    activeColor: 'bg-cyan-600 text-white shadow-xs shadow-cyan-600/20',
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    iconName: 'nextjs',
    activeColor: 'bg-zinc-800 text-white shadow-xs dark:bg-zinc-200 dark:text-zinc-900',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    iconName: 'typescript',
    activeColor: 'bg-blue-600 text-white shadow-xs shadow-blue-600/20',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    iconName: 'javascript',
    activeColor: 'bg-amber-600 text-white shadow-xs shadow-amber-600/20',
  },
  {
    id: 'vue',
    label: 'Vue.js',
    activeColor: 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20',
  },
  {
    id: 'angular',
    label: 'Angular',
    activeColor: 'bg-red-600 text-white shadow-xs shadow-red-600/20',
  },
  {
    id: 'html',
    label: 'HTML5',
    activeColor: 'bg-orange-600 text-white shadow-sm shadow-orange-600/20',
  },
  {
    id: 'css',
    label: 'CSS3',
    activeColor: 'bg-sky-600 text-white shadow-sm shadow-sky-600/20',
  },
  {
    id: 'go',
    label: 'Go (Golang)',
    iconName: 'go',
    activeColor: 'bg-sky-600 text-white shadow-xs shadow-sky-600/20',
  },
  {
    id: 'nestjs',
    label: 'NestJS',
    iconName: 'nestjs',
    activeColor: 'bg-rose-600 text-white shadow-xs shadow-rose-600/20',
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    iconName: 'nodejs',
    activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
  },
  {
    id: 'python',
    label: 'Python',
    iconName: 'python',
    activeColor: 'bg-yellow-600 text-white shadow-sm shadow-yellow-600/20',
  },
  {
    id: 'django',
    label: 'Django',
    iconName: 'django',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'java',
    label: 'Java',
    activeColor: 'bg-amber-700 text-white shadow-sm shadow-amber-700/20',
  },
  {
    id: 'spring',
    label: 'Spring Boot',
    activeColor: 'bg-green-600 text-white shadow-sm shadow-green-600/20',
  },
  {
    id: 'csharp',
    label: 'C# (.NET)',
    activeColor: 'bg-purple-600 text-white shadow-sm shadow-purple-600/20',
  },
  {
    id: 'php',
    label: 'PHP',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'laravel',
    label: 'Laravel',
    activeColor: 'bg-rose-600 text-white shadow-sm shadow-rose-600/20',
  },
  {
    id: 'ruby',
    label: 'Ruby',
    activeColor: 'bg-red-600 text-white shadow-sm shadow-red-600/20',
  },
  {
    id: 'rails',
    label: 'Rails',
    activeColor: 'bg-red-700 text-white shadow-sm shadow-red-700/20',
  },
  {
    id: 'cpp',
    label: 'C++',
    activeColor: 'bg-blue-700 text-white shadow-sm shadow-blue-700/20',
  },
  {
    id: 'rust',
    label: 'Rust',
    activeColor: 'bg-orange-700 text-white shadow-sm shadow-orange-700/20',
  },
  {
    id: 'ios',
    label: 'iOS (Swift)',
    activeColor: 'bg-orange-600 text-white shadow-sm shadow-orange-600/20',
  },
  {
    id: 'android',
    label: 'Android',
    activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
  },
  {
    id: 'flutter',
    label: 'Flutter',
    activeColor: 'bg-sky-500 text-white shadow-sm shadow-sky-500/20',
  },
  {
    id: 'react-native',
    label: 'React Native',
    activeColor: 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/20',
  },
  {
    id: 'system-design',
    label: 'System Design',
    iconName: 'architecture',
    activeColor: 'bg-rose-600 text-white shadow-sm shadow-rose-600/20',
  },
  {
    id: 'design-patterns',
    label: 'Design Patterns',
    iconName: 'architecture',
    activeColor: 'bg-violet-600 text-white shadow-sm shadow-violet-600/20',
  },
  {
    id: 'micro-frontend',
    label: 'Micro-Frontend',
    iconName: 'architecture',
    activeColor: 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/20',
  },
  {
    id: 'ai',
    label: 'AI & LLM',
    activeColor: 'bg-purple-600 text-white shadow-sm shadow-purple-600/20',
  },
  {
    id: 'database',
    label: 'Database',
    activeColor: 'bg-amber-600 text-white shadow-sm shadow-amber-600/20',
  },
  {
    id: 'devops-cloud',
    label: 'DevOps & Cloud',
    activeColor: 'bg-sky-600 text-white shadow-sm shadow-sky-600/20',
  },
  {
    id: 'cs-fundamentals',
    label: 'CS Fundamentals',
    activeColor: 'bg-slate-700 text-white shadow-sm shadow-slate-700/20',
  },
  {
    id: 'dsa',
    label: 'DSA & Algorithms',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'data-engineering',
    label: 'Data Engineering',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    activeColor: 'bg-rose-700 text-white shadow-sm shadow-rose-700/20',
  },
  {
    id: 'testing-qa',
    label: 'Testing & QA',
    activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
  },
  {
    id: 'business-analyst',
    label: 'Business Analyst',
    activeColor: 'bg-blue-600 text-white shadow-sm shadow-blue-600/20',
  },
  {
    id: 'behavioral-hr',
    label: 'Behavioral & STAR',
    activeColor: 'bg-pink-600 text-white shadow-sm shadow-pink-600/20',
  },
  {
    id: 'graphql',
    label: 'GraphQL',
    activeColor: 'bg-pink-600 text-white shadow-sm shadow-pink-600/20',
  },
  {
    id: 'state-management',
    label: 'State Management',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'performance',
    label: 'Web Performance',
    activeColor: 'bg-lime-600 text-white shadow-sm shadow-lime-600/20',
  },
  {
    id: 'build-tools',
    label: 'Build Tools',
    activeColor: 'bg-yellow-600 text-white shadow-sm shadow-yellow-600/20',
  },
  {
    id: 'seo',
    label: 'SEO',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'backend-api',
    label: 'Backend API',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'shell-linux',
    label: 'Shell & Linux',
    activeColor: 'bg-zinc-700 text-white shadow-sm shadow-zinc-700/20',
  },
];

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

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: allQuestions.length };
    for (const q of allQuestions) {
      counts[q.category] = (counts[q.category] || 0) + 1;
      if (q.category === 'react-19') counts.react = (counts.react || 0) + 1;
      if (q.category === 'next-app-router') counts.nextjs = (counts.nextjs || 0) + 1;
      if (q.category === 'javascript-typescript') {
        counts.typescript = (counts.typescript || 0) + 1;
        counts.javascript = (counts.javascript || 0) + 1;
      }
      if (q.category === 'frontend-system-design') {
        counts['system-design'] = (counts['system-design'] || 0) + 1;
      }
    }
    return counts;
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

  const levelFilterItems: FilterChipItem[] = React.useMemo(
    () => [
      { id: 'all', label: 'Tất cả', count: levelCounts.all },
      {
        id: 'junior',
        label: '🟢 Cơ bản (Junior)',
        count: levelCounts.junior,
        activeColorClass: 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20',
      },
      {
        id: 'middle',
        label: '🟡 Trung bình (Middle)',
        count: levelCounts.middle,
        activeColorClass: 'bg-amber-600 text-white shadow-xs shadow-amber-600/20',
      },
      {
        id: 'senior',
        label: '🔴 Nâng cao (Senior)',
        count: levelCounts.senior,
        activeColorClass: 'bg-rose-600 text-white shadow-xs shadow-rose-600/20',
      },
    ],
    [levelCounts]
  );

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

              {/* Level Classification Quick Filter Pills */}
              <div className="border-border/40 flex flex-wrap items-center gap-1.5 border-t pt-2 pb-1">
                <span className="text-muted-foreground mr-1 text-[11px] font-semibold">
                  Level:
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
              <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Chủ đề:</span>
                  </div>

                  <Select
                    value={selectedCategory}
                    onValueChange={(val) => setSelectedCategory(val as InterviewCategory)}
                    options={CATEGORY_ITEMS.map((item) => ({
                      value: item.id,
                      label: `${item.label} (${categoryCounts[item.id] || 0})`,
                    }))}
                    className="w-56"
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
