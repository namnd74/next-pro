import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Clock, FlaskConical } from 'lucide-react';
import { AI_TRACKS, getAiTrack } from '@/features/ai';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  const totalMinutes = track.lessons.reduce(
    (total, lesson) => total + lesson.durationMinutes,
    0
  );

  return (
    <div className="space-y-8">
      <Link
        href="/ai"
        className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-violet-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Tất cả AI tracks
      </Link>

      <Card className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${track.color}`} />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs uppercase">
              {track.level}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {track.lessons.length} bài học
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Khoảng {totalMinutes} phút
            </span>
          </div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            {track.title}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
            {track.description}
          </p>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-500" aria-hidden="true" />
          <h2 className="text-foreground text-lg font-bold tracking-tight">Syllabus</h2>
        </div>

        <div className="space-y-3">
          {track.lessons.map((lesson, index) => (
            <Card
              key={lesson.slug}
              className="glass-card glass-card-hover group flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <span className="bg-secondary text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors group-hover:bg-violet-500 group-hover:text-white">
                  {index + 1}
                </span>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-foreground text-base font-bold transition-colors group-hover:text-violet-500">
                      {lesson.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {lesson.level}
                    </Badge>
                    {lesson.lab && (
                      <Badge variant="success" className="gap-1 text-[10px] uppercase">
                        <FlaskConical className="h-3 w-3" aria-hidden="true" />
                        Interactive Lab
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {lesson.summary}
                  </p>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {lesson.durationMinutes} phút
                  </span>
                </div>
              </div>
              <Link
                href={`/ai/${track.slug}/${lesson.slug}`}
                className="shrink-0 self-end sm:self-center"
              >
                <Button size="sm" className="gap-2 text-xs font-semibold">
                  Học bài này
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
