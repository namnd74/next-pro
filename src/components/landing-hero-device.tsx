'use client';

import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  Database,
  RefreshCw,
  Activity,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroDeviceProps {
  previewMode?: 'A' | 'B' | 'C';
}

export function HeroDevice({ previewMode = 'A' }: HeroDeviceProps) {
  // Tab state for Option A
  const [activeTab, setActiveTab] = useState<'editor' | 'state' | 'telemetry'>('editor');

  // Interactive demo states
  const [isAuth, setIsAuth] = useState(true);
  const [userName, setUserName] = useState('Alex Rivera');
  const [isRefetching, setIsRefetching] = useState(false);
  const [refetchCount, setRefetchCount] = useState(1);

  const handleRefetch = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setIsRefetching(false);
      setRefetchCount((c) => c + 1);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-xl lg:ml-auto lg:max-w-xl xl:max-w-2xl">
      {/* Ambient background glow behind laptop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-[380px] w-[95%] -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-600/35 via-indigo-600/30 to-sky-500/15 blur-3xl"
      />

      {/* MacBook Display Lid */}
      <div className="relative rounded-[18px] border border-slate-700/60 bg-[#161821] p-2 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(99,102,241,0.2)] sm:rounded-[22px] sm:p-3">
        {/* Web camera dot */}
        <div className="absolute top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-800" />

        {/* Screen Bezel */}
        <div className="relative overflow-hidden rounded-[13px] border border-slate-800 bg-[#0b0f19] text-left font-mono text-xs shadow-inner sm:rounded-[15px]">
          {/* Mac Window Title Bar */}
          <div className="flex h-8 items-center justify-between border-b border-slate-800/80 bg-[#0d121f] px-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>

            {/* Window URL / Mode */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-0.5 text-[10px] text-slate-400">
              <span className="text-indigo-400">devpro://</span>
              <span>
                {previewMode === 'B'
                  ? 'live-runtime/split-view'
                  : previewMode === 'C'
                    ? 'telemetry/control-center'
                    : activeTab === 'editor'
                      ? 'learn/rsc-pipeline.tsx'
                      : activeTab === 'state'
                        ? 'runtime/state-inspector.tsx'
                        : 'telemetry/system-events.log'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="hidden sm:inline">LIVE ENGINE</span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* OPTION A: Multi-Tab OS (Interactive Tab Switching) */}
          {/* =================================================================== */}
          {previewMode === 'A' && (
            <div className="flex min-h-[340px] flex-col">
              {/* Tabs Header */}
              <div className="flex items-center border-b border-slate-800/70 bg-[#090d16] text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 border-r border-slate-800 px-3.5 py-1.5 font-medium transition-colors',
                    activeTab === 'editor'
                      ? 'border-t-2 border-t-indigo-500 bg-[#0b0f19] text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Code2 className="h-3 w-3 text-cyan-400" />
                  <span>rsc-pipeline.tsx</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('state')}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 border-r border-slate-800 px-3.5 py-1.5 font-medium transition-colors',
                    activeTab === 'state'
                      ? 'border-t-2 border-t-indigo-500 bg-[#0b0f19] text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Database className="h-3 w-3 text-emerald-400" />
                  <span>state-inspector.tsx</span>
                  <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">
                    LIVE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('telemetry')}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3.5 py-1.5 font-medium transition-colors',
                    activeTab === 'telemetry'
                      ? 'border-t-2 border-t-indigo-500 bg-[#0b0f19] text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Terminal className="h-3 w-3 text-amber-400" />
                  <span>telemetry.log</span>
                </button>
              </div>

              {/* Tab 1: Editor + 60s Quiz */}
              {activeTab === 'editor' && (
                <div className="grid flex-1 grid-cols-1 divide-y divide-slate-800/80 sm:grid-cols-12 sm:divide-x sm:divide-y-0">
                  {/* Left Code */}
                  <div className="flex flex-col bg-[#0b0f19] p-3 text-[11px] leading-relaxed select-none sm:col-span-7 sm:p-4">
                    <div className="space-y-1 text-slate-400">
                      <div>
                        <span className="inline-block w-5 text-slate-600">1</span>
                        <span className="text-purple-400">import</span> &#123; Suspense
                        &#125; <span className="text-purple-400">from</span>{' '}
                        <span className="text-emerald-300">&apos;react&apos;</span>;
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">2</span>
                        <span className="text-purple-400">import</span> &#123; db &#125;{' '}
                        <span className="text-purple-400">from</span>{' '}
                        <span className="text-emerald-300">&apos;@/lib/db&apos;</span>;
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">3</span>
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">4</span>
                        <span className="text-slate-500">
                          &#47;&#47; Zero JS bundle sent to client
                        </span>
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">5</span>
                        <span className="text-purple-400">
                          export async function
                        </span>{' '}
                        <span className="text-blue-400">TelemetryFeed</span>() &#123;
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">6</span>{' '}
                        <span className="text-purple-400">const</span> metrics ={' '}
                        <span className="text-purple-400">await</span>{' '}
                        <span className="text-yellow-300">db</span>.
                        <span className="text-blue-400">getTelemetry</span>();
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">7</span>{' '}
                        <span className="text-purple-400">return</span> (
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">8</span> &lt;
                        <span className="text-cyan-400">Suspense</span>{' '}
                        <span className="text-slate-400">fallback</span>=&#123;&lt;
                        <span className="text-indigo-400">Skeleton</span> /&gt;&#125;&gt;
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">9</span> &lt;
                        <span className="text-blue-400">TelemetryCard</span>{' '}
                        <span className="text-slate-400">data</span>=&#123;metrics&#125;
                        /&gt;
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">10</span> &lt;/
                        <span className="text-cyan-400">Suspense</span>&gt;
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">11</span> );
                      </div>
                      <div>
                        <span className="inline-block w-5 text-slate-600">12</span>&#125;
                      </div>
                    </div>
                  </div>
                  {/* Right Quiz */}
                  <div className="flex flex-col justify-between bg-gradient-to-b from-[#0f1422] to-[#090d16] p-4 sm:col-span-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-400 uppercase">
                          60s Blitz
                        </span>
                        <span className="text-[10px] text-slate-400">React Core</span>
                      </div>
                      <div className="my-3 flex flex-col items-center">
                        <div className="relative flex h-16 w-16 items-center justify-center">
                          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                            <circle
                              cx="32"
                              cy="32"
                              r="27"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-slate-800"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="27"
                              fill="none"
                              stroke="#a855f7"
                              strokeWidth="3"
                              strokeDasharray="169.6"
                              strokeDashoffset="45"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute font-sans text-lg font-bold text-white">
                            45s
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-[11px] text-slate-300">
                        RSC khác biệt lớn nhất với SSR ở điểm nào?
                      </div>
                      <div className="mt-2 space-y-1 text-[10px]">
                        <div className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>0kB JS gửi về client</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Zustand & TanStack Query Live Inspector */}
              {activeTab === 'state' && (
                <div className="grid flex-1 grid-cols-1 gap-4 divide-y divide-slate-800 bg-[#090d16] p-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  {/* Zustand Box */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0d121f] p-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs font-semibold text-slate-200">
                            Zustand Store
                          </span>
                        </div>
                        <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[9px] text-indigo-300">
                          Persist
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Auth Session:</span>
                          <span
                            className={cn(
                              'font-bold',
                              isAuth ? 'text-emerald-400' : 'text-slate-500'
                            )}
                          >
                            {isAuth ? '● Authenticated' : '○ Signed Out'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Active User:</span>
                          <span className="font-medium text-slate-200">
                            {isAuth ? userName : 'Guest'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAuth(!isAuth)}
                        className="flex-1 cursor-pointer rounded-lg border border-slate-700 bg-slate-800/80 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-700"
                      >
                        {isAuth ? 'Sign Out' : 'Sign In'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUserName(
                            userName === 'Alex Rivera' ? 'Nam Nguyen' : 'Alex Rivera'
                          )
                        }
                        className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-700"
                      >
                        Swap Name
                      </button>
                    </div>
                  </div>

                  {/* TanStack Query Box */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0d121f] p-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-semibold text-slate-200">
                            TanStack Query
                          </span>
                        </div>
                        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400">
                          Cached
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-[11px]">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span className="text-slate-500">Query Key:</span>
                          <span className="text-cyan-300">
                            [&apos;overview&apos;, &apos;metrics&apos;]
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cache Policy:</span>
                          <span className="text-[10px] text-slate-300">
                            stale: 30s | refetch: {refetchCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefetch}
                      disabled={isRefetching}
                      className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
                    >
                      <RefreshCw
                        className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')}
                      />
                      <span>
                        {isRefetching
                          ? 'Invalidating Cache...'
                          : 'Trigger Invalidate & Refetch'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: System Events Telemetry Log */}
              {activeTab === 'telemetry' && (
                <div className="flex-1 space-y-2 overflow-y-auto bg-[#090d16] p-4 font-mono text-[11px] select-none">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                      LIVE TELEMETRY STREAM
                    </span>
                    <span>BUFFER: 4 EVENTS</span>
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>
                        <span className="font-bold text-emerald-300">Zustand:</span> Auth
                        session hydrated from localStorage
                      </span>
                      <span className="ml-auto text-[10px] text-slate-600">Just now</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <span>
                        <span className="font-bold text-cyan-300">Axios:</span> Typed
                        bearer token interceptor mounted
                      </span>
                      <span className="ml-auto text-[10px] text-slate-600">1m ago</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                      <span>
                        <span className="font-bold text-indigo-300">Query v5:</span>{' '}
                        Metrics cache initialized (30s stale)
                      </span>
                      <span className="ml-auto text-[10px] text-slate-600">3m ago</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
                      <span>
                        <span className="font-bold text-purple-300">RSC Pipeline:</span>{' '}
                        Zero-bundle server streaming ready
                      </span>
                      <span className="ml-auto text-[10px] text-slate-600">5m ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* OPTION B: Code (Left) + Live State Widget (Right) Split */}
          {/* =================================================================== */}
          {previewMode === 'B' && (
            <div className="grid min-h-[340px] grid-cols-1 divide-y divide-slate-800/80 sm:grid-cols-12 sm:divide-x sm:divide-y-0">
              {/* Left: Code for Zustand Store */}
              <div className="flex flex-col bg-[#0b0f19] sm:col-span-7">
                <div className="flex items-center border-t-2 border-b border-slate-800/70 border-t-indigo-500 bg-[#090d16] px-3.5 py-1.5 text-[11px] text-slate-200">
                  <span className="mr-2 text-cyan-400">TS</span>use-auth-store.ts
                </div>
                <div className="flex-1 space-y-1 p-3 text-[11px] text-slate-400 select-none">
                  <div>
                    <span className="text-purple-400">import</span> &#123; create &#125;{' '}
                    <span className="text-purple-400">from</span>{' '}
                    <span className="text-emerald-300">&apos;zustand&apos;</span>;
                  </div>
                  <div>
                    <span className="text-purple-400">import</span> &#123; persist &#125;{' '}
                    <span className="text-purple-400">from</span>{' '}
                    <span className="text-emerald-300">
                      &apos;zustand/middleware&apos;
                    </span>
                    ;
                  </div>
                  <div>
                    <span className="text-purple-400">export const</span>{' '}
                    <span className="text-blue-400">useAuthStore</span> = create(
                  </div>
                  <div> persist((set) =&gt; (&#123;</div>
                  <div>
                    {' '}
                    user:{' '}
                    <span className="text-emerald-300">&apos;Alex Rivera&apos;</span>,
                  </div>
                  <div>
                    {' '}
                    isAuth: <span className="text-yellow-300">true</span>,
                  </div>
                  <div>
                    {' '}
                    toggle: () =&gt; set((s) =&gt; (&#123; isAuth: !s.isAuth &#125;)),
                  </div>
                  <div>
                    {' '}
                    &#125;), &#123; name:{' '}
                    <span className="text-emerald-300">
                      &apos;auth-session&apos;
                    </span>{' '}
                    &#125;)
                  </div>
                  <div>);</div>
                </div>
              </div>

              {/* Right: Live Interactive Controller */}
              <div className="flex flex-col justify-between space-y-3 bg-gradient-to-b from-[#0f1422] to-[#090d16] p-3.5 sm:col-span-5">
                <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">
                      Zustand Live
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      Persist Active
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-200">
                    User: {userName}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setUserName(
                        userName === 'Alex Rivera' ? 'Nam Nguyen' : 'Alex Rivera'
                      )
                    }
                    className="w-full rounded bg-slate-800 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-700"
                  >
                    Mutate State
                  </button>
                </div>

                <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">
                      TanStack Query
                    </span>
                    <span className="font-mono text-cyan-400">Cached</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefetch}
                    disabled={isRefetching}
                    className="flex w-full items-center justify-center gap-1.5 rounded bg-indigo-600 py-1.5 text-[10px] font-bold text-white transition hover:bg-indigo-500"
                  >
                    <RefreshCw
                      className={cn('h-3 w-3', isRefetching && 'animate-spin')}
                    />
                    <span>{isRefetching ? 'Refetching...' : 'Invalidate Cache'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* OPTION C: Mini Control Center (Dashboard 100%) */}
          {/* =================================================================== */}
          {previewMode === 'C' && (
            <div className="flex min-h-[340px] flex-col space-y-3.5 bg-[#090d16] p-4">
              {/* Row 1: 2 Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Zustand Card */}
                <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0d121f] p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Database className="h-3.5 w-3.5 text-indigo-400" />
                      Zustand Persist
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">
                      SYNCED
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>User:</span>
                    <span className="font-medium text-white">Alex Rivera</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuth(!isAuth)}
                    className="w-full rounded bg-slate-800 py-1 text-[10px] font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    {isAuth ? 'Toggle Sign Out' : 'Toggle Sign In'}
                  </button>
                </div>

                {/* TanStack Card */}
                <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0d121f] p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Activity className="h-3.5 w-3.5 text-emerald-400" />
                      Query Cache
                    </span>
                    <span className="rounded bg-cyan-500/20 px-1 text-[9px] font-bold text-cyan-400">
                      stale: 30s
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Key:</span>
                    <span className="font-mono text-cyan-300">[&apos;metrics&apos;]</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefetch}
                    className="flex w-full items-center justify-center gap-1 rounded bg-indigo-600 py-1 text-[10px] font-semibold text-white hover:bg-indigo-500"
                  >
                    <RefreshCw
                      className={cn('h-3 w-3', isRefetching && 'animate-spin')}
                    />
                    <span>Invalidate Cache</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Live Console Stream */}
              <div className="flex-1 space-y-1.5 rounded-xl border border-slate-800 bg-[#070a12] p-3 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                  <span>Audit Stream</span>
                  <span className="text-emerald-400">● 24ms latency</span>
                </div>
                <div className="text-emerald-300">
                  ✓ [Session] Zustand global auth hydrated from localStorage
                </div>
                <div className="text-cyan-300">
                  ✓ [Network] Axios interceptor injected with bearer token
                </div>
                <div className="text-indigo-300">
                  ✓ [Cache] TanStack Query v5 cache initialized
                </div>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#080c14] px-3 py-1 text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-emerald-400" />
              <span>Engine Status: Production Ready</span>
            </div>
            <span>TypeScript 5.7 Strict · UTF-8</span>
          </div>
        </div>
      </div>

      {/* MacBook Bottom Base / Chassis */}
      <div className="relative mx-auto -mt-1 -ml-[1.5%] h-3 w-[103%] rounded-b-xl border-t border-white/10 bg-gradient-to-b from-[#252836] via-[#1a1d27] to-[#10121a] shadow-2xl sm:h-4 sm:rounded-b-2xl">
        {/* Center opening thumb notch */}
        <div className="mx-auto h-1 w-20 rounded-b-sm border-t border-white/5 bg-[#0a0c12] sm:h-1.5 sm:w-28" />
      </div>

      {/* Bottom desk reflection / glow */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto -mt-1 h-8 w-4/5 rounded-full bg-indigo-500/15 blur-xl"
      />
    </div>
  );
}
