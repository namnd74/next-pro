'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Layers,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
  GraduationCap,
  Flame,
  Shield,
  Lock,
  Database,
} from 'lucide-react';
import { LearningTrack } from '../types';
import { useLearningStore } from '../stores/use-learning-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TrackCardProps {
  track: LearningTrack;
}

function getTrackIcon(iconName: string) {
  switch (iconName) {
    case 'GraduationCap':
      return <GraduationCap className="h-6 w-6" />;
    case 'Zap':
      return <Zap className="h-6 w-6" />;
    case 'Flame':
      return <Flame className="h-6 w-6" />;
    case 'Shield':
      return <Shield className="h-6 w-6" />;
    case 'Lock':
      return <Lock className="h-6 w-6" />;
    case 'Database':
      return <Database className="h-6 w-6" />;
    case 'Atom':
    case 'Code':
      return <Code2 className="h-6 w-6" />;
    case 'Layers':
      return <Layers className="h-6 w-6" />;
    default:
      return <Sparkles className="h-6 w-6" />;
  }
}

export function TrackCard({ track }: TrackCardProps) {
  const { completedLessonIds } = useLearningStore();

  const totalLessons = track.lessons.length;
  const completedInTrack = track.lessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;

  const progressPercent =
    totalLessons > 0 ? Math.round((completedInTrack / totalLessons) * 100) : 0;
  const isFullyCompleted = progressPercent === 100;

  const totalMinutes = track.lessons.reduce((acc, l) => acc + l.durationMinutes, 0);

  return (
    <Card className="glass-card glass-card-hover group relative flex flex-col justify-between overflow-hidden p-6">
      {/* Top accent gradient bar */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${track.color}`} />

      <div className="space-y-4">
        {/* Header with Icon & Badges */}
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${track.color} text-white shadow-md transition-transform group-hover:scale-105`}
          >
            {getTrackIcon(track.iconName)}
          </div>

          <div className="flex items-center gap-1.5">
            {isFullyCompleted ? (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-500"
              >
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {totalLessons} Lessons
              </Badge>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-foreground group-hover:text-primary text-lg font-bold tracking-tight transition-colors">
            {track.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {track.description}
          </p>
        </div>

        {/* Meta stats */}
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {totalMinutes} mins
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {completedInTrack}/{totalLessons} done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="text-muted-foreground flex justify-between text-[11px] font-medium">
            <span>Progress</span>
            <span className="text-foreground font-semibold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6">
        <Link href={`/learn/${track.slug}`} className="block">
          <Button
            className="w-full gap-2 font-semibold shadow-sm transition-all"
            variant={isFullyCompleted ? 'outline' : 'default'}
          >
            <span>{completedInTrack === 0 ? 'Start Track' : 'Continue Learning'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
