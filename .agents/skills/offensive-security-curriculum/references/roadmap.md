# Offensive Security Academy Roadmap

This roadmap has a shared core and specialization branches. It is not a single list
of tools or attack names. Learners may branch after completing the core, then return
for enterprise adversary emulation and capstone work.

## Progression model

```text
Core foundations
  -> professional assessment core
    -> surface specialization(s)
      -> adversary emulation / purple team
        -> enterprise capstone
```

## Core foundation tracks

### 00. Ethics, authorization, and Rules of Engagement

Outcomes: distinguish assessment types; define scope, authorization, evidence
handling, deconfliction, emergency stop, cleanup, disclosure, and reporting duties.

Modules: offensive-security roles; legal/ethical boundaries; scoping and ROE;
evidence/data handling; coordinated disclosure.

### 01. Computing and networking foundations

Outcomes: trace a packet and explain protocol, routing, name resolution, encryption,
segmentation, and service exposure before using an enumeration tool.

Modules: data representation and processes; TCP/IP and subnetting; Ethernet/ARP;
routing/NAT/VLAN/VPN; DNS/DHCP; TCP/UDP; HTTP/TLS; common enterprise protocols;
packet capture and topology reasoning.

### 02. Linux foundations and security

Outcomes: administer and investigate a Linux host, reason about privilege boundaries,
identify a lab misconfiguration, remediate it, and verify through logs/tests.

Modules: filesystem and identity; processes/services; packages/logs; shell and
automation; network services; permissions/capabilities; containers; host telemetry;
guided and blind privilege-boundary labs.

### 03. Windows foundations and security

Outcomes: administer and investigate a Windows host and explain security principals,
tokens, ACLs, services, remote management, endpoint controls, and event evidence.

Modules: Windows architecture; identities/tokens/UAC; NTFS/registry; services/tasks;
PowerShell; SMB/RDP/WinRM; Defender/firewall; event logs; guided and blind
privilege-boundary labs.

### 04. Operator scripting and data handling

Outcomes: write bounded, observable automation and transform tool output into useful
evidence without hard-coded secrets or unsafe defaults.

Modules: Bash; Python; PowerShell; regex and structured data; HTTP clients; Git;
timeouts/retries/errors; evidence collector; safe lab utility capstone.

## Professional assessment core

### 05. Penetration-testing methodology

Outcomes: run a complete authorized assessment from pre-engagement to retest.

Modules: engagement models; passive/active recon; enumeration methodology;
vulnerability verification; exploitability and impact; note-taking/evidence;
risk communication; technical/executive reporting; remediation and retest.

### 06. Network and infrastructure assessment

Outcomes: enumerate an external/internal lab network, validate segmentation and
service weaknesses, reason about attack paths, and produce defensible findings.

Modules: network discovery; common services; authentication/password security;
file/session concepts; Linux and Windows boundary escalation; pivot/tunnel mental
models; segmentation; network telemetry; blind enterprise-network assessment.

## Surface specializations

### 07. Web, API, and Bug Bounty

Outcomes: discover and responsibly report web/API vulnerabilities, including subtle
authorization and business-logic failures, with safe impact evidence.

Modules: browser/server trust; authentication/session; access control/IDOR/BOLA;
XSS and DOM security; injections; SSRF/path/file handling; CORS/CSRF/clickjacking;
OAuth/OIDC/JWT; WebSocket/GraphQL; deserialization; race/business logic; cache and
request behavior; recon; report/triage/disclosure; blind bounty simulation.

The existing frontend Red Team collections are candidates for this track, but each
must be reviewed against the taxonomy and security-impact test before migration.

### 08. Active Directory and enterprise identity

Outcomes: understand and assess an AD environment, identify identity attack paths,
validate detections and mitigations, and explain business impact.

Modules: domain/forest/OU/DC; DNS/LDAP; Kerberos/NTLM; users/groups/computers/SPNs;
GPO/ACL/DACL; delegation; AD CS/PKI; enumeration and graph analysis; credential and
lateral-movement concepts; trusts; hybrid identity; detection/hardening; isolated
multi-host capstone.

### 09. Cloud, containers, and software supply chain

Outcomes: reason about cloud identity and control planes, workload boundaries, build
provenance, secrets, telemetry, and safe disposable assessment environments.

