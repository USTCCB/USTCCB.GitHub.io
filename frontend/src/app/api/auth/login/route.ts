import { NextRequest, NextResponse } from 'next/server';
import { authenticateDemoUser, issueSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || '');
  const password = String(body?.password || '');

  const user = authenticateDemoUser(email, password);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: '邮箱或密码不正确。可以先使用首页展示的预览账号登录。',
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      token: issueSessionToken(user),
      user,
    },
  });
}
