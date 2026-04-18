import { NextResponse } from 'next/server';
import { getSiteStats } from '@/lib/api-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getSiteStats(),
  });
}
