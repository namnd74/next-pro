import * as React from 'react';
import Link from 'next/link';
import { Shield, Terminal, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OffensiveSecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border/50 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Về Trang Chủ</span>
            </Link>
            <span className="text-border/60 font-mono">/</span>
            <Link
              href="/offensive-security"
              className="text-foreground hover:text-primary flex items-center gap-2 font-bold tracking-tight transition-colors"
            >
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-black">OffSec Academy</span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-500"
              >
                RANGE v2.0
              </Badge>
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/offensive-security/academy"
              className="border-border/40 bg-card/60 text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:border-emerald-500/40"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-500" />
              <span>Lộ Trình 19 Tracks</span>
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
