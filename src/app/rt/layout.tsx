import * as React from 'react';
import { RedTeamShell } from '@/features/red-team/components/red-team-shell';

export default function RedTeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RedTeamShell>{children}</RedTeamShell>;
}
