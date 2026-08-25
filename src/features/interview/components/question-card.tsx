'use client';

import * as React from 'react';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { InterviewQuestion } from '../types';
import { useInterviewStore } from '../stores/use-interview-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';

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

  const isBookmarked = bookmarkedQuestionIds.includes(question.id);
  const hasRubric = Boolean(question.evaluationRubric);

  return (
    <Card className="glass-card glass-card-hover overflow-hidden p-5 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={getLevelBadgeVariant(question.level)}
              className="text-[10px] tracking-wider uppercase"
            >
              {question.level}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground text-[10px]">
              #{question.category}
            </Badge>
          </div>

          <h3 className="text-foreground text-base leading-snug font-bold">
            {question.question}
          </h3>

          {question.contextOrScenario && (
            <p className="text-muted-foreground/90 text-xs italic">
              <span className="text-foreground font-semibold">Scenario: </span>
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
            className="text-muted-foreground h-8 w-8 rounded-lg p-0"
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
      <div className="border-border/40 mt-3 flex flex-wrap items-center gap-1.5 border-t pt-2">
        <span className="text-muted-foreground text-[11px] font-semibold">
          Key concepts:
        </span>
        {question.expectedKeywords.map((kw, i) => (
          <span
            key={i}
            className="bg-secondary/80 text-foreground rounded-md px-2 py-0.5 text-[10px] font-medium"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* Expandable Deep Content */}
      {isExpanded && (
        <div className="border-border/60 animate-in fade-in-50 mt-4 border-t pt-4 duration-200">
          <Tabs defaultValue="answer" className="w-full">
            <TabsList
              className={`grid w-full ${hasRubric ? 'max-w-xl grid-cols-4' : 'max-w-md grid-cols-3'}`}
            >
              <TabsTrigger value="answer" className="text-xs">
                💡 Deep Answer
              </TabsTrigger>
              <TabsTrigger value="pitfalls" className="text-xs">
                ⚠️ Pitfalls & Traps
              </TabsTrigger>
              <TabsTrigger value="followup" className="text-xs">
                🔄 Follow-ups
              </TabsTrigger>
              {hasRubric && (
                <TabsTrigger value="rubric" className="text-xs">
                  🎯 Rubric
                </TabsTrigger>
              )}
            </TabsList>

            {/* Senior Answer Tab */}
            <TabsContent value="answer" className="space-y-3 pt-2">
              <div className="border-primary/15 bg-primary/5 space-y-1.5 rounded-xl border p-3.5">
                <span className="text-primary flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  30-Second Answer:
                </span>
                <p className="text-foreground text-xs leading-relaxed font-medium">
                  {question.seniorAnswer.summary}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-foreground text-xs font-bold">
                  Deep Architectural Breakdown:
                </span>
                <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                  {question.seniorAnswer.deepDive}
                </p>
              </div>

              {question.seniorAnswer.mentalModel && (
                <div className="space-y-1.5 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5">
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                    Mental model:
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {question.seniorAnswer.mentalModel}
                  </p>
                </div>
              )}

              {question.seniorAnswer.reasoningSteps && (
                <div className="space-y-1.5">
                  <span className="text-foreground text-xs font-bold">
                    Reasoning từng bước:
                  </span>
                  <ol className="text-muted-foreground space-y-1.5 text-xs leading-relaxed">
                    {question.seniorAnswer.reasoningSteps.map((step, index) => (
                      <li key={step} className="flex items-start gap-2">
                        <span className="text-primary font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {question.seniorAnswer.tradeoffs && (
                <div className="space-y-1.5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
                  <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                    Trade-offs cần nói rõ:
                  </span>
                  <ul className="text-muted-foreground space-y-1.5 text-xs">
                    {question.seniorAnswer.tradeoffs.map((tradeoff) => (
                      <li key={tradeoff} className="flex items-start gap-2">
                        <span className="text-violet-500">•</span>
                        <span>{tradeoff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.seniorAnswer.codeExample && (
                <div className="mt-2">
                  <CodeBlock
                    code={question.seniorAnswer.codeExample}
                    language={question.seniorAnswer.codeLanguage ?? 'tsx'}
                  />
                </div>
              )}

              {question.seniorAnswer.verification && (
                <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Cách kiểm chứng trong production:
                  </span>
                  <ul className="text-muted-foreground space-y-1.5 text-xs">
                    {question.seniorAnswer.verification.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.references && (
                <div className="space-y-1.5">
                  <span className="text-foreground text-xs font-bold">
                    Nguồn chính thức:
                  </span>
                  <ul className="space-y-1 text-xs">
                    {question.references.map((reference) => (
                      <li key={reference.url}>
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {reference.title}
                        </a>
                      </li>
                    ))}
                  </ul>
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

            {question.evaluationRubric && (
              <TabsContent value="rubric" className="space-y-3 pt-2">
                {[
                  {
                    title: 'Baseline — đạt yêu cầu tối thiểu',
                    items: question.evaluationRubric.baseline,
                    className: 'border-slate-500/25 bg-slate-500/5',
                  },
                  {
                    title: 'Strong Senior — câu trả lời mạnh',
                    items: question.evaluationRubric.strong,
                    className: 'border-primary/25 bg-primary/5',
                  },
                  {
                    title: 'Lead / Staff — tín hiệu xuất sắc',
                    items: question.evaluationRubric.exceptional,
                    className: 'border-purple-500/25 bg-purple-500/5',
                  },
                ].map((group) => (
                  <div
                    key={group.title}
                    className={`rounded-xl border p-3.5 ${group.className}`}
                  >
                    <span className="text-foreground text-xs font-bold">
                      {group.title}
                    </span>
                    <ul className="text-muted-foreground mt-2 space-y-1.5 text-xs">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </Card>
  );
}
