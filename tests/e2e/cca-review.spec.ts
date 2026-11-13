import { expect, test, type Page } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const questions = [
  {
    id: 'review-single',
    type: 'single_choice',
    prompt: 'Khi phiên đăng nhập hết hạn, giao diện ôn tập cần xử lý thế nào?',
    choices: [
      { id: 'A', text: 'Tiếp tục hiển thị tài liệu đã tải.' },
      { id: 'B', text: 'Xóa tài liệu khỏi giao diện và yêu cầu đăng nhập lại.' },
      { id: 'C', text: 'Tự chuyển sang tài khoản demo.' },
    ],
    correctChoiceIds: ['B'],
  },
  {
    id: 'review-multiple',
    type: 'multiple_response',
    prompt: 'Đâu là các yêu cầu khi tải tài liệu ôn tập?',
    choices: [
      { id: 'A', text: 'Gửi cookie đăng nhập trong mọi request API.' },
      { id: 'B', text: 'Nhúng bộ đáp án vào bundle JavaScript để tải nhanh.' },
      { id: 'C', text: 'Không lưu câu hỏi và đáp án vào localStorage.' },
    ],
    correctChoiceIds: ['A', 'C'],
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
    ...questions[0],
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
});

test('review gives immediate correct/incorrect feedback, supports multiple responses and fits mobile', async ({
  page,
}) => {
  const f = await fixture(page);
  await f.open();
  await expect(cards(page)).toHaveCount(2);
  const first = cards(page).nth(0);
  const second = cards(page).nth(1);
  await expect(first.getByText('Đáp án đúng', { exact: true })).toHaveCount(0);
  await first.getByRole('button', { name: /Tiếp tục hiển thị/ }).click();
  await expect(first.getByText('Bạn chọn sai', { exact: true })).toBeVisible();
  await expect(first.getByText('Đáp án đúng', { exact: true })).toBeVisible();
  await first.getByRole('button', { name: 'Làm lại câu này' }).click();
  await expect(first.getByText('Bạn chọn sai', { exact: true })).toHaveCount(0);
  await first.getByRole('button', { name: /Xóa tài liệu/ }).click();
  await expect(
    first.getByText('Chính xác! Bạn đã chọn đúng đáp án.', { exact: true })
  ).toBeVisible();
  await second.getByRole('button', { name: /Gửi cookie/ }).click();
  await expect(
    second.getByText('Bạn đã chọn đúng một phần. Hãy chọn đủ các đáp án đúng.', {
      exact: true,
    })
  ).toBeVisible();
  await second.getByRole('button', { name: /Không lưu câu hỏi/ }).click();
  await expect(
    second.getByText('Chính xác! Bạn đã chọn đúng đáp án.', { exact: true })
  ).toBeVisible();
  await second.getByRole('button', { name: 'Làm lại câu này' }).click();
  await second.getByRole('button', { name: /Nhúng bộ đáp án/ }).click();
  await expect(second.getByText('Bạn chọn sai', { exact: true })).toBeVisible();
  await expect(second.getByText('Đáp án đúng', { exact: true })).toHaveCount(2);
  if (process.env.UPDATE_REVIEW_SCREENSHOTS) {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.getByRole('main').screenshot({
      path: 'artifacts/review-ui-desktop.png',
      animations: 'disabled',
      style:
        'header, header * { visibility: hidden !important; } .glass-card { backdrop-filter: none !important; }',
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  if (process.env.UPDATE_REVIEW_SCREENSHOTS)
    await page.getByRole('main').screenshot({
      path: 'artifacts/review-ui-mobile.png',
      animations: 'disabled',
      style:
        'header, header * { visibility: hidden !important; } .glass-card { backdrop-filter: none !important; }',
    });
  expect(f.calls.filter((call) => call.method !== 'GET')).toEqual([]);
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
    await expect(page.getByText(questions[0].prompt, { exact: true })).toHaveCount(0);
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
