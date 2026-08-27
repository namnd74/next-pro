# Offensive Security Curriculum Generation Status

Updated: 2026-08-25

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — **13 modules validated (39 lessons, 2,730 minutes);
  tracks `os00-ethics-authorization` (3/3), `os01-network-foundations` (4/4),
  `os02-linux-foundations` (3/3), and `os03-windows-foundations` (3/3) fully validated**
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation), PR #5 (`os01-m02`), PR #6 (`os01-m03`), PR #7 (`os01-m04`),
  PR #9 (paired cycle 1: `os02-m01` + `os03-m01`), PR #10 (paired cycle 2: `os02-m02` + `os03-m02` & tree restructure)
  open for review; each new batch stacks on the previous branch.
- Batch policy: raised to 2 modules / 6 lessons per run by owner approval (2026-08-25) to pair
  independent tracks; paired cycles 1, 2, and 3 are complete.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

**Third paired cycle** — two independent modules generated in one run:

1. `os02-m03-linux-boundaries-and-telemetry` — Linux privilege boundaries, containers & telemetry (300 minutes total):
   - `os02-l19-linux-capabilities-and-suid-privesc` (100 min) — POSIX capabilities decomposition vs SUID all-or-nothing root,
     5 capability sets (Permitted, Effective, Inheritable, Bounding, Ambient), dangerous capabilities (CAP_SETUID, CAP_DAC_OVERRIDE,
     CAP_SYS_ADMIN, CAP_SYS_PTRACE), prctl PR_SET_NO_NEW_PRIVS and systemd CapabilityBoundingSet hardening.
   - `os02-l20-namespaces-cgroups-container-boundaries` (100 min) — 7 Linux Namespaces (PID, MNT, NET, IPC, UTS, USER, CGROUP) and
     Cgroups v1/v2, chroot vs pivot_root boundary mechanics, container escape vectors (--privileged, docker.sock mount, cgroups release_agent),
     defense-in-depth via User Namespaces mapping, Seccomp profiles, and rootless containers.
   - `os02-l21-auditd-ebpf-and-host-telemetry` (100 min) — Linux Audit Subsystem architecture (kauditd, Netlink socket, auditd daemon),
     immutable auid (Login UID) forensics tracing across sudo/su transitions, audit rule design (-w file watch, -a always,exit -S execve),
     ausearch/aureport query analysis, and eBPF in-kernel telemetry vs auditd performance trade-offs.

2. `os03-m03-endpoint-controls-and-events` — Windows endpoint controls, firewall & event telemetry (300 minutes total):
   - `os03-l22-defender-av-edr-and-amsi` (100 min) — Multi-layered Defender AV/EDR engine (WdFilter.sys mini-filter, emulation sandbox,
     MAPS cloud protection), AMSI in-memory script buffer interception (AmsiScanBuffer) for obfuscated PowerShell/.NET, Attack Surface
     Reduction (ASR) rules, and safe testing patterns under Safe Harbor.
   - `os03-l23-windows-firewall-and-network-boundaries` (100 min) — Windows Filtering Platform (WFP) kernel architecture and Base Filtering
     Engine (BFE), 3 Network Profiles (Domain, Private, Public), rule evaluation precedence (IPsec bypass > Block rules > Allow rules > Default action),
     and Workstation-to-Workstation SMB/RPC lateral movement isolation policies.
   - `os03-l24-security-event-log-and-sysmon-telemetry` (100 min) — Windows Event Log EVTX binary XML architecture, Advanced Audit Policy
     golden events (Event 4688 with CommandLine, Event 4624 LogonTypes, Event 4672, Event 7045), Sysmon telemetry (Event ID 1 process create with
     SHA256, Event ID 3 network, Event ID 10 LSASS process access), Windows Event Forwarding (WEF), and anti-tamper detection (Event 1102).

All six labs are browser-only decision simulations with fixed datasets. They accept no external
target, credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct per module.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the six lessons; automatic-rejection checklist clear. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

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

Track 04: `os04-m01-bash-python-powershell` (Operator Scripting & Data Handling, 300 min) — depends on
both `os02-linux-foundations` and `os03-windows-foundations` which are now both fully validated.

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
  eligible module is `os04-m01-bash-python-powershell`.
- `npm run validate:offensive-security-content`: passed — validated all thirteen modules
  `os00-m01`–`os00-m03`, `os01-m01`–`os01-m04`, `os02-m01`–`os02-m03`, `os03-m01`–`os03-m03`
  (39 lessons, 2,730m).
- Quality rubric review: 22/22 self-assessed for each of the six lessons in this batch;
  no dimension scored zero.
- Authoritative sources: Linux man-pages (capabilities(7), prctl(2), namespaces(7), cgroups(7),
  auditd(8), auditctl(8)), NIST SP 800-190, Docker security documentation, Cilium eBPF reference;
  Microsoft Learn (Defender Antivirus, AMSI architecture, ASR rules, Windows Firewall / WFP,
  Sysinternals Sysmon, Advanced Security Audit Policy, Windows Event Forwarding).
- CJK-leakage grep across all thirteen data files: clean (0 matches).
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- Production build: passed.
- `git diff --check`: passed.

Runtime integration: all 13 modules served from
`/offensive-security/academy/<track-id>/<module-slug>` plus 39 statically generated lesson
routes beneath them; index page renders the track → module tree via
`groupAcademyModulesByTrack`; routes derive automatically from `ACADEMY_MODULES`.
