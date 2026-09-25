import type { Metadata } from 'next';
import { AiHubView } from '@/features/ai';

export const metadata: Metadata = {
  title: 'AI Engineering Hub | NextPro',
  description:
    'AI engineering dành cho Frontend Engineer: interface, agent runtime, harness, skills, sub-agent và evals.',
};

export default function AiHubPage() {
  return <AiHubView />;
}
