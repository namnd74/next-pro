import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AI_TRACKS, AiLessonViewer, getAiLesson, getAiTrack } from '@/features/ai';

interface AiLessonPageProps {
  params: Promise<{ trackSlug: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return AI_TRACKS.flatMap((track) =>
    track.lessons.map((lesson) => ({
      trackSlug: track.slug,
      lessonSlug: lesson.slug,
    }))
  );
}

export async function generateMetadata({ params }: AiLessonPageProps): Promise<Metadata> {
  const { trackSlug, lessonSlug } = await params;
  const track = getAiTrack(trackSlug);
  const lesson = getAiLesson(trackSlug, lessonSlug);
  if (!track || !lesson) return { title: 'AI Lesson Not Found | NextPro' };

  return {
    title: `${lesson.title} - ${track.title} | NextPro`,
    description: lesson.summary,
  };
}

export default async function AiLessonPage({ params }: AiLessonPageProps) {
  const { trackSlug, lessonSlug } = await params;
  const track = getAiTrack(trackSlug);
  const lesson = getAiLesson(trackSlug, lessonSlug);
  if (!track || !lesson) notFound();

  return <AiLessonViewer track={track} lesson={lesson} />;
}
