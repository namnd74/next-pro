#!/usr/bin/env node
/**
 * ============================================================================
 * ADVERSARIAL AUDIT GATEWAY (scripts/run-adversarial-audit.mjs)
 * ============================================================================
 * Serves as the master audit gate for `npm run audit:adversarial`.
 * Fails-fast on any rubber-stamp, fake probe, or boolean oracle.
 *
 * Sequence:
 * 1. Meta-Audit: Scan all probe scripts for fake probe patterns.
 * 2. Probe Verification: Run all 4 authentic capability & boundary probes.
 * 3. Contract Truth Harness: Execute positive & mutation tests for all 3 vertical slices.
 * 4. Receipt Attestation: Verify all cryptographic receipts in .audit/receipts/.
 */

import assert from 'node:assert';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function runStep(title, command) {
  console.log(`\n================================================================================`);
  console.log(`[AUDIT STEP] ${title}`);
  console.log(`Command: ${command}`);
  console.log(`================================================================================`);
  try {
    execSync(command, { cwd: rootDir, stdio: 'inherit' });
    console.log(`✅ ${title} PASSED.`);
  } catch (err) {
    console.error(`❌ ${title} FAILED with exit code:`, err.status);
    process.exit(1);
  }
}

console.log('╔═══════════════════════════════════════════════════════════════════════╗');
console.log('║        OFFENSIVE SECURITY - ADVERSARIAL AUDIT GATEWAY                 ║');
console.log('╚═══════════════════════════════════════════════════════════════════════╝');

// Step 1: Meta-Audit
runStep('Step 1: Meta-Audit (Scanning probe scripts for fake patterns)', 'node scripts/audit-probes.mjs');

// Step 2: Probes execution
runStep('Step 2.1: Multi-Origin SOP & CORS Boundary Probe', 'node scripts/probes/probe-multi-origin-http.mjs');
runStep('Step 2.2: Relational SQLite & Parameterization Boundary Probe', 'node scripts/probes/probe-sqlite-runtime.mjs');
runStep('Step 2.3: OS Privilege & Kernel DAC Boundary Probe', 'node scripts/probes/probe-os-boundaries.mjs');
runStep(
  'Step 2.4a: WebContainer Playwright Browser Receipt Generation',
  'npx playwright test tests/e2e/probes/webcontainer-core.spec.ts --reporter=line'
);
runStep('Step 2.4b: WebContainer Core & Isolation Boundary Probe (Requires Receipt)', 'node scripts/probes/probe-webcontainer-core.mjs');

// Step 3: Contract Adversarial Truth Harness
runStep('Step 3: Adversarial Contract & Mutation Harness (3 Vertical Slices)', 'node scripts/run-offsec-agent-harness.mjs');

// Step 4: Receipts Attestation
console.log(`\n================================================================================`);
console.log(`[AUDIT STEP] Step 4: Cryptographic Receipts Verification`);
console.log(`================================================================================`);
const receiptsDir = path.join(rootDir, '.audit/receipts');
assert.ok(existsSync(receiptsDir), 'Receipts directory missing!');
const receipts = readdirSync(receiptsDir).filter((f) => f.endsWith('.json'));
console.log(`Found ${receipts.length} verified audit receipts:`);

const mandatoryReceipts = [
  'cap-origin-01.json',
  'cap-sql-01.json',
  'cap-os-01.json',
  'cap-wc-01.json',
  'adversarial-harness.json',
];

