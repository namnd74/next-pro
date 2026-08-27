import type { SqlDatabase, SqlExecutionResult, SqlInjectedToken } from '../types';

export const createDefaultSqlDatabase = (): SqlDatabase => ({
  tables: {
    users: {
      name: 'users',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'username', type: 'string' },
        { name: 'password_hash', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      rows: [
        {
          id: 1,
          username: 'admin',
          password_hash: '$2y$12$e8xL47r9mKq0...',
          role: 'administrator',
          email: 'admin@corp.internal',
          is_active: true,
        },
        {
          id: 2,
          username: 'security_auditor',
          password_hash: '$2y$12$kL93mN82jVw1...',
          role: 'auditor',
          email: 'auditor@corp.internal',
          is_active: true,
        },
        {
          id: 3,
          username: 'operator',
          password_hash: '$2y$12$pQ82vR91kLx4...',
          role: 'operator',
          email: 'operator@corp.internal',
          is_active: true,
        },
        {
          id: 4,
          username: 'guest_user',
          password_hash: '$2y$12$zX10aB29cVm8...',
          role: 'guest',
          email: 'guest@public.io',
          is_active: true,
        },
      ],
    },
    secrets: {
      name: 'secrets',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'secret_key', type: 'string' },
        { name: 'secret_value', type: 'string' },
        { name: 'owner_id', type: 'number' },
        { name: 'classification', type: 'string' },
      ],
      rows: [
        {
          id: 101,
          secret_key: 'AWS_PROD_ACCESS_KEY',
          secret_value: 'AKIAIOSFODNN7EXAMPLE',
          owner_id: 1,
          classification: 'CONFIDENTIAL',
        },
        {
          id: 102,
          secret_key: 'JWT_SIGNING_SECRET',
          secret_value: 'super_secret_signing_key_2026',
          owner_id: 1,
          classification: 'TOP_SECRET',
        },
        {
          id: 103,
          secret_key: 'DB_REPLICATION_TOKEN',
          secret_value: 'repl_token_098234710293847',
          owner_id: 2,
          classification: 'RESTRICTED',
        },
      ],
    },
    products: {
      name: 'products',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'is_published', type: 'boolean' },
      ],
      rows: [
        {
          id: 1,
          name: 'Security Baseline Hardening Guide',
          price: 99.0,
          category: 'books',
          is_published: true,
        },
        {
          id: 2,
          name: 'Hardware Security Key (FIDO2)',
          price: 45.0,
          category: 'hardware',
          is_published: true,
        },
        {
          id: 3,
          name: 'Unreleased Internal Zero-Day Advisory',
          price: 9999.0,
          category: 'confidential',
          is_published: false,
        },
      ],
    },
    audit_logs: {
      name: 'audit_logs',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'action', type: 'string' },
        { name: 'actor', type: 'string' },
        { name: 'ip_address', type: 'string' },
        { name: 'timestamp', type: 'string' },
      ],
      rows: [
        {
          id: 1,
          action: 'AUTH_SUCCESS',
          actor: 'admin',
          ip_address: '10.0.4.15',
          timestamp: '2026-08-27T06:00:00Z',
        },
        {
          id: 2,
          action: 'AUTH_FAILURE',
          actor: 'attacker',
          ip_address: '192.168.1.105',
          timestamp: '2026-08-27T06:14:00Z',
        },
      ],
    },
  },
});

