import type { LearningLesson, LearningTrack } from '../types';

/**
 * Sinh bộ file Sandbox thực hành tương tác trực quan cho bài học React / Next.js
 * khi bài học chưa có file lab tĩnh riêng.
 */
export function generateDynamicLabFiles(
  lesson: LearningLesson,
  track: LearningTrack,
  isNextJs: boolean
): { initialFiles: Record<string, string>; instructions: string } {
  const safeTitle = lesson.title.replace(/"/g, "'");
  const safeSummary = lesson.summary.replace(/"/g, "'");
  const keyPoint1 =
    lesson.keyPoints?.[0]?.replace(/"/g, "'") || 'Nắm vững kiến trúc và vòng đời render';
  const keyPoint2 =
    lesson.keyPoints?.[1]?.replace(/"/g, "'") ||
    'Tối ưu hóa state và giảm thiểu re-render không cần thiết';

  if (isNextJs) {
    // Cấu hình file cho Next.js 16 App Router (WebContainer)
    const pageContent = `'use client';

import React, { useState, useTransition } from 'react';
import { Sparkles, Terminal, Cpu, CheckCircle2, ArrowRight, RefreshCw, Zap } from 'lucide-react';

export default function NextAppPage() {
  const [data, setData] = useState<{ status: string; timestamp: string; latencyMs: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionLogs, setActionLogs] = useState<string[]>([
    '🟢 [Next.js 16 Runtime] App Router sẵn sàng...',
    '⚡ Lab Topic: ${safeTitle}'
  ]);

  const runSimulation = () => {
    startTransition(async () => {
      const start = Date.now();
      // Mô phỏng Server Action / Route Handler request
      await new Promise((resolve) => setTimeout(resolve, 350));
      const latency = Date.now() - start;
      const res = {
        status: 'SUCCESS (200 OK)',
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: latency,
      };
      setData(res);
      setActionLogs((prev) => [
        \`⚡ [Server Action] Xử lý thành công sau \${latency}ms - Payload committed!\`,
        ...prev.slice(0, 5)
      ]);
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next.js 16 App Router · Interactive Lab</span>
        </div>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          ${safeTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          ${safeSummary}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded bg-slate-800 px-2 py-1 font-mono text-indigo-300">
            Track: ${track.title}
          </span>
          <span className="rounded bg-slate-800 px-2 py-1 font-mono text-emerald-300">
            Level: ${lesson.level.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Interactive Controls & Live Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Playground Action */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold flex items-center gap-2 text-white">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Interactive Action Dispatcher</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Live WebContainer</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Nhấn nút bên dưới để mô phỏng một Server Action gọi dữ liệu với \`useTransition\` trong Next.js 16:
          </p>

          <button
            onClick={runSimulation}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={\`h-4 w-4 \${isPending ? 'animate-spin' : ''}\`} />
            <span>{isPending ? 'Đang gọi Server Action...' : 'Kích Hoạt Server Action (Demo)'}</span>
          </button>

          {data && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Response từ Next.js Server Handler:</span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-200">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Panel 2: Real-time Runtime Logs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span>Runtime Event Log</span>
              </h2>
              <button
                onClick={() => setActionLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
              >
                Clear
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
              {actionLogs.length === 0 ? (
                <div className="text-slate-600 italic">Chưa có sự kiện nào...</div>
              ) : (
                actionLogs.map((log, i) => (
                  <div key={i} className="p-1.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300 text-[11px]">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs space-y-1 text-slate-300">
            <span className="font-bold text-indigo-300">💡 Challenge thực hành:</span>
            <p className="text-[11px] text-slate-400">
              Hãy thử mở file <code className="text-white">app/page.tsx</code>, thêm một trường dữ liệu mới vào response và xem hot reload cập nhật ngay trên giao diện!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
`;

    const serverPageContent = `import { Suspense } from 'react';
import ClientDemo from './client-demo';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 font-mono text-xs">Đang tải interactive lab...</div>}>
      <ClientDemo />
    </Suspense>
  );
}
`;

    return {
      initialFiles: {
        '/app/page.tsx': serverPageContent,
        '/app/client-demo.tsx': pageContent,
      },
      instructions: `Thực hành Next.js 16: ${lesson.title}. Bạn có thể tự do chỉnh sửa client state tại app/client-demo.tsx và server component boundary tại app/page.tsx, chạy thử Server Action và kiểm tra kết quả tức thì.`,
    };
  }

  // Cấu hình file cho React 19 (React-lite Playground)
  const reactAppContent = `import React, { useState } from 'react';
import { Sparkles, Code2, CheckCircle2, RotateCcw, Activity, ArrowRight, Shield } from 'lucide-react';

export default function App() {
  const [state, setState] = useState({
    activeItem: 'Demo Feature',
    counter: 0,
    history: ['Khởi tạo Component với State ban đầu'],
    flag: true,
  });

  const handleAction = () => {
    setState((prev) => ({
      ...prev,
      counter: prev.counter + 1,
      history: [
        \`Cập nhật State lần \${prev.counter + 1} lúc \${new Date().toLocaleTimeString()}\`,
        ...prev.history.slice(0, 4),
      ],
    }));
  };

  const handleToggle = () => {
    setState((prev) => ({ ...prev, flag: !prev.flag }));
  };

  const handleReset = () => {
    setState({
      activeItem: 'Demo Feature',
      counter: 0,
      history: ['Đã reset về trạng thái ban đầu'],
      flag: true,
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* Lesson Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-900/40 p-5 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 p-1">
            <Code2 className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            React 19 Lab Studio
          </span>
        </div>
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          ${safeTitle}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          ${safeSummary}
        </p>
      </div>

      {/* Interactive Controls Area */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bảng Điều Khiển Tương Tác
            </span>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAction}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              Kích Hoạt State Dispatch (+1)
            </button>

            <button
              onClick={handleToggle}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Đổi Flag: {state.flag ? '🟢 BẬT' : '⚪ TẮT'}
            </button>
          </div>

          {/* Real-time State Visualizer */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
                Live State Inspector
              </span>
              <span className="text-[11px] font-mono text-slate-400">UI = f(State)</span>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
        </div>

        {/* Task Box */}
        <div className="p-4 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-500/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Nhiệm vụ thử nghiệm (Challenge)</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
            <li>${keyPoint1}</li>
            <li>${keyPoint2}</li>
            <li>Mở file <code className="font-mono font-bold text-cyan-600 dark:text-cyan-300">App.tsx</code> để tự do thử nghiệm cú pháp mới của React 19!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
`;

  return {
    initialFiles: {
      '/index.html': STANDARD_REACT_INDEX_HTML,
      '/src/main.tsx': STANDARD_REACT_MAIN_TSX,
      '/src/App.tsx': reactAppContent,
      '/src/index.css': '/* Custom playground styles */\n',
    },
    instructions: `Thực hành React 19: ${lesson.title}. Bạn có thể xem cấu trúc index.html, main.tsx và trực tiếp chỉnh sửa component trong src/App.tsx.`,
  };
}

export const STANDARD_REACT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NextPro React Studio</title>
  </head>
  <body>
    <!-- Container DOM duy nhất của ứng dụng Single Page (SPA) -->
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

export const STANDARD_REACT_MAIN_TSX = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Trái tim khởi động: Tìm phần tử #root và kích hoạt chu kỳ render
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}`;

export function ensureStandardReactProjectFiles<
  T extends string | { path?: string; content: string },
>(rawFiles: Record<string, T>): Record<string, T> {
  const result: Record<string, T> = {};

  for (const [key, val] of Object.entries(rawFiles)) {
    const cleanKey = key.startsWith('/') ? key : `/${key}`;

    if (cleanKey === '/index.html') {
      result['/index.html'] = val;
    } else if (cleanKey === '/src/main.tsx' || cleanKey === '/main.tsx') {
      result['/src/main.tsx'] = val;
    } else if (cleanKey.startsWith('/src/')) {
      result[cleanKey] = val;
    } else if (cleanKey === '/App.tsx' || cleanKey === '/App.jsx') {
      result['/src/App.tsx'] = val;
    } else if (cleanKey === '/styles.css' || cleanKey === '/index.css') {
      result['/src/index.css'] = val;
    } else {
      // Subfolders like /components/... or /data/... go under /src/...
      result[`/src${cleanKey}`] = val;
    }
  }

  // Ensure index.html
  if (!result['/index.html']) {
    result['/index.html'] = STANDARD_REACT_INDEX_HTML as unknown as T;
  }

  // Ensure src/main.tsx
  if (!result['/src/main.tsx']) {
    result['/src/main.tsx'] = STANDARD_REACT_MAIN_TSX as unknown as T;
  }

  // Ensure src/index.css
  if (!result['/src/index.css']) {
    result['/src/index.css'] = '/* Custom playground styles */\n' as unknown as T;
  }

  return result;
}
