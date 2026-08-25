import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Crosshair, Target } from 'lucide-react';
import {
  OFFENSIVE_SECURITY_COLLECTIONS,
  getCollectionBySlug,
  getMissionsByCollectionSlug,
  MissionTabsView,
} from '@/features/offensive-security';
import { Badge } from '@/components/ui/badge';

interface OffensiveSecurityMissionPageProps {
  params: Promise<{
    collectionSlug: string;
    missionSlug: string;
  }>;
}

export function generateStaticParams() {
  return OFFENSIVE_SECURITY_COLLECTIONS.flatMap((collection) =>
    getMissionsByCollectionSlug(collection.slug).map((mission) => ({
      collectionSlug: collection.slug,
      missionSlug: mission.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: OffensiveSecurityMissionPageProps): Promise<Metadata> {
  const { collectionSlug, missionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  const mission = getMissionBySlugSafe(collectionSlug, missionSlug);
  if (!collection || !mission)
    return { title: 'Mission Not Found | NextPro Offensive Security' };

  return {
    title: `${mission.title} | NextPro Offensive Security`,
    description: mission.summary,
  };
}

function getMissionBySlugSafe(collectionSlug: string, missionSlug: string) {
  return getMissionsByCollectionSlug(collectionSlug).find((m) => m.slug === missionSlug);
}

export default async function OffensiveSecurityMissionPage({
  params,
}: OffensiveSecurityMissionPageProps) {
  const { collectionSlug, missionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  const mission = getMissionBySlugSafe(collectionSlug, missionSlug);

  // Collection RT đứng độc lập — KHÔNG cần track tương ứng ở /learn để tồn tại
  if (!collection || !mission) {
    notFound();
  }

  const allMissions = getMissionsByCollectionSlug(collection.slug);
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
          href={`/offensive-security/${collection.slug}`}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{collection.title}</span>
        </Link>
      </div>

      {/* Mission Header */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Crosshair className="text-destructive h-4 w-4" />
          <Badge variant="destructive" className="text-[10px] tracking-wider uppercase">
            Offensive Security Mission
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase">
            {mission.difficulty}
          </Badge>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />~{mission.estimatedMinutes} phút
          </span>
          <span className="text-muted-foreground flex items-center gap-1 font-mono text-[10px]">
            <Target className="h-3 w-3" />
            {mission.vectorIds.length} vector
          </span>
        </div>
        <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
          {mission.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          {mission.summary}
        </p>
      </section>

      {/* Tabbed content: Briefing | Attack Lab | Defense */}
      <MissionTabsView collection={collection} mission={mission} />

      {/* Next mission footer */}
      {nextMission && (
        <div className="border-border/40 flex justify-end border-t pt-5">
          <Link href={`/offensive-security/${collection.slug}/${nextMission.slug}`}>
            <span className="bg-destructive hover:bg-destructive/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-500/25 transition-colors">
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
