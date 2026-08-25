'use client';

import * as React from 'react';
import type { ComponentType } from 'react';
import { FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AsyncRaceLab } from './ranges/async-race-lab';
import { BundleReconLab } from './ranges/bundle-recon-lab';
import { CachePoisonLab } from './ranges/cache-poison-lab';
import { FormAbuseRange } from './ranges/form-abuse-range';
import { HardeningDrill } from './ranges/hardening-drill';
import { ResourceDrainLab } from './ranges/resource-drain-lab';
import { SessionHeistRange } from './ranges/session-heist-range';
import { StateCorruptionLab } from './ranges/state-corruption-lab';
import { XssInjectionRange } from './ranges/xss-injection-range';

export interface UiDemoMeta {
  component: ComponentType;
  title: string;
  description: string;
}

/**
 * Firing range riêng của Red Team — key là slug của RedTeamCollection.
 *
 * ⚠️ Các lab cũ (Render Visualizer, Memo Profiler, Cache Timeline…) là lab
 * học React, KHÔNG còn được gắn vào RT. Mỗi collection có bãi tập thực chiến
 * riêng (attack/defense sandbox) dưới thư mục components/ranges/.
 */
export const UI_DEMO_REGISTRY: Record<string, UiDemoMeta> = {
  'frontend-recon': {
    component: BundleReconLab,
    title: 'Firing Range: Bundle Recon',
    description:
      'Đóng vai trinh sát: soi bundle production tìm secret, sourcemap lộ và route nội bộ — rồi bật bản vá để thấy mọi dấu vết biến mất.',
  },
  'script-injection-range': {
    component: XssInjectionRange,
    title: 'Firing Range: XSS & Chèn mã',
    description:
      'Bắn stored XSS vào comment box, DOM XSS qua URL fragment và prototype pollution qua query string — bật sanitizer để thấy payload bị vô hiệu.',
  },
  'identity-session-heist': {
    component: SessionHeistRange,
    title: 'Firing Range: Session Heist',
    description:
      'CSRF rút tiền hộ nạn nhân, trộm JWT theo kiểu lưu trữ token, clickjacking mượn tay user bấm nút — bật từng lớp phòng thủ để chặn lại.',
  },
  'async-race-exploits': {
    component: AsyncRaceLab,
    title: 'Firing Range: Race Condition',
    description:
      'Đua response sai kết quả, closure cũ mất dữ liệu, swarm interval bất tử — điều chỉnh latency và bật stale-guard/cleanup để vô hiệu hoá.',
  },
  'ui-state-corruption': {
    component: StateCorruptionLab,
    title: 'Firing Range: State Corruption',
    description:
      'Tráo bài sau lưng user bằng index-key, mutation tê liệt re-render, số 0 ma từ &&, render không thuần khiết — bắn từng đòn và vá ngay.',
  },
  'cache-poisoning': {
    component: CachePoisonLab,
    title: 'Firing Range: Cache Poison',
    description:
      'Bão refetch khi đổi tab, query key va chạm phục vụ dữ liệu sai ngữ cảnh, ghost row sống dậy từ mutation thiếu invalidation.',
  },
  'form-input-abuse': {
    component: FormAbuseRange,
    title: 'Firing Range: Form Abuse',
    description:
      'Field ma mất name, controlled lật uncontrolled, submit kép nhân bản đơn hàng, lách validation client-only và quả mìn parse().',
  },
  'resource-supply-drain': {
    component: ResourceDrainLab,
    title: 'Firing Range: Resource Drain',
    description:
      'Waterfall TTFB, bão render đánh DB, đóng băng main thread, reference storm, context blast và CDN hijack — mô phỏng cả 6 đòn drain hạ tầng.',
  },
  'blue-team-capstone': {
    component: HardeningDrill,
    title: 'Firing Range: Hardening Drill',
    description:
      'Trò chơi đảo vai blue team: 3 kịch bản test hổng — chọn đúng biện pháp vá trước khi hết giờ để chứng minh hàng phòng thủ đạt chuẩn.',
  },
};

interface UiDemoStageProps {
  collectionSlug: string;
}

export function UiDemoStage({ collectionSlug }: UiDemoStageProps) {
  const meta = UI_DEMO_REGISTRY[collectionSlug];

  if (!meta) return null;
  const Demo = meta.component;

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-2">
        <FlaskConical className="text-primary mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-0.5">
          <h2 className="text-foreground text-lg font-bold tracking-tight">
            {meta.title}
          </h2>
          <p className="text-muted-foreground text-xs">{meta.description}</p>
        </div>
      </div>
      <Card className="glass-card p-4 sm:p-6">
        <Demo />
      </Card>
    </section>
  );
}
