'use client';

import * as React from 'react';
import { Server, Laptop, Layers, Zap, Database, Globe, Plus, Boxes } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NodeType } from '../types';
import { useSystemDesignStore } from '../stores/use-system-design-store';

interface PaletteItem {
  type: NodeType;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'rsc',
    label: 'Server Component (RSC)',
    category: 'React 19 Server Tree',
    icon: Server,
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
  },
  {
    type: 'client',
    label: 'Client Leaf Component',
    category: "'use client' Interaction",
    icon: Laptop,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
  },
  {
    type: 'suspense',
    label: 'Streaming Suspense',
    category: 'Async Stream Boundary',
    icon: Layers,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    type: 'serverAction',
    label: 'Server Action (RPC)',
    category: 'Type-safe Mutation',
    icon: Zap,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
  },
  {
    type: 'cacheStore',
    label: 'Zustand / Query Cache',
    category: 'Client Memory Store',
    icon: Boxes,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
  },
  {
    type: 'edgeGateway',
    label: 'Edge CDN / Gateway',
    category: 'Global Edge Ingress',
    icon: Globe,
    color: 'text-teal-400',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
  },
  {
    type: 'database',
    label: 'Database / Redis',
    category: 'Persistent Storage',
    icon: Database,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
  },
];

export function NodePalette() {
  const addNode = useSystemDesignStore((s) => s.addNode);

  return (
    <Card className="glass-card flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Architecture Palette</h3>
          <p className="text-[11px] text-muted-foreground">
            Click to place architectural node onto canvas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {PALETTE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => addNode(item.type)}
              className="group flex items-center justify-between rounded-xl border border-border/70 bg-secondary/30 p-2.5 text-left transition-all hover:scale-[1.01] hover:border-primary/40 hover:bg-secondary/60 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.badgeBorder} ${item.badgeBg}`}
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{item.category}</div>
                </div>
              </div>

              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
