'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
