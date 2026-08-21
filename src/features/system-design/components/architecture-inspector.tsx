'use client';

import * as React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSystemDesignStore } from '../stores/use-system-design-store';

export function ArchitectureInspector() {
  const auditResult = useSystemDesignStore((s) => s.auditResult);
  const selectedNodeId = useSystemDesignStore((s) => s.selectedNodeId);
  const nodes = useSystemDesignStore((s) => s.nodes);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!auditResult) return null;

  return (
    <Card className="glass-card flex flex-col space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Architecture Telemetry & Health Audit
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Real-time evaluation against Next.js 16 & React 19 Senior Staff standards
          </p>
        </div>

        <Badge
          variant={
            auditResult.rating === 'Exceptional'
              ? 'success'
              : auditResult.rating === 'Senior Grade'
                ? 'default'
                : auditResult.rating === 'Needs Optimization'
                  ? 'warning'
                  : 'destructive'
          }
          className="text-xs font-bold"
        >
          {auditResult.rating} ({auditResult.score}/100)
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Zap className="h-3 w-3 text-amber-400" />
            Est. TTFB
          </div>
          <div className="text-sm font-bold text-foreground">
            {auditResult.estimatedLatencyMs}ms
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            Cache Hit Ratio
          </div>
          <div className="text-sm font-bold text-foreground">
            {auditResult.cachingEfficiencyPercent}%
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <ShieldAlert className="h-3 w-3 text-sky-400" />
            Waterfall Risk
          </div>
          <div className="text-sm font-bold text-foreground">
            {auditResult.waterfallRisk}
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Details if active */}
      {selectedNode && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              {selectedNode.title}
            </span>
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
              {selectedNode.type}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {selectedNode.description}
          </p>
        </div>
      )}

      {/* Audit Findings List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-foreground">
          Automated Architectural Feedback
        </h4>
        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
          {auditResult.findings.map((finding) => (
            <div
              key={finding.id}
              className={`rounded-xl border p-2.5 text-xs ${
                finding.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : finding.type === 'warning'
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : finding.type === 'error'
                      ? 'border-destructive/20 bg-destructive/5'
                      : 'border-sky-500/20 bg-sky-500/5'
              }`}
            >
              <div className="flex items-start gap-2">
                {finding.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : finding.type === 'warning' ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                ) : finding.type === 'error' ? (
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                ) : (
                  <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                )}

                <div className="space-y-1">
                  <div className="font-semibold text-foreground">{finding.title}</div>
                  <p className="text-[11px] text-muted-foreground">
                    {finding.description}
                  </p>
                  {finding.remediation && (
                    <p className="text-[10px] font-medium text-primary">
                      💡 Fix: {finding.remediation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
