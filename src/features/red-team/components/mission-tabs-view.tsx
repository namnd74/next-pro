'use client';

import * as React from 'react';
import {
  Target,
  Search,
  GitBranch,
  ShieldCheck,
  HelpCircle,
  FlaskConical,
  Info,
  Crosshair,
} from 'lucide-react';
import { RedTeamCollection, RedTeamMission } from '../types';
import { AttackVectorCard } from './red-team-console';
import { UI_DEMO_REGISTRY } from './ui-demo-stage';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';

interface MissionTabsViewProps {
  collection: RedTeamCollection;
  mission: RedTeamMission;
}

export function MissionTabsView({
  collection,
  mission,
}: MissionTabsViewProps) {
  const linkedVectors = collection.vectors.filter((v) =>
    mission.vectorIds.includes(v.id)
  );
  const demoMeta = UI_DEMO_REGISTRY[collection.slug];
  const Demo = demoMeta?.component;

  return (
    <Tabs defaultValue="briefing" className="w-full">
      <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 p-1">
        <TabsTrigger value="briefing" className="px-2 py-2 text-xs sm:px-3">
          🎯 Briefing
        </TabsTrigger>
        <TabsTrigger value="attack" className="px-2 py-2 text-xs sm:px-3">
          💥 Attack Lab
        </TabsTrigger>
        <TabsTrigger value="defense" className="px-2 py-2 text-xs sm:px-3">
          🛡 Defense
        </TabsTrigger>
      </TabsList>

      {/* ══════════════ TAB 1 · BRIEFING ══════════════ */}
      <TabsContent value="briefing" className="mt-4 space-y-6">
        {/* Objective */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-destructive">
            <Target className="h-3.5 w-3.5" />
            Mission Objective
          </span>
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {mission.objective}
          </p>
        </div>

        {/* Root cause — phần "theory" sâu */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <GitBranch className="h-4 w-4 text-primary" />
            Vì sao lỗ hổng tồn tại? (Root Cause)
          </h2>
          <Card className="glass-card p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {mission.rootCause}
            </p>
          </Card>
        </section>

        {/* Recon */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <Search className="h-4 w-4 text-primary" />
            Recon Notes — attacker nhìn thấy gì trước tiên?
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {mission.reconNotes.map((note, idx) => (
              <Card key={idx} className="glass-card flex items-start gap-3 p-4">
                <span className="mt-0.5 font-mono text-[10px] font-bold text-destructive">
                  R{idx + 1}
                </span>
                <span className="text-xs leading-relaxed text-foreground">{note}</span>
              </Card>
            ))}
          </div>
        </section>
      </TabsContent>

      {/* ══════════════ TAB 2 · ATTACK LAB ══════════════ */}
      <TabsContent value="attack" className="mt-4 space-y-8">
        {/* Kill chain */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <Crosshair className="h-4 w-4 text-destructive" />
            Kill Chain — từng bước khai thác
          </h2>
          <div className="space-y-4 border-l-2 border-destructive/30 pl-5">
            {mission.killChain.map((step, idx) => (
              <div key={idx} className="relative space-y-2">
                <span className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-destructive bg-background" />
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.detail}
                </p>
                {step.code && <CodeBlock code={step.code} language="tsx" />}
              </div>
            ))}
          </div>
        </section>

        {/* Live vector simulator */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <Info className="h-4 w-4 text-primary" />
            Bắn thử vector thật
          </h2>
          {linkedVectors.length === 0 ? (
            <Card className="glass-card flex items-center gap-3 p-4">
              <Info className="h-4 w-4 shrink-0 text-sky-500" />
              <p className="text-xs text-muted-foreground">
                Mission này dùng lại vector của topic — mở topic hub để bắn thử.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {linkedVectors.map((vector) => (
                <AttackVectorCard key={vector.id} vector={vector} />
              ))}
            </div>
          )}
        </section>

        {/* UI Demo */}
        {Demo && demoMeta && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-foreground">
              <FlaskConical className="h-4 w-4 text-primary" />
              {demoMeta.title}
            </h2>
            <Card className="glass-card p-4 sm:p-6">
              <Demo />
            </Card>
          </section>
        )}
      </TabsContent>

      {/* ══════════════ TAB 3 · DEFENSE ══════════════ */}
      <TabsContent value="defense" className="mt-4 space-y-8">
        {/* Hardening checklist */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Hardening Checklist
          </h2>
          <div className="space-y-2">
            {mission.hardeningChecklist.map((item, idx) => (
              <Card
                key={idx}
                className="glass-card flex items-start gap-3 border-emerald-500/20 bg-emerald-500/5 p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
                <span className="text-xs leading-relaxed text-foreground">{item}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Debrief */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <HelpCircle className="h-4 w-4 text-primary" />
            Debrief — trả lời trước khi rời chiến dịch
          </h2>
          <div className="space-y-3">
            {mission.debrief.map((qa, idx) => (
              <Card key={idx} className="glass-card space-y-2 p-5">
                <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
                  <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                    Q{idx + 1}
                  </Badge>
                  {qa.question}
                </p>
                <p className="pl-9 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    A:{' '}
                  </span>
                  {qa.answer}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </TabsContent>
    </Tabs>
  );
}
