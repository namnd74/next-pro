'use client';

import * as React from 'react';
import type { ComponentType } from 'react';
import { FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { XssCsrfRange } from './demos/xss-csrf-range';
import { ReactRenderVisualizerLab } from './demos/react-render-visualizer-lab';
import { EffectRaceLab } from './demos/effect-race-lab';
import { FormStateLab } from './demos/form-state-lab';
import { SchemaValidationRange } from './demos/schema-validation-range';
import { MemoProfilerLab } from './demos/memo-profiler-lab';
import { CacheTimelineLab } from './demos/cache-timeline-lab';
import { React19ActionsLab } from './demos/react19-actions-lab';
import { RenderingWaterfallLab } from './demos/rendering-waterfall-lab';
import { TestRunnerSimulator } from './demos/test-runner-simulator';

export interface UiDemoMeta {
  component: ComponentType;
  title: string;
  description: string;
}

/** Map trackSlug → interactive UI demo của track đó */
export const UI_DEMO_REGISTRY: Record<string, UiDemoMeta> = {
  'react-foundations-zero-to-one': {
    component: ReactRenderVisualizerLab,
    title: 'UI Demo: Render Visualizer',
    description:
      'Bấm nút và quan sát chính xác component nào re-render — props, state, keys trong thời gian thực.',
  },
  'react-hooks-deep-dive': {
    component: EffectRaceLab,
    title: 'UI Demo: Effect Race Lab',
    description:
      'Kích hoạt race condition giữa các useEffect fetch và xem cleanup function cứu hệ thống ra sao.',
  },
  'standard-react-form-architecture': {
    component: FormStateLab,
    title: 'UI Demo: Controlled vs Uncontrolled',
    description:
      'So sánh trực tiếp 2 chiến lược form: mỗi keystroke đi đâu, ai sở hữu state, re-render chảy về đâu.',
  },
  'form-engineering-react-hook-form-zod': {
    component: SchemaValidationRange,
    title: 'UI Demo: Schema Validation Range',
    description:
      'Bắn dữ liệu bẩn vào schema Zod: thấy từng rule bắt lỗi, transform và type inference như thật.',
  },
  'react-performance-advanced-patterns': {
    component: MemoProfilerLab,
    title: 'UI Demo: Memo Profiler',
    description:
      'Bật/tắt memo · useMemo · useCallback trên danh sách nặng và đếm render như Profiler thật.',
  },
  'tanstack-query-v5-masterclass': {
    component: CacheTimelineLab,
    title: 'UI Demo: Query Cache Timeline',
    description:
      'Thử nghiệm staleTime/gcTime: network refetch, cache hit, background refresh trên timeline sống.',
  },
  'web-security-and-auth-masterclass': {
    component: XssCsrfRange,
    title: 'UI Demo: XSS & CSRF Firing Range',
    description:
      'Bắn payload XSS vào comment box và giả lập CSRF chuyển tiền — bật/tắt phòng thủ xem khác nhau thế nào.',
  },
  'react-19-compiler-path': {
    component: React19ActionsLab,
    title: 'UI Demo: Actions & Optimistic UI',
    description:
      'Trải nghiệm useActionState + useOptimistic: todo list cập nhật tức thì, rollback khi server lỗi.',
  },
  'nextjs-architecture-rendering-strategies': {
    component: RenderingWaterfallLab,
    title: 'UI Demo: Rendering Waterfall',
    description:
      'Đua SSR vs SSG vs ISR vs CSR trên cùng một trang: so sánh TTFB, waterfall và thời gian hiển thị.',
  },
  'react-testing-enterprise-mastery': {
    component: TestRunnerSimulator,
    title: 'UI Demo: Test Runner Simulator',
    description:
      'Chạy bộ test Vitest mô phỏng: Arrange–Act–Assert, mock MSW, xem pass/fail theo từng bước.',
  },
};

interface UiDemoStageProps {
  trackSlug: string;
}

export function UiDemoStage({ trackSlug }: UiDemoStageProps) {
  const meta = UI_DEMO_REGISTRY[trackSlug];

  if (!meta) return null;
  const Demo = meta.component;

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-2">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">{meta.title}</h2>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
      </div>
      <Card className="glass-card p-4 sm:p-6">
        <Demo />
      </Card>
    </section>
  );
}
