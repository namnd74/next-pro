'use client';

import * as React from 'react';
import {
  Users,
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricItem } from '../types';

interface StatCardProps {
  metric: MetricItem;
}

const iconMap = {
  users: Users,
  activity: Activity,
  zap: Zap,
  shieldCheck: ShieldCheck,
};

export function StatCard({ metric }: StatCardProps) {
  const IconComponent = iconMap[metric.iconName] || Activity;

  return (
    <Card glass className="group relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <IconComponent className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="font-sans text-3xl font-bold tracking-tight text-foreground">
            {metric.value}
          </div>
          <Badge
            variant={metric.isPositive ? 'success' : 'destructive'}
            className="flex items-center gap-1 text-[11px]"
          >
            {metric.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {metric.change}
          </Badge>
        </div>

        <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}
