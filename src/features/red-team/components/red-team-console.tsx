'use client';

import * as React from 'react';
import {
  BookOpen,
  Crosshair,
  GraduationCap,
  ListChecks,
  Skull,
  ShieldCheck,
  Terminal,
  AlertTriangle,
  Play,
  Wrench,
  RotateCcw,
  Target,
} from 'lucide-react';
import { AttackVector, SEVERITY_META } from '../types';
import type { RedTeamCollection, StudyDossier } from '../types';
import { useRedTeamStore } from '../stores/use-red-team-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';

const LOG_LINE_DELAY_MS = 420;

interface AttackVectorCardProps {
  vector: AttackVector;
}

export function AttackVectorCard({ vector }: AttackVectorCardProps) {
  const severity = SEVERITY_META[vector.severity];
  const { launchedVectorIds, patchedVectorIds, launchVector, patchVector } =
    useRedTeamStore();
  const [mounted, setMounted] = React.useState(false);
  const [logLines, setLogLines] = React.useState<string[]>([]);
  const [isLaunching, setIsLaunching] = React.useState(false);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const terminalRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const isBreached = mounted && launchedVectorIds.includes(vector.id);
  const isPatched = mounted && patchedVectorIds.includes(vector.id);

  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logLines]);

  const handleLaunch = () => {
    // Hủy mọi simulation đang chạy trước khi chạy lại
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLogLines([]);
    setIsLaunching(true);

    vector.impactLog.forEach((line, idx) => {
      const timer = setTimeout(() => {
        setLogLines((prev) => [...prev, line]);
        if (idx === vector.impactLog.length - 1) {
          setIsLaunching(false);
          launchVector(vector.id);
        }
      }, LOG_LINE_DELAY_MS * (idx + 1));
      timersRef.current.push(timer);
    });
  };

  const handlePatch = () => {
    patchVector(vector.id);
  };

  return (
    <Card
      className={`glass-card relative space-y-4 overflow-hidden p-5 sm:p-6 ${
        isPatched ? 'border-emerald-500/40' : severity.ring
      }`}
    >
      {isPatched && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      )}

      {/* Vector Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Skull className={`h-4 w-4 ${isPatched ? 'text-emerald-500' : 'text-destructive'}`} />
            <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              {vector.name}
            </h3>
            <Badge variant={severity.badgeVariant} className="text-[10px] tracking-wider">
              {severity.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {vector.category}
            </Badge>
            {isBreached && !isPatched && (
              <Badge variant="destructive" className="animate-pulse text-[10px]">
                BREACHED
              </Badge>
            )}
            {isPatched && (
              <Badge variant="success" className="gap-1 text-[10px]">
                <ShieldCheck className="h-3 w-3" />
                PATCHED
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Target className="h-3 w-3" />
            target: {vector.target}
          </p>
        </div>
      </div>

      {/* Attack Narrative */}
      <p className="text-xs leading-relaxed text-muted-foreground">{vector.story}</p>

      {/* Impact Simulator Terminal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Terminal className="h-3 w-3" />
            Impact Simulator
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLaunch}
            disabled={isLaunching}
            className="gap-1.5 text-[11px] font-bold"
          >
            <Play className="h-3 w-3" />
            {isLaunching ? 'Attacking...' : isBreached ? 'Re-launch Attack' : 'Launch Attack'}
          </Button>
        </div>

        <div
          ref={terminalRef}
          className="max-h-44 min-h-[72px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed shadow-inner"
        >
          {logLines.length === 0 ? (
            <span className="text-slate-500">
              $ awaiting launch order... nhấn &quot;Launch Attack&quot; để mô phỏng hậu quả.
            </span>
          ) : (
            logLines.map((line, idx) => (
              <div
                key={`${idx}-${line}`}
                className={
                  line.startsWith('>') || line.includes('FATAL') || line.includes('CRITICAL')
                    ? 'text-red-400'
                    : line.includes('✓') || line.includes('PATCHED')
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                }
              >
                <span className="mr-2 select-none text-slate-600">$</span>
                {line}
              </div>
            ))
          )}
          {isLaunching && <span className="animate-pulse text-red-400">▊</span>}
        </div>
      </div>

      {/* Blast Radius */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
        <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
          <AlertTriangle className="h-3 w-3" />
          Blast Radius (hậu quả production)
        </span>
        <ul className="space-y-1">
          {vector.blastRadius.map((impact, idx) => (
            <li key={idx} className="text-xs leading-relaxed text-foreground">
              • {impact}
            </li>
          ))}
        </ul>
      </div>

      {/* Payload vs Defense Code */}
      <Tabs defaultValue="payload" className="w-full">
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 p-1">
          <TabsTrigger value="payload" className="px-3 py-1.5 text-xs">
            💉 Attack Payload
          </TabsTrigger>
          <TabsTrigger value="defense" className="px-3 py-1.5 text-xs">
            🛡️ Defense Patch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payload" className="mt-3">
          <CodeBlock code={vector.payloadCode} language="tsx" />
        </TabsContent>

        <TabsContent value="defense" className="mt-3">
          <CodeBlock code={vector.defenseCode} language="tsx" />
        </TabsContent>
      </Tabs>

      {/* Defense Takeaway + Patch Action */}
      <div className="flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-3 sm:flex-row sm:items-center">
        <p className="text-xs italic leading-relaxed text-muted-foreground">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Takeaway: </span>
          {vector.defenseTakeaway}
        </p>
        <Button
          variant={isPatched ? 'ghost' : 'default'}
          size="sm"
          onClick={handlePatch}
          disabled={isPatched || !isBreached}
          className={`shrink-0 gap-1.5 text-xs ${
            isPatched ? 'text-emerald-600 dark:text-emerald-400' : ''
          }`}
        >
          {isPatched ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              Đã vá
            </>
          ) : (
            <>
              <Wrench className="h-3.5 w-3.5" />
              Áp dụng Defense Patch
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Học liệu riêng của collection — lý thuyết nền đọc trước khi bắn.
 * Render tĩnh, không phụ thuộc feature nào khác.
 */
function CollectionDossier({ dossier }: { dossier?: StudyDossier }) {
  if (!dossier) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Học liệu · Lý thuyết nền
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ~{dossier.readingTimeMinutes} min read
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Objectives + Defense principles */}
        <Card className="glass-card space-y-4 p-5">
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              Sau bài học này bạn sẽ
            </span>
            <ul className="space-y-1.5">
              {dossier.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
                  <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 border-t border-border/40 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Nguyên tắc phòng thủ
            </span>
            <ul className="space-y-1.5">
              {dossier.defensePrinciples.map((principle, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {principle}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Concepts */}
        <Card className="glass-card space-y-2 p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Khái niệm cốt lõi
          </span>
          <dl className="space-y-2.5">
            {dossier.concepts.map((concept, idx) => (
              <div key={idx} className="rounded-xl border border-border/50 bg-secondary/20 p-3">
                <dt className="font-mono text-[11px] font-bold text-foreground">
                  {concept.term}
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {concept.definition}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {/* Attacker playbook — full width */}
      <Card className="glass-card space-y-3 p-5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-destructive">
          <Skull className="h-3.5 w-3.5" />
          Attacker Playbook — quy trình chuẩn của domain này
        </span>
        <ol className="space-y-2.5">
          {dossier.attackerPlaybook.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 rounded-xl border border-destructive/15 bg-destructive/5 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-destructive/15 font-mono text-[10px] font-bold text-destructive">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-bold text-foreground">{step.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}

interface RedTeamConsoleProps {
  collection: RedTeamCollection;
}

export function RedTeamConsole({ collection }: RedTeamConsoleProps) {
  const { launchedVectorIds, patchedVectorIds, resetRedTeamProgress } = useRedTeamStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalVectors = collection.vectors.length;
  const breachedCount = mounted
    ? collection.vectors.filter((v) => launchedVectorIds.includes(v.id)).length
    : 0;
  const patchedCount = mounted
    ? collection.vectors.filter((v) => patchedVectorIds.includes(v.id)).length
    : 0;

  return (
    <section className="space-y-5">
      {/* Mission Control Header */}
      <Card className="glass-card relative space-y-4 overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Crosshair className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
                {collection.title}
              </h2>
              <Badge variant="destructive" className="text-[10px] uppercase tracking-wider">
                {collection.difficulty}
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{collection.tagline}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetRedTeamProgress}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Ops
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-primary">
            Mission Briefing
          </span>
          <p className="text-xs leading-relaxed text-foreground sm:text-sm">
            {collection.missionBriefing}
          </p>
        </div>

        {/* Ops Scoreboard */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-muted-foreground">
              Breached:{' '}
              <span className="font-bold text-destructive">
                {breachedCount}/{totalVectors}
              </span>{' '}
              · Patched:{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {patchedCount}/{totalVectors}
              </span>
            </span>
            <span className="font-medium text-muted-foreground">
              {breachedCount === 0
                ? 'Hệ thống đang an toàn… tưởng vậy đó 🤔'
                : patchedCount === totalVectors
                  ? 'Toàn hệ thống đã được vá. Blue Team win! 🛡️'
                  : 'Đang bị xâm nhập — hãy vá ngay!'}
            </span>
          </div>
          <Progress
            value={totalVectors === 0 ? 0 : (patchedCount / totalVectors) * 100}
            indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-500"
          />
        </div>
      </Card>

      {/* Học liệu — lý thuyết nền độc lập của collection */}
      <CollectionDossier dossier={collection.dossier} />

      {/* Attack Vectors */}
      <div className="space-y-6">
        {collection.vectors.map((vector) => (
          <AttackVectorCard key={vector.id} vector={vector} />
        ))}
      </div>
    </section>
  );
}
