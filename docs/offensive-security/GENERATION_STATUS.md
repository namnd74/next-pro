# Offensive Security Curriculum Generation Status

Updated: 2026-08-27

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — **19 modules validated (57 lessons, 4,320 minutes);
  tracks `os00-ethics-authorization` (3/3), `os01-network-foundations` (4/4),
  `os02-linux-foundations` (3/3), `os03-windows-foundations` (3/3),
  `os04-operator-scripting` (3/3), and `os05-pentest-methodology` (3/3) fully validated (6 full tracks complete)**
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation), PR #5 (`os01-m02`), PR #6 (`os01-m03`), PR #7 (`os01-m04`),
  PR #9 (paired cycle 1: `os02-m01` + `os03-m01`), PR #10 (paired cycle 2: `os02-m02` + `os03-m02` & tree restructure),
  PR #11 (paired cycle 3: `os02-m03` + `os03-m03`), PR #12 (`os04-m01`..`m03`), PR #13 (`os05-m01`..`m03`)
  open for review; each new batch stacks on the previous branch.
- Batch policy: single module or paired modules per run by owner approval.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

**Track 05 Module 03** — `os05-m03-report-remediation-retest` (Technical reporting, remediation and retest, 240 minutes total) — **Completes Track 05**:

1. `os05-l40-technical-vulnerability-reporting-and-structure` (80 min) — Professional vulnerability reporting & finding structure:
   actionable finding anatomy (Identifier, Title, Severity, CVSS 3.1/4.0 vector string, CWE ID, Affected Assets),
   strategic executive summary drafting for board-level stakeholders, deterministic sanitized reproduction steps (curl/PoC),
   and two-stage QA peer review gates.

2. `os05-l41-root-cause-analysis-and-defense-in-depth-remediation` (80 min) — Root-cause remediation, defense-in-depth & strategic guidance:
   differentiating superficial blacklist regexes from architectural root-cause fixes (parameterized queries / PreparedStatements),
   application-level controls (output encoding, least privilege), infrastructure defense-in-depth (IMDSv2, egress filtering),
   and practical compensating control design for unpatchable legacy systems.

3. `os05-l42-remediation-verification-and-retesting-workflows` (80 min) — Remediation verification, retesting workflows & engagement closeout:
   focused verification retesting methodology, probing for filter bypasses and encoding loopholes (double-encoding, alternate tags),
   finding status matrix tracking (Remediated, Partially Remediated, Not Remediated, Risk Accepted),
   and drafting formal executive Letters of Attestation on corporate letterhead.

All three labs are browser-only decision simulations with fixed datasets. They accept no external
target, credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct per module.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the three lessons; automatic-rejection checklist clear. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

- `os05-m02-verification-impact-evidence` (270 min, 3 lessons): `os05-l37..l39`.
- `os05-m01-engagement-recon-enumeration` (240 min, 3 lessons): `os05-l34..l36`.
- `os04-m03-safe-evidence-automation` (300 min, 3 lessons): `os04-l31..l33`.
- `os04-m02-structured-data-http-git` (240 min, 3 lessons): `os04-l28..l30`.
- `os04-m01-bash-python-powershell` (300 min, 3 lessons): `os04-l25..l27`.

- **Paired cycle 3** — `os02-m03-linux-boundaries-and-telemetry` (300 min) +
  `os03-m03-endpoint-controls-and-events` (300 min): lessons `os02-l19..l21`, `os03-l22..l24`.
- **Paired cycle 2** — `os02-m02-processes-services-shell` (240 min) +
  `os03-m02-services-powershell-remote` (270 min): lessons `os02-l16..l18`, `os03-l19..l21`.
- **Paired cycle 1** — `os02-m01-files-identity-permissions` (180 min) +
  `os03-m01-architecture-identities-acls` (240 min): lessons `os02-l13..l15`, `os03-l16..l18`.
- `os01-m04-enterprise-protocols-and-packets` (240 min, 3 lessons):
  - `os01-l10-smb-ldap-enterprise-protocols`
  - `os01-l11-packet-capture-methodology`
  - `os01-l12-topology-reasoning-from-evidence`
- `os01-m03-dns-transport-and-tls` (240 min, 3 lessons):
  - `os01-l07-dns-resolution-and-dhcp-boundaries`
  - `os01-l08-tcp-udp-transport-state`
  - `os01-l09-http-tls-trust-boundaries`
- `os01-m02-link-routing-and-segmentation` (210 min, 3 lessons):
  - `os01-l04-ethernet-and-arp-trust-boundary`
  - `os01-l05-ip-routing-and-nat-boundaries`
  - `os01-l06-vlan-vpn-segmentation`
