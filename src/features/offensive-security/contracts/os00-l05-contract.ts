/**
 * ============================================================================
 * COMPETENCY CONTRACT: os00-l05-rules-of-engagement-and-stop-conditions
 * Domain: Operational Governance, Rules of Engagement & Deconfliction
 * ============================================================================
 * Adheres to Plan v3.1 Vertical Slice VS-01:
 * - Structured operational governance assessment (No terminal / No exploit).
 * - Evaluates candidate authorization, scope boundary enforcement, and stop-condition triggers.
 * - Evidence: Scoped decision, cited ROE clause, stop condition, deconfliction action.
 * - Prohibits out-of-scope attacks or bypassing declared stop conditions.
 */

import type { CompetencyContract } from '../types/contract';

export interface RoeScopeTarget {
  target: string;
  inScope: boolean;
  classification:
    'PRODUCTION_CRITICAL' | 'STAGING_AUTHORIZED' | 'OUT_OF_SCOPE_THIRD_PARTY';
}

export interface StopConditionTrigger {
  incidentId: string;
  triggerEvent: string; // e.g. "DATABASE_LATENCY_SPIKE_500MS" | "PATIENT_DATA_UNENCRYPTED_EXPOSURE"
  mandatesImmediateHalt: boolean;
  actionRequired: 'CEASE_ALL_ACTIVITY_AND_NOTIFY_LEAD' | 'LOG_AND_CONTINUE' | 'IGNORE';
}

export interface Os00L05SessionState {
  scenarioReviewed: boolean;
  targetAuthorizations: Record<string, boolean>; // target -> authorized
  selectedStopActions: Record<string, string>; // incidentId -> action
  deconflictionCallLogged: boolean;
  roeClauseCited: string;
}

export const OS00_L05_ROE_CONTRACT: CompetencyContract<Os00L05SessionState> = {
  lessonId: 'os00-l05-rules-of-engagement-and-stop-conditions',
  contractVersion: 'v3.0',
  runtimeMode: 'decision-lab',
  capability: 'decide',
  title: 'Quy Tắc Tương Tác (ROE), Ranh Giới Phạm Vi & Điều Kiện Đình Chỉ Tấn Công',
  description:
    'Đánh giá và đưa ra quyết định quản trị chiến dịch: phân định ranh giới mục tiêu trong phạm vi (In-Scope) so với ngoài phạm vi (Out-of-Scope), trích dẫn đúng điều khoản ROE, và kích hoạt quy trình dừng khẩn cấp (Emergency Stop) khi phát hiện sự cố ảnh hưởng tính khả dụng môi trường thực tế.',

  allowedActions: [
    'REVIEW_ENGAGEMENT_BRIEF',
    'AUTHORIZE_TARGET_IN_SCOPE',
    'TRIGGER_EMERGENCY_STOP',
    'LOG_DECONFLICTION_ACTION',
  ],

  prohibitedShortcuts: [
    {
      description:
        'Chặn việc phê duyệt bừa bãi toàn bộ dải mạng mà không kiểm tra ranh giới hạ tầng bên thứ ba',
      test: (state) => {
        // Shortcut: Authorizing an out-of-scope cloud infrastructure or payment gateway
        return state.targetAuthorizations['api.payment-gateway.external'] === true;
      },
    },
  ],

  capabilityPredicate: (state) => {
    if (!state.scenarioReviewed) return false;

    // 1. Must authorize staging target
    const authorizedStaging =
      state.targetAuthorizations['staging.corp-portal.internal'] === true;

    // 2. Must strictly DENY third-party payment gateway target
    const rejectedPaymentGateway =
      state.targetAuthorizations['api.payment-gateway.external'] === false;

    // 3. Must trigger emergency halt on critical health/patient or production crash incident
    const stopAction = state.selectedStopActions['INCIDENT-CRITICAL-LATENCY'];
    const haltTriggered = stopAction === 'CEASE_ALL_ACTIVITY_AND_NOTIFY_LEAD';

    // 4. Must cite correct ROE section and log deconfliction call
    const roeValid = state.roeClauseCited === 'ROE-CLAUSE-4.2-STOP-CONDITIONS';
    const deconflictionDone = state.deconflictionCallLogged === true;

    return (
      authorizedStaging &&
      rejectedPaymentGateway &&
      haltTriggered &&
      roeValid &&
      deconflictionDone
    );
  },

  remediationCheck: {
    description:
      'Quy trình đối soát an toàn: Xác minh quy trình giải tỏa xung đột (Deconfliction Verification)',
    replayAction: async (state) => {
      if (!state.deconflictionCallLogged) {
        return {
          blocked: false,
          details:
            'REGRESSION: Chưa ghi nhận biên bản liên lạc giải tỏa xung đột (Deconfliction) với SOC của khách hàng.',
        };
      }

      return {
        blocked: true,
        details:
          'SUCCESS: Toàn bộ điều kiện đình chỉ và quy trình deconfliction đã được thực thi chính xác theo ROE.',
        telemetryEmitted: [
          'AUDIT_ROE_ENFORCED',
          'STOP_CONDITION_EXECUTED',
          'DECONFLICTION_CONFIRMED',
        ],
      };
    },
  },

  negativeAssertions: [
    {
      description:
        'Không bao giờ được phép tiếp tục quét hoặc gửi payload khi đã phát hiện điều kiện dừng khẩn cấp',
      test: (state) => {
        const action = state.selectedStopActions['INCIDENT-CRITICAL-LATENCY'];
        return action !== 'LOG_AND_CONTINUE' && action !== 'IGNORE';
      },
    },
  ],
};
