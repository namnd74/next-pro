import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ACADEMY_MODULES,
  AcademyModuleOverview,
  getAcademyModuleBySlug,
} from '@/features/offensive-security';

interface AcademyModulePageProps {
  params: Promise<{ trackSlug: string; moduleSlug: string }>;
}

export function generateStaticParams() {
  return ACADEMY_MODULES.map((academyModule) => ({
    trackSlug: academyModule.trackId,
    moduleSlug: academyModule.slug,
  }));
}

export async function generateMetadata({
  params,
}: AcademyModulePageProps): Promise<Metadata> {
  const { trackSlug, moduleSlug } = await params;
  const academyModule = getAcademyModuleBySlug(moduleSlug);
  if (!academyModule || academyModule.trackId !== trackSlug) {
    return { title: 'Academy Module Not Found | NextPro' };
  }
  return {
    title: `${academyModule.title} | NextPro`,
    description: academyModule.summary,
  };
}

export default async function AcademyModulePage({ params }: AcademyModulePageProps) {
  const { trackSlug, moduleSlug } = await params;
  const academyModule = getAcademyModuleBySlug(moduleSlug);
  if (!academyModule || academyModule.trackId !== trackSlug) notFound();
  return <AcademyModuleOverview module={academyModule} />;
}
