import type { Metadata } from 'next';
import { CcaPageView } from '@/features/cca/components/cca-page-view';

export const metadata: Metadata = {
  title: 'Phòng thi Claude Certification | DevPro',
  description:
    'Luyện thi ba chứng chỉ Claude với 10 đề mỗi chủ đề, thời gian thi và kết quả tổng hợp.',
};

export default function CcaPage() {
  return <CcaPageView mode="redirect" />;
}
