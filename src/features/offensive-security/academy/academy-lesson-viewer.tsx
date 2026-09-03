'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Lightbulb,
  RotateCcw,
  Scale,
  ShieldCheck,
  Terminal,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import { AcademyAssessment } from './academy-assessment';
import { academyLessonHref, academyModuleHref } from './academy-tracks';
import type { AcademyLesson, AcademyModule, AcademyVisualStep } from './types';
import { getWorkbenchConfigForLesson } from '../workbench/workbench-presets';
import { AcademyLiveWorkbench } from '../workbench/components/academy-live-workbench';
import { ResizableSplitWorkspace } from '../workbench/components/resizable-split-workspace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AcademyLessonViewerProps {
  module: AcademyModule;
  lesson: AcademyLesson;
}

const VISUAL_TONE_CONFIG: Record<
  AcademyVisualStep['tone'],
  { border: string; bg: string; dot: string; badge: string; badgeText: string }
> = {
  neutral: {
    border: 'border-sky-500/30 hover:border-sky-500/55',
    bg: 'bg-sky-500/5 hover:bg-sky-500/10',
    dot: 'bg-sky-400 shadow-sky-500/50',
    badge: 'border-sky-500/30 bg-sky-950/40 text-sky-400',
    badgeText: 'Info',
  },
  allow: {
    border: 'border-emerald-500/30 hover:border-emerald-500/55',
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
    dot: 'bg-emerald-400 shadow-emerald-500/50',
    badge: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400',
    badgeText: 'Allow / Trusted',
  },
  caution: {
    border: 'border-amber-500/30 hover:border-amber-500/55',
    bg: 'bg-amber-500/5 hover:bg-amber-500/10',
    dot: 'bg-amber-400 shadow-amber-500/50',
    badge: 'border-amber-500/30 bg-amber-950/40 text-amber-400',
    badgeText: 'Caution / Probe',
  },
  stop: {
    border: 'border-rose-500/30 hover:border-rose-500/55',
    bg: 'bg-rose-500/5 hover:bg-rose-500/10',
    dot: 'bg-rose-400 shadow-rose-500/50',
    badge: 'border-rose-500/30 bg-rose-950/40 text-rose-400',
    badgeText: 'Block / Boundary',
  },
};

