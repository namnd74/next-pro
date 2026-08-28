'use client';

import * as React from 'react';
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Flame,
  KeyRound,
  Lock,
  ShieldCheck,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import type { ArenaChallenge } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ArenaWriteupModalProps {
  challenge: ArenaChallenge;
  isUnlocked: boolean;
  onClose: () => void;
  onForceUnlock?: () => void;
}

export const ArenaWriteupModal: React.FC<ArenaWriteupModalProps> = ({
  challenge,
  isUnlocked,
  onClose,
  onForceUnlock,
}) => {
  const [copiedPoc, setCopiedPoc] = React.useState(false);
  const writeup = challenge.writeup;

  const handleCopyPoc = () => {
    navigator.clipboard.writeText(writeup.weaponizedPoC);
    setCopiedPoc(true);
    setTimeout(() => setCopiedPoc(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <Card className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-slate-700 bg-slate-950 p-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-red-900 font-bold text-white shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold text-white">
                Official Red Team Walkthrough
                {isUnlocked ? (
                  <Badge className="border-emerald-500/40 bg-emerald-500/20 text-[10px] text-emerald-400">
                    <Unlock className="mr-1 h-3 w-3" /> ĐÃ MỞ KHÓA
                  </Badge>
                ) : (
                  <Badge className="border-amber-500/40 bg-amber-500/20 text-[10px] text-amber-400">
                    <Lock className="mr-1 h-3 w-3" /> CHƯA GIẢI
                  </Badge>
                )}
              </h2>
              <p className="mt-0.5 font-mono text-xs text-slate-400">{challenge.title}</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 text-sm text-slate-200">
          {!isUnlocked ? (
            <div className="space-y-4 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Lock className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Lời giải đang bị khóa</h3>
                <p className="mx-auto max-w-md text-xs text-slate-400">
                  Hãy tự tay hoàn thành bài lab và nộp đúng Flag để mở khóa lời giải chính
                  thức từ Red Team Lead. Hoặc bạn có thể chọn mở khóa sớm để tham khảo.
                </p>
              </div>
              {onForceUnlock && (
                <Button
                  onClick={onForceUnlock}
                  className="rounded-xl bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-500"
                >
                  <Unlock className="mr-1.5 h-3.5 w-3.5" /> Mở khóa Lời giải ngay
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* CVSS & Overview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Tổng quan Lỗ hổng
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400">
                    Vector: {writeup.cvssVector}
                  </span>
                </div>
                <Card className="rounded-2xl border-slate-800 bg-slate-900/60 p-4 text-xs leading-relaxed text-slate-300">
                  {writeup.vulnerabilityOverview}
                </Card>
              </div>

              {/* Root Cause */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-rose-400">
                  <Flame className="h-4 w-4 text-rose-500" />
                  Nguyên nhân Gốc rễ (Root Cause Analysis)
                </h3>
                <Card className="rounded-2xl border-rose-500/20 bg-rose-500/5 p-4 text-xs leading-relaxed text-slate-200">
                  {writeup.rootCauseAnalysis}
                </Card>
              </div>

              {/* Step-by-Step Exploit Chain */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  Chuỗi Khai thác Thực chiến (Exploit Chain)
                </h3>
                <div className="space-y-2">
                  {writeup.exploitChainWalkthrough.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs leading-relaxed"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-amber-400">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaponized PoC Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                    <Code2 className="h-4 w-4 text-sky-400" />
                    Mã khai thác chuẩn (Weaponized PoC)
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPoc}
                    className="h-7 text-xs font-bold text-sky-400 hover:bg-sky-500/20"
                  >
                    {copiedPoc ? (
                      <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="mr-1 h-3.5 w-3.5" />
                    )}
                    {copiedPoc ? 'Đã copy' : 'Copy PoC'}
                  </Button>
                </div>
                <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-black p-4 font-mono text-xs leading-relaxed whitespace-pre text-emerald-400">
                  {writeup.weaponizedPoC}
                </pre>
              </div>

              {/* Remediation & Defense */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-emerald-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Khuyến nghị Phòng thủ & Vá lỗi (Remediation)
                </h3>
                <pre className="overflow-x-auto rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-4 font-mono text-xs leading-relaxed whitespace-pre text-slate-200">
                  {writeup.remediationSnippet}
                </pre>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
