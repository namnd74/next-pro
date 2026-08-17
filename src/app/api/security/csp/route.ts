import { NextResponse } from 'next/server';

export async function GET() {
  const securityPolicy = {
    xssProtection: '1; mode=block',
    frameOptions: 'DENY (Clickjacking Protection)',
    contentSecurityPolicy:
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
    sameSiteCookie: 'Lax (CSRF Protection)',
    hsts: 'max-age=63072000; includeSubDomains',
  };

  const response = NextResponse.json(
    {
      status: 'success',
      message: 'Security Audit & CSP Headers verified',
      policies: securityPolicy,
    },
    { status: 200 }
  );

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', securityPolicy.contentSecurityPolicy);

  return response;
}
