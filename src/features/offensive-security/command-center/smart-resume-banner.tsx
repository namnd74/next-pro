'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useOffensiveSecurityStore } from '../stores/use-offensive-security-store';

const TOTAL_ACADEMY_LESSONS = 81;

export const SmartResumeBanner: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const completedAcademyLessonIds = useOffensiveSecurityStore(
    (state) => state.completedAcademyLessonIds
  );
  const lastVisitedLesson = useOffensiveSecurityStore((state) => state.lastVisitedLesson);
  const resetOffensiveSecurityProgress = useOffensiveSecurityStore(
    (state) => state.resetOffensiveSecurityProgress
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="border-border/80 bg-card/60 animate-pulse rounded-3xl p-6">
        <div className="bg-secondary/40 h-20 w-full rounded-2xl" />
      </Card>
    );
  }

  const completedCount = completedAcademyLessonIds.length;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / TOTAL_ACADEMY_LESSONS) * 100)
  );

  // Determine target link
  const resumeUrl = lastVisitedLesson
    ? `/offensive-security/academy/${lastVisitedLesson.trackSlug}/${lastVisitedLesson.moduleSlug}/${lastVisitedLesson.lessonSlug}`
    : '/offensive-security/academy/os00-ethics-authorization/roles-and-boundaries/offensive-work-map';

  const resumeTitle = lastVisitedLesson
    ? lastVisitedLesson.title
    : 'Bản Đồ Tác Chiến & Ranh Giới Ủy Quyền (os00-l01)';

  return (
    <Card className="relative overflow-hidden rounded-3xl border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-950/80 p-6 shadow-xl backdrop-blur-md">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Resume status & metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-950/40 font-mono text-[10px] text-emerald-400"
            >
              OPERATOR ACTIVE SESSION
            </Badge>
            <Badge
              variant="outline"
              className="border-border/80 bg-secondary/40 font-mono text-[10px] text-slate-300"
            >
              LEVEL:{' '}
              {completedCount >= 40
                ? 'SENIOR RED TEAM'
                : completedCount >= 10
                  ? 'PENTESTER JUNIOR'
                  : 'OPERATOR APPRENTICE'}
            </Badge>
          </div>

          <div>
            <h3 className="text-foreground flex items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl">
              <Terminal className="h-5 w-5 text-emerald-400" />
              <span>
                {completedCount > 0
                  ? 'Tiếp tục lộ trình thực chiến:'
                  : 'Sẵn sàng khởi động lộ trình:'}
              </span>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              <span className="text-foreground font-semibold">{resumeTitle}</span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono">
                Tiến độ Academy: {completedCount}/{TOTAL_ACADEMY_LESSONS} bài (
                {progressPercent}%)
              </span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1 font-semibold text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đang ghi nhận
                </span>
              )}
            </div>
            <div className="bg-secondary/60 h-2 w-full max-w-md overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right column: Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href={resumeUrl}>
            <Button
              size="lg"
              data-testid="smart-resume-button"
              className="gap-2 bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:bg-emerald-500"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>
                {completedCount > 0 ? 'Tiếp Tục Học Ngay' : 'Khởi Động Bài Đầu Tiên'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/offensive-security/academy">
            <Button
              variant="outline"
              size="lg"
              className="border-border/80 hover:bg-secondary/60 gap-2 font-semibold"
            >
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Xem Toàn Bộ 19 Tracks</span>
            </Button>
          </Link>

          {completedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    'Bạn có chắc chắn muốn đặt lại toàn bộ điểm hoàn thành bài học?'
                  )
                ) {
                  resetOffensiveSecurityProgress();
                }
              }}
              className="text-muted-foreground h-9 gap-1 text-xs hover:text-rose-400"
              title="Đặt lại tiến độ học"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
