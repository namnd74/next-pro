import {
  isRecord,
  parseAttempt,
  parseCatalog,
  parseResults,
  parseSession,
  parseStatus,
  parseSummary,
  type TopicId,
  type Session,
} from './contracts';

const configuredApiUrl =
  process.env.NEXT_PUBLIC_CCA_API_URL?.trim().replace(/\/+$/, '') ||
  'https://cca.dev-pro.online';
export const apiUrl = configuredApiUrl.endsWith('/api/v1')
  ? configuredApiUrl
  : `${configuredApiUrl}/api/v1`;
export class ExamApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = ''
  ) {
    super(message);
  }
}
async function request(
  path: string,
  body?: Record<string, unknown>,
  method = body ? 'POST' : 'GET'
): Promise<unknown> {
  if (!apiUrl) throw new Error('Phòng thi chưa mở. Vui lòng quay lại sau.');
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      cache: 'no-store',
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Chưa kết nối được phòng thi. Kiểm tra kết nối và thử lại.');
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('Phản hồi phòng thi không hợp lệ.');
  }
  if (!response.ok) {
    const error = isRecord(data) && isRecord(data.error) ? data.error : {};
    throw new ExamApiError(
      typeof error.message === 'string' ? error.message : 'Thao tác chưa thành công.',
      response.status,
      typeof error.code === 'string' ? error.code : ''
    );
  }
  return data;
}
function auth(value: unknown): Session | null {
  if (!isRecord(value)) throw new Error('Không đọc được phiên đăng nhập.');
  return value.session === null ? null : parseSession(value.session);
}
export const examApi = {
  session: async () => auth(await request('/auth/session')),
  login: async (
    username: string,
    password?: string
  ): Promise<{ needPassword: true; username: string } | { session: Session }> => {
    const data = await request('/auth/login', {
      username,
      ...(password === undefined ? {} : { password }),
    });
    if (isRecord(data) && data.needPassword === true) {
      if (
        typeof data.username !== 'string' ||
        data.username !== username ||
        'session' in data
      )
        throw new Error('Không đọc được phản hồi đăng nhập.');
      return { needPassword: true, username: data.username };
    }
    const session = auth(data);
    if (!session) throw new Error('Không đọc được phiên đăng nhập.');
    if (password === undefined && session.kind === 'authenticated')
      throw new Error('Không đọc được phản hồi đăng nhập. Vui lòng thử lại.');
    return { session };
  },
  setupPassword: async (password: string, confirmPassword: string) => {
    const session = auth(
      await request('/auth/setup-password', { password, confirmPassword })
    );
    if (!session) throw new Error('Không đọc được phiên đăng nhập.');
    return session;
  },
  catalog: async () => parseCatalog(await request('/exams/catalog')),
  dashboard: async () => {
    const data = await request('/exams/dashboard');
    if (!isRecord(data) || !Array.isArray(data.cycles))
      throw new Error('Không đọc được lịch sử thi.');
    const cycles = data.cycles.map((cycle) => {
      if (
        !isRecord(cycle) ||
        typeof cycle.topicId !== 'string' ||
        !Array.isArray(cycle.usedForms) ||
        !cycle.usedForms.every(
          (form) => Number.isInteger(form) && form >= 1 && form <= 10
        )
      )
        throw new Error('Dữ liệu chu kỳ không hợp lệ.');
      return {
        topicId: cycle.topicId,
        usedForms: cycle.usedForms as number[],
        activeAttemptId:
          typeof cycle.activeAttemptId === 'string' ? cycle.activeAttemptId : null,
      };
    });
    return {
      results: parseResults(data.results),
      cycles,
      activeAttemptId:
        typeof data.activeAttemptId === 'string' ? data.activeAttemptId : null,
    };
  },
  start: async (topicId: TopicId, formNumber: number) =>
    parseAttempt(await request('/exams/attempts', { topicId, formNumber })),
  save: (id: string, questionId: string, choiceIds: string[]) =>
    request(`/exams/attempts/${id}/answers`, { questionId, choiceIds }, 'PUT'),
  status: async (id: string) => parseStatus(await request(`/exams/attempts/${id}`)),
  finish: async (id: string, action: 'submit' | 'abandon') =>
    parseSummary(await request(`/exams/attempts/${id}/${action}`, {})),
  logout: () => request('/auth/logout', {}),
};
export function abandonOnExit(id: string) {
  void fetch(`${apiUrl}/exams/attempts/${id}/abandon`, {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }).catch(() => {});
}
