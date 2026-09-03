import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Cpu,
  Crosshair,
  Layers,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SmartResumeBanner } from './smart-resume-banner';
import { SocTelemetryTicker } from './soc-telemetry-ticker';
import { TrackRadarGrid } from './track-radar-grid';

export const CommandCenterDashboard: React.FC = () => {
  return (
    <div className="space-y-10 py-6">
      {/* Top SOC Ticker */}
      <SocTelemetryTicker />

      {/* Hero Operations Center Banner */}
      <section className="via-background to-background relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 p-8 shadow-2xl sm:p-12">
        {/* Subtle grid pattern background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-bold text-emerald-400">
            <span className="flex h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            <span>CYBER RANGE OPERATIONS ACTIVE · 8 FOUNDATION TRACKS (11 ROADMAP)</span>
          </div>

          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Cyber Operations{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
            Nền tảng huấn luyện tác chiến an ninh mạng, kiểm thử xâm nhập thực chiến
            (Penetration Testing) và phân tích phòng thủ chiều sâu (Purple Teaming) chuẩn
            quốc tế với mô phỏng an ninh mạng và WebContainer runtime trên trình duyệt.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/offensive-security/academy">
              <Button
                size="lg"
                data-testid="enter-academy-button"
                className="gap-2 bg-emerald-600 font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 hover:bg-emerald-500"
              >
                <Terminal className="h-4 w-4" />
                <span>Vào Học Viện 8 Tracks</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes">
              <Button
                variant="outline"
                size="lg"
                className="bg-secondary/30 hover:bg-secondary/60 gap-2 border-emerald-500/40 font-semibold"
              >
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Trải Nghiệm Interactive Lab</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Smart Resume Banner (Active User Session) */}
      <SmartResumeBanner />

      {/* 4 Core Platform Metrics Bar */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60 space-y-2 rounded-2xl p-5 transition-colors hover:border-emerald-500/40">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Lộ trình Đào tạo
            </span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-foreground text-2xl font-extrabold tracking-tight">
            8 Foundation Tracks
          </div>
          <p className="text-muted-foreground text-[11px] leading-normal">
            8 tracks nền tảng đang tái thẩm định (11 tracks trong lộ trình mở rộng).
          </p>
        </Card>

        <Card className="border-border/80 bg-card/60 space-y-2 rounded-2xl p-5 transition-colors hover:border-emerald-500/40">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Nội dung Chuyên môn
            </span>
            <Terminal className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-foreground text-2xl font-extrabold tracking-tight">
            27 Modules (81 Lessons)
          </div>
          <p className="text-muted-foreground text-[11px] leading-normal">
            27 modules nghiệp vụ đã biên soạn, đang chuyển sang chuẩn Contract v3.
          </p>
        </Card>

        <Card className="border-border/80 bg-card/60 space-y-2 rounded-2xl p-5 transition-colors hover:border-emerald-500/40">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Thời lượng Chuyên sâu
            </span>
            <Clock className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-foreground text-2xl font-extrabold tracking-tight">
            123+ Giờ Học
          </div>
          <p className="text-muted-foreground text-[11px] leading-normal">
            7,400+ phút kịch bản tình huống thực chiến chuẩn mực không giả lập cẩu thả.
          </p>
        </Card>

        <Card className="border-border/80 bg-card/60 space-y-2 rounded-2xl p-5 transition-colors hover:border-emerald-500/40">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Hạ Tầng Tác Chiến
            </span>
            <Cpu className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-foreground text-2xl font-extrabold tracking-tight">
            0ms Cloud Latency
          </div>
          <p className="text-muted-foreground text-[11px] leading-normal">
            Sandbox trực tiếp trên browser kết hợp IndexedDB snapshotting mượt mà.
          </p>
        </Card>
      </section>

      {/* Track Radar Grid Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <Crosshair className="h-5 w-5 text-emerald-400" />
            <span>Toàn Bộ 19 Phân Hệ Tác Chiến (Operations Arsenal)</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Lựa chọn phân hệ phù hợp với mục tiêu nghề nghiệp: Red Team Operator,
            Penetration Tester, Vulnerability Researcher hoặc Purple Team Engineer.
          </p>
        </div>

        <TrackRadarGrid />
      </section>

      {/* International Standards & Ethics Compliance Footer */}
      <section className="border-border/80 bg-secondary/20 space-y-6 rounded-3xl border p-6 sm:p-8">
        <div className="border-border/40 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Tiêu Chuẩn Công Nghiệp & Cam Kết An Toàn Đạo Đức</span>
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Mọi kịch bản đều tuân thủ khuôn khổ pháp lý, hợp đồng ủy quyền và quy ước
              ứng xử bảo mật quốc tế.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/40 text-[10px] text-emerald-400"
          >
            ETHICAL AUTHORIZATION VERIFIED
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="text-foreground font-mono text-xs font-bold">
              MITRE ATT&CK v14
            </div>
            <div className="text-muted-foreground text-[11px]">
              Ánh xạ chi tiết 14 Tactics & 100+ Techniques.
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-foreground font-mono text-xs font-bold">
              NIST NICE Framework
            </div>
            <div className="text-muted-foreground text-[11px]">
              Định chuẩn năng lực chuyên gia an toàn thông tin.
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-foreground font-mono text-xs font-bold">
              OWASP Top 10 (2021/2023)
            </div>
            <div className="text-muted-foreground text-[11px]">
              Thực nghiệm đầy đủ các lỗi Web & API hiện đại.
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-foreground font-mono text-xs font-bold">
              PTES Methodology
            </div>
            <div className="text-muted-foreground text-[11px]">
              Quy trình kiểm thử xâm nhập 7 giai đoạn chuẩn mực.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
