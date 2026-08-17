import * as React from 'react';
import type { Metadata } from 'next';
import { BookOpen, GraduationCap } from 'lucide-react';
import { MOCK_LEARNING_TRACKS, TrackCard, LearningStats } from '@/features/learning';

export const metadata: Metadata = {
  title: 'Lộ trình Học React 19 & Next.js 15 App Router | NextPro',
  description:
    'Lộ trình 80/20 thực chiến: Nắm vững React 19, App Router RSC, Server Actions, TanStack Query v5 và Caching.',
};

export default function LearnPage() {
  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <GraduationCap className="h-4 w-4" />
          <span>React 19 & Next.js 15 Fast-Track</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Lộ Trình Học & Luyện Tập 80/20
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Tập trung vào 20% kiến trúc và API cốt lõi được sử dụng trong 80% dự án thực tế.
          Mỗi bài học tích hợp Mental Model, so sánh Code Recipe và 60s Blitz Quiz.
        </p>
      </section>

      {/* Progress Stats Summary */}
      <section>
        <LearningStats />
      </section>

      {/* Tracks Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Các Lộ Trình Chuyên Sâu (Learning Tracks)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_LEARNING_TRACKS.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </section>
    </div>
  );
}
