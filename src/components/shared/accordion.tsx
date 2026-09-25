'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const Accordion = React.memo(function Accordion({
  title,
  subtitle,
  icon,
  badge,
  children,
  isExpanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  className,
  headerClassName,
  contentClassName,
}: AccordionProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);

  const isControlled = typeof controlledExpanded === 'boolean';
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  // Lazy-mount: don't mount inner children until opened once to keep DOM lightweight
  const [hasBeenExpanded, setHasBeenExpanded] = React.useState(isExpanded);

  React.useEffect(() => {
    if (isExpanded) {
      setHasBeenExpanded(true);
    }
  }, [isExpanded]);

  const handleToggle = React.useCallback(() => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [isControlled, onToggle]);

  return (
    <div
      className={cn(
        'border-border/80 bg-card overflow-hidden rounded-xl border transition-all',
        className
      )}
    >
      {/* Clickable Header */}
      <button
        type="button"
        role="button"
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className={cn(
          'hover:bg-muted/40 focus-visible:ring-primary flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-colors select-none focus:outline-hidden focus-visible:ring-2',
          headerClassName
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground text-sm font-semibold break-words">
                {title}
              </span>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-xs break-words">{subtitle}</p>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-300 ease-out',
            isExpanded && 'text-primary rotate-180'
          )}
        />
      </button>

      {/* Hardware-accelerated collapsible body */}
      <div
        className={cn(
          'accordion-grid border-border/60 transition-all duration-300 ease-out',
          isExpanded ? 'is-open border-t' : 'border-t-0'
        )}
      >
        <div className="accordion-overflow">
          {hasBeenExpanded && (
            <div
              className={cn(
                'text-foreground p-4 text-xs leading-relaxed break-words',
                contentClassName
              )}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
