'use client';

import { Check, CheckCircle2 } from 'lucide-react';
import { useLearningStore } from '../stores/use-learning-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function LessonCompletionControl({ lessonId }: { lessonId: string }) {
  const { completedLessonIds, markLessonCompleted } = useLearningStore();
  const isCompleted = completedLessonIds.includes(lessonId);

  return isCompleted ? (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      Đã hoàn thành
    </Badge>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={() => markLessonCompleted(lessonId)}
      className="gap-1.5 text-xs"
    >
      <Check className="h-3 w-3" />
      Đánh dấu đã học
    </Button>
  );
}
