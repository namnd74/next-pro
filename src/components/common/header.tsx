'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Sparkles,
  BookOpen,
  Briefcase,
  Home,
  Github,
  Crosshair,
  BrainCircuit,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RED_TEAM_COMING_SOON } from '@/config/features';
import { useLearningStore } from '@/features/learning/stores/use-learning-store';

const navLinks = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/learn', label: 'Lộ Trình Học', icon: BookOpen },
  { href: '/interview', label: 'Phỏng Vấn', icon: Briefcase },
  { href: '/ai', label: 'AI', icon: BrainCircuit },
  { href: '/rt', label: 'Red Team', icon: Crosshair, comingSoon: RED_TEAM_COMING_SOON },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const { streakDays, completedLessonIds } = useLearningStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="glass flex h-16 items-center justify-between rounded-2xl px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="to-primary flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground flex items-center gap-1.5 text-base font-bold tracking-tight">
                NextPro
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground -mt-1 text-[10px] font-medium tracking-widest uppercase">
                React & Next
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            if (link.comingSoon) {
              return (
                <span
                  key={link.href}
                  aria-disabled="true"
                  title={`${link.label} — Coming Soon`}
                  className="text-muted-foreground flex cursor-not-allowed items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold opacity-60"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden md:inline">{link.label}</span>
                  <span className="hidden rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-600 uppercase lg:inline dark:text-amber-400">
                    Soon
                  </span>
                </span>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-visible:ring-ring flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-2">
          {mounted && completedLessonIds.length > 0 && (
            <Badge
              variant="outline"
              className="hidden items-center gap-1 border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 md:inline-flex dark:text-amber-400"
            >
              <Sparkles className="h-3 w-3" />
              <span>{streakDays}d streak</span>
            </Badge>
          )}

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 text-xs lg:inline-flex"
            onClick={() => {
              window.open('https://github.com', '_blank');
            }}
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
