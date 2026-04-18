import Link from 'next/link';
import { AuthPanel } from '@/components/AuthPanel';
import { getDemoCredentials } from '@/lib/auth';

export default function LoginPage() {
  const demo = getDemoCredentials();

  return (
    <div className="page-shell grid gap-8 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="space-y-6">
        <section className="panel p-8">
          <p className="hero-eyebrow">Welcome Back / Direct Access</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            登录入口要自然地长在网站里，而不是像额外拼出来的系统页。
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            这里延续原站的个人空间感，但现在已经是可以真正进入站内体验的全栈入口。登录后会进入工作台，而不是跳去一个完全不同的风格页面。
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel p-6">
            <p className="section-chip">Direct Login</p>
            <p className="mt-2 text-2xl font-semibold text-white">可以直接进入站点</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              登录页本身已经成为主站的一部分，不再是临时过渡入口。
            </p>
          </div>
          <div className="panel p-6">
            <p className="section-chip">Same Runtime</p>
            <p className="mt-2 text-2xl font-semibold text-white">页面和接口同栈</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              登录接口、会话校验和工作台页面都在同一个 Next.js 项目里。
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
