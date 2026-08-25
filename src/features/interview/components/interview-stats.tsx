'use client';

import * as React from 'react';
import { Bookmark, ShieldCheck, Sparkles, Trophy, Bug } from 'lucide-react';
import { useInterviewStore } from '../stores/use-interview-store';
import {
  MOCK_INTERVIEW_QUESTIONS,
  MOCK_BUG_HUNT_CHALLENGES,
} from '../data/mock-interview-bank';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function InterviewStats() {
  const [mounted, setMounted] = React.useState(false);
  const { bookmarkedQuestionIds, completedBugHuntIds, mockSessionHistory } =
    useInterviewStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalQuestions = MOCK_INTERVIEW_QUESTIONS.length;
  const totalBugHunts = MOCK_BUG_HUNT_CHALLENGES.length;

  const averageMockScore = React.useMemo(() => {
    if (!mounted || mockSessionHistory.length === 0) return 0;
    const total = mockSessionHistory.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / mockSessionHistory.length);
  }, [mockSessionHistory, mounted]);

  const solvedBugCount = mounted ? completedBugHuntIds.length : 0;
  const bookmarkedCount = mounted ? bookmarkedQuestionIds.length : 0;

  const readinessScore = React.useMemo(() => {
    if (!mounted) return 0;
    const bugScore = (solvedBugCount / totalBugHunts) * 40;
    const mockScore = (averageMockScore / 100) * 60;
    return Math.min(Math.round(bugScore + mockScore), 100);
  }, [solvedBugCount, totalBugHunts, averageMockScore, mounted]);

  return (
    <div className="space-y-4">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Interview Readiness
              </p>
              <p className="text-foreground text-xl font-extrabold">{readinessScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Mock Avg Score</p>
              <p className="text-foreground text-xl font-extrabold">
                {averageMockScore}/100
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Bugs Solved</p>
              <p className="text-foreground text-xl font-extrabold">
                {solvedBugCount}/{totalBugHunts}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Bookmarked</p>
              <p className="text-foreground text-xl font-extrabold">
                {bookmarkedCount}/{totalQuestions}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card space-y-1.5 p-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground flex items-center gap-1.5">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            Senior Next.js Candidate Readiness Index
          </span>
          <span className="text-primary">{readinessScore}%</span>
        </div>
        <Progress value={readinessScore} />
      </Card>
    </div>
  );
}
