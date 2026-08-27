import type { SqlDatabase, SqlExecutionResult } from '../types';

export function createDefaultSqlDatabase(): SqlDatabase {
  return {
    tables: {
      users: {
        name: 'users',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'username', type: 'string' },
          { name: 'password_hash', type: 'string' },
          { name: 'role', type: 'string' },
          { name: 'email', type: 'string' },
        ],
        rows: [
          {
            id: 1,
            username: 'admin',
            password_hash: '$2b$12$K1r.mZ8s7q8w3e9r0t1y2u3i4o5p6a7s8d9f0g',
            role: 'administrator',
            email: 'admin@corp.internal',
          },
          {
            id: 2,
            username: 'operator',
            password_hash: '$2b$12$L2s.nA9t8r9x4f0s1u2v3w4x5y6z7b8c9d0e1f',
            role: 'operator',
            email: 'operator@corp.internal',
          },
          {
            id: 3,
            username: 'auditor',
            password_hash: '$2b$12$M3t.oB0u9s0y5g1t2v3w4x5y6z7a8b9c0d1e2f',
            role: 'auditor',
            email: 'auditor@corp.internal',
          },
          {
            id: 4,
            username: 'guest',
            password_hash: '$2b$12$N4u.pC1v0t1z6h2u3w4x5y6z7a8b9c0d1e2f3g',
            role: 'viewer',
            email: 'guest@public.net',
          },
        ],
      },
      secrets: {
        name: 'secrets',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'secret_key', type: 'string' },
          { name: 'secret_value', type: 'string' },
          { name: 'environment', type: 'string' },
        ],
        rows: [
          {
            id: 101,
            secret_key: 'JWT_SIGNING_PRIVATE_KEY',
            secret_value: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...',
            environment: 'production',
          },
          {
            id: 102,
            secret_key: 'AWS_ACCESS_KEY_ID',
            secret_value: 'AKIAIOSFODNN7EXAMPLE',
            environment: 'production',
          },
          {
            id: 103,
            secret_key: 'STRIPE_WEBHOOK_SECRET',
            secret_value: 'whsec_98a7sd6f5g4h3j2k1l0z9x8c7v6b5n4m',
            environment: 'production',
          },
        ],
      },
      products: {
        name: 'products',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'price', type: 'number' },
          { name: 'is_published', type: 'boolean' },
        ],
        rows: [
          {
            id: 1,
            title: 'Enterprise Network Sensor Agent',
            category: 'Hardware',
            price: 1499,
            is_published: true,
          },
          {
            id: 2,
            title: 'Red Team Operator Field Manual',
            category: 'Books',
            price: 49,
            is_published: true,
          },
          {
            id: 3,
            title: 'Zero-Day Advisory Subscription',
            category: 'Intelligence',
            price: 9999,
            is_published: false,
          },
          {
            id: 4,
            title: 'Hardware Security Key (FIDO2/WebAuthn)',
            category: 'Hardware',
            price: 55,
            is_published: true,
          },
        ],
      },
    },
  };
}

