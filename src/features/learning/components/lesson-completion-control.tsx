'use client';

import { useLearningStore } from '../stores/use-learning-store';
import { LessonCompletionButton } from '@/components/shared';

export function LessonCompletionControl({ lessonId }: { lessonId: string }) {
  const { completedLessonIds, markLessonCompleted } = useLearningStore();
  const isCompleted = completedLessonIds.includes(lessonId);

  return (
    <LessonCompletionButton
      isCompleted={isCompleted}
      onComplete={() => markLessonCompleted(lessonId)}
    />
  );
}
