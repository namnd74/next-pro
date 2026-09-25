import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Marquee } from '@/components/ui/marquee';
import { HeroDevice } from '@/components/landing-hero-device';

const TECH_STACK = [
  'Next.js',
  'React',
  'TypeScript',
  'TanStack Query',
  'Zustand',
  'Tailwind CSS',
  'WebContainer API',
  'Playwright',
  'shadcn/ui',
  'CodeMirror',
  'Husky',
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden">
      {/* Subtle grid background (Dark mode only to prevent Hermann grid optical strain in light mode) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Purple radial glow behind laptop on the right (Dark mode only) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -right-24 h-[480px] w-[600px] -translate-y-1/2 rounded-full bg-gradient-to-l from-purple-600/20 via-indigo-600/10 to-transparent opacity-0 blur-3xl dark:opacity-100"
      />

      {/* Main 2-Column Hero Area (Vertically Centered in remaining space) */}
      <div className="relative z-10 mx-auto my-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 items-center gap-6 px-4 py-2 sm:gap-8 sm:px-6 sm:py-4 lg:grid-cols-12 lg:gap-8 xl:gap-12">
        {/* Left Column (5 cols): Badge, Headline, Subtitle, Buttons */}
        <div className="flex flex-col items-center gap-4 text-center sm:gap-5 lg:col-span-5 lg:items-start lg:text-left xl:gap-6">
          {/* Pill Badge */}
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            Fast-Track to Production Ready
          </div>

          {/* Headline */}
          <h1 className="text-foreground text-3xl leading-[1.12] font-extrabold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl dark:text-white">
            Làm chủ
            <br />
            React &{' '}
            <span className="text-primary dark:bg-gradient-to-r dark:from-indigo-400 dark:via-purple-400 dark:to-sky-400 dark:bg-clip-text dark:text-transparent">
              Next.js
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground -mt-1 text-xl font-semibold tracking-tight sm:-mt-2 sm:text-2xl lg:text-3xl dark:text-slate-400">
            bằng cách thực sự làm.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 lg:justify-start">
            <Link href="/learn">
              <Button
                size="lg"
                className="bg-foreground text-background cursor-pointer rounded-xl px-6 py-5 text-sm font-semibold shadow-lg shadow-stone-900/10 hover:opacity-90 sm:px-7 sm:py-6 sm:text-base dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Bắt đầu học ngay
              </Button>
            </Link>
            <Link href="/interview">
              <Button
                variant="outline"
                size="lg"
                className="border-border bg-card/90 text-foreground hover:bg-muted/70 cursor-pointer rounded-xl border px-6 py-5 text-sm font-semibold shadow-xs sm:px-7 sm:py-6 sm:text-base dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Luyện phỏng vấn
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column (7 cols): MacBook Pro Device */}
        <div className="flex min-h-0 w-full justify-center lg:col-span-7 lg:justify-end">
          <HeroDevice />
        </div>
      </div>

      {/* Marquee Strip pinned flush to the bottom */}
      <div className="relative z-10 mt-auto w-full shrink-0">
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent sm:w-28" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l to-transparent sm:w-28" />
        <Marquee
          pauseOnHover
          gap="2rem"
          className="border-border/30 bg-background/90 border-t py-2.5 [--duration:25s] sm:py-3.5"
        >
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="text-muted-foreground/70 mx-3 text-xs font-medium whitespace-nowrap sm:mx-4 sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
