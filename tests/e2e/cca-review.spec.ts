import { expect, test, type Page } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const questions = [
  {
    id: 'ccar-p-001',
    type: 'multiple_response',
    prompt:
      'A managed agent deployment for claims triage has grown from 6 tools to 34 tools over 18 months as product teams added capabilities. Triage accuracy has declined from 91 percent to 78 percent, and average tool selection latency has increased by 2.3 seconds. A junior engineer has proposed adding a tool router agent in front of the current agent to filter the tool list per request.\nWhich two findings should you present to justify capability decomposition before adding the router? (Select two.)',
    choices: [
      {
        id: 'A',
        text: 'The router pattern is well-documented across publicly available agent literature.',
      },
      {
        id: 'B',
        text: 'The proposed router introduces an additional model call on every incoming request.',
      },
      {
        id: 'C',
        text: 'The 34 tools serve four distinct claim workflow domains within the triage scope.',
      },
      {
        id: 'D',
        text: 'Several tools have not been invoked across the most recent 90 days of traffic.',
      },
    ],
    correctChoiceIds: ['B', 'C'],
    studyGuide: {
      promptVi:
        'Một hệ thống managed agent để phân loại yêu cầu bồi thường (claims triage) đã tăng từ 6 tools lên 34 tools trong 18 tháng.',
      choicesVi: [
        {
          id: 'A',
          text: 'Mẫu thiết kế router đã được ghi chép đầy đủ trong các tài liệu công khai về agent.',
        },
        {
          id: 'B',
          text: 'Router được đề xuất sẽ phát sinh thêm một lệnh gọi model (model call) trên mỗi request đầu vào.',
        },
        {
          id: 'C',
          text: '34 tools này phục vụ bốn miền quy trình bồi thường (claim workflow domains) riêng biệt trong phạm vi phân loại.',
        },
        {
          id: 'D',
          text: 'Một số tools chưa từng được gọi trong suốt 90 ngày lưu lượng truy cập gần nhất.',
        },
      ],
      questionKeywords: [
        'grown from 6 tools to 34 tools',
        'tool router agent',
        'justify capability decomposition',
      ],
      answerKeywords: [
        'additional model call on every incoming request',
        'four distinct claim workflow domains',
      ],
      explanationVi:
        'Việc thêm một tool router agent phía trước sẽ tạo thêm một model call cho mỗi request (B), làm tăng độ trễ.',
    },
  },
  {
    id: 'cca-f-001',
    type: 'single_choice',
    prompt: 'Khi phiên đăng nhập hết hạn, giao diện ôn tập cần xử lý thế nào?',
    choices: [
      { id: 'A', text: 'Tiếp tục hiển thị tài liệu đã tải.' },
      { id: 'B', text: 'Xóa tài liệu khỏi giao diện và yêu cầu đăng nhập lại.' },
      { id: 'C', text: 'Tự chuyển sang tài khoản demo.' },
    ],
    correctChoiceIds: ['B'],
  },
];

async function fixture(page: Page, bank = questions) {
  let session: unknown = {
    kind: 'authenticated',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    user: { id: 'review-student', username: 'student', role: 'student' },
  };
  let denied = 0;
  const calls: { path: string; method: string }[] = [];
  await page.route('**/coi-serviceworker.min.js', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' })
  );
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    calls.push({ path, method: request.method() });
    let status = 200;
    let json: unknown;
    if (path === '/auth/session') json = { session };
    else if (path === '/exams/catalog')
      json = {
        topics: ['cca-f', 'ccao-f', 'ccar-p'].map((id) => ({
          id,
          title: id,
          questionCount: bank.length,
          excludedCount: 0,
          questionsPerExam: 60,
          durationMinutes: 120,
          formCount: 10,
        })),
      };
    else if (path === '/exams/dashboard')
      json = { results: [], cycles: [], activeAttemptId: null };
    else if (path === '/review/topics')
      json = {
        topics: [
          { id: 'cca-f', name: 'CCA-F', questionCount: bank.length },
          { id: 'ccao-f', name: 'CCAO-F', questionCount: 0 },
        ],
      };
    else if (path.startsWith('/review/topics/')) {
      status = denied || 200;
      json = denied
        ? {
            error: {
              code: denied === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN',
              message: 'Access denied',
            },
          }
        : path.includes('/ccao-f/')
          ? { topicId: 'ccao-f', total: 0, questions: [] }
          : { topicId: 'cca-f', total: bank.length, questions: bank };
    } else throw new Error(`Unexpected API request: ${request.method()} ${path}`);
    await route.fulfill({
      status,
      json,
      headers: {
        'Cache-Control': 'private, no-store',
        'Access-Control-Allow-Origin':
          request.headers().origin || 'http://localhost:3001',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  });
  await page.goto('/account');
  await expect(page.getByRole('tab', { name: 'Ôn tập', exact: true })).toBeVisible();
  return {
    calls,
    deny: (status: number) => {
      denied = status;
    },
    session: (value: unknown) => {
      session = value;
    },
    open: () => page.getByRole('tab', { name: 'Ôn tập', exact: true }).click(),
  };
}

const cards = (page: Page) =>
  page.locator('section[aria-label="Câu hỏi và đáp án ôn tập"] > div');

test('review shows the entire topic bank without creating attempts or persisting answers', async ({
  page,
}) => {
  const bank = Array.from({ length: 25 }, (_, i) => ({
    ...questions[1],
    id: `synthetic-${i}`,
    prompt: `Synthetic review question ${i + 1}`,
  }));
  const f = await fixture(page, bank);
  await f.open();
  await expect(cards(page)).toHaveCount(25);
  await expect(
    page.getByRole('heading', { name: 'Synthetic review question 25', exact: true })
  ).toBeVisible();
  await cards(page)
    .first()
    .getByRole('button', { name: /Xóa tài liệu/ })
    .click();
  expect(f.calls.filter((call) => call.method !== 'GET')).toEqual([]);
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))
  ).not.toContain('Synthetic review question');
  await page.getByLabel('Chủ đề ôn tập').selectOption('ccao-f');
  await expect(
    page.getByText('Chủ đề này chưa có câu hỏi sẵn sàng để ôn tập.')
  ).toBeVisible();
  await expect(cards(page)).toHaveCount(0);

  const questionCallsBefore = f.calls.filter((call) =>
    call.path.startsWith('/review/topics/cca-f/questions')
  ).length;
  await page.getByLabel('Chủ đề ôn tập').selectOption('cca-f');
  await expect(cards(page)).toHaveCount(25);
  const questionCallsAfter = f.calls.filter((call) =>
    call.path.startsWith('/review/topics/cca-f/questions')
  ).length;
  expect(questionCallsAfter).toBe(questionCallsBefore);
});

