'use client';

import * as React from 'react';
import { RefreshCw, ShieldAlert, Bug, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';

/**
 * 💡 TẠI SAO PHẢI VIẾT CLASS COMPONENT NÀY MÀ REACT KHÔNG SHIP SẴN?
 *
 * 1. React Core Team chỉ cung cấp 2 primitive lifecycle methods: `getDerivedStateFromError` và `componentDidCatch`.
 *    React KHÔNG ship sẵn 1 component `<ErrorBoundary>` mặc định vì mỗi ứng dụng/framework lại có thiết kế Fallback UI khác nhau hoàn toàn.
 * 2. Trong Next.js 15 App Router: Next.js ĐÃ VIẾT SẴN Class Engine này ngầm cho bạn! Khi bạn tạo file `error.tsx`,
 *    Next.js tự động bọc Class Engine này xung quanh Functional Component `error.tsx` của bạn.
 * 3. Trong React thuần (Vite/CRA): Bạn tự định nghĩa Class Engine này 1 lần (hoặc dùng package `react-error-boundary`).
 */
interface InternalErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (props: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode;
  onReset?: () => void;
}

interface InternalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class InternalErrorBoundary extends React.Component<
  InternalErrorBoundaryProps,
  InternalErrorBoundaryState
> {
  constructor(props: InternalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): InternalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[React Error Boundary caught error]:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    return this.props.children;
  }
}

// 2. Functional Component Wrapper (Modern React Functional API Pattern)
// Giúp Lập trình viên sử dụng ErrorBoundary dưới dạng Functional Component 100%!
export interface FunctionalErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export function ErrorBoundary({
  children,
  fallbackTitle = 'React Error Boundary: Đã khoanh vùng và bắt lỗi thành công!',
  onReset,
}: FunctionalErrorBoundaryProps) {
  return (
    <InternalErrorBoundary
      onReset={onReset}
      fallback={({ error, resetErrorBoundary }) => (
        <div className="space-y-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-left animate-in fade-in-50">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
                {fallbackTitle}
              </h4>
            </div>

            <Badge variant="destructive" className="font-mono text-[10px]">
              CRASH ISOLATED
            </Badge>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Nhờ có <strong>Functional Error Boundary Wrapper</strong> (mô hình như package{' '}
            <code>react-error-boundary</code> &amp; Next.js <code>error.tsx</code>), lỗi
            JavaScript chỉ khoanh vùng component con bị hỏng mà không làm sập toàn bộ
            trang web.
          </p>

          <CodeBlock
            code={`// Caught Error Message:\n${error.message}`}
            language="bash"
            showCopyButton={false}
          />

          <div className="flex items-center justify-end pt-2">
            <Button
              onClick={resetErrorBoundary}
              variant="outline"
              size="sm"
              className="gap-2 border-red-500/30 text-xs font-semibold hover:bg-red-500/20 hover:text-red-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Khôi phục UI (Reset Error Boundary)</span>
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </InternalErrorBoundary>
  );
}

// 3. Functional Component Con Bị Lỗi (Buggy Widget)
function BuggyWidget() {
  const [shouldCrash, setShouldCrash] = React.useState(false);

  if (shouldCrash) {
    throw new Error(
      '💥 TypeError: Cannot read property "undefined_user_avatar" of null (Render Crash Triggered)'
    );
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-foreground">
            Functional Component Con Đang Chạy Mượt Mà
          </h5>
          <p className="text-[11px] text-muted-foreground">
            Bấm nút bên cạnh để giả lập lỗi Runtime Render Crash trong Functional
            Component.
          </p>
        </div>
      </div>

      <Button
        onClick={() => setShouldCrash(true)}
        variant="destructive"
        size="sm"
        className="shrink-0 gap-2 text-xs font-semibold shadow-md shadow-red-500/20"
      >
        <Bug className="h-3.5 w-3.5" />
        <span>Cố Tình Gây Lỗi (Trigger Crash)</span>
      </Button>
    </div>
  );
}

// 4. Main Functional Playground Page
export function ErrorBoundaryDemo() {
  return (
    <Card className="glass-card space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-2 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-0.5 text-xs font-semibold text-red-500">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Functional React Error Boundary Simulator</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Thực Nghiệm Khoanh Vùng Lỗi Với Functional Component Error Boundary
          </h3>
        </div>

        <Badge
          variant="outline"
          className="w-fit font-mono text-xs text-muted-foreground"
        >
          Functional Component API
        </Badge>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Lập trình viên sử dụng <strong>Functional Component API</strong> để bọc các nhánh
        giao diện. Trong Next.js 15, file <code>error.tsx</code> chính là một Functional
        Component nhận vào <code>{'{ error, reset }'}</code>!
      </p>

      {/* Modern Functional Component Usage */}
      <ErrorBoundary>
        <BuggyWidget />
      </ErrorBoundary>
    </Card>
  );
}
