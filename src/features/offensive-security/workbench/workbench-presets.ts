import type { AcademyLesson } from '../academy/types';
import type { WorkbenchConfig } from './types';
import { createDefaultVfs } from './engines/virtual-posix-engine';
import { generateWorkbenchConfigFromLesson } from './dynamic-lab-generator';

export const WORKBENCH_PRESETS: Record<string, WorkbenchConfig> = {
  // Preset 1: Linux Permissions & SUID Hardening (Track 02 - Lesson 14)
  'os02-l14-posix-permissions-mode-bits-umask': {
    id: 'os02-l14-live-lab',
    lessonId: 'os02-l14-posix-permissions-mode-bits-umask',
    title: 'Phòng thực hành Terminal: Hardening Phân Quyền POSIX & SUID',
    summary:
      'Thực hành thao tác lệnh thật trên cây thư mục Linux ảo: kiểm tra quyền /etc/shadow, thu hồi quyền ghi nguy hiểm và hardening file hệ thống.',
    mode: 'terminal',
    availableModes: ['terminal'],
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
        description:
          'Chạy lệnh kiểm tra file /etc/shadow để phát hiện lỗ hổng phân quyền.',
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
        isComplete: ({ vfs }) => {
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
  },

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
    availableModes: ['sql', 'http', 'terminal'],
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
    availableModes: ['packet', 'http', 'terminal'],
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
        hint: 'Kiểm tra bảng phân tích Packet Header trong tab Packet Decoder.',
        isComplete: () => true,
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
};

export const getWorkbenchConfigForLesson = (lesson: AcademyLesson): WorkbenchConfig => {
  // 1. Direct hand-crafted preset match
  if (WORKBENCH_PRESETS[lesson.slug]) {
    return WORKBENCH_PRESETS[lesson.slug];
  }
  if (WORKBENCH_PRESETS[lesson.id]) {
    return WORKBENCH_PRESETS[lesson.id];
  }

  // 2. Synthesize bespoke interactive lab tailored to this specific lesson
  return generateWorkbenchConfigFromLesson(lesson);
};

export const getWorkbenchPresetForLesson = (
  lessonIdOrSlug: string
): WorkbenchConfig | null => {
  if (WORKBENCH_PRESETS[lessonIdOrSlug]) {
    return WORKBENCH_PRESETS[lessonIdOrSlug];
  }
  return null;
};
