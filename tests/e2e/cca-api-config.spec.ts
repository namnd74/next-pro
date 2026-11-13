import { expect, test } from '@playwright/test';

test('configured backend origin is used by session requests and abandon-on-exit', async () => {
  const previousUrl = process.env.NEXT_PUBLIC_CCA_API_URL;
  const previousFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_CCA_API_URL = 'http://localhost:3001/';
  const calls: { url: string; options?: RequestInit }[] = [];
  globalThis.fetch = async (input, options) => {
    calls.push({ url: String(input), options });
    return Response.json({ session: null });
  };
  try {
    const { apiUrl, examApi, abandonOnExit } = await import('../../src/features/cca/api');
    expect(apiUrl).toBe('http://localhost:3001/api/v1');
    expect(await examApi.session()).toBeNull();
    abandonOnExit('attempt-1');
    expect(calls).toMatchObject([
      {
        url: 'http://localhost:3001/api/v1/auth/session',
        options: { credentials: 'include' },
      },
      {
        url: 'http://localhost:3001/api/v1/exams/attempts/attempt-1/abandon',
        options: { method: 'POST', credentials: 'include', keepalive: true },
      },
    ]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_CCA_API_URL;
    else process.env.NEXT_PUBLIC_CCA_API_URL = previousUrl;
  }
});
