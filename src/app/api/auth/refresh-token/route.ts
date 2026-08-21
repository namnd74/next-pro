import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const newAccessToken = `valid_access_token_demo`;
  const newRefreshToken = `rotated_refresh_token_demo`;

  return NextResponse.json(
    {
      status: 'success',
      message: 'Silent Refresh Token thành công! Cấp mới Access Token.',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresInSeconds: 900,
    },
    { status: 200 }
  );
}
