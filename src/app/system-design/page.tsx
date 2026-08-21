import { Metadata } from 'next';
import { SystemDesignHub } from '@/features/system-design';

export const metadata: Metadata = {
  title: 'Frontend System Design Studio | React & Next.js Pro',
  description:
    'Design, simulate, and audit Senior/Staff frontend architectures with interactive node topologies and automated health checks.',
};

export default function SystemDesignPage() {
  return <SystemDesignHub />;
}
