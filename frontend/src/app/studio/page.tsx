'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

type Viewer = {
  name: string;
  email: string;
  role?: string;
};

export default function StudioPage() {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await authApi.getMe();
        setViewer(response.data?.data || null);
      } catch {
        const cached = localStorage.getItem('viewer');
        setViewer(cached ? JSON.parse(cached) : null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('viewer');
    window.location.href = '/login';
  }

  return (
    <div className="page-shell space-y-8 pb-20">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-8">
          <p className="hero-eyebrow">Studio / Signed In</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-white">
            {loading
              ? '正在加载你的工作台...'
              : `欢迎回来，${viewer?.name || 'Visitor'}`}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            这里是新版站点的已登录入口。后面继续接数据库、内容编辑和后台统计时，可以直接在这块往里扩展。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/blog" className="button-primary">
              管理内容模块
            </Link>
            <button className="button-secondary" onClick={logout} type="button">
              退出登录
            </button>
          </div>
        </div>

        <div className="panel p-8">
          <p className="section-chip">Session</p>
          <div className="mt-5 space-y-4 text-sm text-[var(--muted)]">
            <p>姓名：{viewer?.name || '未登录'}</p>
            <p>邮箱：{viewer?.email || '未登录'}</p>
            <p>角色：{viewer?.role || 'guest'}</p>
            <p>接口：`/api/auth/login`、`/api/auth/me` 已接通</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="panel p-6">
          <p className="section-chip">Content</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">博客</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            结构和视觉已经到位，下一步可以接真正的文章发布与标签过滤。
          </p>
        </article>
        <article className="panel p-6">
          <p className="section-chip">Memory</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">相册</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            目前是展示型相册，后面可以切入真实上传和相册管理。
          </p>
        </article>
        <article className="panel p-6">
          <p className="section-chip">System</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">接口状态</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            当前站点接口和页面已经在同一个 Next.js 运行时中统一部署。
          </p>
        </article>
      </section>
    </div>
  );
}
