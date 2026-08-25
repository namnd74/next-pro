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
import { OffensiveSecurityCollection, OffensiveSecurityMission } from '../types';
import { AttackVectorCard } from './offensive-security-console';
import { UI_DEMO_REGISTRY } from './ui-demo-stage';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';

interface MissionTabsViewProps {
  collection: OffensiveSecurityCollection;
  mission: OffensiveSecurityMission;
}

export function MissionTabsView({ collection, mission }: MissionTabsViewProps) {
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
        <div className="border-destructive/30 bg-destructive/5 rounded-2xl border p-4">
          <span className="text-destructive mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
            <Target className="h-3.5 w-3.5" />
            Mission Objective
          </span>
          <p className="text-foreground text-sm leading-relaxed font-medium">
            {mission.objective}
          </p>
        </div>

        {/* Root cause — phần "theory" sâu */}
        <section className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <GitBranch className="text-primary h-4 w-4" />
            Vì sao lỗ hổng tồn tại? (Root Cause)
          </h2>
          <Card className="glass-card p-5">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {mission.rootCause}
            </p>
          </Card>
        </section>

        {/* Recon */}
        <section className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <Search className="text-primary h-4 w-4" />
            Recon Notes — attacker nhìn thấy gì trước tiên?
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {mission.reconNotes.map((note, idx) => (
              <Card key={idx} className="glass-card flex items-start gap-3 p-4">
                <span className="text-destructive mt-0.5 font-mono text-[10px] font-bold">
                  R{idx + 1}
                </span>
                <span className="text-foreground text-xs leading-relaxed">{note}</span>
              </Card>
            ))}
          </div>
        </section>
      </TabsContent>

      {/* ══════════════ TAB 2 · ATTACK LAB ══════════════ */}
      <TabsContent value="attack" className="mt-4 space-y-8">
        {/* Kill chain */}
        <section className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <Crosshair className="text-destructive h-4 w-4" />
            Kill Chain — từng bước khai thác
          </h2>
          <div className="border-destructive/30 space-y-4 border-l-2 pl-5">
            {mission.killChain.map((step, idx) => (
              <div key={idx} className="relative space-y-2">
                <span className="border-destructive bg-background absolute top-1 -left-[27px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2" />
                <h3 className="text-foreground text-sm font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.detail}
                </p>
                {step.code && <CodeBlock code={step.code} language="tsx" />}
              </div>
            ))}
          </div>
        </section>

        {/* Live vector simulator */}
        <section className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <Info className="text-primary h-4 w-4" />
            Bắn thử vector thật
          </h2>
          {linkedVectors.length === 0 ? (
            <Card className="glass-card flex items-center gap-3 p-4">
              <Info className="h-4 w-4 shrink-0 text-sky-500" />
              <p className="text-muted-foreground text-xs">
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
            <h2 className="text-foreground flex items-center gap-1.5 text-base font-bold tracking-tight">
              <FlaskConical className="text-primary h-4 w-4" />
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
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
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
                <span className="text-foreground text-xs leading-relaxed">{item}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Debrief */}
        <section className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <HelpCircle className="text-primary h-4 w-4" />
            Debrief — trả lời trước khi rời chiến dịch
          </h2>
          <div className="space-y-3">
            {mission.debrief.map((qa, idx) => (
              <Card key={idx} className="glass-card space-y-2 p-5">
                <p className="text-foreground flex items-start gap-2 text-sm font-semibold">
                  <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                    Q{idx + 1}
                  </Badge>
                  {qa.question}
                </p>
                <p className="text-muted-foreground pl-9 text-xs leading-relaxed">
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
