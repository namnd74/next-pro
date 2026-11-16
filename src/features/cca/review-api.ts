import {
  parseReviewQuestions,
  parseReviewSession,
  parseReviewTopics,
} from './review-contracts';

import { apiUrl } from './api';

async function request(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${apiUrl}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const errorMessage =
      body &&
      typeof body === 'object' &&
      'error' in body &&
      body.error &&
      typeof body.error === 'object' &&
      'message' in body.error &&
      typeof body.error.message === 'string'
        ? body.error.message
        : 'Không tải được tài liệu ôn tập. Vui lòng thử lại.';
    throw Object.assign(new Error(errorMessage), {
      statusCode: response.status,
    });
  }
  return response.json();
}

export async function getReviewSession(signal: AbortSignal) {
  const session = parseReviewSession(await request('/auth/session', signal));
  if (session?.kind === 'authenticated' && Date.parse(session.expiresAt) <= Date.now()) {
    return null;
  }
  return session;
}

export async function getReviewTopics(signal: AbortSignal) {
  return parseReviewTopics(await request('/review/topics', signal));
}

export async function getReviewQuestions(topicId: string, signal: AbortSignal) {
  return parseReviewQuestions(
    await request(`/review/topics/${encodeURIComponent(topicId)}/questions`, signal)
  );
}