Modules: shared responsibility; AWS/Azure/GCP IAM concepts; temporary credentials;
storage/network/serverless; containers; Kubernetes identity/RBAC; secrets; CI/CD
runners; dependencies/artifacts/signing; SaaS/OAuth integrations; cloud telemetry;
dedicated sandbox capstone.

### 10. Mobile and wireless

Outcomes: assess application/device and radio trust boundaries in controlled labs.

Modules: Android/iOS architecture; package/signing/storage; IPC/deep links/WebView;
mobile APIs and runtime analysis; Wi-Fi and enterprise authentication; Bluetooth/BLE;
rogue infrastructure concepts; radio/network telemetry; combined mobile-wireless lab.

### 11. IoT, firmware, hardware, and OT foundations

Outcomes: extract and analyze an authorized device image, map hardware/software trust
boundaries, validate update/device identity controls, and respect safety constraints.

Modules: embedded architecture; firmware formats/filesystems; boot/update/signing;
UART/JTAG concepts; device protocols; embedded Linux; hardware/side-channel concepts;
IoT cloud backends; OT/ICS safety and segmentation; emulated-device capstone.

### 12. AI and agentic-system security

Outcomes: assess authorization, data, tool, model, retrieval, and agent boundaries
without treating prompt text as the only security layer.

Modules: AI threat modeling; prompt/data injection; tool authorization; RAG/data
poisoning; model/supply-chain provenance; sensitive-data exposure; agent identity and
delegation; evals/telemetry; human approval boundaries; agentic application capstone.

## Research specializations

### 13. Vulnerability research and zero-day lifecycle

Outcomes: map an attack surface, find and minimize a fault, establish root cause and
security impact, coordinate remediation/disclosure, and distinguish CVE/CWE/CVSS.

Modules: research methodology; source audit; harness design; fuzzing; sanitizers;
crash triage/minimization; root cause; variant analysis; patch diffing; exploitability
assessment; advisory/CVE/disclosure; research capstone on an intentionally vulnerable
or archived target.

### 14. Reverse engineering and exploitability

Outcomes: understand program execution and mitigations deeply enough to analyze
vulnerabilities and validate fixes in isolated targets.

Modules: C/C++ and memory model; assembly/calling conventions; executable formats;
debuggers; static/dynamic analysis; stack/heap failure models; modern mitigations;
reproducible minimal PoC; patch verification; lab-only capstone.

### 15. Malware analysis, C2, and adversary emulation

Outcomes: analyze malware behavior, model safe controller/agent architecture, build a
threat-informed emulation plan, execute bounded tests, and validate telemetry.

Modules: malware taxonomy; static/dynamic analysis; execution/persistence concepts;
agent lifecycle and tasking; C2 architecture; infrastructure/OPSEC concepts; ATT&CK
mapping; threat intelligence; emulation planning; cleanup; isolated emulation capstone.

### 16. Availability, abuse resistance, botnet, and DDoS defense

Outcomes: model distributed abuse safely, measure saturation and recovery, validate
layered mitigations, and create detections without enabling external attacks.

Modules: availability engineering; endpoint/application DoS; network DoS/DDoS;
distributed controller-agent simulation; reflection/amplification concepts; queues,
pools and rate limits; CDN/scrubbing/autoscaling; economic abuse; detection; incident
response; bounded resilience capstone.

## Integration tracks

### 17. Purple team and detection engineering

Outcomes: translate a behavior into telemetry, build/test an analytic, measure gaps,
and prove prevention/detection/response improvements.

Modules: telemetry strategy; Windows/Linux/network/cloud/application logs; detection
hypotheses; ATT&CK mapping; analytic testing; false positives; Atomic-style tests;
incident workflow; remediation verification; purple-team exercise.

### 18. Enterprise capstone

Outcomes: complete an objective-driven, multi-domain assessment under Rules of
Engagement and deliver technical, defensive, and executive evidence.

Modules: engagement design; partial topology and assumed-breach variants; external
and internal paths; web/host/identity/cloud chaining; defender collaboration;
cleanup/retest; final report and presentation.

## Curriculum references

- MITRE ATT&CK Enterprise tactics and adversary-emulation resources.
- NIST SP 800-115 for assessment planning, execution, analysis, and mitigation.
- NIST NICE for task/knowledge/skill-oriented capability definitions.
- OWASP WSTG and PortSwigger Web Security Academy for web testing depth.
- Microsoft Learn for current Windows and Active Directory fundamentals.
- Official maintained repositories for labs, with license and isolation review.
