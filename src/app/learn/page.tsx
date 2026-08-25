import * as React from 'react';
import type { Metadata } from 'next';
import {
  BookOpen,
  Code2,
  GraduationCap,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { LearningStats } from '@/features/learning/components/learning-stats';
import { TrackCard } from '@/features/learning/components/track-card';
import { MOCK_LEARNING_TRACKS } from '@/features/learning/data/mock-courses';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Lộ trình Học React 19 & Next.js 16 App Router | NextPro',
  description:
    'Lộ trình 80/20 thực chiến: Nắm vững React 19, App Router RSC, Server Actions, TanStack Query v5 và Caching.',
};

const LEARNING_STEPS = [
  {
    icon: BookOpen,
    title: 'Nắm Mental Model',
    description: 'Đọc lý thuyết cô đọng và các nguyên tắc cốt lõi trước khi viết code.',
  },
  {
    icon: Code2,
    title: 'Thực hành Code Lab',
    description: 'So sánh recipe hiện đại với legacy pattern và kiểm tra từng trade-off.',
  },
  {
    icon: Sparkles,
    title: 'Quiz → Master',
    description: 'Hoàn thành micro-quiz, lưu tiến độ và tiếp tục đúng bài còn yếu.',
  },
];

export default function LearnPage() {
  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="space-y-4 text-center sm:text-left">
        <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <GraduationCap className="h-4 w-4" />
          <span>React 19 & Next.js 16 Fast-Track</span>
        </div>

        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Lộ Trình Học & Luyện Tập 80/20
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          Tập trung vào 20% kiến trúc và API cốt lõi được sử dụng trong 80% dự án thực tế.
          Mỗi bài học tích hợp Mental Model, so sánh Code Recipe, Live API Tester, Error
          Boundary Simulator và 60s Blitz Quiz.
        </p>
      </section>

      {/* Progress Stats Summary */}
      <section>
        <LearningStats />
      </section>

      {/* Tracks Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-5 w-5" />
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Các Lộ Trình Chuyên Sâu (Learning Tracks)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_LEARNING_TRACKS.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
          <MousePointerClick className="text-primary h-5 w-5" />
          Cách học
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {LEARNING_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="glass-card space-y-2 p-5">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-mono text-xs font-extrabold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Icon className="text-primary h-4 w-4" />
                </div>
                <h3 className="text-foreground text-sm font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
