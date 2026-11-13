import type { Metadata } from 'next';
import { CcaPageView } from '@/features/cca/components/cca-page-view';

export const metadata: Metadata = {
  title: 'Đăng nhập | DevPro',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <CcaPageView mode="login" />;
}
