import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const users = [
    { id: '1', name: 'Alice Nguyen', role: 'Lead Architect', category: 'react-19' },
    { id: '2', name: 'Bob Tran', role: 'Senior Engineer', category: 'next-app-router' },
    { id: '3', name: 'Carol Le', role: 'Security Specialist', category: 'web-security' },
  ];

  return NextResponse.json(
    {
      status: 'success',
      timestamp: new Date().toISOString(),
      cacheControl: 'stale-while-revalidate=60',
      total: users.length,
      data: users,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-TanStack-Query-Cache': 'HIT',
      },
    }
  );
}
