import * as React from 'react';
import type { Metadata } from 'next';
import { Crosshair, Skull, ShieldCheck, Bug, MousePointerClick } from 'lucide-react';
import { RED_TEAM_SCENARIOS, TOTAL_MISSIONS } from '@/features/red-team';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Red Team Ops | NextPro',
  description:
    'Mô phỏng tấn công & phòng thủ cho từng chủ đề React/Next.js: XSS, race condition, stale cache, render storm...',
};

const STEPS = [
  {
    icon: '①',
    title: 'Chọn Topic',
    desc: 'Bấm một topic ở menu trái để xem toàn bộ bài học thuộc topic đó.',
  },
  {
    icon: '②',
    title: 'Chọn Lesson',
    desc: 'Mỗi lesson mở trang 3 tab: Theory (lý thuyết) · Practice (tấn công thật) · UI Demo.',
  },
  {
    icon: '③',
    title: 'Attack → Patch',
    desc: 'Launch Attack để thấy hệ thống vỡ, đọc Blast Radius rồi vá bằng Defense Patch.',
  },
];

export default function RedTeamHomePage() {
  const totalVectors = RED_TEAM_SCENARIOS.reduce((acc, s) => acc + s.vectors.length, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          <Crosshair className="h-4 w-4" />
          <span>Attack · Defend · Master</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Red Team <span className="text-destructive">Ops</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Với mỗi topic, đội đỏ mô phỏng cách hệ thống bị phá hủy: bắn payload, xem Blast
          Radius trên terminal, rồi tự tay vá bằng Defense Patch chuẩn enterprise. Chọn một
          mục tiêu ở menu bên trái để bắt đầu.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <Skull className="h-3 w-3" />
            {RED_TEAM_SCENARIOS.length} kịch bản
          </Badge>
          <Badge variant="warning" className="gap-1 text-[11px]">
            <Bug className="h-3 w-3" />
            {TOTAL_MISSIONS} chiến dịch
          </Badge>
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <Crosshair className="h-3 w-3" />
            {totalVectors} attack vectors
          </Badge>
          <Badge variant="success" className="gap-1 text-[11px]">
            <ShieldCheck className="h-3 w-3" />
            {totalVectors} defense patches
          </Badge>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <MousePointerClick className="h-5 w-5 text-primary" />
          Cách vận hành
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title} className="glass-card space-y-2 p-5">
              <span className="font-mono text-lg font-extrabold text-destructive">
                {step.icon}
              </span>
              <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
