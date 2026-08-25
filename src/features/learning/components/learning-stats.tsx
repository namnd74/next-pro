'use client';

import * as React from 'react';
import { Flame, CheckCircle2, Trophy, BookOpen, RotateCcw } from 'lucide-react';
import { useLearningStore } from '../stores/use-learning-store';
import { MOCK_LEARNING_TRACKS } from '../data/mock-courses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function LearningStats() {
  const [mounted, setMounted] = React.useState(false);
  const { completedLessonIds, streakDays, quizScores, resetProgress } =
    useLearningStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalLessons = React.useMemo(() => {
    return MOCK_LEARNING_TRACKS.reduce((acc, t) => acc + t.lessons.length, 0);
  }, []);

  const completedCount = mounted ? completedLessonIds.length : 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const passedQuizCount = React.useMemo(() => {
    if (!mounted) return 0;
    return Object.values(quizScores).filter((q) => q.passed).length;
  }, [quizScores, mounted]);

  const displayStreak = mounted ? streakDays : 1;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Daily Streak</p>
              <p className="text-foreground text-xl font-extrabold">
                {displayStreak} Days
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Completed</p>
              <p className="text-foreground text-xl font-extrabold">
                {completedCount}/{totalLessons}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Quizzes Passed</p>
              <p className="text-foreground text-xl font-extrabold">{passedQuizCount}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Mastery Level</p>
              <p className="text-foreground text-xl font-extrabold">{progressPercent}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar Card */}
      <Card className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground">Overall React 19 & Next.js 16 Mastery</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>

        {mounted && completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ học không?')) {
                resetProgress();
              }
            }}
            className="text-muted-foreground hover:text-destructive self-end text-xs sm:self-center"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </Card>
    </div>
  );
}
