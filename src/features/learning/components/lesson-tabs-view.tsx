'use client';

import type { ReactNode } from 'react';
import { BookOpen, Code2, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LessonTabsViewProps {
  theory: ReactNode;
  recipes: ReactNode;
  quiz: ReactNode;
  hasQuiz: boolean;
}

export function LessonTabsView({ theory, recipes, quiz, hasQuiz }: LessonTabsViewProps) {
  return (
    <Tabs defaultValue="theory" className="w-full">
      <TabsList
        className={`grid h-auto w-full max-w-xl p-1 ${hasQuiz ? 'grid-cols-3' : 'grid-cols-2'}`}
      >
        <TabsTrigger value="theory" className="gap-1.5 px-2 py-2 text-xs sm:px-3">
          <BookOpen className="h-3.5 w-3.5" />
          Lý thuyết
        </TabsTrigger>
        <TabsTrigger value="recipes" className="gap-1.5 px-2 py-2 text-xs sm:px-3">
          <Code2 className="h-3.5 w-3.5" />
          Code Lab
        </TabsTrigger>
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
      {hasQuiz && (
        <TabsContent value="quiz" className="mt-4 space-y-6">
          {quiz}
        </TabsContent>
      )}
    </Tabs>
  );
}
