'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Code2,
  Layers,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { LearningNavigationTrack } from '../types';
import {
  REACT_SERIES_TRACK_SLUGS,
  NEXTJS_SERIES_TRACK_SLUGS,
} from '../data/mock-courses';
import { useLearningStore } from '../stores/use-learning-store';

interface LearningSidebarProps {
  tracks: LearningNavigationTrack[];
  onNavigate?: () => void;
}

type SeriesFilter = 'all' | 'react' | 'nextjs';

export function LearningSidebar({ tracks, onNavigate }: LearningSidebarProps) {
  const pathname = usePathname();
  const [, , activeTrackSlug, activeLessonSlug] = pathname.split('/');
  const { completedLessonIds, resetProgress } = useLearningStore();
  const [mounted, setMounted] = React.useState(false);
  const [filter, setFilter] = React.useState<SeriesFilter>('all');
  const [manualExpanded, setManualExpanded] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-sync tab or auto-expand active track on load/route change
  React.useEffect(() => {
    if (activeTrackSlug) {
      setManualExpanded((prev) =>
        prev.includes(activeTrackSlug) ? prev : [...prev, activeTrackSlug]
      );
    }
  }, [activeTrackSlug]);

  const reactTracks = tracks.filter((t) => REACT_SERIES_TRACK_SLUGS.includes(t.slug));
  const nextjsTracks = tracks.filter((t) => NEXTJS_SERIES_TRACK_SLUGS.includes(t.slug));

  const allLessons = tracks.flatMap((track) => track.lessons);
  const completedCount = mounted
    ? allLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
    : 0;

  const toggleExpand = (trackSlug: string) => {
    setManualExpanded((prev) =>
      prev.includes(trackSlug)
        ? prev.filter((s) => s !== trackSlug)
        : [...prev, trackSlug]
    );
  };

  const renderTrackList = (
    trackList: LearningNavigationTrack[],
    seriesType: 'react' | 'nextjs'
  ) => {
    return trackList.map((track, idx) => {
      const isActive = activeTrackSlug === track.slug;
      const isExpanded = isActive || manualExpanded.includes(track.slug);
      const completedInTrack = mounted
        ? track.lessons.filter((l) => completedLessonIds.includes(l.id)).length
        : 0;
      const isReact = seriesType === 'react';

      return (
        <div
          key={track.id}
          className={`overflow-hidden rounded-xl border transition-all duration-200 ${
            isActive
              ? isReact
                ? 'border-cyan-500/50 bg-cyan-950/20 shadow-sm shadow-cyan-500/10'
                : 'border-indigo-500/50 bg-indigo-950/20 shadow-sm shadow-indigo-500/10'
              : 'border-border/60 bg-secondary/15 hover:border-border/90 hover:bg-secondary/30'
          }`}
        >
          {/* Track Header Card */}
          <div className="flex items-stretch justify-between">
            <Link
              href={`/learn/${track.slug}`}
              onClick={onNavigate}
              className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5"
            >
              <span
                className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                  isReact
                    ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
                    : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                }`}
              >
                T{String(idx + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-foreground block truncate text-xs font-semibold">
                  {track.title}
                </span>
                <span className="text-muted-foreground/80 block font-mono text-[9px]">
                  {completedInTrack}/{track.lessons.length} hoàn thành
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleExpand(track.slug);
              }}
              aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} ${track.title}`}
              aria-expanded={isExpanded}
              className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-center px-2.5 transition-colors"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'text-foreground rotate-180' : 'text-muted-foreground/60'
                }`}
              />
            </button>
          </div>

          {/* Lessons List Underneath (Bài học theo dưới) */}
          {isExpanded && (
            <ul className="border-border/40 bg-background/40 space-y-1 border-t px-2 py-2">
              <li className="text-muted-foreground/70 px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase">
                Bài học ({track.lessons.length})
              </li>
              {track.lessons.map((lesson) => {
                const isCompleted = mounted && completedLessonIds.includes(lesson.id);
                const isLessonActive = activeLessonSlug === lesson.slug;

                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${track.slug}/${lesson.slug}`}
                      onClick={onNavigate}
                      aria-current={isLessonActive ? 'page' : undefined}
                      className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                        isLessonActive
                          ? isReact
                            ? 'bg-cyan-500/15 font-semibold text-cyan-300'
                            : 'bg-indigo-500/15 font-semibold text-indigo-300'
                          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="text-muted-foreground/40 mt-0.5 h-3.5 w-3.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                        <span className="text-muted-foreground/70 flex items-center gap-1.5 pt-0.5 font-mono text-[9px]">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{lesson.durationMinutes}m</span>
                          <span>•</span>
                          <span className="capitalize">{lesson.level}</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pb-4">
      {/* Header Card */}
      <Link
        href="/learn"
        onClick={onNavigate}
        className="border-primary/20 bg-primary/5 hover:bg-primary/10 flex shrink-0 items-center gap-2.5 rounded-xl border p-2.5 transition-colors"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md">
          <BookOpen className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <span className="text-foreground block truncate text-sm font-extrabold tracking-tight">
            React & Next.js Pro
          </span>
          <span className="text-muted-foreground block font-mono text-[9px] tracking-widest uppercase">
            Learn · Practice · Master
          </span>
        </div>
      </Link>

      {/* Series Filter Selector Tabs */}
      <div className="bg-secondary/40 grid grid-cols-3 gap-1 rounded-lg p-1 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex items-center justify-center gap-1 rounded-md px-1.5 py-1 transition-all ${
            filter === 'all'
              ? 'bg-background text-foreground font-bold shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>Tất cả</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('react')}
          className={`flex items-center justify-center gap-1 rounded-md px-1.5 py-1 transition-all ${
            filter === 'react'
              ? 'bg-cyan-500/20 font-bold text-cyan-400 shadow-xs'
              : 'text-muted-foreground hover:text-cyan-400'
          }`}
        >
          <Code2 className="h-3 w-3" />
          <span>React ({reactTracks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('nextjs')}
          className={`flex items-center justify-center gap-1 rounded-md px-1.5 py-1 transition-all ${
            filter === 'nextjs'
              ? 'bg-indigo-500/20 font-bold text-indigo-400 shadow-xs'
              : 'text-muted-foreground hover:text-indigo-400'
          }`}
        >
          <Layers className="h-3 w-3" />
          <span>Next.js ({nextjsTracks.length})</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="space-y-4" aria-label="Lộ trình học React & Next.js">
        {/* Section: React Series */}
        {(filter === 'all' || filter === 'react') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                <Code2 className="h-3 w-3" />
                <span>Seri React Mastery</span>
              </div>
              <span className="text-muted-foreground/70 font-mono text-[9px]">
                {reactTracks.length} tracks
              </span>
            </div>
            <div className="space-y-1.5">{renderTrackList(reactTracks, 'react')}</div>
          </div>
        )}

        {/* Section: Next.js Series */}
        {(filter === 'all' || filter === 'nextjs') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                <Layers className="h-3 w-3" />
                <span>Seri Next.js Fullstack</span>
              </div>
              <span className="text-muted-foreground/70 font-mono text-[9px]">
                {nextjsTracks.length} tracks
              </span>
            </div>
            <div className="space-y-1.5">{renderTrackList(nextjsTracks, 'nextjs')}</div>
          </div>
        )}
      </nav>

      {/* Progress Footer */}
      <div className="border-border/60 bg-secondary/30 mt-auto space-y-2 rounded-xl border p-3">
        <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
          <span>Tiến độ tổng</span>
          <span className="text-primary font-bold">
            {completedCount}/{allLessons.length} bài
          </span>
        </div>
        <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-[width] duration-300"
            style={{
              width: `${allLessons.length ? (completedCount / allLessons.length) * 100 : 0}%`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ học?')) {
              resetProgress();
            }
          }}
          className="border-border bg-background/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset tiến độ
        </button>
      </div>
    </div>
  );
}
