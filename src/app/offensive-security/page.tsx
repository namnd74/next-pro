import * as React from 'react';
import type { Metadata } from 'next';
import { CommandCenterDashboard } from '@/features/offensive-security';

export const metadata: Metadata = {
  title: 'Cyber Operations Command Center | Offensive Security Academy | NextPro',
  description:
    'Trung tâm tác chiến an ninh mạng, kiểm thử xâm nhập và phòng thủ thực chiến 19 Tracks với 81 phòng lab tương tác trên trình duyệt.',
};

export default function OffensiveSecurityPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-4">
      <CommandCenterDashboard />
    </main>
  );
}
