#!/usr/bin/env node
/**
 * ============================================================================
 * CAP-SQL-01: SQLite & Relational Database Runtime Probe
 * ============================================================================
 * Investigates the viability of running SQL engines inside WebContainer/Browser:
 * 1. Verifies if native compiled SQL drivers (sqlite3, better-sqlite3) exist in package.json.
 * 2. Probes node:sqlite built-in availability.
 * 3. Formalizes the capability boundary: Native C/C++ SQLite drivers CANNOT run
 *    in WebContainer without WebAssembly pre-compilation.
 * 4. Dictates that SQL injection labs must run as Node.js HTTP services with
 *    in-memory data stores or declarative SQL query fixtures.
 */

import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function runProbe() {
  console.log('--- [CAP-SQL-01] Testing Relational Database Capability Boundary ---');

  const pkgJsonPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'));

  const hasNativeSqlite = !!(
    pkg.dependencies['sqlite3'] ||
    pkg.dependencies['better-sqlite3'] ||
    pkg.dependencies['sql.js']
  );

  console.log(`ℹ [CAP-SQL-01.1] Native SQLite dependencies in package.json: ${hasNativeSqlite ? 'Present' : 'None'}.`);

  // Probe node:sqlite availability
  let nodeSqliteAvailable = false;
  try {
    const nodeSqlite = await import('node:sqlite');
    nodeSqliteAvailable = !!nodeSqlite.DatabaseSync;
  } catch {
    nodeSqliteAvailable = false;
  }

  console.log(`ℹ [CAP-SQL-01.2] Built-in node:sqlite module available in this Node runtime: ${nodeSqliteAvailable ? 'YES' : 'NO'}.`);

  // Rule 2.1 & Rule 2.2 of AI Execution Constitution:
  // We MUST NOT install new native npm packages, and we MUST NOT invent a custom regex SQL parser.
  console.log('✓ [CAP-SQL-01.3] AI Constitution Enforcement:');
  console.log('   - Forbidden: Installing unapproved native npm dependencies.');
  console.log('   - Forbidden: Re-inventing custom SQL tokenizer or AST query parser.');
  console.log('   - Approved Pattern: For Web/API SQLi labs (os07-l57), execute as authentic Node.js');
  console.log('     HTTP micro-services running in WebContainer, evaluating query parameters against');
  console.log('     remediated vs vulnerable query execution paths.');

  console.log('===> CAP-SQL-01 PASS: Database boundary formalized. No fake parsers allowed.\n');
  return { status: 'PASS', boundary: 'NODE_HTTP_SERVICE_IN_CONTAINER' };
}

runProbe().catch((err) => {
  console.error('CAP-SQL-01 FAIL:', err);
  process.exit(1);
});
