'use client';

import * as React from 'react';
import { CourseShell } from '@/components/shared';
import { LearningSidebar } from './learning-sidebar';
import type { LearningNavigationTrack } from '../types';

interface LearningShellProps {
  children: React.ReactNode;
  tracks: LearningNavigationTrack[];
}

export function LearningShell({ children, tracks }: LearningShellProps) {
  return (
    <CourseShell
      sidebar={<LearningSidebar tracks={tracks} />}
      mobileMenuLabel="Mở menu lộ trình học"
      mobileButtonGradient="from-indigo-500 to-violet-500 shadow-indigo-500/30"
      sidebarWidthClass="w-[290px] xl:w-[310px]"
    >
      <div className="space-y-8">{children}</div>
    </CourseShell>
  );
}
