# Offensive Security Curriculum Generation Status

Updated: 2026-08-26

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — 3 modules validated (9 lessons, 330 minutes) — Track 00 complete
- Existing Practice Range collections: preserved as auxiliary practice range

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os00-m03-evidence-and-disclosure` — Evidence, data handling and coordinated disclosure.

Generated three closely related lessons (120 minutes total):

- `os00-l07-evidence-collection-and-chain-of-custody` (40 min) — collect reproducible technical artifacts (raw HTTP request/response, command transcripts, PCAP), enforce cryptographic integrity with SHA-256 checksums, maintain Chain of Custody ledgers, and adhere to Minimum Viable PoC principles.
- `os00-l08-sensitive-data-handling-and-redaction` (40 min) — classify sensitive compliance data (PII, PCI-DSS, HIPAA, Credentials), execute solid-fill redaction and format-preserving masking, enforce full-disk and GPG end-to-end encryption, and conduct verifiable NIST SP 800-88 secure data purging.
- `os00-l09-coordinated-vulnerability-disclosure` (40 min) — operationalize ISO/IEC 29147 and CERT/CC Coordinated Vulnerability Disclosure (CVD) workflows, manage standard 90-day and emergency 7-day in-the-wild timelines, draft international Security Advisories with CVE/CWE/CVSS metadata, and resolve vendor non-responsiveness through trusted coordinators.

All labs are browser-only decision simulations. They accept no external target,
credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct.

## Previous validated batches

- `os00-m01-roles-and-boundaries` (90 min, 3 lessons):
  - `os00-l01-offensive-work-map`
  - `os00-l02-authority-before-capability`
  - `os00-l03-safe-harbor-decision`
- `os00-m02-rules-of-engagement` (120 min, 3 lessons):
  - `os00-l04-scoping-boundaries-and-dependencies`
  - `os00-l05-rules-of-engagement-and-stop-conditions`
  - `os00-l06-deconfliction-and-operational-logging`

## Next eligible batch

`os01-m01-processes-data-and-addressing` — Processes, data representation, IP addressing and subnetting.

Do not generate it in the current batch. It becomes eligible because
`os00-ethics-authorization` (and all its modules) is validated.

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
- Module `os00-m03` intentionally has no legacy reference because none of the current
  frontend-oriented missions teaches cryptographic chain of custody, data redaction standards, or coordinated vulnerability disclosure.

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os01-m01-processes-data-and-addressing`.
- `npm run validate:offensive-security-content`: passed — validated `os00-m01`, `os00-m02`, and `os00-m03` (9 lessons, 330m).
- Quality rubric review: 22/22 for each lesson in `os00-m03`; no dimension scored zero. The bounded
  decision labs provide reproducible evidence, governance sections cover prevention,
  observable records, response and residual risk, and each lesson ends with a new-context
  transfer challenge.
- Authoritative sources: NIST SP 800-115, NIST SP 800-88 Rev. 1, ISO/IEC 27037:2012, ISO/IEC 29147:2018, CERT/CC CVD Guide, PCI SSC standards.
- `npm run lint`: passed.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build -- --webpack`: passed.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/evidence-and-disclosure` plus 3 statically generated
lesson routes (`/evidence-collection-and-chain-of-custody`, `/sensitive-data-handling-and-redaction`, `/coordinated-vulnerability-disclosure`), persistent completion state, and Core Academy navigation.
