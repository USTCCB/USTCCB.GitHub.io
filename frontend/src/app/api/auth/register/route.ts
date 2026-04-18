import { NextRequest, NextResponse } from 'next/server';
import { createPreviewUser, issueSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body?.username || body?.name || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();

  if (!name || !email) {
    return NextResponse.json(
      {
        success: false,
        error: '请填写昵称和邮箱。',
      },
      { status: 400 }
    );
  }

  const user = createPreviewUser(name, email);

  return NextResponse.json({
    success: true,
    data: {
      token: issueSessionToken(user),
      user,
      mode: 'preview',
    },
  });
}
