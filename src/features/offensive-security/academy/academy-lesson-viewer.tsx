'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
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

const getGridColsClass = (stepCount: number): string => {
  switch (stepCount) {
    case 1:
      return 'grid-cols-1 max-w-xl mx-auto';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 md:grid-cols-3';
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    case 5:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';
    case 6:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
    default:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  }
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

  return (
    <article className="space-y-8">
      <Link
        href={academyModuleHref(module)}
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {module.title}
      </Link>

      <Card className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500" />
        <div className="space-y-5">
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
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm leading-7 sm:text-base">
              {lesson.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                  Core mental model
                </span>
                <p className="text-foreground text-sm leading-7 font-medium">
                  {lesson.mentalModel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-foreground text-lg font-extrabold">
          Sau bài này bạn làm được gì?
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {lesson.outcomes.map((outcome) => (
            <Card key={outcome} className="glass-card flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-foreground text-sm leading-6">{outcome}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-lg font-extrabold">
              <Scale className="text-primary h-5 w-5" />
              {lesson.visual.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">{lesson.visual.caption}</p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {lesson.visual.steps.length} Bước Trình Tự
          </Badge>
        </div>
        <Card className="glass-card p-4 sm:p-6">
          <div
            className={`grid gap-3 sm:gap-4 ${getGridColsClass(lesson.visual.steps.length)}`}
          >
            {lesson.visual.steps.map((step, index) => {
              const tone = VISUAL_TONE_CONFIG[step.tone];
              return (
                <div
                  key={step.label}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${tone.border} ${tone.bg}`}
                >
                  <div className="space-y-3">
                    <div className="border-border/40 flex items-center justify-between border-b pb-2.5">
                      <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] font-bold">
                        <span className={`h-2 w-2 rounded-full shadow-xs ${tone.dot}`} />
                        <span>STEP {String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${tone.badge}`}
                      >
                        {tone.badgeText}
                      </span>
                    </div>

                    <h3 className="text-foreground text-xs leading-snug font-extrabold">
                      {step.label}
                    </h3>
                    <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-extrabold">Giải thích cơ chế</h2>
        {lesson.sections.map((section) => (
          <Card key={section.title} className="glass-card space-y-4 p-5 sm:p-6">
            <h3 className="text-foreground text-base font-extrabold">{section.title}</h3>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground text-sm leading-7">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.points && (
              <ul className="border-primary/30 space-y-2 border-l-2 pl-4">
                {section.points.map((point) => (
                  <li key={point} className="text-foreground text-sm leading-6">
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-extrabold">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          Governance: prevent → observe → respond
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <GovernanceCard
            title="Prevent"
            items={lesson.governance.prevent}
            icon="shield"
          />
          <GovernanceCard title="Observe" items={lesson.governance.observe} icon="eye" />
          <GovernanceCard
            title="Respond"
            items={lesson.governance.respond}
            icon="respond"
          />
          <GovernanceCard
            title="Residual risk"
            items={lesson.governance.residualRisk}
            icon="risk"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-extrabold">
          <TriangleAlert className="h-5 w-5 text-amber-500" />
          Những ngộ nhận dễ gây sai phạm
        </h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {lesson.misconceptions.map((item) => (
            <Card key={item.claim} className="glass-card space-y-3 p-4">
              <p className="text-destructive text-xs font-bold">“{item.claim}”</p>
              <p className="text-muted-foreground text-xs leading-6">{item.correction}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Practical Practice Navigation: Live Workbench vs Assessment Mode */}
      <section className="space-y-4 pt-2">
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <Zap className="h-5 w-5 text-emerald-500" />
              Thực hành & Kiểm tra Năng lực
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Chuyển đổi giữa phòng Lab thực thi thật (Live WASM Workbench) và Kiểm tra lý
              thuyết ra quyết định (Decision Matrix).
            </p>
          </div>

          <div className="border-border/80 bg-secondary/40 flex items-center rounded-2xl border p-1">
            <button
              type="button"
              onClick={() => setPracticeMode('workbench')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                practiceMode === 'workbench'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              🚀 Live Real-Workbench
            </button>
            <button
              type="button"
              onClick={() => setPracticeMode('assessment')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                practiceMode === 'assessment'
                  ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              📋 Decision Lab & Quiz
            </button>
          </div>
        </div>

        {practiceMode === 'workbench' && workbenchConfig ? (
          <AcademyLiveWorkbench config={workbenchConfig} />
        ) : (
          <AcademyAssessment lesson={lesson} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-extrabold">Transfer challenge</h2>
        <Card className="glass-card space-y-5 p-5 sm:p-6">
          <p className="text-foreground text-sm leading-7 font-medium">
            {lesson.transferChallenge.scenario}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <ListBlock title="Nhiệm vụ" items={lesson.transferChallenge.tasks} />
            <ListBlock
              title="Evidence phải nộp"
              items={lesson.transferChallenge.requiredEvidence}
            />
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-foreground text-lg font-extrabold">Nguồn kiểm chứng</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Nguồn chính thức trực tiếp hỗ trợ các định nghĩa và boundary trong bài.
            </p>
          </div>
          <Badge variant="outline">{lesson.sources.length} nguồn</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {lesson.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="border-border/60 bg-card/60 hover:border-primary/40 hover:bg-primary/5 group rounded-2xl border p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] uppercase">
                      {source.sourceType.replace('official-', '')}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-[9px]">
                      {source.publisher} · {source.accessedAt}
                    </span>
                  </div>
                  <h3 className="text-foreground group-hover:text-primary text-sm font-bold">
                    {source.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-6">
                    {source.supports.join(' · ')}
                  </p>
                </div>
                <ExternalLink className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="border-border/50 flex flex-col justify-between gap-3 border-t pt-6 sm:flex-row">
        {previousLesson ? (
          <Link href={academyLessonHref(module, previousLesson.slug)}>
            <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="h-3.5 w-3.5" />
              {previousLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link href={academyLessonHref(module, nextLesson.slug)}>
            <Button size="sm" className="w-full gap-2 sm:w-auto">
              {nextLesson.title}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Link href={academyModuleHref(module)}>
            <Button variant="outline" size="sm">
              Hoàn tất module
            </Button>
          </Link>
        )}
      </div>
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
    <Card className="glass-card space-y-3 p-4">
      <h3 className="text-foreground flex items-center gap-2 text-xs font-extrabold uppercase">
        <Icon className="text-primary h-4 w-4" />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-muted-foreground text-xs leading-5">
            • {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-secondary/35 rounded-xl p-4">
      <h3 className="text-foreground text-xs font-extrabold uppercase">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-muted-foreground text-xs leading-5">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
