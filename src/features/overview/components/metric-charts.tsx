'use client';

import * as React from 'react';
import { ActivityLog } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Terminal, Box } from 'lucide-react';

interface MetricChartsProps {
  activities?: ActivityLog[];
}

export function MetricCharts({ activities = [] }: MetricChartsProps) {
  const stackItems = [
    {
      name: 'Next.js 15 (App Router)',
      desc: 'RSC, Server Actions, Dynamic Routes',
      tag: 'Framework',
    },
    {
      name: 'shadcn/ui & TailwindCSS',
      desc: 'Design tokens, HSL themes, Lucide icons',
      tag: 'UI / Design',
    },
    {
      name: 'TanStack React Query v5',
      desc: 'Caching, Garbage Collection, Suspense',
      tag: 'Server State',
    },
    {
      name: 'Axios Client',
      desc: 'Typed Interceptors, safeRequest Result pattern',
      tag: 'HTTP',
    },
    {
      name: 'Zustand 5',
      desc: 'Global persistent store with TypeScript types',
      tag: 'Client State',
    },
    {
      name: 'ESLint & Prettier',
      desc: 'Flat/Next standards + Tailwind automatic sorting',
      tag: 'Code Quality',
    },
    {
      name: 'Husky & lint-staged',
      desc: 'Git pre-commit hooks enforcing quality gates',
      tag: 'CI/CD Gate',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Tech Stack Matrix */}
      <Card glass className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Box className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Integrated Architecture Matrix</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              7/7 Core Modules
            </Badge>
          </div>
          <CardDescription>
            All requested enterprise libraries configured and ready for production
            expansion.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stackItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-border/50 bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/70"
              >
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-2 flex justify-end border-t border-border/30 pt-2">
                  <Badge variant="secondary" className="px-2 py-0 text-[10px]">
                    {item.tag}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
                <Terminal className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">System Events</CardTitle>
            </div>
            <div className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          </div>
          <CardDescription>Bootstrap audit logs and telemetry stream.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs">
                <div className="mt-0.5 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium leading-snug text-foreground">{act.action}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{act.actor}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {act.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No recent events
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