export const parseSqlTokens = (rawQuery: string): SqlInjectedToken[] => {
  const tokens: SqlInjectedToken[] = [];
  const parts = rawQuery
    .split(/(\s+|--.*|\/\*[\s\S]*?\*\/|#.*|[',;=()])/)
    .filter(Boolean);

  let inComment = false;
  for (const part of parts) {
    if (part.startsWith('--') || part.startsWith('#') || part.startsWith('/*')) {
      inComment = true;
      tokens.push({ token: part, type: 'comment' });
      continue;
    }

    if (inComment) {
      tokens.push({ token: part, type: 'comment' });
      continue;
    }

    const upper = part.trim().toUpperCase();
    if (
      [
        'SELECT',
        'FROM',
        'WHERE',
        'AND',
        'OR',
        'UNION',
        'LIMIT',
        'ORDER',
        'BY',
        'INSERT',
        'UPDATE',
        'DELETE',
      ].includes(upper)
    ) {
      tokens.push({ token: part, type: 'operator' });
    } else if (['1=1', "'1'='1'", "'a'='a'", "' OR '1'='1"].includes(part)) {
      tokens.push({ token: part, type: 'injected' });
    } else {
      tokens.push({ token: part, type: 'base' });
    }
  }

  return tokens;
};

export const executeSqlQuery = (
  rawInput: string,
  db: SqlDatabase
): SqlExecutionResult => {
  const startTime = Date.now();
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      success: false,
      queryExecuted: '',
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Empty SQL query.',
    };
  }

  const tokens = parseSqlTokens(trimmed);

  // Check Tautology SQL Injection: ' OR 1=1 -- or ' OR 'a'='a
  const hasTautology =
    /'\s*OR\s*1\s*=\s*1/i.test(trimmed) ||
    /'\s*OR\s*'1'\s*=\s*'1'/i.test(trimmed) ||
    /'\s*OR\s*'a'\s*=\s*'a'/i.test(trimmed) ||
    /OR\s+true/i.test(trimmed);

  // Check UNION-based Exfiltration: ' UNION SELECT ...
  const unionMatch = trimmed.match(
    /UNION\s+SELECT\s+(.*?)(?:FROM\s+([a-zA-Z0-9_]+))?(?:--|\/\*|#|$)/i
  );

  // Check Auth Bypass detection
  const isAuthBypass =
    hasTautology &&
    (trimmed.toLowerCase().includes('login') || trimmed.toLowerCase().includes('users'));

  // Handle UNION SELECT against database tables
  if (unionMatch) {
    const rawCols = unionMatch[1].trim();
    const targetTable = (unionMatch[2] || 'users').toLowerCase();
    const table = db.tables[targetTable];

    if (!table) {
      return {
        success: false,
        queryExecuted: trimmed,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Date.now() - startTime,
        error: `SQL syntax error: relation "${targetTable}" does not exist.`,
        injectedTokens: tokens,
        vulnerabilityTriggered: 'UNION_BASED_SQLI_INVALID_TABLE',
      };
    }

    const requestedCols =
      rawCols === '*'
        ? table.columns.map((c) => c.name)
        : rawCols.split(',').map((c) => c.trim().split(/\s+/).pop() || c.trim());

    const resultRows = table.rows.map((row) => {
      const rowItem: Record<string, unknown> = {};
      requestedCols.forEach((col) => {
        rowItem[col] = row[col] !== undefined ? row[col] : 'NULL';
      });
      return rowItem;
    });

    return {
      success: true,
      queryExecuted: trimmed,
      columns: requestedCols,
      rows: resultRows,
      rowCount: resultRows.length,
      executionTimeMs: Date.now() - startTime,
      injectedTokens: tokens,
      vulnerabilityTriggered: 'UNION_BASED_EXFILTRATION',
    };
  }

  // Handle Tautology Auth Bypass
  if (hasTautology) {
    const usersTable = db.tables.users;
    return {
      success: true,
      queryExecuted: trimmed,
      columns: usersTable.columns.map((c) => c.name),
      rows: usersTable.rows, // Dumps all users due to 1=1 tautology
      rowCount: usersTable.rows.length,
      executionTimeMs: Date.now() - startTime,
      injectedTokens: tokens,
      vulnerabilityTriggered: isAuthBypass
        ? 'AUTH_BYPASS_TAUTOLOGY'
        : 'TAUTOLOGY_DUMP_ALL',
    };
  }

  // Standard SELECT query handler
  const selectMatch = trimmed.match(
    /SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?(?:--|\/\*|#|$)/i
  );
  if (selectMatch) {
    const rawCols = selectMatch[1].trim();
    const tableName = selectMatch[2].toLowerCase();
    const whereClause = selectMatch[3]?.trim();
    const table = db.tables[tableName];

    if (!table) {
      return {
        success: false,
        queryExecuted: trimmed,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Date.now() - startTime,
        error: `SQL error: table "${tableName}" not found in schema.`,
        injectedTokens: tokens,
      };
    }

    const requestedCols =
      rawCols === '*'
        ? table.columns.map((c) => c.name)
        : rawCols.split(',').map((c) => c.trim());

    let filteredRows = [...table.rows];
    if (whereClause) {
      const eqMatch = whereClause.match(/([a-zA-Z0-9_]+)\s*=\s*['"]?([^'"]+)['"]?/);
      if (eqMatch) {
        const field = eqMatch[1];
        const val = eqMatch[2];
        filteredRows = filteredRows.filter((r) => String(r[field]) === val);
      }
    }

    return {
      success: true,
      queryExecuted: trimmed,
      columns: requestedCols,
      rows: filteredRows,
      rowCount: filteredRows.length,
      executionTimeMs: Date.now() - startTime,
      injectedTokens: tokens,
    };
  }

  // Fallback unrecognized query
  return {
    success: false,
    queryExecuted: trimmed,
    columns: [],
    rows: [],
    rowCount: 0,
    executionTimeMs: Date.now() - startTime,
    error: 'Syntax error or unsupported SQL statement for educational simulator.',
    injectedTokens: tokens,
  };
};
