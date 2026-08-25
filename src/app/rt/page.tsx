import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bug,
  Crosshair,
  MousePointerClick,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import {
  RED_TEAM_COLLECTIONS,
  RT_PHASES_ORDERED,
  TOTAL_MISSIONS,
  getCollectionsByPhase,
  getMissionsByCollectionSlug,
} from '@/features/red-team';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Red Team Ops | NextPro',
  description:
    'Học viện Red Team thực chiến: lộ trình 6 phase — trinh sát, injection, danh tính, race/logic, hạ tầng, capstone phòng thủ.',
};

const STEPS = [
  {
    icon: '①',
    title: 'Đọc Học liệu',
    desc: 'Mỗi collection mở bằng tài liệu riêng: khái niệm, playbook tấn công và nguyên tắc phòng thủ.',
  },
  {
    icon: '②',
    title: 'Chạy Mission',
    desc: 'Vào mission thực chiến: recon → kill chain → bắn payload thật trên lab tương tác.',
  },
  {
    icon: '③',
    title: 'Attack → Patch',
    desc: 'Launch Attack để thấy Blast Radius, rồi tự tay vá bằng Defense Patch cho đến khi PATCHED.',
  },
];

export default function RedTeamHomePage() {
  const totalVectors = RED_TEAM_COLLECTIONS.reduce((acc, s) => acc + s.vectors.length, 0);

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="space-y-4">
        <div className="border-destructive/20 bg-destructive/10 text-destructive inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <Crosshair className="h-4 w-4" />
          <span>Attack · Defend · Master</span>
        </div>

        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Red Team <span className="text-destructive">Academy</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          Lộ trình học thực chiến dành riêng cho Red Team: từ tư duy trinh sát đến
          capstone phòng thủ. Mỗi collection có học liệu riêng, mission chiến dịch riêng
          và lab bắn đạn thật — không mượn nội dung từ bất kỳ lộ trình nào khác.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <Crosshair className="h-3 w-3" />
            {RT_PHASES_ORDERED.length} phase lộ trình
          </Badge>
          <Badge variant="warning" className="gap-1 text-[11px]">
            <Bug className="h-3 w-3" />
            {RED_TEAM_COLLECTIONS.length} collections
          </Badge>
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <Skull className="h-3 w-3" />
            {TOTAL_MISSIONS} chiến dịch
          </Badge>
          <Badge variant="success" className="gap-1 text-[11px]">
            <ShieldCheck className="h-3 w-3" />
            {totalVectors} attack vectors
          </Badge>
        </div>
      </section>

      {/* Roadmap */}
      <section className="space-y-5">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
          <Crosshair className="text-destructive h-5 w-5" />
          Lộ trình thực chiến
        </h2>

        <div className="space-y-4">
          {RT_PHASES_ORDERED.map((phase) => {
            const collections = getCollectionsByPhase(phase.id);
            const phaseVectors = collections.reduce(
              (acc, c) => acc + c.vectors.length,
              0
            );
            return (
              <Card key={phase.id} className="glass-card relative overflow-hidden p-5">
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${phase.color}`}
                />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex h-8 items-center rounded-lg bg-gradient-to-r ${phase.color} px-2 font-mono text-xs font-extrabold text-white shadow`}
                      >
                        PHASE {String(phase.order).padStart(2, '0')}
                      </span>
                      <h3 className="text-foreground text-base font-extrabold tracking-tight">
                        {phase.title}
                      </h3>
                      <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                        {phase.subtitle}
                      </span>
                    </div>
                    <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
                      {phase.tagline}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px] tracking-wider uppercase">
                    {collections.length} collection · {phaseVectors} vector
                  </span>
                </div>

                {/* Collections trong phase */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/rt/${collection.slug}`}
                      className="group"
                    >
                      <Card className="glass-card glass-card-hover flex h-full flex-col gap-1.5 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-foreground group-hover:text-primary truncate text-xs font-bold transition-colors">
                            {collection.title}
                          </p>
                          <ArrowRight className="text-muted-foreground group-hover:text-destructive h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                          {collection.tagline}
                        </p>
                        <p className="text-muted-foreground/70 mt-auto pt-1 font-mono text-[9px] tracking-wider uppercase">
                          {collection.vectors.length} vector ·{' '}
                          {getMissionsByCollectionSlug(collection.slug).length} mission ·{' '}
                          {collection.difficulty}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
          <MousePointerClick className="text-primary h-5 w-5" />
          Cách vận hành
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title} className="glass-card space-y-2 p-5">
              <span className="text-destructive font-mono text-lg font-extrabold">
                {step.icon}
              </span>
              <h3 className="text-foreground text-sm font-bold">{step.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
