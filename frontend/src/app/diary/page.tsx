import { SectionHeading } from '@/components/SectionHeading';
import { diaryEntries } from '@/lib/site-content';

export default function DiaryPage() {
  return (
    <div className="page-shell space-y-12 py-16">
      <SectionHeading
        eyebrow="Diary"
        title="把长期记录从“零散文本”整理成更舒服的时间线。"
        description="这里保留日常感，不强行产品化得太硬。情绪、天气、片段和当时的节奏，都值得被安静地展示出来。"
      />

      <div className="space-y-6">
        {diaryEntries.map((entry, index) => (
          <article key={entry.id} className="panel grid gap-6 p-7 md:grid-cols-[120px_1fr]">
            <div className="space-y-2 border-b border-[var(--line)] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Day {index + 1}
              </p>
              <p className="text-sm text-[var(--muted)]">{entry.createdAt}</p>
              <p className="text-sm text-[var(--muted)]">
                {entry.weather} / {entry.mood}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--ink)]">{entry.title}</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
                {entry.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
