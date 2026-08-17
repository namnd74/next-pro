'use client';

import * as React from 'react';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { InterviewQuestion } from '../types';
import { useInterviewStore } from '../stores/use-interview-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface QuestionCardProps {
  question: InterviewQuestion;
}

function getLevelBadgeVariant(level: string) {
  switch (level) {
    case 'junior':
      return 'secondary';
    case 'middle':
      return 'outline';
    case 'senior':
      return 'default';
    case 'lead':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { bookmarkedQuestionIds, toggleBookmark } = useInterviewStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const isBookmarked = bookmarkedQuestionIds.includes(question.id);

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="glass-card glass-card-hover overflow-hidden p-5 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={getLevelBadgeVariant(question.level)}
              className="text-[10px] uppercase tracking-wider"
            >
              {question.level}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              #{question.category}
            </Badge>
          </div>

          <h3 className="text-base font-bold leading-snug text-foreground">
            {question.question}
          </h3>

          {question.contextOrScenario && (
            <p className="text-xs italic text-muted-foreground/90">
              <span className="font-semibold text-foreground">Scenario: </span>
              {question.contextOrScenario}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleBookmark(question.id)}
            className={`h-8 w-8 rounded-lg p-0 ${
              isBookmarked ? 'bg-purple-500/10 text-purple-500' : 'text-muted-foreground'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-purple-500' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 rounded-lg p-0 text-muted-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Keywords Preview */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2">
        <span className="text-[11px] font-semibold text-muted-foreground">
          Key concepts:
        </span>
        {question.expectedKeywords.map((kw, i) => (
          <span
            key={i}
            className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-foreground"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* Expandable Deep Content */}
      {isExpanded && (
        <div className="mt-4 border-t border-border/60 pt-4 duration-200 animate-in fade-in-50">
          <Tabs defaultValue="answer" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="answer" className="text-xs">
                💡 Senior Answer
              </TabsTrigger>
              <TabsTrigger value="pitfalls" className="text-xs">
                ⚠️ Pitfalls & Traps
              </TabsTrigger>
              <TabsTrigger value="followup" className="text-xs">
                🔄 Follow-ups
              </TabsTrigger>
            </TabsList>

            {/* Senior Answer Tab */}
            <TabsContent value="answer" className="space-y-3 pt-2">
              <div className="space-y-1.5 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  30-Second Elevator Pitch:
                </span>
                <p className="text-xs font-medium leading-relaxed text-foreground">
                  {question.seniorAnswer.summary}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground">
                  Deep Architectural Breakdown:
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {question.seniorAnswer.deepDive}
                </p>
              </div>

              {question.seniorAnswer.codeExample && (
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(question.seniorAnswer.codeExample)}
                    className="absolute right-3 top-3 z-10 rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <pre className="overflow-x-auto rounded-xl border border-border/80 bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed text-slate-100 dark:bg-black/70">
                    <code>{question.seniorAnswer.codeExample}</code>
                  </pre>
                </div>
              )}
            </TabsContent>

            {/* Pitfalls Tab */}
            <TabsContent value="pitfalls" className="space-y-2 pt-2">
              <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Common Red Flags & Mistakes:
                </span>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                  {question.pitfalls.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="mt-0.5 text-amber-500">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Follow-up Questions Tab */}
            <TabsContent value="followup" className="space-y-2 pt-2">
              <div className="space-y-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Interviewer Follow-up Inquiries:
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-900 dark:text-indigo-200">
                  {question.followUpQuestions.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="font-bold text-indigo-500">{fIdx + 1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
}
