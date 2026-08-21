import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mockUser = {
    id: 'user-77',
    name: 'Nam Nguyen',
    role: 'Senior Frontend Architect',
    email: 'namnd74@nextpro.dev',
    isAuthenticated: true,
  };

  return NextResponse.json(
    {
      status: 'success',
      message: 'Authenticated session active',
      user: mockUser,
      security: {
        tokenStorage: 'HttpOnly Secure Cookie (Protected from XSS)',
        sameSite: 'Lax (Protected from CSRF)',
      },
    },
    { status: 200 }
  );
}
