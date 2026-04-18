import { NextResponse } from 'next/server';
import { getAlbumPayload } from '@/lib/api-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getAlbumPayload(),
  });
}
