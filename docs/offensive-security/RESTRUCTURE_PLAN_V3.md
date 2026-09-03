# Offensive Security Restructuring Plan v3

**Status: DRAFT — implementation is not authorized until the owner explicitly approves this plan.**

## 1. Objective

Raise the current Offensive Security Academy from a presentation-heavy browser
simulation into an honest, evidence-driven learning system without allowing an AI
agent to invent replacement SQL parsers, POSIX kernels, VM emulators, cryptography,
storage layers, or grading engines.

This plan optimizes for technical truth before feature count. Tracks 08–18 remain
frozen. Existing tracks are revalidated lesson by lesson; no track-level score may
count planned or unverified lessons.

Target release quality:

- no automatic-rejection condition from `quality-rubric.md`;
- every `validated` lesson scores at least 18/22 with no zero;
- simulation, real execution, external lab, and local VM/container are visibly distinct;
- completion is derived from a declared contract and evidence, never UI clicks or
  generic fallback objectives;
- missing runtime capability causes `UNSUPPORTED` or `UNVERIFIED`, never a generated mock.

## 2. AI execution constitution

These rules apply to Gemini, Codex, and every other implementation agent.

### 2.1 Reuse-or-stop rule

The agent MUST NOT create any of the following unless a separately reviewed ADR
explicitly authorizes it:

- SQL tokenizer, parser, AST evaluator, query planner, or database emulator;
- POSIX/Linux kernel, DAC/ACL/capability emulator, shell parser, or fake system service;
- x86/ARM CPU, memory, Windows, Active Directory, Kerberos, network stack, TLS, or
  packet emulator;
- custom cryptographic hash/signature implementation;
- new storage framework when the existing IndexedDB helpers can express the requirement;
- generic workflow/state-machine framework;
- result generator based on command substrings, payload length, URL substrings, or
  lesson-title keywords.

If an approved library/runtime cannot provide a required semantic boundary, the
agent must select exactly one outcome:

1. label the experience `browser-demo` and remove competency claims;
2. route the lesson to `local-container`, `local-vm`, or `external-platform`;
3. return `BLOCKED_CAPABILITY` with an ADR describing the missing capability.

It must never fill the gap with hard-coded successful output.

### 2.2 Dependency rule

- Use only dependencies declared directly in `package.json` or browser/Node standard APIs.
- A transitive package in `node_modules` is not an approved application dependency.
- No `npm install`, package upgrade, CDN import, copied vendor bundle, or remote runtime
  download without owner approval through a dependency ADR.
- Every dependency ADR must list license, bundle/runtime cost, browser support,
  maintenance status, security posture, alternatives, and rollback path.

### 2.3 Work-package rule

- Expand and execute one work package at a time.
- Before editing, Gemini returns a package-level `[STATUS: DRAFT]` implementation plan.
- The package may touch only its declared write set.
- Maximum self-correction loop: three inspect/action/verify cycles.
- A failing acceptance criterion may not be converted into a warning.
- No bulk rewrite of 81 lessons. Content migration is limited to one module or three
  closely related lessons per approved batch.

### 2.4 Truth rule

- `validated` means contract, runtime/evidence checks, content review, and source review pass.
- `practice_completed` is local learning progress, not an identity-bound certification.
- `competency_verified` is forbidden until an authoritative grading boundary exists.
- Tests must assert behavior and invariants, not the presence of marketing text.
- Exact framework versions must come from maintained metadata or be omitted from marketing.

## 3. Approved capability inventory

