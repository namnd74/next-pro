/**
 * ============================================================================
 * COMPETENCY CONTRACT: os02-l15-permission-bits-and-special-modes
 * Domain: Linux Permissions, SUID/SGID Special Modes & PrivEsc Audit
 * ============================================================================
 * Adheres to Plan v3.1 Vertical Slice VS-03:
 * - Scoped to Linux DAC permission bits (0-7777), SUID (4000), SGID (2000), Sticky (1000).
 * - No fake kernel execution claims; acts as structured VFS permission audit.
 * - Detects high-risk SUID binaries (e.g. /usr/bin/find or /bin/bash owned by root with 4755).
 * - Verifies remediation removing SUID bit or restricting execution.
 */

import type { CompetencyContract } from '../types/contract';

export interface VfsFileEntry {
  path: string;
  owner: string;
  group: string;
  octalMode: string; // e.g. "4755", "0755", "1777"
  isSuid: boolean;
  isSgid: boolean;
  isSticky: boolean;
}

export interface SuidAuditFinding {
  binaryPath: string;
  octalMode: string;
  riskClassification: 'HIGH_GTFOBINS_ESCALATION' | 'STANDARD_SYSTEM_BINARY' | 'BENIGN';
  recommendedPermission: string; // e.g. "0755"
}

export interface Os02L15SessionState {
  inspectedVfs: boolean;
  auditFindings: SuidAuditFinding[];
  remediatedPermissions: Record<string, string>; // path -> octalMode
}

export const OS02_L15_PERMISSIONS_CONTRACT: CompetencyContract<Os02L15SessionState> = {
  lessonId: 'os02-l15-permission-bits-and-special-modes',
  contractVersion: 'v3.0',
  runtimeMode: 'telemetry-inspector',
  capability: 'configure',
  title: 'Kiểm Toán Bit Phân Quyền Linux: SUID, SGID, Sticky Bit & Leo Thang Đặc Quyền',
  description:
    'Kiểm toán cây tập tin VFS, nhận diện các nhị phân sở hữu bit SUID nguy hiểm (GTFOBins pattern) cho phép leo thang đặc quyền từ user lên root, và thiết lập phân quyền an toàn theo nguyên tắc đặc quyền tối thiểu.',

  allowedActions: [
    'INSPECT_VFS_PERMISSIONS',
    'ANALYZE_SUID_BINARIES',
    'SUBMIT_PERMISSION_REMEDIATION',
  ],

  prohibitedShortcuts: [
    {
      description:
        'Chặn việc xóa bỏ hoàn toàn các nhị phân hệ thống thay vì gỡ bit SUID nguy hiểm',
      test: (state) => {
        // Shortcut: Setting mode to "0000" or empty string instead of "0755"
        return Object.values(state.remediatedPermissions).some(
          (mode) => mode === '0000' || mode === ''
        );
      },
    },
  ],

  capabilityPredicate: (state) => {
    if (!state.inspectedVfs) return false;

    // Must correctly identify dangerous SUID binary (/usr/bin/find with SUID root)
    const findFinding = state.auditFindings.find(
      (f) =>
        f.binaryPath === '/usr/bin/find' &&
        f.riskClassification === 'HIGH_GTFOBINS_ESCALATION' &&
        f.octalMode === '4755'
    );

    return !!findFinding;
  },

  remediationCheck: {
    description: 'Kiểm tra việc loại bỏ bit SUID nguy hiểm trên các nhị phân GTFOBins',
    replayAction: async (state) => {
      const findRemediated = state.remediatedPermissions['/usr/bin/find'];

      if (!findRemediated || findRemediated.startsWith('4')) {
        return {
          blocked: false,
          details:
            'REGRESSION: Nhị phân /usr/bin/find vẫn còn mang bit SUID (4xxx), nguy cơ leo thang đặc quyền root tồn tại.',
        };
      }

      if (findRemediated === '0755' || findRemediated === '755') {
        return {
          blocked: true,
          details:
            'SUCCESS: Bit SUID trên /usr/bin/find đã được gỡ bỏ an toàn (chuyển thành 0755). Lỗ hổng leo thang đặc quyền đã bị triệt tiêu.',
          telemetryEmitted: ['AUDIT_SUID_REMOVED', 'GTFOBINS_RISK_NEUTRALIZED'],
        };
      }

      return {
        blocked: false,
        details: `INVALID_MODE: Phân quyền ${findRemediated} không hợp lệ hoặc gây hỏng hóc hệ thống.`,
      };
    },
  },

  negativeAssertions: [
    {
      description:
        'Nhị phân hệ thống thiết yếu như /usr/bin/passwd phải giữ nguyên bit SUID để người dùng có thể đổi mật khẩu',
      test: (state) => {
        // /usr/bin/passwd must NOT be broken or stripped without authorization
        const passwdRemediated = state.remediatedPermissions['/usr/bin/passwd'];
        if (passwdRemediated === '0755' || passwdRemediated === '0000') {
          return false; // Violates system operational requirement
        }
        return true;
      },
    },
  ],
};
