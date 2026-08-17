import { NextResponse } from 'next/server';

export async function POST() {
  // Simulate Refresh Token Rotation
  const newAccessToken = `valid_access_token_${Date.now()}`;
  const newRefreshToken = `rotated_refresh_token_${Date.now()}`;

  const response = NextResponse.json(
    {
      status: 'success',
      message: 'Silent Refresh Token thành công! Cấp mới Access Token.',
      accessToken: newAccessToken,
      expiresInSeconds: 900,
    },
    { status: 200 }
  );

  // Set rotated HttpOnly Refresh Token Cookie
  response.cookies.set('nextpro_refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh-token',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
