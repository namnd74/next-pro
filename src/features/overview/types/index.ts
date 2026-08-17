export interface MetricItem {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: 'users' | 'activity' | 'zap' | 'shieldCheck';
  description: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  time: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface OverviewData {
  metrics: MetricItem[];
  recentActivities: ActivityLog[];
  systemStatus: {
    health: 'healthy' | 'degraded' | 'down';
    uptime: string;
    latencyMs: number;
  };
}
