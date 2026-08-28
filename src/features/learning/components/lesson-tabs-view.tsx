'use client';

import type { ReactNode } from 'react';
import { BookOpen, Code2, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LessonTabsViewProps {
  theory: ReactNode;
  recipes: ReactNode;
  quiz: ReactNode;
  interactiveLab?: ReactNode;
  hasQuiz: boolean;
  hasInteractiveLab?: boolean;
}

export function LessonTabsView({
  theory,
  recipes,
  quiz,
  interactiveLab,
  hasQuiz,
  hasInteractiveLab = false,
}: LessonTabsViewProps) {
  let colCount = 2;
  if (hasQuiz) colCount++;
  if (hasInteractiveLab) colCount++;

  const getGridColsClass = () => {
    switch (colCount) {
      case 4:
        return 'grid-cols-2 sm:grid-cols-4 max-w-2xl';
      case 3:
        return 'grid-cols-3 max-w-xl';
      default:
        return 'grid-cols-2 max-w-md';
    }
  };

  return (
    <Tabs
      defaultValue={hasInteractiveLab ? 'interactive-lab' : 'theory'}
      className="w-full"
    >
      <TabsList className={`grid h-auto w-full p-1 ${getGridColsClass()}`}>
        <TabsTrigger value="theory" className="gap-1.5 px-2 py-2 text-xs sm:px-3">
          <BookOpen className="h-3.5 w-3.5" />
          Lý thuyết
        </TabsTrigger>
        <TabsTrigger value="recipes" className="gap-1.5 px-2 py-2 text-xs sm:px-3">
          <Code2 className="h-3.5 w-3.5" />
          Code Lab
        </TabsTrigger>
        {hasInteractiveLab && (
          <TabsTrigger
            value="interactive-lab"
            className="text-primary gap-1.5 px-2 py-2 text-xs font-semibold sm:px-3"
          >
            <Sparkles className="text-primary h-3.5 w-3.5" />
            Interactive Lab
          </TabsTrigger>
        )}
        {hasQuiz && (
          <TabsTrigger value="quiz" className="gap-1.5 px-2 py-2 text-xs sm:px-3">
            <Sparkles className="h-3.5 w-3.5" />
            Quiz
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="theory" className="mt-4 space-y-6">
        {theory}
      </TabsContent>
      <TabsContent value="recipes" className="mt-4 space-y-6">
        {recipes}
      </TabsContent>
      {hasInteractiveLab && (
        <TabsContent value="interactive-lab" className="mt-4 space-y-6">
          {interactiveLab}
        </TabsContent>
      )}
      {hasQuiz && (
        <TabsContent value="quiz" className="mt-4 space-y-6">
          {quiz}
        </TabsContent>
      )}
    </Tabs>
  );
}
