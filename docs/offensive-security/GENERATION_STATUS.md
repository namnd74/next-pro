# Offensive Security Curriculum Generation Status

Updated: 2026-08-25

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — **11 modules validated (33 lessons, 2,130 minutes);
  tracks `os01-network-foundations` fully validated (4/4); `os02-linux-foundations` and
  `os03-windows-foundations` at 2/3 modules each**
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation), PR #5 (`os01-m02`), PR #6 (`os01-m03`), PR #7 (`os01-m04`),
  PR #9 (paired cycle 1: `os02-m01` + `os03-m01`) open for review; each new batch stacks on the
  previous branch.
- Batch policy: raised to 2 modules / 6 lessons per run by owner approval (2026-08-25) to pair
  independent tracks; paired cycles 1 and 2 are complete.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

**Second paired cycle** — two independent modules generated in one run:

1. `os02-m02-processes-services-shell` — Linux runtime foundations (240 minutes total):
   - `os02-l16-processes-signals-and-procfs` (80 min) — process tree reasoning via PID/PPID,
     fork/exec env-inheritance risks, TERM/KILL/HUP evidence trade-offs, /proc forensics
     (cmdline, environ, exe-deleted masquerading, fd).
   - `os02-l17-systemd-units-and-journal` (80 min) — unit-file anatomy with drop-in overrides,
     sandbox directives (NoNewPrivileges, ProtectSystem, CapabilityBoundingSet, PrivateTmp),
     privileged-unit + writable-content privesc chain, journalctl multi-unit incident timeline.
   - `os02-l18-packages-cron-and-shell-env` (80 min) — dpkg -V verification decoding,
     wildcard-cron privesc triple (privileged job + wildcard + writable dir), PATH resolution
     across contexts (interactive vs cron), auth-log triage basics.

2. `os03-m02-services-powershell-remote` — Windows services & administration (270 minutes total):
   - `os03-l19-services-scm-and-path-security` (90 min) — SCM registry profiles (ImagePath/
     ObjectName/Start), unquoted-path interception mechanics, service SDDL decode with
     SERVICE_CHANGE_CONFIG privesc, recovery-option abuse patterns.
   - `os03-l20-scheduled-tasks-and-autoruns` (90 min) — task XML anatomy (trigger/action/principal
     incl. S4U), Run-key hive matrix + startup folders, edit-in-place persistence (event 4702),
     baseline-diff inventory methodology and detection mapping.
   - `os03-l21-powershell-logging-and-remote-admin` (90 min) — three logging layers (module/
     script-block 4104/transcription), execution-policy guard-vs-boundary framework, WinRM
     listener hardening, JEA role-capability design for least-privilege remote admin.

All six labs are browser-only decision simulations with fixed datasets. They accept no external
target, credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct per module.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the six lessons; automatic-rejection checklist clear. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

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

Third paired cycle: `os02-m03-linux-boundaries-and-telemetry` (Linux, 300 min) + `os03-m03-
endpoint-controls-and-events` (Windows, 300 min) — both eligible; completing either track's
foundation tier. Lesson numbering continues `os02-l22..l24`, `os03-l22..l24`.

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
  eligible module is `os02-m03-linux-boundaries-and-telemetry`.
- `npm run validate:offensive-security-content`: passed — validated all eleven modules
  `os00-m01`–`os00-m03`, `os01-m01`–`os01-m04`, `os02-m01`, `os02-m02`, `os03-m01`, `os03-m02`
  (33 lessons, 2,130m).
- Quality rubric review: 22/22 self-assessed for each of the six lessons in this batch;
  no dimension scored zero.
- Authoritative sources: Linux man-pages (proc/signal/systemd.exec/journalctl/crontab/dpkg),
  freedesktop.org systemd docs, GNU bash manual; Microsoft Learn services registry/SDDL,
  task-scheduler schema, audit events 4698/4702, Sysinternals Autoruns, PowerShell
  about_Logging_Windows/about_Execution_Policies, JEA overview.
- CJK-leakage grep across all eleven data files: clean after fixing one leak (`签名`) and one
  invalid escape sequence in `os03-m02`; stray-field regression (`reasonale`) caught pre-commit.
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- Production build: **deferred this cycle** per approved cadence (build every 2–3 batches); last
  full build passed at paired cycle 1 with 175 static pages. Next build due at cycle 3.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/processes-services-shell` and
`/offensive-security/academy/services-powershell-remote` plus 6 statically generated lesson
routes (`processes-signals-and-procfs`, `systemd-units-and-journal`, `packages-cron-and-shell-env`,
`services-scm-and-path-security`, `scheduled-tasks-and-autoruns`,
`powershell-logging-and-remote-admin`), persistent completion state, and Core Academy navigation
(routes derive automatically from `ACADEMY_MODULES`).
