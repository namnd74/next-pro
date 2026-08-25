'use client';

import { Check, CheckCircle2 } from 'lucide-react';
import { useAiLearningStore } from '../stores/use-ai-learning-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AiLessonCompletionControl({ lessonSlug }: { lessonSlug: string }) {
  const { completedLessonSlugs, markLessonCompleted } = useAiLearningStore();
  const completed = completedLessonSlugs.includes(lessonSlug);

  return completed ? (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400"
    >
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      Đã hoàn thành
    </Badge>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={() => markLessonCompleted(lessonSlug)}
      className="gap-1.5 text-xs"
    >
      <Check className="h-3 w-3" aria-hidden="true" />
      Đánh dấu đã học
    </Button>
  );
}
