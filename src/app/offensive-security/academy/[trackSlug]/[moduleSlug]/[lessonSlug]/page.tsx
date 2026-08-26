import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ACADEMY_MODULES,
  AcademyLessonViewer,
  getAcademyLessonBySlug,
} from '@/features/offensive-security';

interface AcademyLessonPageProps {
  params: Promise<{ trackSlug: string; moduleSlug: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return ACADEMY_MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({
      trackSlug: module.trackId,
      moduleSlug: module.slug,
      lessonSlug: lesson.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: AcademyLessonPageProps): Promise<Metadata> {
  const { trackSlug, moduleSlug, lessonSlug } = await params;
  const result = getAcademyLessonBySlug(moduleSlug, lessonSlug);
  if (!result || result.module.trackId !== trackSlug) {
    return { title: 'Academy Lesson Not Found | NextPro' };
  }
  return {
    title: `${result.lesson.title} | NextPro`,
    description: result.lesson.summary,
  };
}

export default async function AcademyLessonPage({ params }: AcademyLessonPageProps) {
  const { trackSlug, moduleSlug, lessonSlug } = await params;
  const result = getAcademyLessonBySlug(moduleSlug, lessonSlug);
  if (!result || result.module.trackId !== trackSlug) notFound();
  return <AcademyLessonViewer module={result.module} lesson={result.lesson} />;
}
