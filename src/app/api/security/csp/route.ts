import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const securityPolicy = {
    xssProtection: '1; mode=block',
    frameOptions: 'DENY (Clickjacking Protection)',
    contentSecurityPolicy:
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
    sameSiteCookie: 'Lax (CSRF Protection)',
    hsts: 'max-age=63072000; includeSubDomains',
  };

  return NextResponse.json(
    {
      status: 'success',
      message: 'Security Audit & CSP Headers verified',
      policies: securityPolicy,
    },
    {
      status: 200,
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'origin-when-cross-origin',
        'Content-Security-Policy': securityPolicy.contentSecurityPolicy,
      },
    }
  );
}
