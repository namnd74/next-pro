import { test, expect } from '@playwright/test';

test.describe('Offensive Security - Phase 5: Advanced Runtimes & Active Directory E2E', () => {
  test('1. Active Directory BloodHound Attack Path Visualizer & Inspector', async ({
    page,
  }) => {
    // Navigate to Windows Architecture & Security Principals lesson
    await page.goto(
      'http://localhost:3000/offensive-security/academy/os03-windows-foundations/windows-architecture-identities-acls/windows-architecture-and-principals'
    );

    // Verify page hydration
    const bloodhoundTab = page.getByTestId('mode-tab-ad-graph');
    await expect(bloodhoundTab).toBeVisible({ timeout: 10000 });

    // Switch to BloodHound Graph view
    await bloodhoundTab.click();

    // Verify BloodHound container is rendered
    const graphView = page.getByTestId('bloodhound-graph-view');
    await expect(graphView).toBeVisible();

    // Verify SVG nodes exist
    const footholdNode = page.getByTestId('bloodhound-node-node-jclerk');
    await expect(footholdNode).toBeVisible();

    // Click on svc_backup node
    const backupNode = page.getByTestId('bloodhound-node-node-svc-backup');
    await backupNode.click();

    // Verify inspector shows properties for svc_backup
    await expect(page.locator('text=DONT_REQ_PREAUTH').first()).toBeVisible();

    // Toggle Attack Path button
    const toggleBtn = page.locator('button', { hasText: 'ATTACK PATH ACTIVE' });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(
      page.locator('button', { hasText: 'HIGHLIGHT SHORTEST PATH' })
    ).toBeVisible();
  });

  test('2. Low-Level x86 Stack Memory Studio & EIP Control Flow Hijack', async ({
    page,
  }) => {
    // Navigate to Process Memory & Data Representation lesson
    await page.goto(
      'http://localhost:3000/offensive-security/academy/os01-network-foundations/processes-data-and-addressing/process-memory-and-data-representation'
    );

    // Check hydration & switch to Memory Studio tab
    const memoryTab = page.getByTestId('mode-tab-memory-exploit');
    await expect(memoryTab).toBeVisible({ timeout: 10000 });
    await memoryTab.click();

    // Verify Memory Exploit Studio is rendered
    const studio = page.getByTestId('memory-exploit-studio');
    await expect(studio).toBeVisible();

    // Check initial normal execution
    await expect(page.locator('text=NORMAL EXECUTION').first()).toBeVisible();

    // Test INJECT 56 As button to gain EIP control
    const injectBtn = page.locator('button', { hasText: "INJECT 56 'A's" });
    await injectBtn.click();
    await expect(page.locator('text=EIP CONTROL GAINED (0x41414141)')).toBeVisible();

    // Test RESET STACK button
    const resetBtn = page.locator('button', { hasText: 'RESET STACK' });
    await resetBtn.click();
    await expect(page.locator('text=NORMAL EXECUTION').first()).toBeVisible();
  });
});
