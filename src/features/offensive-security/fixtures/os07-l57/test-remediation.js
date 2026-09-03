/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Automated Remediation Replay Test for os07-l57 Lab
 * Can be executed via node in WebContainer or Node.js test runner.
 */
const assert = require('assert');

function runReplayTests(queryExecutor) {
  // Test 1: Replay attack payload -> MUST NOT dump all users
  const attackPayload = "' OR 1=1 --";
  const attackResults = queryExecutor(attackPayload);
  assert.strictEqual(
    attackResults.length <= 1,
    true,
    'SECURITY REGRESSION: Attack payload succeeded in bypassing authentication/exfiltrating rows!'
  );

  // Test 2: Negative assertion (Availability) -> Legitimate query must still return user
  const legitPayload = "admin";
  const legitResults = queryExecutor(legitPayload);
  assert.strictEqual(
    legitResults.length,
    1,
    'AVAILABILITY FAILURE: Legitimate user query failed after remediation!'
  );
  assert.strictEqual(legitResults[0].username, 'admin');

  return { success: true, message: 'All remediation and availability assertions passed.' };
}

module.exports = { runReplayTests };
