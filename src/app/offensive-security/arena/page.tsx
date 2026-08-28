import * as React from 'react';
import type { Metadata } from 'next';
import { ArenaDashboard } from '@/features/offensive-security/arena';

export const metadata: Metadata = {
  title: 'Cyber Range Battle Arena & Leaderboard | Offensive Security NextPro',
  description:
    'Đấu trường Thực chiến Khai thác Lỗ hổng: CVE Time-Machine, Săn lỗi Bug Bounty, Phân tích Zero-Day và Bảng xếp hạng Săn Tiền thưởng.',
};

export default function OffensiveSecurityArenaPage() {
  return (
    <div className="min-h-screen py-4">
      <ArenaDashboard />
    </div>
  );
}
