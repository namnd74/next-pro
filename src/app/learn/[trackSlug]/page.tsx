import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, ArrowRight, Sparkles, Crosshair } from 'lucide-react';
import { MOCK_LEARNING_TRACKS } from '@/features/learning';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TrackPageProps {
  params: Promise<{
    trackSlug: string;
  }>;
}

export function generateStaticParams() {
  return MOCK_LEARNING_TRACKS.map((track) => ({
    trackSlug: track.slug,
  }));
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const track = MOCK_LEARNING_TRACKS.find((t) => t.slug === trackSlug);
  if (!track) return { title: 'Track Not Found | NextPro' };

  return {
    title: `${track.title} | Lộ trình NextPro`,
    description: track.description,
  };
}

export default async function TrackDetailPage({ params }: TrackPageProps) {
  const { trackSlug } = await params;
  const track = MOCK_LEARNING_TRACKS.find((t) => t.slug === trackSlug);

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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Tổng thời lượng: ~{totalMinutes} phút
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {track.title}
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {track.description}
          </p>
        </div>
      </Card>

      {/* Red Team Ops Banner */}
      <Link href={`/rt/${track.slug}`} className="group block">
        <Card className="glass-card glass-card-hover relative overflow-hidden p-4 sm:p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Crosshair className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground transition-colors group-hover:text-destructive">
                  Red Team Ops: thử phá hủy chủ đề này
                </p>
                <p className="text-xs text-muted-foreground">
                  Mô phỏng attack vectors · Blast Radius · Defense Patch · UI Demo tương
                  tác
                </p>
              </div>
            </div>
            <Badge variant="destructive" className="gap-1 text-[10px] uppercase tracking-wider">
              Attack Mode
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Badge>
          </div>
        </Card>
      </Link>

      {/* Syllabus / Lessons List */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {idx + 1}
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {lesson.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {lesson.level}
                    </Badge>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {lesson.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
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
