import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Crosshair,
} from 'lucide-react';
import {
  RED_TEAM_SCENARIOS,
  getRedTeamScenarioByTrackSlug,
  getMissionsByTrackSlug,
  RedTeamConsole,
  UiDemoStage,
} from '@/features/red-team';
import { MOCK_LEARNING_TRACKS } from '@/features/learning';
import { Card } from '@/components/ui/card';

interface RedTeamTrackPageProps {
  params: Promise<{
    trackSlug: string;
  }>;
}

export function generateStaticParams() {
  return RED_TEAM_SCENARIOS.map((scenario) => ({
    trackSlug: scenario.trackSlug,
  }));
}

export async function generateMetadata({
  params,
}: RedTeamTrackPageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const scenario = getRedTeamScenarioByTrackSlug(trackSlug);
  if (!scenario) return { title: 'Target Not Found | NextPro Red Team' };

  return {
    title: `${scenario.title} | NextPro`,
    description: scenario.tagline,
  };
}

export default async function RedTeamTrackPage({ params }: RedTeamTrackPageProps) {
  const { trackSlug } = await params;
  const scenario = getRedTeamScenarioByTrackSlug(trackSlug);
  if (!scenario) {
    notFound();
  }

  const track = MOCK_LEARNING_TRACKS.find((t) => t.slug === scenario.trackSlug);
  const missions = getMissionsByTrackSlug(scenario.trackSlug);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/rt"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại Red Team Ops</span>
        </Link>

        {track && (
          <Link
            href={`/learn/${track.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Học lý thuyết tại /learn</span>
          </Link>
        )}
      </div>

      {/* Missions quick strip */}
      {missions.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
            <Crosshair className="h-4 w-4 text-destructive" />
            Chiến dịch của chủ đề này ({missions.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {missions.map((mission) => (
              <Link
                key={mission.id}
                href={`/rt/${scenario.trackSlug}/${mission.slug}`}
                className="group"
              >
                <Card className="glass-card glass-card-hover flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                      {mission.title}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      ~{mission.estimatedMinutes} min · {mission.vectorIds.length}{' '}
                      vector · {mission.difficulty}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-destructive" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Attack Simulation Console */}
      <RedTeamConsole scenario={scenario} />

      {/* Interactive UI Demo */}
      <UiDemoStage trackSlug={scenario.trackSlug} />
    </div>
  );
}
