'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

type AuthPanelProps = {
  mode: 'login' | 'register';
  demoEmail: string;
  demoPasswordHint: string;
};

export function AuthPanel({
  mode,
  demoEmail,
  demoPasswordHint,
}: AuthPanelProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(mode === 'login' ? demoEmail : '');
  const [password, setPassword] = useState(mode === 'login' ? demoPasswordHint : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response =
        mode === 'login'
          ? await authApi.login({ email, password })
          : await authApi.register({ username: name, email, password });

      const token = response.data?.data?.token;
      if (!token) {
        throw new Error('登录结果缺少 token');
      }

      localStorage.setItem('token', token);
      localStorage.setItem(
        'viewer',
        JSON.stringify(response.data?.data?.user || { email, name: name || 'Guest' })
      );

      router.push('/studio');
      router.refresh();
    } catch (submissionError: any) {
      setError(
        submissionError?.response?.data?.error ||
          submissionError?.message ||
          '提交失败，请稍后再试。'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel flex flex-col gap-5 p-8" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">
          {mode === 'login' ? '登录进入新版个人站。' : '创建一个预览账号。'}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {mode === 'login'
            ? '当前站点已经提供可直接体验的登录入口。先用预览账号进入，后续再替换为真实数据库用户体系。'
            : '这是当前全栈站点里的预览注册流，适合先体验后台和内容入口。'}
        </p>
      </div>

      {mode === 'register' && (
        <label className="space-y-2">
          <span className="text-sm text-[var(--muted)]">昵称</span>
          <input
            className="field-input"
            placeholder="比如 CB"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
      )}

      <label className="space-y-2">
        <span className="text-sm text-[var(--muted)]">邮箱</span>
        <input
          className="field-input"
          type="email"
          placeholder="you@ustc.chat"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-[var(--muted)]">密码</span>
        <input
          className="field-input"
          type="password"
          placeholder="输入密码"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? (
        <p className="rounded-2xl bg-[rgba(184,90,61,0.12)] px-4 py-3 text-sm text-[var(--accent-strong)]">
          {error}
        </p>
      ) : null}

      <button className="button-primary w-full" disabled={submitting} type="submit">
        {submitting ? '处理中...' : mode === 'login' ? '进入站点' : '创建并进入'}
      </button>

      {mode === 'login' ? (
        <div className="rounded-[24px] border border-[var(--line)] bg-white/70 p-5 text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--ink)]">预览账号</p>
          <p className="mt-2">邮箱：{demoEmail}</p>
          <p>密码：{demoPasswordHint}</p>
        </div>
      ) : null}
    </form>
  );
}
