import Link from 'next/link';
import { SectionHeading } from '@/components/SectionHeading';
import {
  albumShots,
  blogPosts,
  capabilityCards,
  diaryEntries,
  siteStats,
} from '@/lib/site-content';

export default function Home() {
  return (
    <div className="page-shell space-y-6 pb-24">
      <section className="hero-panel">
        <div className="space-y-8">
          <p className="hero-eyebrow">
            Personal Hub / Full Stack Site
          </p>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              把博客、相册、日记和个人工具收进同一个真正可生长的网站。
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              这次不再只是一个静态页面集合，而是一套前端、接口和部署链路重新接通后的个人平台。它更好看，也更适合继续长期维护。
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="button-primary">
              直接登录
            </Link>
            <Link href="/blog" className="button-secondary">
              浏览内容
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <article className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="section-chip !mb-0">Live Status</span>
              <span className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                Online
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <p className="font-[var(--font-mono)] text-4xl font-bold tracking-[-0.06em] text-white">
                24 / 7
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                页面、认证接口和内容结构已经被整理进同一个 Next.js 全栈项目里。
              </p>
            </div>
          </article>

          <div className="stats-grid">
            {siteStats.map((item) => (
              <article key={item.label} className="metric-panel">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="hero-grid">
            <div className="hero-card hero-card-main">
              <span className="hero-label">System</span>
              <strong>Next.js Frontend</strong>
              <p>现代化界面、内容模块和统一布局系统。</p>
            </div>
            <div className="hero-card">
              <span className="hero-label">Auth</span>
              <strong>Login Flow</strong>
              <p>站内已经具备登录、注册和会话校验入口。</p>
            </div>
            <div className="hero-card">
              <span className="hero-label">Deploy</span>
              <strong>Vercel Runtime</strong>
              <p>前端和接口同时发布，减少分叉状态。</p>
            </div>
            <div className="hero-card">
              <span className="hero-label">Content</span>
              <strong>Unified Data Layer</strong>
              <p>博客、影像、记录共用一套内容模型。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="panel p-8">
          <p className="section-chip">Featured Flow</p>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">
            保留原来“个人空间”的感觉，但把登录和全栈能力藏得更自然。
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
            这次首页不再做成产品后台，而是继续维持个人主页的叙事感。你可以从这里直接进入登录、内容模块和工作台，但整体看上去仍然像你的网站，而不是一个通用模板。
          </p>
          <div className="mt-8 grid gap-4">
            <Link href="/login" className="panel flex items-center justify-between gap-4 p-5 transition hover:-translate-y-1">
              <div>
                <p className="font-semibold text-white">进入站内账号</p>
                <p className="mt-1 text-sm text-[var(--muted)]">直接登录，进入全栈工作台。</p>
              </div>
              <span className="text-[var(--accent-strong)]">01</span>
            </Link>
            <Link href="/blog" className="panel flex items-center justify-between gap-4 p-5 transition hover:-translate-y-1">
              <div>
                <p className="font-semibold text-white">阅读博客与项目记录</p>
                <p className="mt-1 text-sm text-[var(--muted)]">继续保留原站里“写东西”的主线。</p>
              </div>
              <span className="text-[var(--accent-strong)]">02</span>
            </Link>
            <Link href="/studio" className="panel flex items-center justify-between gap-4 p-5 transition hover:-translate-y-1">
              <div>
                <p className="font-semibold text-white">打开工作台</p>
                <p className="mt-1 text-sm text-[var(--muted)]">把登录后能力收进更私人的入口里。</p>
              </div>
              <span className="text-[var(--accent-strong)]">03</span>
            </Link>
          </div>
        </article>

        <article className="panel p-8">
          <p className="section-chip">Today Mood</p>
          <h2 className="text-3xl font-semibold text-white">现在最值得继续打磨的三个方向</h2>
          <div className="mt-6 space-y-4">
            {capabilityCards.map((card, index) => (
              <article key={card.title} className="panel p-5">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-[rgba(34,211,238,0.12)] text-sm font-bold text-[var(--accent-strong)]">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">{card.eyebrow}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{card.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-10">
        <SectionHeading
          eyebrow="Why This Version"
          title="这次改版不只是换皮，而是把站点的结构也一起理顺。"
          description="旧站的问题不是不够花哨，而是静态页面、真实前端项目、后端和发布渠道彼此脱节。新版先把骨架接通，再让视觉升级。"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {capabilityCards.map((card) => (
            <article key={card.title} className="panel p-7">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent-strong)]">
                {card.eyebrow}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                {card.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="panel p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Latest Writing
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                最近的文章与思考
              </h2>
            </div>
            <Link href="/blog" className="text-sm text-[var(--accent-strong)]">
              查看全部
            </Link>
          </div>
          <div className="mt-8 space-y-6">
            {blogPosts.map((post) => (
              <article key={post.id} className="border-t border-[var(--line)] pt-6 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                  <span>{post.publishedAt}</span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {post.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  {post.summary}
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Memory Board
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                更有氛围感的相册模块
              </h2>
            </div>
            <Link href="/album" className="text-sm text-[var(--accent-strong)]">
              进入相册
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {albumShots.map((shot) => (
              <article key={shot.id} className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.03)]">
                <div className={`h-40 bg-gradient-to-br ${shot.accent}`} />
                <div className="space-y-3 p-5">
                  <p className="text-sm text-[var(--muted)]">
                    {shot.location} / {shot.season}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{shot.title}</h3>
                  <p className="text-sm leading-6 text-[var(--muted)]">{shot.description}</p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <article className="panel p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Journal
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            日记区域保留个人感，不做成冷冰冰的信息流。
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            这里更像一个被整理好的时间线，适合继续接情绪标签、归档与私密权限。站点更完整之后，表达也会更轻松。
          </p>
          <Link href="/diary" className="button-secondary mt-8 inline-flex">
            查看记录
          </Link>
        </article>

        <div className="space-y-4">
          {diaryEntries.map((entry) => (
            <article key={entry.id} className="panel p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span>{entry.createdAt}</span>
                <span>{entry.weather}</span>
                <span>{entry.mood}</span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {entry.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                {entry.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
