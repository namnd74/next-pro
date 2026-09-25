import type { PlaygroundFile } from '../../types';
import type { FileSystemTree } from '@webcontainer/api';

export const INITIAL_NEXT_FILES: Record<string, PlaygroundFile> = {
  '/app/page.tsx': {
    path: '/app/page.tsx',
    content: `import { Suspense } from 'react';
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
  '/app/client-demo.tsx': {
    path: '/app/client-demo.tsx',
    content: `'use client';

import { useState } from 'react';
import { Sparkles, Server, Zap, Globe } from 'lucide-react';

export default function ClientDemo() {
  const [count, setCount] = useState(0);
  const [apiData, setApiData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function callRouteHandler() {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiData(JSON.stringify(data, null, 2));
    } catch (e) {
      setApiData('Lỗi gọi API: ' + String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 p-6 shadow-xl backdrop-blur">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next.js Curriculum · React</span>
        </div>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Next.js App Router chạy ngay trong trình duyệt
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Hệ điều hành Node.js ảo đang chạy trực tiếp trên trình duyệt của bạn qua WebAssembly.
          Chỉnh sửa code tại <code>app/page.tsx</code> để trải nghiệm Hot Reload tức thì!
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>State Counter: {count}</span>
          </button>

          <button
            onClick={callRouteHandler}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Server className="h-4 w-4 text-emerald-400" />
            <span>{loading ? 'Đang gọi API...' : 'Test API Route (/api/health)'}</span>
          </button>
        </div>
      </div>

      {apiData && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Globe className="h-3.5 w-3.5" />
            <span>Kết quả trả về từ Next.js Route Handler:</span>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200">
            {apiData}
          </pre>
        </div>
      )}
    </main>
  );
}
`,
  },
  '/app/layout.tsx': {
    path: '/app/layout.tsx',
    content: `import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js App Router Compatibility Sandbox',
  description: 'Next.js curriculum on a WebContainer-compatible runtime',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500/30">
        <div className="mx-auto max-w-3xl p-6">
          <header className="mb-8 flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/30">
                ▲
              </span>
              <span className="text-sm font-bold tracking-tight text-white">Next.js WebContainer Studio</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              Live In-Browser Node
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
`,
  },
  '/app/globals.css': {
    path: '/app/globals.css',
    content: `@import "tailwindcss";

:root {
  color-scheme: dark;
}

body {
  background-color: #020617;
  color: #f8fafc;
}
`,
  },
  '/app/api/health/route.ts': {
    path: '/app/api/health/route.ts',
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: 'WebAssembly (Wasm) WebContainer',
    timestamp: new Date().toISOString(),
    message: 'Hello from the Next.js compatibility runtime inside your browser!',
  });
}
`,
  },
  '/package.json': {
    path: '/package.json',
    content: JSON.stringify(
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
  '/next.config.mjs': {
    path: '/next.config.mjs',
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
  },
  '/postcss.config.mjs': {
    path: '/postcss.config.mjs',
    content: `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`,
  },
};

export function toFileSystemTree(files: Record<string, PlaygroundFile>): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const file of Object.values(files)) {
    const parts = file.path.replace(/^\//, '').split('/').filter(Boolean);
    let directory = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        directory[part] = { file: { contents: file.content } };
        return;
      }

      const existing = directory[part];
      if (!existing || !('directory' in existing)) {
        directory[part] = { directory: {} };
      }
      const next = directory[part];
      if ('directory' in next) directory = next.directory;
    });
  }

  return tree;
}
