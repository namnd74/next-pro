'use client';

import * as React from 'react';
import {
  FileSearch,
  KeyRound,
  Map as MapIcon,
  Route,
  ShieldCheck,
  Skull,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * FIRING RANGE · frontend-recon
 * Trinh sát bundle production: tìm secret lộ trong chunk, phát hiện sourcemap
 * deploy nhầm, và liệt kê route nội bộ từ manifest. Bật Defense Mode để thấy
 * bản vá làm mọi finding biến mất thế nào.
 */

interface Finding {
  id: string;
  icon: React.ReactNode;
  label: string;
  /** Dòng "code" attacker nhìn thấy trong bundle khi KHÔNG có defense */
  exposed: string;
  /** Dòng sau khi vá */
  patched: string;
  hint: string;
}

const FINDINGS: Finding[] = [
  {
    id: 'apikey',
    icon: <KeyRound className="h-3.5 w-3.5" />,
    label: 'API key nhúng trong chunk',
    exposed: 'const STRIPE_KEY = "pk_live_51NxT9aKf2Do8QwZx";',
    patched: '// ✅ key gọi từ server: const res = await fetch("/api/checkout")',
    hint: 'Chunk payment chứa chuỗi bắt đầu bằng pk_live_',
  },
  {
    id: 'sourcemap',
    icon: <MapIcon className="h-3.5 w-3.5" />,
    label: 'Sourcemap giao nộp kèm bundle',
    exposed: '//# sourceMappingURL=app.chunk.js.map',
    patched: '// ✅ production: không có dòng sourceMappingURL nào',
    hint: 'Cuối chunk chính thường khai báo file .map',
  },
  {
    id: 'routes',
    icon: <Route className="h-3.5 w-3.5" />,
    label: 'Manifest lộ route nội bộ',
    exposed: 'routes:{admin:"/_internal/admin",debug:"/_debug/log"}',
    patched: '// ✅ route ẩn được guard phía server, không nằm trong client manifest',
    hint: 'Đối tượng routes gộp mọi path kể cả _internal',
  },
  {
    id: 'webhook',
    icon: <FileSearch className="h-3.5 w-3.5" />,
    label: 'Webhook URL staging để lại trong code',
    exposed: 'fetch("https://staging.internal.api/hooks/deploy")',
    patched: '// ✅ URL môi trường inject qua server-side env, client chỉ thấy tên action',
    hint: 'Có một fetch tới host staging.internal.api',
  },
];

export function BundleReconLab() {
  const [defenseMode, setDefenseMode] = React.useState(false);
  const [foundIds, setFoundIds] = React.useState<string[]>([]);

  const allFound = foundIds.length === FINDINGS.length;

  const discover = (id: string) => {
    if (defenseMode) return;
    setFoundIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {defenseMode ? (
            <Badge variant="success" className="gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              DEFENSE ON
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <Skull className="h-3 w-3" />
              ATTACK MODE
            </Badge>
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            tìm thấy {foundIds.length}/{FINDINGS.length} thông tin lộ
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={defenseMode ? 'ghost' : 'destructive'}
            onClick={() => setDefenseMode(false)}
            className="h-7 text-[11px]"
          >
            <Skull className="mr-1 h-3 w-3" />
            Deploy ẩu
          </Button>
          <Button
            size="sm"
            variant={defenseMode ? 'default' : 'ghost'}
            onClick={() => setDefenseMode(true)}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Bản vá
          </Button>
        </div>
      </div>

      {/* Fake deployed bundle */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed shadow-inner">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-slate-500">$ inspect https://shop.example.com/_next/static/chunks/app.chunk.js</span>
        </div>

        {/* Chunk header */}
        <div className="text-emerald-400">
          {'// app.chunk.js · minified production bundle'}
        </div>

        {FINDINGS.map((finding) => (
          <button
            key={finding.id}
            type="button"
            onClick={() => discover(finding.id)}
            disabled={defenseMode}
            title={defenseMode ? 'Đã vá — không còn gì để tìm' : finding.hint}
            className={`mt-1 block w-full truncate rounded-md px-2 py-1 text-left transition-colors ${
              defenseMode
                ? 'cursor-default bg-slate-900/40 text-slate-500'
                : foundIds.includes(finding.id)
                  ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25'
                  : 'cursor-pointer text-slate-300 hover:bg-slate-800'
            }`}
          >
            {defenseMode ? finding.patched : finding.exposed}
          </button>
        ))}

        {!defenseMode && (
          <div className="mt-2 animate-pulse text-slate-600">
            $ click vào từng dòng đáng ngờ để xác nhận finding…
          </div>
        )}
      </div>

      {/* Finding report */}
      <div className="space-y-2">
        {FINDINGS.map((finding) => {
          const found = !defenseMode && foundIds.includes(finding.id);
          const patchedAway = defenseMode;
          return (
            <Card
              key={finding.id}
              className={`glass-card flex items-start gap-3 p-3 ${
                found
                  ? 'border-destructive/30'
                  : patchedAway
                    ? 'border-emerald-500/20'
                    : ''
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  found
                    ? 'bg-destructive/10 text-destructive'
                    : patchedAway
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {found ? <Skull className="h-3.5 w-3.5" /> : finding.icon}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-foreground">{finding.label}</p>
                {found && (
                  <p className="text-[11px] leading-relaxed text-destructive">
                    ĐÃ XÁC NHẬN LỘ: attacker đọc được ngay khi mở DevTools.
                  </p>
                )}
                {patchedAway && (
                  <p className="text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                    Đã vá: không còn dấu vết trong bundle production.
                  </p>
                )}
                {!found && !patchedAway && (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Chưa phát hiện — soi kỹ từng dòng trong bundle ở ATTACK MODE.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verdict */}
      {(allFound || defenseMode) && (
        <Card
          className={`glass-card p-4 ${
            defenseMode ? 'border-emerald-500/30' : 'border-destructive/30'
          }`}
        >
          {allFound && !defenseMode ? (
            <p className="text-xs leading-relaxed text-foreground">
              💀 <span className="font-bold">Blast Radius:</span> attacker biết đầy đủ
              endpoint nội bộ, key thanh toán và cả source gốc (qua sourcemap) — giai
              đoạn trinh sát hoàn tất mà hệ thống không ghi nhận bất kỳ alarm nào.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-foreground">
              🛡️ <span className="font-bold text-emerald-600 dark:text-emerald-400">Defense Patch:</span>{' '}
              key/webhook chỉ sống phía server, sourcemap bị strip khi deploy,
              route nhạy cảm luôn guard phía server. Attacker mở DevTools chỉ thấy
              code đã minify, không còn điểm neo.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
