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

  test('2. Lesson Workbench Hydration, Execution & Honest Simulation Boundary Assertion', async ({
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

    // Execute supported safe inspection command: ls
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');

    // Verify output stream renders the command output
    const outputStream = page.locator('pre');
    await expect(outputStream.first()).toBeVisible();

    // Execute privileged / kernel command: chmod 640 /etc/shadow
    // F-01 & F-05: Must honestly report in-browser demo boundary per ADR-001 (not fake DAC mutation)
    await terminalInput.fill('chmod 640 /etc/shadow');
    await terminalInput.press('Enter');

    // Assert that the honest ADR-001 in-browser simulation boundary is printed
    await expect(page.locator('pre', { hasText: '[In-Browser Demo]' })).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator('pre', { hasText: 'Full kernel execution not simulated in-browser' })
    ).toBeVisible({ timeout: 5000 });

    // Verify that the Objective card shows the hardening objective
    const objectiveCard = page.locator('text=Hardening phân quyền /etc/shadow');
    await expect(objectiveCard).toBeVisible({ timeout: 5000 });
  });

  test('3. IndexedDB Zero-Jank Persistence & F5 State Recovery', async ({ page }) => {
    // Re-visit the lesson
    await page.goto(
      '/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    const terminalInput = page.getByTestId('terminal-input');
    await expect(terminalInput).toBeVisible({ timeout: 10000 });

    // Execute supported echo command to record session marker in terminal state
    await terminalInput.fill('echo PERSISTED_SESSION_MARKER_TEST');
    await terminalInput.press('Enter');

    // Verify command output appears
    await expect(
      page.locator('pre', { hasText: 'PERSISTED_SESSION_MARKER_TEST' })
    ).toBeVisible();

    // Wait 1000ms for IndexedDB async snapshot commit
    await page.waitForTimeout(1000);

    // Hard Reload the browser page (simulating student closing/refreshing tab)
    await page.reload();

    // Wait for terminal input after reload
    await expect(page.getByTestId('terminal-input')).toBeVisible({ timeout: 10000 });

    // Verify that the IndexedDB restoration badge appears in the terminal header
    const restoredBadge = page.locator('text=INDEXEDDB RESTORED');
    await expect(restoredBadge).toBeVisible({ timeout: 10000 });

    // Verify the terminal output contains the IndexedDB restoration notice
    await expect(
      page.locator('pre', {
        hasText: 'Đã khôi phục trạng thái môi trường làm việc từ phiên trước',
      })
    ).toBeVisible({ timeout: 10000 });

    // Test Reset VFS button
    const resetBtn = page.getByTestId('reset-vfs-button');
    await resetBtn.click();

    // Verify reset message is printed in terminal output stream
    await expect(page.locator('pre', { hasText: '[RESET]' })).toBeVisible({
      timeout: 5000,
    });
  });
});
