'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  Code2,
  Crosshair,
  Database,
  Flame,
  KeyRound,
  Layers,
  Lock,
  Radar,
  RotateCcw,
  Shield,
  ShieldCheck,
  Syringe,
  Timer,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { ACADEMY_MODULES } from '../academy/academy-loader';
import { OFFENSIVE_SECURITY_COLLECTIONS } from '../data/collection-loader';
import { getCollectionsByPhase } from '../data/collection-loader';
import { getMissionsByCollectionSlug } from '../data/collection-loader';
import { OFFENSIVE_SECURITY_PHASES_ORDERED } from '../data/roadmap';
import { useOffensiveSecurityStore } from '../stores/use-offensive-security-store';
import { Badge } from '@/components/ui/badge';

function getTopicIcon(iconName: string) {
  const cls = 'h-4 w-4';
  switch (iconName) {
    case 'Radar':
      return <Radar className={cls} />;
    case 'Syringe':
      return <Syringe className={cls} />;
    case 'KeyRound':
      return <KeyRound className={cls} />;
    case 'Timer':
      return <Timer className={cls} />;
    case 'Boxes':
      return <Boxes className={cls} />;
    case 'ShieldCheck':
      return <ShieldCheck className={cls} />;
    case 'GraduationCap':
      return <GraduationCap className={cls} />;
    case 'Zap':
      return <Zap className={cls} />;
    case 'Flame':
      return <Flame className={cls} />;
    case 'Shield':
      return <Shield className={cls} />;
    case 'Lock':
      return <Lock className={cls} />;
    case 'Database':
      return <Database className={cls} />;
    case 'Layers':
      return <Layers className={cls} />;
    case 'Code':
      return <Code2 className={cls} />;
    default:
      return <Crosshair className={cls} />;
  }
}

type LessonStatus = 'idle' | 'breached' | 'patched';

const STATUS_DOT: Record<LessonStatus, string> = {
  idle: '●',
  breached: '🔴',
  patched: '🛡',
};

