import { test, expect } from '@playwright/test';

test.describe('Offensive Security - Operation BlackSky: Full Killchain Enterprise Penetration Test E2E', () => {
  test('Verifies Operation BlackSky lesson page renders Cyber Range workbench with killchain objectives', async ({
    page,
  }) => {
    // Navigate to Operation BlackSky Capstone Lab
    await page.goto(
      '/offensive-security/academy/os06-network-infrastructure/blind-enterprise-network/blind-network-reconnaissance-and-initial-foothold'
    );

    // Verify page loaded and lesson heading renders
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // Terminal input must hydrate (cyber-range mode includes terminal panel)
    const terminalInput = page.getByTestId('terminal-input').first();
    await expect(terminalInput).toBeVisible({ timeout: 15000 });

    // Objective cards for the 8-phase killchain must be visible
    await expect(page.locator('text=Bước 1: Quét dịch vụ mạng mục tiêu')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=Bước 2: Rò quét thư mục web ẩn')).toBeVisible({
      timeout: 5000,
    });

    // Step 1: Execute nmap command — verifies terminal input responds
    await terminalInput.click();
    await terminalInput.fill('nmap -sV 10.0.4.20');
    await page.keyboard.press('Enter');

    // Verify terminal output pre element becomes visible and honestly reports the in-browser demo boundary
    await expect(page.locator('pre', { hasText: '[In-Browser Demo]' })).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator('pre', { hasText: 'Full kernel execution not simulated in-browser' })
    ).toBeVisible({ timeout: 5000 });

    // Step 2: Gobuster directory scan
    await terminalInput.fill(
      'gobuster dir -u http://10.0.4.20 -w /usr/share/wordlists/dirb/common.txt'
    );
    await page.keyboard.press('Enter');

    // Terminal must remain responsive across multi-step execution and output boundary message
    await expect(terminalInput).toBeVisible();
    await expect(page.locator('pre', { hasText: 'gobuster' })).toBeVisible({
      timeout: 5000,
    });
  });
});
