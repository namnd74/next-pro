import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { AiTopicIcon } from './ai-topic-icon';
import type { AiTrack } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function AiTrackCard({ track }: { track: AiTrack }) {
  const totalMinutes = track.lessons.reduce(
    (total, lesson) => total + lesson.durationMinutes,
    0
  );

  return (
    <Link href={`/ai/${track.slug}`} className="group">
      <Card className="glass-card glass-card-hover relative h-full cursor-pointer overflow-hidden p-5 sm:p-6">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${track.color}`} />
        <div className="flex h-full flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${track.color} text-white shadow-md`}
              >
                <AiTopicIcon name={track.icon} />
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase">
                {track.level}
              </Badge>
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-lg font-bold tracking-tight transition-colors group-hover:text-violet-500">
                {track.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {track.description}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {track.lessons.length} bài
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {totalMinutes} phút
              </span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
              Mở track
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
