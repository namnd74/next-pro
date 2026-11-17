'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Circle,
  KeyRound,
  Languages,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReviewQuestion } from '../review-contracts';

function highlightText(
  text: string,
  keywords: string[],
  highlightClassName: string
): React.ReactNode {
  const validKeywords = Array.from(
    new Set(keywords.map((kw) => kw.trim()).filter(Boolean))
  ).sort((a, b) => b.length - a.length);

  if (!validKeywords.length) return text;

  const escaped = validKeywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  const lowerKeywords = new Set(validKeywords.map((kw) => kw.toLowerCase()));

  return parts.map((part, i) =>
    lowerKeywords.has(part.toLowerCase()) ? (
      <mark
        key={i}
        className={cn(
          'rounded px-1 py-0.5 font-semibold text-current underline decoration-2 underline-offset-2',
          highlightClassName
        )}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function ReviewQuestionCard({
  question,
  index,
  globalShowTranslation = false,
  globalShowKeywords = false,
}: {
  question: ReviewQuestion;
  index: number;
  globalShowTranslation?: boolean;
  globalShowKeywords?: boolean;
}) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [localTranslation, setLocalTranslation] = React.useState<boolean | null>(null);
  const [localKeywords, setLocalKeywords] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setLocalTranslation(null);
  }, [globalShowTranslation]);

  React.useEffect(() => {
    setLocalKeywords(null);
  }, [globalShowKeywords]);

  const headingId = React.useId();
  const revealed = selectedIds.length > 0;
  const multiple = question.type === 'multiple_response';
  const hasWrong = selectedIds.some((id) => !question.correctChoiceIds.includes(id));
  const complete = !hasWrong && selectedIds.length === question.correctChoiceIds.length;

  const studyGuide = question.studyGuide;
  const showTranslation =
    Boolean(studyGuide) && (localTranslation ?? globalShowTranslation);
  const showKeywords =
    Boolean(studyGuide) && (localKeywords ?? (globalShowKeywords || revealed));

  const choiceViMap = React.useMemo(() => {
    if (!studyGuide) return new Map<string, string>();
    return new Map(studyGuide.choicesVi.map((c) => [c.id, c.text]));
  }, [studyGuide]);

  function select(id: string) {
    setSelectedIds((current) =>
      multiple
        ? current.includes(id)
          ? current.filter((selected) => selected !== id)
          : [...current, id]
        : [id]
    );
  }

  return (
    <Card className="glass-card space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-primary bg-primary/10 rounded-lg px-2.5 py-1 text-xs font-bold">
            Câu {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-muted-foreground font-mono text-xs">{question.id}</span>
          <span className="text-muted-foreground text-xs">
            ·{' '}
            {multiple
              ? `Chọn ${question.correctChoiceIds.length} đáp án đúng`
              : 'Chọn một đáp án'}
          </span>
        </div>
        {studyGuide && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant={showTranslation ? 'secondary' : 'outline'}
              size="sm"
              aria-pressed={showTranslation}
              onClick={() => setLocalTranslation(!showTranslation)}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              <Languages className="size-3.5" />
              Dịch Việt
            </Button>
            <Button
              type="button"
              variant={showKeywords ? 'secondary' : 'outline'}
              size="sm"
              aria-pressed={showKeywords}
              onClick={() => setLocalKeywords(!showKeywords)}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              <Sparkles className="size-3.5" />
              Từ khóa
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        <h4
          id={headingId}
          lang="en"
          className="text-foreground text-base leading-relaxed font-bold whitespace-pre-wrap"
        >
          {showKeywords && studyGuide
            ? highlightText(
                question.prompt,
                studyGuide.questionKeywords,
                'bg-amber-500/20 decoration-amber-500/70'
              )
            : question.prompt}
        </h4>

        {showTranslation && studyGuide && (
          <div
            lang="vi"
            className="border-primary/30 bg-primary/5 text-muted-foreground rounded-r-xl border-l-2 py-2.5 pr-3.5 pl-3.5 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {studyGuide.promptVi}
          </div>
        )}
      </div>

      {showKeywords &&
        studyGuide &&
        (studyGuide.questionKeywords.length > 0 ||
          (revealed && studyGuide.answerKeywords.length > 0) ||
          studyGuide.quickFormulaVi ||
          Boolean(studyGuide.keywordMappings?.length)) && (
          <div
            className="border-border/70 bg-muted/30 space-y-3 rounded-xl border p-3.5 text-xs"
            aria-label="Từ khóa trọng tâm"
          >
            {studyGuide.quickFormulaVi && (
              <div
                lang="vi"
                className="border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-foreground flex items-start gap-2.5 rounded-lg border p-2.5 text-xs leading-relaxed"
                aria-label="Công thức phản xạ nhanh"
              >
                <Zap className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-700 dark:text-amber-400 mr-1.5 inline-block">
                    Công thức phản xạ nhanh:
                  </span>
                  <span className="font-medium text-foreground">
                    {studyGuide.quickFormulaVi}
                  </span>
                </div>
              </div>
            )}

            {studyGuide.questionKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-foreground mr-1 inline-flex items-center gap-1 font-semibold">
                  <KeyRound className="size-3.5 text-amber-600 dark:text-amber-400" />
                  Từ khóa câu hỏi:
                </span>
                {studyGuide.questionKeywords.map((kw) => (
                  <Badge key={kw} variant="warning" className="font-mono text-[11px]">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}

            {revealed && studyGuide.answerKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-foreground mr-1 inline-flex items-center gap-1 font-semibold">
                  <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Từ khóa đáp án đúng:
                </span>
                {studyGuide.answerKeywords.map((kw) => (
                  <Badge key={kw} variant="success" className="font-mono text-[11px]">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}

            {studyGuide.keywordMappings &&
              studyGuide.keywordMappings.length > 0 &&
              (revealed || showKeywords) && (
                <div className="border-border/60 space-y-2 border-t pt-2.5">
                  <span className="text-foreground inline-flex items-center gap-1 font-semibold">
                    <Sparkles className="text-primary size-3.5" />
                    Ánh xạ từ khóa &amp; phản xạ:
                  </span>
                  <div className="space-y-2">
                    {studyGuide.keywordMappings.map((km) => (
                      <div
                        key={km.choiceId}
                        className="border-border/80 bg-background/70 space-y-1.5 rounded-lg border p-2.5"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="default" className="text-[11px] font-bold">
                            Chọn {km.choiceId}
                          </Badge>
                          <span className="text-foreground font-medium">
                            &ldquo;{km.answerKeyword}&rdquo;
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            ({km.choiceTextVi})
                          </span>
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px]">
                          <span className="text-foreground font-medium">Đề có:</span>
                          {km.questionKeywords.map((kw) => (
                            <Badge
                              key={kw}
                              variant="warning"
                              className="font-mono text-[10px]"
                            >
                              {kw}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          <span className="text-foreground font-medium">Lý do: </span>
                          {km.whyVi}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

      <div className="space-y-2.5" role="group" aria-labelledby={headingId}>
        {question.choices.map((choice, choiceIndex) => {
          const selected = selectedIds.includes(choice.id);
          const correct = revealed && question.correctChoiceIds.includes(choice.id);
          const wrong = selected && !correct;
          const choiceViText = choiceViMap.get(choice.id);

          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={selected}
              onClick={() => select(choice.id)}
              className={cn(
                'focus-visible:ring-primary flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                correct
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
                  : wrong
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-100'
                    : 'border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold',
                  correct
                    ? 'border-emerald-500/40 bg-emerald-500/15'
                    : wrong
                      ? 'border-rose-500/40 bg-rose-500/15'
                      : 'border-border'
                )}
              >
                {choice.id || String.fromCharCode(65 + choiceIndex)}
              </span>
              <span className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <span lang="en" className="block leading-relaxed whitespace-pre-wrap">
                  {correct && showKeywords && studyGuide
                    ? highlightText(
                        choice.text,
                        studyGuide.answerKeywords,
                        'bg-emerald-500/25 decoration-emerald-500/80'
                      )
                    : choice.text}
                </span>
                {showTranslation && choiceViText && (
                  <span
                    lang="vi"
                    className={cn(
                      'block border-t pt-1.5 text-xs leading-relaxed whitespace-pre-wrap',
                      correct
                        ? 'border-emerald-500/25 text-emerald-800 dark:text-emerald-200/90'
                        : wrong
                          ? 'border-rose-500/25 text-rose-800 dark:text-rose-200/90'
                          : 'border-border/60 text-muted-foreground'
                    )}
                  >
                    {choiceViText}
                  </span>
                )}
                {correct && (
                  <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {selected ? 'Bạn chọn đúng' : 'Đáp án đúng'}
                  </span>
                )}
                {wrong && (
                  <span className="block text-xs font-semibold text-rose-700 dark:text-rose-300">
                    Bạn chọn sai
                  </span>
                )}
              </span>
              {correct ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : wrong ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <Circle className="text-muted-foreground/50 mt-0.5 h-5 w-5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="border-border space-y-4 border-t pt-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
            <div className="space-y-1.5 text-sm" role="status" aria-live="polite">
              <p
                className={cn(
                  'font-bold',
                  hasWrong
                    ? 'text-rose-700 dark:text-rose-300'
                    : complete
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-amber-700 dark:text-amber-300'
                )}
              >
                {hasWrong
                  ? 'Chưa chính xác. Hãy xem đáp án đúng và giải thích bên dưới.'
                  : complete
                    ? 'Chính xác! Bạn đã chọn đúng đáp án.'
                    : 'Bạn đã chọn đúng một phần. Hãy chọn đủ các đáp án đúng.'}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Đáp án đúng: </span>
                {question.choices
                  .filter((choice) => question.correctChoiceIds.includes(choice.id))
                  .map((choice) => `${choice.id}. ${choice.text}`)
                  .join(' · ')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="shrink-0 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Làm lại câu này
            </Button>
          </div>

          {studyGuide && (
            <div
              lang="vi"
              className="border-primary/20 bg-primary/5 space-y-2 rounded-xl border p-4 text-sm"
            >
              <div className="text-primary flex items-center gap-2 font-bold">
                <Lightbulb className="size-4 shrink-0" />
                <span>Giải thích chi tiết</span>
              </div>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {studyGuide.explanationVi}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Bấm vào lựa chọn để xem kết quả đúng/sai và giải thích chi tiết ngay.
        </p>
      )}
    </Card>
  );
}
