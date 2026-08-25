import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Clock, Scale, ShieldCheck } from 'lucide-react';
import type { AcademyModule } from './types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function AcademyModuleOverview({ module }: { module: AcademyModule }) {
  return (
    <div className="space-y-8">
      <Card className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500" />
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info" className="text-[10px] uppercase">
              Core · Module 00.1
            </Badge>
            <Badge variant="success" className="gap-1 text-[10px] uppercase">
              <ShieldCheck className="h-3 w-3" />
              Safe browser labs
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              {module.estimatedMinutes} phút
            </span>
          </div>

          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md sm:flex">
              <Scale className="h-6 w-6" />
            </span>
            <div className="space-y-2">
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                {module.title}
              </h1>
              <p className="text-muted-foreground max-w-3xl text-sm leading-7 sm:text-base">
                {module.summary}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-lg font-extrabold">
            <BookOpenCheck className="text-primary h-5 w-5" />
            Ba bài trong batch đầu tiên
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Học theo thứ tự. Mỗi bài chỉ hoàn thành khi pass decision lab và quiz.
          </p>
        </div>

        <div className="grid gap-4">
          {module.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/offensive-security/academy/${module.slug}/${lesson.slug}`}
              className="group"
            >
              <Card className="glass-card glass-card-hover flex items-start gap-4 p-5 sm:p-6">
                <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-foreground group-hover:text-primary text-sm font-extrabold transition-colors sm:text-base">
                      {lesson.title}
                    </h3>
                    <Badge variant="outline" className="text-[9px] uppercase">
                      {lesson.difficulty}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {lesson.durationMinutes} phút
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-6">
                    {lesson.summary}
                  </p>
                  <p className="text-muted-foreground/75 font-mono text-[10px]">
                    {lesson.lab.cases.length} decision cases · {lesson.quiz.length} quiz ·{' '}
                    {lesson.sources.length} nguồn
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
