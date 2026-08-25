'use client';

import * as React from 'react';
import { Bug, Lightbulb, CheckCircle2, Eye, Check, AlertTriangle } from 'lucide-react';
import { BugHuntChallenge } from '../types';
import { useInterviewStore } from '../stores/use-interview-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';

interface BugHunterProps {
  challenges: BugHuntChallenge[];
}

export function BugHunter({ challenges }: BugHunterProps) {
  const { completedBugHuntIds, markBugHuntSolved } = useInterviewStore();

  const [activeChallengeIndex, setActiveChallengeIndex] = React.useState(0);
  const [showHints, setShowHints] = React.useState(false);
  const [showSolution, setShowSolution] = React.useState(false);

  const activeChallenge = challenges[activeChallengeIndex] || challenges[0];
  const isSolved = completedBugHuntIds.includes(activeChallenge.id);

  return (
    <div className="space-y-6">
      {/* Challenge Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {challenges.map((c, idx) => {
          const isItemSolved = completedBugHuntIds.includes(c.id);
          const isActive = idx === activeChallengeIndex;

          return (
            <Button
              key={c.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveChallengeIndex(idx);
                setShowHints(false);
                setShowSolution(false);
              }}
              className="gap-2 text-xs font-semibold"
            >
              {isItemSolved ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Bug className="h-3.5 w-3.5" />
              )}
              <span>
                Bug #{idx + 1}: {c.title.slice(0, 24)}...
              </span>
            </Button>
          );
        })}
      </div>

      {/* Main Challenge Card */}
      <Card className="glass-card space-y-6 p-6 sm:p-8">
        {/* Header */}
        <div className="border-border/50 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="destructive" className="gap-1 text-[10px] uppercase">
                <Bug className="h-3 w-3" />
                Bug Hunt Challenge
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Level: {activeChallenge.level}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                #{activeChallenge.category}
              </Badge>
            </div>

            <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {activeChallenge.title}
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <span className="text-foreground font-semibold">Scenario: </span>
              {activeChallenge.scenario}
            </p>
          </div>

          <div className="shrink-0">
            {isSolved ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-500"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Solved
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markBugHuntSolved(activeChallenge.id)}
                className="gap-1.5 text-xs text-emerald-600 hover:border-emerald-500 dark:text-emerald-400"
              >
                <Check className="h-3.5 w-3.5" />
                Mark as Solved
              </Button>
            )}
          </div>
        </div>

        {/* Buggy Code Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-destructive flex items-center gap-1.5 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Buggy Code Snippet (Hãy tìm lỗi bên dưới):
            </span>
          </div>

          <CodeBlock code={activeChallenge.buggyCode} language="tsx" />
        </div>

        {/* Hints Toggle */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="gap-1.5 text-xs"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>{showHints ? 'Ẩn Gợi ý' : 'Xem Gợi ý (Hints)'}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setShowSolution(!showSolution);
                if (!isSolved) {
                  markBugHuntSolved(activeChallenge.id);
                }
              }}
              className="gap-1.5 text-xs shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>
                {showSolution ? 'Ẩn Lời Giải' : 'Hiện Phân Tích & Code Sửa Chuẩn'}
              </span>
            </Button>
          </div>

          {showHints && (
            <div className="animate-in fade-in-50 space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Gợi ý phỏng vấn:
              </span>
              <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                {activeChallenge.hints.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>💡</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Solution & Refactored Code */}
        {showSolution && (
          <div className="animate-in fade-in-50 space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 duration-300">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Nguyên nhân lỗi kiến trúc & Hậu quả:
              </span>
              <p className="text-foreground text-xs leading-relaxed font-medium">
                {activeChallenge.bugExplanation}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-foreground text-xs font-bold">
                Mã nguồn đã được refactor chuẩn:
              </span>
              <CodeBlock code={activeChallenge.fixedCode} language="tsx" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
