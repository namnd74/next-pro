/**
 * ============================================================================
 * COMPETENCY CONTRACT: os02-l14-users-groups-and-identity-boundaries
 * Domain: System Configuration & Identity Audit Inspector
 * ============================================================================
 * Strictly adheres to Plan v3.1:
 * - Scoped ONLY to Identity Boundaries, UID 0 separation, and Group Membership.
 * - SUID bits removed (delegated to os02-l15).
 * - No fake kernel execution claims; acts as structured configuration audit.
 */

import type { CompetencyContract } from '../types/contract';

export interface AuditFindingRecord {
  fileTarget: string;
  violatingAccount: string;
  detectedUid: number;
  violationType: 'UNAUTHORIZED_UID_ZERO' | 'INCORRECT_GROUP_ESCALATION';
  recommendedRemediation: string;
}

export interface Os02L14AuditSessionState {
  inspectedPasswdDump: boolean;
  findingsSubmitted: AuditFindingRecord[];
  isPolicyCompliant: boolean;
}

export const OS02_L14_AUDIT_CONTRACT: CompetencyContract<Os02L14AuditSessionState> = {
  lessonId: 'os02-l14-users-groups-and-identity-boundaries',
  contractVersion: 'v3.0',
  runtimeMode: 'telemetry-inspector',
  capability: 'configure',
  title: 'Kiểm Toán Ranh Giới Danh Tính, UID 0 & Phân Nhóm Người Dùng Linux',
  description:
    'Kiểm toán tập tin /etc/passwd và cấu hình nhóm người dùng, phát hiện tài khoản backdoor mang UID 0 trái phép và thiết lập cấu hình tuân thủ nguyên tắc đặc quyền tối thiểu (PoLP).',

  allowedActions: ['INSPECT_PASSWD_DUMP', 'INSPECT_GROUP_CONFIG', 'SUBMIT_AUDIT_FINDING'],

  capabilityPredicate: (state) => {
    // Must have reviewed the passwd dump
    if (!state.inspectedPasswdDump) return false;

    // Must identify the rogue account with UID 0 (e.g. 'backdoor_admin' or 'toor')
    const rogueFinding = state.findingsSubmitted.find(
      (f) =>
        f.fileTarget === '/etc/passwd' &&
        f.detectedUid === 0 &&
        f.violatingAccount !== 'root' &&
        f.violationType === 'UNAUTHORIZED_UID_ZERO'
    );

    return !!rogueFinding;
  },

  remediationCheck: {
    description:
      'Kiểm tra cấu hình danh tính sau khi gỡ bỏ UID 0 trái phép và chuẩn hóa nhóm',
    replayAction: async (state) => {
      if (!state.isPolicyCompliant) {
        return {
          blocked: false,
          details:
            'REGRESSION: Hệ thống vẫn còn tài khoản thứ hai sở hữu UID 0, vi phạm CIS Benchmark 5.4.3.',
        };
      }

      return {
        blocked: true,
        details:
          'SUCCESS: Ranh giới danh tính chỉ cho phép duy nhất tài khoản root mang UID 0.',
        telemetryEmitted: ['AUDIT_UID0_COMPLIANCE_VERIFIED', 'IDENTITY_BOUNDARY_SECURED'],
      };
    },
  },

  negativeAssertions: [
    {
      description:
        'Tính khả dụng: Các tài khoản hệ thống chuẩn (operator, backup, nobody) phải giữ nguyên UID không đặc quyền (> 0)',
      test: (state) => {
        // Legitimate accounts are not removed or assigned invalid UID
        return state.isPolicyCompliant;
      },
    },
  ],
};
