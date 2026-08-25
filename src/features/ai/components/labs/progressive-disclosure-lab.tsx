'use client';

import * as React from 'react';
import { FileCode2, FileText, FolderOpen, Layers3, TerminalSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ContextStrategy = 'monolith' | 'progressive';

interface ContextItem {
  id: string;
  label: string;
  tokens: number;
  loaded: boolean;
  reason: string;
  kind: 'instruction' | 'catalog' | 'skill' | 'reference' | 'script';
}

export function ProgressiveDisclosureLab() {
  const [strategy, setStrategy] = React.useState<ContextStrategy>('monolith');
  const [taskRelevant, setTaskRelevant] = React.useState(true);
  const [needsPerformanceReference, setNeedsPerformanceReference] = React.useState(false);

  const items = buildContextItems(strategy, taskRelevant, needsPerformanceReference);
  const loadedTokens = items.reduce(
    (total, item) => total + (item.loaded ? item.tokens : 0),
    0
  );
  const maxTokens = 3400;

  return (
    <div className="space-y-5">
      <section className="border-border/60 bg-background/70 grid gap-4 rounded-2xl border p-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <Layers3 className="h-4 w-4 text-cyan-500" aria-hidden="true" />
              Context strategy
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              So sánh instruction monolith với skill được nạp theo đúng task branch.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant={strategy === 'monolith' ? 'default' : 'outline'}
              onClick={() => setStrategy('monolith')}
            >
              Monolith
            </Button>
            <Button
              type="button"
              size="sm"
              variant={strategy === 'progressive' ? 'default' : 'outline'}
              onClick={() => setStrategy('progressive')}
            >
              Progressive
            </Button>
          </div>

          <div className="space-y-2">
            <ToggleRow
              label="Task liên quan UI review"
              checked={taskRelevant}
              onChange={setTaskRelevant}
            />
            <ToggleRow
              label="Cần performance reference"
              checked={needsPerformanceReference}
              onChange={setNeedsPerformanceReference}
              disabled={!taskRelevant || strategy === 'monolith'}
            />
          </div>

          <div className="bg-secondary/50 rounded-xl p-4" aria-live="polite">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                  Context loaded
                </span>
                <strong className="text-foreground text-2xl font-extrabold">
                  {loadedTokens.toLocaleString()}
                </strong>
                <span className="text-muted-foreground ml-1 text-xs">tokens</span>
              </div>
              <Badge variant={loadedTokens > 2500 ? 'warning' : 'success'}>
                {loadedTokens > 2500 ? 'Always-on cost cao' : 'Theo nhu cầu'}
              </Badge>
            </div>
            <div className="bg-background mt-3 h-2 overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  loadedTokens > 2500
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-cyan-500 to-violet-500'
                }`}
                style={{ width: `${Math.min(100, (loadedTokens / maxTokens) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <ContextTimeline items={items} maxTokens={maxTokens} />
      </section>

      <section className="border-border/60 rounded-2xl border bg-slate-950 p-4 text-slate-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-cyan-300 uppercase">
              Skill package explorer
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Màu sáng nghĩa là resource đã đi vào execution path.
            </p>
          </div>
          <Badge variant="info">client-side simulation</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FileNode
            icon={FolderOpen}
            title="frontend-production-review"
            detail="skill root"
            active={taskRelevant && strategy === 'progressive'}
          />
          <FileNode
            icon={FileText}
            title="SKILL.md"
            detail="workflow · 1,420 tokens"
            active={taskRelevant && strategy === 'progressive'}
          />
          <FileNode
            icon={FileCode2}
            title="performance-budgets.md"
            detail="reference · 680 tokens"
            active={
              taskRelevant && needsPerformanceReference && strategy === 'progressive'
            }
          />
          <FileNode
            icon={TerminalSquare}
            title="inspect_bundle.py"
            detail="tool path · no prompt tokens"
            active={taskRelevant && strategy === 'progressive'}
          />
        </div>
      </section>
    </div>
  );
}

function buildContextItems(
  strategy: ContextStrategy,
  taskRelevant: boolean,
  needsReference: boolean
): ContextItem[] {
  if (strategy === 'monolith') {
    return [
      {
        id: 'monolith',
        label: 'AGENTS.md + mọi runbook',
        tokens: 3180,
        loaded: true,
        reason: 'Nạp ở mọi task, kể cả khi không dùng',
        kind: 'instruction',
      },
    ];
  }

  return [
    {
      id: 'agents',
      label: 'AGENTS.md core policy',
      tokens: 420,
      loaded: true,
      reason: 'Always-on repository rules',
      kind: 'instruction',
    },
    {
      id: 'catalog',
      label: 'Skill catalog entry',
      tokens: 90,
      loaded: true,
      reason: 'Name + description để routing',
      kind: 'catalog',
    },
    {
      id: 'skill',
      label: 'SKILL.md',
      tokens: 1420,
      loaded: taskRelevant,
      reason: taskRelevant ? 'Task match description' : 'Task không liên quan',
      kind: 'skill',
    },
    {
      id: 'reference',
      label: 'performance-budgets.md',
      tokens: 680,
      loaded: taskRelevant && needsReference,
      reason:
        taskRelevant && needsReference
          ? 'Decision branch cần performance evidence'
          : 'Không cần ở branch hiện tại',
      kind: 'reference',
    },
    {
      id: 'script',
      label: 'inspect_bundle.py',
      tokens: 0,
      loaded: taskRelevant,
      reason: taskRelevant ? 'Executable được gọi khi có report' : 'Không thực thi',
      kind: 'script',
    },
  ];
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`border-border/60 bg-card/50 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
    >
      <span className="text-foreground text-xs font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-violet-500"
      />
    </label>
  );
}

function ContextTimeline({
  items,
  maxTokens,
}: {
  items: ContextItem[];
  maxTokens: number;
}) {
  return (
    <div className="space-y-3" aria-live="polite">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`rounded-xl border p-3 transition-colors ${
            item.loaded
              ? 'border-cyan-500/30 bg-cyan-500/5'
              : 'border-border/50 bg-secondary/20 opacity-55'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-foreground flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                {item.label}
                <span className="font-mono text-[10px]">
                  {item.loaded ? `${item.tokens.toLocaleString()} tokens` : 'not loaded'}
                </span>
              </span>
              <span className="text-muted-foreground mt-1 block text-[11px]">
                {item.reason}
              </span>
              {item.loaded && item.tokens > 0 && (
                <span className="bg-secondary mt-2 block h-1.5 overflow-hidden rounded-full">
                  <span
                    className="block h-full rounded-full bg-cyan-500 transition-[width] duration-300"
                    style={{ width: `${Math.max(4, (item.tokens / maxTokens) * 100)}%` }}
                  />
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FileNode({
  icon: Icon,
  title,
  detail,
  active,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  detail: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        active
          ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
          : 'border-slate-800 bg-slate-900/70 text-slate-500'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden={true} />
      <span className="mt-3 block truncate font-mono text-[11px] font-semibold">
        {title}
      </span>
      <span className="mt-1 block text-[10px] opacity-70">{detail}</span>
    </div>
  );
}
