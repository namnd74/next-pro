# Resolved Issues & Team Post-Mortems

> Append 2-line summaries here when fixing complex bugs so all team members benefit.

---

---

## [2026-09-04] Tautological Test Trap — Fake SQLite Probe & Web Standard SQL Simulation

**Category**: Anti-Hardcoding / Runtime Grounding
**Detected by**: External OpenAI audit (second audit, RED status)
**Root cause**: Agent confused "testing that validator syntax is correct" with "proving runtime execution happened." Two files were tautological:

1. `probe-sqlite-runtime.mjs` — Used a JS fixture array + `string.includes()` to simulate a SQL parser. The test defined the data AND the "engine" — unfalsifiable.
2. `run-offsec-agent-harness.mjs` VS-02 — Used Web Standard `Request`/`Response` with an in-process `if/else` SQL check. Same tautology: test defined what "injection success" means.

**Fix applied**:

- `probe-sqlite-runtime.mjs`: Replaced entirely with `node:sqlite DatabaseSync`. The vulnerable query is executed against the C++ SQLite engine directly. The data lives inside the database, not in any JS array.
- `run-offsec-agent-harness.mjs` VS-02: Replaced `handleLiveUserApi()` fake with real `DatabaseSync`. The `liveExchange.response.body` now contains rows returned by `db.prepare(vulnSql).all()`.
- `probe-webcontainer-core.mjs`: Changed from "optional receipt" to HARD FAIL if no receipt exists.
- `run-adversarial-audit.mjs`: Added Playwright step before Step 2.4b; added `cap-wc-01.json` to mandatory receipts (now 5 required).
- `docs/offensive-security/PLAN_V4.md`: Created formal ADR-001 document.
- E2E tests: Fixed stale selectors in `command-center.spec.ts`, `lesson-flow.spec.ts`, and replaced `operation-blacksky.spec.ts` fake terminal test with real workbench render test.

**Self-audit invariant** (encoded in skills and rules):

> Before claiming any probe/harness is "authentic", ask: "If I delete the data from this test file, does the test still know what to expect?"
> If YES → tautological. Fix it by moving data to an external system (real DB, real kernel, real browser).

**Files changed**: `scripts/probes/probe-sqlite-runtime.mjs`, `scripts/run-offsec-agent-harness.mjs`, `scripts/probes/probe-webcontainer-core.mjs`, `scripts/run-adversarial-audit.mjs`, `tests/e2e/offensive-security/command-center.spec.ts`, `tests/e2e/offensive-security/lesson-flow.spec.ts`, `tests/e2e/offensive-security/operation-blacksky.spec.ts`, `docs/offensive-security/PLAN_V4.md`
