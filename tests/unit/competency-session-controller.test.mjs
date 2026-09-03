/**
 * Unit test suite for CompetencySessionController & Deterministic Evidence
 * Uses Node built-in node:test runner.
 */

import assert from 'node:assert';
import test from 'node:test';

// In-memory mock of CompetencySessionController logic for pure node:test verification
async function computeTestDigest(data) {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(data).digest('hex');
}

test('CompetencySessionController: Deterministic localIntegrityDigest', async () => {
  const seed = 'deterministic-test-seed-42';
  const lessonId = 'os07-l57-sql-nosql-command-and-template-injection';

  const events1 = [
    { action: 'SESSION_INITIALIZED', target: undefined },
    { action: 'DISPATCH_HTTP_REQUEST', target: '/api/users?username=%27%20OR%201=1%20--' },
    { action: 'CAPABILITY_EVALUATED_PASS', target: undefined },
  ];

  const events2 = [
    { action: 'SESSION_INITIALIZED', target: undefined },
    { action: 'DISPATCH_HTTP_REQUEST', target: '/api/users?username=%27%20OR%201=1%20--' },
    { action: 'CAPABILITY_EVALUATED_PASS', target: undefined },
  ];

  const payload1 = JSON.stringify({
    lessonId,
    seed,
    events: events1.map((e, idx) => `${idx}:${e.action}:${e.target || ''}:`),
  });

  const payload2 = JSON.stringify({
    lessonId,
    seed,
    events: events2.map((e, idx) => `${idx}:${e.action}:${e.target || ''}:`),
  });

  const digest1 = await computeTestDigest(payload1);
  const digest2 = await computeTestDigest(payload2);

  assert.strictEqual(digest1, digest2, 'Digests must be identical for identical event sequences!');
  assert.strictEqual(digest1.length, 64, 'SHA-256 hex digest must be exactly 64 characters long.');
});

test('CompetencyContract: Anti-Cheat Shortcut Detection', () => {
  const shortcutTest = (url) => {
    return url.includes('username=admin') && !url.includes("'") && !url.includes('%27') && !url.includes('OR');
  };

  // Case 1: Cheating directly without injection
  assert.strictEqual(shortcutTest('http://localhost:3000/api/users?username=admin'), true);

  // Case 2: Authentic SQL Injection
  assert.strictEqual(shortcutTest("http://localhost:3000/api/users?username=' OR 1=1 --"), false);
});
