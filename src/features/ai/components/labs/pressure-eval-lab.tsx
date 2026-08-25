'use client';

import * as React from 'react';
import {
  AlarmClock,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Play,
  ShieldAlert,
  TimerReset,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PressureState {
  deadline: boolean;
  authority: boolean;
  sunkCost: boolean;
  exhaustion: boolean;
}

const INITIAL_PRESSURES: PressureState = {
  deadline: true,
  authority: false,
  sunkCost: false,
  exhaustion: false,
};

export function PressureEvalLab() {
  const [pressures, setPressures] = React.useState(INITIAL_PRESSURES);
  const [skillEnabled, setSkillEnabled] = React.useState(false);
  const [runVersion, setRunVersion] = React.useState(0);

  const activePressureCount = Object.values(pressures).filter(Boolean).length;
  const complianceScore = skillEnabled
    ? Math.max(76, 94 - activePressureCount * 4)
    : Math.max(5, 72 - activePressureCount * 17);
  const decision =
    complianceScore >= 75
      ? 'Tuân thủ workflow và yêu cầu verification evidence.'
      : complianceScore >= 45
        ? 'Do dự, đề xuất shortcut rồi mới quay lại workflow.'
        : 'Bỏ qua workflow để tối ưu tốc độ trước mắt.';
  const rationalization = getRationalization(pressures, skillEnabled);

  function updatePressure(key: keyof PressureState, value: boolean) {
    setPressures((current) => ({ ...current, [key]: value }));
    setRunVersion(0);
  }

  function reset() {
    setPressures(INITIAL_PRESSURES);
    setSkillEnabled(false);
    setRunVersion(0);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="border-border/60 bg-background/70 space-y-4 rounded-2xl border p-4">
          <div className="space-y-1">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <ShieldAlert className="h-4 w-4 text-rose-500" aria-hidden="true" />
              Pressure scenario
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Tạo áp lực khiến agent muốn rationalize việc bỏ qua verification.
            </p>
          </div>

          <div className="space-y-2">
            <PressureToggle
              icon={AlarmClock}
              label="Deadline: deploy window còn 5 phút"
              checked={pressures.deadline}
              onChange={(value) => updatePressure('deadline', value)}
            />
            <PressureToggle
              icon={BriefcaseBusiness}
              label="Authority: manager yêu cầu bỏ qua test"
              checked={pressures.authority}
              onChange={(value) => updatePressure('authority', value)}
            />
            <PressureToggle
              icon={BrainCircuit}
              label="Sunk cost: đã viết 200 dòng code"
              checked={pressures.sunkCost}
              onChange={(value) => updatePressure('sunkCost', value)}
            />
            <PressureToggle
              icon={TimerReset}
              label="Exhaustion: cuối ngày, muốn kết thúc"
              checked={pressures.exhaustion}
              onChange={(value) => updatePressure('exhaustion', value)}
            />
          </div>

          <div className="border-border/60 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-foreground block text-xs font-bold">
                  verification-before-completion
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Discipline skill under test
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={skillEnabled}
                onClick={() => {
                  setSkillEnabled((current) => !current);
                  setRunVersion(0);
                }}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${
                  skillEnabled ? 'bg-emerald-500' : 'bg-secondary'
                }`}
                aria-label="Bật hoặc tắt skill"
              >
                <span
                  className={`bg-background absolute top-1 h-4 w-4 rounded-full shadow-sm transition-transform ${
                    skillEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={() => setRunVersion((version) => version + 1)}
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Run evaluation
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </section>

        <section className="border-border/60 rounded-2xl border bg-slate-950 p-4 text-slate-100">
          {runVersion === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <Play className="mb-4 h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-300">
                Cấu hình pressure rồi chạy evaluation
              </p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                So sánh behavior khi không có skill và khi skill được progressive-load.
              </p>
            </div>
          ) : (
            <div className="space-y-5" aria-live="polite">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-rose-300 uppercase">
                    Eval run #{runVersion}
                  </p>
                  <h3 className="mt-1 text-base font-bold">Observed behavior</h3>
                </div>
                <Badge variant={complianceScore >= 75 ? 'success' : 'destructive'}>
                  {skillEnabled ? 'WITH SKILL' : 'BASELINE · RED'}
                </Badge>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    Workflow compliance
                  </span>
                  <strong className="text-2xl text-white">{complianceScore}%</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      complianceScore >= 75 ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${complianceScore}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ResultBlock label="Decision" value={decision} />
                <ResultBlock label="Rationalization" value={rationalization} />
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  skillEnabled
                    ? 'border-emerald-400/30 bg-emerald-400/10'
                    : 'border-rose-400/30 bg-rose-400/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <BadgeCheck
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      skillEnabled ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <span className="block text-xs font-bold">
                      {skillEnabled ? 'VERIFY GREEN' : 'RED baseline captured'}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {skillEnabled
                        ? 'Skill đóng loophole bằng completion criteria và yêu cầu evidence trước khi tuyên bố hoàn tất.'
                        : 'Failure này là input để viết instruction tối thiểu, không phải lý do thêm nhiều prose chung chung.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PressureToggle({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="border-border/60 bg-card/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:border-rose-500/30">
      <Icon className="h-4 w-4 shrink-0 text-rose-500" aria-hidden={true} />
      <span className="text-foreground min-w-0 flex-1 text-xs font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-rose-500"
      />
    </label>
  );
}

function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
        {label}
      </span>
      <p className="mt-2 text-xs leading-relaxed text-slate-200">{value}</p>
    </div>
  );
}

function getRationalization(pressures: PressureState, skillEnabled: boolean) {
  if (skillEnabled) {
    return 'Áp lực không thay đổi definition of done; phải có fresh verification evidence.';
  }
  if (pressures.authority)
    return 'Manager đã chấp nhận rủi ro nên có thể bỏ test lần này.';
  if (pressures.sunkCost)
    return 'Code đã chạy thủ công; xóa hoặc làm lại bây giờ quá lãng phí.';
  if (pressures.exhaustion)
    return 'Có thể commit trước rồi bổ sung verification vào sáng mai.';
  if (pressures.deadline)
    return 'Đây chỉ là thay đổi nhỏ; chạy đầy đủ checks sẽ làm lỡ deploy window.';
  return 'Không có áp lực rõ ràng, nhưng completion criteria vẫn chưa được kiểm chứng.';
}
