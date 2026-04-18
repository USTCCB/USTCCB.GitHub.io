import { SectionHeading } from '@/components/SectionHeading';
import { albumShots } from '@/lib/site-content';

export default function AlbumPage() {
  return (
    <div className="page-shell space-y-12 py-16">
      <SectionHeading
        eyebrow="Album"
        title="给生活里的细小画面留一个更有质感的陈列方式。"
        description="这一页是新版站点里相册模块的展示雏形，后面可以继续接真实上传、标签筛选和相册管理。"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {albumShots.map((shot, index) => (
          <article
            key={shot.id}
            className={`panel overflow-hidden p-0 ${index % 3 === 0 ? 'md:col-span-2' : ''}`}
          >
            <div className={`min-h-[250px] bg-gradient-to-br ${shot.accent}`} />
            <div className="space-y-4 p-7">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span>{shot.location}</span>
                <span>{shot.season}</span>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--ink)]">{shot.title}</h2>
              <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
                {shot.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
