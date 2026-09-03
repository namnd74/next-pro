'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Code2,
  Layers,
  Sparkles,
  BookOpen,
  Terminal,
  Play,
  ArrowRight,
  Clock,
  CheckCircle2,
  Cpu,
  Server,
  Zap,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { LearningTrack } from '../types';
import { TrackCard } from './track-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCuratedExercises, CuratedExercise } from '../data/curriculum';
import { useLearningStore } from '../stores/use-learning-store';

interface LearningCatalogViewProps {
  reactTracks: LearningTrack[];
  nextjsTracks: LearningTrack[];
}

export function LearningCatalogView({
  reactTracks,
  nextjsTracks,
}: LearningCatalogViewProps) {
  const searchParams = useSearchParams();
  const { completedLessonIds, activeDomain, setActiveDomain } = useLearningStore();
  const [domainView, setDomainView] = React.useState<'all' | 'tracks' | 'exercises'>(
    'all'
  );
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const domainParam = searchParams.get('domain');
    if (domainParam === 'nextjs' || domainParam === 'react') {
      setActiveDomain(domainParam);
    }
  }, [searchParams, setActiveDomain]);

  const isReact = activeDomain !== 'nextjs';

  const reactExercises = React.useMemo(() => getCuratedExercises('react'), []);
  const nextjsExercises = React.useMemo(() => getCuratedExercises('nextjs'), []);

  const totalReactLessons = reactTracks.reduce((acc, t) => acc + t.lessons.length, 0);
  const totalNextLessons = nextjsTracks.reduce((acc, t) => acc + t.lessons.length, 0);

  const completedReactCount = mounted
    ? reactExercises.filter((e) => completedLessonIds.includes(e.lessonId)).length
    : 0;

  const completedNextCount = mounted
    ? nextjsExercises.filter((e) => completedLessonIds.includes(e.lessonId)).length
    : 0;

  const currentTracks = isReact ? reactTracks : nextjsTracks;
  const currentExercises = isReact ? reactExercises : nextjsExercises;
  const currentTotal = isReact ? totalReactLessons : totalNextLessons;
  const currentCompleted = isReact ? completedReactCount : completedNextCount;

  return (
    <div className="space-y-8">
      {/* 2. Workspace Domain Header & Sub-filter (Tracks vs Exercises) */}
      <div className="border-border/40 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md ${
                isReact
                  ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                  : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {isReact ? (
                <Code2 className="h-3.5 w-3.5" />
              ) : (
                <Layers className="h-3.5 w-3.5" />
              )}
            </span>
            <h2 className="text-foreground text-xl font-black tracking-tight">
              {isReact
                ? 'Không Gian Học & Luyện Tập React 19'
                : 'Không Gian Học & Luyện Tập Next.js 16'}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
            {isReact
              ? 'Học chuyên sâu React 19: Mental Model thuần khiết, Custom Hooks, Form Architecture, Performance và làm bài tập thực hành trên Client Sandbox.'
              : 'Học chuyên sâu Next.js 16: App Router RSC, Server Actions, TanStack Query v5, Bảo mật và thực hành trên WebContainer Node.js ảo.'}
          </p>
        </div>

        {/* View Switcher: All | Chỉ Lộ Trình | Chỉ Bài Tập */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            size="sm"
            variant={domainView === 'all' ? 'default' : 'outline'}
            onClick={() => setDomainView('all')}
            className="h-8 text-xs font-semibold"
          >
            <span>Tất cả</span>
          </Button>
          <Button
            size="sm"
            variant={domainView === 'tracks' ? 'default' : 'outline'}
            onClick={() => setDomainView('tracks')}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Lộ trình ({currentTracks.length})</span>
          </Button>
          <Button
            size="sm"
            variant={domainView === 'exercises' ? 'default' : 'outline'}
            onClick={() => setDomainView('exercises')}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Kho bài tập ({currentExercises.length})</span>
          </Button>
        </div>
      </div>

      {/* 3. Tracks Section */}
      {(domainView === 'all' || domainView === 'tracks') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-2 text-base font-extrabold tracking-tight">
              <BookOpen
                className={`h-4 w-4 ${isReact ? 'text-cyan-500' : 'text-indigo-500'}`}
              />
              <span>Danh Sách Lộ Trình Học</span>
            </h3>
            <span className="text-muted-foreground font-mono text-xs">
              {currentTracks.length} tracks chuyên sâu
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Dedicated Exercises / Practice Labs Section */}
      {(domainView === 'all' || domainView === 'exercises') && (
        <section className="space-y-4 pt-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <h3 className="text-foreground flex items-center gap-2 text-base font-extrabold tracking-tight">
                <Terminal
                  className={`h-4 w-4 ${isReact ? 'text-cyan-500' : 'text-indigo-500'}`}
                />
                <span>
                  Kho Bài Tập Thực Hành{' '}
                  {isReact ? 'React (Sandbox)' : 'Next.js (WebContainer)'}
                </span>
              </h3>
              <p className="text-muted-foreground text-xs">
                Toàn bộ bài tập thực hành tương tác độc lập được phân loại theo từng cấp
                độ.
              </p>
            </div>
            <Badge
              variant="outline"
              className={`font-mono text-xs ${
                isReact
                  ? 'border-cyan-500/40 text-cyan-600 dark:text-cyan-300'
                  : 'border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
              }`}
            >
              {currentCompleted}/{currentExercises.length} hoàn thành
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentExercises.map((exercise) => {
              const isCompleted =
                mounted && completedLessonIds.includes(exercise.lessonId);

              return (
                <Card
                  key={exercise.lessonId}
                  className="glass-card hover:border-primary/40 flex flex-col justify-between p-4 transition-all hover:shadow-md"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground/80 truncate text-[11px] font-semibold">
                        {exercise.trackTitle}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[9px] uppercase"
                        >
                          {exercise.level}
                        </Badge>
                        {isCompleted && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    <h4 className="text-foreground line-clamp-2 text-sm leading-snug font-bold">
                      {exercise.lessonTitle}
                    </h4>

                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                      {exercise.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-muted-foreground mr-2 flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="h-3 w-3" />
                        {exercise.durationMinutes}m
                      </span>
                      {exercise.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="bg-muted py-0.2 text-muted-foreground rounded px-1.5 text-[9px]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-border/40 mt-3 border-t pt-4">
                    <Link
                      href={`/learn/${exercise.trackSlug}/${exercise.lessonSlug}`}
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        variant={isCompleted ? 'outline' : 'default'}
                        className={`h-8 w-full cursor-pointer gap-1.5 text-xs font-semibold transition-all ${
                          !isCompleted && isReact
                            ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                            : !isCompleted && !isReact
                              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                              : ''
                        }`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{isCompleted ? 'Thực hành lại' : 'Vào thực hành Lab'}</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
