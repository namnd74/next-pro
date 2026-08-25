import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Crosshair } from 'lucide-react';
import {
  OFFENSIVE_SECURITY_COLLECTIONS,
  getCollectionBySlug,
  getMissionsByCollectionSlug,
  getPhaseById,
  OffensiveSecurityConsole,
  UiDemoStage,
} from '@/features/offensive-security';
import { Card } from '@/components/ui/card';

interface OffensiveSecurityCollectionPageProps {
  params: Promise<{
    collectionSlug: string;
  }>;
}

export function generateStaticParams() {
  return OFFENSIVE_SECURITY_COLLECTIONS.map((collection) => ({
    collectionSlug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: OffensiveSecurityCollectionPageProps): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) return { title: 'Target Not Found | NextPro Offensive Security' };

  return {
    title: `${collection.title} | NextPro`,
    description: collection.tagline,
  };
}

export default async function OffensiveSecurityCollectionPage({
  params,
}: OffensiveSecurityCollectionPageProps) {
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
          href="/offensive-security"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại Offensive Security Academy</span>
        </Link>
      </div>

      {/* Phase context */}
      {phase && (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-lg bg-gradient-to-r ${phase.color} px-2 py-0.5 font-mono text-[10px] font-extrabold tracking-widest text-white uppercase shadow`}
          >
            Phase {String(phase.order).padStart(2, '0')}
          </span>
          <span className="text-foreground text-xs font-bold">{phase.title}</span>
          <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
            {phase.subtitle}
          </span>
        </div>
      )}

      {/* Missions quick strip */}
      {missions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-tight">
            <Crosshair className="text-destructive h-4 w-4" />
            Chiến dịch của chủ đề này ({missions.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {missions.map((mission) => (
              <Link
                key={mission.id}
                href={`/offensive-security/${collection.slug}/${mission.slug}`}
                className="group"
              >
                <Card className="glass-card glass-card-hover flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                      {mission.title}
                    </p>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                      ~{mission.estimatedMinutes} min · {mission.vectorIds.length} vector
                      · {mission.difficulty}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-destructive h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Attack Simulation Console */}
      <OffensiveSecurityConsole collection={collection} />

      {/* Interactive UI Demo */}
      <UiDemoStage collectionSlug={collection.slug} />
    </div>
  );
}
