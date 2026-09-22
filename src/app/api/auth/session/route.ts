import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const mockUser = {
    id: 'user-77',
    name: 'Alex Rivera',
    role: 'Senior Frontend Architect',
    email: 'alex.rivera@nextpro.dev',
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
