'use client';

import * as React from 'react';
import {
  Ghost,
  History as HistoryIcon,
  Infinity as InfinityIcon,
  Play,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Skull,
  Swords,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * FIRING RANGE · async-race-exploits
 * Ba vector bất đồng bộ không để lại stack trace: race last-response-wins ghi
 * đè dữ liệu mới bằng response cũ, stale closure đóng băng giá trị chết vào
 * setTimeout, và immortal interval swarm sống sót sau unmount ăn RAM từng
 * ngày. Bật Defense để thấy AbortController/stale-guard + functional updater +
 * cleanup return vô hiệu hóa cả ba.
 */

type Tone = 'info' | 'ok' | 'bad' | 'warn';

interface LogLine {
  id: number;
  text: string;
  tone: Tone;
}

type TabId = 'race' | 'closure' | 'interval';

interface SearchResult {
  letter: 'A' | 'B';
  /** thứ tự phát request — số càng lớn càng mới */
  order: number;
  stale: boolean;
}

interface PendingBonus {
  id: number;
  snapshot: number;
}

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'race', label: 'Last-Response Race', icon: <Swords className="h-3.5 w-3.5" /> },
  {
    id: 'closure',
    label: 'Stale Closure',
    icon: <HistoryIcon className="h-3.5 w-3.5" />,
  },
  {
    id: 'interval',
    label: 'Immortal Interval',
    icon: <InfinityIcon className="h-3.5 w-3.5" />,
  },
];

