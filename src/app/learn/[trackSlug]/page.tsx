import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { CURRICULUM_TRACKS } from '@/features/learning/data/curriculum';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

  const totalMinutes = track.lessons.reduce((acc, l) => acc + l.durationMinutes, 0);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/learn"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách Lộ trình</span>
        </Link>
      </div>

      {/* Track Hero Banner */}
      <Card className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${track.color}`} />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {track.lessons.length} Bài học
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Tổng thời lượng: ~{totalMinutes} phút
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

      {/* Offensive Security Academy Banner — chỉ khi track có collection RT (soft-link qua relatedTrackSlug) */}
      {/* Syllabus / Lessons List */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-5 w-5" />
          <h2 className="text-foreground text-lg font-bold tracking-tight">
            Danh Sách Bài Học (Syllabus)
          </h2>
        </div>

        <div className="space-y-3">
          {track.lessons.map((lesson, idx) => (
            <Card
              key={lesson.id}
              className="glass-card glass-card-hover group flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <span className="bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors">
                  {idx + 1}
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-foreground group-hover:text-primary text-base font-bold transition-colors">
                      {lesson.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {lesson.level}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {lesson.summary}
                  </p>

                  <div className="text-muted-foreground flex items-center gap-3 pt-1 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      {lesson.quizzes.length} câu hỏi Quiz
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <Link href={`/learn/${track.slug}/${lesson.slug}`}>
                  <Button size="sm" className="gap-2 text-xs font-semibold shadow-sm">
                    <span>Học bài này</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
