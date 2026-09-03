import type { SigmaRuleMatch } from './types';

export const SIGMA_RULES: Record<string, SigmaRuleMatch> = {
  // Rule 1: Linux Permission Modification on Sensitive Files (e.g. /etc/shadow)
  'lnx-auditd-shadow-perm': {
    id: 'sigma-lnx-auditd-001',
    title: 'Suspicious Permission Modification on Shadow Password File',
    level: 'high',
    status: 'stable',
    author: 'OffSec Academy SOC Team',
    remediationHint:
      'Ensure /etc/shadow ownership is root:shadow and permissions are locked to 0640 or 0600. Alert on any SYSCALL fchmodat on /etc/shadow.',
    detectionYaml: `title: Suspicious Permission Modification on Shadow File
id: 4e918d22-8b89-4a4b-9e4b-6d1234567890
status: stable
description: Detects modification of access permissions on /etc/shadow using chmod
references:
  - https://attack.mitre.org/techniques/T1222/002/
author: OffSec Academy SOC Team
tags:
  - attack.defense_evasion
  - attack.t1222.002
logsource:
  product: linux
  service: auditd
detection:
  selection:
    type: 'SYSCALL'
    syscall:
      - 'chmod'
      - 'fchmod'
      - 'fchmodat'
    name: '/etc/shadow'
  condition: selection
falsepositives:
  - Legitimate system administration during password database migration
level: high`,
  },

  // Rule 2: Linux SUID Binary Enumeration via Find
  'lnx-suid-audit-find': {
    id: 'sigma-lnx-proc-002',
    title: 'SUID/SGID Binary Discovery Execution',
    level: 'medium',
    status: 'stable',
    author: 'OffSec Academy SOC Team',
    remediationHint:
      'Regularly audit SUID binaries with AIDE/Tripwire. Strip SUID bit from non-essential binaries using chmod u-s.',
    detectionYaml: `title: SUID/SGID Binary Discovery Execution
id: a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
status: stable
description: Detects execution of find with -perm -4000 to search for SUID binaries
references:
  - https://attack.mitre.org/techniques/T1083/
tags:
  - attack.discovery
  - attack.t1083
logsource:
  product: linux
  service: auditd
detection:
  selection:
    exe: '/usr/bin/find'
    a1|contains: '-perm'
    a2|contains:
      - '-4000'
      - '/4000'
      - '4000'
  condition: selection
falsepositives:
  - Security audit scripts or compliance scanners
level: medium`,
  },

  // Rule 3: Web SQL Injection via UNION / Tautology
  'web-sqli-union-tautology': {
    id: 'sigma-web-sqli-003',
    title: 'Web Application SQL Injection Attempt Detected',
    level: 'critical',
    status: 'stable',
    author: 'OffSec Academy SOC Team',
    remediationHint:
      'Use parameterized queries (Prepared Statements) or ORM abstraction. Never concatenate user input directly into SQL strings.',
    detectionYaml: `title: Web Application SQL Injection Attempt
id: c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f
status: stable
description: Detects in-band SQL injection signatures including UNION SELECT and OR 1=1 tautologies
references:
  - https://attack.mitre.org/techniques/T1190/
tags:
  - attack.initial_access
  - attack.t1190
logsource:
  product: webserver
  service: waf
detection:
  selection:
    cs-method:
      - 'GET'
      - 'POST'
    cs-uri-query|contains:
      - "' OR 1=1"
      - "' OR '1'='1"
      - "UNION SELECT"
      - "UNION ALL SELECT"
      - "information_schema"
  condition: selection
falsepositives:
  - Web vulnerability scanner authorization test
level: critical`,
  },

  // Rule 4: Network Recon Nmap SYN Stealth Port Scan
  'net-nmap-syn-scan': {
    id: 'sigma-net-nmap-004',
    title: 'Network Port Scanning via TCP SYN Sweep',
    level: 'medium',
    status: 'stable',
    author: 'OffSec Academy SOC Team',
    remediationHint:
      'Implement rate limiting on perimeter firewalls and alert on hosts contacting > 20 unique ports within 5 seconds.',
    detectionYaml: `title: Network Port Scanning via TCP SYN Sweep
id: d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a
status: stable
description: Detects high-rate TCP SYN probes with no subsequent ACK across multiple destination ports
references:
  - https://attack.mitre.org/techniques/T1046/
tags:
  - attack.discovery
  - attack.t1046
logsource:
  product: zeek
  service: conn
detection:
  selection:
    proto: 'tcp'
    conn_state:
      - 'S0'
      - 'REJ'
  timeframe: 10s
  condition: selection | count(id_resp_p) by id_orig_h > 15
falsepositives:
  - Legitimate network inventory tools
level: medium`,
  },

  // Rule 5: Windows Privilege Enumeration via Whoami /priv
  'win-whoami-priv-enum': {
    id: 'sigma-win-proc-005',
    title: 'Windows User Privilege Discovery via Whoami',
    level: 'low',
    status: 'stable',
    author: 'OffSec Academy SOC Team',
    remediationHint:
      'Monitor whoami.exe spawning from non-standard interactive processes or web server accounts (e.g. w3wp.exe, sqlservr.exe).',
    detectionYaml: `title: Windows User Privilege Discovery via Whoami
id: e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b
status: stable
description: Detects execution of whoami.exe with /priv parameter to enumerate privileges
references:
  - https://attack.mitre.org/techniques/T1033/
tags:
  - attack.discovery
  - attack.t1033
logsource:
  product: windows
  service: sysmon
detection:
  selection:
    EventID: 1
    Image|endswith: '\\whoami.exe'
    CommandLine|contains:
      - '/priv'
      - '/all'
      - '/groups'
  condition: selection
falsepositives:
  - Administrator troubleshooting session
level: low`,
  },

  // Rule 6: Header Spoofing for Reverse Proxy Bypass
  'web-header-spoof-bypass': {
    id: 'sigma-web-header-006',
    title: 'Reverse Proxy Access Control Bypass via Header Injection',
    level: 'high',
    status: 'stable',
    author: 'OffSec Academy SOC Team',
    remediationHint:
      'Configure ingress reverse proxies to overwrite, rather than trust, incoming X-Forwarded-For headers from external untrusted zones.',
    detectionYaml: `title: Reverse Proxy Access Control Bypass via Header Injection
id: f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c
status: stable
description: Detects forged X-Forwarded-For or X-Real-IP headers claiming localhost (127.0.0.1) origin
references:
  - https://attack.mitre.org/techniques/T1190/
tags:
  - attack.defense_evasion
  - attack.t1190
logsource:
  product: webserver
  service: reverse_proxy
detection:
  selection:
    request_headers|contains:
      - 'X-Forwarded-For: 127.0.0.1'
      - 'X-Forwarded-For: localhost'
      - 'X-Real-IP: 127.0.0.1'
  condition: selection
falsepositives:
  - Internal reverse proxy health checks
level: high`,
  },
};
