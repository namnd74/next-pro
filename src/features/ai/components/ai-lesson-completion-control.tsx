'use client';

import { useAiLearningStore } from '../stores/use-ai-learning-store';
import { LessonCompletionButton } from '@/components/shared';

export function AiLessonCompletionControl({ lessonSlug }: { lessonSlug: string }) {
  const { completedLessonSlugs, markLessonCompleted } = useAiLearningStore();
  const completed = completedLessonSlugs.includes(lessonSlug);

  return (
    <LessonCompletionButton
      isCompleted={completed}
      onComplete={() => markLessonCompleted(lessonSlug)}
    />
  );
}
