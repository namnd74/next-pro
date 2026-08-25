'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="glass" size="icon" aria-label="Toggle theme" className="h-9 w-9">
        <span className="h-4 w-4 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="glass"
      size="icon"
      aria-label="Toggle theme"
      className="relative h-9 w-9 overflow-hidden transition-transform duration-200 hover:scale-105"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${
          isDark
            ? 'absolute scale-0 rotate-90 opacity-0'
            : 'scale-100 rotate-0 text-amber-500 opacity-100'
        }`}
      />
      <Moon
        className={`h-4 w-4 transition-all duration-300 ${
          isDark
            ? 'scale-100 rotate-0 text-indigo-400 opacity-100'
            : 'absolute scale-0 -rotate-90 opacity-0'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
