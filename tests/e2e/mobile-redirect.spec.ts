import { test, expect } from '@playwright/test';

const IPHONE_14 = {
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

test.describe('Mobile Device Redirection & Guard to /interview', () => {
  test.use(IPHONE_14);

  test('1. Mobile cold-load on "/" redirects to "/interview"', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/interview');
    expect(page.url()).toContain('/interview');
  });

  test('2. Mobile cold-load on "/learn" redirects to "/interview"', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForURL('**/interview');
    expect(page.url()).toContain('/interview');
  });

  test('3. Mobile visit to "/interview" stays on "/interview"', async ({ page }) => {
    await page.goto('/interview');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/interview');
    // Verify interview page content is rendered
    await expect(page.locator('h1')).toContainText(/Phỏng Vấn/i);

    // Save screenshot of the mobile interview page
    await page.screenshot({
      path: 'test-results/mobile_interview_page_verified.png',
    });
  });

  test('4. Mobile with "?desktop=true" allows viewing desktop homepage', async ({
    page,
  }) => {
    await page.goto('/?desktop=true');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('desktop=true');
    expect(page.url()).not.toContain('/interview');
  });

  test('5. Mobile drawer menu highlights /interview as Mobile Ready', async ({
    page,
  }) => {
    await page.goto('/interview');
    await page.waitForLoadState('networkidle');

    const hamburger = page.locator('button[aria-label="Mở menu"]');
    await hamburger.click();

    // Verify mobile banner
    await expect(
      page.locator('text=Chế độ Mobile: Tối ưu trang Phỏng Vấn')
    ).toBeVisible();

    // Verify interview has Mobile Ready badge
    await expect(page.locator('text=Mobile Ready')).toBeVisible();

    // Verify other links have Desktop badge
    await expect(page.locator('text=Desktop').first()).toBeVisible();

    // Verify fast review section
    await expect(page.locator('text=Luyện Phỏng Vấn Nhanh')).toBeVisible();

    // Save screenshot of the mobile drawer
    await page.screenshot({
      path: 'test-results/mobile_drawer_verified.png',
    });
  });
});

test.describe('Desktop Viewport Full Access', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
  });

  test('6. Desktop visiting "/" stays on "/" without redirect', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/interview');
    await expect(page.locator('h1')).toContainText(/Làm chủ/i);
  });

  test('7. Desktop visiting "/learn" stays on "/learn"', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/learn');
    expect(page.url()).not.toContain('/interview');
  });
});
