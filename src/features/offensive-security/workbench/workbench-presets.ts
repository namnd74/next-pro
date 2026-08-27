import type { WorkbenchConfig } from './types';
import { createDefaultVfs } from './engines/virtual-posix-engine';
import { createDefaultSqlDatabase } from './engines/sql-injection-engine';
import { createDefaultHttpRequest } from './engines/http-packet-engine';

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
      // Introduce an insecure shadow file permission for the challenge
      if (
        vfs.children.etc &&
        vfs.children.etc.type === 'dir' &&
        vfs.children.etc.children.shadow
      ) {
        vfs.children.etc.children.shadow.mode = 0o666; // Insecure: world writable!
      }
      return vfs;
    })(),
    sampleCommands: [
      'ls -la /etc/shadow',
      'chmod 600 /etc/shadow',
      'find /bin -perm -4000',
      'cat /home/operator/notes.txt',
      'id',
    ],
    objectives: [
      {
        id: 'obj-inspect-shadow',
        title: 'Kiểm tra quyền /etc/shadow',
        description: 'Chạy lệnh ls -l /etc/shadow để xem mode bits.',
        hint: 'Gõ `ls -l /etc/shadow`',
        isComplete: ({ lastCommand }) =>
          !!lastCommand && /ls\s+.*\/etc\/shadow/i.test(lastCommand),
      },
      {
        id: 'obj-harden-shadow',
        title: 'Hardening /etc/shadow về quyền an toàn (0600 hoặc 0640)',
        description: 'Thu hồi quyền đọc/ghi của other trên file mật khẩu nhạy cảm.',
        hint: 'Gõ `chmod 600 /etc/shadow` hoặc `chmod 640 /etc/shadow`',
        isComplete: ({ vfs }) => {
          if (!vfs) return false;
          const etc = vfs.root.children.etc;
          if (etc && etc.type === 'dir' && etc.children.shadow) {
            const mode = etc.children.shadow.mode;
            return (mode & 0o007) === 0 && (mode & 0o070) <= 0o040; // No permissions for other, max read for group
          }
          return false;
        },
      },
      {
        id: 'obj-suid-audit',
        title: 'Tìm kiếm binary có cờ SUID',
        description: 'Sử dụng lệnh find để liệt kê các binary có quyền SUID.',
        hint: 'Gõ `find /bin -perm -4000` hoặc `find / -perm -4000`',
        isComplete: ({ lastCommand }) =>
          !!lastCommand && /find\s+.*-perm\s+-?4000/i.test(lastCommand),
      },
    ],
  },

  // Preset 2: Bash One-Liners & Log Analysis (Track 04 - Lesson 25)
  'os04-l25-bash-one-liners-pipelines-awk-sed': {
    id: 'os04-l25-live-lab',
    lessonId: 'os04-l25-bash-one-liners-pipelines-awk-sed',
    title: 'Phòng thực hành Terminal: Xử lý Dòng lệnh & Phân tích Log Pipeline',
    summary:
      'Sử dụng các công cụ dòng lệnh bash, grep, awk, và pipeline để phân tích file log máy chủ web và trích xuất IP khả nghi.',
    mode: 'terminal',
    availableModes: ['terminal'],
    instructions: [
      '1. Xem nội dung file log truy cập web tại `/var/log/access.log`.',
      '2. Dùng pipeline `cat /var/log/access.log | grep 401` để lọc ra các request xác thực thất bại.',
      "3. Dùng `cat /var/log/access.log | awk '{print $1}'` để trích xuất danh sách địa chỉ IP nguồn.",
      '4. Ghi danh sách IP khả nghi ra file `/tmp/suspects.txt` bằng redirect `>` hoặc `>>`.',
    ],
    sampleCommands: [
      'cat /var/log/access.log',
      'grep 401 /var/log/access.log',
      "cat /var/log/access.log | awk '{print $1}'",
      "grep 401 /var/log/access.log | awk '{print $1}' > /tmp/suspects.txt",
    ],
    objectives: [
      {
        id: 'obj-read-log',
        title: 'Đọc và kiểm tra access.log',
        description: 'Đọc file log hệ thống trong /var/log/access.log.',
        hint: 'Gõ `cat /var/log/access.log`',
        isComplete: ({ lastCommand }) =>
          !!lastCommand && /cat\s+.*access\.log/i.test(lastCommand),
      },
      {
        id: 'obj-grep-pipe',
        title: 'Lọc request mã lỗi 401/404 qua pipeline grep',
        description: 'Sử dụng grep kết hợp pipeline hoặc tham số file.',
        hint: 'Gõ `grep 401 /var/log/access.log` hoặc `cat /var/log/access.log | grep 401`',
        isComplete: ({ lastCommand }) =>
          !!lastCommand && /grep\s+(?:401|404)/i.test(lastCommand),
      },
      {
        id: 'obj-extract-suspects',
        title: 'Trích xuất IP và xuất ra /tmp/suspects.txt',
        description: 'Chuyển hướng output (redirect >) vào file /tmp/suspects.txt.',
        hint: "Gõ `cat /var/log/access.log | awk '{print $1}' > /tmp/suspects.txt`",
        isComplete: ({ vfs }) => {
          if (!vfs) return false;
          const tmp = vfs.root.children.tmp;
          if (tmp && tmp.type === 'dir') {
            const file = tmp.children['suspects.txt'];
            if (file && file.type === 'file') {
              return file.content.length > 0;
            }
          }
          return false;
        },
      },
    ],
  },

  // Preset 3: SQL Injection & Authentication Bypass (Track 07 - Lesson 19/20)
  'os07-l19-broken-object-level-authorization-idor': {
    id: 'os07-l19-live-lab',
    lessonId: 'os07-l19-broken-object-level-authorization-idor',
    title: 'Phòng thực nghiệm SQL Injection & IDOR Web-Native',
    summary:
      'Tương tác trực tiếp với Database SQL trong bộ nhớ và HTTP Inspector để khai thác các lỗ hổng Injection & IDOR.',
    mode: 'sql',
    availableModes: ['sql', 'http'],
    instructions: [
      '1. Thử nhập từ khóa tìm kiếm bình thường như `Sensor` hoặc `Manual`.',
      "2. Sử dụng kỹ thuật Tautology: Nhập payload `' OR 1=1 --` để bypass bộ lọc `is_published = 1` và trích xuất cả sản phẩm ẩn Zero-Day.",
      "3. Sử dụng kỹ thuật UNION-Based SQLi: Nhập `' UNION SELECT id, username, password_hash, role, email FROM users --` để dump toàn bộ cơ sở dữ liệu người dùng!",
      '4. Chuyển sang tab HTTP Inspector để kiểm tra lỗ hổng IDOR trên API `/api/v1/user/profile?id=1`.',
    ],
    initialSqlDb: createDefaultSqlDatabase(),
    initialHttpRequest: createDefaultHttpRequest(),
    samplePayloads: [
      "' OR 1=1 --",
      "' OR 'a'='a",
      "' UNION SELECT id, username, password_hash, role, email FROM users --",
      "' UNION SELECT id, secret_key, secret_value, environment, 'confidential' FROM secrets --",
    ],
    objectives: [
      {
        id: 'obj-tautology-sqli',
        title: 'Khai thác Tautology bypass điều kiện lọc',
        description:
          "Nhập payload ' OR 1=1 -- để hiển thị các sản phẩm chưa được công bố.",
        hint: "Nhập `' OR 1=1 --` vào ô tìm kiếm và bấm Thực thi SQL.",
        isComplete: ({ lastSqlResult }) =>
          !!lastSqlResult &&
          lastSqlResult.success &&
          lastSqlResult.rows.some((r) => r.title === 'Zero-Day Advisory Subscription'),
      },
      {
        id: 'obj-union-sqli',
        title: 'Dump bảng nhạy cảm users hoặc secrets qua UNION SELECT',
        description:
          'Trích xuất bảng dữ liệu tài khoản quản trị bằng UNION SQL Injection.',
        hint: "Nhập `' UNION SELECT id, username, password_hash, role, email FROM users --`",
        isComplete: ({ lastSqlResult }) =>
          !!lastSqlResult &&
          lastSqlResult.success &&
          !!lastSqlResult.vulnerabilityTriggered &&
          lastSqlResult.vulnerabilityTriggered.includes('UNION SQL Injection'),
      },
      {
        id: 'obj-idor-admin',
        title: 'Khai thác IDOR trích xuất thông tin Admin qua HTTP Inspector',
        description:
          'Sửa URL tham số id=1 trong tab HTTP Inspector để lấy token quản trị.',
        hint: 'Chuyển sang tab HTTP Inspector, đổi URL thành `/api/v1/user/profile?id=1` và gửi request.',
        isComplete: ({ lastHttpRes, lastHttpReq }) =>
          !!lastHttpRes &&
          !!lastHttpReq &&
          lastHttpReq.url.includes('id=1') &&
          lastHttpRes.body.includes('administrator'),
      },
    ],
  },

  // Preset 4: Network Protocols & Packet Decoding (Track 01 - Lesson 08)
  'os01-l08-tcp-udp-transport-state': {
    id: 'os01-l08-live-lab',
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
        isComplete: () => true, // Auto complete on view
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

export function getWorkbenchPresetForLesson(lessonId: string): WorkbenchConfig | null {
  // Direct match
  if (WORKBENCH_PRESETS[lessonId]) {
    return WORKBENCH_PRESETS[lessonId];
  }

  // Fallback defaults based on track type
  if (lessonId.startsWith('os02-') || lessonId.startsWith('os03-')) {
    // Linux/Windows foundations fallback
    return {
      ...WORKBENCH_PRESETS['os02-l14-posix-permissions-mode-bits-umask'],
      id: `${lessonId}-live-terminal`,
      lessonId,
      title: 'Phòng thực hành Terminal: Thao tác & Kiểm tra Hệ thống',
    };
  }

  if (lessonId.startsWith('os04-')) {
    // Operator scripting fallback
    return {
      ...WORKBENCH_PRESETS['os04-l25-bash-one-liners-pipelines-awk-sed'],
      id: `${lessonId}-live-scripting`,
      lessonId,
      title: 'Phòng thực hành Bash & Scripting Automation',
    };
  }

  if (lessonId.startsWith('os01-')) {
    // Network foundations fallback
    return {
      ...WORKBENCH_PRESETS['os01-l08-tcp-udp-transport-state'],
      id: `${lessonId}-live-packet`,
      lessonId,
      title: 'Phòng phân tích Giao thức Mạng & Packet Inspector',
    };
  }

  if (
    lessonId.startsWith('os07-') ||
    lessonId.startsWith('os06-') ||
    lessonId.startsWith('os05-')
  ) {
    // Web / Pentest fallback
    return {
      ...WORKBENCH_PRESETS['os07-l19-broken-object-level-authorization-idor'],
      id: `${lessonId}-live-sqli`,
      lessonId,
      title: 'Phòng thực nghiệm SQLi & HTTP Web Security',
    };
  }

  // Generic terminal default
  return {
    ...WORKBENCH_PRESETS['os02-l14-posix-permissions-mode-bits-umask'],
    id: `${lessonId}-generic-terminal`,
    lessonId,
    title: 'Phòng thực hành Tương tác Web-Native',
  };
}
