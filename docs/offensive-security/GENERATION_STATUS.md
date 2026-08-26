# Offensive Security Curriculum Generation Status

Updated: 2026-08-25

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — **9 modules validated (27 lessons, 1,620 minutes);
  tracks `os01-network-foundations` fully validated (4/4); `os02-linux-foundations` and
  `os03-windows-foundations` each started with their first module**
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation), PR #5 (`os01-m02`), PR #6 (`os01-m03`), PR #7 (`os01-m04`) open
  for review; each new batch stacks on the previous branch.
- Batch policy: raised to 2 modules / 6 lessons per run by owner approval (2026-08-25) to pair
  independent tracks; the first pair (`os02-m01` + `os03-m01`) is complete.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

**First paired cycle** — two independent modules generated in one run:

1. `os02-m01-files-identity-permissions` — Linux filesystem/identity/permission foundations
   (180 minutes total):
   - `os02-l13-filesystem-hierarchy-and-file-types` (60 min) — FHS roles, inode vs name model,
     five file types, symlink-race (TOCTOU) mechanics on `/tmp`, O_EXCL/O_NOFOLLOW and
     `fs.protected_symlinks` mitigations.
   - `os02-l14-users-groups-and-identity-boundaries` (60 min) — UID/GID numeric identity,
     passwd/shadow/group field reading, su-vs-sudo authorization models, sudoers escape review
     (vim/find), least-privilege service account design, 30-second identity audit checklist.
   - `os02-l15-permission-bits-and-special-modes` (60 min) — permission ring selection semantics,
     umask computation order (requested mode → create → app chmod override), SUID/SGID/sticky
     mechanics, SUID inventory audit with whitelist remediation ordering.

2. `os03-m01-architecture-identities-acls` — Windows architecture/identity foundations
   (240 minutes total):
   - `os03-l16-windows-architecture-and-principals` (80 min) — user/kernel mode split, SID
     structure decoding with well-known RIDs (500/501/S-1-5-18), SAM vs AD databases,
     LocalSystem/LocalService/NetworkService privilege ranges.
   - `os03-l17-access-tokens-and-uac` (80 min) — access token contents (SIDs, privileges,
     integrity level), UAC filtered-token split with deny-only marks, consent prompt levels,
     token-minimization principle for service accounts.
   - `os03-l18-acls-and-permission-evaluation` (80 min) — security descriptor anatomy
     (owner/DACL/SACL), first-match-wins ACE evaluation with canonical order, NULL-DACL vs
     empty-DACL semantics, registry service-key SetValue privesc chain, SACL audit design.

All six labs are browser-only decision simulations with fixed datasets. They accept no external
target, credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct per module.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the six lessons; automatic-rejection checklist clear. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

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

Second paired cycle: `os02-m02-processes-services-shell` (Linux, 240 min) + `os03-m02-services-
powershell-remote` (Windows, 270 min) — both now eligible after their respective first modules
validated; continue per-track lesson numbering (`os02-l16..l18`, `os03-l19..l21`).

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
  eligible module is `os02-m02-processes-services-shell`.
- `npm run validate:offensive-security-content`: passed — validated all nine modules
  `os00-m01`, `os00-m02`, `os00-m03`, `os01-m01`, `os01-m02`, `os01-m03`, `os01-m04`,
  `os02-m01`, `os03-m01` (27 lessons, 1,620m).
- Quality rubric review: 22/22 self-assessed for each of the six lessons in this batch;
  no dimension scored zero.
- Authoritative sources: FHS 3.0 standard, Linux man-pages (inode/symlink/passwd/umask/capabilities),
  kernel sysctl fs docs, NIST SP 800-123, sudo sudoers(5) manual; Microsoft Learn SID/security
  principals/access tokens/UAC/ACL canonical-order documentation.
- CJK-leakage grep across all nine data files: clean after fixing one leak in `os03-m01`.
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- Production build: **passed** — 175 static pages including all 9 academy module routes and
  27 lesson routes (previous build at `os01-m03` had 163 pages).
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/files-identity-permissions` and
`/offensive-security/academy/windows-architecture-identities-acls` plus 6 statically generated
lesson routes (`filesystem-hierarchy-and-file-types`, `users-groups-and-identity-boundaries`,
`permission-bits-and-special-modes`, `windows-architecture-and-principals`,
`access-tokens-and-uac`, `acls-and-permission-evaluation`), persistent completion state, and Core
Academy navigation (routes derive automatically from `ACADEMY_MODULES`).
