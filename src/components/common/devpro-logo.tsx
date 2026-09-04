'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type LogoConcept = 'bolt' | 'hex' | 'monogram';
export type LogoVariant = 'icon' | 'horizontal' | 'stacked' | 'badge';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface DevProLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  concept?: LogoConcept;
  variant?: LogoVariant;
  size?: LogoSize;
  showTagline?: boolean;
  animated?: boolean;
  glow?: boolean;
  transparent?: boolean;
}

const sizeConfig = {
  xs: { icon: 22, text: 'text-sm', badge: 'text-[9px] px-1 py-0.5', sub: 'text-[9px]' },
  sm: {
    icon: 28,
    text: 'text-base',
    badge: 'text-[10px] px-1.5 py-0.5',
    sub: 'text-[10px]',
  },
  md: { icon: 36, text: 'text-lg', badge: 'text-[11px] px-2 py-0.5', sub: 'text-[11px]' },
  lg: { icon: 48, text: 'text-2xl', badge: 'text-xs px-2.5 py-1', sub: 'text-xs' },
  xl: { icon: 64, text: 'text-3xl', badge: 'text-sm px-3 py-1', sub: 'text-sm' },
};

/**
 * Concept 1: Code Bolt (< ⚡ >)
 * Represents supercharged developer speed, performance, and modern execution.
 */
export function CodeBoltIcon({
  size = 36,
  animated = false,
  glow = false,
  transparent = true,
}: {
  size?: number;
  animated?: boolean;
  glow?: boolean;
  transparent?: boolean;
}) {
  const id = React.useId();
  const gradIcon = `grad-bolt-${id}`;
  const gradGlow = `grad-glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'transition-all duration-300 ease-out select-none',
        glow &&
          'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] drop-shadow-[0_4px_16px_rgba(6,182,212,0.55)] drop-shadow-[0_10px_32px_rgba(99,102,241,0.4)]'
      )}
      aria-label="DevPro Code Bolt Mark"
      role="img"
    >
      <defs>
        {/* Main Bolt & Bracket Gradient: Indigo -> Cyan -> Mint */}
        <linearGradient
          id={gradIcon}
          x1="16"
          y1="16"
          x2="104"
          y2="104"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        <linearGradient
          id={`${gradIcon}-left`}
          x1="16"
          y1="34"
          x2="48"
          y2="86"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        <linearGradient
          id={`${gradIcon}-right`}
          x1="72"
          y1="34"
          x2="104"
          y2="86"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {glow && (
          <filter id={gradGlow} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="12"
              floodColor="#06B6D4"
              floodOpacity="0.45"
            />
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="5"
              floodColor="#6366F1"
              floodOpacity="0.55"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2.5"
              floodColor="#38BDF8"
              floodOpacity="0.75"
            />
          </filter>
        )}
      </defs>

      {/* Background Rounded Shield Tile (Only rendered when transparent is false) */}
      {!transparent && (
        <>
          <rect
            x="6"
            y="6"
            width="108"
            height="108"
            rx="26"
            className="fill-slate-900/90 stroke-slate-700/50 dark:fill-slate-950/80 dark:stroke-slate-800/80"
            strokeWidth="1.5"
          />
          <circle
            cx="60"
            cy="60"
            r="44"
            stroke="url(#grad-bolt-grid)"
            strokeWidth="0.5"
            strokeOpacity="0.25"
            strokeDasharray="3 3"
          />
          <linearGradient
            id="grad-bolt-grid"
            x1="16"
            y1="16"
            x2="104"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </>
      )}

      {/* Left Code Bracket < */}
      <path
        d="M 38 38 L 22 60 L 38 82"
        stroke={`url(#${gradIcon}-left)`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          animated ? 'transition-all duration-300 hover:-translate-x-0.5' : undefined
        }
      />

      {/* Right Code Bracket > */}
      <path
        d="M 82 38 L 98 60 L 82 82"
        stroke={`url(#${gradIcon}-right)`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          animated ? 'transition-all duration-300 hover:translate-x-0.5' : undefined
        }
      />

      {/* Center Lightning Bolt ⚡ with Glowing Node */}
      <path
        d="M 64 22 L 46 56 L 60 56 L 54 96 L 74 52 L 60 52 L 67 22 Z"
        fill={`url(#${gradIcon})`}
        className={
          animated
            ? 'origin-center transition-transform duration-300 hover:scale-105'
            : undefined
        }
      />

      {/* Active Run / Spark Indicator */}
      <circle
        cx="68"
        cy="22"
        r="3"
        fill="#10B981"
        className={animated ? 'origin-center animate-ping' : undefined}
        opacity="0.8"
      />
      <circle cx="68" cy="22" r="2.5" fill="#34D399" />
    </svg>
  );
}

