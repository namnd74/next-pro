'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { SidebarContent } from './red-team-sidebar';

export function RedTeamShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Đóng drawer mỗi khi điều hướng
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex gap-6">
      {/* ── Desktop sidebar ── */}
      <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[280px] shrink-0 lg:block">
        <div className="glass h-full rounded-2xl border border-border/60 p-3">
          <SidebarContent />
        </div>
      </aside>

      {/* ── Mobile trigger + drawer ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95 lg:hidden"
        aria-label="Mở menu Red Team"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-background p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mb-2 ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-[calc(100%-3rem)]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="min-w-0 flex-1 space-y-8">{children}</main>
    </div>
  );
}
