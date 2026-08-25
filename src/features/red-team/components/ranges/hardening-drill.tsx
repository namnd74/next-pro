'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Search,
  ShieldCheck,
  Skull,
  Timer,
  Wifi,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * FIRING RANGE · blue-team-capstone drill
 * Game định dạng drill 3 hiệp: mỗi hiệp nộp một test "vulnerable" — flaky real-timer,
 * assertion bám CSS, và lỗ hổng network chưa mock. Người chơi chọn đúng bản vá
 * hardening; sai là nhận ngay hậu quả production. 3/3 mở kết luận hàng phòng thủ.
 */

interface DrillChoice {
  id: string;
  label: string;
  correct: boolean;
  /** Giải thích khi chọn phương án này */
  verdict: string;
  /** Hậu quả production khi chọn sai (rỗng với đáp án đúng) */
  consequence: string;
}

interface DrillRound {
  id: string;
  icon: React.ReactNode;
  vectorName: string;
  title: string;
  /** Vì sao scenario này là vết nứt nguy hiểm */
  threat: string;
  scenario: string;
  question: string;
  choices: DrillChoice[];
  defenseTakeaway: string;
}

const ROUNDS: DrillRound[] = [
  {
    id: 'r1',
    icon: <Timer className="h-3.5 w-3.5" />,
    vectorName: 'Real-Timer Flaky Fuse',
    title: 'Hiệp 1 · Test đua với thời gian thật',
    threat:
      'setTimeout debounce 300ms chạy bằng timer THẬT. Laptop dev kịp fire; CI đang quá tải thì scheduler chậm vài chục ms — assert chạy trước timer, đỏ ngẫu nhiên. Vá dân gian bằng sleep + retry chỉ khiến bug thật bị nuốt sau màn xanh giả.',
    scenario: `// ❌ searchBox.test.tsx — đua với thời gian thực
test('gọi search API sau debounce', async () => {
  render(<SearchBox />);
  await userEvent.setup().type(screen.getByRole('textbox'), 'react');

  await new Promise((r) => setTimeout(r, 500)); // 🩹 'chờ debounce' bằng sleep
  expect(searchApi).toHaveBeenCalledWith('react'); // 😬 đỏ ngẫu nhiên trên CI
});

// $ local 5/5 PASS — CI 2/10 PASS · team bật retry: 2 cho hết đỏ`,
    question: 'CI đỏ ngẫu nhiên ~80%. Bản vá hardening nào biến test này deterministic tuyệt đối?',
    choices: [
      {
        id: 'r1a',
        label: "Bật retry: 3 trong config CI — đỏ thì chạy lại đến khi xanh",
        correct: false,
        verdict: 'Retry không sửa race condition — nó che nó sau lớp chạy lại.',
        consequence:
          'Bug thật bị nuốt im lặng sau màn xanh giả; suite chậm gấp nhiều lần, chi phí compute CI đội lên, và cả team quen mắt với đỏ.',
      },
      {
        id: 'r1b',
        label:
          'vi.useFakeTimers() + userEvent.setup({ advanceTimers }) rồi vi.advanceTimersByTime(300)',
        correct: true,
        verdict:
          'Đúng. Fake clock đặt thời gian dưới quyền kiểm soát của test: assert được cả "chưa gọi trước 300ms" lẫn "gọi đúng 1 lần sau advance" — chạy giống nhau trên mọi máy, không phụ thuộc tải CI.',
        consequence: '',
      },
      {
        id: 'r1c',
        label: 'Tăng sleep lên 2000ms cho chắc chắn timer đã fire',
        correct: false,
        verdict:
          'Sleep dài hơn chỉ dịch ngưỡng race — ngày CI đủ tải, 2000ms vẫn không đủ.',
        consequence:
          'Suite chậm chết dần, vòng phản hồi TDD kéo dài; flake vẫn còn nguyên, chỉ giảm tần suất để tái xuất lúc khó debug nhất.',
      },
      {
        id: 'r1d',
        label: 'Xoá test debounce vì hay đỏ — tin vào manual QA là được',
        correct: false,
        verdict: 'Đây là bỏ radar thay vì sửa radar.',
        consequence:
          'Mất coverage đúng hành vi nghiệp vụ quan trọng nhất của SearchBox; regression debounce sẽ lọt vào main không báo động.',
      },
    ],
    defenseTakeaway:
      'Không bao giờ test đua với thời gian thực — fake timers + advanceTimersByTime biến flaky thành deterministic.',
  },
  {
    id: 'r2',
    icon: <Search className="h-3.5 w-3.5" />,
    vectorName: 'Selector Fragility Bomb',
    title: 'Hiệp 2 · Assertion bám chi tiết triển khai',
    threat:
      'querySelector(".btn-primary.px-4") neo vào class Tailwind — chi tiết triển khai thuần tuý. Một đợt migrate design token đổi .btn-primary thành bg-primary: app trên staging chạy hoàn hảo nhưng 87 test đỏ đồng loạt, và dev bắt đầu sửa COMPONENT cho vừa assertion.',
    scenario: `// ❌ productCard.test.tsx — khoá cứng vào CSS
test('nút mua hiển thị đúng', () => {
  const { container } = render(<ProductCard product={fakeProduct} />);
  const btn = container.querySelector('.btn-primary.px-4'); // 💣 class trang trí!
  expect(btn?.textContent).toBe('Thêm vào giỏ');
});

// $ git commit 'refactor(ui): migrate design tokens'
// > 87 tests FAILED · manual QA: app hoạt động hoàn hảo ✓`,
    question:
      'Design system sắp refactor hàng loạt. Cách assert nào giữ test xanh qua mọi đợt đổi markup/CSS?',
    choices: [
      {
        id: 'r2a',
        label: 'Cập nhật selector sang class mới (.bg-primary.px-4) sau mỗi lần refactor',
        correct: false,
        verdict: 'Vẫn khoá vào chi tiết triển khai — bạn vừa biến suite thành việc làm tay vĩnh viễn.',
        consequence:
          'Mỗi refactor UI kéo theo đợt sửa test cơ học; refactor đóng băng vì sợ, và đuôi vẫy con chó: test điều khiển design.',
      },
      {
        id: 'r2b',
        label: "screen.queryByRole('button', { name: /thêm vào giỏ/i })",
        correct: true,
        verdict:
          'Đúng. Role query nhìn UI qua mắt người dùng: tên nút là hợp đồng người dùng thấy, không phải CSS đằng sau. Đổi div → section, đổi token màu, đổi font — test vẫn xanh, và còn audit accessibility miễn phí.',
        consequence: '',
      },
      {
        id: 'r2c',
        label: 'Thêm data-testid="buy-button" rồi queryByTestId cho ổn định',
        correct: false,
        verdict:
          'testid đỡ gãy hơn class nhưng vẫn là mỏ neo cứng phải đặt và bảo trì tay ở từng component.',
        consequence:
          'Quên đặt testid là test đỏ oan; queryByTestId cũng không kiểm chứng người dùng thật thao tác được (không audit role/label như getByRole).',
      },
      {
        id: 'r2d',
        label: 'Snapshot cả chuỗi className để bắt sớm mọi thay đổi giao diện',
        correct: false,
        verdict: 'Snapshot className là chế độ báo động giả được industrial hoá.',
        consequence:
          'Mọi chỉnh sửa UI vô hại cũng đỏ; team dần ignore snapshot, coverage 82% nhưng suite mất hẳn uy tín.',
      },
    ],
    defenseTakeaway:
      'Test những gì người dùng thấy và làm — getByRole/queryByRole kết hợp userEvent — để refactor tự do mà bộ test vẫn xanh.',
  },
  {
    id: 'r3',
    icon: <Wifi className="h-3.5 w-3.5" />,
    vectorName: 'Unmocked Network Leak',
    title: 'Hiệp 3 · Request thật bay ra staging API',
    threat:
      "MSW đang chạy với onUnhandledRequest: 'bypass'. Component thêm analytics beacon mới nhưng quên đăng ký handler: request bay thẳng ra staging API thật từ unit test — env có cred thì ghi rác 1.483 events vào dashboard team khác, thiếu cred thì treo đến timeout 30s.",
    scenario: `// ❌ setupTests.ts — cửa ngỏ thông ra mạng thật
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// mocks/handlers.ts
export const handlers = [
  http.get('/api/products', () => HttpResponse.json(FIXTURES.products)),
  // 💀 POST /api/analytics/events KHÔNG có handler
];

test('track view event khi mount', () => {
  render(<ProductCard product={fakeProduct} />);
  // fetch('/api/analytics/events') → forwarded to REAL staging API
});`,
    question:
      'Chặn vĩnh viễn mọi request lọt ra Internet mà vẫn giữ mock có tổ chức — chọn bản vá đúng:',
    choices: [
      {
        id: 'r3a',
        label: "Giữ nguyên 'bypass', chỉ nhớ tắt VPN khi chạy test cho nhanh",
        correct: false,
        verdict: "'Bypass' chính là tính năng rò rỉ — tắt VPN chỉ đổi đường dây của cuộc rò rỉ.",
        consequence:
          'Unit test vẫn chạm hệ thống live bất kỳ khi nào env có cred: ô nhiễm dữ liệu dùng chung và rủi ro bảo mật khó biện minh trước audit.',
      },
      {
        id: 'r3b',
        label: 'onUnhandledRequest: "error" + thêm http.post("/api/analytics/events") handler + afterEach(server.resetHandlers())',
        correct: true,
        verdict:
          'Đúng. Request lạ giờ FAIL NGAY tại chỗ thay vì bay ra ngoài; handler matrix phủ đủ endpoint component chạm tới; resetHandlers cho mỗi test một thế giới sạch. Không gì lọt ra mạng thật nữa.',
        consequence: '',
      },
      {
        id: 'r3c',
        label: "Trỏ BASE_URL sang localhost trong env test để request 'không đi đâu'",
        correct: false,
        verdict: 'Che giấu vấn đề chứ không vá: một dòng env lệch là request lại bay ra staging thật.',
        consequence:
          'Suite âm thầm phụ thuộc cấu hình máy — staging sập hoặc env sai là TOÀN BỘ PR đỏ không rõ nguyên nhân.',
      },
      {
        id: 'r3d',
        label: 'Bỏ MSW, stub global.fetch = vi.fn() riêng lẻ trong từng test cần thiết',
        correct: false,
        verdict:
          'Mock rời rạc mất matrix dùng chung: endpoint nào quên stub là lộ tiếp đúng như cũ, chỉ khác tên thủ phạm.',
        consequence:
          'Mỗi component tự chế mock riêng — trùng lặp, lệch contract, và danh sách "đã quên stub" dài dần theo số feature mới.',
      },
    ],
    defenseTakeaway:
      "onUnhandledRequest: 'error' + lifecycle listen/resetHandlers/close nghiêm ngặt: mọi request phải có chủ, không gì lọt ra mạng thật.",
  },
];

