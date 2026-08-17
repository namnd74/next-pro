import { NextResponse } from 'next/server';

export async function GET() {
  const mockUser = {
    id: 'user-77',
    name: 'Nam Nguyen',
    role: 'Senior Frontend Architect',
    email: 'namnd74@nextpro.dev',
    isAuthenticated: true,
  };

  const response = NextResponse.json(
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

  // Set HttpOnly Cookie for security demo
  response.cookies.set(
    'nextpro_session_token',
    'jwt.header.payload.signature_secret_9988',
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    }
  );

  return response;
}
