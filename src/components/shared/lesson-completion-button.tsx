'use client';

import * as React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface LessonCompletionButtonProps {
  isCompleted: boolean;
  onComplete: () => void;
  completedText?: string;
  uncompletedText?: string;
}

export function LessonCompletionButton({
  isCompleted,
  onComplete,
  completedText = 'Đã hoàn thành',
  uncompletedText = 'Đánh dấu đã học',
}: LessonCompletionButtonProps) {
  return isCompleted ? (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400"
    >
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      {completedText}
    </Badge>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={onComplete}
      className="gap-1.5 text-xs"
    >
      <Check className="h-3 w-3" aria-hidden="true" />
      {uncompletedText}
    </Button>
  );
}
