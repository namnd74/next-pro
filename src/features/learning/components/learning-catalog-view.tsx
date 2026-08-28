'use client';

import * as React from 'react';
import { Code2, Layers, Sparkles } from 'lucide-react';
import { LearningTrack } from '../types';
import { TrackCard } from './track-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LearningCatalogViewProps {
  reactTracks: LearningTrack[];
  nextjsTracks: LearningTrack[];
}

export function LearningCatalogView({
  reactTracks,
  nextjsTracks,
}: LearningCatalogViewProps) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'react' | 'nextjs'>('all');

  const totalReactLessons = reactTracks.reduce((acc, t) => acc + t.lessons.length, 0);
  const totalNextLessons = nextjsTracks.reduce((acc, t) => acc + t.lessons.length, 0);

  const showReact = activeTab === 'all' || activeTab === 'react';
  const showNext = activeTab === 'all' || activeTab === 'nextjs';

  return (
    <div className="space-y-8">
      {/* Category Navigation Tabs */}
      <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tất cả lộ trình</span>
            <Badge
              variant={activeTab === 'all' ? 'outline' : 'secondary'}
              className="ml-1 px-1.5 py-0 text-[10px]"
            >
              {reactTracks.length + nextjsTracks.length}
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={activeTab === 'react' ? 'default' : 'outline'}
            onClick={() => setActiveTab('react')}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Seri React</span>
            <Badge
              variant={activeTab === 'react' ? 'outline' : 'secondary'}
              className="ml-1 px-1.5 py-0 text-[10px]"
            >
              {reactTracks.length}
            </Badge>
          </Button>

          <Button
            size="sm"
            variant={activeTab === 'nextjs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('nextjs')}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Seri Next.js</span>
            <Badge
              variant={activeTab === 'nextjs' ? 'outline' : 'secondary'}
              className="ml-1 px-1.5 py-0 text-[10px]"
            >
              {nextjsTracks.length}
            </Badge>
          </Button>
        </div>

        <span className="text-muted-foreground hidden text-xs sm:inline">
          {activeTab === 'react' &&
            `${reactTracks.length} lộ trình · ${totalReactLessons} bài thực hành`}
          {activeTab === 'nextjs' &&
            `${nextjsTracks.length} lộ trình · ${totalNextLessons} bài thực hành`}
          {activeTab === 'all' &&
            `${reactTracks.length + nextjsTracks.length} lộ trình chuyên sâu`}
        </span>
      </div>

      {/* SECTION 1: SERI REACT */}
      {showReact && (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-sm">
                <Code2 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-foreground text-xl font-extrabold tracking-tight">
                  1. Seri Lộ Trình React Mastery
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-cyan-500/30 text-[11px] text-cyan-400"
              >
                {reactTracks.length} Lộ trình
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                {totalReactLessons} Bài học
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            Nắm vững React 19 từ Mental Model nền tảng, Custom Hooks, Form Engineering,
            Tối ưu Performance, Enterprise Testing đến Capstone Project thực chiến.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reactTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: SERI NEXT.JS */}
      {showNext && (
        <section className="space-y-4 pt-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-sm">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-foreground text-xl font-extrabold tracking-tight">
                  2. Seri Lộ Trình Next.js 16 Fullstack
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-indigo-500/30 text-[11px] text-indigo-400"
              >
                {nextjsTracks.length} Lộ trình
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                {totalNextLessons} Bài học
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            Làm chủ App Router RSC, Server Actions, TanStack Query v5 Server State, Bảo
            mật Web & Phân quyền, và Triển khai Production Standalone Docker.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nextjsTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
