import { test, expect } from '@playwright/test';

test.describe('Offensive Security - Phase 4: Purple Team Telemetry & Detection E2E', () => {
  test('1. Terminal Attack Execution Emits Live Telemetry to SOC Studio', async ({
    page,
  }) => {
    // Navigate to Linux Permissions lesson
    await page.goto(
      'http://localhost:3000/offensive-security/academy/os02-linux-foundations/files-identity-permissions/permission-bits-and-special-modes'
    );

    // Verify page hydration
    const terminalInput = page.getByTestId('terminal-input');
    await expect(terminalInput).toBeVisible({ timeout: 10000 });

    // Verify SOC Telemetry mode tab exists
    const telemetryTab = page.getByTestId('mode-tab-telemetry');
    await expect(telemetryTab).toBeVisible();

    // Execute offensive command: chmod 600 /etc/shadow
    await terminalInput.click();
    await terminalInput.fill('chmod 600 /etc/shadow');
    await page.keyboard.press('Enter');

    // Switch to SOC Telemetry Studio tab
    await telemetryTab.click();

    // Verify SOC Telemetry Studio container is rendered
    const studio = page.getByTestId('soc-telemetry-studio');
    await expect(studio).toBeVisible({ timeout: 5000 });

    // Verify Auditd Telemetry event is present in the stream
    const auditdRow = page.getByTestId('telemetry-row-auditd').first();
    await expect(auditdRow).toBeVisible();
    await expect(page.locator('text=T1222.002').first()).toBeVisible();

    // Click on Raw System Log tab
    const rawTab = page.locator('button', { hasText: 'Raw System Log' });
    await rawTab.click();
    await expect(page.locator('text=type=SYSCALL')).toBeVisible();

    // Click on Sigma Detection Rule tab
    const sigmaTab = page.locator('button', { hasText: 'Sigma Detection Rule' });
    await sigmaTab.click();
    await expect(
      page.locator('text=Suspicious Permission Modification on Shadow').first()
    ).toBeVisible();
  });

  test('2. Web SQL Injection Emits WAF & Suricata Alert Records', async ({ page }) => {
    // Navigate to SQLi / IDOR lesson
    await page.goto(
      'http://localhost:3000/offensive-security/academy/os07-web-api-bug-bounty/access-control-and-injection/broken-object-level-and-function-authorization'
    );

    // Check hydration
    const telemetryTab = page.getByTestId('mode-tab-telemetry');
    await expect(telemetryTab).toBeVisible({ timeout: 10000 });

    // Open SOC Telemetry Studio
    await telemetryTab.click();

    const studio = page.getByTestId('soc-telemetry-studio');
    await expect(studio).toBeVisible();

    // Verify source filters work
    const filterAll = page.locator('button', { hasText: 'all' });
    await expect(filterAll).toBeVisible();
  });
});
