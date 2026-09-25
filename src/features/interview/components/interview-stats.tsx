'use client';

import * as React from 'react';
import { Bookmark, ShieldCheck, Sparkles, Trophy, Bug } from 'lucide-react';
import { TechIcon } from '@/components/common/tech-icon';
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

  const languageBreakdown = React.useMemo(() => {
    const react = MOCK_INTERVIEW_QUESTIONS.filter(
      (q) => q.category === 'react' || q.category === 'react-19'
    ).length;
    const nextjs = MOCK_INTERVIEW_QUESTIONS.filter(
      (q) => q.category === 'nextjs' || q.category === 'next-app-router'
    ).length;
    const ts = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'typescript').length;
    const js = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'javascript').length;
    const go = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'go').length;
    const nestjs = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'nestjs').length;
    const nodejs = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'nodejs').length;
    const python = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'python').length;
    const django = MOCK_INTERVIEW_QUESTIONS.filter((q) => q.category === 'django').length;
    const others =
      MOCK_INTERVIEW_QUESTIONS.length -
      (react + nextjs + ts + js + go + nestjs + nodejs + python + django);
    return { react, nextjs, ts, js, go, nestjs, nodejs, python, django, others };
  }, []);

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

        {/* Language & Framework Distribution */}
        <div className="border-border/40 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs">
          <span className="text-muted-foreground text-[11px] font-medium">
            Phân bố ngân hàng câu hỏi theo ngôn ngữ:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              <TechIcon name="react" className="h-3.5 w-3.5" /> React:{' '}
              {languageBreakdown.react}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
              <TechIcon name="nextjs" className="h-3.5 w-3.5" /> Next.js:{' '}
              {languageBreakdown.nextjs}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <TechIcon name="typescript" className="h-3.5 w-3.5" /> TypeScript:{' '}
              {languageBreakdown.ts}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <TechIcon name="javascript" className="h-3.5 w-3.5" /> JavaScript:{' '}
              {languageBreakdown.js}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <TechIcon name="go" className="h-3.5 w-3.5" /> Go: {languageBreakdown.go}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
              <TechIcon name="nestjs" className="h-3.5 w-3.5" /> NestJS:{' '}
              {languageBreakdown.nestjs}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <TechIcon name="nodejs" className="h-3.5 w-3.5" /> Node.js:{' '}
              {languageBreakdown.nodejs}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-700 dark:text-yellow-400">
              <TechIcon name="python" className="h-3.5 w-3.5" /> Python:{' '}
              {languageBreakdown.python}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
              <TechIcon name="django" className="h-3.5 w-3.5" /> Django:{' '}
              {languageBreakdown.django}
            </span>
            {languageBreakdown.others > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                <TechIcon name="architecture" className="h-3.5 w-3.5" /> Khác & Hệ thống:{' '}
                {languageBreakdown.others}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
