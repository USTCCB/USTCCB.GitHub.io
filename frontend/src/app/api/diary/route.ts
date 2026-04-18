import { NextResponse } from 'next/server';
import { getDiaryPayload } from '@/lib/api-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getDiaryPayload(),
  });
}
