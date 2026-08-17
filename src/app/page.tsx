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
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      <section className="space-y-4 pb-4 pt-4 text-center">
        <div className="mb-2 inline-flex animate-pulse-subtle items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>React 19 & Next.js 15 Fast-Track</span>
          <span className="h-1 w-1 rounded-full bg-primary" />
          <span className="text-muted-foreground">Production & Interview Ready</span>
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          React & Next.js Pro{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-primary to-purple-500 bg-clip-text text-transparent">
            Mastery & Interview Hub
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Nền tảng học tập 80/20, trắc nghiệm 60s Blitz Quiz và luyện phỏng vấn kỹ thuật
          thực chiến dành cho lập trình viên React 19 & Next.js 15 App Router.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/learn">
            <Button size="lg" className="gap-2 font-semibold shadow-lg shadow-primary/25">
              <BookOpen className="h-4 w-4" />
              <span>Bắt Đầu Học (80/20 Tracks)</span>
            </Button>
          </Link>

          <Link href="/interview">
            <Button variant="outline" size="lg" className="gap-2 font-semibold">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Luyện Phỏng Vấn (Mock Simulator)</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 2 Featured Quick Access Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/learn" className="group">
          <Card className="glass-card glass-card-hover relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                  Lộ Trình Học & Mental Model
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  React 19 Actions, App Router RSC vs Client, Streaming Suspense, TanStack
                  Query v5 & Zustand.
                </p>
              </div>
              <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
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
                <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                  Luyện Phỏng Vấn Kỹ Thuật
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Mock Interview Simulator bấm giờ & chấm điểm, 100+ Senior Q&A Bank, và
                  Bug Hunting Challenge.
                </p>
              </div>
              <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Live Server State Metrics (TanStack Query + Axios) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Live Server State Metrics
            </h2>
            <p className="text-xs text-muted-foreground">
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
                className="h-36 animate-pulse rounded-2xl border border-border bg-secondary/40"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
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
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            Interactive State & Data Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Test Zustand global persistence & TanStack Query cache invalidation live in
            the browser
          </p>
        </div>

        <StateTester />
      </section>

      {/* Tech Stack Matrix & Audit Stream */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <Terminal className="h-4 w-4 text-primary" />
            Architecture Overview & Telemetry
          </h2>
          <p className="text-xs text-muted-foreground">
            Module breakdown and real-time execution events
          </p>
        </div>

        <MetricCharts activities={data?.recentActivities} />
      </section>
    </div>
  );
}
