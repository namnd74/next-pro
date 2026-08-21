import { NextResponse } from 'next/server';
import { OverviewData } from '@/features/overview/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mockData: OverviewData = {
    metrics: [
      {
        id: 'metric-1',
        label: 'Active Users',
        value: '24,582',
        change: '+14.2%',
        isPositive: true,
        iconName: 'users',
        description: 'Monthly active engagements across all nodes',
      },
      {
        id: 'metric-2',
        label: 'API Request Rate',
        value: '1.28M',
        change: '+28.4%',
        isPositive: true,
        iconName: 'activity',
        description: 'Peak throughput handled in the last 24 hours',
      },
      {
        id: 'metric-3',
        label: 'Avg Response Latency',
        value: '18.4ms',
        change: '-5.1%',
        isPositive: true,
        iconName: 'zap',
        description: 'Edge CDN routing and TanStack query cache hits',
      },
      {
        id: 'metric-4',
        label: 'Security & Uptime',
        value: '99.99%',
        change: '0.0%',
        isPositive: true,
        iconName: 'shieldCheck',
        description: 'Strict TypeScript type safety & zero crash rate',
      },
    ],
    recentActivities: [
      {
        id: 'act-1',
        action: 'Zustand global auth state hydrated from localStorage',
        actor: 'Client Session',
        time: 'Just now',
        status: 'completed',
      },
      {
        id: 'act-2',
        action: 'Axios interceptor configured with bearer token injection',
        actor: 'Network Engine',
        time: '2 mins ago',
        status: 'completed',
      },
      {
        id: 'act-3',
        action: 'TanStack Query v5 cache initialized with 1min staleTime',
        actor: 'Query Provider',
        time: '5 mins ago',
        status: 'completed',
      },
      {
        id: 'act-4',
        action: 'Pre-commit hook linked to Husky and lint-staged',
        actor: 'Git Pipeline',
        time: '12 mins ago',
        status: 'completed',
      },
    ],
    systemStatus: {
      health: 'healthy',
      uptime: '99.99%',
      latencyMs: 18,
    },
  };

  return NextResponse.json(mockData);
}
