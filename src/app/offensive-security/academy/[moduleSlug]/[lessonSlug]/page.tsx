import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ACADEMY_MODULES,
  AcademyLessonViewer,
  getAcademyLessonBySlug,
} from '@/features/offensive-security';

interface AcademyLessonPageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return ACADEMY_MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({
      moduleSlug: module.slug,
      lessonSlug: lesson.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: AcademyLessonPageProps): Promise<Metadata> {
  const { moduleSlug, lessonSlug } = await params;
  const result = getAcademyLessonBySlug(moduleSlug, lessonSlug);
  if (!result) return { title: 'Academy Lesson Not Found | NextPro' };
  return {
    title: `${result.lesson.title} | NextPro`,
    description: result.lesson.summary,
  };
}

export default async function AcademyLessonPage({ params }: AcademyLessonPageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const result = getAcademyLessonBySlug(moduleSlug, lessonSlug);
  if (!result) notFound();
  return <AcademyLessonViewer module={result.module} lesson={result.lesson} />;
}
