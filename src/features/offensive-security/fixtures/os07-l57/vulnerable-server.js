/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Vulnerable Node.js HTTP Service for os07-l57 Lab
 * Runs directly inside WebContainer.
 */
const http = require('http');

// In-memory data store with user accounts
const USERS = [
  { id: 1, username: 'admin', role: 'administrator', secret: 'FLAG{sqli_injection_verified_authentic}' },
  { id: 2, username: 'auditor', role: 'sec_auditor', secret: 'TOKEN_AUDIT_9921' },
  { id: 3, username: 'operator', role: 'dev_operator', secret: 'TOKEN_OP_1102' },
];

function executeQueryVulnerable(usernameInput) {
  // Vulnerable simulation: string concatenation logic
  const isTautology = usernameInput.includes("' OR 1=1") || usernameInput.includes("' OR '1'='1");
  if (isTautology) {
    return [...USERS];
  }
  return USERS.filter((u) => u.username === usernameInput);
}

function executeQueryParameterized(usernameInput) {
  // Remediated: strict equality binding (parameterized)
  return USERS.filter((u) => u.username === usernameInput);
}

let isRemediated = false;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/remediate' && req.method === 'POST') {
    isRemediated = true;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'REMEDIATED', mode: 'PARAMETERIZED_BINDING' }));
    return;
  }

  if (url.pathname === '/api/users') {
    const q = url.searchParams.get('username') || '';
    const results = isRemediated ? executeQueryParameterized(q) : executeQueryVulnerable(q);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: results.length, data: results }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NOT_FOUND' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`[os07-l57] Vulnerable API server listening on port ${PORT}`);
});
