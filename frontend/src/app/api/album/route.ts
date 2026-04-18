import { NextRequest, NextResponse } from 'next/server';
import { readBackendJson } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await readBackendJson('/api/album');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : '相册服务暂时不可用',
      },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const data = await readBackendJson('/api/album', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : '创建相册失败',
      },
      { status: 502 }
    );
  }
}
