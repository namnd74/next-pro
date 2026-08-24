import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Crosshair,
  BookOpen,
  Target,
} from 'lucide-react';
import {
  RED_TEAM_SCENARIOS,
  getRedTeamScenarioByTrackSlug,
  getMissionsByTrackSlug,
  MissionTabsView,
} from '@/features/red-team';
import { MOCK_LEARNING_TRACKS } from '@/features/learning';
import { Badge } from '@/components/ui/badge';

interface RedTeamMissionPageProps {
  params: Promise<{
    trackSlug: string;
    missionSlug: string;
  }>;
}

export function generateStaticParams() {
  return RED_TEAM_SCENARIOS.flatMap((scenario) =>
    getMissionsByTrackSlug(scenario.trackSlug).map((mission) => ({
      trackSlug: scenario.trackSlug,
      missionSlug: mission.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: RedTeamMissionPageProps): Promise<Metadata> {
  const { trackSlug, missionSlug } = await params;
  const scenario = getRedTeamScenarioByTrackSlug(trackSlug);
  const mission = getMissionBySlugSafe(trackSlug, missionSlug);
  if (!scenario || !mission) return { title: 'Mission Not Found | NextPro Red Team' };

  return {
    title: `${mission.title} | NextPro Red Team`,
    description: mission.summary,
  };
}

function getMissionBySlugSafe(trackSlug: string, missionSlug: string) {
  return getMissionsByTrackSlug(trackSlug).find((m) => m.slug === missionSlug);
}

export default async function RedTeamMissionPage({ params }: RedTeamMissionPageProps) {
  const { trackSlug, missionSlug } = await params;
  const scenario = getRedTeamScenarioByTrackSlug(trackSlug);
  const track = MOCK_LEARNING_TRACKS.find((t) => t.slug === trackSlug);
  const mission = getMissionBySlugSafe(trackSlug, missionSlug);

  if (!scenario || !track || !mission) {
    notFound();
  }

  const allMissions = getMissionsByTrackSlug(trackSlug);
  const currentIndex = allMissions.findIndex((m) => m.id === mission.id);
  const nextMission =
    currentIndex >= 0 && currentIndex < allMissions.length - 1
      ? allMissions[currentIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/rt/${scenario.trackSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{track.title}</span>
        </Link>

        <Link
          href={`/learn/${track.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Lý thuyết nền tại /learn</span>
        </Link>
      </div>

      {/* Mission Header */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Crosshair className="h-4 w-4 text-destructive" />
          <Badge variant="destructive" className="text-[10px] uppercase tracking-wider">
            Red Team Mission
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase">
            {mission.difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />~{mission.estimatedMinutes} phút
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Target className="h-3 w-3" />
            {mission.vectorIds.length} vector
          </span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {mission.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {mission.summary}
        </p>
      </section>

      {/* Tabbed content: Briefing | Attack Lab | Defense */}
      <MissionTabsView track={track} mission={mission} scenario={scenario} />

      {/* Next mission footer */}
      {nextMission && (
        <div className="flex justify-end border-t border-border/40 pt-5">
          <Link href={`/rt/${track.slug}/${nextMission.slug}`}>
            <span className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-500/25 transition-colors hover:bg-destructive/90">
              <span>
                Mission kế:{' '}
                {nextMission.title.length > 44
                  ? nextMission.title.slice(0, 44) + '…'
                  : nextMission.title}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
