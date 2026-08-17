'use client';

import { useQuery } from '@tanstack/react-query';
import { overviewService } from '../services/overview-service';
import { OverviewData } from '../types';

export const OVERVIEW_QUERY_KEY = ['overview', 'metrics'] as const;

export function useOverviewMetrics() {
  return useQuery<OverviewData, Error>({
    queryKey: OVERVIEW_QUERY_KEY,
    queryFn: () => overviewService.fetchOverview(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 120 * 1000, // 2 minutes auto-refresh
    retry: false,
  });
}
