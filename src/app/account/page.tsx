import type { Metadata } from 'next';
import { CcaPageView } from '@/features/cca/components/cca-page-view';

export const metadata: Metadata = {
  title: 'Phòng thi Claude Certification | DevPro',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <CcaPageView />;
}
