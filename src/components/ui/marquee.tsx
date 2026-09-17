import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  gap?: string;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  gap = '1rem',
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden [--duration:40s] [--gap:1rem]',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
      style={{ '--gap': gap } as React.CSSProperties}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex shrink-0 justify-around gap-[--gap]',
              vertical
                ? '[animation:marquee-vertical_var(--duration)_linear_infinite] flex-col'
                : '[animation:marquee_var(--duration)_linear_infinite] flex-row',
              reverse && '[animation-direction:reverse]',
              pauseOnHover && 'group-hover:[animation-play-state:paused]'
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