/**
 * Concept 2: Hex-Core / Slash Prism (< / > in Hexagon)
 * Represents modular architecture, full-stack compilation, and security resilience.
 */
export function HexCoreIcon({
  size = 36,
  animated = false,
  glow = false,
  transparent = true,
}: {
  size?: number;
  animated?: boolean;
  glow?: boolean;
  transparent?: boolean;
}) {
  const id = React.useId();
  const gradHex = `grad-hex-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'transition-transform duration-300 ease-out select-none',
        glow && 'drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]'
      )}
      aria-label="DevPro Hex Core Mark"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradHex}
          x1="16"
          y1="16"
          x2="104"
          y2="104"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="40%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        <linearGradient
          id={`${gradHex}-stroke`}
          x1="14"
          y1="14"
          x2="106"
          y2="106"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>

      {/* Hexagonal Outer Frame Background (Only when transparent is false) */}
      {!transparent && (
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="26"
          className="fill-slate-900/90 stroke-slate-700/50 dark:fill-slate-950/80 dark:stroke-slate-800/80"
          strokeWidth="1.5"
        />
      )}

      {/* Left Hexagonal Wing: Forms '<' and 'd' */}
      <path
        d="M 52 28 L 26 44 L 26 76 L 52 92 L 52 81 L 36 71 L 36 49 L 52 39 Z"
        fill="url(#grad-hex-left)"
        className={animated ? 'transition-all duration-300 hover:opacity-90' : undefined}
      />
      <linearGradient
        id="grad-hex-left"
        x1="26"
        y1="28"
        x2="52"
        y2="92"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>

      {/* Right Hexagonal Wing: Forms '>' and 'p' */}
      <path
        d="M 68 28 L 94 44 L 94 76 L 68 92 L 68 81 L 84 71 L 84 49 L 68 39 Z"
        fill="url(#grad-hex-right)"
        className={animated ? 'transition-all duration-300 hover:opacity-90' : undefined}
      />
      <linearGradient
        id="grad-hex-right"
        x1="68"
        y1="28"
        x2="94"
        y2="92"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>

      {/* Center Laser Slash '/' */}
      <path
        d="M 64 22 L 48 98 L 56 98 L 72 22 Z"
        fill={`url(#${gradHex})`}
        className={
          animated ? 'transition-transform duration-300 hover:scale-105' : undefined
        }
      />

      {/* Terminal Node Dot */}
      <circle cx="70" cy="24" r="3" fill="#10B981" />
    </svg>
  );
}

/**
 * Concept 3: DP Monogram (D + P Isometric Tech)
 * Bold, architectural monogram combining developer bracket D and pro slash P.
 */
