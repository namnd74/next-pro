'use client';

import * as React from 'react';
import { CheckCircle2, CircleX, Play, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const WEAK_DESCRIPTION = 'Helps with frontend.';
const STRONG_DESCRIPTION =
  'Review existing React or Next.js UI changes for accessibility, responsive behavior, state UX, and performance. Use for audit requests; do not use to build a new interface.';

interface RoutingCase {
  id: string;
  prompt: string;
  expected: boolean;
  frontend: boolean;
  action: 'review' | 'build' | 'explain';
  explicit?: boolean;
}

const ROUTING_CASES: RoutingCase[] = [
  {
    id: 'checkout-audit',
    prompt: 'Audit the existing checkout UI for accessibility regressions.',
    expected: true,
    frontend: true,
    action: 'review',
  },
  {
    id: 'responsive-review',
    prompt: 'Review this React diff for responsive and loading-state issues.',
    expected: true,
    frontend: true,
    action: 'review',
  },
  {
    id: 'new-dashboard',
    prompt: 'Build a new analytics dashboard from this screenshot.',
    expected: false,
    frontend: true,
    action: 'build',
  },
  {
    id: 'react-explanation',
    prompt: 'Explain how React state batching works.',
    expected: false,
    frontend: true,
    action: 'explain',
  },
  {
    id: 'backend-audit',
    prompt: 'Audit this Node.js API authentication flow.',
    expected: false,
    frontend: false,
    action: 'review',
  },
  {
    id: 'explicit-invocation',
    prompt: 'Use frontend-production-review on the current diff.',
    expected: true,
    frontend: true,
    action: 'review',
    explicit: true,
  },
];

function simulateActivation(description: string, testCase: RoutingCase) {
  if (testCase.explicit) return true;

  const normalized = description.toLowerCase();
  const genericFrontend =
    normalized.includes('frontend') &&
    !normalized.includes('review') &&
    !normalized.includes('audit');
  if (genericFrontend) return testCase.frontend;

  const reviewSkill = normalized.includes('review') || normalized.includes('audit');
  const frontendBoundary =
    normalized.includes('frontend') ||
    normalized.includes('react') ||
    normalized.includes('next.js') ||
    normalized.includes(' ui ');
  const excludesNewBuild =
    normalized.includes('do not use to build') ||
    normalized.includes('không dùng để xây');

  if (testCase.action === 'build' && excludesNewBuild) return false;
  return (
    testCase.action === 'review' && reviewSkill && testCase.frontend && frontendBoundary
  );
}

export function SkillRoutingLab() {
  const [description, setDescription] = React.useState(WEAK_DESCRIPTION);
  const [selectedCaseId, setSelectedCaseId] = React.useState(ROUTING_CASES[0].id);

  const results = ROUTING_CASES.map((testCase) => ({
    ...testCase,
    actual: simulateActivation(description, testCase),
  }));
  const selectedCase =
    results.find((testCase) => testCase.id === selectedCaseId) ?? results[0];
  const truePositive = results.filter((item) => item.expected && item.actual).length;
  const falsePositive = results.filter((item) => !item.expected && item.actual).length;
  const falseNegative = results.filter((item) => item.expected && !item.actual).length;
  const precision = truePositive / Math.max(1, truePositive + falsePositive);
  const recall = truePositive / Math.max(1, truePositive + falseNegative);
  const correct = results.filter((item) => item.expected === item.actual).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
        <section className="border-border/60 bg-background/70 space-y-4 rounded-2xl border p-4">
          <div className="space-y-1">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <Route className="h-4 w-4 text-violet-500" aria-hidden="true" />
              Routing contract
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Sửa description rồi quan sát precision/recall. Đây là simulator heuristic,
              không phải model classifier thực.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={description === WEAK_DESCRIPTION ? 'default' : 'outline'}
              onClick={() => setDescription(WEAK_DESCRIPTION)}
            >
              Weak preset
            </Button>
            <Button
              type="button"
              size="sm"
              variant={description === STRONG_DESCRIPTION ? 'default' : 'outline'}
              onClick={() => setDescription(STRONG_DESCRIPTION)}
            >
              Strong preset
            </Button>
          </div>

          <label className="block space-y-2">
            <span className="text-foreground text-xs font-semibold">description</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-36 font-mono text-xs leading-6"
              spellCheck={false}
            />
          </label>

          <div className="grid grid-cols-3 gap-2" aria-live="polite">
            <Metric label="Precision" value={`${Math.round(precision * 100)}%`} />
            <Metric label="Recall" value={`${Math.round(recall * 100)}%`} />
            <Metric label="Correct" value={`${correct}/${results.length}`} />
          </div>
        </section>

        <section className="border-border/60 bg-background/70 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-foreground text-sm font-bold">Eval cases</h3>
              <p className="text-muted-foreground text-xs">
                Chọn một case để xem activation trace.
              </p>
            </div>
            <Badge variant={correct === results.length ? 'success' : 'warning'}>
              {correct === results.length ? 'Boundary rõ' : 'Còn routing lỗi'}
            </Badge>
          </div>

          <div className="space-y-2">
            {results.map((testCase) => {
              const passed = testCase.expected === testCase.actual;
              const selected = selectedCase.id === testCase.id;
              return (
                <button
                  key={testCase.id}
                  type="button"
                  onClick={() => setSelectedCaseId(testCase.id)}
                  aria-pressed={selected}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-border/50 bg-card/40 hover:border-border'
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <CircleX className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-xs leading-relaxed font-medium">
                      {testCase.prompt}
                    </span>
                    <span className="text-muted-foreground mt-1 flex flex-wrap gap-2 font-mono text-[10px]">
                      <span>expected: {testCase.expected ? 'load' : 'skip'}</span>
                      <span>actual: {testCase.actual ? 'load' : 'skip'}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className="border-border/60 rounded-2xl border bg-slate-950 p-4 text-slate-100">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-violet-300 uppercase">
              Activation trace
            </p>
            <p className="mt-1 text-xs text-slate-300">{selectedCase.prompt}</p>
          </div>
          <Play className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        </div>
        <div className="grid gap-2 sm:grid-cols-4" aria-live="polite">
          <TraceStep index="01" label="Catalog visible" state="done" />
          <TraceStep index="02" label="Description matched" state="done" />
          <TraceStep
            index="03"
            label={selectedCase.actual ? 'SKILL.md loaded' : 'Skill skipped'}
            state={selectedCase.actual ? 'active' : 'skipped'}
          />
          <TraceStep
            index="04"
            label={selectedCase.actual ? 'Workflow available' : 'Default behavior'}
            state={selectedCase.actual ? 'active' : 'skipped'}
          />
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/60 rounded-xl p-3 text-center">
      <span className="text-foreground block text-lg font-extrabold">{value}</span>
      <span className="text-muted-foreground text-[10px] font-semibold uppercase">
        {label}
      </span>
    </div>
  );
}

function TraceStep({
  index,
  label,
  state,
}: {
  index: string;
  label: string;
  state: 'done' | 'active' | 'skipped';
}) {
  const className =
    state === 'active'
      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
      : state === 'skipped'
        ? 'border-slate-700 bg-slate-900 text-slate-500'
        : 'border-violet-400/30 bg-violet-400/10 text-violet-200';

  return (
    <div className={`rounded-xl border p-3 ${className}`}>
      <span className="block font-mono text-[9px] opacity-70">STEP {index}</span>
      <span className="mt-1 block text-xs font-semibold">{label}</span>
    </div>
  );
}