| Capability           | Existing primitive                                             | Approved use                                                                       | Explicit non-use                                                           |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Browser Node runtime | `@webcontainer/api` and existing `WebContainerManager`         | Fixed, in-browser Node HTTP services; real process output; mounted lesson fixtures | Linux privilege, UID/GID, systemd, kernel, Windows, AD, or packet fidelity |
| Terminal             | `@xterm/xterm`, `@xterm/addon-fit`                             | Render streams from an approved runtime adapter                                    | Generating fabricated command results                                      |
| Code editor          | CodeMirror packages already declared                           | Editing learner-owned source/config artifacts                                      | Grading by source substring alone                                          |
| Client progress      | Zustand persist                                                | Non-authoritative UI progress and session resume                                   | Certification or tamper-resistant evidence                                 |
| Artifact storage     | existing IndexedDB helpers and browser IndexedDB               | Attempts, evidence envelopes, snapshots, migration history                         | Storing secrets or claiming server attestation                             |
| Hashing              | Web Crypto `crypto.subtle.digest`                              | Integrity checksum inside a local evidence envelope                                | Authentication, signing, or anti-cheat claims                              |
| Browser/API state    | React 19 and existing feature components                       | UI and orchestration views                                                         | Domain workflow logic inside React components                              |
| Query/runtime cache  | TanStack Query                                                 | Async runtime lifecycle/status where useful                                        | Persisting competency authority                                            |
| HTTP client          | browser `fetch` or declared Axios                              | Requests only to fixed WebContainer server URLs                                    | Arbitrary user-provided external targets                                   |
| Browser verification | Playwright                                                     | User-flow, runtime integration, accessibility, and anti-shortcut E2E               | Replacing unit/contract tests                                              |
| Static checking      | TypeScript, ESLint                                             | Types and static invariants                                                        | Treating typecheck as content validation                                   |
| Unit tests           | Node built-in `node:test` when importable without a new runner | Pure JS/runtime contract tests                                                     | Adding another test framework without ADR                                  |

Notes:

- `zod` and `ajv` currently appear transitively, not as direct dependencies. Gemini may
  not import either until a dependency ADR promotes one to a direct dependency.
- `sql.js` is not installed. It is not part of the default plan.
- Node exposes `node:sqlite` in modern Node versions, but support inside the actual
  WebContainer runtime is unknown. It must pass capability probe `CAP-SQL-01` before use.

## 4. Runtime selection matrix

Runtime selection is explicit lesson metadata. It must not be inferred from IDs,
titles, domains, or keyword matching.

| Lesson boundary                                     | Runtime classification                                     | Implementation policy                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Ethics, ROE, reporting, evidence handling           | `browser-demo` / artifact assessment                       | Structured scenario, authored artifact, rubric evaluation; no fake terminal                             |
| Node web/API behavior                               | `webcontainer-node`                                        | Existing WebContainer manager, fixed local service, deterministic fixture and port                      |
| SQL injection                                       | `webcontainer-node-sqlite` only if `CAP-SQL-01` passes     | Use Node built-in SQLite with vulnerable and parameterized query paths; otherwise block and request ADR |
| Browser DOM/XSS/SOP                                 | `browser-isolated-frame`                                   | Sandboxed iframe and fixed local origins; no arbitrary URL                                              |
| Linux DAC, capabilities, SUID, systemd, auditd/eBPF | `local-container`, `local-vm`, or external lab             | Browser visualization may teach a mental model but cannot verify OS competency                          |
| Windows, AD, Kerberos, endpoint telemetry           | `local-vm` or external lab                                 | No browser emulator substitute                                                                          |
| Packet/DNS/TLS protocol reasoning                   | `browser-demo` with captured fixtures or local-container   | Clearly label fixture playback; real packet claims require a real network boundary                      |
| Memory corruption                                   | `browser-demo` visualizer or approved compiled WASM target | A stack diagram is not a CPU emulator or exploitability proof                                           |
| Detection engineering                               | runtime event source plus explicit detection contract      | Telemetry derives from execution result/state event, never raw-command substring                        |

## 5. Removal matrix

Removal is part of the architecture, not optional cleanup. An obsolete mock must not
remain available as a silent fallback after its replacement ships. Gemini may delete
only the targets authorized by the active removal work package and only after the
listed preconditions pass.

### 5.1 Delete as obsolete infrastructure

