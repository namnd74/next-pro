'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Code2,
  Layers,
  RotateCcw,
} from 'lucide-react';
import type { LearningNavigationTrack } from '../types';
import { REACT_SERIES_TRACK_SLUGS, NEXTJS_SERIES_TRACK_SLUGS } from '../data/curriculum';
import { useLearningStore } from '../stores/use-learning-store';

interface LearningSidebarProps {
  tracks: LearningNavigationTrack[];
  onNavigate?: () => void;
}

export function LearningSidebar({ tracks, onNavigate }: LearningSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [, , activeTrackSlug, activeLessonSlug] = pathname.split('/');
  const { completedLessonIds, resetProgress, activeDomain, setActiveDomain } =
    useLearningStore();
  const [mounted, setMounted] = React.useState(false);
  const [manualExpanded, setManualExpanded] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('domain');
      if (param === 'nextjs' || param === 'react') {
        setActiveDomain(param);
      }
    }
  }, [setActiveDomain]);

  // Auto-expand active track and sync active domain on load/route change
  React.useEffect(() => {
    if (activeTrackSlug) {
      if (NEXTJS_SERIES_TRACK_SLUGS.includes(activeTrackSlug)) {
        setActiveDomain('nextjs');
      } else if (REACT_SERIES_TRACK_SLUGS.includes(activeTrackSlug)) {
        setActiveDomain('react');
      }
      setManualExpanded((prev) =>
        prev.includes(activeTrackSlug) ? prev : [...prev, activeTrackSlug]
      );
    }
  }, [activeTrackSlug, setActiveDomain]);

  const isNextjs = activeDomain === 'nextjs';

  const reactTracks = React.useMemo(
    () => tracks.filter((t) => REACT_SERIES_TRACK_SLUGS.includes(t.slug)),
    [tracks]
  );
  const nextjsTracks = React.useMemo(
    () => tracks.filter((t) => NEXTJS_SERIES_TRACK_SLUGS.includes(t.slug)),
    [tracks]
  );

  const activeTracks = isNextjs ? nextjsTracks : reactTracks;
  const activeSeriesType: 'react' | 'nextjs' = isNextjs ? 'nextjs' : 'react';

  const seriesLessons = React.useMemo(
    () => activeTracks.flatMap((track) => track.lessons),
    [activeTracks]
  );

  const completedCount = mounted
    ? seriesLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
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
      {/* 1. Dedicated Framework Switcher in Left Sidebar */}
      <div className="border-border/70 bg-secondary/30 grid grid-cols-2 gap-1.5 rounded-xl border p-1">
        <button
          type="button"
          onClick={() => {
            setActiveDomain('react');
            if (pathname !== '/learn') {
              router.push('/learn?domain=react');
            } else {
              window.history.pushState(null, '', '/learn?domain=react');
            }
            onNavigate?.();
          }}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all ${
            !isNextjs
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
              : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>React 19</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveDomain('nextjs');
            if (pathname !== '/learn') {
              router.push('/learn?domain=nextjs');
            } else {
              window.history.pushState(null, '', '/learn?domain=nextjs');
            }
            onNavigate?.();
          }}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all ${
            isNextjs
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Next.js 16</span>
        </button>
      </div>

      {/* 2. Series Header Banner */}
      <div
        className={`flex shrink-0 items-center gap-2.5 rounded-xl border p-2.5 transition-colors ${
          isNextjs
            ? 'border-indigo-500/20 bg-indigo-500/5'
            : 'border-cyan-500/20 bg-cyan-500/5'
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs ${
            isNextjs
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : 'bg-gradient-to-br from-cyan-500 to-teal-600'
          }`}
        >
          {isNextjs ? <Layers className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
        </span>
        <div className="min-w-0 space-y-0.5">
          <span className="text-foreground block truncate text-xs font-extrabold tracking-tight">
            {isNextjs ? 'Seri Next.js 16 Fullstack' : 'Seri React 19 Mastery'}
          </span>
          <span className="text-muted-foreground block font-mono text-[9px] tracking-widest uppercase">
            {isNextjs ? '4 Lộ trình · WebContainer' : '8 Lộ trình · Sandbox'}
          </span>
        </div>
      </div>

      {/* Navigation List - Only Active Series */}
      <nav
        className="space-y-3"
        aria-label={isNextjs ? 'Lộ trình học Next.js 16' : 'Lộ trình học React 19'}
      >
        <div className="flex items-center justify-between px-1">
          <div
            className={`flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
              isNextjs ? 'text-indigo-400' : 'text-cyan-400'
            }`}
          >
            {isNextjs ? <Layers className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
            <span>{isNextjs ? 'Seri Next.js Fullstack' : 'Seri React Mastery'}</span>
          </div>
          <span className="text-muted-foreground/70 font-mono text-[9px]">
            {activeTracks.length} tracks
          </span>
        </div>
        <div className="space-y-1.5">
          {renderTrackList(activeTracks, activeSeriesType)}
        </div>
      </nav>

      {/* Progress Footer */}
      <div className="border-border/60 bg-secondary/30 mt-auto space-y-2 rounded-xl border p-3">
        <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
          <span>Tiến độ {isNextjs ? 'Next.js' : 'React'}</span>
          <span className="text-primary font-bold">
            {completedCount}/{seriesLessons.length} bài
          </span>
        </div>
        <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              isNextjs
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                : 'bg-gradient-to-r from-cyan-500 to-teal-500'
            }`}
            style={{
              width: `${seriesLessons.length ? (completedCount / seriesLessons.length) * 100 : 0}%`,
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
