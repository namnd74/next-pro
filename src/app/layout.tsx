import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { AppProviders } from '@/providers';
import { AppShell } from '@/components/common/app-shell';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-app-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'dev-pro',
  description:
    'Modern Fullstack & Enterprise Platform with Next.js, React, TypeScript, Go, TanStack Query, Tailwind CSS, and Zustand.',
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Go',
    'shadcn/ui',
    'TailwindCSS',
    'TanStack Query',
    'Zustand',
    'Axios',
  ],
  authors: [{ name: 'Antigravity Dev' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
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
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={plusJakartaSans.variable}
    >
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
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
