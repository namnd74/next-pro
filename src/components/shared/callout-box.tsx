'use client';

import * as React from 'react';
import {
  Sparkles,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutVariant = 'tip' | 'info' | 'warning' | 'danger' | 'success' | 'idea';

export interface CalloutBoxProps {
  variant?: CalloutVariant;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    containerClass: string;
    titleClass: string;
    defaultIcon: React.ElementType;
  }
> = {
  tip: {
    containerClass:
      'border-indigo-500/20 bg-indigo-50/70 text-indigo-950 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100',
    titleClass: 'text-indigo-800 dark:text-indigo-300',
    defaultIcon: Sparkles,
  },
  info: {
    containerClass:
      'border-sky-500/20 bg-sky-50/70 text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
    titleClass: 'text-sky-800 dark:text-sky-300',
    defaultIcon: Info,
  },
  idea: {
    containerClass:
      'border-amber-500/25 bg-amber-50/70 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
    titleClass: 'text-amber-800 dark:text-amber-300',
    defaultIcon: Lightbulb,
  },
  warning: {
    containerClass:
      'border-amber-500/30 bg-amber-50/80 text-amber-950 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-100',
    titleClass: 'text-amber-900 dark:text-amber-200',
    defaultIcon: AlertTriangle,
  },
  danger: {
    containerClass:
      'border-rose-500/25 bg-rose-50/70 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
    titleClass: 'text-rose-800 dark:text-rose-300',
    defaultIcon: AlertCircle,
  },
  success: {
    containerClass:
      'border-emerald-500/20 bg-emerald-50/70 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
    titleClass: 'text-emerald-800 dark:text-emerald-300',
    defaultIcon: CheckCircle2,
  },
};

export const CalloutBox = React.memo(function CalloutBox({
  variant = 'tip',
  title,
  icon,
  action,
  children,
  className,
}: CalloutBoxProps) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.tip;
  const IconComponent = config.defaultIcon;

  return (
    <div
      role="region"
      className={cn(
        'relative rounded-xl border p-3.5 text-xs transition-colors',
        config.containerClass,
        className
      )}
    >
      {(title || icon || action) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 font-bold">
            {icon ? (
              <span className="shrink-0">{icon}</span>
            ) : (
              <IconComponent className={cn('h-3.5 w-3.5 shrink-0', config.titleClass)} />
            )}
            {title && (
              <span className={cn(config.titleClass, 'break-words')}>{title}</span>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="leading-relaxed break-words">{children}</div>
    </div>
  );
});
