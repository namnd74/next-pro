'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterChipItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
  activeColorClass?: string;
}

export interface FilterChipGroupProps {
  items: FilterChipItem[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const FilterChipGroup = React.memo(function FilterChipGroup({
  items,
  selectedId,
  onChange,
  className,
  size = 'sm',
}: FilterChipGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;

        const defaultActiveClass = 'bg-primary text-primary-foreground shadow-xs';

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg font-semibold transition-all select-none active:scale-95',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm',
              isSelected
                ? item.activeColorClass || defaultActiveClass
                : 'border-border/50 bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border'
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'py-0.2 rounded-full px-1.5 font-mono text-[10px]',
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-background/60 text-muted-foreground'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