export const AcademyLessonViewer: React.FC<AcademyLessonViewerProps> = ({
  module,
  lesson,
}) => {
  const [practiceMode, setPracticeMode] = React.useState<'workbench' | 'assessment'>(
    'workbench'
  );
  const workbenchConfig = React.useMemo(
    () => getWorkbenchConfigForLesson(lesson),
    [lesson]
  );

  const currentIndex = module.lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = currentIndex > 0 ? module.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < module.lessons.length - 1 ? module.lessons[currentIndex + 1] : null;

  // Left Panel Content: Theory, Walkthrough Steps, Mental Model, Governance
  const leftPanelContent = (
    <div className="space-y-6">
      <Link
        href={academyModuleHref(module)}
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {module.title}
      </Link>

      {/* Hero Briefing Card */}
      <Card className="glass-card relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500" />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info" className="text-[10px] uppercase">
              Lesson {String(currentIndex + 1).padStart(2, '0')} · {lesson.difficulty}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              {lesson.durationMinutes} phút
            </span>
            <Badge variant="success" className="text-[9px] uppercase">
              {lesson.safetyLevel}
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              {lesson.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                  Core mental model
                </span>
                <p className="text-foreground text-xs leading-relaxed font-medium">
                  {lesson.mentalModel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Outcomes */}
      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-extrabold">
          Sau bài này bạn làm được gì?
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {lesson.outcomes.map((outcome) => (
            <Card key={outcome} className="glass-card flex items-start gap-2.5 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-foreground text-xs leading-5">{outcome}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Visual Sequence: Connected Vertical Cyber Pipeline */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-sm font-extrabold">
              <Scale className="text-primary h-4 w-4" />
              {lesson.visual.title}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {lesson.visual.caption}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            {lesson.visual.steps.length} Bước Trình Tự
          </Badge>
        </div>

        <Card className="glass-card p-4 sm:p-5">
          <div className="relative space-y-3.5">
            {/* Vertical glowing circuit connector line */}
            <div className="absolute top-4 bottom-4 left-[18px] w-[2px] rounded-full bg-gradient-to-b from-sky-500/50 via-emerald-500/50 to-cyan-500/20" />

            {lesson.visual.steps.map((step, index) => {
              const tone = VISUAL_TONE_CONFIG[step.tone];
              return (
                <div key={step.label} className="group relative flex items-start gap-3.5">
                  {/* Step Node Icon */}
                  <div
                    className={`bg-card/95 relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-black shadow-xs transition-all duration-200 group-hover:scale-105 ${tone.border} ${tone.bg}`}
                  >
                    <span className="text-foreground font-mono text-[11px] font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`border-card absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border shadow-xs ${tone.dot}`}
                    />
                  </div>

                  {/* Step Content Card */}
                  <div
                    className={`group-hover:border-primary/40 group-hover:bg-primary/5 flex-1 rounded-xl border p-3 transition-all duration-200 ${tone.border} ${tone.bg}`}
                  >
                    <div className="border-border/40 flex flex-wrap items-center justify-between gap-2 border-b pb-1.5">
                      <div className="text-foreground text-xs font-extrabold tracking-tight">
                        {step.label}
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[8.5px] font-bold tracking-wider uppercase ${tone.badge}`}
                      >
                        {tone.badgeText}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed font-medium">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Governance & Misconceptions */}
      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-extrabold">Governance & Ranh Giới</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <GovernanceCard
            title="Ngăn chặn & Ranh giới (Prevent)"
            items={lesson.governance.prevent}
            icon="shield"
          />
          <GovernanceCard
            title="Quan sát & Giám sát (Observe)"
            items={lesson.governance.observe}
            icon="eye"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-extrabold">
          <TriangleAlert className="h-4 w-4 text-amber-500" />
          Những ngộ nhận dễ gây sai phạm
        </h2>
        <div className="space-y-2">
          {lesson.misconceptions.map((item) => (
            <Card key={item.claim} className="glass-card space-y-1.5 p-3">
              <p className="text-destructive text-xs font-bold">“{item.claim}”</p>
              <p className="text-muted-foreground text-[11.5px] leading-5">
                {item.correction}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Transfer Challenge */}
      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-extrabold">Transfer Challenge</h2>
        <Card className="glass-card space-y-3 p-4">
          <p className="text-foreground text-xs leading-relaxed font-medium">
            {lesson.transferChallenge.scenario}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <ListBlock title="Nhiệm vụ" items={lesson.transferChallenge.tasks} />
            <ListBlock
              title="Evidence phải nộp"
              items={lesson.transferChallenge.requiredEvidence}
            />
          </div>
        </Card>
      </section>

      {/* Footer lesson navigation */}
      <div className="border-border/50 flex flex-col justify-between gap-2.5 border-t pt-4 sm:flex-row">
        {previousLesson ? (
          <Link href={academyLessonHref(module, previousLesson.slug)}>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 text-xs sm:w-auto"
            >
              <ArrowLeft className="h-3 w-3" />
              {previousLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link href={academyLessonHref(module, nextLesson.slug)}>
            <Button size="sm" className="w-full gap-1 text-xs sm:w-auto">
              {nextLesson.title}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Link href={academyModuleHref(module)}>
            <Button variant="outline" size="sm" className="text-xs">
              Hoàn tất module
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  // Right Panel Content: Workbench / Assessment View
  const rightPanelContent = (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-base font-extrabold tracking-tight">
            <Zap className="h-4 w-4 text-emerald-500" />
            Thực Hành Tác Chiến
          </h2>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            Chuyển đổi giữa Phòng Thực Hành Tác Chiến (Interactive Workbench) và Kiểm Tra
            Quyết Định (Decision Lab).
          </p>
        </div>

        <div className="border-border/80 bg-secondary/40 flex items-center rounded-xl border p-1">
          <button
            type="button"
            onClick={() => setPracticeMode('workbench')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              practiceMode === 'workbench'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="h-3 w-3" />
            🚀 Interactive Workbench
          </button>
          <button
            type="button"
            onClick={() => setPracticeMode('assessment')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              practiceMode === 'assessment'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scale className="h-3 w-3" />
            📋 Decision Lab & Quiz
          </button>
        </div>
      </div>

      {practiceMode === 'workbench' && workbenchConfig ? (
        <AcademyLiveWorkbench config={workbenchConfig} />
      ) : (
        <AcademyAssessment lesson={lesson} />
      )}
    </div>
  );

  return (
    <article className="w-full">
      <ResizableSplitWorkspace
        title={lesson.title}
        difficulty={lesson.difficulty}
        tactic={lesson.attackTactics?.[0]}
        totalObjectives={workbenchConfig?.objectives.length || 0}
        leftContent={leftPanelContent}
        rightContent={rightPanelContent}
      />
    </article>
  );
};

function GovernanceCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: 'shield' | 'eye' | 'respond' | 'risk';
}) {
  const Icon =
    icon === 'eye'
      ? Eye
      : icon === 'respond'
        ? RotateCcw
        : icon === 'risk'
          ? TriangleAlert
          : ShieldCheck;
  return (
    <Card className="glass-card space-y-2 p-3">
      <h3 className="text-foreground flex items-center gap-1.5 text-[11px] font-extrabold uppercase">
        <Icon className="text-primary h-3.5 w-3.5" />
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-muted-foreground text-[11px] leading-4">
            • {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-secondary/35 rounded-xl p-3">
      <h3 className="text-foreground text-[11px] font-extrabold uppercase">{title}</h3>
      <ul className="mt-1.5 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-muted-foreground text-[11px] leading-4">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
