import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  // Simulated expiration logic
  if (!token || token === 'expired_access_token') {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        code: 'TOKEN_EXPIRED',
        message: 'Access Token đã hết hạn. Yêu cầu chạy Refresh Token Flow.',
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      status: 'success',
      message: 'Lấy dữ liệu bảo mật thành công!',
      data: {
        financialReport: '$1,250,000 Revenue',
        secretKeyStatus: 'ACTIVE',
        tokenUsed: token.slice(0, 12) + '...',
      },
    },
    { status: 200 }
  );
}
