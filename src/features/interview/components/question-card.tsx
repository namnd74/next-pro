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
import { TechIcon, TechIconName } from '@/components/common/tech-icon';
import { resolveFollowUp } from '../data/followup-resolver';

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

function getCategoryBadge(category: string): {
  iconName?: TechIconName;
  label: string;
  className: string;
} {
  switch (category) {
    case 'react':
    case 'react-19':
      return {
        iconName: 'react',
        label: 'React',
        className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      };
    case 'nextjs':
    case 'next-app-router':
      return {
        iconName: 'nextjs',
        label: 'Next.js',
        className:
          'bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/30 font-semibold',
      };
    case 'typescript':
      return {
        iconName: 'typescript',
        label: 'TypeScript',
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      };
    case 'javascript':
      return {
        iconName: 'javascript',
        label: 'JavaScript',
        className:
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      };
    case 'go':
      return {
        iconName: 'go',
        label: 'Go (Golang)',
        className:
          'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 font-semibold',
      };
    case 'nestjs':
      return {
        iconName: 'nestjs',
        label: 'NestJS',
        className:
          'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-semibold',
      };
    case 'nodejs':
      return {
        iconName: 'nodejs',
        label: 'Node.js',
        className:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold',
      };
    case 'python':
      return {
        iconName: 'python',
        label: 'Python',
        className:
          'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 font-semibold',
      };
    case 'django':
      return {
        iconName: 'django',
        label: 'Django',
        className:
          'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30 font-semibold',
      };
    case 'javascript-typescript':
      return {
        iconName: 'typescript',
        label: 'JS / TS',
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      };
    case 'browser-runtime-workers':
      return {
        label: 'Browser & Workers',
        className:
          'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      };
    case 'performance-optimization':
      return {
        label: 'Performance & Security',
        className:
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      };
    case 'html':
      return {
        label: 'HTML5 & Web',
        className:
          'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 font-semibold',
      };
    case 'css':
      return {
        label: 'CSS3 & Styling',
        className:
          'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 font-semibold',
      };
    case 'design-patterns':
      return {
        iconName: 'architecture',
        label: 'Design Patterns',
        className:
          'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 font-semibold',
      };
    case 'micro-frontend':
      return {
        iconName: 'architecture',
        label: 'Micro-Frontend',
        className:
          'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30 font-semibold',
      };
    case 'system-design':
    case 'frontend-system-design':
    case 'architecture':
      return {
        iconName: 'architecture',
        label: 'System Design',
        className:
          'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold',
      };
    case 'state-data':
      return {
        label: 'State & Data',
        className:
          'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      };
    default:
      return {
        label: `#${category}`,
        className: 'text-muted-foreground border-border',
      };
  }
}

export function QuestionCard({
  question,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: QuestionCardProps) {
  const { bookmarkedQuestionIds, toggleBookmark } = useInterviewStore();
  const [internalExpanded, setInternalExpanded] = React.useState(false);
  const [revealedFollowUps, setRevealedFollowUps] = React.useState<Set<number>>(
    new Set()
  );

  const isControlled = typeof controlledExpanded === 'boolean';
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggleExpand = React.useCallback(() => {
    if (isControlled && onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [isControlled, onToggleExpand]);

  const isBookmarked = bookmarkedQuestionIds.includes(question.id);
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
    <Card className="glass-card glass-card-hover overflow-hidden p-5 transition-all">
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
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

            <h3 className="text-foreground group-hover:text-primary text-base leading-snug font-bold transition-colors">
              {question.question}
            </h3>

            {question.contextOrScenario && (
              <p className="text-muted-foreground/90 text-xs italic">
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
              className={`h-8 w-8 rounded-lg p-0 ${
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
            <TabsContent value="followup" className="space-y-3 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
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
                        className="overflow-hidden rounded-xl border border-indigo-500/25 bg-indigo-500/5 transition-all hover:border-indigo-500/40"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFollowUp(fIdx)}
                          className="flex w-full items-start justify-between gap-3 p-3 text-left transition-colors hover:bg-indigo-500/10"
                        >
                          <div className="flex flex-1 items-start gap-2.5">
                            <span className="shrink-0 font-mono text-xs font-bold text-indigo-500">
                              #{fIdx + 1}
                            </span>
                            <span className="text-foreground text-xs leading-relaxed font-semibold">
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
        </div>
      )}
    </Card>
  );
}
