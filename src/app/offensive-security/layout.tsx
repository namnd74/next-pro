import * as React from 'react';
import { OffensiveSecurityShell } from '@/features/offensive-security/components/offensive-security-shell';

export default function OffensiveSecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OffensiveSecurityShell>{children}</OffensiveSecurityShell>;
}
