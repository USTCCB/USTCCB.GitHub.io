import { NextRequest, NextResponse } from 'next/server';
import { readBackendJson } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const body = await request.json();

  try {
    const data = await readBackendJson(`/api/album/${context.params.id}/photos`, {
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
          error instanceof Error ? error.message : '添加照片失败',
      },
      { status: 502 }
    );
  }
}
