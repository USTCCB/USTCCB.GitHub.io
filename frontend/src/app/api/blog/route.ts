import { NextResponse } from 'next/server';
import { getBlogPayload } from '@/lib/api-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getBlogPayload(),
  });
}
