# ADR-001: Runtime Portfolio & Execution Boundaries

- **Status:** ACCEPTED
- **Date:** 2026-09-04
- **Decision Makers:** Academy Lead, Offensive Security Curriculum Architect, AI Implementation Agent
- **Grounded Evidence:** `CAP-WC-01`, `CAP-SQL-01`, `CAP-ORIGIN-01`, `CAP-OS-01`

---

## 1. Context & Problem Statement

The Academy previously claimed "Live WASM / Real Linux Kernel" in the browser, but implemented those claims via simulated TypeScript string parsers, regex tokenizers, and hardcoded command output. This created false competency signals and failed independent technical audits (scoring 4.5/10).

We need an authoritative runtime boundary that establishes what can actually execute in the browser versus what must be classified as an inspector or deferred to external container/VM environments.

---

## 2. Probe Findings Summary

| Probe ID          | Target Domain       | Findings & Technical Boundaries                                                                                                                                                                     | Architectural Impact                                                                                      |
| :---------------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **CAP-WC-01**     | WebContainer Core   | `@webcontainer/api` (^1.6.4) and `WebContainerManager` provide authentic Node.js execution, virtual filesystem manipulation, and process stream piping.                                             | **APPROVED** for Web API and Node scripting labs.                                                         |
| **CAP-SQL-01**    | Relational Database | Native SQLite drivers (`better-sqlite3`, `sqlite3`) require C/C++ compilation unsupported in WASM without native bindings. Custom regex SQL engines are strictly prohibited by the AI Constitution. | **APPROVED**: Run SQLi labs as Node.js HTTP services in WebContainer or use declarative query inspection. |
| **CAP-ORIGIN-01** | Local HTTP & Origin | In-browser HTTP server instances listen on local ports and respond to standard HTTP GET/POST requests.                                                                                              | **APPROVED**: Use authentic HTTP transactions for API security & injection verification.                  |
| **CAP-OS-01**     | OS, DAC & Kernel    | WebAssembly runs in a single-user sandboxed context without Linux multi-user UID separation, root privilege, kernel DAC, or Windows AD Kerberos tickets.                                            | **APPROVED**: Linux & Windows tracks are strictly classified as `telemetry-inspector` or `decision-lab`.  |

---

## 3. Decision Portfolio

### Decision 1: Authoritative Runtime for Web & Scripting

- All executable Web, API, and Scripting labs (Track 04 & Track 07) run directly on **WebContainer** via `WebContainerWorkbenchAdapter`.
- Real processes, real exit codes, and real HTTP status codes determine exploit success and remediation replay validity.

### Decision 2: Prohibition of Mock Engines

- The following simulated engines are declared permanently deprecated and must be deleted:
  - `sql-injection-engine.ts` (regex SQL simulation)
  - `http-packet-engine.ts` (mock HTTP router)
  - `virtual-posix-engine.ts` (fake POSIX kernel)
  - `virtual-network-engine.ts` (fake network scanner)
  - `virtual-ad-kdc-engine.ts` (fake Active Directory KDC)

### Decision 3: Categorization of Non-Executable Content

- Content that cannot execute truthfully inside the browser sandbox is classified explicitly as:
  - **`telemetry-inspector`**: Interactive review and diffing of authentic configuration dumps, Sysmon logs, or PCAP streams via `@uiw/react-codemirror`.
  - **`decision-lab`**: Structured professional decision-making (ROE, scoping, trade-off evaluation) with zero command execution claims.

### Decision 4: Honest Competency & Progression Model

- Completion in the browser issues status `practice_completed` (Self-Paced Practice).
- Status `competency_verified` is strictly prohibited until an external container/VM attestation boundary exists.

---

## 4. Consequences & Migration Invariants

- **Positive:** Eliminates 100% of fake simulator code; restores technical truthfulness; curriculum passes rubric anti-rejection checks.
- **Negative:** Certain OS-level privilege escalation labs cannot run in browser and must be presented as configuration audit cases rather than live interactive shells.
- **Enforcement:** CI harnesses must fail with `exit 1` if any simulated regex or mock fallback is introduced.
