'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, Flag, LogOut, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Attempt, Session, Summary } from '../contracts';
import { useExamSession } from '../use-exam-session';

export function ExamRoom({
  attempt,
  session,
  onEnd,
  onDiscard,
}: {
  attempt: Attempt;
  session: Session;
  onEnd: (summary: Summary) => void;
  onDiscard: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [confirmation, setConfirmation] = useState<'submit' | 'abandon' | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { answers, choose, remaining, saving, pendingCount, ending, error, finish } =
    useExamSession(attempt, onEnd, onDiscard);
  const question = attempt.questions[index];
  const selected = answers[question.id] ?? [];
  const answered = Object.values(answers).filter((ids) => ids.length > 0).length;
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const timer = [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
  useEffect(() => {
    if (confirmation) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirmation]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [index]);

  return (
    <section className="space-y-5" aria-label="Phòng thi">
      <div className="bg-card/95 border-border sticky top-24 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur-xl">
        <div>
          <p className="text-primary text-xs font-bold tracking-wider">
            {attempt.topicId.toUpperCase()} · ĐỀ{' '}
            {String(attempt.formNumber).padStart(2, '0')}
          </p>
          <p className="text-muted-foreground mt-1 max-w-52 truncate text-xs">
            {session.user.username}
          </p>
        </div>
        <div
          role="timer"
          aria-label="Thời gian còn lại"
          className={cn(
            'flex items-center gap-2 font-mono text-xl font-bold tabular-nums',
            remaining <= 300 && 'text-destructive'
          )}
        >
          <Clock3 className="size-5" />
          {timer}
        </div>
        <Button
          size="sm"
          onClick={() => setConfirmation('submit')}
          disabled={ending || !remaining}
        >
          <Send className="mr-2 size-4" />
          Nộp bài
        </Button>
      </div>
      {remaining <= 300 && (
        <p role="status" className="text-destructive text-sm">
          {remaining
            ? 'Còn dưới 5 phút. Hãy kiểm tra và hoàn thành bài.'
            : 'Đã hết thời gian. Đang nhận kết quả từ phòng thi…'}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 space-y-2 rounded-xl border p-3 text-sm"
        >
          <p>{error}</p>
          {pendingCount > 0 && (
            <p>Còn {pendingCount} câu chưa lưu. Giữ trang mở để hệ thống tự thử lại.</p>
          )}
        </div>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="glass-card min-w-0 space-y-5 rounded-2xl border p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 ref={heading} tabIndex={-1} className="text-lg font-bold outline-none">
              Câu {index + 1} / {attempt.questions.length}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={flags.has(question.id)}
              onClick={() =>
                setFlags((previous) => {
                  const next = new Set(previous);
                  if (next.has(question.id)) next.delete(question.id);
                  else next.add(question.id);
                  return next;
                })
              }
            >
              <Flag
                className={cn(
                  'mr-2 size-4',
                  flags.has(question.id) &&
                    'fill-amber-400 text-amber-600 dark:text-amber-400'
                )}
              />
              Xem lại
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {question.type === 'multiple_response'
              ? `Chọn đúng ${question.requiredSelectionCount} đáp án. Chỉ được điểm khi chọn đủ và đúng tất cả.`
              : 'Chọn một đáp án đúng nhất.'}
          </p>
          <fieldset disabled={ending || !remaining} className="min-w-0 space-y-3">
            <legend
              lang="en"
              className="mb-5 w-full text-base leading-7 break-words whitespace-pre-wrap"
            >
              {question.prompt}
            </legend>
            {question.choices.map((choice) => {
              const checked = selected.includes(choice.id);
              return (
                <label
                  key={`${question.id}:${choice.id}`}
                  className={cn(
                    'hover:border-primary/40 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                    checked
                      ? 'bg-primary/8 border-primary/60'
                      : 'border-border bg-background/40'
                  )}
                >
                  <input
                    type={question.type === 'multiple_response' ? 'checkbox' : 'radio'}
                    name={question.id}
                    value={choice.id}
                    checked={checked}
                    className="accent-primary mt-1 size-4 shrink-0"
                    disabled={
                      !checked &&
                      question.type === 'multiple_response' &&
                      selected.length >= question.requiredSelectionCount
                    }
                    onChange={() =>
                      choose(
                        question.id,
                        question.type === 'single_choice'
                          ? [choice.id]
                          : checked
                            ? selected.filter((id) => id !== choice.id)
                            : [...selected, choice.id]
                      )
                    }
                  />
                  <span
                    lang="en"
                    className="min-w-0 text-sm leading-6 break-words whitespace-pre-wrap"
                  >
                    <strong className="mr-2">{choice.id}.</strong>
                    {choice.text}
                  </span>
                </label>
              );
            })}
          </fieldset>
          <div className="border-border flex items-center justify-between gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              <ChevronLeft className="mr-1 size-4" />
              Trước
            </Button>
            <span role="status" className="text-muted-foreground text-center text-xs">
              {saving || pendingCount
                ? 'Đang lưu đáp án…'
                : answered
                  ? 'Đã lưu đáp án'
                  : 'Chưa chọn đáp án'}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={index === attempt.questions.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              Sau
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
        <aside className="glass-card space-y-4 rounded-2xl border p-4 lg:sticky lg:top-48">
          <div>
            <h2 className="text-sm font-bold">Tiến độ bài thi</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {answered} / {attempt.questions.length} đã trả lời · {flags.size} xem lại
            </p>
          </div>
          <progress
            className="accent-primary h-2 w-full"
            value={answered}
            max={attempt.questions.length}
            aria-label="Số câu đã trả lời"
          />
          <nav
            aria-label="Điều hướng câu hỏi"
            className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-5"
          >
            {attempt.questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Câu ${i + 1}${flags.has(q.id) ? ', xem lại' : ''}${answers[q.id]?.length ? ', đã trả lời' : ''}`}
                aria-current={i === index ? 'step' : undefined}
                className={cn(
                  'focus-visible:ring-ring relative min-h-9 rounded-lg border text-xs font-semibold transition-colors focus-visible:ring-2',
                  i === index
                    ? 'border-primary bg-primary text-primary-foreground'
                    : answers[q.id]?.length
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                )}
              >
                {i + 1}
                {flags.has(q.id) && (
                  <span
                    aria-hidden
                    className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-amber-500"
                  />
                )}
              </button>
            ))}
          </nav>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Ô có màu: đã trả lời. Chấm vàng: cần xem lại. Câu chưa trả lời không có điểm.
          </p>
          <Button
            variant="ghost"
            className="text-muted-foreground w-full"
            size="sm"
            disabled={ending}
            onClick={() => setConfirmation('abandon')}
          >
            <LogOut className="mr-2 size-4" />
            Rời phòng thi
          </Button>
        </aside>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="finish-heading"
        onCancel={(event) => {
          if (ending) event.preventDefault();
          else setConfirmation(null);
        }}
        className="bg-card text-foreground border-border fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border p-6 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <h2 id="finish-heading" className="text-lg font-bold">
          {confirmation === 'submit' ? 'Nộp bài thi?' : 'Rời phòng thi?'}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {confirmation === 'submit'
            ? `Bạn đã trả lời ${answered}/${attempt.questions.length} câu. Sau khi nộp không thể thay đổi đáp án.`
            : 'Lượt này vẫn được tính. Bài làm sẽ bị xóa khỏi trình duyệt; chỉ giữ kết quả tổng hợp.'}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmation(null)}
            disabled={ending}
          >
            Tiếp tục làm bài
          </Button>
          <Button
            variant={confirmation === 'abandon' ? 'destructive' : 'default'}
            isLoading={ending}
            onClick={async () => {
              if (confirmation) await finish(confirmation);
              setConfirmation(null);
            }}
          >
            {confirmation === 'submit' ? 'Xác nhận nộp bài' : 'Xác nhận rời phòng'}
          </Button>
        </div>
      </dialog>
    </section>
  );
}
