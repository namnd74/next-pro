import { apiClient } from '@/lib/axios';
import { OverviewData } from '../types';

const FALLBACK_OVERVIEW_DATA: OverviewData = {
  metrics: [
    {
      id: 'metric-1',
      label: 'Active Learners',
      value: '24,582',
      change: '+14.2%',
      isPositive: true,
      iconName: 'users',
      description: 'Monthly active learners mastering React 19 & Next.js 16',
    },
    {
      id: 'metric-2',
      label: 'Quiz Blitz Rate',
      value: '1.28M',
      change: '+28.4%',
      isPositive: true,
      iconName: 'activity',
      description: 'Questions answered in 60s Blitz sessions',
    },
    {
      id: 'metric-3',
      label: 'Avg Response Latency',
      value: '18.4ms',
      change: '-5.1%',
      isPositive: true,
      iconName: 'zap',
      description: 'Edge CDN routing and TanStack Query cache hits',
    },
    {
      id: 'metric-4',
      label: 'System Uptime & Stability',
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
      action: 'Zustand learning state hydrated from localStorage',
      actor: 'Client Session',
      time: 'Just now',
      status: 'completed',
    },
    {
      id: 'act-2',
      action: 'React 19 Form Actions & useOptimistic track completed',
      actor: 'Interactive Lab',
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
      action: 'Senior Interview Mock session evaluated with 92/100 score',
      actor: 'AI Evaluator',
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

export const overviewService = {
  async fetchOverview(): Promise<OverviewData> {
    // If on server (SSR), return fallback directly to prevent relative URL fetch failure in Node.js
    if (typeof window === 'undefined') {
      return FALLBACK_OVERVIEW_DATA;
    }

    try {
      const response = await apiClient.get<OverviewData>('/metrics');
      return response.data;
    } catch {
      // Fallback gracefully on any network error so page never crashes
      return FALLBACK_OVERVIEW_DATA;
    }
  },
};
