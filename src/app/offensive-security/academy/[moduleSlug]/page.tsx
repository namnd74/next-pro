import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ACADEMY_MODULES,
  AcademyModuleOverview,
  getAcademyModuleBySlug,
} from '@/features/offensive-security';

interface AcademyModulePageProps {
  params: Promise<{ moduleSlug: string }>;
}

export function generateStaticParams() {
  return ACADEMY_MODULES.map((academyModule) => ({
    moduleSlug: academyModule.slug,
  }));
}

export async function generateMetadata({
  params,
}: AcademyModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const academyModule = getAcademyModuleBySlug(moduleSlug);
  if (!academyModule) return { title: 'Academy Module Not Found | NextPro' };
  return {
    title: `${academyModule.title} | NextPro`,
    description: academyModule.summary,
  };
}

export default async function AcademyModulePage({ params }: AcademyModulePageProps) {
  const { moduleSlug } = await params;
  const academyModule = getAcademyModuleBySlug(moduleSlug);
  if (!academyModule) notFound();
  return <AcademyModuleOverview module={academyModule} />;
}