- `os01-m01-processes-data-and-addressing` (180 min, 3 lessons):
  - `os01-l01-process-memory-and-data-representation`
  - `os01-l02-ipv4-addressing-and-cidr-subnetting`
  - `os01-l03-ipv6-foundations-and-dual-stack-boundaries`
- `os00-m01-roles-and-boundaries` (90 min, 3 lessons):
  - `os00-l01-offensive-work-map`
  - `os00-l02-authority-before-capability`
  - `os00-l03-safe-harbor-decision`
- `os00-m02-rules-of-engagement` (120 min, 3 lessons):
  - `os00-l04-scoping-boundaries-and-dependencies`
  - `os00-l05-rules-of-engagement-and-stop-conditions`
  - `os00-l06-deconfliction-and-operational-logging`
- `os00-m03-evidence-and-disclosure` (120 min, 3 lessons):
  - `os00-l07-evidence-collection-and-chain-of-custody`
  - `os00-l08-sensitive-data-handling-and-redaction`
  - `os00-l09-coordinated-vulnerability-disclosure`

## Next eligible batch

Track 06: `os06-m01-discovery-services-authentication` (Discovery, common services and authentication weaknesses, 270 min) — depends on `os05-pentest-methodology` which is now fully validated.

## Tree restructure (owner-approved, pre-cycle 3)

The academy was flattened while bootstrapping (flat data dir, flat URLs, flat index list).
Owner approved full restructuring before cycle 3:

- Data layout: module JSONs now live under `data/academy/<track-id>/…` (e.g.
  `os02-linux-foundations/files-identity-permissions.json`). Future batches write directly
  into their track folder.
- URL scheme: `/offensive-security/academy/[trackSlug]/[moduleSlug]/{,[lessonSlug]}` with
  `trackSlug = track id` (e.g. `/academy/os00-ethics-authorization/roles-and-boundaries`).
  Flat academy URLs never shipped (all PRs still open), so no redirects are required.
- Index page groups modules by track with per-track lesson counts; link generation centralized
  in new `academy-tracks.ts` (`ACADEMY_TRACKS`, `groupAcademyModulesByTrack`,
  `academyModuleHref`, `academyLessonHref`).
- Content validator updated to walk `data/academy` recursively.
- Open follow-up (tracked below): derive `ACADEMY_TRACKS` from the manifest at build time and
  consider a Zod/JSON-Schema parser boundary as module count grows toward 64.

## Required decisions before content migration

- Extend the UI information architecture beyond the current module view with
  career paths, domains and ATT&CK navigation.
- Whether the runtime parser should later be replaced by a shared JSON Schema or Zod
  boundary as more academy modules are generated.
- Decide whether existing collection URLs remain a Web/Frontend Practice Range or are
  reorganized when the corresponding curriculum track is generated.
- Local lab packaging policy for containers and Windows/AD virtual machines.
- Progress model for evidence, hints, attempts, remediation tests, and competency.

## Legacy-data integration decision

- New academy data is the curriculum source of truth: prerequisites, outcomes,
  explanation, assessment, evidence and completion.
- Existing collections remain a Practice Range. A future academy lesson may reference
  a matching collection/mission as guided practice, assessment or remediation.
- References must be explicit and justified by matching outcomes; do not infer a match
  from similar keywords and do not copy the old content into the new JSON.
- Completing a legacy mission does not automatically complete an academy lesson. The
  academy assessment remains the competency gate.
- Modules `os01-m01`–`os01-m04` intentionally have no legacy reference: none of the current
  frontend-oriented missions teaches OS/network foundations at this depth.

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os06-m01-discovery-services-authentication`.
- `npm run validate:offensive-security-content`: passed — validated all nineteen modules
  `os00-m01`–`os00-m03`, `os01-m01`–`os01-m04`, `os02-m01`–`os02-m03`, `os03-m01`–`os03-m03`,
  `os04-m01`–`os04-m03`, and `os05-m01`–`os05-m03` (57 lessons, 4,320m).
- Quality rubric review: 22/22 self-assessed for each of the three lessons in this batch;
  no dimension scored zero.
- Authoritative sources: PTES Reporting Guidelines, OWASP Vulnerability Reporting Guidelines,
  NIST SP 800-53 Rev. 5, OWASP Proactive Controls, NIST SP 800-115 Section 6.
- CJK-leakage grep across all nineteen data files: clean (0 matches).
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- Production build: passed (215 static pages generated).
- `git diff --check`: passed.

Runtime integration: all 19 modules served from
`/offensive-security/academy/<track-id>/<module-slug>` plus 57 statically generated lesson
routes beneath them; index page renders the track → module tree via
`groupAcademyModulesByTrack`; routes derive automatically from `ACADEMY_MODULES`.
