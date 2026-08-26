# Offensive Security Curriculum Generation Status

Updated: 2026-08-26

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: verified
- Generation skill: active
- Curriculum validator: verified
- Full lesson migration/generation: in progress — 4 modules validated (12 lessons, 510 minutes)
- Existing Practice Range collections: preserved as auxiliary practice range

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os01-m01-processes-data-and-addressing` — Processes, data representation, IP addressing and subnetting.

Generated three closely related lessons (180 minutes total):

- `os01-l01-process-memory-and-data-representation` (60 min) — analyze OS process lifecycles, execution security context (UID/GID, SUID), virtual memory architecture (Text, Data, BSS, Heap, Stack), binary data representations (Hex, ASCII, Base64), and Endianness byte orders (Little-Endian vs Big-Endian Network Order).
- `os01-l02-ipv4-addressing-and-cidr-subnetting` (60 min) — decompose 32-bit IPv4 addresses, apply bitwise AND subnet masking, calculate Network ID, Broadcast ID, and usable host ranges from CIDR prefixes (/8 to /32), categorize special purpose ranges (RFC 1918 Private IP, APIPA 169.254.0.0/16, Loopback), and prevent out-of-scope scanning collisions.
- `os01-l03-ipv6-foundations-and-dual-stack-boundaries` (60 min) — master 128-bit IPv6 hexadecimal syntax and RFC 5952 compression rules, differentiate address scopes (Link-Local fe80::/10, ULA, Global Unicast), trace SLAAC autoconfiguration and ICMPv6 Neighbor Discovery (NDP), and mitigate Dual-Stack firewall asymmetry and IPv6 VPN Leakage vulnerabilities.

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
- `os00-m03-evidence-and-disclosure` (120 min, 3 lessons):
  - `os00-l07-evidence-collection-and-chain-of-custody`
  - `os00-l08-sensitive-data-handling-and-redaction`
  - `os00-l09-coordinated-vulnerability-disclosure`

## Next eligible batch

`os01-m02-link-routing-and-segmentation` — Ethernet, ARP, routing, NAT, VLAN and VPN.

Do not generate it in the current batch. It becomes eligible because
`os01-m01-processes-data-and-addressing` is validated.

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

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os01-m02-link-routing-and-segmentation`.
- `npm run validate:offensive-security-content`: passed — validated `os00-m01`, `os00-m02`, `os00-m03`, and `os01-m01` (12 lessons, 510m).
- Quality rubric review: 22/22 for each lesson in `os01-m01`; no dimension scored zero. The bounded
  decision labs provide reproducible evidence, governance sections cover prevention,
  observable records, response and residual risk, and each lesson ends with a new-context
  transfer challenge.
- Authoritative sources: CS:APP (Carnegie Mellon), Linux man-pages, RFC 791 (IPv4), RFC 4632 (CIDR), RFC 8200 (IPv6), RFC 5952 (IPv6 representation).
- `npm run lint`: passed.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build -- --webpack`: passed.
- `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/processes-data-and-addressing` plus 3 statically generated
lesson routes (`/process-memory-and-data-representation`, `/ipv4-addressing-and-cidr-subnetting`, `/ipv6-foundations-and-dual-stack-boundaries`), persistent completion state, and Core Academy navigation.
