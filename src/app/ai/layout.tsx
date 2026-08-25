import type { ReactNode } from 'react';
import { AI_NAVIGATION, AiShell } from '@/features/ai';

export default function AiLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AiShell tracks={AI_NAVIGATION}>{children}</AiShell>;
}
