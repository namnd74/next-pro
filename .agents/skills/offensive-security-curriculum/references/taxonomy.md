# Offensive Security Taxonomy

Use four independent axes. A lesson can carry multiple values on each axis.

## 1. Engagement and career paths

| ID                         | Meaning                                          | Typical outcome                               |
| -------------------------- | ------------------------------------------------ | --------------------------------------------- |
| `vulnerability-assessment` | Broad identification and prioritization          | Verified findings and remediation queue       |
| `penetration-test`         | Scoped exploitation to prove impact              | Technical report and retest                   |
| `red-team`                 | Objective-driven adversary simulation            | Detection/response and control assessment     |
| `adversary-emulation`      | Threat-informed reproduction of TTPs             | Repeatable emulation and telemetry evidence   |
| `bug-bounty`               | In-scope external vulnerability discovery        | Reproducible responsible-disclosure report    |
| `vulnerability-research`   | Discovery and root-cause analysis of novel flaws | Minimal PoC, advisory, coordinated disclosure |
| `exploit-development`      | Study of exploitability and mitigations          | Lab-only proof and mitigation analysis        |
| `malware-research`         | Analysis of malicious software behavior          | Behavioral report and detections              |
| `purple-team`              | Collaborative offensive/defensive validation     | Detection gaps and validated improvements     |
| `detection-engineering`    | Telemetry-to-analytic development                | Tested detection with known limitations       |

Red Teaming is not a synonym for every offensive activity. CISA/NICCS defines a red
team as an authorized group emulating adversary capabilities against an enterprise.

## 2. Attack surfaces

- `network`: addressing, routing, name resolution, protocols, segmentation, VPN,
  firewall, proxies, load balancers, traffic telemetry.
- `linux`: identities, permissions, processes, services, logs, packages, kernel and
  container boundaries.
- `windows`: security principals, ACLs, UAC, services, registry, PowerShell, event
  logs and remote administration.
- `active-directory`: LDAP, DNS, Kerberos, NTLM, domains, forests, trusts, GPO,
  delegation, AD CS and identity attack paths.
- `web`, `api`: browser/server trust, authentication, authorization, session,
  injection, business logic and protocol behavior.
- `cloud`: IAM, temporary credentials, control/data planes, storage, serverless and
  cloud telemetry.
- `container`, `kubernetes`: images, runtime, namespaces, workload identity, RBAC,
  admission, secrets and supply chain.
- `cicd`, `supply-chain`: source, build runners, dependencies, artifacts, signing,
  deployment and third-party code.
- `mobile`: Android/iOS packages, storage, IPC, deep links, WebView, signing and APIs.
- `wireless`: Wi-Fi, enterprise authentication, Bluetooth/BLE and radio boundaries.
- `iot`, `firmware`, `hardware`: update chains, boot, debug interfaces, embedded OS,
  device identity and physical trust.
- `ot-ics`: industrial protocols, safety constraints and operational availability.
- `ai-llm`: model interfaces, prompt/data boundaries, agents, tools, retrieval,
  supply chain and authorization.
- `human`, `physical`: social and physical controls, always under explicit rules of
  engagement.

## 3. Adversary lifecycle

Use current MITRE ATT&CK Enterprise tactic IDs where applicable:

- `TA0043` Reconnaissance
- `TA0042` Resource Development
- `TA0001` Initial Access
- `TA0002` Execution
- `TA0003` Persistence
- `TA0004` Privilege Escalation
- `TA0005` Stealth
- `TA0112` Defense Impairment
- `TA0006` Credential Access
- `TA0007` Discovery
- `TA0008` Lateral Movement
- `TA0009` Collection
- `TA0011` Command and Control
- `TA0010` Exfiltration
- `TA0040` Impact

ATT&CK describes observed behavior, not a beginner syllabus. Add tactic/technique IDs
only when the mapping is supported; do not invent IDs or force every lesson into ATT&CK.

## 4. Concepts, techniques, and artifacts

### Vulnerability language

- A bug is not automatically a security vulnerability.
- A vulnerability is an exploitable weakness with confidentiality, integrity, or
  availability impact.
- A zero-day describes disclosure/patch awareness at a point in time; it is not a
  career path or severity level.
- N-day research studies already disclosed or patched vulnerabilities.
- CWE classifies weakness patterns. CVE identifies disclosed vulnerabilities.
- CVSS communicates vulnerability severity characteristics; it is not business risk.
- A PoC proves a behavior. A weaponized exploit adds operational capability and risk.

### Capability families

- Reconnaissance and attack-surface management
- Enumeration and service analysis
- Authentication, authorization, and credential access
- Injection and unsafe interpretation
- Memory safety and exploitability
- Privilege escalation and lateral movement
- Persistence and defense evasion
- Collection, exfiltration, and impact
- Malware, loader, agent, and command-and-control architecture
- Availability abuse, application DoS, network DoS, DDoS, and botnet models
- Fuzzing, reverse engineering, patch diffing, and variant analysis
- Detection, incident response, hardening, and regression verification

## Classification examples

```text
JWT authorization bypass
  careers: bug-bounty, penetration-test
  surfaces: web, api
  lifecycle: Initial Access / Credential Access when evidence supports the mapping
  concepts: authorization, session, business logic

DDoS resilience exercise
  careers: red-team, purple-team
  surfaces: network, cloud
  lifecycle: Impact
  concepts: network DoS, distributed coordination, rate limiting, recovery

Browser engine zero-day research
  careers: vulnerability-research, exploit-development
  surfaces: web, operating-system
  concepts: fuzzing, memory safety, crash triage, disclosure
```
