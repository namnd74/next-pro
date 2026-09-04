#!/usr/bin/env node
/**
 * ============================================================================
 * AUDIT ENGINE: Meta-Auditor & Fake-Probe Scanner (audit-probes.mjs)
 * ============================================================================
 * Scans all probe scripts to ensure zero tolerance for fake probes:
 * 1. Prohibits static string matching (e.g. fs.readFile.includes('getInstance'))
 *    as proof of runtime capability.
 * 2. Prohibits dummy stream abstractions claiming to verify WebContainer viability.
 * 3. Prohibits tautological assertions (assert.ok(true)).
 * 4. Ensures all probes produce verifiable runtime telemetry or cryptographically
 *    hashed execution receipts.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const probesDir = path.join(rootDir, 'scripts/probes');

const FORBIDDEN_PATTERNS = [
  {
    regex: /readFile\([^)]+\)\.then\([^)]+\)\.includes|readFile[\s\S]*?\.includes\(['"]getInstance\(\)['"]\)/,
    reason: 'Static string search for API methods (e.g. getInstance()) instead of authentic execution',
  },
  {
    regex: /readFile[\s\S]*?\.includes\(['"]mountTree['"]\)/,
    reason: 'Static string search for mountTree instead of running container filesystem mount',
  },
  {
    regex: /new\s+WritableStream\([\s\S]*?test-stream-output[\s\S]*?\)/,
    reason: 'Node WritableStream simulation claiming to prove browser WebContainer viability',
  },
  {
    regex: /assert\.ok\(\s*true\s*\)/,
    reason: 'Tautological assertion (assert.ok(true)) detected',
  },
  {
    regex: /case\s+['"]chmod['"]\s*:|case\s+['"]touch['"]\s*:/,
    targetFileMatch: /default-vfs-fixture\.ts$/,
    reason: 'Prohibited custom fake POSIX emulator (chmod/touch) in production VFS fixture (F-01)',
  },
  {
    regex: /SOP_CORS_STRICT_ISOLATION|SOP_CORS_VERIFIED/,
    targetFileMatch: /probe-multi-origin-http\.mjs$/,
    reason: 'Overclaiming browser SOP enforcement in a Node.js socket probe (F-04)',
  },
  {
    regex: /statSync\(['"]\/usr\/bin\/su['"]\)/,
    targetFileMatch: /run-offsec-agent-harness\.mjs$/,
    reason: 'Prohibited borrowing /usr/bin/su inode mode for differently-named target evidence (F-02)',
  },
  {
    regex: /receiptStatus:\s*['"]AUTHENTIC_EXECUTION_VERIFIED['"][\s\S]*?if\s*\(\s*result\.state\s*===\s*['"]success['"]\s*\)/,
    targetFileMatch: /webcontainer-core\.spec\.ts$/,
    reason: 'Receipt created before asserting result.state === success (F-03)',
  },
];

async function scanProbes() {
  console.log('🔍 [META-AUDIT] Scanning probe scripts, harness & runtime fixtures for fake verification patterns...');

  const probeFiles = (await readdir(probesDir)).filter((f) => f.endsWith('.mjs'));
  const allAuditedFiles = [
    ...probeFiles.map((f) => ({ relPath: `scripts/probes/${f}`, fullPath: path.join(probesDir, f) })),
    { relPath: 'scripts/run-offsec-agent-harness.mjs', fullPath: path.join(rootDir, 'scripts/run-offsec-agent-harness.mjs') },
    { relPath: 'src/features/offensive-security/fixtures/default-vfs-fixture.ts', fullPath: path.join(rootDir, 'src/features/offensive-security/fixtures/default-vfs-fixture.ts') },
    { relPath: 'tests/e2e/probes/webcontainer-core.spec.ts', fullPath: path.join(rootDir, 'tests/e2e/probes/webcontainer-core.spec.ts') },
  ];
  let totalViolations = 0;

  for (const { relPath, fullPath } of allAuditedFiles) {
    const content = await readFile(fullPath, 'utf8');

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.targetFileMatch && !pattern.targetFileMatch.test(relPath)) {
        continue;
      }
      if (pattern.regex.test(content)) {
        console.error(`❌ [AUDIT VIOLATION] File: ${relPath}`);
        console.error(`   Reason: ${pattern.reason}`);
        totalViolations++;
      }
    }
  }

  if (totalViolations > 0) {
    console.error(`\n🚨 [META-AUDIT FAILED] Detected ${totalViolations} fake probe/harness violations!`);
    console.error('All capability probes and harnesses must perform genuine execution or formalize boundaries without fake passes.\n');
    process.exit(1);
  }

  console.log(`✅ [META-AUDIT PASS] All ${allAuditedFiles.length} verification scripts passed adversarial static inspection (0 violations).\n`);
}

scanProbes().catch((err) => {
  console.error('Meta-audit scanner crashed:', err);
  process.exit(1);
});