export function executeSqlInjection(
  userInput: string,
  templateQuery: string = "SELECT * FROM products WHERE is_published = 1 AND title LIKE '%{{USER_INPUT}}%'",
  db: SqlDatabase = createDefaultSqlDatabase()
): SqlExecutionResult {
  const startTime = performance.now();
  const rawQuery = templateQuery.replace('{{USER_INPUT}}', userInput);

  // Analyze injected tokens
  const injectedTokens: Array<{
    token: string;
    type: 'base' | 'injected' | 'comment' | 'operator';
  }> = [];
  const parts = templateQuery.split('{{USER_INPUT}}');
  injectedTokens.push({ token: parts[0], type: 'base' });
  injectedTokens.push({ token: userInput, type: 'injected' });
  if (parts[1]) injectedTokens.push({ token: parts[1], type: 'base' });

  // Check for comment truncations: --, #, /* */
  let activeSql = rawQuery;
  let commentIndex = -1;
  const commentPatterns = ['--', '#', '/*'];
  for (const pat of commentPatterns) {
    const idx = activeSql.indexOf(pat);
    if (idx !== -1 && (commentIndex === -1 || idx < commentIndex)) {
      commentIndex = idx;
    }
  }

  if (commentIndex !== -1) {
    activeSql = activeSql.substring(0, commentIndex).trim();
  }

  // Detect UNION SELECT injection
  const unionMatch = activeSql.match(
    /\bUNION\s+(?:ALL\s+)?SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)/i
  );
  if (unionMatch) {
    const unionCols = unionMatch[1]
      .split(',')
      .map((c) => c.trim().replace(/^['"](.*)['"]$/, '$1'));
    const targetTable = unionMatch[2].toLowerCase();

    if (!db.tables[targetTable]) {
      return {
        success: false,
        queryExecuted: rawQuery,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: performance.now() - startTime,
        error: `SQL Error (1146): Table '${targetTable}' doesn't exist`,
        injectedTokens,
        vulnerabilityTriggered: 'UNION-Based SQL Injection Attempt',
      };
    }

    const table = db.tables[targetTable];
    const extractedRows: Array<Record<string, unknown>> = table.rows.map((row) => {
      const outputRow: Record<string, unknown> = {};
      unionCols.forEach((colName, idx) => {
        const key = colName === '*' ? 'all' : colName;
        outputRow[`col_${idx + 1}_(${key})`] =
          row[colName] !== undefined ? row[colName] : colName;
      });
      return outputRow;
    });

    return {
      success: true,
      queryExecuted: rawQuery,
      columns: Object.keys(extractedRows[0] || {}),
      rows: extractedRows,
      rowCount: extractedRows.length,
      executionTimeMs: performance.now() - startTime,
      injectedTokens,
      vulnerabilityTriggered: `UNION SQL Injection: Successfully exfiltrated table '${targetTable}'`,
    };
  }

  // Detect boolean OR injection: ' OR '1'='1 or ' OR 1=1
  const isTautology =
    /\bOR\s+['"]?1['"]?\s*=\s*['"]?1/i.test(activeSql) ||
    /\bOR\s+['"]?a['"]?\s*=\s*['"]?a/i.test(activeSql) ||
    /\bOR\s+true\b/i.test(activeSql) ||
    /['"]\s*OR\s*['"][^'"]*['"]\s*=\s*['"][^'"]*/i.test(activeSql);

  // If query is targeting products table
  if (templateQuery.includes('products')) {
    const productsTable = db.tables.products;
    if (isTautology) {
      // Returns all products, including unpublished / confidential ones!
      return {
        success: true,
        queryExecuted: rawQuery,
        columns: productsTable.columns.map((c) => c.name),
        rows: productsTable.rows,
        rowCount: productsTable.rows.length,
        executionTimeMs: performance.now() - startTime,
        injectedTokens,
        vulnerabilityTriggered:
          'Tautology Bypass: Bypassed is_published constraint to dump hidden products',
      };
    }

    // Normal safe filtering
    const cleanTerm = userInput.toLowerCase();
    const filtered = productsTable.rows.filter(
      (p) => p.is_published && String(p.title).toLowerCase().includes(cleanTerm)
    );

    return {
      success: true,
      queryExecuted: rawQuery,
      columns: productsTable.columns.map((c) => c.name),
      rows: filtered,
      rowCount: filtered.length,
      executionTimeMs: performance.now() - startTime,
      injectedTokens,
    };
  }

  // If query is targeting users table (e.g. Login form: SELECT * FROM users WHERE username = 'admin' ...)
  if (templateQuery.includes('users')) {
    const usersTable = db.tables.users;
    if (isTautology || /admin['"]?\s*--/i.test(userInput)) {
      return {
        success: true,
        queryExecuted: rawQuery,
        columns: usersTable.columns.map((c) => c.name),
        rows: [usersTable.rows[0]], // Returns admin user!
        rowCount: 1,
        executionTimeMs: performance.now() - startTime,
        injectedTokens,
        vulnerabilityTriggered:
          'Authentication Bypass: Admin login authenticated without password',
      };
    }

    return {
      success: true,
      queryExecuted: rawQuery,
      columns: usersTable.columns.map((c) => c.name),
      rows: [],
      rowCount: 0,
      executionTimeMs: performance.now() - startTime,
      injectedTokens,
    };
  }

  return {
    success: true,
    queryExecuted: rawQuery,
    columns: ['result'],
    rows: [{ result: 'Executed successfully with 0 rows returned' }],
    rowCount: 0,
    executionTimeMs: performance.now() - startTime,
    injectedTokens,
  };
}
