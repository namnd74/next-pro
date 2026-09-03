import type { FileSystemTree } from '@webcontainer/api';

export const DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'nextjs-wasm-sandbox',
          version: '0.1.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '15.4.1',
            react: '19.2.8',
            'react-dom': '19.2.8',
            'lucide-react': '^0.475.0',
          },
          devDependencies: {
            '@types/node': '^20.17.19',
            '@types/react': '^19.2.18',
            '@types/react-dom': '^19.2.5',
            '@tailwindcss/postcss': '^4.3.3',
            tailwindcss: '^4.3.3',
            typescript: '^5.7.3',
          },
        },
        null,
        2
      ),
    },
  },
  'next.config.mjs': {
    file: {
      contents: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
    },
  },
  'postcss.config.mjs': {
    file: {
      contents: `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`,
    },
  },
  app: {
    directory: {
      'layout.tsx': {
        file: {
          contents: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js App Router Compatibility Studio',
  description: 'Next.js 16 curriculum on a WebContainer-compatible Next.js 15.4 runtime',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
`,
        },
      },
      'page.tsx': {
        file: {
          contents: `import { Suspense } from 'react';
import ClientDemo from './client-demo';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 font-mono text-xs">Loading...</div>}>
      <ClientDemo />
    </Suspense>
  );
}
`,
        },
      },
      'client-demo.tsx': {
        file: {
          contents: `'use client';

import { useState } from 'react';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

export default function ClientDemo() {
  const [count, setCount] = useState(0);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiData(data);
    } catch (err: any) {
      setApiData({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Next.js App Router</h1>
              <p className="text-xs text-slate-400">Next 15.4 WebContainer compatibility runtime</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Server Active
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">React 19 State Counter</p>
              <p className="text-xs text-slate-400">Client-Side Interactivity</p>
            </div>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Đã bấm: {count} lần
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">Next.js Route Handler</p>
                <p className="text-xs text-slate-400">GET /api/health</p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-all shadow-lg shadow-indigo-500/20"
              >
                {loading ? 'Đang gọi...' : 'Test API Route'}
              </button>
            </div>

            {apiData && (
              <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/80">
          Chỉnh sửa code trong trình soạn thảo để thấy Hot Reload (HMR) cập nhật trực tiếp.
        </div>
      </div>
    </main>
  );
}
`,
        },
      },
      'globals.css': {
        file: {
          contents: `@import "tailwindcss";

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  padding: 0;
  background-color: #020617;
  color: #f8fafc;
}
`,
        },
      },
      api: {
        directory: {
          health: {
            directory: {
              'route.ts': {
                file: {
                  contents: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: 'Next.js 15.4.1 App Router (WebContainer compatibility runtime)',
    timestamp: new Date().toISOString(),
    message: 'Hello from the live Next.js Route Handler inside WebContainer!',
  });
}
`,
                },
              },
            },
          },
        },
      },
    },
  },
};
