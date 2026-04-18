import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      service: 'ustccb-fullstack-web',
      runtime: 'vercel-nextjs',
      timestamp: new Date().toISOString(),
    },
  });
}
