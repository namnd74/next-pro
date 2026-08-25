'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Activity,
  Layers,
  Terminal,
  RefreshCw,
  BookOpen,
  Briefcase,
  Crosshair,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RED_TEAM_COMING_SOON } from '@/config/features';
import {
  StatCard,
  StateTester,
  MetricCharts,
  useOverviewMetrics,
} from '@/features/overview';

export default function HomePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useOverviewMetrics();

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="space-y-4 pt-4 pb-4 text-center">
        <div className="animate-pulse-subtle border-primary/20 bg-primary/10 text-primary mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>React 19 & Next.js 16 Fast-Track</span>
          <span className="bg-primary h-1 w-1 rounded-full" />
          <span className="text-muted-foreground">Production & Interview Ready</span>
        </div>

        <h1 className="text-foreground mx-auto max-w-3xl text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          React & Next.js Pro{' '}
          <span className="via-primary bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Mastery & Interview Hub
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
          Nền tảng học tập 80/20, trắc nghiệm 60s Blitz Quiz và luyện phỏng vấn kỹ thuật
          thực chiến dành cho lập trình viên React 19 & Next.js 16 App Router.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/learn">
            <Button size="lg" className="shadow-primary/25 gap-2 font-semibold shadow-lg">
              <BookOpen className="h-4 w-4" />
              <span>Bắt Đầu Học (80/20 Tracks)</span>
            </Button>
          </Link>

          <Link href="/interview">
            <Button variant="outline" size="lg" className="gap-2 font-semibold">
              <Briefcase className="text-primary h-4 w-4" />
              <span>Luyện Phỏng Vấn (Mock Simulator)</span>
            </Button>
          </Link>

          {RED_TEAM_COMING_SOON ? (
            <Button
              variant="outline"
              size="lg"
              disabled
              title="Red Team Ops — Coming Soon"
              className="text-muted-foreground cursor-not-allowed gap-2 border-amber-500/30"
            >
              <Crosshair className="h-4 w-4" aria-hidden="true" />
              <span>Red Team Ops</span>
              <span className="ml-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0 text-[10px] font-semibold text-amber-600 uppercase dark:text-amber-400">
                Coming Soon
              </span>
            </Button>
          ) : (
            <Link href="/rt">
              <Button
                variant="outline"
                size="lg"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 font-semibold"
              >
                <Crosshair className="h-4 w-4" />
                <span>Red Team Ops</span>
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* 3 Featured Quick Access Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/learn" className="group">
          <Card className="glass-card glass-card-hover relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                  Lộ Trình Học & Mental Model
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  React 19 Actions, App Router RSC vs Client, Streaming Suspense, TanStack
                  Query v5 & Zustand.
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary mt-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>

        <Link href="/interview" className="group">
          <Card className="glass-card glass-card-hover relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                  Luyện Phỏng Vấn Kỹ Thuật
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Mock Interview Simulator bấm giờ & chấm điểm, 100+ Senior Q&A Bank, và
                  Bug Hunting Challenge.
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary mt-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>

        {RED_TEAM_COMING_SOON ? (
          <Card
            aria-disabled="true"
            className="glass-card relative cursor-not-allowed overflow-hidden p-6 opacity-60"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-xl">
                  <Crosshair className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground text-lg font-bold">Red Team Ops</h3>
                  <Badge variant="warning" className="tracking-wide uppercase">
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Tính năng đang được hoàn thiện và hiện chưa sẵn sàng để sử dụng.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Link href="/rt" className="group">
            <Card className="glass-card glass-card-hover relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-xl">
                    <Crosshair className="h-5 w-5" />
                  </div>
                  <h3 className="text-foreground group-hover:text-destructive text-lg font-bold transition-colors">
                    Red Team Ops
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Mô phỏng tấn công từng chủ đề: XSS, race condition, stale cache... rồi
                    tự tay vá bằng Defense Patch.
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-destructive mt-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        )}
      </section>

      {/* Live Server State Metrics (TanStack Query + Axios) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
              <Activity className="text-primary h-4 w-4" />
              Live Server State Metrics
            </h2>
            <p className="text-muted-foreground text-xs">
              Fetched via Axios from Next.js API route & managed by TanStack Query v5
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing...' : 'Sync'}</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border-border bg-secondary/40 h-36 animate-pulse rounded-2xl border"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-between rounded-2xl border p-6 text-sm">
            <span>Failed to load server state: {error?.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data?.metrics.map((metric) => (
              <StatCard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive State & Persistence Demo */}
      <section id="interactive-demo" className="space-y-4 pt-4">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
            <Layers className="text-primary h-4 w-4" />
            Interactive State & Data Management
          </h2>
          <p className="text-muted-foreground text-xs">
            Test Zustand global persistence & TanStack Query cache invalidation live in
            the browser
          </p>
        </div>

        <StateTester />
      </section>

      {/* Tech Stack Matrix & Audit Stream */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
            <Terminal className="text-primary h-4 w-4" />
            Architecture Overview & Telemetry
          </h2>
          <p className="text-muted-foreground text-xs">
            Module breakdown and real-time execution events
          </p>
        </div>

        <MetricCharts activities={data?.recentActivities} />
      </section>
    </div>
  );
}
