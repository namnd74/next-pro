'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpenCheck,
  Languages,
  Loader2,
  LockKeyhole,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/types/api';
import { ReviewQuestionCard } from './review-question-card';
import { getReviewQuestions, getReviewTopics, getReviewSession } from '../review-api';

export const REVIEW_QUERY_KEY = ['cca-review'] as const;

export function CcaReview() {
  const queryClient = useQueryClient();
  const [selectedTopicId, setSelectedTopicId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [globalShowTranslation, setGlobalShowTranslation] = React.useState(false);
  const [globalShowKeywords, setGlobalShowKeywords] = React.useState(false);
  const [sessionExpired, setSessionExpired] = React.useState(false);

  const sessionQuery = useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'session'],
    queryFn: ({ signal }) => getReviewSession(signal),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: 'always',
    retry: false,
  });

  const session = sessionExpired ? null : sessionQuery.data;
  const isAuthenticated = session?.kind === 'authenticated';

  React.useEffect(() => {
    setSessionExpired(false);
  }, [sessionQuery.dataUpdatedAt]);

  React.useEffect(() => {
    if (session?.kind !== 'authenticated') return;
    let timer: number | undefined;
    const checkExpiry = () => {
      const remaining = Date.parse(session.expiresAt) - Date.now();
      if (remaining > 0) {
        timer = window.setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
        return;
      }
      setSessionExpired(true);
      queryClient.removeQueries({ queryKey: [...REVIEW_QUERY_KEY, 'topics'] });
      queryClient.removeQueries({ queryKey: [...REVIEW_QUERY_KEY, 'questions'] });
    };
    checkExpiry();
    return () => window.clearTimeout(timer);
  }, [session, queryClient]);

  const topicsQuery = useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'topics'],
    queryFn: ({ signal }) => getReviewTopics(signal),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  const topics = topicsQuery.data ?? null;
  const activeTopicId = selectedTopicId || topics?.[0]?.id || '';

  const questionsQuery = useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'questions', activeTopicId],
    queryFn: ({ signal }) => getReviewQuestions(activeTopicId, signal),
    enabled: isAuthenticated && Boolean(activeTopicId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  const error = (sessionQuery.error ||
    topicsQuery.error ||
    questionsQuery.error) as ApiError | null;

  React.useEffect(() => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      queryClient.removeQueries({ queryKey: [...REVIEW_QUERY_KEY, 'topics'] });
      queryClient.removeQueries({ queryKey: [...REVIEW_QUERY_KEY, 'questions'] });
    }
  }, [error, queryClient]);

  const handleRetry = React.useCallback(() => {
    setSessionExpired(false);
    void queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEY });
  }, [queryClient]);

  const questions = isAuthenticated ? (questionsQuery.data ?? null) : null;
  const selectedTopic = topics?.find((topic) => topic.id === activeTopicId);
  const loading =
    sessionQuery.isPending ||
    (isAuthenticated &&
      (topicsQuery.isPending || (Boolean(activeTopicId) && questionsQuery.isPending)));
  const hasStudyGuide = Boolean(questions?.some((q) => Boolean(q.studyGuide)));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEntries = React.useMemo(() => {
    if (!questions) return [];
    const entries = questions.map((question, index) => ({ question, index }));
    if (!normalizedQuery) return entries;
    return entries.filter(({ question }) => {
      if (
        question.id.toLowerCase().includes(normalizedQuery) ||
        question.prompt.toLowerCase().includes(normalizedQuery) ||
        question.choices.some((c) => c.text.toLowerCase().includes(normalizedQuery))
      ) {
        return true;
      }
      const guide = question.studyGuide;
      if (!guide) return false;
      return (
        guide.promptVi.toLowerCase().includes(normalizedQuery) ||
        guide.explanationVi.toLowerCase().includes(normalizedQuery) ||
        guide.choicesVi.some((c) => c.text.toLowerCase().includes(normalizedQuery)) ||
        guide.questionKeywords.some((kw) => kw.toLowerCase().includes(normalizedQuery)) ||
        guide.answerKeywords.some((kw) => kw.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [questions, normalizedQuery]);

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
        <Button variant="outline" onClick={handleRetry}>
          Thử lại
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6" aria-busy={loading}>
      <Card className="glass-card space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold">Ôn tập theo chủ đề</h2>
              <p className="text-muted-foreground text-sm">
                Xem toàn bộ câu hỏi kèm bản dịch tiếng Việt, từ khóa trọng tâm và giải
                thích chi tiết. Bấm vào lựa chọn để biết đúng hoặc sai ngay.
              </p>
            </div>
          </div>
          {hasStudyGuide && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={globalShowTranslation ? 'secondary' : 'outline'}
                size="sm"
                aria-pressed={globalShowTranslation}
                onClick={() => setGlobalShowTranslation((prev) => !prev)}
                className="gap-1.5 text-xs"
              >
                <Languages className="size-3.5" />
                Song ngữ toàn bộ
              </Button>
              <Button
                type="button"
                variant={globalShowKeywords ? 'secondary' : 'outline'}
                size="sm"
                aria-pressed={globalShowKeywords}
                onClick={() => setGlobalShowKeywords((prev) => !prev)}
                className="gap-1.5 text-xs"
              >
                <Sparkles className="size-3.5" />
                Từ khóa toàn bộ
              </Button>
            </div>
          )}
        </div>

        {topics && topics.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="review-topic"
                className="text-foreground text-sm font-semibold"
              >
                Chủ đề ôn tập
              </label>
              <select
                id="review-topic"
                value={activeTopicId}
                onChange={(event) => {
                  setSearchQuery('');
                  setSelectedTopicId(event.target.value);
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

            <div className="flex flex-col gap-2">
              <label
                htmlFor="review-search"
                className="text-foreground text-sm font-semibold"
              >
                Tìm kiếm câu hỏi / từ khóa
              </label>
              <div className="relative flex items-center">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
                <input
                  id="review-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo đề bài, bản dịch, từ khóa hoặc mã câu…"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary min-h-10 w-full rounded-xl border py-2 pr-9 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Xóa tìm kiếm"
                    onClick={() => setSearchQuery('')}
                    className="text-muted-foreground hover:text-foreground absolute right-2.5 cursor-pointer rounded-md p-1"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
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
      ) : filteredEntries.length === 0 ? (
        <Card className="glass-card text-muted-foreground p-8 text-center text-sm">
          Không tìm thấy câu hỏi nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.
        </Card>
      ) : (
        <section className="space-y-4" aria-label="Câu hỏi và đáp án ôn tập">
          <h3 className="text-foreground font-semibold">
            {selectedTopic?.name} ·{' '}
            {normalizedQuery
              ? `${filteredEntries.length} / ${questions?.length} câu hỏi`
              : `${questions?.length} câu hỏi`}
          </h3>
          {filteredEntries.map(({ question, index }) => (
            <ReviewQuestionCard
              key={`${activeTopicId}:${question.id}`}
              question={question}
              index={index}
              globalShowTranslation={globalShowTranslation}
              globalShowKeywords={globalShowKeywords}
            />
          ))}
        </section>
      )}
    </div>
  );
}
