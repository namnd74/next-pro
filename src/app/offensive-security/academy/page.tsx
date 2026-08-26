import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FolderTree, GraduationCap } from 'lucide-react';
import {
  ACADEMY_MODULES,
  academyModuleHref,
  groupAcademyModulesByTrack,
} from '@/features/offensive-security';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Offensive Security Academy | NextPro',
  description: 'Core curriculum và các specialization của Offensive Security Academy.',
};

export default function OffensiveSecurityAcademyPage() {
  const groups = groupAcademyModulesByTrack(ACADEMY_MODULES);
  const totalLessons = ACADEMY_MODULES.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );

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

      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-extrabold">
            <FolderTree className="text-primary h-5 w-5" />
            Curriculum tree
          </h2>
          <Badge variant="success" className="text-[10px] uppercase">
            {ACADEMY_MODULES.length} modules · {totalLessons} lessons
          </Badge>
        </div>

        {groups.map((group) => (
          <div key={group.track.id} className="space-y-3">
            <div className="border-border/60 flex flex-wrap items-center gap-2 border-b pb-2">
              <h3 className="text-foreground text-sm font-extrabold tracking-wide uppercase">
                {group.track.title}
              </h3>
              <code className="text-muted-foreground text-[11px]">{group.track.id}</code>
              <Badge variant="info" className="text-[9px] uppercase">
                {group.modules.length} modules ·{' '}
                {group.modules.reduce((sum, module) => sum + module.lessons.length, 0)}{' '}
                lessons
              </Badge>
            </div>

            {group.modules.map((module) => (
              <Link
                key={module.id}
                href={academyModuleHref(module)}
                className="group block"
              >
                <Card className="glass-card glass-card-hover flex items-start justify-between gap-4 p-5 sm:p-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-foreground group-hover:text-primary text-base font-extrabold transition-colors">
                        {module.title}
                      </h4>
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
          </div>
        ))}
      </section>
    </div>
  );
}
