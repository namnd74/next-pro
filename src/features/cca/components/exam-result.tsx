import { Award, CheckCircle2, CircleX, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Summary } from '../contracts';

export function ExamResult({
  summary,
  onBack,
}: {
  summary: Summary;
  onBack: () => void;
}) {
  return (
    <section className="glass-card mx-auto max-w-2xl space-y-6 rounded-2xl border p-5 sm:p-8">
      <div className="text-center">
        <Award className="text-primary mx-auto mb-3 size-10" />
        <p className="text-muted-foreground text-xs font-semibold tracking-wider">
          {summary.topicId.toUpperCase()} · ĐỀ{' '}
          {String(summary.formNumber).padStart(2, '0')}
        </p>
        <h1 className="mt-2 text-2xl font-bold">Kết quả bài thi</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {summary.reason === 'timeout'
            ? 'Hết thời gian'
            : summary.reason === 'abandoned'
              ? 'Đã rời phòng thi'
              : 'Đã nộp bài'}
        </p>
        <p className="text-primary mt-5 text-5xl font-extrabold tabular-nums">
          {summary.percent}
          <span className="text-2xl">%</span>
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {summary.correct} / {summary.total} câu đúng
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Đúng', count: summary.correct, Icon: CheckCircle2 },
          { label: 'Sai', count: summary.wrong, Icon: CircleX },
          { label: 'Chưa trả lời', count: summary.unanswered, Icon: CircleDashed },
        ].map(({ label, count, Icon }) => (
          <div key={label} className="bg-muted/40 rounded-xl p-3">
            <Icon className="text-muted-foreground mx-auto mb-2 size-4" />
            <p className="text-xl font-bold">{count}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
          </div>
        ))}
      </div>
      <div className="border-border rounded-xl border p-4">
        <p className="text-sm font-medium">
          Điểm mô phỏng: {summary.simulatedScore} / 1.000
        </p>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Quy đổi luyện tập: 100 + 900 × tỷ lệ đúng. Mốc tham khảo 720. Đây không phải
          cách quy đổi điểm chính thức và không dự đoán kết quả chứng chỉ.
        </p>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Chỉ lưu kết quả tổng hợp. Nội dung câu hỏi và đáp án bạn chọn được xóa khỏi phiên
        thi sau khi kết thúc.
      </p>
      <Button className="w-full" onClick={onBack}>
        Về danh sách đề
      </Button>
    </section>
  );
}
