import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { AppProviders } from '@/providers';
import { Header } from '@/components/common/header';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-app-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'NextPro - Production Ready Enterprise Template',
  description:
    'Modern Next.js 16 template with shadcn/ui, TanStack Query, Axios, Tailwind CSS, Zustand, ESLint, Prettier, and Husky pre-commit hooks.',
  keywords: [
    'Next.js',
    'React 19',
    'shadcn/ui',
    'TailwindCSS',
    'TanStack Query',
    'Zustand',
    'Axios',
    'TypeScript',
  ],
  authors: [{ name: 'Antigravity Dev' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';

  return (
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.coepCredentialless = true;',
          }}
        />
        <script src={`${basePath}/coi-serviceworker.min.js`} async />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative flex min-h-screen flex-col font-sans antialiased"
      >
        {/* Background gradient decorations */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="from-primary/15 absolute -top-40 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 bg-gradient-to-b via-indigo-500/5 to-transparent opacity-70 blur-3xl dark:opacity-40" />
        </div>

        <AppProviders>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <footer className="border-border/40 text-muted-foreground border-t py-6 text-center text-xs">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
                <span>
                  © {new Date().getFullYear()} NextPro Starter. All rights reserved.
                </span>
                <span className="flex items-center gap-2">
                  Built with{' '}
                  <span className="text-primary font-semibold">UI/UX Pro Max</span>{' '}
                  guidelines
                </span>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
