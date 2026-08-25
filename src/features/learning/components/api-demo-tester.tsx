'use client';

import * as React from 'react';
import {
  Send,
  ShieldCheck,
  Database,
  Key,
  Clock,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';

type ApiEndpointKey =
  'auth-session' | 'users-cache' | 'security-headers' | 'silent-refresh';

interface ApiDemoConfig {
  key: ApiEndpointKey;
  title: string;
  endpoint: string;
  method: 'GET' | 'POST';
  icon: React.ReactNode;
  description: string;
}

const DEMO_ENDPOINTS: ApiDemoConfig[] = [
  {
    key: 'auth-session',
    title: 'Auth & HttpOnly Cookie Session',
    endpoint: '/api/auth/session',
    method: 'GET',
    icon: <Key className="h-4 w-4 text-purple-400" />,
    description:
      'Kiểm tra cấp HttpOnly Cookie session token an toàn từ Next.js App Router API Route.',
  },
  {
    key: 'users-cache',
    title: 'TanStack Query Data Caching',
    endpoint: '/api/users?delay=300',
    method: 'GET',
    icon: <Database className="h-4 w-4 text-cyan-400" />,
    description: 'Giả lập data query với header stale-while-revalidate và delay mạng.',
  },
  {
    key: 'security-headers',
    title: 'Web Security & CSP Headers Audit',
    endpoint: '/api/security/csp',
    method: 'GET',
    icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
    description:
      'Kiểm tra các HTTP Security Headers (Content-Security-Policy, X-Frame-Options DENY, SameSite).',
  },
  {
    key: 'silent-refresh',
    title: 'Silent Refresh Token Interceptor',
    endpoint: '/api/auth/protected-data',
    method: 'GET',
    icon: <RotateCcw className="h-4 w-4 text-amber-400" />,
    description:
      'Giả lập Access Token hết hạn 401, tự động chạy Silent Refresh Token ngầm và re-try request thành công.',
  },
];

interface ExecutionLogStep {
  step: number;
  title: string;
  status: 'pending' | 'success' | 'error';
  details: string;
}

export function ApiDemoTester() {
  const [activeKey, setActiveKey] = React.useState<ApiEndpointKey>('auth-session');

  // React 19 Concurrent Transition: Keeps old UI 100% intact until new response is atomically ready!
  const [isPending, startTransition] = React.useTransition();

  const [responseTimeMs, setResponseTimeMs] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<number | null>(null);
  const [responseHeadersJson, setResponseHeadersJson] = React.useState<string | null>(
    null
  );
  const [responseBodyJson, setResponseBodyJson] = React.useState<string | null>(null);

  // Silent Refresh state steps
  const [refreshSteps, setRefreshSteps] = React.useState<ExecutionLogStep[]>([]);

  const activeDemo = DEMO_ENDPOINTS.find((d) => d.key === activeKey) || DEMO_ENDPOINTS[0];

  // Atomic Concurrent Request Handler using React 19 useTransition
  const handleExecuteRequest = () => {
    startTransition(async () => {
      if (activeKey === 'silent-refresh') {
        await handleSilentRefreshFlow();
        return;
      }

      const startTime = performance.now();

      try {
        const res = await fetch(activeDemo.endpoint, {
          method: activeDemo.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        // Collect headers
        const headersObj: Record<string, string> = {};
        res.headers.forEach((val, key) => {
          headersObj[key] = val;
        });

        // Collect body
        const data = await res.json();

        // ATOMIC UI COMMIT: Updates all states simultaneously without intermediate DOM destruction/flicker!
        setStatus(res.status);
        setResponseTimeMs(latency);
        setResponseHeadersJson(JSON.stringify(headersObj, null, 2));
        setResponseBodyJson(JSON.stringify(data, null, 2));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setStatus(500);
        setResponseBodyJson(JSON.stringify({ error: errorMessage }, null, 2));
      }
    });
  };

  // Silent Refresh Token Flow Demo using Concurrent Step Updates
  const handleSilentRefreshFlow = async () => {
    setRefreshSteps([
      {
        step: 1,
        title: 'Gửi request ban đầu với Expired Access Token',
        status: 'pending',
        details:
          'GET /api/auth/protected-data [Authorization: Bearer expired_access_token]',
      },
    ]);

    const startTime = performance.now();

    // Step 1: Call API with expired token -> Expect 401
    const initialRes = await fetch('/api/auth/protected-data', {
      headers: { Authorization: 'Bearer expired_access_token' },
    });

    const initialData = await initialRes.json();

    setRefreshSteps((prev) => [
      {
        ...prev[0],
        status: 'error',
        details: `401 Unauthorized - ${initialData.message}`,
      },
      {
        step: 2,
        title: 'Interceptor bắt lỗi 401 -> Tự động kích hoạt Silent Refresh Token ngầm',
        status: 'pending',
        details:
          'POST /api/auth/refresh-token (Đổi Token mới và xoay Refresh Token Cookie)',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 2: Refresh token
    const refreshRes = await fetch('/api/auth/refresh-token', { method: 'POST' });
    const refreshData = await refreshRes.json();
    const newAccessToken = refreshData.accessToken;

    setRefreshSteps((prev) => [
      prev[0],
      {
        ...prev[1],
        status: 'success',
        details: `200 OK - Cấp Access Token mới: ${newAccessToken.slice(0, 20)}...`,
      },
      {
        step: 3,
        title: 'Interceptor tự động Re-try request ban đầu với Access Token mới',
        status: 'pending',
        details: `GET /api/auth/protected-data [Authorization: Bearer ${newAccessToken.slice(0, 15)}...]`,
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 3: Retry original request with new token
    const finalRes = await fetch('/api/auth/protected-data', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });

    const endTime = performance.now();
    const finalData = await finalRes.json();

    setRefreshSteps((prev) => [
      prev[0],
      prev[1],
      {
        ...prev[2],
        status: 'success',
        details: `200 OK - Dữ liệu bảo mật đã lấy thành công không bị gián đoạn UX!`,
      },
    ]);

    const headersObj: Record<string, string> = {};
    finalRes.headers.forEach((val, key) => {
      headersObj[key] = val;
    });

    // ATOMIC COMMIT
    setStatus(finalRes.status);
    setResponseTimeMs(Math.round(endTime - startTime));
    setResponseHeadersJson(JSON.stringify(headersObj, null, 2));
    setResponseBodyJson(JSON.stringify(finalData, null, 2));
  };

  return (
    <Card className="glass-card space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="border-border/50 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-0.5 text-xs font-semibold">
            <Send className="h-3.5 w-3.5" />
            <span>Concurrent React 19 API Testing Suite</span>
          </div>
          <h3 className="text-foreground text-xl font-bold tracking-tight">
            Demo Trực Tiếp Các Endpoint API & HTTP Headers
          </h3>
        </div>

        <Badge
          variant="outline"
          className="text-muted-foreground w-fit font-mono text-xs"
        >
          Concurrent Transition Mode
        </Badge>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_ENDPOINTS.map((demo) => {
          const isActive = demo.key === activeKey;
          return (
            <button
              key={demo.key}
              type="button"
              onClick={() => {
                setActiveKey(demo.key);
                setRefreshSteps([]);
              }}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border/60 bg-secondary/30 hover:border-border hover:bg-secondary/50'
              }`}
            >
              <div className="text-foreground flex items-center gap-2 text-xs font-bold">
                {demo.icon}
                <span>{demo.title}</span>
              </div>
              <span className="text-muted-foreground w-full truncate font-mono text-[11px]">
                {demo.endpoint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Endpoint Info & Execute Bar */}
      <div className="border-border/60 bg-muted/30 space-y-3 rounded-xl border p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="font-mono text-[10px] font-bold uppercase"
              >
                {activeDemo.method}
              </Badge>
              <span className="text-foreground font-mono text-xs font-bold">
                {activeDemo.endpoint}
              </span>
              {isPending && (
                <Badge
                  variant="outline"
                  className="animate-pulse border-amber-500/40 text-[10px] text-amber-500"
                >
                  Concurrent Transition Active...
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">{activeDemo.description}</p>
          </div>

          <Button
            onClick={handleExecuteRequest}
            disabled={isPending}
            className="shadow-primary/20 shrink-0 gap-2 text-xs font-semibold shadow-md"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Fetching in Background...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>
                  {activeKey === 'silent-refresh'
                    ? 'Test Silent Refresh Flow'
                    : 'Test API Request'}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step-by-Step Timeline for Silent Refresh Flow */}
      {activeKey === 'silent-refresh' && refreshSteps.length > 0 && (
        <div className="animate-in fade-in-50 space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Zap className="h-4 w-4" />
            <span>Quy trình Silent Refresh Token (Background Execution Flow):</span>
          </div>

          <div className="space-y-2">
            {refreshSteps.map((step, idx) => (
              <div
                key={`refresh-step-${step.step}-${idx}`}
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                  step.status === 'pending'
                    ? 'animate-pulse border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                    : step.status === 'error'
                      ? 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {step.status === 'pending' && (
                    <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {step.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="font-bold">
                    Bước {step.step}: {step.title}
                  </p>
                  <p className="font-mono text-[11px] opacity-90">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Response Panel (CONCURRENT ATOMIC RENDER - 0 UI Flicker, Old UI stays 100% intact until ready!) */}
      {status !== null && (
        <div
          className={`border-primary/30 bg-primary/5 space-y-4 rounded-2xl border p-6 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}
        >
          <div className="border-border/40 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-foreground text-xs font-bold">
                HTTP Response Status
              </span>
              <Badge
                variant={status === 200 ? 'default' : 'destructive'}
                className="font-mono text-xs font-bold"
              >
                {status} OK
              </Badge>

              {isPending && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Updating background...</span>
                </span>
              )}
            </div>

            {responseTimeMs !== null && (
              <span className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
                <Clock className="text-primary h-3.5 w-3.5" />
                Total Latency:{' '}
                <strong className="text-foreground">{responseTimeMs} ms</strong>
              </span>
            )}
          </div>

          {/* Response Headers */}
          {responseHeadersJson && (
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-xs font-bold">
                HTTP Response Headers:
              </span>
              <CodeBlock
                code={responseHeadersJson}
                language="json"
                showCopyButton={false}
              />
            </div>
          )}

          {/* Response Body JSON */}
          {responseBodyJson && (
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-xs font-bold">
                Response Body JSON:
              </span>
              <CodeBlock code={responseBodyJson} language="json" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
