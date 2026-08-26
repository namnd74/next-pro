# Offensive Security Curriculum Generation Status

Updated: 2026-08-25

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — 6 modules validated (18 lessons, 960 minutes)
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: PR #4 (foundation, `feature/offensive-security-004` → `main`) and
  PR #5 (`os01-m02`, stacked) open for review; each new batch stacks on the previous branch.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os01-m03-dns-transport-and-tls` — DNS/DHCP trust boundaries, TCP/UDP transport state, HTTP/TLS.

Generated three closely related lessons (240 minutes total):

- `os01-l07-dns-resolution-and-dhcp-boundaries` (80 min) — hierarchical resolution and TTL semantics per RFC 1034/1035; cache poisoning entropy (TXID × port) and DNS tunneling detection via NXDOMAIN/label-pattern baselines; DHCP DORA and rogue-server takeover conditions; defense ordering: DHCP Snooping+DAI → egress filtering → DNSSEC validation → managed DoH (NIST SP 800-81 Rev.2).
- `os01-l08-tcp-udp-transport-state` (80 min) — three-way handshake and connection states per RFC 9293; sliding window/retransmit diagnosis patterns; UDP as stateless transport with stateful middleware (RFC 768); SYN flood mechanics against half-open backlog and mitigations per RFC 4987; authorized scan result interpretation (open/closed/filtered) with out-of-scope stop-and-report.
- `os01-l09-http-tls-trust-boundaries` (80 min) — HTTP semantics and cookie attributes (Secure/HttpOnly/SameSite) per RFC 9110; TLS 1.3 handshake, certificate chain to CA anchors and anti-downgrade signaling (RFC 8446); mixed content/HSTS gaps (RFC 6797); evidence-driven config audit checklist with pass/fail criteria.

All labs are browser-only decision simulations with fixed datasets. They accept no external target,
credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the three lessons; automatic-rejection checklist clear — no arbitrary targets or
credentials, mitigations verified against demonstrated failures (resolver log case, handshake telemetry
case, cookie/header audit case), simulation output never presented as real protocol proof. Independent
re-review before `published` status remains pending, as for all batches.

## Previous validated batches

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

`os01-m04-enterprise-protocols-and-packets` — Enterprise protocols, packet capture and topology reasoning.

Do not generate it in the current batch. It becomes eligible because
`os01-m03-dns-transport-and-tls` is validated (confirmed by the curriculum validator).

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
- Modules `os01-m01`, `os01-m02`, and `os01-m03` intentionally have no legacy reference:
  none of the current frontend-oriented missions teaches process memory/subnetting,
  L2/NAT/segmentation boundaries, or DNS/TCP/TLS trust mechanisms at this depth.

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os01-m04-enterprise-protocols-and-packets`.
- `npm run validate:offensive-security-content`: passed — validated `os00-m01`, `os00-m02`, `os00-m03`,
  `os01-m01`, `os01-m02`, and `os01-m03` (18 lessons, 960m).
- Quality rubric review: 22/22 self-assessed for each lesson in `os01-m03`; no dimension scored zero;
  assessments test recall/diagnosis/transfer; every lab requires observable evidence beyond clicking.
- Authoritative sources: RFC 1034/1035 (DNS), RFC 2131 (DHCP), NIST SP 800-81 Rev.2 (secure DNS),
  RFC 9293 (TCP), RFC 768 (UDP), RFC 4987 (SYN flooding), RFC 9110 (HTTP semantics),
  RFC 8446 (TLS 1.3), RFC 6797 (HSTS); MITRE ATT&CK T1590.002/T1046 mapping kept conservative.
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- `npm run build -- --webpack`: passed — 163 static pages; new module and lesson routes prerendered.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/dns-transport-and-tls` plus 3 statically generated
lesson routes (`/dns-resolution-and-dhcp-boundaries`, `/tcp-udp-transport-state`,
`/http-tls-trust-boundaries`), persistent completion state, and Core Academy navigation
(routes derive automatically from `ACADEMY_MODULES`).
