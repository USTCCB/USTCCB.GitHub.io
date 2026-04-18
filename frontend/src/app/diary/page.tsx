'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { diaryApi } from '@/lib/api';

type DiaryItem = {
  id: number;
  title: string;
  content: string;
  mood?: string | null;
  weather?: string | null;
  created_at: string;
};

type DiaryResponse = {
  success: boolean;
  data?: {
    diaries: DiaryItem[];
    total: number;
  };
  error?: string;
};

const moodOptions = ['平静', '开心', '疲惫', '专注', '想记录一下'];
const weatherOptions = ['晴', '多云', '小雨', '阵雨', '夜晚'];

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    mood: moodOptions[0],
    weather: weatherOptions[0],
  });

  async function loadEntries() {
    setLoading(true);
    setError('');

    try {
      const response = await diaryApi.getDiaries(1, 50);
      const payload = response.data as DiaryResponse;
      setEntries(payload.data?.diaries || []);
    } catch (err) {
      setError('现在还没连上可用的日记服务。');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEntries();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError('标题和正文都要填写。');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await diaryApi.createDiary({
        title: form.title.trim(),
        content: form.content.trim(),
        mood: form.mood,
        weather: form.weather,
        isPrivate: false,
      });

      setForm({
        title: '',
        content: '',
        mood: moodOptions[0],
        weather: weatherOptions[0],
      });

      await loadEntries();
    } catch (err: any) {
      setError(err?.response?.data?.error || '发布日记失败。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell space-y-10 pb-24">
      <SectionHeading
        eyebrow="Diary"
        title="直接写、直接发，把日记真的收进网站里。"
        description="这次不是静态占位页。你可以在这里直接新建日记，发出去后下面的时间线会立即刷新。"
      />

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <form className="panel compose-panel p-8" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="section-chip">Quick Publish</p>
            <h2 className="text-3xl font-semibold text-white">写一篇新的日记</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              先把最需要的能力做实：标题、正文、天气、心情，发完就能在时间线上看到。
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <input
              className="field-input"
              placeholder="今天这篇想叫什么"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />

            <textarea
              className="field-input min-h-[220px] resize-y"
              placeholder="把今天真正想记下来的内容写在这里"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="compose-label">心情</span>
                <select
                  className="field-input"
                  value={form.mood}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mood: event.target.value }))
                  }
                >
                  {moodOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="compose-label">天气</span>
                <select
                  className="field-input"
                  value={form.weather}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, weather: event.target.value }))
                  }
                >
                  {weatherOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? '正在发布...' : '发布日记'}
            </button>
            <span className="text-sm text-[var(--muted)]">
              不走登录流程，直接以站内发布模式写入。
            </span>
          </div>

          {error ? <p className="mt-4 text-sm text-[#fda4af]">{error}</p> : null}
        </form>

        <section className="space-y-4">
          <div className="panel p-6">
            <p className="section-chip">Timeline</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">最近的日记记录</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              这里显示的是接口里真实返回的数据，不再是写死的展示卡片。
            </p>
          </div>

          {loading ? (
            <article className="panel p-7 text-sm text-[var(--muted)]">正在读取日记...</article>
          ) : null}

          {!loading && entries.length === 0 ? (
            <article className="panel p-7 text-sm text-[var(--muted)]">
              还没有日记内容，先在左侧发布第一篇。
            </article>
          ) : null}

          {!loading &&
            entries.map((entry, index) => (
              <article
                key={entry.id}
                className="panel grid gap-6 p-7 md:grid-cols-[120px_1fr]"
              >
                <div className="space-y-2 border-b border-[var(--line)] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    Day {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(entry.created_at).toLocaleDateString('zh-CN')}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {entry.weather || '未填写天气'} / {entry.mood || '未填写心情'}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--ink)]">
                    {entry.title}
                  </h3>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[var(--muted)]">
                    {entry.content}
                  </p>
                </div>
              </article>
            ))}
        </section>
      </section>
    </div>
  );
}