| Target                                                                                                       | Required action                                                                                                                           | Preconditions                                                              |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `scripts/run-offsec-agent-harness.mjs` → inline `HarnessSimulationRuntime` and duplicated `GOLDEN_CONTRACTS` | Delete the private simulator and duplicated contract data; keep/rebuild only the script entry point around the production contract runner | `WP-400` production runner passes negative and mutation fixtures           |
| `src/features/offensive-security/workbench/core/lesson-contracts.ts`                                         | Delete the stale seven-entry contract table and its barrel export                                                                         | canonical contract registry exists; repository-wide import search is clean |
| `src/features/offensive-security/workbench/engines/virtual-ad-kdc-engine.ts`                                 | Delete; AD/Kerberos competency must use VM/external lab                                                                                   | no runtime import; any retained AD graph is explicitly visualization-only  |
| generated/untracked `test-results/` artifacts                                                                | Remove from source tracking and ignore as ephemeral output; retain only intentionally curated fixtures                                    | confirm no diagnostic artifact is needed for an active bug report          |

### 5.2 Delete after approved replacement

| Current target                                                                                    | Replacement                                                                                         | Deletion gate                                                                                        |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `engines/sql-injection-engine.ts`                                                                 | runtime approved by `CAP-SQL-01` and `WP-201`                                                       | SQL vertical slice passes vulnerable/prepared/replay tests; `sql-lab-view.tsx` no longer imports it  |
| `engines/http-packet-engine.ts`                                                                   | fixed local HTTP service through existing WebContainer infrastructure                               | HTTP/CORS vertical tests use real browser requests; no caller needs fabricated responses             |
| `engines/virtual-network-engine.ts`                                                               | captured-fixture viewer for demos or local-container network lab                                    | topology UI consumes declarative fixtures; no scan result is generated from command text             |
| `engines/virtual-posix-engine.ts`                                                                 | local-container/VM/external lab for OS competency; simple non-shell visualization for browser demos | all affected lessons are remapped; terminal and dual-terminal callers are migrated or removed        |
| `core/posix-simulation-runtime.ts` and `core/command-router.ts`                                   | approved runtime adapters                                                                           | no production or test import remains                                                                 |
| `dynamic-lab-generator.ts`                                                                        | explicit `LabDescriptor` + `CompetencyContractRegistry` lookup                                      | every available lesson has an explicit runtime classification; missing contract returns `UNVERIFIED` |
| `workbench-presets.ts` hard-coded objective/payload chains                                        | versioned lesson fixtures and contracts                                                             | blind-lab leakage tests pass; preset-only UI configuration is moved to declarative fixtures          |
| substring-derived telemetry logic under `workbench/telemetry/`                                    | domain events emitted by approved runtime adapters                                                  | benign and malicious executions produce distinguishable tested telemetry                             |
| E2E scenarios that assert fabricated kill-chain output, including Operation BlackSky expectations | contract-driven E2E using approved runtime behavior                                                 | replacement test fails on shortcut and passes on the intended evidence path                          |

### 5.3 Keep, but narrow and rename

| Target                                                       | Keep only as                                                   | Forbidden claim                                              |
| ------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `stack-memory-visualizer.ts` and `memory-exploit-studio.tsx` | deterministic stack-layout teaching visualization              | CPU emulation, v86 execution, exploitability proof           |
| `bloodhound-graph-view.tsx`                                  | synthetic attack-path graph visualization                      | real AD enumeration or Kerberos execution                    |
| `cyber-range-topology-map.tsx`                               | topology/fixture viewer                                        | real network discovery                                       |
| `soc-telemetry-studio.tsx`                                   | renderer for runtime-derived or clearly labeled fixture events | proof that a host/network product emitted the event          |
| `terminal-view.tsx` and `dual-terminal-workbench.tsx`        | stream UI around an approved adapter                           | shell/runtime semantics generated inside the React component |
| existing lesson JSON                                         | curriculum content awaiting bounded revalidation               | automatic promotion to validated status                      |

