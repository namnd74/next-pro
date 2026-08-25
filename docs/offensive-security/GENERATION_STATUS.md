# Offensive Security Curriculum Generation Status

Updated: 2026-08-26

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — 2 modules validated (6 lessons, 210 minutes)
- Existing Practice Range collections: preserved as auxiliary practice range

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os00-m02-rules-of-engagement` — Scope, Rules of Engagement and deconfliction.

Generated three closely related lessons (120 minutes total):

- `os00-l04-scoping-boundaries-and-dependencies` (40 min) — translate authority into explicit in-scope/out-of-scope boundaries, analyze third-party shared responsibility (Cloud, SaaS, MSP), prevent scope creep via formal change requests, and verify asset ownership.
- `os00-l05-rules-of-engagement-and-stop-conditions` (40 min) — construct a comprehensive Rules of Engagement contract (testing windows, communication matrix, sensitive data limits, prohibited actions), define operational stop thresholds, and execute emergency stop containment.
- `os00-l06-deconfliction-and-operational-logging` (40 min) — operationalize deconfliction protocols between Operator, White Team (Trusted Agents), SOC/Blue Team, and Asset Owners; maintain UTC timestamped activity logs with payload hashes; handle real-time Match vs No-Match live incident escalation.

All labs are browser-only decision simulations. They accept no external target,
credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct.

## Previous validated batches

- `os00-m01-roles-and-boundaries` (90 min, 3 lessons):
  - `os00-l01-offensive-work-map`
  - `os00-l02-authority-before-capability`
  - `os00-l03-safe-harbor-decision`

## Next eligible batch

`os00-m03-evidence-and-disclosure` — Evidence, data handling and coordinated disclosure.

Do not generate it in the current batch. It becomes eligible because
`os00-m02-rules-of-engagement` is validated.

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
- Module `os00-m02` intentionally has no legacy reference because none of the current
  frontend-oriented missions teaches scope boundaries, Rules of Engagement, emergency stop conditions, or SOC deconfliction.

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os00-m03-evidence-and-disclosure`.
- `npm run validate:offensive-security-content`: passed — validated `os00-m01-roles-and-boundaries` (3 lessons, 90m) and `os00-m02-rules-of-engagement` (3 lessons, 120m).
- Quality rubric review: 22/22 for each lesson in `os00-m02`; no dimension scored zero. The bounded
  decision labs provide reproducible evidence, governance sections cover prevention,
  observable records, response and residual risk, and each lesson ends with a new-context
  transfer challenge.
- Authoritative sources: NIST SP 800-115, CISA / NICCS, SANS Institute, NSA guidelines mapped directly to claims.
- `npm run lint`: passed.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build -- --webpack`: passed.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/rules-of-engagement` plus 3 statically generated
lesson routes (`/scoping-boundaries-and-dependencies`, `/rules-of-engagement-and-stop-conditions`, `/deconfliction-and-operational-logging`), persistent completion state, and Core Academy navigation.
