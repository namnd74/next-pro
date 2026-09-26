import type { Metadata } from 'next';
import { LearningHomeView } from '@/features/learning';

export const metadata: Metadata = {
  title: 'Lộ trình Học React & Next.js App Router | NextPro',
  description:
    'Lộ trình 80/20 thực chiến: Nắm vững các chuyên đề React và Next.js App Router RSC, Server Actions, TanStack Query v5.',
};

export default function LearnPage() {
  return <LearningHomeView />;
}
