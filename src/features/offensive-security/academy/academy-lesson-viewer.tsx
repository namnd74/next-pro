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
  TriangleAlert,
} from 'lucide-react';
import { AcademyAssessment } from './academy-assessment';
import type { AcademyLesson, AcademyModule, AcademyVisualStep } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AcademyLessonViewerProps {
  module: AcademyModule;
  lesson: AcademyLesson;
}

const VISUAL_TONE: Record<AcademyVisualStep['tone'], string> = {
  neutral: 'border-sky-500/30 bg-sky-500/5',
  allow: 'border-emerald-500/35 bg-emerald-500/10',
  caution: 'border-amber-500/35 bg-amber-500/10',
  stop: 'border-destructive/35 bg-destructive/10',
};

export function AcademyLessonViewer({ module, lesson }: AcademyLessonViewerProps) {
  const currentIndex = module.lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = currentIndex > 0 ? module.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < module.lessons.length - 1 ? module.lessons[currentIndex + 1] : null;

  return (
    <article className="space-y-8">
      <Link
        href={`/offensive-security/academy/${module.slug}`}
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
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-lg font-extrabold">
            <Scale className="text-primary h-5 w-5" />
            {lesson.visual.title}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">{lesson.visual.caption}</p>
        </div>
        <Card className="glass-card p-4 sm:p-5">
          <div className="grid gap-2 lg:grid-cols-5">
            {lesson.visual.steps.map((step, index) => (
              <div key={step.label} className="flex items-stretch gap-2 lg:block">
                <div className={`h-full rounded-xl border p-3 ${VISUAL_TONE[step.tone]}`}>
                  <span className="text-muted-foreground font-mono text-[9px]">
                    STEP {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-foreground mt-1 text-xs font-extrabold">
                    {step.label}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-[11px] leading-5">
                    {step.detail}
                  </p>
                </div>
                {index < lesson.visual.steps.length - 1 && (
                  <ArrowRight className="text-muted-foreground/50 my-auto h-4 w-4 shrink-0 lg:mx-auto lg:my-2 lg:rotate-90" />
                )}
              </div>
            ))}
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

      <AcademyAssessment lesson={lesson} />

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
          <Link
            href={`/offensive-security/academy/${module.slug}/${previousLesson.slug}`}
          >
            <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="h-3.5 w-3.5" />
              {previousLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link href={`/offensive-security/academy/${module.slug}/${nextLesson.slug}`}>
            <Button size="sm" className="w-full gap-2 sm:w-auto">
              {nextLesson.title}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Link href={`/offensive-security/academy/${module.slug}`}>
            <Button variant="outline" size="sm">
              Hoàn tất module
            </Button>
          </Link>
        )}
      </div>
    </article>
  );
}

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
