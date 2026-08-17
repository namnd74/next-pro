import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_LEARNING_TRACKS, LessonViewer } from '@/features/learning';

interface LessonPageProps {
  params: Promise<{
    trackSlug: string;
    lessonSlug: string;
  }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { trackSlug, lessonSlug } = await params;
  const track = MOCK_LEARNING_TRACKS.find((t) => t.slug === trackSlug);
  const lesson = track?.lessons.find((l) => l.slug === lessonSlug);

  if (!track || !lesson) return { title: 'Lesson Not Found | NextPro' };

  return {
    title: `${lesson.title} - ${track.title} | NextPro`,
    description: lesson.summary,
  };
}

export default async function LessonDetailPage({ params }: LessonPageProps) {
  const { trackSlug, lessonSlug } = await params;
  const track = MOCK_LEARNING_TRACKS.find((t) => t.slug === trackSlug);
  const lesson = track?.lessons.find((l) => l.slug === lessonSlug);

  if (!track || !lesson) {
    notFound();
  }

  return <LessonViewer track={track} lesson={lesson} />;
}
