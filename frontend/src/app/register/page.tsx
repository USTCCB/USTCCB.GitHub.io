import Link from 'next/link';
import { AuthPanel } from '@/components/AuthPanel';
import { getDemoCredentials } from '@/lib/auth';

export default function RegisterPage() {
  const demo = getDemoCredentials();

  return (
    <div className="page-shell grid gap-8 pb-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="panel p-8">
        <p className="hero-eyebrow">Preview Access</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          先把站点体验跑通，再逐步接正式账号系统。
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          这是当前版本的预览注册页，用来让新版全栈站点具备完整入口。完成注册后会直接带你进入工作台。
        </p>
        <div className="mt-8 rounded-[28px] bg-[var(--ink)] p-6 text-sm text-white/72">
          <p className="text-white">如果你只是想快速看看效果：</p>
          <p className="mt-3">也可以直接使用默认预览账号登录。</p>
          <p className="mt-2">邮箱：{demo.email}</p>
          <p>密码：{demo.passwordHint}</p>
        </div>
        <Link href="/login" className="button-secondary mt-8 inline-flex">
          返回登录
        </Link>
      </div>

      <AuthPanel
        mode="register"
        demoEmail={demo.email}
        demoPasswordHint={demo.passwordHint}
      />
    </div>
  );
}
