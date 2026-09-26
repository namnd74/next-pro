'use client';

import * as React from 'react';
import { Bookmark, ChevronDown, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';
import { InterviewQuestion } from '../types';
import { useInterviewStore } from '../stores/use-interview-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';
import { TechIcon } from '@/components/common/tech-icon';
import { resolveFollowUp } from '../data/followup-resolver';
import { getCategoryBadge } from '../config/categories.config';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: InterviewQuestion;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
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

export const QuestionCard = React.memo(function QuestionCard({
  question,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: QuestionCardProps) {
  const isBookmarked = useInterviewStore(
    React.useCallback((s) => s.bookmarkedQuestionIds.includes(question.id), [question.id])
  );
  const toggleBookmark = useInterviewStore((s) => s.toggleBookmark);
  const [internalExpanded, setInternalExpanded] = React.useState(false);
  const [revealedFollowUps, setRevealedFollowUps] = React.useState<Set<number>>(
    new Set()
  );

  const isControlled = typeof controlledExpanded === 'boolean';
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  const [hasBeenExpanded, setHasBeenExpanded] = React.useState(isExpanded);

  React.useEffect(() => {
    if (isExpanded) {
      setHasBeenExpanded(true);
    }
  }, [isExpanded]);

  const handleToggleExpand = React.useCallback(() => {
    if (isControlled && onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [isControlled, onToggleExpand]);

  const hasRubric = Boolean(question.evaluationRubric);
  const categoryMeta = getCategoryBadge(question.category);

  const toggleFollowUp = (idx: number) => {
    setRevealedFollowUps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <Card className="glass-card glass-card-hover overflow-hidden p-4 transition-all sm:p-5">
      {/* Clickable Header Area */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={handleToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleExpand();
          }
        }}
        className="group hover:bg-muted/30 focus-visible:ring-primary/40 -m-2 cursor-pointer rounded-xl p-2 transition-all select-none focus:outline-none focus-visible:ring-2"
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={getLevelBadgeVariant(question.level)}
                className="text-[10px] tracking-wider uppercase"
              >
                {question.level}
              </Badge>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 border text-[10px] font-medium ${categoryMeta.className}`}
              >
                {categoryMeta.iconName && (
                  <TechIcon name={categoryMeta.iconName} className="h-3 w-3" />
                )}
                <span>{categoryMeta.label}</span>
              </Badge>
            </div>

            <h3 className="text-foreground group-hover:text-primary text-base leading-snug font-bold break-words transition-colors">
              {question.question}
            </h3>

            {question.contextOrScenario && (
              <p className="text-muted-foreground/90 text-xs break-words italic">
                <span className="text-foreground font-semibold">Scenario: </span>
                {question.contextOrScenario}
              </p>
            )}
          </div>

          <div
            className="flex shrink-0 items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(question.id);
              }}
              className={`h-8 w-8 rounded-lg p-0 transition-transform active:scale-90 ${
                isBookmarked
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'text-muted-foreground'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-purple-500' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand();
              }}
              className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg p-0"
              title={isExpanded ? 'Thu gọn' : 'Mở rộng chi tiết'}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'text-primary rotate-180' : ''
                }`}
              />
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
      </div>

      {/* Expandable Deep Content */}
      <div
        className={cn(
          'accordion-grid border-border/60 transition-all duration-300 ease-out',
          isExpanded ? 'is-open mt-4 border-t pt-4' : 'mt-0 border-t-0 pt-0'
        )}
      >
        <div className="accordion-overflow">
          {hasBeenExpanded && (
            <Tabs defaultValue="answer" className="w-full">
              <TabsList
                className={`grid w-full ${hasRubric ? 'max-w-xl grid-cols-2 sm:grid-cols-4' : 'max-w-md grid-cols-3'}`}
              >
                <TabsTrigger value="answer" className="text-xs">
                  💡 <span className="hidden sm:inline">Deep </span>Answer
                </TabsTrigger>
                <TabsTrigger value="pitfalls" className="text-xs">
                  ⚠️ <span className="hidden sm:inline">Pitfalls &amp; </span>Traps
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
                <div className="dark:bg-primary/5 space-y-1.5 rounded-xl border border-indigo-500/20 bg-indigo-50/70 p-3.5">
                  <span className="dark:text-primary flex items-center gap-1.5 text-xs font-bold text-indigo-700">
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
                  <div className="space-y-1.5 rounded-xl border border-sky-500/20 bg-sky-50/70 p-3.5 dark:bg-sky-500/5">
                    <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
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
                  <div className="space-y-1.5 rounded-xl border border-violet-500/20 bg-violet-50/70 p-3.5 dark:bg-violet-500/5">
                    <span className="text-xs font-bold text-violet-800 dark:text-violet-300">
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
                  <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50/70 p-3.5 dark:bg-emerald-500/5">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
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
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Common Red Flags & Mistakes:
                  </span>
                  <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
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
              <TabsContent value="followup" className="space-y-3 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Câu hỏi đào sâu mở rộng (Follow-up Inquiries):
                    </span>
                    <span className="text-muted-foreground text-[11px] font-medium">
                      Nhấn vào câu hỏi để xem gợi ý đáp án
                    </span>
                  </div>

                  <div className="space-y-2">
                    {question.followUpQuestions.map((f, fIdx) => {
                      const isRevealed = revealedFollowUps.has(fIdx);
                      const resolved = resolveFollowUp(question, f, fIdx);

                      return (
                        <div
                          key={fIdx}
                          className="overflow-hidden rounded-xl border border-indigo-500/25 bg-indigo-50/60 transition-all hover:border-indigo-500/40 dark:bg-indigo-500/5"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFollowUp(fIdx)}
                            className="flex w-full items-start justify-between gap-3 p-3 text-left transition-colors hover:bg-indigo-500/10"
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                              <span className="shrink-0 font-mono text-xs font-bold text-indigo-500">
                                #{fIdx + 1}
                              </span>
                              <span className="text-foreground text-xs leading-relaxed font-semibold break-words">
                                {resolved.questionText}
                              </span>
                            </div>
                            <span
                              title={isRevealed ? 'Thu gọn' : 'Xem đáp án'}
                              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${
                                isRevealed
                                  ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-400 shadow-xs'
                                  : 'border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                  isRevealed ? 'rotate-180 text-indigo-400' : ''
                                }`}
                              />
                            </span>
                          </button>

                          {isRevealed && (
                            <div className="bg-background/80 animate-in fade-in-50 space-y-3 border-t border-indigo-500/20 p-4 text-xs duration-200">
                              <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-300">
                                <span>🎯</span>
                                <span>
                                  Đáp án & Phân tích kỹ thuật chuyên sâu (Senior Focus):
                                </span>
                              </div>

                              <div className="bg-secondary/40 border-border/50 text-foreground space-y-2.5 rounded-lg border p-3.5 text-xs leading-relaxed font-normal whitespace-pre-line">
                                {resolved.answer}
                              </div>

                              {resolved.codeExample && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                                    <span>💻</span> Ví dụ minh họa kỹ thuật:
                                  </span>
                                  <CodeBlock
                                    code={resolved.codeExample}
                                    language={resolved.codeLanguage || 'tsx'}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
          )}
        </div>
      </div>
    </Card>
  );
});
