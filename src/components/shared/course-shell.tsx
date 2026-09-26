'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  mobileMenuLabel?: string;
  mobileButtonGradient?: string;
  sidebarWidthClass?: string;
}

export function CourseShell({
  children,
  sidebar,
  mobileMenuLabel = 'Mở danh mục bài học',
  mobileButtonGradient = 'from-indigo-500 to-violet-500 shadow-indigo-500/30',
  sidebarWidthClass = 'w-[290px] xl:w-[310px]',
}: CourseShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex gap-6">
      <aside
        className={cn(
          'sticky top-24 hidden h-[calc(100vh-8rem)] shrink-0 lg:block',
          sidebarWidthClass
        )}
      >
        <div className="glass border-border/60 h-full rounded-2xl border p-3">
          {sidebar}
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={cn(
          'fixed right-5 bottom-5 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg transition-transform active:scale-95 lg:hidden',
          mobileButtonGradient
        )}
        aria-label={mobileMenuLabel}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
          />
          <div className="bg-background absolute inset-y-0 left-0 w-[300px] max-w-[85vw] p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground mb-2 ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="h-[calc(100%-3rem)]">{sidebar}</div>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
