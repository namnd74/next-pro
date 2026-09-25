'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './header';
import { FeedbackModal } from './feedback-modal';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobileRoute = () => {
      try {
        const search = window.location.search || '';
        if (search.includes('desktop=true')) {
          sessionStorage.setItem('devpro_force_desktop', 'true');
          return;
        }
        if (search.includes('desktop=false')) {
          sessionStorage.removeItem('devpro_force_desktop');
        }
        if (sessionStorage.getItem('devpro_force_desktop') === 'true') {
          return;
        }

        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) ||
          (window.innerWidth > 0 && window.innerWidth < 768);

        if (isMobile && !pathname.startsWith('/interview')) {
          router.replace('/interview');
        }
      } catch {
        // Ignore errors in restricted contexts
      }
    };

    checkMobileRoute();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedCheckMobile = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobileRoute, 150);
    };

    window.addEventListener('resize', debouncedCheckMobile);
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedCheckMobile);
    };
  }, [pathname, router]);

  const footer = (
    <footer className="border-border/30 text-muted-foreground/70 bg-background/90 border-t py-6 text-xs">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold">dev-pro</span>
          <span>— Thực chiến Frontend React, Next.js & Luyện phỏng vấn</span>
        </div>
        <div className="text-muted-foreground/60 flex flex-wrap items-center gap-4">
          <a
            href="mailto:contact@dev-pro.online"
            className="text-muted-foreground/80 font-mono transition-colors hover:text-indigo-400"
          >
            contact@dev-pro.online
          </a>
          <span>•</span>
          <span>Code thật. Phỏng vấn thật.</span>
        </div>
      </div>
    </footer>
  );

  if (isHome) {
    return (
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* First View: Exactly 100vh from Header to Marquee */}
        <div className="relative flex h-dvh min-h-dvh flex-col justify-between overflow-hidden">
          <Header />
          <main className="flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden">
            {children}
          </main>
        </div>

        {/* Scrollable Footer below 100vh */}
        {footer}

        <FeedbackModal />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      {footer}
      <FeedbackModal />
    </div>
  );
}