### 5.4 Never delete during migration

- Do not delete learner progress silently. Migrate old completion to `legacy_unverified`.
- Do not delete stable lesson IDs or URLs. Add status/runtime metadata and preserve links.
- Do not delete source attribution while rewriting content; replace or supersede it with
  a traceable review record.
- Do not delete a mock before all callers have either an approved replacement or an
  explicit unsupported/simulation state. Broken imports are not a migration strategy.

### 5.5 Removal work packages

#### RM-001: Remove dead and duplicated infrastructure

- Confirm import graph for `lesson-contracts.ts` and `virtual-ad-kdc-engine.ts`.
- Remove unused files/exports and ephemeral test artifacts only.
- Acceptance: typecheck, lint, relevant tests, build, and repository-wide symbol scan pass.

#### RM-002: Remove fabricated SQL and HTTP paths

- Execute only after `WP-201` and the HTTP WebContainer adapter pass.
- Delete old engines, old fixture-specific objective branches, and obsolete tests together.
- Acceptance: intentionally breaking the replacement runtime makes E2E fail.

#### RM-003: Remove fake POSIX/network competency path

- Remap every caller and affected lesson first.
- Delete virtual shell/network execution code rather than incrementally pretending it
  is Linux or a network stack.
- Acceptance: browser demos remain available with simulation labels; OS/network
  competency is unavailable until its declared container/VM lab is healthy.

#### RM-004: Remove dynamic generation and leaked presets

- Replace keyword routing with explicit descriptors and contracts.
- Delete the generator and solution-bearing presets after registry parity is proven.
- Acceptance: unknown lesson/runtime combinations fail closed as `UNVERIFIED`.

## 6. Canonical architecture

### 6.1 Source of truth

Create one canonical lesson registry consumed by routes, track UI, validators, runtime
selection, and status reporting. Do not maintain independent hard-coded copies.

Required concepts:

- `LessonDefinition`: content metadata and pedagogy;
- `LabDescriptor`: declared runtime kind, capability requirements, safety limits;
- `CompetencyContract`: objectives, evidence rules, remediation/replay rules where applicable;
- `EvidenceEnvelope`: local attempt record and runtime provenance;
- `ReviewRecord`: 11-dimension rubric, reviewer identity, checks, risks;
- `LessonStatus`: `draft | unsupported | unverified | validated | published`.

Runtime labels and completion eligibility must be derived from these declarations.

### 6.2 Runtime adapter boundary

All runtime adapters expose a small shared contract:

```text
prepare(fixture, seed) -> runtime session
execute(action) -> structured result + domain events
inspect(allowed selector) -> observable state
reset() -> deterministic baseline
dispose() -> verified cleanup
capabilities() -> declared capability set
```

No adapter may claim a capability it cannot prove in a capability test.

### 6.3 Competency session

Implement as pure TypeScript domain transitions plus a thin Zustand/UI adapter; do
not add a state-machine library and do not place workflow policy in React components.

Capability-neutral flow:

```text
READY
  -> BASELINE_CAPTURED
  -> CAPABILITY_ATTEMPTED
  -> CAPABILITY_EVIDENCED
  -> CORRECTION_PENDING (only when the lesson requires remediation)
  -> REPLAY_VERIFIED (only when applicable)
  -> TRANSFER_PASSED
  -> PRACTICE_COMPLETED
```

An objective must evaluate state plus relevant ordered events and negative assertions.
Final state alone is insufficient when a direct shortcut can produce it.

## 7. Phased work packages

### Phase 0 — Truth freeze and baseline

#### WP-000: Record baseline

- Read: manifest, generation status, all offsec scripts, current git status.
- Write: audit report only.
- Produce counts for tracks/modules/lessons, current status, runtime mappings, contracts,
  completion paths, stale IDs, hard-coded success predicates, and manifest mismatches.
- Acceptance: results are reproducible by commands recorded in the report.

