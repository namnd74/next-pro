'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { AiTopicIcon } from './ai-topic-icon';
import { useAiLearningStore } from '../stores/use-ai-learning-store';
import type { AiTrackNavigation } from '../types';

interface AiSidebarProps {
  tracks: AiTrackNavigation[];
  onNavigate?: () => void;
}

export function AiSidebar({ tracks, onNavigate }: AiSidebarProps) {
  const pathname = usePathname();
  const [, , activeTrackSlug, activeLessonSlug] = pathname.split('/');
  const { completedLessonSlugs, resetProgress } = useAiLearningStore();
  const [mounted, setMounted] = React.useState(false);
  const [manualExpanded, setManualExpanded] = React.useState<string[]>([]);

  React.useEffect(() => setMounted(true), []);

  const allLessons = tracks.flatMap((track) => track.lessons);
  const completedCount = mounted
    ? allLessons.filter((lesson) => completedLessonSlugs.includes(lesson.slug)).length
    : 0;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pb-4">
      <Link
        href="/ai"
        onClick={onNavigate}
        className="flex shrink-0 items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2.5 transition-colors hover:bg-violet-500/10"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
          <BrainCircuit className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="space-y-0.5">
          <span className="text-foreground block text-sm font-extrabold tracking-tight">
            AI Engineering
          </span>
          <span className="text-muted-foreground block font-mono text-[9px] tracking-widest uppercase">
            understand · build · evaluate
          </span>
        </span>
      </Link>

      <nav className="space-y-2" aria-label="Lộ trình AI Engineering">
        <p className="text-muted-foreground px-1 font-mono text-[10px] tracking-widest uppercase">
          Lộ trình ({tracks.length} tracks)
        </p>

        {tracks.map((track, index) => {
          const active = activeTrackSlug === track.slug;
          const expanded = active || manualExpanded.includes(track.slug);
          const completedInTrack = mounted
            ? track.lessons.filter((lesson) => completedLessonSlugs.includes(lesson.slug))
                .length
            : 0;

          return (
            <div key={track.id} className="space-y-1.5">
              <div className="bg-background/95 sticky top-0 z-10 flex items-center gap-1.5 rounded-lg px-1 py-1 backdrop-blur">
                <span className="font-mono text-[9px] font-bold tracking-widest text-violet-500 uppercase">
                  A{String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-foreground truncate text-[11px] font-bold">
                  {track.title}
                </span>
              </div>

              <div
                className={`overflow-hidden rounded-xl border transition-colors ${
                  active
                    ? 'border-violet-500/40 bg-violet-500/5'
                    : 'border-border/60 bg-secondary/20 hover:border-border'
                }`}
              >
                <div className="flex items-stretch">
                  <Link
                    href={`/ai/${track.slug}`}
                    onClick={onNavigate}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-500">
                      <AiTopicIcon name={track.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block truncate text-xs font-semibold">
                        {track.title}
                      </span>
                      <span className="text-muted-foreground/70 font-mono text-[9px]">
                        {completedInTrack}/{track.lessons.length} hoàn thành
                      </span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setManualExpanded((current) =>
                        current.includes(track.slug)
                          ? current.filter((slug) => slug !== track.slug)
                          : [...current, track.slug]
                      )
                    }
                    aria-label={`${expanded ? 'Thu gọn' : 'Mở rộng'} ${track.title}`}
                    aria-expanded={expanded}
                    className="text-muted-foreground hover:text-foreground cursor-pointer px-2 transition-colors"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                </div>

                {expanded && (
                  <ul className="border-border/40 space-y-0.5 border-t px-2 py-1.5">
                    <li className="text-muted-foreground px-1 pb-0.5 font-mono text-[9px] tracking-widest uppercase">
                      Bài học ({track.lessons.length})
                    </li>
                    {track.lessons.map((lesson) => {
                      const completed =
                        mounted && completedLessonSlugs.includes(lesson.slug);
                      const lessonActive = activeLessonSlug === lesson.slug;

                      return (
                        <li key={lesson.slug}>
                          <Link
                            href={`/ai/${track.slug}/${lesson.slug}`}
                            onClick={onNavigate}
                            aria-current={lessonActive ? 'page' : undefined}
                            className={`flex items-start gap-1.5 rounded-lg px-1.5 py-1.5 text-[11px] leading-snug transition-colors ${
                              lessonActive
                                ? 'bg-violet-500/10 font-semibold text-violet-600 dark:text-violet-400'
                                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                            }`}
                          >
                            {completed ? (
                              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="text-muted-foreground/40 mt-0.5 h-3 w-3 shrink-0" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 block">{lesson.title}</span>
                              <span className="text-muted-foreground/70 flex items-center gap-1 font-mono text-[9px]">
                                <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                                {lesson.durationMinutes} phút · {lesson.level}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-border/60 bg-secondary/30 mt-auto space-y-2 rounded-xl border p-3">
        <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
          <span>Tiến độ</span>
          <span className="font-bold text-violet-600 dark:text-violet-400">
            {completedCount}/{allLessons.length} bài
          </span>
        </div>
        <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-300"
            style={{
              width: `${allLessons.length ? (completedCount / allLessons.length) * 100 : 0}%`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn đặt lại tiến độ AI Engineering?')) {
              resetProgress();
            }
          }}
          className="border-border bg-background/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset tiến độ
        </button>
      </div>
    </div>
  );
}
