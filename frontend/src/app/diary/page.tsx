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
    const response = await diaryApi.getDiaries(1, 50);
    const payload = response.data as DiaryResponse;
    setEntries(payload.data?.diaries || []);
  }

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError('');
      try {
        await loadEntries();
      } catch {
        setError('现在还没连上可用的日记服务。');
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
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
        eyebrow="Journal"
        title="在这里写下来的内容，会直接进入站点自己的时间线。"
        description="这一页现在接的是真接口，不是静态演示。你写下来的标题、正文、天气和心情会立即回到下方时间线，形成可持续归档的私人记录。"
      />

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <form className="panel compose-panel p-8" onSubmit={handleSubmit}>
          <p className="section-chip">Writing Console</p>
          <h2 className="mt-5 font-[var(--font-serif)] text-5xl leading-[0.98] tracking-[-0.05em] text-white">
            写一篇今天真正想留下来的东西。
          </h2>
          <p className="mt-5 text-sm leading-8 text-[var(--muted-strong)]">
            这不是社交信息流，也不是演示卡片，而是一块适合长期记录的深色写作面板。输入尽量轻，读取尽量安静。
          </p>

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
              className="field-input min-h-[260px] resize-y"
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

          <div className="mt-6 flex flex-wrap gap-4">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? '正在发布...' : '发布日记'}
            </button>
            <span className="text-sm leading-7 text-[var(--muted)]">
              不绕后台，直接写入站点内容层。
            </span>
          </div>

          {error ? <p className="mt-4 text-sm text-[var(--warning)]">{error}</p> : null}
        </form>

        <div className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-3">
            <article className="metric-panel">
              <span>已发布</span>
              <strong>{entries.length}</strong>
            </article>
            <article className="metric-panel">
              <span>最新天气</span>
              <strong>{entries[0]?.weather || '—'}</strong>
            </article>
            <article className="metric-panel">
              <span>最新心情</span>
              <strong>{entries[0]?.mood || '—'}</strong>
            </article>
          </section>

          {loading ? (
            <article className="panel p-7 text-sm text-[var(--muted)]">正在读取日记...</article>
          ) : null}

          {!loading && entries.length === 0 ? (
            <article className="panel p-7 text-sm leading-7 text-[var(--muted)]">
              还没有日记内容。左侧发布第一篇之后，这里会马上出现一条新的时间线记录。
            </article>
          ) : null}

          {entries.map((entry, index) => (
            <article key={entry.id} className="panel grid gap-6 p-7 lg:grid-cols-[110px_1fr]">
              <div className="border-b border-[var(--line)] pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                <p className="hero-label">Entry {String(index + 1).padStart(2, '0')}</p>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {new Date(entry.created_at).toLocaleDateString('zh-CN')}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {entry.weather || '未填写天气'}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {entry.mood || '未填写心情'}
                </p>
              </div>
              <div>
                <h3 className="text-3xl text-white">{entry.title}</h3>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[var(--muted-strong)]">
                  {entry.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