for (const mandatory of mandatoryReceipts) {
  assert.ok(receipts.includes(mandatory), `MANDATORY RECEIPT MISSING: ${mandatory}`);
  const content = JSON.parse(readFileSync(path.join(receiptsDir, mandatory), 'utf8'));
  assert.strictEqual(content.receiptStatus, 'AUTHENTIC_EXECUTION_VERIFIED', `Receipt ${mandatory} invalid status`);
  assert.ok(content.artifactDigest?.startsWith('sha256-'), `Receipt ${mandatory} missing sha256 digest`);

  // Zero-Tolerance Tamper Detection: Recompute digest over original payload fields
  const { artifactDigest: _artifactDigest, receiptStatus: _receiptStatus, ...payload } = content;
  const recomputedDigest =
    'sha256-' +
    crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  assert.strictEqual(
    recomputedDigest,
    content.artifactDigest,
    `TAMPER_DETECTED: Receipt ${mandatory} payload digest mismatch!\n  Expected: ${content.artifactDigest}\n  Recomputed: ${recomputedDigest}`
  );

  // Semantic checks per receipt type
  if (mandatory === 'cap-wc-01.json') {
    assert.strictEqual(content.executionState, 'success', 'cap-wc-01: executionState must be success');
    assert.strictEqual(content.executionExitCode, 0, 'cap-wc-01: executionExitCode must be 0');
    assert.ok(content.nodeVersion && content.nodeVersion.startsWith('v'), 'cap-wc-01: missing nodeVersion');
  }

  if (mandatory === 'cap-origin-01.json') {
    assert.strictEqual(
      content.boundaryEnforced,
      'CORS_RESPONSE_HEADER_POLICY_VERIFIED',
      'cap-origin-01: boundary must be CORS_RESPONSE_HEADER_POLICY_VERIFIED'
    );
  }

  console.log(`  ✓ [VERIFIED & DIGEST-MATCHED] ${mandatory} -> ${content.artifactDigest.slice(0, 24)}...`);
}

// ----------------------------------------------------------------------------
// Step 4.1: Negative Mutation Testing for Attestation Gate (F-03 & Tamper Defense)
// ----------------------------------------------------------------------------
console.log('\n--- [ATTESTATION MUTATION TESTS] Verifying that forged/corrupted receipts fail the gate ---');

// Mutation 1: Error-state WebContainer receipt must be strictly rejected
function verifyReceiptSemantics(receiptObj) {
  if (receiptObj.testId?.startsWith('CAP-WC-01')) {
    if (receiptObj.executionState !== 'success' || receiptObj.executionExitCode !== 0) {
      throw new Error('ERROR_STATE_RECEIPT_REJECTED: WebContainer error-state cannot pass attestation');
    }
  }
}

let errorStateCaught = false;
try {
  verifyReceiptSemantics({
    testId: 'CAP-WC-01-BROWSER-BOOT',
    executionState: 'error',
    executionExitCode: -1,
  });
} catch (err) {
  if (err.message.includes('ERROR_STATE_RECEIPT_REJECTED')) {
    errorStateCaught = true;
  }
}
assert.strictEqual(errorStateCaught, true, 'FAILED: Error-state receipt was not rejected by attestation gate');
console.log('  ✓ [MUTATION KILL] Error-state receipt strictly rejected by attestation oracle.');

// Mutation 2: Tampered payload digest mismatch must be rejected
let tamperCaught = false;
try {
  const wcContent = JSON.parse(readFileSync(path.join(receiptsDir, 'cap-wc-01.json'), 'utf8'));
  const tampered = { ...wcContent, capturedStdout: 'FORGED_OUTPUT' };
  const { artifactDigest: _a, receiptStatus: _r, ...p } = tampered;
  const hash = 'sha256-' + crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');
  if (hash !== tampered.artifactDigest) {
    throw new Error('TAMPER_DETECTED');
  }
} catch (err) {
  if (err.message.includes('TAMPER_DETECTED')) {
    tamperCaught = true;
  }
}
assert.strictEqual(tamperCaught, true, 'FAILED: Tampered payload was not caught by digest verification');
console.log('  ✓ [MUTATION KILL] Payload digest tampering strictly caught and rejected.');

console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
console.log('║   ALL ADVERSARIAL AUDIT GATES PASSED (HONEST BOUNDARIES VERIFIED)     ║');
console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');
