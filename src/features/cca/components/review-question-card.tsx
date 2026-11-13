'use client';

import * as React from 'react';
import { CheckCircle2, Circle, RotateCcw, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReviewQuestion } from '../review-contracts';

export function ReviewQuestionCard({
  question,
  index,
}: {
  question: ReviewQuestion;
  index: number;
}) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const headingId = React.useId();
  const revealed = selectedIds.length > 0;
  const multiple = question.type === 'multiple_response';
  const hasWrong = selectedIds.some((id) => !question.correctChoiceIds.includes(id));
  const complete = !hasWrong && selectedIds.length === question.correctChoiceIds.length;

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
        <span className="text-primary bg-primary/10 rounded-lg px-2.5 py-1 text-xs font-bold">
          Câu {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground text-xs">
          {multiple
            ? `Chọn ${question.correctChoiceIds.length} đáp án đúng`
            : 'Chọn một đáp án'}
        </span>
      </div>
      <h4
        id={headingId}
        className="text-foreground text-base leading-relaxed font-bold whitespace-pre-wrap"
      >
        {question.prompt}
      </h4>
      <div className="space-y-2.5" role="group" aria-labelledby={headingId}>
        {question.choices.map((choice, choiceIndex) => {
          const selected = selectedIds.includes(choice.id);
          const correct = revealed && question.correctChoiceIds.includes(choice.id);
          const wrong = selected && !correct;
          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={selected}
              onClick={() => select(choice.id)}
              className={`focus-visible:ring-primary flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                correct
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                  : wrong
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                    : 'border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${correct ? 'border-emerald-500/40' : wrong ? 'border-rose-500/40' : 'border-border'}`}
              >
                {String.fromCharCode(65 + choiceIndex)}
              </span>
              <span className="min-w-0 flex-1 space-y-1 pt-0.5">
                <span className="block leading-relaxed whitespace-pre-wrap">
                  {choice.text}
                </span>
                {correct && (
                  <span className="block text-xs font-semibold">
                    {selected ? 'Bạn chọn đúng' : 'Đáp án đúng'}
                  </span>
                )}
                {wrong && (
                  <span className="block text-xs font-semibold">Bạn chọn sai</span>
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
        <div className="border-border flex flex-col items-start gap-3 border-t pt-4 sm:flex-row sm:justify-between">
          <div className="space-y-1.5 text-sm" role="status" aria-live="polite">
            <p
              className={`font-bold ${hasWrong ? 'text-rose-700 dark:text-rose-300' : complete ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}
            >
              {hasWrong
                ? 'Chưa chính xác. Hãy xem đáp án đúng bên dưới.'
                : complete
                  ? 'Chính xác! Bạn đã chọn đúng đáp án.'
                  : 'Bạn đã chọn đúng một phần. Hãy chọn đủ các đáp án đúng.'}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Đáp án đúng: </span>
              {question.choices
                .filter((choice) => question.correctChoiceIds.includes(choice.id))
                .map((choice) => choice.text)
                .join('; ')}
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
      ) : (
        <p className="text-muted-foreground text-xs">
          Bấm vào lựa chọn để xem kết quả đúng hoặc sai ngay.
        </p>
      )}
    </Card>
  );
}
