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
    const body = await response.json().catch(() => null);
    throw Object.assign(
      new Error(
        body?.error?.message || 'Không tải được tài liệu ôn tập. Vui lòng thử lại.'
      ),
      {
        statusCode: response.status,
      }
    );
  }
  return response.json();
}

export async function getReviewSession(signal: AbortSignal) {
  return parseReviewSession(await request('/auth/session', signal));
}

export async function getReviewTopics(signal: AbortSignal) {
  return parseReviewTopics(await request('/review/topics', signal));
}

export async function getReviewQuestions(topicId: string, signal: AbortSignal) {
  return parseReviewQuestions(
    await request(`/review/topics/${encodeURIComponent(topicId)}/questions`, signal)
  );
}
