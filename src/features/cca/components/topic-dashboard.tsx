'use client';

import { CheckCircle2, Clock3, Play, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Summary, Topic } from '../contracts';

export function TopicDashboard({
  topic,
  results,
  busy,
  onStart,
  usedForms,
}: {
  topic: Topic;
  results: Summary[];
  busy: boolean;
  onStart: (form: number) => void;
  usedForms: number[];
}) {
  const topicResults = results.filter((r) => r.topicId === topic.id);
  return (
    <section aria-labelledby="forms-heading" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="forms-heading" className="text-xl font-bold">
            10 đề · {topic.id.toUpperCase()}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Còn {10 - usedForms.length} / 10 lượt
          </p>
        </div>
      </div>
      <div className="bg-primary/5 border-primary/15 flex items-start gap-3 rounded-xl border p-4 text-sm">
        <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
        <p className="text-muted-foreground leading-relaxed">
          Làm đủ 10 đề để gặp toàn bộ{' '}
          <strong className="text-foreground">{topic.questionCount} câu hợp lệ</strong>.
          Các đề có câu lặp để đủ độ dài bài thi. Bắt đầu đề sẽ dùng một lượt, kể cả khi
          bạn rời trang.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => {
          const form = i + 1;
          const result = topicResults.find((r) => r.formNumber === form);
          const label = String(form).padStart(2, '0');
          return (
            <article
              key={form}
              className={cn(
                'glass-card flex flex-col gap-4 rounded-2xl border p-4',
                result && 'bg-muted/30'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider">
                  ĐỀ {label}
                </span>
                {result ? (
                  <CheckCircle2 className="text-primary size-4" />
                ) : (
                  <Clock3 className="text-muted-foreground size-4" />
                )}
              </div>
              <div>
                <p className="text-lg font-bold">
                  {result ? `${result.percent}%` : `${topic.questionsPerExam} câu`}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {result
                    ? `${result.correct} đúng · ${result.wrong} sai · ${result.unanswered} trống`
                    : `${topic.durationMinutes} phút · Tiếng Anh`}
                </p>
              </div>
              {result ? (
                <p className="text-muted-foreground mt-auto text-xs">
                  {result.reason === 'abandoned'
                    ? 'Đã rời phòng thi'
                    : result.reason === 'timeout'
                      ? 'Hết thời gian'
                      : 'Đã hoàn thành'}
                </p>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || usedForms.includes(form)}
                  onClick={() => onStart(form)}
                  aria-label={`Bắt đầu đề ${label}`}
                >
                  <Play className="mr-1.5 size-3" />
                  Bắt đầu
                </Button>
              )}
            </article>
          );
        })}
      </div>
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Chỉ quản trị viên được reset lượt; kết quả các chu kỳ cũ vẫn được giữ. Trong
          phòng thi: chọn đáp án, đánh dấu câu cần xem lại và nộp bài trước khi hết giờ.
          Tải lại hoặc đóng trang sẽ thoát bài thi sau khi bạn xác nhận.
        </p>
        {topic.excludedCount > 0 && (
          <p>
            {topic.excludedCount} câu trong tài liệu thiếu nội dung hình ảnh/kéo-thả nên
            chưa được đưa vào đề.
          </p>
        )}
        {topic.id === 'cca-f' && (
          <p>
            Ngân hàng CCA-F hiện chỉ có câu một đáp án. Cấu trúc luyện tập phụ thuộc vào
            tài liệu đã cung cấp.
          </p>
        )}
      </div>
    </section>
  );
}