const TOTAL_ROUNDS = ROUNDS.length;

type RoundResult = 'correct' | 'wrong' | null;

const emptyResults = (): RoundResult[] =>
  Array.from({ length: TOTAL_ROUNDS }, () => null as RoundResult);

export function HardeningDrill() {
  /* Skull/ShieldCheck toggle: hiện lý do scenario nguy hiểm hay không */
  const [showThreatHints, setShowThreatHints] = React.useState(true);

  const [current, setCurrent] = React.useState(0);
  const [pickedId, setPickedId] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<RoundResult[]>(emptyResults);

  const finished = current >= TOTAL_ROUNDS;
  const round = finished ? null : ROUNDS[current];
  const score = results.filter((r) => r === 'correct').length;
  const weakRounds = ROUNDS.filter((_, i) => results[i] === 'wrong');

  const pickedChoice =
    round && pickedId ? round.choices.find((c) => c.id === pickedId) ?? null : null;

  const pick = (choiceId: string) => {
    if (!round || pickedId) return;
    const choice = round.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    setPickedId(choiceId);
    setResults((prev) =>
      prev.map((r, i) => (i === current ? (choice.correct ? 'correct' : 'wrong') : r))
    );
  };

  const next = () => {
    setPickedId(null);
    setCurrent((c) => c + 1);
  };

  const retry = () => {
    setCurrent(0);
    setPickedId(null);
    setResults(emptyResults());
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info" className="gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            BLUE TEAM · CAPSTONE DRILL
          </Badge>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {finished ? 'hoàn tất' : `hiệp ${current + 1}/${TOTAL_ROUNDS}`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1">
            {results.map((r, i) =>
              r === 'correct' ? (
                <CheckCircle2 key={i} className="h-3.5 w-3.5 text-emerald-500" />
              ) : r === 'wrong' ? (
                <XCircle key={i} className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <span key={i} className="h-3 w-3 rounded-full border border-slate-700" />
              )
            )}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            điểm {score}/{TOTAL_ROUNDS}
          </span>
          <Button
            size="sm"
            variant={showThreatHints ? 'destructive' : 'ghost'}
            onClick={() => setShowThreatHints((v) => !v)}
            className="h-7 text-[11px]"
          >
            <Skull className="mr-1 h-3 w-3" />
            Gợi ý rủi ro {showThreatHints ? 'ON' : 'OFF'}
          </Button>
          <Button size="sm" variant="outline" onClick={retry} className="h-7 text-[11px]">
            <RotateCcw className="mr-1 h-3 w-3" />
            Drill lại
          </Button>
        </div>
      </div>

      {/* Round card */}
      {round && (
        <Card className="glass-card space-y-3 p-3 sm:p-4">
          {/* Round header */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                {round.icon}
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">{round.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{round.vectorName}</p>
              </div>
            </div>
            <Badge variant="warning" className="text-[10px]">
              TEST VULNERABLE
            </Badge>
          </div>

          {/* Threat hint */}
          {showThreatHints && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 font-mono text-[10px] leading-relaxed text-destructive">
              ☠ Vì sao vết nứt này nguy hiểm: {round.threat}
            </div>
          )}

          {/* Scenario */}
          <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-slate-300">
            {round.scenario}
          </pre>

          {/* Question */}
          <p className="text-xs font-bold text-foreground">{round.question}</p>

          {/* Choices */}
          <div className="space-y-1.5">
            {round.choices.map((choice, idx) => {
              const revealed = pickedId !== null;
              const isPicked = pickedId === choice.id;
              const stateCls = !revealed
                ? 'cursor-pointer border-slate-700 bg-slate-900/60 text-slate-300 hover:border-primary/40 hover:bg-slate-800'
                : choice.correct
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : isPicked
                    ? 'border-destructive/50 bg-destructive/10 text-red-300'
                    : 'border-slate-800 bg-slate-900/40 text-slate-600 opacity-60';
              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={revealed}
                  onClick={() => pick(choice.id)}
                  className={`flex w-full items-start gap-2 rounded-lg border p-2.5 text-left font-mono text-[11px] leading-relaxed transition-colors disabled:cursor-default ${stateCls}`}
                >
                  <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                  <span>{choice.label}</span>
                </button>
              );
            })}
          </div>

          {/* Immediate feedback */}
          {pickedChoice && round && (
            <Card
              className={`glass-card p-3 ${
                pickedChoice.correct ? 'border-emerald-500/30' : 'border-destructive/30'
              }`}
            >
              {pickedChoice.correct ? (
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    ✅ GIẢI THÍCH — bản vá chuẩn
                  </p>
                  <p className="text-foreground">{pickedChoice.verdict}</p>
                  <p className="text-emerald-600 dark:text-emerald-400">
                    🛡️ Takeaway: {round.defenseTakeaway}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p className="font-bold text-destructive">❌ VÌ SAO SAI</p>
                  <p className="text-foreground">{pickedChoice.verdict}</p>
                  <p className="text-destructive">
                    💥 Hậu quả production: {pickedChoice.consequence}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Next */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={next}
              disabled={!pickedId}
              className="h-7 text-[11px]"
            >
              {current === TOTAL_ROUNDS - 1 ? 'Xem kết luận' : 'Tiếp tục'}
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Final verdict */}
      {finished && (
        <Card
          className={`glass-card p-4 ${
            score === TOTAL_ROUNDS ? 'border-emerald-500/30' : 'border-destructive/30'
          }`}
        >
          {score === TOTAL_ROUNDS ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                🏆 Hàng phòng thủ đạt chuẩn — {score}/{TOTAL_ROUNDS}
              </p>
              <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-muted-foreground">
                {ROUNDS.map((r) => (
                  <li key={r.id}>
                    <span className="font-semibold text-foreground">{r.vectorName}:</span>{' '}
                    {r.defenseTakeaway}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-destructive">
                💀 Kết quả {score}/{TOTAL_ROUNDS} — hàng phòng thủ còn điểm yếu:
              </p>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {weakRounds.map((r) => (
                  <li key={r.id}>
                    ❌ <span className="font-semibold text-foreground">{r.title}</span> — bản vá
                    đúng:{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {r.choices.find((c) => c.correct)?.label ?? ''}
                    </span>
                    . {r.defenseTakeaway}
                  </li>
                ))}
              </ul>
              <Button size="sm" onClick={retry} className="h-7 text-[11px]">
                <RotateCcw className="mr-1 h-3 w-3" />
                Drill lại từ đầu
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
