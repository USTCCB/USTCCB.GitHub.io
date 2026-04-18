import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/files/upload`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.error || '上传失败');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : '图片上传失败',
      },
      { status: 502 }
    );
  }
}
