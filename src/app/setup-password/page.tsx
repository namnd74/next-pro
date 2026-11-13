import type { Metadata } from 'next';
import { CcaPageView } from '@/features/cca/components/cca-page-view';

export const metadata: Metadata = {
  title: 'Đặt mật khẩu | DevPro',
  robots: { index: false, follow: false },
};

export default function SetupPasswordPage() {
  return <CcaPageView mode="setup" />;
}
