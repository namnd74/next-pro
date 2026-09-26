import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AI_TRACKS, getAiTrack, AiTrackDetailView } from '@/features/ai';

interface AiTrackPageProps {
  params: Promise<{ trackSlug: string }>;
}

export function generateStaticParams() {
  return AI_TRACKS.map((track) => ({ trackSlug: track.slug }));
}

export async function generateMetadata({ params }: AiTrackPageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const track = getAiTrack(trackSlug);
  if (!track) return { title: 'AI Track Not Found | NextPro' };

  return {
    title: `${track.title} | AI Engineering NextPro`,
    description: track.description,
  };
}

export default async function AiTrackPage({ params }: AiTrackPageProps) {
  const { trackSlug } = await params;
  const track = getAiTrack(trackSlug);
  if (!track) notFound();

  return <AiTrackDetailView track={track} />;
}
