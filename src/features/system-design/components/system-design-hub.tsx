'use client';

import * as React from 'react';
import { LayoutGrid, Cpu, Sparkles } from 'lucide-react';
import { useSystemDesignStore } from '../stores/use-system-design-store';
import { NodePalette } from './node-palette';
import { Canvas } from './canvas';
import { ArchitectureInspector } from './architecture-inspector';
import { TemplateSelector } from './template-selector';

export function SystemDesignHub() {
  const isMounted = useSystemDesignStore((s) => s.isMounted);
  const setMounted = useSystemDesignStore((s) => s.setMounted);

  React.useEffect(() => {
    setMounted();
  }, [setMounted]);

  if (!isMounted) {
    return (
      <div className="h-[600px] animate-pulse rounded-2xl border border-border bg-secondary/30" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/40 pb-5 md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Whiteboard & Audit Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frontend System Design{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Studio
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Design, simulate, and audit Senior/Staff frontend architectures (React 19,
            RSC, Streaming Suspense, Edge CDNs, and State topologies).
          </p>
        </div>
      </div>

      {/* Senior Template Bar */}
      <TemplateSelector />

      {/* Main Studio Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Component Palette */}
        <div className="lg:col-span-3">
          <NodePalette />
        </div>

        {/* Center: Interactive Canvas */}
        <div className="lg:col-span-6">
          <Canvas />
        </div>

        {/* Right: Architecture Health Telemetry */}
        <div className="lg:col-span-3">
          <ArchitectureInspector />
        </div>
      </div>
    </div>
  );
}
