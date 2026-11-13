import { expect, test, type Page } from '@playwright/test';

// The app's COI worker owns fetches; block it so browser routes exercise the API fixtures.
test.use({ serviceWorkers: 'block' });

const api = '**/api/v1';
const setup = {
  kind: 'password_setup',
  expiresAt: '2099-01-01T00:00:00.000Z',
  user: { id: 'student-1', username: 'student', role: 'student' },
};
const active = { ...setup, kind: 'authenticated' };

async function fixture(page: Page, initial: unknown = null) {
  let session = initial;
  const calls: { path: string; body: unknown }[] = [];
  await page.route(`${api}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    const body: unknown = route.request().postDataJSON();
    calls.push({ path, body });
    let json: unknown = { session };
    let status = 200;
    if (path === '/auth/login') {
      if (JSON.stringify(body) === JSON.stringify({ username: 'returning' })) {
        json = { needPassword: true, username: 'returning' };
      } else if (JSON.stringify(body) === JSON.stringify({ username: 'student' })) {
        session = setup;
        json = { session };
      } else if (
        JSON.stringify(body) ===
        JSON.stringify({ username: 'returning', password: 'correct-password' })
      ) {
        session = active;
        json = { session };
      } else {
        status = 401;
        json = {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Username hoặc mật khẩu không chính xác.',
          },
        };
      }
    } else if (path === '/auth/setup-password') {
      session = active;
      json = { session };
    } else if (path === '/auth/logout') {
      session = null;
      json = { ok: true };
    } else if (path === '/exams/catalog') {
      json = {
        topics: ['cca-f', 'ccao-f', 'ccar-p'].map((id) => ({
          id,
          title: id,
          questionCount: 162,
          excludedCount: 0,
          questionsPerExam: 60,
          durationMinutes: 120,
          formCount: 10,
        })),
      };
    } else if (path === '/exams/dashboard') {
      json = { results: [], cycles: [], activeAttemptId: null };
    }
    await route.fulfill({ status, json });
  });
  return calls;
}

test('new student uses username only, reloads setup, validates confirmation and enters the exam dashboard', async ({
  page,
}) => {
  const calls = await fixture(page);
  await page.goto('/login');
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveCount(0);
  await page.getByLabel('Username', { exact: true }).fill(' Student ');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page).toHaveURL(/\/setup-password$/);
  expect(calls.filter((call) => call.path.startsWith('/exams'))).toHaveLength(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Đặt mật khẩu của bạn' })).toBeVisible();
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('my-new-password-123');
  await page.getByLabel('Xác nhận mật khẩu').fill('different-password');
  await page.getByRole('button', { name: 'Đặt mật khẩu', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('khớp');
  expect(calls.filter((call) => call.path === '/auth/setup-password')).toHaveLength(0);
  await page.getByLabel('Xác nhận mật khẩu').fill('my-new-password-123');
  await page.getByRole('button', { name: 'Đặt mật khẩu', exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: '10 đề · CCA-F' })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))
  ).not.toContain('my-new-password-123');
});

test('returning student must enter a password and can retry after a wrong password', async ({
  page,
}) => {
  await fixture(page);
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('returning');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toBeVisible();
  await page.getByLabel('Mật khẩu', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'không chính xác'
  );
  await page.getByLabel('Mật khẩu', { exact: true }).fill('correct-password');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: '10 đề · CCA-F' })).toBeVisible();
});

test('mobile setup session resumes on its route and changing account exits setup', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const calls = await fixture(page, setup);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/setup-password$/);
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  await page.getByRole('button', { name: 'Đổi tài khoản' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
  expect(calls.filter((call) => call.path.startsWith('/exams'))).toHaveLength(0);
});

test('setup page redirects visitors without a setup session', async ({ page }) => {
  await fixture(page);
  await page.goto('/setup-password');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
});

test('setup page redirects authenticated students to their dashboard', async ({
  page,
}) => {
  await fixture(page, active);
  await page.goto('/setup-password');
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: '10 đề · CCA-F' })).toBeVisible();
});

test('invalid API login response stays on the form with an error', async ({ page }) => {
  await fixture(page);
  await page.route(`${api}/auth/login`, (route) =>
    route.fulfill({ json: { needPassword: true } })
  );
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('student');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('expired setup session shows recovery without entering the dashboard', async ({
  page,
}) => {
  const calls = await fixture(page, setup);
  await page.route(`${api}/auth/setup-password`, (route) =>
    route.fulfill({
      status: 401,
      json: { error: { code: 'UNAUTHENTICATED', message: 'Hết hạn' } },
    })
  );
  await page.goto('/setup-password');
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('my-new-password-123');
  await page.getByLabel('Xác nhận mật khẩu').fill('my-new-password-123');
  await page.getByRole('button', { name: 'Đặt mật khẩu', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('hết hạn');
  await expect(page).toHaveURL(/\/setup-password$/);
  expect(calls.filter((call) => call.path.startsWith('/exams'))).toHaveLength(0);
  await page.getByRole('button', { name: 'Đổi tài khoản' }).click();
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
});

test('session check failure offers retry and recovers the setup form', async ({
  page,
}) => {
  await fixture(page, setup);
  await page.route(`${api}/auth/session`, (route) => route.abort('failed'), { times: 1 });
  await page.goto('/setup-password');
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toBeVisible();
});

test('login and setup layouts fit desktop and mobile in both themes', async ({
  page,
}) => {
  await fixture(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login');
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await page.screenshot({
    path: '/tmp/nextpro-cca-login-light.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({
    path: '/tmp/nextpro-cca-login-dark.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Username', { exact: true }).fill('student');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page).toHaveURL(/\/setup-password$/);
  await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  await page.screenshot({
    path: '/tmp/nextpro-cca-setup-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
});

test('username-only response cannot admit an authenticated session without a password', async ({
  page,
}) => {
  const calls = await fixture(page);
  await page.route(`${api}/auth/login`, (route) =>
    route.fulfill({ json: { session: active } })
  );
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('student');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'phản hồi đăng nhập'
  );
  expect(calls.filter((call) => call.path.startsWith('/exams'))).toHaveLength(0);
});

for (const entry of [
  { session: null, path: '/login' },
  { session: setup, path: '/setup-password' },
  { session: active, path: '/account' },
]) {
  test(`legacy /cca routes to ${entry.path} according to session`, async ({ page }) => {
    await fixture(page, entry.session);
    await page.goto('/cca');
    await expect(page).toHaveURL(new RegExp(`${entry.path}$`));
    if (entry.path === '/account')
      await expect(page.getByRole('heading', { name: '10 đề · CCA-F' })).toBeVisible();
    else if (entry.path === '/login')
      await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
    else await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toBeVisible();
  });
}

for (const entry of [
  { session: null, path: '/login' },
  { session: setup, path: '/setup-password' },
]) {
  test(`mobile account gate redirects to ${entry.path} without requesting exams`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const calls = await fixture(page, entry.session);
    await page.goto('/account');
    await expect(page).toHaveURL(new RegExp(`${entry.path}$`));
    if (!entry.session)
      await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
    else await expect(page.getByLabel('Mật khẩu mới', { exact: true })).toBeVisible();
    expect(calls.filter((call) => call.path.startsWith('/exams'))).toHaveLength(0);
  });
}

test('authenticated login redirects to account, reload stays there and logout returns to login', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fixture(page, active);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: '10 đề · CCA-F' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '10 đề · CCA-F' })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
});
