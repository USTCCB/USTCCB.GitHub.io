import Link from 'next/link';
import { AuthPanel } from '@/components/AuthPanel';
import { getDemoCredentials } from '@/lib/auth';

export default function LoginPage() {
  const demo = getDemoCredentials();

  return (
    <div className="page-shell grid gap-8 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Welcome Back
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-6xl">
          这次不是“只有主页”，而是已经能进入站内体验的版本。
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
          登录后可以进入内容工作台，查看内容模块、接口状态和新版站点的信息布局。后面把数据库接上以后，这里可以直接升级成正式账户系统。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel p-6">
            <p className="text-sm uppercase tracking-[0.26em] text-[var(--accent-strong)]">
              Direct Login
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">可以直接进入站点</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              不再需要从静态页跳转到别处，登录入口已经在新版前端里。
            </p>
          </div>
          <div className="panel p-6">
            <p className="text-sm uppercase tracking-[0.26em] text-[var(--accent-strong)]">
              Full Stack
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">页面和接口同栈</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              登录接口、会话校验和内容接口都在同一个 Next.js 项目里运行。
            </p>
          </div>
        </div>
        <Link href="/register" className="button-secondary inline-flex">
          先创建一个预览账号
        </Link>
      </div>

      <AuthPanel
        mode="login"
        demoEmail={demo.email}
        demoPasswordHint={demo.passwordHint}
      />
    </div>
  );
}
