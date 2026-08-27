# Offensive Security Curriculum Generation Status

Updated: 2026-08-27

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — **27 modules validated (81 lessons, 7,380 minutes);
  tracks `os00-ethics-authorization` (3/3), `os01-network-foundations` (4/4),
  `os02-linux-foundations` (3/3), `os03-windows-foundations` (3/3),
  `os04-operator-scripting` (3/3), `os05-pentest-methodology` (3/3),
  `os06-network-infrastructure` (3/3), and `os07-web-api-bug-bounty` (5/5)
  fully validated (8 full tracks complete)**
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation), PR #5 (`os01-m02`), PR #6 (`os01-m03`), PR #7 (`os01-m04`),
  PR #9 (paired cycle 1: `os02-m01` + `os03-m01`), PR #10 (paired cycle 2: `os02-m02` + `os03-m02` & tree restructure),
  PR #11 (paired cycle 3: `os02-m03` + `os03-m03`), PR #12 (`os04-m01`..`m03`), PR #13 (`os05-m01`..`m03`),
  PR #14 (`os06-m01`..`m03`), PR #15 (`os07-m01`..`m05`) open for review; each new batch stacks on the previous branch.
- Batch policy: single module, paired modules, or full track per run by owner approval.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

**Track 07 Full Track** — `os07-web-api-bug-bounty` (Web, API & Bug Bounty, 5 modules, 1,920 minutes total) — **Completes Track 07**:

1. **`os07-m01-browser-http-auth-session`** (300 min, 3 lessons):
   - `os07-l52-browser-security-model-and-http-semantics` (100 min) — Same-Origin Policy (SOP) tuple evaluation, DOM isolation, HTTP semantics, and CSP/HSTS headers.
   - `os07-l53-authentication-mechanisms-and-password-storage` (100 min) — Memory-hard password hashing (Argon2id/bcrypt), constant-time comparisons, TOTP replay protection, and WebAuthn/FIDO2 phishing resistance.
   - `os07-l54-session-management-cookies-and-token-lifecycles` (100 min) — Cookie security flags (`HttpOnly`, `Secure`, `SameSite`), session fixation mitigation via session regeneration, and server-side termination.

2. **`os07-m02-access-control-and-injection`** (420 min, 3 lessons):
   - `os07-l55-broken-object-level-and-function-authorization` (140 min) — API BOLA/IDOR record parameter manipulation, BOPLA mass-assignment privilege escalation, and database tenant ownership enforcement.
   - `os07-l56-cross-site-scripting-and-context-encoding` (140 min) — Reflected, Stored, and DOM XSS sinks, context-aware output encoding (HTML, Attribute, JS contexts), and CSP Level 3 strict nonces.
   - `os07-l57-sql-nosql-command-and-template-injection` (140 min) — In-band/blind time-based SQLi parameterization, MongoDB `$ne` operator injection, and Jinja2 SSTI remote code execution.

3. **`os07-m03-browser-cross-origin-and-files`** (360 min, 3 lessons):
   - `os07-l58-cors-misconfigurations-and-csrf-defenses` (120 min) — CORS arbitrary origin reflection with credentials, Synchronizer Anti-CSRF tokens, and SameSite cookie defenses.
   - `os07-l59-server-side-request-forgery-and-cloud-metadata` (120 min) — SSRF filter bypasses (decimal IPs, DNS rebinding), AWS IMDSv1 vs IMDSv2 IAM token extraction, and post-DNS resolution IP whitelisting.
   - `os07-l60-file-upload-vulnerabilities-and-path-traversal` (120 min) — Unrestricted file upload web shell execution, SVG XML stored XSS sanitization, and canonical path traversal verification.

4. **`os07-m04-modern-api-and-business-logic`** (480 min, 3 lessons):
   - `os07-l61-oauth2-flows-and-jwt-security-mechanics` (160 min) — OAuth 2.0 Authorization Code + PKCE, loose redirect_uri poisoning, JWT `alg: none` stripping, and RS256/HS256 key confusion.
   - `os07-l62-graphql-introspection-and-websocket-security` (160 min) — GraphQL production introspection disabling, circular query depth limiting, and Cross-Site WebSocket Hijacking (CSWSH) Origin validation.
   - `os07-l63-race-conditions-and-business-logic-flaws` (160 min) — Limit-overrun concurrency race conditions, multi-step workflow state skipping, and atomic SQL row locking (`SELECT FOR UPDATE`).

5. **`os07-m05-bounty-recon-report-disclosure`** (360 min, 3 lessons):
   - `os07-l64-bug-bounty-reconnaissance-and-asset-mapping` (120 min) — Certificate Transparency subdomain enumeration, unpacked JavaScript sourcemap route harvesting, and program scope hygiene.
   - `os07-l65-vulnerability-triage-and-cvss-v4-impact` (120 min) — Distinguishing theoretical vs impactful findings, CVSS v3.1 and CVSS v4.0 calculation, and two-account reproduction curl commands.
   - `os07-l66-responsible-disclosure-and-platform-etiquette` (120 min) — ISO/IEC 29147 Coordinated Vulnerability Disclosure (CVD), Gold Standard Safe Harbor compliance, mediation, and coordinated public disclosure writeups.

All fifteen labs are browser-only decision simulations with fixed datasets. They accept no external
target, credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct per module.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the fifteen lessons; automatic-rejection checklist clear. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

- `os06-m01`..`m03` (1,140 min, 9 lessons): `os06-l43..l51`.
- `os04-m01`..`m03` (840 min, 9 lessons): `os04-l25..l33`.
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

Track 08: `os08-m01-ad-architecture-protocols` (Domains, forests, DNS, LDAP, Kerberos and NTLM, 300 min) — depends on `os06-network-infrastructure` and `os07-web-api-bug-bounty` which are now fully validated.

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
  eligible module is `os08-m01-ad-architecture-protocols`.
- `npm run validate:offensive-security-content`: passed — validated all twenty-seven modules
  `os00-m01`–`os00-m03`, `os01-m01`–`os01-m04`, `os02-m01`–`os02-m03`, `os03-m01`–`os03-m03`,
  `os04-m01`–`os04-m03`, `os05-m01`–`os05-m03`, `os06-m01`–`os06-m03`, and `os07-m01`–`os07-m05`
  (81 lessons, 7,380m).
- Quality rubric review: 22/22 self-assessed for each of the fifteen lessons in this batch;
  no dimension scored zero.
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
