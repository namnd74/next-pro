'use client';

import * as React from 'react';
import { CourseShell } from '@/components/shared';
import { AiSidebar } from './ai-sidebar';
import type { AiTrackNavigation } from '../types';

interface AiShellProps {
  children: React.ReactNode;
  tracks: AiTrackNavigation[];
}

export function AiShell({ children, tracks }: AiShellProps) {
  return (
    <CourseShell
      sidebar={<AiSidebar tracks={tracks} />}
      mobileMenuLabel="Mở menu AI Engineering"
      mobileButtonGradient="from-violet-500 to-fuchsia-500 shadow-violet-500/30"
      sidebarWidthClass="w-[280px]"
    >
      <div className="space-y-8">{children}</div>
    </CourseShell>
  );
}