#### WP-001: Remove unsupported claims

- Search repository-wide for `WASM`, `real`, `v86`, `emulator`, `deployed`,
  `competency verified`, fixed ATT&CK versions, and similar claims.
- Replace labels according to declared runtime capability.
- Update UI, docs, skill references, tests, and status together.
- Acceptance: prohibited-claim scan has zero unexplained matches.

#### WP-002: Downgrade status honestly

- Mark lessons without reviewed contracts as `unverified` or `draft`.
- Preserve content availability; remove completion authority.
- Acceptance: no `validated` lesson lacks a review record and executable contract.

### Phase 1 — Capability probes and ADRs

Capability probes must be isolated and disposable. They do not modify product flows.

#### CAP-WC-01: Existing WebContainer reuse

- Prove the existing singleton manager can mount a fixed fixture, spawn Node, capture
  stdout/stderr/exit code, expose one local server, reset, and teardown.
- Verify unsupported-browser behavior and cross-origin-isolation requirements.
- Acceptance: Playwright records both supported and graceful-fallback paths.

#### CAP-SQL-01: SQLite without a new dependency

- Inside the actual WebContainer runtime, probe `node:sqlite` with an in-memory DB,
  syntax error, vulnerable concatenation, and prepared statement.
- Do not build a fallback parser.
- Acceptance A: capability works deterministically and an ADR approves it.
- Acceptance B: return `BLOCKED_CAPABILITY`; owner decides whether to approve `sql.js`.

#### CAP-ORIGIN-01: Multiple local origins

- Prove two fixed WebContainer services/ports can support SOP/CORS exercises.
- No external URL input.
- Acceptance: browser origin and CORS behavior come from the browser, not fabricated response objects.

#### CAP-OS-01: OS fidelity boundary

- Document what WebContainer does and does not guarantee for UID/GID, ownership,
  permissions, SUID, capabilities, systemd, auditd/eBPF, namespaces, and cgroups.
- Acceptance: Linux lessons are mapped to browser-demo, local-container/VM, or blocked;
  none are silently assigned to a fake POSIX runtime.

#### ADR-001: Runtime portfolio

- Consolidate capability-probe outcomes.
- Decide runtime classification and fallback policy per lesson family.
- Acceptance: owner approval is required before Phase 2.

### Phase 2 — Canonical contracts and validation

#### WP-100: Dependency and schema decision

- Decide whether to promote existing transitive Zod to a direct dependency.
- If rejected, propose a build-generated typed registry without inventing a generic validator.
- Acceptance: one canonical validation boundary; no unchecked cast to lesson/module types.

#### WP-101: Define status and runtime enums

- Add explicit `runtimeKind`, `capabilities`, `status`, `contractVersion`, and
  `reviewVersion` fields.
- Remove ambiguous `safe`/`isolated-only` mappings that disagree with runtime behavior.
- Acceptance: invalid enum, unknown tactic ID, duplicate ID, or missing dependency fails validation.

#### WP-102: Define competency contract

- Model objective predicates, required ordered events, prohibited shortcuts, evidence,
  remediation/replay applicability, reset, cleanup, and safety limits.
- Do not encode executable functions inside curriculum JSON.
- Acceptance: contracts are serializable, versioned, and validated before runtime use.

#### WP-103: Define evidence envelope

- Use Web Crypto for digest only.
- Record runtime kind/version, fixture version, seed, before/after selectors, ordered
  domain events, objective results, replay results, hint count, attempt count, and timestamps.
- Acceptance: UI cannot label a session complete when required evidence fields are absent.

#### WP-104: Build canonical registry

- Derive route entries, track counts, status reporting, and runtime lookup from one registry.
- Delete manual duplicated registration only after parity tests pass.
- Acceptance: adding one fixture lesson changes counts and routes without editing multiple lists.

### Phase 3 — Runtime adapters using approved primitives

#### WP-200: WebContainer adapter

