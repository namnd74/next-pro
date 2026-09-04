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
  Menu,
  X,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { DevProLogo } from './devpro-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLearningStore } from '@/features/learning/stores/use-learning-store';

const navLinks = [
  { href: '/', label: 'Overview', icon: Home, desc: 'Tổng quan nền tảng & tính năng' },
  {
    href: '/learn',
    label: 'Lộ Trình Học',
    icon: BookOpen,
    desc: 'React 19 & Next.js 16 80/20',
  },
  {
    href: '/interview',
    label: 'Phỏng Vấn',
    icon: Briefcase,
    desc: 'Ngân hàng câu hỏi Frontend',
  },
  {
    href: '/ai',
    label: 'AI System',
    icon: BrainCircuit,
    desc: 'Hệ thống AI & Prompt Engineering',
  },
  {
    href: '/offensive-security',
    label: 'Offensive Security',
    icon: Crosshair,
    desc: 'Bảo mật Web & Red Team Range',
    comingSoon: true,
  },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { streakDays, completedLessonIds } = useLearningStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isLinkActive = (link: (typeof navLinks)[number]) => {
    if (link.comingSoon) return false;
    if (link.href === '/') return pathname === '/';
    return pathname.startsWith(link.href);
  };

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="glass flex h-16 items-center justify-between rounded-2xl px-4 shadow-lg shadow-black/5 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="focus:outline-hidden">
            <DevProLogo
              concept="bolt"
              variant="horizontal"
              size="sm"
              glow
              animated
              transparent
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isLinkActive(link);

            if (link.comingSoon) {
              return (
                <div
                  key={link.href}
                  className="text-muted-foreground/60 flex cursor-not-allowed items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold select-none"
                  title={`${link.label} - Sắp ra mắt (Coming Soon)`}
                >
                  <Icon className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  <span>{link.label}</span>
                  <span className="py-0.2 rounded-full border border-amber-500/30 bg-amber-500/15 px-1.5 text-[9px] font-bold text-amber-500">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-visible:ring-ring flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-2">
          {mounted && completedLessonIds.length > 0 && (
            <Badge
              variant="outline"
              className="hidden items-center gap-1 border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 md:inline-flex dark:text-amber-400"
            >
              <Sparkles className="h-3 w-3" />
              <span>{streakDays}d streak</span>
            </Badge>
          )}

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hidden cursor-pointer gap-1.5 text-xs sm:inline-flex"
            onClick={() => {
              window.open('https://github.com', '_blank');
            }}
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </Button>

          {/* Mobile Menu Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer p-0 lg:hidden"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="glass-card border-border/70 animate-in fade-in slide-in-from-top-2 mt-2 flex flex-col gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl duration-200 lg:hidden">
          <div className="border-border/40 flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
              Menu Điều Hướng
            </span>
            {mounted && completedLessonIds.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
              >
                <Sparkles className="h-3 w-3" />
                <span>
                  {streakDays} ngày liên tục ({completedLessonIds.length} bài hoàn thành)
                </span>
              </Badge>
            )}
          </div>

          {/* Main Links */}
          <nav className="grid grid-cols-1 gap-1.5" aria-label="Mobile Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link);

              if (link.comingSoon) {
                return (
                  <div
                    key={link.href}
                    className="bg-muted/20 flex cursor-not-allowed items-start justify-between rounded-xl p-3 text-xs opacity-60 select-none"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-muted text-muted-foreground mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm font-bold">
                          {link.label}
                        </span>
                        <span className="text-muted-foreground/70 text-[11px] font-normal">
                          {link.desc}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                      Coming Soon
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 shadow-xs'
                      : 'text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{link.label}</span>
                    <span className="text-muted-foreground text-[11px] font-normal">
                      {link.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Learning Series Switcher */}
          <div className="bg-muted/40 border-border/40 space-y-2 rounded-xl border p-3">
            <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Khóa Học Nhanh
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/learn?domain=react"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-background text-foreground hover:border-primary/40 flex items-center gap-2 rounded-lg border border-transparent p-2.5 text-xs font-bold shadow-xs transition-all"
              >
                <Code2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <div className="flex flex-col">
                  <span>Seri React</span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    8 Lộ trình
                  </span>
                </div>
              </Link>

              <Link
                href="/learn?domain=nextjs"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-background text-foreground hover:border-primary/40 flex items-center gap-2 rounded-lg border border-transparent p-2.5 text-xs font-bold shadow-xs transition-all"
              >
                <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div className="flex flex-col">
                  <span>Seri Next.js</span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    4 Lộ trình
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
            <span>NextPro Fullstack Platform</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-foreground flex items-center gap-1 hover:underline"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub Repo</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
