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
        {/* Mobile device redirection to /interview for static export */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var search = window.location.search || '';
                  if (search.indexOf('desktop=true') !== -1) {
                    sessionStorage.setItem('devpro_force_desktop', 'true');
                    return;
                  }
                  if (search.indexOf('desktop=false') !== -1) {
                    sessionStorage.removeItem('devpro_force_desktop');
                  }
                  if (sessionStorage.getItem('devpro_force_desktop') === 'true') {
                    return;
                  }
                  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth > 0 && window.innerWidth < 768);
                  var basePath = '${basePath}';
                  var target = basePath + '/interview';
                  var pathname = window.location.pathname || '';
                  var targetNormalized = target.replace(/\\/+$/, '');
                  var pathNormalized = pathname.replace(/\\/+$/, '');
                  if (isMobile && pathNormalized !== targetNormalized && !pathNormalized.startsWith(targetNormalized + '/')) {
                    window.location.replace(target);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative flex min-h-screen flex-col font-sans antialiased"
      >
        {/* Background gradient decorations (Dark mode only to prevent glare in Light mode) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="from-primary/15 absolute -top-40 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 bg-gradient-to-b via-indigo-500/5 to-transparent opacity-0 blur-3xl dark:opacity-40" />
        </div>

        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