- Reuse `WebContainerManager`; extract only offsec-neutral lifecycle APIs if required.
- Mount fixed, dependency-free Node fixtures where possible.
- Enforce fixed hosts/ports, timeout, output limit, process limit, reset, and teardown.
- Acceptance: no arbitrary destination or package-install field is exposed to the learner.

#### WP-201: SQLite adapter

- Execute only the runtime approved by `CAP-SQL-01`/ADR.
- Compare a vulnerable application query path with a prepared statement path.
- Return actual engine errors and rows; do not infer injection from payload strings.
- Acceptance: true/false tautologies, syntax errors, comment handling, parameter binding,
  UNION mismatch, remediation replay, and reset are covered.

#### WP-202: Browser-origin adapter

- Use sandboxed frames and fixed local origins from `CAP-ORIGIN-01`.
- Capture actual request/response and browser policy outcomes.
- Acceptance: no fabricated SOP/CORS success and no external target input.

#### WP-203: Simulation adapter

- Retain visualizers and fixture playback only for declared `browser-demo` lessons.
- Add permanent simulation watermark and capability-limit panel.
- Simulation sessions may create learning evidence but cannot satisfy real-runtime objectives.
- Acceptance: the adapter exposes no `realExecution` or `competencyVerified` capability.

#### WP-204: Retire fake engines

- Inventory imports before deletion.
- Remove or rename fake SQLite, v86, AD/KDC, packet, HTTP, and POSIX claims only after
  their callers have an approved replacement or explicit simulation classification.
- Acceptance: no orphan import, duplicate runtime, or hidden fallback remains.

### Phase 4 — Three vertical slices

Do not migrate 81 lessons yet. Prove the architecture with three different assessment shapes.

#### VS-01: `os00-l05-rules-of-engagement-and-stop-conditions`

- Runtime: structured browser scenario; no terminal.
- Capability: produce an authorization/stop decision and evidence record.
- Evidence: scoped decision, cited ROE clause, stop condition, deconfliction action.
- No remediation replay because it is not applicable.
- Acceptance: demonstrates that the competency flow is not exploit-only.

#### VS-02: `os07-l57-sql-nosql-command-and-template-injection`

- Narrow initial scope to SQL injection; explicitly defer NoSQL/command/SSTI runtime claims.
- Runtime: approved SQLite path from `CAP-SQL-01`.
- Evidence: vulnerable query behavior, returned rows, prepared statement change, failed replay.
- Acceptance: exploit works before correction and the same payload fails after correction.

#### VS-03: `os02-l15-permission-bits-and-special-modes`

- Browser portion: mental-model visualization only.
- Competency portion: local-container/VM or approved external lab; do not use WebContainer
  as evidence of Linux UID/GID/SUID fidelity.
- Acceptance: if no real OS lab package exists, lesson remains `unverified` while the
  browser demo stays available.

Phase 4 exit gate:

- all three slices satisfy their declared runtime boundaries;
- no generic objective exists;
- evidence envelope migration and reset are proven;
- owner reviews UX and contract ergonomics before rollout.

### Phase 5 — Progress, attempts, and prerequisites

#### WP-300: Progress schema v2

- Migrate old IDs to `legacy_unverified`.
- Store local attempt summaries separately from evidence envelopes.
- Never auto-upgrade historical completion to `practice_completed`.
- Acceptance: migration is idempotent and rollback-safe.

#### WP-301: Prerequisite policy

- Theory remains readable.
- Practice shows dependency warnings.
- Graded local practice may be locked only by canonical prerequisites.
- Provide an explicit non-certifying self-study override when product policy permits.
- Acceptance: direct routes, stale storage, cycles, missing IDs, and reset are tested.

#### WP-302: Session UI

- React components render domain state and dispatch actions only.
- Show runtime kind, simulation limits, evidence checklist, attempt state, replay state,
  and why completion is blocked.
- Acceptance: no React effect can independently award completion.

### Phase 6 — Strict harness and CI gates

