import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(
    {
      status: 'success',
      message: 'Lấy dữ liệu bảo mật thành công!',
      data: {
        financialReport: '$1,250,000 Revenue',
        secretKeyStatus: 'ACTIVE',
        tokenUsed: 'valid_access_token_demo...',
      },
    },
    { status: 200 }
  );
}
