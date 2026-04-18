import Link from 'next/link';
import { SectionHeading } from '@/components/SectionHeading';
import {
  capabilityCards,
  moduleCards,
  blogPosts,
  diaryEntries,
  siteStats,
} from '@/lib/site-content';

export default function Home() {
  return (
    <div className="page-shell space-y-8 pb-24">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-eyebrow">USTCCB Personal Hub</span>
            <span className="section-chip">Deep Focus Edition</span>
          </div>

          <h1 className="hero-title">
            一座更安静、更高级，也真正能持续写东西的个人中枢。
          </h1>

          <p className="hero-description">
            这次不再做“看起来像产品模板”的主页，而是把写作、相册、日记和站内工具都收进一套深色、克制、长期可维护的个人系统里。前端界面更完整，内容入口更顺，图片链路也正在从旧方案迁向 Cloudflare R2。
          </p>

          <div className="hero-actions">
            <Link href="/diary" className="button-primary">
              立即写一篇
            </Link>
            <Link href="/album" className="button-secondary">
              打开相册工作流
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {capabilityCards.map((card) => (
              <article key={card.title} className="panel p-6">
                <p className="hero-label">{card.eyebrow}</p>
                <strong className="mt-3 block text-xl text-white">{card.title}</strong>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-rail">
          <div className="stats-grid">
            {siteStats.map((item) => (
              <article key={item.label} className="metric-panel">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="hero-stack">
            <article className="hero-card">
              <span className="hero-label">Publishing Rail</span>
              <strong>Diary + Gallery + Blog</strong>
              <p>把公开写作、私人记录和图像整理进同一条内容流，而不是互相断开的三套页面。</p>
            </article>
            <article className="hero-card">
              <span className="hero-label">Assets Migration</span>
              <strong>Cloudflare R2 Ready</strong>
              <p>上传逻辑已经抽象成统一资产层，等待账号启用 R2 后切到正式对象存储即可。</p>
            </article>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="panel p-8">
          <SectionHeading
            eyebrow="Editorial Layout"
            title="首页像一本深色工作日志，而不是堆卡片的 SaaS 首页。"
            description="视觉上借了 Linear、Raycast 和 Craft 那种克制、密度适中、留白很讲究的感觉，但内容仍然是个人站叙事。重点不是炫，而是让你愿意每天打开它。"
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {moduleCards.slice(0, 4).map((card) => (
              <Link key={card.id} href={card.href} className="module-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="hero-label">{card.eyebrow}</p>
                    <h3 className="mt-3 text-2xl text-white">{card.title}</h3>
                  </div>
                  <span className="module-card__badge">{card.badge}</span>
                </div>
                <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--muted-strong)]">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel p-8">
          <p className="section-chip">Current Focus</p>
          <h2 className="mt-5 font-[var(--font-serif)] text-5xl leading-[0.98] tracking-[-0.05em] text-white">
            让网站继续像“你自己的空间”。
          </h2>
          <div className="mt-6 space-y-5 text-[15px] leading-8 text-[var(--muted-strong)]">
            <p>保留个人站的温度，不做成冷冰冰的后台面板。</p>
            <p>上传、发布、归档这些真正要用的功能，慢慢变成自然的操作，而不是演示用的入口。</p>
            <p>图片统一迁进资产层，后续可以直接接自定义域名 `assets.ustccb.com`。</p>
          </div>
          <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5">
            <p className="hero-label">System Note</p>
            <p className="mt-3 text-white">当前线上已经能通过站点入口真实写入日记。</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              图片链路已统一为资产抽象，等 Cloudflare 账号启用 R2 后会直接切换到对象存储公开 URL。
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="panel p-8">
          <p className="section-chip">Writing Desk</p>
          <div className="mt-5 space-y-6">
            {blogPosts.map((post) => (
              <article key={post.id} className="border-t border-[var(--line)] pt-6 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                  <span>{post.publishedAt}</span>
                </div>
                <h3 className="mt-3 text-3xl text-white">{post.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{post.summary}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel p-8">
          <p className="section-chip">Journal Strip</p>
          <div className="mt-5 space-y-4">
            {diaryEntries.map((entry) => (
              <article key={entry.id} className="rounded-[22px] border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-5">
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span>{entry.createdAt}</span>
                  <span>{entry.weather}</span>
                  <span>{entry.mood}</span>
                </div>
                <h3 className="mt-3 text-2xl text-white">{entry.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{entry.excerpt}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
