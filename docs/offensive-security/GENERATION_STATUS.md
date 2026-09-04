# Offensive Security Curriculum Generation Status

Updated: 2026-09-04

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted & validated across 19 tracks / 64 modules
- Machine-readable manifest: verified
- Restructuring status: **Plan v4 Draft (Pending Independent Sign-Off / ADR-001 Standards)**
- Lesson catalog status: **52 modules / 156 lessons on disk** (all cataloged as **`unverified`** pending external runtime backend certification).
  - Historical "22/22 validated" self-assessments remain revoked per Rule 2.4.
  - 3 Vertical Slices certified with authentic execution and signed receipts: `VS-01` (`os00-l05`), `VS-02` (`os07-l57`), `VS-03` (`os02-l15` with host-posix-fixture evidence parity and unverified Linux boundary).
  - Validation requires an explicit `CompetencyContract`, real runtime/evidence check, remediation replay, and zero manifest drift.

## Curriculum Generation History (Tracks 00–15)

Tracks 00 through 14 are authored on disk (51 modules / 153 lessons). Track 15 Module 1 (`os15-m01-malware-behavior-analysis`) is authored (3 lessons). Total on disk: 52 modules / 156 lessons.

- All 156 lessons adhere strictly to ADR-001 JSON schema (>=4 sections, >=3 misconceptions, 3 Decision Lab cases, 3 quiz questions).
- All 156 lessons are strictly **`unverified`** until full runtime backends are attached.
- No further curriculum generation is authorized under AUDIT-REMEDIATION-04.

## Governance Policy: Plan v4 Draft & Unverified Boundary (F-06)

Per Audit Finding F-06, Plan v4 remains cataloged as `DRAFT / PENDING INDEPENDENT SIGN-OFF`. All 156 authored lessons remain classified as `unverified` pending independent verification against authentic external execution backends. No lessons are promoted based solely on schema validation or the 3 vertical slices.

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

- `npm run validate:offensive-security-curriculum`: Foundation tracks 00-07 cataloged; expansion tracks 08-18 strictly frozen.
- `npm run validate:offensive-security-content`: Structural sanity passed across 27 modules (81 lessons) in draft/unverified status.
- Quality rubric review: Historical self-assessments revoked; awaiting revalidation under Plan v3.1.
- Authoritative sources: MDN Web Docs (SOP, Cookies), OWASP Foundation (Password Storage, Session Management,
  API Security Top 10, XSS Prevention, Injection, CSRF Prevention, SSRF Prevention, File Upload, JWT),
  W3C (WebAuthn Level 3, CSP Level 3, CORS), IETF RFCs (6238, 6265bis, 6749, 7519, 7636, 6455, 6962),
  FIRST (CVSS v4.0), Bugcrowd (VRT), ISO/IEC (29147, 30111), Disclose.io (Safe Harbor).
- CJK-leakage grep across all twenty-seven data files: clean (0 matches).
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- Production build: passed (247 static pages generated).
- `git diff --check`: passed.

Runtime integration: all 27 modules served from
`/offensive-security/academy/<track-id>/<module-slug>` plus 81 statically generated lesson
routes beneath them; index page renders the track → module tree via
`groupAcademyModulesByTrack`; routes derive automatically from `ACADEMY_MODULES`.
