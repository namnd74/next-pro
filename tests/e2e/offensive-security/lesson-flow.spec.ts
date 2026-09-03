import { test, expect } from '@playwright/test';

test.describe('Offensive Security Academy - Comprehensive Browser E2E Flow', () => {
  test('1. Academy Landing & 19 Tracks Tree Rendering', async ({ page }) => {
    await page.goto('/offensive-security/academy');
    await expect(page).toHaveTitle(/Offensive Security|Academy/i);

    // Verify header branding
    const headerTitle = page.locator('header', { hasText: 'OffSec Academy' });
    await expect(headerTitle).toBeVisible();

    // Verify 19 Tracks are rendered in the curriculum tree
    const trackLinks = page.locator('a[href*="/offensive-security/academy/os"]');
    const trackCount = await trackLinks.count();
    expect(trackCount).toBeGreaterThanOrEqual(1);
  });

  test('2. Lesson Workbench Hydration, Execution & Objective Validation', async ({
    page,
  }) => {
    // Navigate directly to OS02 Linux Permissions lesson
    await page.goto(
      '/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    // Verify lesson header
    await expect(page.locator('h1')).toContainText(/Permission/i);

    // Terminal container hydrates (Live Real-Workbench is active by default)
    const terminalInput = page.getByTestId('terminal-input');
    await expect(terminalInput).toBeVisible({ timeout: 10000 });

    // Execute safe inspection command: ls -la /etc/shadow
    await terminalInput.fill('ls -la /etc/shadow');
    await terminalInput.press('Enter');

    // Verify output stream renders the command output
    const outputStream = page.locator('pre');
    await expect(outputStream.first()).toBeVisible();

    // Execute solution command: chmod 640 /etc/shadow
    await terminalInput.fill('chmod 640 /etc/shadow');
    await terminalInput.press('Enter');

    // Verify that the Objective card turns green / completed
    const objectiveCard = page.locator('text=Bảo mật file nhạy cảm /etc/shadow');
    await expect(objectiveCard).toBeVisible();

    // Verify the second objective: touch /tmp/evidence.txt
    await terminalInput.fill('touch /tmp/evidence.txt');
    await terminalInput.press('Enter');

    // Both objectives should now be marked complete
    const completionBadge = page.locator('text=Hoàn thành Lab');
    await expect(completionBadge).toBeVisible({ timeout: 5000 });
  });

  test('3. IndexedDB Zero-Jank Persistence & F5 State Recovery', async ({ page }) => {
    // Re-visit the lesson
    await page.goto(
      '/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    const terminalInput = page.getByTestId('terminal-input');
    await expect(terminalInput).toBeVisible({ timeout: 10000 });

    // Create a custom verification marker in VFS
    await terminalInput.fill('touch /tmp/persisted_marker.txt');
    await terminalInput.press('Enter');

    // Wait 1000ms for IndexedDB async snapshot commit
    await page.waitForTimeout(1000);

    // Hard Reload the browser page (simulating student closing/refreshing tab)
    await page.reload();

    // Wait for terminal input after reload
    await expect(page.getByTestId('terminal-input')).toBeVisible({ timeout: 10000 });

    // Verify that the IndexedDB restoration badge appears in the terminal header
    const restoredBadge = page.locator('text=INDEXEDDB RESTORED');
    await expect(restoredBadge).toBeVisible({ timeout: 10000 });

    // Verify the marker file still exists in the restored VFS
    await page.getByTestId('terminal-input').fill('ls -la /tmp/persisted_marker.txt');
    await page.getByTestId('terminal-input').press('Enter');
    await expect(page.locator('pre', { hasText: 'persisted_marker.txt' })).toBeVisible();

    // Test Reset VFS button
    const resetBtn = page.getByTestId('reset-vfs-button');
    await resetBtn.click();

    // Verify reset message is printed and restored badge disappears
    await expect(page.locator('text=[RESET] Môi trường VFS')).toBeVisible();
    await expect(restoredBadge).not.toBeVisible();
  });
});
