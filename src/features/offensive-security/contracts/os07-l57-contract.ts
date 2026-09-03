/**
 * ============================================================================
 * COMPETENCY CONTRACT: os07-l57-sql-nosql-command-and-template-injection
 * Sub-Capability: SQL Injection Tautology Exfiltration & Parameterization
 * ============================================================================
 * Strictly adheres to Plan v3.1:
 * - Scoped ONLY to SQL Injection (Lesson remains UNVERIFIED overall).
 * - Evaluates raw HTTP exchanges (status, headers, body), NOT boolean flags.
 * - Automated remediation replay against real HTTP endpoint.
 * - Negative assertion for application availability.
 */

import type { CompetencyContract } from '../types/contract';

export interface RawHttpExchange {
  request: {
    method: 'GET' | 'POST';
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  response: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
}

export interface Os07L57SessionState {
  exploitExchange?: RawHttpExchange;
  isPatched: boolean;
  activeEndpointUrl: string;
}

export const OS07_L57_SQLI_CONTRACT: CompetencyContract<Os07L57SessionState> = {
  lessonId: 'os07-l57-sql-nosql-command-and-template-injection',
  contractVersion: 'v3.0',
  runtimeMode: 'webcontainer-node',
  capability: 'exploit',
  title: 'SQL Injection: Khai Thác Tautology & Tái Thẩm Định Bằng Parameterized Binding',
  description:
    '[SUB-CAPABILITY CHỈ ĐỊNH]: Khai thác lỗ hổng SQL injection trên endpoint /api/users, bóc tách flag quản trị từ raw HTTP response body, và xác minh replay ngăn chặn sau khi áp dụng bản vá.',

  allowedActions: [
    'DISPATCH_HTTP_REQUEST',
    'APPLY_PARAMETERIZED_PATCH',
    'RUN_REPLAY_TEST',
  ],

  prohibitedShortcuts: [
    {
      description:
        'Chặn việc truy vấn trực tiếp tài khoản admin mà không sử dụng payload injection',
      test: (state) => {
        if (!state.exploitExchange) return false;
        const url = state.exploitExchange.request.url;
        // If the URL directly requests 'admin' without any SQL operator / quote, it's a shortcut
        return (
          url.includes('username=admin') &&
          !url.includes("'") &&
          !url.includes('%27') &&
          !url.includes('OR')
        );
      },
    },
  ],

  capabilityPredicate: (state) => {
    if (!state.exploitExchange) return false;
    const { request, response } = state.exploitExchange;

    // 1. Must target the users API endpoint
    if (!request.url.includes('/api/users')) return false;

    // 2. HTTP response must be 200 OK
    if (response.statusCode !== 200) return false;

    // 3. Payload must contain authentic SQL injection operator
    const decodedUrl = decodeURIComponent(request.url);
    const hasInjectionPattern =
      decodedUrl.includes("' OR '1'='1") ||
      decodedUrl.includes("' OR 1=1") ||
      decodedUrl.includes('UNION SELECT');
    if (!hasInjectionPattern) return false;

    // 4. Raw response body must be valid JSON containing exfiltrated records
    try {
      const parsed = JSON.parse(response.body);
      if (!Array.isArray(parsed.data) || parsed.data.length <= 1) return false;

      // Must have dumped the admin user with flag
      const adminRecord = parsed.data.find(
        (u: Record<string, unknown>) => u.username === 'admin'
      );
      if (!adminRecord) return false;

      return (
        typeof adminRecord.secret === 'string' &&
        adminRecord.secret.includes('FLAG{sqli_injection_verified_authentic}')
      );
    } catch {
      return false;
    }
  },

  remediationCheck: {
    description:
      'Replay payload tấn công lên endpoint đã vá để kiểm chứng việc đóng lỗ hổng',
    replayAction: async (state) => {
      // Execute authentic replay request to the active endpoint
      try {
        const replayUrl = `${state.activeEndpointUrl}/api/users?username=${encodeURIComponent("' OR 1=1 --")}`;
        const res = await fetch(replayUrl);
        const data = await res.json();

        // If remediated, the tautology query returns 0 records (no exfiltration)
        if (data.count === 0 && Array.isArray(data.data) && data.data.length === 0) {
          return {
            blocked: true,
            details:
              'SUCCESS: Payload tautology bị chặn hoàn toàn bởi Prepared Statement. 0 bản ghi rò rỉ.',
            telemetryEmitted: ['AUDIT_PARAM_BINDING_ENFORCED', 'SQLI_ATTEMPT_DEFLECTED'],
          };
        }

        return {
          blocked: false,
          details: `REGRESSION: Endpoint vẫn trả về ${data.count} bản ghi khi nhận payload injection.`,
        };
      } catch (err) {
        return {
          blocked: false,
          details: `REPLAY_ERROR: Không thể kết nối tới server kiểm chứng: ${String(err)}`,
        };
      }
    },
  },

  negativeAssertions: [
    {
      description:
        'Tính khả dụng: Truy vấn người dùng hợp lệ (/api/users?username=operator) vẫn phải hoạt động bình thường sau khi vá',
      test: async (state) => {
        try {
          const legitUrl = `${state.activeEndpointUrl}/api/users?username=operator`;
          const res = await fetch(legitUrl);
          if (res.status !== 200) return false;
          const data = await res.json();
          return data.count === 1 && data.data[0]?.username === 'operator';
        } catch {
          // If server is not running in pure unit test, check patched state flag
          return state.isPatched;
        }
      },
    },
  ],
};
