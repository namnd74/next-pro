import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRICULUM_TRACKS, TrackDetailView } from '@/features/learning';

interface TrackPageProps {
  params: Promise<{
    trackSlug: string;
  }>;
}

export function generateStaticParams() {
  return CURRICULUM_TRACKS.map((track) => ({
    trackSlug: track.slug,
  }));
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const track = CURRICULUM_TRACKS.find((t) => t.slug === trackSlug);
  if (!track) return { title: 'Track Not Found | NextPro' };

  return {
    title: `${track.title} | Lộ trình NextPro`,
    description: track.description,
  };
}

export default async function TrackDetailPage({ params }: TrackPageProps) {
  const { trackSlug } = await params;
  const track = CURRICULUM_TRACKS.find((t) => t.slug === trackSlug);

  if (!track) {
    notFound();
  }

  return <TrackDetailView track={track} />;
}
