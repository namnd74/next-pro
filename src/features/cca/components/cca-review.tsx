'use client';

import * as React from 'react';
import { BookOpenCheck, Loader2, LockKeyhole } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/types/api';
import type { ReviewQuestion, ReviewTopic, ReviewSession } from '../review-contracts';
import { ReviewQuestionCard } from './review-question-card';
import { getReviewQuestions, getReviewTopics, getReviewSession } from '../review-api';

export function CcaReview() {
  const [attempt, setAttempt] = React.useState(0);
  const retry = React.useCallback(() => setAttempt((value) => value + 1), []);

  React.useEffect(() => {
    window.addEventListener('focus', retry);
    return () => window.removeEventListener('focus', retry);
  }, [retry]);

  return <ReviewContent key={attempt} onRetry={retry} />;
}

function ReviewContent({ onRetry }: { onRetry: () => void }) {
  const [topics, setTopics] = React.useState<ReviewTopic[] | null>(null);
  const [topicId, setTopicId] = React.useState('');
  const [result, setResult] = React.useState<{
    topicId: string;
    questions: ReviewQuestion[];
  } | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [session, setSession] = React.useState<ReviewSession | undefined>(undefined);

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const currentSession = await getReviewSession(controller.signal);
        if (controller.signal.aborted) return;
        if (
          currentSession?.kind === 'authenticated' &&
          Date.parse(currentSession.expiresAt) <= Date.now()
        ) {
          setSession(null);
          return;
        }
        setSession(currentSession);
        if (currentSession?.kind !== 'authenticated') return;
        const data = await getReviewTopics(controller.signal);
        if (controller.signal.aborted) return;
        setTopics(data);
        setTopicId(data[0]?.id ?? '');
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult(null);
          setTopics(null);
          setError(error as ApiError);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    if (session?.kind !== 'authenticated') return;
    let timer: number | undefined;
    const expire = () => {
      const remaining = Date.parse(session.expiresAt) - Date.now();
      if (remaining > 0) {
        timer = window.setTimeout(expire, Math.min(remaining, 2_147_483_647));
        return;
      }
      setSession(null);
      setTopics(null);
      setResult(null);
    };
    expire();
    return () => window.clearTimeout(timer);
  }, [session]);

  React.useEffect(() => {
    if (!topicId || session?.kind !== 'authenticated') return;
    const controller = new AbortController();
    getReviewQuestions(topicId, controller.signal).then(
      (questions) => {
        if (!controller.signal.aborted) setResult({ topicId, questions });
      },
      (error: ApiError) => {
        if (!controller.signal.aborted) {
          setResult(null);
          setTopics(null);
          setError(error);
        }
      }
    );
    return () => controller.abort();
  }, [topicId, session]);

  const passwordSetup = session?.kind === 'password_setup';
  const unauthorized =
    session === null ||
    passwordSetup ||
    error?.statusCode === 401 ||
    error?.statusCode === 403;
  if (unauthorized || error) {
    return (
      <Card className="glass-card space-y-3 p-6 text-center" role="alert">
        {unauthorized && <LockKeyhole className="text-primary mx-auto h-6 w-6" />}
        <h2 className="text-foreground font-semibold">
          {passwordSetup
            ? 'Hoàn tất đặt mật khẩu để xem tài liệu'
            : unauthorized
              ? 'Tài liệu dành cho người dùng đã đăng nhập'
              : 'Không tải được tài liệu ôn tập'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {passwordSetup
            ? 'Vui lòng hoàn tất bước đặt mật khẩu cho tài khoản, sau đó thử lại.'
            : error?.statusCode === 403
              ? 'Tài khoản hiện tại chưa được phép truy cập tài liệu này.'
              : unauthorized
                ? 'Vui lòng đăng nhập bằng tài khoản của bạn, sau đó thử lại.'
                : error?.message || 'Vui lòng kiểm tra kết nối và thử lại.'}
        </p>
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </Card>
    );
  }

  const questions = result?.topicId === topicId ? result.questions : null;
  const selectedTopic = topics?.find((topic) => topic.id === topicId);
  const loading = topics === null || (Boolean(topicId) && questions === null);

  return (
    <div className="space-y-6" aria-busy={loading}>
      <Card className="glass-card space-y-4 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <BookOpenCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <h2 className="text-foreground text-lg font-bold">Ôn tập theo chủ đề</h2>
            <p className="text-muted-foreground text-sm">
              Xem toàn bộ câu hỏi theo chủ đề. Bấm vào lựa chọn để biết đúng hoặc sai
              ngay, không cần nộp bài.
            </p>
          </div>
        </div>
        {topics && topics.length > 0 && (
          <div className="flex flex-col gap-2 sm:max-w-md">
            <label
              htmlFor="review-topic"
              className="text-foreground text-sm font-semibold"
            >
              Chủ đề ôn tập
            </label>
            <select
              id="review-topic"
              value={topicId}
              onChange={(event) => {
                setResult(null);
                setTopicId(event.target.value);
              }}
              className="border-input bg-background text-foreground focus-visible:ring-primary min-h-10 w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.questionCount} câu)
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {loading ? (
        <div
          className="text-muted-foreground flex items-center justify-center gap-2 p-8 text-sm"
          role="status"
        >
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải tài liệu ôn tập…
        </div>
      ) : topics?.length === 0 ? (
        <Card className="glass-card text-muted-foreground p-8 text-center text-sm">
          Chưa có chủ đề ôn tập.
        </Card>
      ) : questions?.length === 0 ? (
        <Card className="glass-card text-muted-foreground p-8 text-center text-sm">
          Chủ đề này chưa có câu hỏi sẵn sàng để ôn tập.
        </Card>
      ) : (
        <section className="space-y-4" aria-label="Câu hỏi và đáp án ôn tập">
          <h3 className="text-foreground font-semibold">
            {selectedTopic?.name} · {questions?.length} câu hỏi
          </h3>
          {questions?.map((question, index) => (
            <ReviewQuestionCard
              key={`${topicId}:${question.id}`}
              question={question}
              index={index}
            />
          ))}
        </section>
      )}
    </div>
  );
}
