import * as React from 'react';
import { LearningShell } from '@/features/learning/components/learning-shell';
import { CURRICULUM_TRACKS } from '@/features/learning/data/curriculum';
import type { LearningNavigationTrack } from '@/features/learning/types';

const navigationTracks: LearningNavigationTrack[] = CURRICULUM_TRACKS.map((track) => ({
  id: track.id,
  slug: track.slug,
  title: track.title,
  lessons: track.lessons.map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    durationMinutes: lesson.durationMinutes,
    level: lesson.level,
  })),
}));

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LearningShell tracks={navigationTracks}>{children}</LearningShell>;
}
