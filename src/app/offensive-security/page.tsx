import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Crosshair,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Terminal,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Offensive Security Academy · Coming Soon | NextPro',
  description:
    'Lộ trình Offensive Security và Red Team Range đang được biên soạn và kiểm duyệt an toàn. Sắp ra mắt!',
};

const UPCOMING_MODULES = [
  {
    icon: Lock,
    title: 'Nền Tảng Bảo Mật Web & OWASP Top 10',
    description:
      'Bản chất của các lỗ hổng Injection, XSS, CSRF, IDOR và mô hình phòng thủ theo chiều sâu (Defense in Depth).',
    status: 'In Review',
  },
  {
    icon: Terminal,
    title: 'Interactive Red Team Practice Range',
    description:
      'Môi trường Sandbox cô lập an toàn để thực hành recon, mô phỏng attack vector và tự tay vá lỗi bảo mật.',
    status: 'Safety Audit',
  },
  {
    icon: Shield,
    title: 'DevSecOps & Secure Coding cho React/Next.js',
    description:
      'Tích hợp SAST/DAST vào CI/CD pipeline, bảo vệ Server Actions và quản lý bí mật mật khẩu/token an toàn.',
    status: 'Curriculum Design',
  },
];

export default function OffensiveSecurityComingSoonPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 py-8">
      {/* Hero Coming Soon Section */}
      <section className="border-destructive/20 from-destructive/10 via-background to-background relative overflow-hidden rounded-3xl border bg-gradient-to-b p-8 text-center shadow-2xl sm:p-12">
        <div className="bg-destructive/15 text-destructive ring-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ring-8">
          <Crosshair className="h-8 w-8 animate-pulse" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-500">
          <Clock className="h-3.5 w-3.5" />
          <span>PHÂN HỆ ĐANG ĐƯỢC BIÊN SOẠN · COMING SOON</span>
        </div>

        <h1 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Offensive Security <span className="text-destructive">Academy</span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
          Chương trình đào tạo an toàn thông tin, kiểm thử xâm nhập thực chiến và phòng
          thủ mã nguồn đang được đội ngũ chuyên gia kiểm duyệt gắt gao nhằm đảm bảo an
          toàn đạo đức và chuẩn mực giáo dục cao nhất.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/learn">
            <Button size="lg" className="shadow-primary/20 gap-2 font-semibold shadow-lg">
              <GraduationCap className="h-4 w-4" />
              <span>Khám Phá Lộ Trình React & Next.js</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2 font-semibold">
              <span>Về Trang Chủ</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Sneak Peek Modules */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Kế hoạch nội dung sắp ra mắt</span>
          </h2>
          <Badge
            variant="outline"
            className="border-amber-500/30 text-[10px] text-amber-500"
          >
            Lộ trình Q4
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {UPCOMING_MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="glass-card flex flex-col justify-between space-y-3 p-5 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-destructive/10 text-destructive flex h-9 w-9 items-center justify-center rounded-xl">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Badge variant="secondary" className="font-mono text-[9px]">
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="text-foreground text-sm leading-snug font-bold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
