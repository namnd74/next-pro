import { test, expect } from '@playwright/test';

const IPHONE_14 = {
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

test.describe('Mobile Viewport Direct Navigation (Unrestricted Mobile UX)', () => {
  test.use(IPHONE_14);

  test('1. Mobile cold-load on "/" stays on "/" without redirect', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/interview');
    await expect(page.locator('h1')).toContainText(/Làm chủ/i);
  });

  test('2. Mobile cold-load on "/learn" stays on "/learn"', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/learn');
    expect(page.url()).not.toContain('/interview');
  });

  test('3. Mobile visit to "/interview" stays on "/interview"', async ({ page }) => {
    await page.goto('/interview');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/interview');
    await expect(page.locator('h1')).toContainText(/Phỏng Vấn/i);
  });

  test('4. Mobile visit to "/ai" stays on "/ai"', async ({ page }) => {
    await page.goto('/ai');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/ai');
    expect(page.url()).not.toContain('/interview');
  });

  test('5. Mobile drawer menu allows direct navigation to all platform sections', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hamburger = page.locator('button[aria-label="Mở menu"]');
    await hamburger.click();

    // Verify all primary navigation links are present and accessible
    await expect(page.locator('nav[aria-label="Mobile Main Navigation"]')).toBeVisible();
    await expect(page.locator('text=Lộ Trình Học')).toBeVisible();
    await expect(page.locator('text=Phỏng Vấn')).toBeVisible();
    await expect(page.locator('text=AI System')).toBeVisible();

    // Verify quick access section
    await expect(page.locator('text=Truy Cập Nhanh')).toBeVisible();
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
