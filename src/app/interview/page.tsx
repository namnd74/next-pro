import type { Metadata } from 'next';
import { InterviewPageView } from '@/features/interview';

export const metadata: Metadata = {
  title: 'Luyện Phỏng Vấn Kỹ Thuật Chuyên Sâu | DevPro',
  description:
    'Mô phỏng phỏng vấn kỹ thuật thực tế với bộ câu hỏi Senior, bẫy tuyển dụng (Pitfalls), chấm điểm tự động và các thử thách bắt lỗi bug kiến trúc.',
};

export default function InterviewPage() {
  return <InterviewPageView />;
}
