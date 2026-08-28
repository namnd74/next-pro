import type { ArenaChallenge } from '../../types';

export const challengeKerberoasting: ArenaChallenge = {
  id: 'ad-kerb-01-kerberoasting',
  title: 'Active Directory Kerberoasting & Offline Ticket Cracking',
  category: 'active-directory',
  severity: 'high',
  cvssScore: 8.8,
  bountyReward: 4000,
  xpReward: 750,
  estimatedMinutes: 25,
  targetHost: '172.16.1.5',
  targetPort: 88,
  tagline:
    'Trích xuất Service Principal Name (SPN) TGS Ticket từ Active Directory và bẻ khóa offline.',
  scenarioBriefing:
    'Tài khoản dịch vụ SQL Service (svc_mssql) trong Domain corp.internal được đăng ký SPN và sử dụng mã hóa RC4-HMAC yếu kèm mật khẩu có độ phức tạp thấp. Bất kỳ Domain User hợp lệ nào cũng có thể yêu cầu vé Kerberos TGS và bẻ khóa mật khẩu offline để leo thang đặc quyền.',
  keyObjectives: [
    'Chạy lệnh impacket-GetUserSPNs để truy vấn danh sách SPN accounts từ Domain Controller 172.16.1.5.',
    'Yêu cầu TGS Ticket cho svc_mssql và xuất ra file hash krb5tgs.',
    'Chạy công cụ bẻ khóa hashcat/john giả lập để giải mã mật khẩu và nộp Flag.',
  ],
  expectedFlag: 'OS_0DAY{ad_kerberoast_svc_mssql_cracked_Summer2026!}',
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
    ],
    bannerText:
      '[*] Active Directory Attack Station - Domain: corp.internal\n' +
      '[*] Domain Controller: 172.16.1.5 (DC01.corp.internal)\n',
  },
  writeup: {
    title: 'Kerberoasting Attack Execution & Defense Hardening',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N',
    vulnerabilityOverview:
      'Kerberoasting là kỹ thuật tấn công Active Directory nhắm vào các tài khoản người dùng có thuộc tính ServicePrincipalName (SPN). Vé TGS được mã hóa bằng mã băm NTLM của tài khoản dịch vụ, cho phép kẻ tấn công bẻ khóa offline không giới hạn số lần thử.',
    rootCauseAnalysis:
      'Theo thiết kế của giao thức Kerberos, KDC không kiểm tra xem client có quyền truy cập service hay không trước khi cấp vé TGS. Nếu tài khoản dịch vụ dùng mật khẩu yếu hoặc mã hóa RC4 cũ, hash có thể bị crack trong vài giây.',
    exploitChainWalkthrough: [
      'Bước 1: Xác thực vào Domain với quyền user thông thường.',
      'Bước 2: Gửi yêu cầu TGS-REQ tới KDC cho SPN MSSQLSvc/db01.corp.internal.',
      'Bước 3: Lưu vé TGS trả về định dạng $krb5tgs$23$*.',
      'Bước 4: Sử dụng Hashcat (Mode 13100) để bẻ khóa mật khẩu.',
    ],
    weaponizedPoC:
      'impacket-GetUserSPNs corp.internal/operator:Pass123 -dc-ip 172.16.1.5 -request -outputfile hashes.kerb\nhashcat -m 13100 hashes.kerb /usr/share/wordlists/rockyou.txt',
    remediationSnippet:
      '// 1. Chuyển sang sử dụng Group Managed Service Accounts (gMSA) tự đổi mật khẩu 128-bit:\nNew-ADServiceAccount -Name gmsa_sql -DNSHostName sql.corp.internal\n// 2. Vô hiệu hóa mã hóa RC4 trên toàn bộ Domain Kerberos policies.',
  },
};
