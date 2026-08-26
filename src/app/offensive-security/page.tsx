import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  Bug,
  Crosshair,
  MousePointerClick,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import {
  OFFENSIVE_SECURITY_COLLECTIONS,
  OFFENSIVE_SECURITY_PHASES_ORDERED,
  TOTAL_MISSIONS,
  getCollectionsByPhase,
  getMissionsByCollectionSlug,
} from '@/features/offensive-security';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Offensive Security Academy | NextPro',
  description:
    'Học viện Offensive Security: nền tảng nghề nghiệp, phạm vi được phép, kiến thức hệ thống và các lab Red Team an toàn.',
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

export default function OffensiveSecurityHomePage() {
  const totalVectors = OFFENSIVE_SECURITY_COLLECTIONS.reduce(
    (acc, s) => acc + s.vectors.length,
    0
  );

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="space-y-4">
        <div className="border-destructive/20 bg-destructive/10 text-destructive inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <Crosshair className="h-4 w-4" />
          <span>Attack · Defend · Master</span>
        </div>

        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Offensive Security <span className="text-destructive">Academy</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          Curriculum từ authority và nền tảng hệ thống đến các specialization như pentest,
          Red Team, bug bounty và vulnerability research. Học theo module chuẩn, sau đó
          củng cố bằng Practice Range an toàn.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <Crosshair className="h-3 w-3" />
            {OFFENSIVE_SECURITY_PHASES_ORDERED.length} phase lộ trình
          </Badge>
          <Badge variant="warning" className="gap-1 text-[11px]">
            <Bug className="h-3 w-3" />
            {OFFENSIVE_SECURITY_COLLECTIONS.length} collections
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

      {/* Core academy */}
      <section className="space-y-4">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
            <BookOpenCheck className="text-primary h-5 w-5" />
            Core Academy
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed">
            Bắt đầu từ quyền hạn và cách ra quyết định an toàn trước khi học kỹ thuật. Đây
            là nền móng của roadmap mới; các firing-range collection bên dưới là khu thực
            hành hiện có.
          </p>
        </div>

        <Link
          href="/offensive-security/academy/os00-ethics-authorization/roles-and-boundaries"
          className="group block"
        >
          <Card className="glass-card glass-card-hover relative overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500 via-cyan-500 to-emerald-500" />
            <div className="flex items-start gap-4">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white sm:flex">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">Module 00.1</Badge>
                  <Badge variant="success">3 bài · browser-safe</Badge>
                </div>
                <h3 className="text-foreground group-hover:text-primary text-base font-extrabold transition-colors">
                  Vai trò Offensive, quyền hạn và ranh giới pháp lý
                </h3>
                <p className="text-muted-foreground max-w-3xl text-xs leading-6">
                  Phân biệt Red Team, pentest và bug bounty; biến scope thành quyết định;
                  xử lý safe harbor, stop condition và escalation bằng evidence có thể
                  audit.
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary mt-1 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Roadmap */}
      <section className="space-y-5">
        <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
          <Crosshair className="text-destructive h-5 w-5" />
          Practice Range hiện có
        </h2>
        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          Các collection cũ tiếp tục là lab bổ trợ. Khi một module mới có cùng outcome, nó
          sẽ trỏ đến mission phù hợp; mission không thay thế phần cơ chế, evidence và
          assessment của curriculum.
        </p>

        <div className="space-y-4">
          {OFFENSIVE_SECURITY_PHASES_ORDERED.map((phase) => {
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
                      href={`/offensive-security/${collection.slug}`}
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
