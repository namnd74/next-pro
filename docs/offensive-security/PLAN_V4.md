# PLAN V4 — Offensive Security Academy Architecture

> **Status**: DRAFT / PENDING INDEPENDENT SIGN-OFF | Authority: ADR-001 | Effective: 2026-09-04
> **Governance Note**: Per Audit Finding F-06, plan governance is cataloged as `DRAFT / APPROVAL UNVERIFIED` until an external immutable approval record or owner sign-off artifact is provided. All 156 authored curriculum lessons on disk remain strictly classified as `unverified`.

## Governance & Architecture Directives

Plan v4 specifies the zero-hardcode architecture for the Offensive Security Academy with the following explicit governance boundaries:

1. **Tracks 00–07 remain the core** — All contracts, probes, and receipts must pass before any new track is promoted.
2. **Tracks 08–18 are authored under strict `unverified` status** until contracts are written and the adversarial harness passes against real external execution backends.
3. **52 modules / 156 lessons on disk** remain cataloged as `unverified` (no promotion based solely on schema validation or vertical slice demonstrations).
4. **ADR-001 Zero hardcoding policy** — All competency verification must use live runtime execution, not JS fixture arrays or string.includes() oracles.

### Governance Status Record

| Property                 | Record                                       |
| :----------------------- | :------------------------------------------- |
| **Governance Status**    | `DRAFT / PENDING INDEPENDENT SIGN-OFF`       |
| **Lesson Catalog State** | 156 / 156 lessons classified as `unverified` |
| **Framework Standard**   | ADR-001 Zero-Hardcode & Runtime Grounding    |
| **Audit Package**        | AUDIT-REMEDIATION-04 (F-01..F-07)            |
| **Effective Date**       | 2026-09-04                                   |

---

## ADR-001: Anti-Hardcoding & Runtime Grounding

**Problem**: Prior to v4, probe scripts and the adversarial harness used JavaScript fixture arrays and `string.includes()` checks to "simulate" SQL injection and filesystem operations. External audits repeatedly flagged these as tautological tests — the test defined both the expected data and the validator, making them unfalsifiable.

**Decision**: Every verification component must be grounded in a system external to the test script itself:

| Component           | Acceptable Evidence Source                      | Forbidden                   |
| ------------------- | ----------------------------------------------- | --------------------------- |
| SQL injection probe | `node:sqlite DatabaseSync` (C++ engine)         | JS array + `if/else` parser |
| Filesystem probe    | `fs.chmodSync` + `fs.statSync` kernel call      | Hardcoded octal string      |
| Browser isolation   | Playwright Chromium receipt (`cap-wc-01.json`)  | Static header assertion     |
| CORS probe          | Real cross-origin `fetch` or Playwright browser | In-process `if/else`        |
| Contract harness    | Contract's own predicate + live data            | Precomputed boolean         |

**Enforcement**: `scripts/audit-probes.mjs` scans all probe scripts for FORBIDDEN_PATTERNS (tautological assertions, static readFile.includes(), dummy streams) and fails the audit gate on first violation.

---

## Architecture Overview

```
Adversarial Audit Gate (npm run audit:adversarial)
├── Step 1: Meta-Audit (scripts/audit-probes.mjs)
│   └── Scans probes/ + run-offsec-agent-harness.mjs for fake patterns
├── Step 2: Live Capability Probes
│   ├── CAP-ORIGIN-01: Multi-origin CORS boundary (scripts/probes/probe-multi-origin-http.mjs)
│   ├── CAP-SQL-01: Real SQLite engine — node:sqlite DatabaseSync (scripts/probes/probe-sqlite-runtime.mjs)
│   ├── CAP-OS-01: POSIX chmod/stat kernel boundary (scripts/probes/probe-os-boundaries.mjs)
│   ├── Step 2.4a: Playwright WebContainer browser receipt generation
│   └── CAP-WC-01: WebContainer isolation — requires Playwright receipt (scripts/probes/probe-webcontainer-core.mjs)
├── Step 3: Adversarial Contract Harness (scripts/run-offsec-agent-harness.mjs)
│   ├── VS-01 (os00-l05): ROE & Stop Conditions — 1 positive + 2 mutation kills
│   ├── VS-02 (os07-l57): SQLi Tautology — 1 positive (real SQLite) + 2 mutation kills
│   └── VS-03 (os02-l15): Linux DAC/SUID — 1 positive (real chmod/stat) + 3 mutation kills
└── Step 4: Cryptographic Receipt Attestation (5 mandatory receipts)
    ├── cap-origin-01.json
    ├── cap-sql-01.json
    ├── cap-os-01.json
    ├── cap-wc-01.json    ← Requires Playwright browser execution
    └── adversarial-harness.json
```

---

## Curriculum Expansion Rationale (v3 → v4)

| Metric       | v3 (Frozen)                | v4 (Current)                   |
| ------------ | -------------------------- | ------------------------------ |
| Tracks       | 8 (00–07)                  | 19 (00–18)                     |
| Modules      | 27                         | 52                             |
| Lessons      | 81                         | 156                            |
| Batch Policy | maxModules=2, maxLessons=6 | maxModules=2, maxLessons=6     |
| Freeze Scope | Tracks 08–18 frozen        | Tracks 08–18 open (unverified) |

**Rationale**: The original freeze was a quality gate to prevent content proliferation without contract coverage. With the adversarial audit gate operational and self-enforcing, expansion is permissible provided all new content is marked `"status": "unverified"` in `curriculum-manifest.json` until contracts pass.

---

## Batch Policy (Unchanged)

- `maxModulesPerRun: 2` — Maximum 2 new modules per generation run
- `maxLessonsPerRun: 6` — Maximum 6 new lessons per generation run
- New content must include: learning objectives, scenario, lab instructions, decision points
- New contracts must use: live runtime evidence (no hardcoded states)

---

## Self-Audit Capability (v4 Learning)

The external OpenAI audit identified a systematic agent blind spot: **the Tautological Test Trap**.

**Root cause**: The agent confused "testing that validator logic is syntactically correct" with "proving runtime execution happened." The tell-tale sign: when the test file BOTH defines expected data AND passes it to the function being tested — the test is unfalsifiable.

**Fix encoded in**:

- `.agents/rules/code-convention.md` § 6: Truthful Execution & Anti-Hardcoding Invariant
- `.agents/rules/code-review.md`: Anti-Tautology Audit checklist
- `.agents/skills/agent-harness/SKILL.md` § 3: Anti-Hardcode & Runtime Grounding Invariant
- `.agents/skills/testing/SKILL.md` § 3: Anti-Tautology & Grounding Standards
- `.agents/skills/offensive-security-curriculum/SKILL.md`: Harness prohibition

**Self-audit question** (to ask before claiming any probe is authentic):

> _"If I delete the data from this test file, does the test still know what to expect?"_
> If YES → tautological. The data must come from a DIFFERENT SYSTEM than the test script.
