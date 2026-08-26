# Offensive Security Curriculum Generation Status

Updated: 2026-08-25

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — 5 modules validated (15 lessons, 720 minutes)
- Existing Practice Range collections: preserved as auxiliary practice range
- Publishing state: validated foundation is open for review as PR #4
  (`feature/offensive-security-004` → `main`); batch os01-m02 stacks on a new branch.

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os01-m02-link-routing-and-segmentation` — Ethernet/ARP trust boundary, routing/NAT, VLAN/VPN segmentation.

Generated three closely related lessons (210 minutes total):

- `os01-l04-ethernet-and-arp-trust-boundary` (70 min) — Ethernet frame anatomy and switch MAC learning; ARP resolution lifecycle per RFC 826; ARP cache poisoning as an on-path position requirement inside one broadcast domain (ATT&CK T1557.002 / T1040, tactics TA0006/TA0009); defense via DHCP Snooping → static binding → Dynamic ARP Inspection with before/after telemetry verification.
- `os01-l05-ip-routing-and-nat-boundaries` (70 min) — longest-prefix-match route selection and default-gateway semantics; TTL/asymmetric-path reasoning; NAT/PAT translation state, idle timeout failure signature, end-to-end breakage (RFC 3022/4787); RFC 1918 overlap as an out-of-scope trap with stop-and-report handling.
- `os01-l06-vlan-vpn-segmentation` (70 min) — 802.1Q tagging, access/trunk ports and native-VLAN risk; double-tagging VLAN hopping conditions and root fixes (unused native VLAN, DTP off); inter-VLAN routing ACLs with two-way positive/negative verification; IPsec VPN tunnel boundaries (NIST SP 800-77), split-tunnel DNS/IPv6 leak detection and remediation.

All labs are browser-only decision simulations with fixed datasets. They accept no external target,
credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct.

Quality rubric review (generation-agent self-assessment against `references/quality-rubric.md`):
22/22 for each of the three lessons; automatic-rejection checklist clear — no arbitrary targets or
credentials, mitigations are verified against the demonstrated failure (DAI drop log case, split-tunnel
telemetry case), simulation output is never presented as real network proof. Independent re-review
before `published` status remains pending, as for all batches.

## Previous validated batches

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

`os01-m03-dns-transport-and-tls` — DNS, TCP, UDP, HTTP and TLS.

Do not generate it in the current batch. It becomes eligible because
`os01-m02-link-routing-and-segmentation` is validated (confirmed by the curriculum validator).

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
- Module `os01-m01` intentionally has no legacy reference because none of the current
  frontend-oriented missions teaches process memory layouts, IPv4 CIDR bitmath, or IPv6 dual-stack firewall boundaries.
- Module `os01-m02` intentionally has no legacy reference: no existing collection teaches
  L2 trust boundaries, NAT state behavior, or segmentation verification.

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os01-m03-dns-transport-and-tls`.
- `npm run validate:offensive-security-content`: passed — validated `os00-m01`, `os00-m02`, `os00-m03`,
  `os01-m01`, and `os01-m02` (15 lessons, 720m).
- Quality rubric review: 22/22 self-assessed for each lesson in `os01-m02`; no dimension scored zero;
  bounded decision labs provide reproducible evidence, governance covers prevention, observable records,
  response and residual risk, each lesson ends with a new-context transfer challenge.
- Authoritative sources: RFC 826 (ARP), MITRE ATT&CK T1557.002/T1040, Cisco DAI/DHCP Snooping guide,
  RFC 3022 (NAT), RFC 4787 (UDP NAT behavior), RFC 1918 (private space),
  IEEE 802.1Q-2022 (VLAN), NIST SP 800-77 Rev.1 (IPsec), RFC 4026 (VPN terminology).
- `npm run lint`: passed.
- `npm run typecheck` (`tsc --noEmit`): passed.
- `npm run build -- --webpack`: passed — 159 static pages; new module and lesson routes prerendered.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/link-routing-and-segmentation` plus 3 statically generated
lesson routes (`/ethernet-and-arp-trust-boundary`, `/ip-routing-and-nat-boundaries`, `/vlan-vpn-segmentation`),
persistent completion state, and Core Academy navigation (routes derive automatically from `ACADEMY_MODULES`).
