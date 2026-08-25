import type { Metadata } from 'next';
import { Bot, Braces, Sparkles } from 'lucide-react';
import { AI_LESSONS, AI_TRACKS, AiTrackCard } from '@/features/ai';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'AI Engineering Hub | NextPro',
  description:
    'AI engineering dành cho Frontend Engineer: interface, agent runtime, harness, skills, sub-agent và evals.',
};

export default function AiHubPage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-6 sm:p-10">
        <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative max-w-3xl space-y-5">
          <Badge
            variant="outline"
            className="gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Engineering for Frontend
          </Badge>
          <div className="space-y-3">
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-5xl">
              Từ AI Interface đến{' '}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                Agent Harness
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-7 sm:text-base">
              Hiểu toàn bộ hệ thống bao quanh model, thiết kế giao diện AI production và
              đi sâu cách tạo Agent Skills có thể tái sử dụng, kiểm thử và vận hành an
              toàn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Interface', 'Agent Runtime', 'Harness', 'Skills', 'Evals'].map((item) => (
              <span
                key={item}
                className="border-border/60 bg-background/70 text-foreground rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-foreground text-sm font-bold">
              {AI_TRACKS.length} tracks · {AI_LESSONS.length} bài
            </p>
            <p className="text-muted-foreground text-xs">Kiến trúc sẵn sàng mở rộng</p>
          </div>
        </Card>
        <Card className="glass-card flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Braces className="h-5 w-5" />
          </div>
          <div>
            <p className="text-foreground text-sm font-bold">6 bài Agent Skills</p>
            <p className="text-muted-foreground text-xs">Authoring, scripts và evals</p>
          </div>
        </Card>
        <Card className="glass-card flex items-center gap-4 p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-foreground text-sm font-bold">Nguồn chính thức</p>
            <p className="text-muted-foreground text-xs">Link cập nhật theo từng bài</p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Các track AI Engineering
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Mỗi track có syllabus, deep-link và tiến độ riêng như hệ thống Learning.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TRACKS.map((track) => (
            <AiTrackCard key={track.id} track={track} />
          ))}
        </div>
      </section>
    </div>
  );
}
