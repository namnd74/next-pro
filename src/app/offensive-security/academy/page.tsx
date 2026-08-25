import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { ACADEMY_MODULES } from '@/features/offensive-security';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Offensive Security Academy | NextPro',
  description: 'Core curriculum và các specialization của Offensive Security Academy.',
};

export default function OffensiveSecurityAcademyPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Badge variant="info" className="gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" />
          Core curriculum
        </Badge>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Offensive Security <span className="text-primary">Academy</span>
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-7 sm:text-base">
          Bắt đầu bằng authority và safety trước khi học network, Linux, Windows và các
          specialization. Nội dung cũ vẫn tồn tại như firing range trong thời gian
          migration.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-extrabold">Module đã phát hành</h2>
        {ACADEMY_MODULES.map((module) => (
          <Link
            key={module.id}
            href={`/offensive-security/academy/${module.slug}`}
            className="group block"
          >
            <Card className="glass-card glass-card-hover flex items-start justify-between gap-4 p-5 sm:p-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground group-hover:text-primary text-base font-extrabold transition-colors">
                    {module.title}
                  </h3>
                  <Badge variant="success" className="text-[9px] uppercase">
                    {module.lessons.length} lessons
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-6">
                  {module.summary}
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
