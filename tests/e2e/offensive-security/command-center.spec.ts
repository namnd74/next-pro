import { test, expect } from '@playwright/test';

test.describe('Offensive Security - Command Center Dashboard E2E', () => {
  test('1. Command Center Landing, Hero Operations, & Metrics Bar', async ({ page }) => {
    await page.goto('/offensive-security');

    // Verify Title
    await expect(page).toHaveTitle(/Command Center|Offensive Security/i);

    // Verify Hero title
    const heroHeading = page.locator('h1', { hasText: 'Command Center' });
    await expect(heroHeading).toBeVisible();

    // Verify SOC Telemetry Ticker
    const socTicker = page.locator('text=LIVE SOC TELEMETRY');
    await expect(socTicker).toBeVisible();

    // Verify 4 Core Metrics
    await expect(page.locator('text=19 Tracks').first()).toBeVisible();
    await expect(page.locator('text=81 Labs Sẵn Sàng').first()).toBeVisible();
    await expect(page.locator('text=123+ Giờ Học').first()).toBeVisible();
    await expect(page.locator('text=0ms Cloud Latency').first()).toBeVisible();
  });

  test('2. Smart Resume Banner & Academy CTA Navigation', async ({ page }) => {
    await page.goto('/offensive-security');

    // Verify Smart Resume banner
    const resumeBanner = page.getByTestId('smart-resume-button');
    await expect(resumeBanner).toBeVisible();

    // Click "Vào Học Viện 19 Tracks" CTA button
    const enterAcademyBtn = page.getByTestId('enter-academy-button');
    await expect(enterAcademyBtn).toBeVisible();
    await enterAcademyBtn.click();

    // Verify successful navigation to Academy
    await page.waitForURL('**/offensive-security/academy');
    await expect(page.locator('header', { hasText: 'OffSec Academy' })).toBeVisible();
  });

  test('3. Track Radar Grid & Domain Category Filter Interaction', async ({ page }) => {
    await page.goto('/offensive-security');

    // Locate filter pills
    const pentestFilterBtn = page.locator('button', { hasText: 'Kiểm Thử & Web API' });
    await expect(pentestFilterBtn).toBeVisible();

    // Click filter pill for OS05 - OS07
    await pentestFilterBtn.click();

    // Verify only filtered tracks are shown (e.g. OS05, OS06, OS07)
    await expect(page.getByText('OS05', { exact: true })).toBeVisible();
    await expect(page.getByText('OS06', { exact: true })).toBeVisible();
    await expect(page.getByText('OS07', { exact: true })).toBeVisible();
    // OS00 should be hidden under this filter
    await expect(page.getByText('OS00', { exact: true })).not.toBeVisible();

    // Click "Tất cả" to restore all tracks
    const allFilterBtn = page.locator('button', { hasText: 'Tất cả (19 Tracks)' });
    await allFilterBtn.click();
    await expect(page.getByText('OS00', { exact: true })).toBeVisible();
  });
});
