# Offensive Security Curriculum Generation Status

Updated: 2026-08-25

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — **7 modules validated (21 lessons, 1,200 minutes);
  track `os01-network-foundations` fully validated (4/4 modules)**
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation), PR #5 (`os01-m02`), PR #6 (`os01-m03`) open for review;
  each new batch stacks on the previous branch.
- Batch policy: raised to 2 modules / 6 lessons per run by owner approval (2026-08-25) to pair
  independent tracks; `os02-m01` and `os03-m01` are now both eligible and form the first pair.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os01-m04-enterprise-protocols-and-packets` — SMB/LDAP enterprise protocols, packet capture methodology, topology reasoning.

Generated three closely related lessons (240 minutes total):

- `os01-l10-smb-ldap-enterprise-protocols` (80 min) — SMB negotiate/session/tree-connect flow per MS-SMB2; signing-required vs enabled downgrade gap and NTLM relay conditions; LDAP bind levels (anonymous/simple/SASL) per RFC 4511 with enumeration exposure analysis; remediation ordering with audit-first enforcement of LDAP signing/channel binding.
- `os01-l11-packet-capture-methodology` (80 min) — capture point selection and asymmetric two-ended capture; BPF filtering economics and ring-buffer sizing; beacon pattern and plaintext-credential detection from pcap summaries; evidence hygiene (hash, redact, rotate, chain-of-custody) per NIST SP 800-115 principles.
- `os01-l12-topology-reasoning-from-evidence` (80 min) — passive sources first (ARP cache, routing table, TTL heuristics per RFC 1122 assumptions); intrusion-scale discovery ladder (passive → light-active → deep) with rate limits; out-of-scope route observations handled stop-and-report; traceable network-map artifact schema with confidence values.

All labs are browser-only decision simulations with fixed datasets. They accept no external target,
credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the three lessons; automatic-rejection checklist clear. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

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

**First paired cycle:** `os02-m01-files-identity-permissions` + `os03-m01-architecture-identities-acls`
(both depend only on the now-validated `os01-m04`). Generate both in one run under the new
batch policy; keep them independent files and validate each module separately.

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
  eligible module is `os02-m01-files-identity-permissions`.
- `npm run validate:offensive-security-content`: passed — validated all seven modules
  `os00-m01`, `os00-m02`, `os00-m03`, `os01-m01`, `os01-m02`, `os01-m03`, `os01-m04`
  (21 lessons, 1200m).
- Quality rubric review: 22/22 self-assessed for each lesson in `os01-m04`; no dimension scored zero.
- Authoritative sources: MS-SMB2 open specification, RFC 4511 (LDAP), Microsoft LDAP signing guidance,
  Wireshark official docs, tcpdump/libpcap BPF man pages, NIST SP 800-115, RFC 1122 (host requirements).
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- Production build: **deferred this cycle** per accelerated cadence approved by owner (build runs every
  2–3 batches); typecheck + both validators green. Last full build (163 pages) passed at `os01-m03`.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/enterprise-protocols-and-packets` plus 3 statically generated
lesson routes (`/smb-ldap-enterprise-protocols`, `/packet-capture-methodology`,
`/topology-reasoning-from-evidence`), persistent completion state, and Core Academy navigation
(routes derive automatically from `ACADEMY_MODULES`).