#### WP-400: Production contract runner

- Run the same contract evaluator and runtime adapters used by production.
- Missing contract is `UNVERIFIED`, never pass.
- Distinguish `PASS`, `FAIL`, `UNSUPPORTED`, and `UNVERIFIED` in reports.
- Acceptance: deleting or weakening one predicate makes the harness fail.

#### WP-401: Anti-shortcut suite

- Test direct final-state mutation, unrelated successful command, stale artifact, replay
  with different payload, hint leakage, reordered events, empty evidence, and reset bypass.
- Acceptance: every validated contract has at least one negative and one mutation test.

#### WP-402: Manifest/content/runtime validator

- Cross-check title, status, difficulty, safety, lab mode, output path, runtime kind,
  prerequisites, tactic IDs, contract version, and review record.
- Mismatch for validated/published content is fatal.
- Acceptance: fixture mutations prove every comparison can fail CI.

#### WP-403: Repository checks

- Run narrow contract tests first, then content/manifest validators, typecheck, lint,
  relevant Playwright tests, and production build.
- Record unavailable checks and residual risk; do not rewrite failures as success.

### Phase 7 — Content revalidation in bounded batches

For each approved module or group of at most three lessons:

1. verify taxonomy and current ATT&CK IDs;
2. rewrite implausible distractors into credible trade-offs;
3. remove solution leakage from blind variants;
4. verify mechanism and version-sensitive claims against authoritative sources;
5. map the lesson to an approved runtime or browser-demo;
6. author the lesson-specific contract and evidence criteria;
7. add mitigation and detection verification where applicable;
8. run independent rubric review;
9. promote only passing lessons to `validated`;
10. update generation status with evidence and remaining risks.

Recommended order: Track 00, Track 01, Track 02, Track 05, Track 07, Track 03,
Track 04, then Track 06. The order may change only through an approved dependency review.

## 8. Release gates

The 8.2 target is achieved only when all conditions below are true:

- zero unexplained false runtime claims;
- zero automatic-rejection condition;
- zero completion predicate that always returns true;
- zero substring/lesson-keyword result generator;
- zero validated lesson without a versioned contract and review record;
- zero manifest/content/runtime mismatch for validated lessons;
- zero arbitrary external target input;
- every validated practical lesson has objective evidence and acceptance criteria;
- remediation replay passes where remediation is part of the outcome;
- detection lessons use runtime-derived events and a testable hypothesis;
- all old completion data is visibly `legacy_unverified`;
- each validated lesson scores at least 18/22 with no zero;
- an independent reviewer signs the batch review;
- required checks pass and are recorded without inflated aggregate wording.

## 9. Gemini micro-plan protocol

Gemini receives only one work-package ID at a time and must respond using this template:

```text
[STATUS: DRAFT]
Package: <ID and title>

1. Objective
2. Facts verified from current files
3. Existing libraries/APIs to reuse
4. Explicitly prohibited implementations
5. Exact read set
6. Exact write set
7. Proposed data/control flow
8. Acceptance criteria mapped one-to-one to tests
9. Negative and anti-shortcut tests
10. Migration/rollback impact
11. Safety and capability limits
12. Unknowns and STOP decisions
13. Commands to verify

Do not edit files until the owner changes this package to [STATUS: APPROVED].
Do not add a dependency or write a replacement engine.
If a required capability is unavailable, return BLOCKED_CAPABILITY and an ADR stub.
```

Gemini must not expand future packages while the current package is unapproved or failing.

## 10. First approval sequence

Recommended first approvals:

1. `WP-000` baseline inventory;
2. `WP-001` truth terminology;
3. `WP-002` status downgrade;
4. `CAP-WC-01`, `CAP-SQL-01`, `CAP-ORIGIN-01`, and `CAP-OS-01` as read-only/probe work;
5. `ADR-001` runtime portfolio;
6. only then approve canonical schema and implementation work.

No engine refactor or lesson migration should begin before this sequence completes.