export function AsyncRaceLab() {
  const [defenseMode, setDefenseMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabId>('race');
  const [hits, setHits] = React.useState({ race: false, closure: false, leak: false });

  const logIdRef = React.useRef(0);
  const makeLines = (entries: Array<[string, Tone]>): LogLine[] =>
    entries.map(([text, tone]) => ({ id: ++logIdRef.current, text, tone }));
  const append = (
    setter: React.Dispatch<React.SetStateAction<LogLine[]>>,
    entries: Array<[string, Tone]>
  ) => setter((prev) => [...prev, ...makeLines(entries)].slice(-9));

  // ── Race: last-response-wins ──────────────────────────────────────────────
  const [latencyA, setLatencyA] = React.useState(300);
  const [latencyB, setLatencyB] = React.useState(1800);
  const [inFlight, setInFlight] = React.useState<{ A: boolean; B: boolean }>({
    A: false,
    B: false,
  });
  const [result, setResult] = React.useState<SearchResult | null>(null);
  const [raceLogs, setRaceLogs] = React.useState<LogLine[]>([]);
  const resultRef = React.useRef<SearchResult | null>(null);
  const latestReqRef = React.useRef(0);
  const seqRef = React.useRef(0);
  const raceTimersRef = React.useRef<number[]>([]);

  const fireSearch = (letter: 'A' | 'B') => {
    const latency = letter === 'A' ? latencyA : latencyB;
    const id = ++seqRef.current;
    latestReqRef.current = id;
    setInFlight((prev) => ({ ...prev, [letter]: true }));
    const issuedAt = Date.now();
    append(setRaceLogs, [
      [`t+0ms → GET /api/search?q=${letter} · latency ${latency}ms (req#${id})`, 'info'],
    ]);
    const timer = window.setTimeout(() => {
      setInFlight((prev) => ({ ...prev, [letter]: false }));
      const arrivedAt = Date.now() - issuedAt;
      if (defenseMode) {
        if (latestReqRef.current === id) {
          resultRef.current = { letter, order: id, stale: false };
          setResult(resultRef.current);
          append(setRaceLogs, [
            [
              `+${arrivedAt}ms ← ${letter} (req#${id}) — ÁP DỤNG (response mới nhất ✅)`,
              'ok',
            ],
          ]);
        } else {
          append(setRaceLogs, [
            [
              `+${arrivedAt}ms ← ${letter} (req#${id}) về TRỄ nhưng bị stale-guard BỎ QUA ✅`,
              'warn',
            ],
          ]);
        }
        return;
      }
      const current = resultRef.current;
      if (current && current.order > id) {
        resultRef.current = { letter, order: id, stale: true };
        setResult(resultRef.current);
        setHits((prev) => ({ ...prev, race: true }));
        append(setRaceLogs, [
          [
            `+${arrivedAt}ms ← ${letter} (req#${id}, CŨ) về SAU CÙNG → ĐÈ lên kết quả mới 💀`,
            'bad',
          ],
          [
            `last-write-wins: user tìm "${current.letter === 'A' ? 'B' : 'A'}"... màn hình lại hiện ${letter}`,
            'bad',
          ],
        ]);
        return;
      }
      resultRef.current = { letter, order: id, stale: false };
      setResult(resultRef.current);
      append(setRaceLogs, [
        [`+${arrivedAt}ms ← ${letter} (req#${id}) — hiển thị kết quả`, 'ok'],
      ]);
    }, latency);
    raceTimersRef.current.push(timer);
  };

  // ── Stale closure ─────────────────────────────────────────────────────────
  const [count, setCount] = React.useState(0);
  const [expected, setExpected] = React.useState(0);
  const expectedRef = React.useRef(0);
  const [pendingBonuses, setPendingBonuses] = React.useState<PendingBonus[]>([]);
  const [closureLogs, setClosureLogs] = React.useState<LogLine[]>([]);
  const bonusIdRef = React.useRef(0);
  const bonusTimersRef = React.useRef<number[]>([]);

  const clickPlusOne = () => {
    setCount((c) => c + 1); // +1 luôn dùng functional updater để cô lập bug vào timeout
    setExpected((e) => e + 1);
    expectedRef.current += 1;
  };

  const scheduleBonus = () => {
    const snapshot = count; // 💀 closure chốt GIÁ TRỊ tại thời điểm bấm
    const id = ++bonusIdRef.current;
    setExpected((e) => e + 10);
    expectedRef.current += 10;
    setPendingBonuses((prev) => [...prev, { id, snapshot }]);
    append(setClosureLogs, [
      [
        `⏰ hẹn +10 sau 2s — closure đóng băng count=${snapshot}${!defenseMode ? ' (snapshot!)' : ''}`,
        'info',
      ],
    ]);
    const timer = window.setTimeout(() => {
      setPendingBonuses((prev) => prev.filter((b) => b.id !== id));
      if (defenseMode) {
        setCount((c) => c + 10); // ✅ updater nhận giá trị MỚI NHẤT
        append(setClosureLogs, [
          [
            `t+2s ⏰ timeout nổ → setCount(c => c + 10) — đọc giá trị LIVE tại thời điểm thực thi ✅`,
            'ok',
          ],
        ]);
        return;
      }
      const applied = snapshot + 10;
      setCount(applied);
      const exp = expectedRef.current;
      append(setClosureLogs, [
        [
          `t+2s ⏰ timeout nổ — closure vẫn nhớ count=${snapshot} → setCount(${applied})`,
          'bad',
        ],
        ...(applied !== exp
          ? ([
              [
                `expected=${exp} → MẤT ${exp - applied} lượt tăng, dữ liệu TƯƠNG LAI bị quá khứ ghi đè 💀`,
                'bad',
              ],
            ] as Array<[string, Tone]>)
          : ([
              [`lần này trùng khớp — hãy spam "+1" TRONG lúc chờ 2s rồi hẹn lại`, 'warn'],
            ] as Array<[string, Tone]>)),
      ]);
      if (applied !== exp) setHits((prev) => ({ ...prev, closure: true }));
    }, 2000);
    bonusTimersRef.current.push(timer);
  };

  // ── Immortal interval swarm ───────────────────────────────────────────────
  const [activeIntervals, setActiveIntervals] = React.useState(0);
  const [totalTicks, setTotalTicks] = React.useState(0);
  const [navigatedAway, setNavigatedAway] = React.useState(false);
  const [intervalLogs, setIntervalLogs] = React.useState<LogLine[]>([]);
  const intervalsRef = React.useRef<number[]>([]);

  const clearAllIntervals = () => {
    intervalsRef.current.forEach((id) => window.clearInterval(id));
    intervalsRef.current = [];
    setActiveIntervals(0);
  };

  const mountTicker = () => {
    if (activeIntervals >= 25) return;
    const id = window.setInterval(() => setTotalTicks((t) => t + 1), 500);
    intervalsRef.current.push(id);
    setActiveIntervals((a) => a + 1);
    setNavigatedAway(false);
    append(setIntervalLogs, [
      [`mount #${activeIntervals + 1} → setInterval(#${id}, 500ms) khởi động`, 'info'],
    ]);
  };

  const navigateAway = () => {
    setNavigatedAway(true);
    if (defenseMode) {
      const n = activeIntervals;
      clearAllIntervals();
      append(setIntervalLogs, [
        [`unmount → cleanup() chạy: clearInterval ×${n} → còn 0 timer ✅`, 'ok'],
        ['mỗi subscription có một unsubscribe — StrictMode cũng không còn là bẫy', 'ok'],
      ]);
      return;
    }
    if (activeIntervals > 0) setHits((prev) => ({ ...prev, leak: true }));
    append(setIntervalLogs, [
      [`unmount → KHÔNG có cleanup…`, 'bad'],
      [
        `${activeIntervals} interval VẪN CHẠY ngầm trên component đã chết — zombie timers 🧟`,
        'bad',
      ],
      [`backend nhận ${activeIntervals * 120} request/phút từ MỘT tab duy nhất`, 'warn'],
    ]);
  };

  const closeTab = () => {
    clearAllIntervals();
    setNavigatedAway(false);
    append(setIntervalLogs, [
      ['🛑 giả lập đóng tab — browser thu hồi toàn bộ timer của page', 'info'],
    ]);
  };

  // Dọn mọi timer khi lab unmount (đúng tinh thần của chính bài học)
  React.useEffect(() => {
    const raceTimers = raceTimersRef;
    const bonusTimers = bonusTimersRef;
    const intervals = intervalsRef;
    return () => {
      raceTimers.current.forEach((t) => window.clearTimeout(t));
      bonusTimers.current.forEach((t) => window.clearTimeout(t));
      intervals.current.forEach((i) => window.clearInterval(i));
    };
  }, []);

  const resetRange = () => {
    raceTimersRef.current.forEach((t) => window.clearTimeout(t));
    bonusTimersRef.current.forEach((t) => window.clearTimeout(t));
    raceTimersRef.current = [];
    bonusTimersRef.current = [];
    clearAllIntervals();
    setInFlight({ A: false, B: false });
    resultRef.current = null;
    setResult(null);
    setRaceLogs([]);
    setCount(0);
    setExpected(0);
    expectedRef.current = 0;
    setPendingBonuses([]);
    setClosureLogs([]);
    setTotalTicks(0);
    setNavigatedAway(false);
    setIntervalLogs([]);
    setHits({ race: false, closure: false, leak: false });
  };

  const hitCount = (hits.race ? 1 : 0) + (hits.closure ? 1 : 0) + (hits.leak ? 1 : 0);

  const renderLogBox = (logs: LogLine[]) =>
    logs.length > 0 ? (
      <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed">
        {logs.map((line) => (
          <div
            key={line.id}
            className={
              line.tone === 'bad'
                ? 'text-red-400'
                : line.tone === 'ok'
                  ? 'text-emerald-400'
                  : line.tone === 'warn'
                    ? 'text-amber-400'
                    : 'text-slate-500'
            }
          >
            {line.text}
          </div>
        ))}
      </div>
    ) : null;

  const renderLatencySlider = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    accent: string
  ) => (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
        {label}
      </span>
      <input
        type="range"
        min={100}
        max={3000}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-1.5 w-full cursor-pointer ${accent}`}
        aria-label={`Latency ${label}`}
      />
      <span className="w-14 shrink-0 text-right font-mono text-[10px] text-slate-300">
        {value}ms
      </span>
    </div>
  );

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
          <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            đã ghi nhận {hitCount}/3 sai phạm bất đồng bộ
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
            Không guard
          </Button>
          <Button
            size="sm"
            variant={defenseMode ? 'default' : 'ghost'}
            onClick={() => setDefenseMode(true)}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Abort + updater + cleanup
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetRange}
            className="h-7 px-2 text-[11px]"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Tab-like switcher */}
      <div className="border-border/80 bg-card flex w-fit gap-1 rounded-xl border p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-slate-100 shadow-inner'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Race mini-range ── */}
      {activeTab === 'race' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>$ search-as-you-type · response nào về SAU ghi đè tất cả</span>
            <Badge
              variant={defenseMode ? 'success' : 'destructive'}
              className="text-[9px]"
            >
              {defenseMode
                ? 'guard: AbortController + stale-guard'
                : 'guard: NONE — last-write-wins'}
            </Badge>
          </div>

          <div className="space-y-1.5 rounded-lg bg-black/40 p-2.5">
            {renderLatencySlider('latency A', latencyA, setLatencyA, 'accent-sky-400')}
            {renderLatencySlider('latency B', latencyB, setLatencyB, 'accent-rose-400')}
            <p className="font-mono text-[10px] text-slate-600">
              {'// kéo B chậm hơn A, bấm A rồi B NGAY LẬP TỨC để mở cửa sổ race'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => fireSearch('A')}
              className="h-8 bg-sky-600 text-[11px] hover:bg-sky-500"
            >
              <Search className="mr-1 h-3 w-3" />
              Tìm kiếm &quot;react hooks&quot;
            </Button>
            <Button
              size="sm"
              onClick={() => fireSearch('B')}
              className="h-8 bg-rose-600 text-[11px] hover:bg-rose-500"
            >
              <Search className="mr-1 h-3 w-3" />
              Tìm kiếm &quot;react router&quot;
            </Button>
            {inFlight.A && (
              <Badge variant="info" className="animate-pulse text-[9px]">
                A đang bay…
              </Badge>
            )}
            {inFlight.B && (
              <Badge variant="warning" className="animate-pulse text-[9px]">
                B đang bay…
              </Badge>
            )}
          </div>

          {/* Kết quả hiển thị */}
          <div
            className={`rounded-lg border p-3 ${
              result?.stale
                ? 'border-destructive/60 ring-destructive/40 bg-red-500/10 ring-2'
                : 'border-slate-800 bg-black/40'
            }`}
          >
            {result ? (
              <div className="space-y-1">
                <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                  kết quả đang hiển thị:
                </p>
                <p
                  className={`font-mono text-sm font-bold ${result.stale ? 'text-red-300' : 'text-emerald-300'}`}
                >
                  📄 Kết quả cho &quot;
                  {result.letter === 'A' ? 'react hooks' : 'react router'}&quot;
                </p>
                {result.stale && (
                  <p className="animate-pulse font-mono text-[11px] font-bold text-red-400">
                    ⚠️ SAI KẾT QUẢ — user vừa tìm query khác nhưng response cũ về sau đã
                    ghi đè!
                  </p>
                )}
              </div>
            ) : (
              <p className="animate-pulse font-mono text-[11px] text-slate-600">
                $ chưa có kết quả nào…
              </p>
            )}
          </div>

          {renderLogBox(raceLogs)}
        </div>
      )}

      {/* ── Stale closure mini-range ── */}
      {activeTab === 'closure' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>$ setTimeout(() =&gt; setCount(count + 10), 2000)</span>
            <Badge
              variant={defenseMode ? 'success' : 'destructive'}
              className="text-[9px]"
            >
              {defenseMode
                ? 'fix: setCount(c => c + 10)'
                : 'bug: closure giữ snapshot cũ'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className={`rounded-lg border p-3 text-center ${
                count !== expected
                  ? 'border-destructive/50 bg-red-500/10'
                  : 'border-slate-800 bg-black/40'
              }`}
            >
              <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                actual (hiển thị)
              </p>
              <p
                className={`font-mono text-3xl font-bold tabular-nums ${count !== expected ? 'text-red-400' : 'text-slate-100'}`}
              >
                {count}
              </p>
              {count !== expected && (
                <p className="mt-1 font-mono text-[10px] text-red-400">
                  thiếu {expected - count} so với kỳ vọng
                </p>
              )}
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/40 p-3 text-center">
              <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                expected (kỳ vọng)
              </p>
              <p className="font-mono text-3xl font-bold text-emerald-400 tabular-nums">
                {expected}
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-600">
                mỗi ý định +1 / mỗi bonus +10
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={clickPlusOne}
              className="h-8 text-[11px]"
            >
              +1 (spam được)
            </Button>
            <Button
              size="sm"
              variant={defenseMode ? 'default' : 'destructive'}
              onClick={scheduleBonus}
              className="h-8 text-[11px]"
            >
              ⏰ Hẹn +10 sau 2 giây
            </Button>
            {pendingBonuses.map((b) => (
              <Badge key={b.id} variant="warning" className="animate-pulse text-[9px]">
                bonus đang chờ (nhớ count={b.snapshot})
              </Badge>
            ))}
          </div>
          <p className="font-mono text-[10px] text-slate-600">
            {!defenseMode
              ? '// bấm "Hẹn +10" rồi spam "+1" trong lúc chờ — timeout sẽ GHI ĐÈ ngược bằng snapshot đã đóng băng'
              : '// functional updater đọc giá trị mới nhất tại thời điểm timeout nổ — không bao giờ mất tăng'}
          </p>

          {renderLogBox(closureLogs)}
        </div>
      )}

      {/* ── Immortal interval mini-range ── */}
      {activeTab === 'interval' && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>$ LiveTicker · polling 500ms</span>
            <Badge
              variant={defenseMode ? 'success' : 'destructive'}
              className="text-[9px]"
            >
              {defenseMode ? 'cleanup: return clearInterval' : 'cleanup: KHÔNG TỒN TẠI'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-800 bg-black/40 p-2.5 text-center">
              <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                intervals sống
              </p>
              <p
                className={`font-mono text-2xl font-bold tabular-nums ${activeIntervals > 1 ? 'text-amber-400' : 'text-slate-100'}`}
              >
                {Math.min(activeIntervals, 20)}
                {activeIntervals > 20 ? '+' : ''}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/40 p-2.5 text-center">
              <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                total ticks
              </p>
              <p className="font-mono text-2xl font-bold text-sky-400 tabular-nums">
                {totalTicks}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/40 p-2.5 text-center">
              <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                tải backend
              </p>
              <p
                className={`font-mono text-2xl font-bold tabular-nums ${activeIntervals > 1 ? 'text-red-400' : 'text-slate-100'}`}
              >
                {activeIntervals * 120}
              </p>
              <p className="font-mono text-[9px] text-slate-600">request/phút</p>
            </div>
          </div>

          {navigatedAway && activeIntervals > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5">
              <Ghost className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="font-mono text-[11px] leading-relaxed text-amber-300">
                Component ĐÃ unmount nhưng {activeIntervals} timer mồ côi vẫn tick — heap
                snapshot: {activeIntervals} detached Timer · RAM +{activeIntervals * 18}MB
                và không giảm sau GC.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={mountTicker}
              disabled={activeIntervals >= 25}
              className="h-8 text-[11px]"
            >
              <Play className="mr-1 h-3 w-3" />
              Mount LiveTicker (+1 interval)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={navigateAway}
              className="h-8 text-[11px]"
            >
              <Route className="mr-1 h-3 w-3" />
              Điều hướng sang trang khác (unmount)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={closeTab}
              className="h-8 text-[11px]"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Giả lập đóng tab
            </Button>
          </div>
          <p className="font-mono text-[10px] text-slate-600">
            {!defenseMode
              ? '// mount vài lần rồi "rời trang" — không ai clearInterval nên swarm sống mãi, quay lại trang là cộng dồn tiếp'
              : '// unmount kích hoạt cleanup đối xứng: đúng SỐ timer đã tạo được hạ xuống đúng bấy nhiêu'}
          </p>

          {renderLogBox(intervalLogs)}
        </div>
      )}

      {/* Per-vector report */}
      <div className="space-y-2">
        {(
          [
            {
              key: 'race' as const,
              icon: <Swords className="h-3.5 w-3.5" />,
              label: 'Last Response Wins Race',
              hit: hits.race,
              hitNote:
                'Response cũ về sau cùng ghi đè dữ liệu mới — không exception, không cảnh báo, chỉ dữ liệu sai im lặng.',
              patchNote:
                'AbortController hủy request cũ khi có request mới + stale-guard chỉ nhận kết quả của req mới nhất.',
            },
            {
              key: 'closure' as const,
              icon: <HistoryIcon className="h-3.5 w-3.5" />,
              label: 'Stale Closure trong setTimeout',
              hit: hits.closure,
              hitNote:
                'Closure đóng băng snapshot cũ: timeout nổ setCount(snapshot + 10) — mọi lượt tăng trong lúc chờ bị nuốt.',
              patchNote:
                'Functional updater setCount(c => c + 10) nhận giá trị mới nhất tại thời điểm thực thi — không còn snapshot chết.',
            },
            {
              key: 'leak' as const,
              icon: <InfinityIcon className="h-3.5 w-3.5" />,
              label: 'Immortal Interval Swarm',
              hit: hits.leak,
              hitNote:
                'Interval không cleanup sống sót qua unmount — mỗi lần quay lại trang cộng dồn thêm timer, RAM leo thang.',
              patchNote:
                'Cleanup return protocol: setup setInterval ↔ return () => clearInterval — StrictMode trở thành unit test miễn phí.',
            },
          ] as Array<{
            key: TabId;
            icon: React.ReactNode;
            label: string;
            hit: boolean;
            hitNote: string;
            patchNote: string;
          }>
        ).map((vector) => {
          const showHit = vector.hit && !defenseMode;
          return (
            <Card
              key={vector.key}
              className={`glass-card flex items-start gap-3 p-3 ${
                showHit
                  ? 'border-destructive/30'
                  : defenseMode
                    ? 'border-emerald-500/20'
                    : ''
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  showHit
                    ? 'bg-destructive/10 text-destructive'
                    : defenseMode
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {showHit ? (
                  <Skull className="h-3.5 w-3.5" />
                ) : defenseMode ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  vector.icon
                )}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-foreground text-xs font-bold">{vector.label}</p>
                {showHit && (
                  <p className="text-destructive text-[11px] leading-relaxed">
                    {vector.hitNote}
                  </p>
                )}
                {defenseMode && (
                  <p className="text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                    {vector.patchNote}
                  </p>
                )}
                {!showHit && !defenseMode && (
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Chưa ghi nhận — tái hiện vector này ở ATTACK MODE để xem Blast Radius.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verdict */}
      {(hitCount > 0 || defenseMode) && (
        <Card
          className={`glass-card p-4 ${defenseMode ? 'border-emerald-500/30' : 'border-destructive/30'}`}
        >
          {hitCount > 0 && !defenseMode ? (
            <p className="text-foreground text-xs leading-relaxed">
              💀 <span className="font-bold">Blast Radius:</span> response cũ ghi đè kết
              quả mới mà không một exception nào, closure gửi dữ liệu đã chết thẳng lên
              server, và swarm interval bất tử nhân tải backend theo mỗi lần điều hướng —
              cả ba đều không crash, chỉ âm thầm sai và đốt tiền hạ tầng.
            </p>
          ) : (
            <p className="text-foreground text-xs leading-relaxed">
              🛡️{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Defense Patch:
              </span>{' '}
              AbortController + stale-guard đảm bảo chỉ response mới nhất được áp dụng,
              functional updater đọc giá trị live thay vì snapshot, cleanup return hạ đúng
              số timer đã tạo — mọi vector chuyển trạng thái PATCHED.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