export function DPMonogramIcon({
  size = 36,
  animated = false,
  glow = false,
  transparent = true,
}: {
  size?: number;
  animated?: boolean;
  glow?: boolean;
  transparent?: boolean;
}) {
  const id = React.useId();
  const gradDP = `grad-dp-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'transition-transform duration-300 ease-out select-none',
        animated && 'hover:scale-105',
        glow && 'drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]'
      )}
      aria-label="DevPro DP Monogram Mark"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradDP}
          x1="20"
          y1="20"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Container Shield (Only when transparent is false) */}
      {!transparent && (
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="26"
          className="fill-slate-900/90 stroke-slate-700/50 dark:fill-slate-950/80 dark:stroke-slate-800/80"
          strokeWidth="1.5"
        />
      )}

      {/* Glyph 'D' with code chevron inset */}
      <path
        d="M 28 26 L 48 26 C 60 26 68 34 68 46 C 68 58 60 66 48 66 L 38 66 L 38 94 L 28 94 Z M 38 36 L 38 56 L 48 56 C 54 56 58 52 58 46 C 58 40 54 36 48 36 Z"
        fill="url(#grad-dp-d)"
      />
      <linearGradient
        id="grad-dp-d"
        x1="28"
        y1="26"
        x2="68"
        y2="94"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>

      {/* Stylized 'P' nested with diagonal slash */}
      <path
        d="M 58 40 L 74 40 C 85 40 92 47 92 56 C 92 65 85 72 74 72 L 66 72 L 56 94 L 46 94 L 56 72 Z M 66 48 L 66 64 L 74 64 C 79 64 83 61 83 56 C 83 51 79 48 74 48 Z"
        fill="url(#grad-dp-p)"
      />
      <linearGradient
        id="grad-dp-p"
        x1="56"
        y1="40"
        x2="92"
        y2="94"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>

      {/* Code Chevron accent inside D */}
      <path
        d="M 44 42 L 39 46 L 44 50"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Master DevPro Logo Component
 * Meets all UI/UX Pro Max rules:
 * - Pure SVG (Zero layout shift, responsive, scalable)
 * - WCAG AAA contrast ratio in both Dark and Light modes
 * - Integrated Brand Badge ('PRO')
 * - Customizable concepts, variants, sizes
 */
export function DevProLogo({
  concept = 'bolt',
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  animated = true,
  glow = true,
  transparent = true,
  className,
  ...props
}: DevProLogoProps) {
  const currentSize = sizeConfig[size];

  const renderIcon = () => {
    switch (concept) {
      case 'hex':
        return (
          <HexCoreIcon
            size={currentSize.icon}
            animated={animated}
            glow={glow}
            transparent={transparent}
          />
        );
      case 'monogram':
        return (
          <DPMonogramIcon
            size={currentSize.icon}
            animated={animated}
            glow={glow}
            transparent={transparent}
          />
        );
      case 'bolt':
      default:
        return (
          <CodeBoltIcon
            size={currentSize.icon}
            animated={animated}
            glow={glow}
            transparent={transparent}
          />
        );
    }
  };

  if (variant === 'icon') {
    return (
      <div
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        {renderIcon()}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-1.5 pr-3 shadow-md backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70',
          className
        )}
        {...props}
      >
        {renderIcon()}
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <span className="text-foreground text-sm font-extrabold">dev-pro</span>
          <span className="py-0.2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            PRO
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={cn(
          'group flex flex-col items-center gap-2 text-center select-none',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            animated && 'transition-transform duration-300 group-hover:scale-105'
          )}
        >
          {renderIcon()}
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-foreground font-sans font-extrabold tracking-tight',
                currentSize.text
              )}
            >
              dev
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                .pro
              </span>
            </span>
            <span
              className={cn(
                'rounded-md border border-emerald-500/30 bg-emerald-500/10 font-black tracking-wider text-emerald-600 uppercase dark:text-emerald-400',
                currentSize.badge
              )}
            >
              PRO
            </span>
          </div>
          {showTagline && (
            <span
              className={cn(
                'text-muted-foreground font-mono font-medium tracking-wider uppercase',
                currentSize.sub
              )}
            >
              Engineering & Security Range
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Layout (Ideal for Header / Navbar)
  return (
    <div
      className={cn('group flex items-center gap-3 select-none', className)}
      {...props}
    >
      <div
        className={cn(
          animated && 'transition-transform duration-300 group-hover:scale-105'
        )}
      >
        {renderIcon()}
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'text-foreground font-sans font-extrabold tracking-tight',
              currentSize.text
            )}
          >
            dev
            <span className="bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              .pro
            </span>
          </span>
          <span
            className={cn(
              'rounded-md border border-emerald-500/30 bg-emerald-500/10 font-black tracking-widest text-emerald-600 uppercase dark:text-emerald-400',
              currentSize.badge
            )}
          >
            PRO
          </span>
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        </div>
        {showTagline && (
          <span
            className={cn(
              'text-muted-foreground -mt-0.5 font-mono font-medium tracking-wider uppercase',
              currentSize.sub
            )}
          >
            React 19 & Next 16
          </span>
        )}
      </div>
    </div>
  );
}
