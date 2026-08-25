import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
} from 'lucide-react';
import {
  RED_TEAM_COLLECTIONS,
  getCollectionBySlug,
  getMissionsByCollectionSlug,
  getPhaseById,
  RedTeamConsole,
  UiDemoStage,
} from '@/features/red-team';
import { Card } from '@/components/ui/card';

interface RedTeamCollectionPageProps {
  params: Promise<{
    collectionSlug: string;
  }>;
}

export function generateStaticParams() {
  return RED_TEAM_COLLECTIONS.map((collection) => ({
    collectionSlug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: RedTeamCollectionPageProps): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) return { title: 'Target Not Found | NextPro Red Team' };

  return {
    title: `${collection.title} | NextPro`,
    description: collection.tagline,
  };
}

export default async function RedTeamCollectionPage({
  params,
}: RedTeamCollectionPageProps) {
  const { collectionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) {
    notFound();
  }

  const missions = getMissionsByCollectionSlug(collection.slug);
  const phase = getPhaseById(collection.phaseId);

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
      </div>

      {/* Phase context */}
      {phase && (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-lg bg-gradient-to-r ${phase.color} px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-widest text-white shadow`}
          >
            Phase {String(phase.order).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold text-foreground">{phase.title}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {phase.subtitle}
          </span>
        </div>
      )}

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
                href={`/rt/${collection.slug}/${mission.slug}`}
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
      <RedTeamConsole collection={collection} />

      {/* Interactive UI Demo */}
      <UiDemoStage collectionSlug={collection.slug} />
    </div>
  );
}
