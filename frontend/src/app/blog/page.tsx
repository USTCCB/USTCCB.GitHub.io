import { SectionHeading } from '@/components/SectionHeading';
import { blogPosts } from '@/lib/site-content';

export default function BlogPage() {
  return (
    <div className="page-shell space-y-12 py-16">
      <SectionHeading
        eyebrow="Blog"
        title="把研究、思考和复盘整理成可反复取用的文章。"
        description="这里展示的是新版全栈站点里的内容层。后面接数据库时，这一页的结构不需要重做，只需要把数据源切换掉。"
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <article className="panel p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Featured
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[var(--ink)]">
            {blogPosts[0].title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {blogPosts[0].summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span>{blogPosts[0].category}</span>
            <span>{blogPosts[0].readTime}</span>
            <span>{blogPosts[0].publishedAt}</span>
          </div>
        </article>

        <aside className="panel flex flex-col justify-between p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              API
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
              `/api/blog`
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              页面和接口共用同一套数据结构，后续接 PostgreSQL 或 CMS 时，前端消费方式可以保持不变。
            </p>
          </div>
          <div className="mt-8 rounded-[28px] bg-[var(--ink)] p-6 text-sm text-white/72">
            <p>GET /api/blog</p>
            <p className="mt-2 text-white">返回 posts、total 和统一响应结构。</p>
          </div>
        </aside>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post) => (
          <article key={post.id} className="panel p-7 transition duration-300 hover:-translate-y-1">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-[var(--ink)]">
                {post.category}
              </span>
              <span>{post.readTime}</span>
              <span>{post.publishedAt}</span>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[var(--ink)]">
              {post.title}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {post.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
