import { test, expect } from '@playwright/test';

test.describe('Offensive Security - Adaptive Cockpit Pro Max E2E', () => {
  test('1. Split-Studio Concurrent Rendering of Theory & Terminal', async ({ page }) => {
    // Set viewport to desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(
      '/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    // Verify Adaptive Cockpit header badge
    await expect(page.locator('text=ADAPTIVE COCKPIT')).toBeVisible();

    // Verify left panel H1 is visible concurrently with right panel terminal input
    const lessonTitle = page.locator('h1', { hasText: 'Permission Bits' });
    await expect(lessonTitle).toBeVisible();

    const terminalInput = page.getByTestId('terminal-input');
    await expect(terminalInput).toBeVisible();

    // Verify Draggable Splitter handle exists
    const splitter = page.locator('[title*="Kéo thả để chia đôi màn hình"]');
    await expect(splitter).toBeVisible();
  });

  test('2. Multi-Sensory Audio Toggle (Tactile Cyber Audio)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(
      '/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    const audioBtn = page.getByTestId('toggle-audio-button');
    await expect(audioBtn).toBeVisible();

    // Initially muted
    await expect(audioBtn).toContainText('MUTED');

    // Click to turn audio ON
    await audioBtn.click();
    await expect(audioBtn).toContainText('AUDIO ON');

    // Click to mute again
    await audioBtn.click();
    await expect(audioBtn).toContainText('MUTED');
  });

  test('3. Zen Fullscreen Cockpit Mode Toggle & Escape Handling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(
      '/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    // Wait for client hydration (terminal input mounts after hydration)
    const terminalInput = page.getByTestId('terminal-input');
    await expect(terminalInput).toBeVisible({ timeout: 10000 });

    const zenBtn = page.getByTestId('toggle-zen-mode');
    await expect(zenBtn).toBeVisible();
    await expect(zenBtn).toContainText('ZEN MODE');

    // Enter Zen Mode
    await zenBtn.click();
    await expect(zenBtn).toContainText('EXIT ZEN');

    // Terminal input remains fully interactive in Zen Mode
    await expect(terminalInput).toBeVisible();

    // Exit Zen Mode using keyboard Escape
    await page.keyboard.press('Escape');
    await expect(zenBtn).toContainText('ZEN MODE');
  });
});
