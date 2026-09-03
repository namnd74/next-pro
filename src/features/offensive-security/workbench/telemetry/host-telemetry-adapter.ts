import type { AttackActionPayload, TelemetryRecord } from './types';
import { SIGMA_RULES } from './sigma-rules-catalog';

export const generateTelemetryFromAttack = (
  payload: AttackActionPayload
): TelemetryRecord[] => {
  const records: TelemetryRecord[] = [];
  const now = new Date().toISOString();
  const rawCmd = (payload.rawCommand || '').trim();
  const lowerCmd = rawCmd.toLowerCase();
  const host = payload.host || 'web01.corp.internal';
  const user = payload.user || 'operator';

  // 1. Linux Auditd: Permissions modification on /etc/shadow or sensitive system files
  if (
    lowerCmd.includes('chmod') &&
    (lowerCmd.includes('/etc/shadow') || lowerCmd.includes('shadow'))
  ) {
    records.push({
      id: `auditd-${Date.now()}-1`,
      timestamp: now,
      source: 'auditd',
      severity: 'high',
      host,
      processName: '/usr/bin/chmod',
      commandLine: rawCmd,
      user,
      mitre: {
        tactic: 'Defense Evasion',
        tacticId: 'TA0005',
        techniqueId: 'T1222.002',
        techniqueName:
          'File and Directory Permissions Modification: Linux and Mac Permissions',
      },
      rawLog: `type=SYSCALL msg=audit(${Math.floor(Date.now() / 1000)}.412:891): arch=c000003e syscall=268 success=yes exit=0 a0=ffffff9c a1=7ffd1234 a2=1a0 a3=0 items=1 ppid=1420 pid=2105 auid=1000 uid=${user === 'root' ? 0 : 1000} gid=1000 euid=${user === 'root' ? 0 : 1000} exe="/usr/bin/chmod" subj=unconfined_u:unconfined_r:unconfined_t:s0 key="perm_mod"\ntype=CWD msg=audit(${Math.floor(Date.now() / 1000)}.412:891): cwd="/home/operator"\ntype=PATH msg=audit(${Math.floor(Date.now() / 1000)}.412:891): item=0 name="/etc/shadow" inode=131075 dev=08:01 mode=0100640 ouid=0 ogid=42`,
      parsedFields: {
        syscall: 'fchmodat',
        target_path: '/etc/shadow',
        uid: user === 'root' ? 0 : 1000,
        success: true,
        exit_code: 0,
        key: 'perm_mod',
      },
      sigmaRuleMatch: SIGMA_RULES['lnx-auditd-shadow-perm'],
    });
  }

  // 2. Linux Auditd: SUID / SGID discovery with find -perm
  if (lowerCmd.includes('find') && lowerCmd.includes('-perm')) {
    records.push({
      id: `auditd-${Date.now()}-2`,
      timestamp: now,
      source: 'auditd',
      severity: 'medium',
      host,
      processName: '/usr/bin/find',
      commandLine: rawCmd,
      user,
      mitre: {
        tactic: 'Discovery',
        tacticId: 'TA0007',
        techniqueId: 'T1083',
        techniqueName: 'File and Directory Discovery',
      },
      rawLog: `type=EXECVE msg=audit(${Math.floor(Date.now() / 1000)}.501:892): argc=4 a0="find" a1="/" a2="-perm" a3="-4000"\ntype=SYSCALL msg=audit(${Math.floor(Date.now() / 1000)}.501:892): arch=c000003e syscall=59 success=yes exit=0 exe="/usr/bin/find" ppid=1420 pid=2108 auid=1000 uid=1000 key="suid_discovery"`,
      parsedFields: {
        binary: 'find',
        search_root: '/',
        perm_filter: '-4000',
        suid_scan: true,
      },
      sigmaRuleMatch: SIGMA_RULES['lnx-suid-audit-find'],
    });
  }

  // 3. Web WAF / Suricata: SQL Injection (UNION SELECT, OR 1=1, Tautology)
  if (
    payload.mode === 'sql' ||
    lowerCmd.includes('union select') ||
    lowerCmd.includes("' or 1=1") ||
    lowerCmd.includes("' or '1'='1")
  ) {
    records.push({
      id: `waf-${Date.now()}-3`,
      timestamp: now,
      source: 'waf',
      severity: 'critical',
      host: 'web01.corp.internal',
      processName: 'nginx/modsecurity',
      commandLine: rawCmd || 'SQL Query Execution',
      user: 'nginx_www',
      mitre: {
        tactic: 'Initial Access',
        tacticId: 'TA0001',
        techniqueId: 'T1190',
        techniqueName: 'Exploit Public-Facing Application: SQL Injection',
      },
      rawLog: `[client 10.0.4.15:49182] ModSecurity: Warning. Matched "Operator Rx with pattern (?i:(?:union\\s+(?:all\\s+)?select|'\\s+or\\s+['0-9]=\\b))" at ARGS:id. [file "/etc/modsecurity/owasp-crs/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf"] [line "124"] [id "942100"] [msg "SQL Injection Attack: Common DB In-Band Injection"] [data "Matched Data: ${rawCmd.slice(0, 40)}"] [severity "CRITICAL"] [ver "OWASP_CRS/3.3.2"] [tag "application-multi"] [tag "language-multi"] [tag "platform-multi"] [tag "attack-sqli"] [hostname "api.corp.internal"] [uri "/api/v1/user/profile"]`,
      parsedFields: {
        engine: 'ModSecurity v3',
        crs_rule_id: 942100,
        attack_type: 'In-Band SQL Injection',
        client_ip: '10.0.4.15',
        matched_pattern: 'UNION SELECT / OR Tautology',
      },
      sigmaRuleMatch: SIGMA_RULES['web-sqli-union-tautology'],
    });

    // Also trigger a Suricata alert on IDS layer
    records.push({
      id: `suricata-${Date.now()}-4`,
      timestamp: now,
      source: 'suricata',
      severity: 'high',
      host: 'gateway.corp.internal',
      processName: 'suricata-ids',
      user: 'system',
      mitre: {
        tactic: 'Initial Access',
        tacticId: 'TA0001',
        techniqueId: 'T1190',
        techniqueName: 'Exploit Public-Facing Application',
      },
      rawLog: `09/04/2026-01:14:02.192841 [**] [1:2009231:4] ET WEB_SERVER Possible In-Band SQL Injection Attempt: UNION SELECT or Tautology [**] [Classification: Web Application Attack] [Priority: 1] {TCP} 10.0.4.15:49182 -> 10.0.4.10:80`,
      parsedFields: {
        generator_id: 1,
        signature_id: 2009231,
        classification: 'Web Application Attack',
        priority: 1,
        src_ip: '10.0.4.15',
        dest_ip: '10.0.4.10',
      },
      sigmaRuleMatch: SIGMA_RULES['web-sqli-union-tautology'],
    });
  }

  // 4. Zeek / NIDS: Port Scanning or Network Recon (Nmap, Ping sweep, Port scans)
  if (
    lowerCmd.includes('nmap') ||
    lowerCmd.includes('scan') ||
    lowerCmd.includes('nc -z')
  ) {
    records.push({
      id: `zeek-${Date.now()}-5`,
      timestamp: now,
      source: 'zeek',
      severity: 'medium',
      host: 'gateway.corp.internal',
      processName: 'zeek-core',
      commandLine: rawCmd,
      user: 'zeek',
      mitre: {
        tactic: 'Discovery',
        tacticId: 'TA0007',
        techniqueId: 'T1046',
        techniqueName: 'Network Service Discovery',
      },
      rawLog: `${Math.floor(Date.now() / 1000)}.892104\tCH4n231kLs92\t10.0.4.15\t49180\t10.0.4.10\t80\ttcp\t-\t0.0012\t0\t0\tS0\t-\t-\t0\tShAD\t1\t40\t0\t0\t(tunnel_parents)\t-\t-\tZeek::Scan_Port_Scan_Detected`,
      parsedFields: {
        uid: 'CH4n231kLs92',
        id_orig_h: '10.0.4.15',
        id_resp_h: '10.0.4.10',
        proto: 'tcp',
        conn_state: 'S0 (SYN sent, no reply/probe)',
        service: 'nmap-stealth',
      },
      sigmaRuleMatch: SIGMA_RULES['net-nmap-syn-scan'],
    });
  }

  // 5. Windows Sysmon / Audit: whoami /priv or Windows Discovery
  if (lowerCmd.includes('whoami') && lowerCmd.includes('/priv')) {
    records.push({
      id: `sysmon-${Date.now()}-6`,
      timestamp: now,
      source: 'sysmon',
      severity: 'low',
      host: 'win11-corp-endpoint',
      processName: 'C:\\Windows\\System32\\whoami.exe',
      commandLine: rawCmd,
      user: 'CORP\\operator_adm',
      mitre: {
        tactic: 'Discovery',
        tacticId: 'TA0007',
        techniqueId: 'T1033',
        techniqueName: 'System Owner/User Discovery',
      },
      rawLog: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event"><System><Provider Name="Microsoft-Windows-Sysmon" Guid="{5770385F-C22A-43E0-BF4C-06F5698FFBD9}"/><EventID>1</EventID><Version>5</Version><Level>4</Level><Task>1</Task><Opcode>0</Opcode><Keywords>0x8000000000000000</Keywords><TimeCreated SystemTime="${now}"/><EventRecordID>49102</EventRecordID><Correlation/><Execution ProcessID="2412" ThreadID="3104"/><Channel>Microsoft-Windows-Sysmon/Operational</Channel><Computer>win11-corp-endpoint.corp.internal</Computer><Security UserID="S-1-5-21-19283-49102-1001"/></System><EventData><Data Name="RuleName">technique_id=T1033,technique_name=System Owner/User Discovery</Data><Data Name="UtcTime">${now}</Data><Data Name="ProcessGuid">{D2B92841-A810-66D2-0100-000000000F00}</Data><Data Name="ProcessId">4104</Data><Data Name="Image">C:\\Windows\\System32\\whoami.exe</Data><Data Name="CommandLine">whoami.exe /priv</Data><Data Name="CurrentDirectory">C:\\Users\\operator_adm\\</Data><Data Name="User">CORP\\operator_adm</Data><Data Name="LogonGuid">{D2B92841-9F20-66D2-0100-0020E5140300}</Data><Data Name="LogonId">0x314E5</Data><Data Name="IntegrityLevel">Medium</Data><Data Name="ParentProcessId">2196</Data><Data Name="ParentImage">C:\\Windows\\System32\\cmd.exe</Data><Data Name="ParentCommandLine">cmd.exe</Data></EventData></Event>`,
      parsedFields: {
        event_id: 1,
        image: 'C:\\Windows\\System32\\whoami.exe',
        command_line: 'whoami.exe /priv',
        parent_image: 'C:\\Windows\\System32\\cmd.exe',
        integrity_level: 'Medium',
      },
      sigmaRuleMatch: SIGMA_RULES['win-whoami-priv-enum'],
    });
  }

  // 6. Web Header Spoofing via X-Forwarded-For: 127.0.0.1
  if (lowerCmd.includes('x-forwarded-for') && lowerCmd.includes('127.0.0.1')) {
    records.push({
      id: `waf-${Date.now()}-7`,
      timestamp: now,
      source: 'waf',
      severity: 'high',
      host: 'gateway.corp.internal',
      processName: 'envoy/ingress-proxy',
      commandLine: 'HTTP Request: X-Forwarded-For Header Tampering',
      user: 'anonymous_client',
      mitre: {
        tactic: 'Defense Evasion',
        tacticId: 'TA0005',
        techniqueId: 'T1190',
        techniqueName: 'Exploit Public-Facing Application',
      },
      rawLog: `{"time_local":"${now}","remote_addr":"10.0.4.15","request":"GET /api/v1/admin/debug HTTP/1.1","status":200,"x_forwarded_for":"127.0.0.1","security_alert":"UNTRUSTED_INGRESS_HEADER_SPOOF","upstream_cluster":"admin_intranet_service"}`,
      parsedFields: {
        header_injected: 'X-Forwarded-For: 127.0.0.1',
        origin_ip: '10.0.4.15',
        destination_route: '/api/v1/admin/debug',
        bypass_status: 'ACCEPTED_INTERNAL_OVERRIDE',
      },
      sigmaRuleMatch: SIGMA_RULES['web-header-spoof-bypass'],
    });
  }

  // 7. General Linux Command Execution Fallback (Standard Auditd EXECVE)
  if (records.length === 0 && rawCmd) {
    const binary = rawCmd.split(' ')[0] || 'sh';
    records.push({
      id: `auditd-${Date.now()}-generic`,
      timestamp: now,
      source: 'auditd',
      severity: 'informational',
      host,
      processName: `/usr/bin/${binary}`,
      commandLine: rawCmd,
      user,
      mitre: {
        tactic: 'Execution',
        tacticId: 'TA0002',
        techniqueId: 'T1059.004',
        techniqueName: 'Command and Scripting Interpreter: Unix Shell',
      },
      rawLog: `type=SYSCALL msg=audit(${Math.floor(Date.now() / 1000)}.100:990): arch=c000003e syscall=59 success=yes exit=0 exe="/usr/bin/${binary}" ppid=1420 pid=2199 uid=1000 auid=1000\ntype=EXECVE msg=audit(${Math.floor(Date.now() / 1000)}.100:990): argc=1 a0="${rawCmd}"`,
      parsedFields: {
        syscall: 'execve',
        binary,
        command_line: rawCmd,
        uid: 1000,
        success: true,
      },
    });
  }

  return records;
};