function StatusDot({ status }: { status: LessonStatus }) {
  const cls =
    status === 'breached' ? '' : status === 'patched' ? '' : 'text-muted-foreground/40';
  return (
    <span className={`w-4 shrink-0 text-center text-[9px] ${cls}`}>
      {STATUS_DOT[status]}
    </span>
  );
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const activeCollectionSlug = segments[2];
  const activeMissionSlug = segments[3];

  const {
    resetOffensiveSecurityProgress,
    launchedVectorIds,
    patchedVectorIds,
    completedAcademyLessonIds,
  } = useOffensiveSecurityStore();
  const [mounted, setMounted] = React.useState(false);
  const [manualExpanded, setManualExpanded] = React.useState<string[]>([]);

  React.useEffect(() => setMounted(true), []);

  const totalVectors = OFFENSIVE_SECURITY_COLLECTIONS.reduce(
    (acc, s) => acc + s.vectors.length,
    0
  );
  const totalPatched = mounted ? patchedVectorIds.length : 0;
  const totalBreached = mounted ? launchedVectorIds.length : 0;

  const missionStatus = React.useCallback(
    (collectionSlug: string, mission: { vectorIds: string[] }): LessonStatus => {
      if (!mounted) return 'idle';
      if (mission.vectorIds.length === 0) return 'idle';
      const patched = mission.vectorIds.filter((id) =>
        patchedVectorIds.includes(id)
      ).length;
      const breached = mission.vectorIds.some((id) => launchedVectorIds.includes(id));
      return patched === mission.vectorIds.length
        ? 'patched'
        : breached
          ? 'breached'
          : 'idle';
    },
    [mounted, launchedVectorIds, patchedVectorIds]
  );

  const totalAcademyLessons = ACADEMY_MODULES.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pb-4">
      {/* Brand */}
      <Link
        href="/offensive-security"
        onClick={onNavigate}
        className="border-destructive/20 bg-destructive/5 hover:bg-destructive/10 flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md">
          <Crosshair className="h-4 w-4" />
        </span>
        <span className="space-y-0.5">
          <span className="text-foreground block text-sm font-extrabold tracking-tight">
            Offensive Security
          </span>
          <span className="text-muted-foreground block font-mono text-[9px] tracking-widest uppercase">
            attack · defend · master
          </span>
        </span>
      </Link>

      <Link
        href="/offensive-security/academy"
        onClick={onNavigate}
        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
          pathname.startsWith('/offensive-security/academy')
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border/60 bg-secondary/20 text-muted-foreground hover:border-primary/30 hover:text-foreground'
        }`}
      >
        <span className="bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold">Core Academy</span>
          <span className="block font-mono text-[9px] tracking-wide">
            {mounted ? completedAcademyLessonIds.length : 0}/{totalAcademyLessons} bài
            hoàn thành
          </span>
        </span>
      </Link>

      <Link
        href="/offensive-security/arena"
        onClick={onNavigate}
        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
          pathname.startsWith('/offensive-security/arena')
            ? 'border-rose-500/40 bg-rose-500/15 font-bold text-rose-400 shadow-md shadow-rose-900/20'
            : 'border-border/60 text-muted-foreground hover:text-foreground bg-rose-500/5 hover:border-rose-500/30'
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
          <Flame className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block flex items-center gap-1.5 text-xs font-bold text-white">
            Cyber Arena{' '}
            <Badge className="border-rose-500/30 bg-rose-500/20 px-1 py-0 text-[8px] text-rose-400 uppercase">
              0-Day
            </Badge>
          </span>
          <span className="block font-mono text-[9px] tracking-wide text-amber-400">
            Bounty & Leaderboard
          </span>
        </span>
      </Link>

      {/* Roadmap phases */}
      <nav className="space-y-2">
        <p className="text-muted-foreground px-1 font-mono text-[10px] tracking-widest uppercase">
          Practice Range ({OFFENSIVE_SECURITY_COLLECTIONS.length} collections)
        </p>

        {OFFENSIVE_SECURITY_PHASES_ORDERED.map((phase, phaseIdx) => {
          const collections = getCollectionsByPhase(phase.id);
          if (collections.length === 0) return null;
          return (
            <div key={phase.id} className="space-y-1.5">
              {/* Phase header */}
              <div
                className={`bg-background/95 sticky top-0 z-10 flex items-center gap-1.5 rounded-lg px-1 py-1 backdrop-blur ${
                  phaseIdx > 0 ? 'mt-1' : ''
                }`}
              >
                <span className="text-destructive font-mono text-[9px] font-bold tracking-widest uppercase">
                  P{String(phase.order).padStart(2, '0')}
                </span>
                <span className="text-foreground truncate text-[11px] font-bold">
                  {phase.title}
                </span>
              </div>

              {collections.map((collection) => {
                const collectionSlug = collection.slug;
                const isActive = activeCollectionSlug === collectionSlug;
                const expanded = isActive || manualExpanded.includes(collectionSlug);
                const shortTitle = collection.title.replace(/^Red Team:\s*/, '');
                const missions = getMissionsByCollectionSlug(collectionSlug);

                return (
                  <div
                    key={collection.id}
                    className={`overflow-hidden rounded-xl border transition-colors ${
                      isActive
                        ? 'border-destructive/40 bg-destructive/5'
                        : 'border-border/60 bg-secondary/20 hover:border-border'
                    }`}
                  >
                    <div className="flex items-stretch">
                      <Link
                        href={`/offensive-security/${collectionSlug}`}
                        onClick={onNavigate}
                        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-red-500/15 to-orange-500/15 ${
                            isActive ? 'text-destructive' : 'text-muted-foreground'
                          }`}
                        >
                          {getTopicIcon(collection.iconName)}
                        </span>
                        <span
                          className={`truncate text-xs font-semibold ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {shortTitle}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setManualExpanded((prev) =>
                            prev.includes(collectionSlug)
                              ? prev.filter((s) => s !== collectionSlug)
                              : [...prev, collectionSlug]
                          )
                        }
                        aria-label="Toggle missions"
                        className="text-muted-foreground hover:text-foreground shrink-0 px-2 transition-colors"
                      >
                        <Chevron expanded={expanded} />
                      </button>
                    </div>

                    {expanded && missions.length > 0 && (
                      <ul className="border-border/40 space-y-0.5 border-t px-2 py-1.5">
                        <li className="text-muted-foreground px-1 pb-0.5 font-mono text-[9px] tracking-widest uppercase">
                          Missions ({missions.length})
                        </li>
                        {missions.map((mission) => {
                          const st = missionStatus(collectionSlug, mission);
                          const missionActive = activeMissionSlug === mission.slug;
                          const minutesLabel = `${mission.estimatedMinutes}′`;
                          return (
                            <li key={mission.id}>
                              <Link
                                href={`/offensive-security/${collectionSlug}/${mission.slug}`}
                                onClick={onNavigate}
                                className={`flex items-start gap-1.5 rounded-lg px-1.5 py-1 text-[11px] leading-snug transition-colors ${
                                  missionActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                                }`}
                              >
                                <StatusDot status={st} />
                                <span className="min-w-0 flex-1">
                                  <span className="line-clamp-2 block">
                                    {mission.title}
                                  </span>
                                  <span className="text-muted-foreground/70 font-mono text-[9px]">
                                    {minutesLabel} · {mission.vectorIds.length} vector
                                  </span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer stats + reset */}
      <div className="border-border/60 bg-secondary/30 mt-auto space-y-2 rounded-xl border p-3">
        <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
          <span>
            breached:{' '}
            <span className="text-destructive font-bold">
              {totalBreached}/{totalVectors}
            </span>
          </span>
          <span>
            patched:{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {totalPatched}/{totalVectors}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            resetOffensiveSecurityProgress();
            onNavigate?.();
          }}
          className="border-border bg-background/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive flex w-full items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset toàn bộ Ops
        </button>
      </div>
    </div>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
