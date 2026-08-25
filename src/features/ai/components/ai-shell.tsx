'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AiSidebar } from './ai-sidebar';
import type { AiTrackNavigation } from '../types';

interface AiShellProps {
  children: React.ReactNode;
  tracks: AiTrackNavigation[];
}

export function AiShell({ children, tracks }: AiShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="relative flex gap-6">
      <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[280px] shrink-0 lg:block">
        <div className="glass border-border/60 h-full rounded-2xl border p-3">
          <AiSidebar tracks={tracks} />
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed right-5 bottom-5 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition-transform active:scale-95 lg:hidden"
        aria-label="Mở menu AI Engineering"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu AI Engineering"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
          />
          <div className="bg-background absolute inset-y-0 left-0 w-[310px] max-w-[88vw] p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground mb-2 ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="h-[calc(100%-3rem)]">
              <AiSidebar tracks={tracks} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 space-y-8">{children}</main>
    </div>
  );
}