test('review displays studyGuide translations, keywords, explanation and supports search', async ({
  page,
}) => {
  const f = await fixture(page);
  await f.open();
  await expect(cards(page)).toHaveCount(2);
  const first = cards(page).nth(0);

  await expect(
    first.getByText(
      'Một hệ thống managed agent để phân loại yêu cầu bồi thường (claims triage) đã tăng từ 6 tools lên 34 tools trong 18 tháng.'
    )
  ).toHaveCount(0);

  await first.getByRole('button', { name: 'Dịch Việt', exact: true }).click();
  await expect(
    first.getByText(
      'Một hệ thống managed agent để phân loại yêu cầu bồi thường (claims triage) đã tăng từ 6 tools lên 34 tools trong 18 tháng.'
    )
  ).toBeVisible();
  await expect(
    first.getByText(
      'Router được đề xuất sẽ phát sinh thêm một lệnh gọi model (model call) trên mỗi request đầu vào.'
    )
  ).toBeVisible();

  await first.getByRole('button', { name: 'Từ khóa', exact: true }).click();
  await expect(first.getByText('Từ khóa câu hỏi:')).toBeVisible();
  await expect(first.getByText('tool router agent').first()).toBeVisible();
  await expect(first.getByText('Từ khóa đáp án đúng:')).toHaveCount(0);

  await first.getByRole('button', { name: /additional model call/ }).click();
  await expect(
    first.getByText('Bạn đã chọn đúng một phần. Hãy chọn đủ các đáp án đúng.', {
      exact: true,
    })
  ).toBeVisible();
  await expect(first.getByText('Từ khóa đáp án đúng:')).toBeVisible();
  await expect(first.getByText('Giải thích chi tiết')).toBeVisible();
  await expect(
    first.getByText(
      'Việc thêm một tool router agent phía trước sẽ tạo thêm một model call cho mỗi request (B), làm tăng độ trễ.'
    )
  ).toBeVisible();

  await first
    .getByRole('button', { name: /four distinct claim workflow domains/ })
    .click();
  await expect(
    first.getByText('Chính xác! Bạn đã chọn đúng đáp án.', { exact: true })
  ).toBeVisible();

  await page.getByLabel('Tìm kiếm câu hỏi / từ khóa').fill('bồi thường');
  await expect(cards(page)).toHaveCount(1);
});

for (const status of [401, 403]) {
  test(`review clears visible questions on API ${status}`, async ({ page }) => {
    const f = await fixture(page);
    await f.open();
    await expect(cards(page)).toHaveCount(2);
    f.deny(status);
    await page.getByLabel('Chủ đề ôn tập').selectOption('ccao-f');
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
    await expect(page.getByText(questions[1].prompt, { exact: true })).toHaveCount(0);
  });
}

for (const kind of [null, 'password_setup']) {
  test(`review refuses a session that changed to ${kind}`, async ({ page }) => {
    const f = await fixture(page);
    f.session(kind ? { kind } : null);
    await f.open();
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    expect(f.calls.filter((call) => call.path.startsWith('/review/'))).toEqual([]);
    await expect(cards(page)).toHaveCount(0);
  });
}

test('review clears questions when the authenticated session expires', async ({
  page,
}) => {
  const f = await fixture(page);
  f.session({
    kind: 'authenticated',
    expiresAt: new Date(Date.now() + 3000).toISOString(),
    user: { id: 'review-student', username: 'student', role: 'student' },
  });
  await f.open();
  await expect(cards(page)).toHaveCount(2);
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible({ timeout: 10000 });
  await expect(cards(page)).toHaveCount(0);
});
