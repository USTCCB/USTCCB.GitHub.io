'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { albumApi, fileApi } from '@/lib/api';

type Album = {
  id: number;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  photo_count?: number | string;
};

type Photo = {
  id: number;
  url: string;
  object_key: string;
  title?: string | null;
  description?: string | null;
  created_at?: string;
};

type AlbumListResponse = {
  success: boolean;
  data?: Album[];
  error?: string;
};

type PhotoListResponse = {
  success: boolean;
  data?: Photo[];
  error?: string;
};

type UploadResponse = {
  success?: boolean;
  url: string;
  key: string;
  size: number;
  warning?: string;
};

export default function AlbumPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    albumTitle: '我的相册',
    albumDescription: '网站里持续更新的日常图像记录。',
    photoTitle: '',
    photoDescription: '',
  });

  async function loadAlbums() {
    const response = await albumApi.getAlbums();
    const payload = response.data as AlbumListResponse;
    const list = payload.data || [];
    setAlbums(list);
    return list;
  }

  async function loadPhotos(albumId: number) {
    const response = await albumApi.getPhotos(albumId);
    const payload = response.data as PhotoListResponse;
    setPhotos(payload.data || []);
  }

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError('');

      try {
        const list = await loadAlbums();
        if (list[0]?.id) {
          await loadPhotos(list[0].id);
        }
      } catch (err) {
        setError('现在还没连上可用的相册服务。');
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);

    if (!selected) {
      setPreviewUrl('');
      return;
    }

    setPreviewUrl(URL.createObjectURL(selected));
    if (!form.photoTitle.trim()) {
      setForm((current) => ({
        ...current,
        photoTitle: selected.name.replace(/\.[^.]+$/, ''),
      }));
    }
  }

  async function ensureAlbumId() {
    if (albums[0]?.id) {
      return albums[0].id;
    }

    const createResponse = await albumApi.createAlbum({
      title: form.albumTitle.trim() || '我的相册',
      description: form.albumDescription.trim(),
      coverImage: previewUrl || null,
    });

    const createdAlbum = createResponse.data?.data as Album;
    const list = await loadAlbums();
    return createdAlbum?.id || list[0]?.id;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError('先选择一张图片。');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fileApi.uploadImage(formData);
      const uploadData = uploadResponse.data as UploadResponse;
      const albumId = await ensureAlbumId();

      await albumApi.addPhoto(albumId, {
        url: uploadData.url,
        key: uploadData.key,
        title: form.photoTitle.trim() || file.name,
        description: form.photoDescription.trim(),
      });

      await loadAlbums();
      await loadPhotos(albumId);
      setFile(null);
      setPreviewUrl('');
      setForm((current) => ({
        ...current,
        photoTitle: '',
        photoDescription: '',
      }));

      if (uploadData.warning) {
        setError(uploadData.warning);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || '上传图片失败。');
    } finally {
      setSubmitting(false);
    }
  }

  const totalPhotos = albums.reduce((count, album) => count + Number(album.photo_count || 0), 0);

  return (
    <div className="page-shell space-y-10 pb-24">
      <SectionHeading
        eyebrow="Gallery"
        title="相册不是临时占位，而是一条真正能接收图片资产的内容流。"
        description="上传先走统一资产入口，再写入相册记录。代码已经按 R2 资产层重构，当前账号启用 R2 后会直接切到正式对象存储公开 URL。"
      />

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <form className="panel compose-panel p-8" onSubmit={handleSubmit}>
          <p className="section-chip">Asset Intake</p>
          <h2 className="mt-5 font-[var(--font-serif)] text-5xl leading-[0.98] tracking-[-0.05em] text-white">
            把今天的新图，收进这座网站。
          </h2>
          <p className="mt-5 text-sm leading-8 text-[var(--muted-strong)]">
            文件上传、对象键生成、相册写入都已经串起来了。你上传的不再只是一个预览，而是一条真实记录。
          </p>

          <div className="mt-8 space-y-4">
            <label className="upload-dropzone">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={handleFileChange}
              />

              {previewUrl ? (
                <div className="upload-preview">
                  <img src={previewUrl} alt="上传预览" className="upload-preview__image" />
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <p className="text-xl font-semibold text-white">选择一张图片开始上传</p>
                  <p className="text-sm text-[var(--muted)]">支持 PNG / JPG / WEBP / GIF</p>
                </div>
              )}
            </label>

            <input
              className="field-input"
              placeholder="图片标题"
              value={form.photoTitle}
              onChange={(event) =>
                setForm((current) => ({ ...current, photoTitle: event.target.value }))
              }
            />

            <textarea
              className="field-input min-h-[150px] resize-y"
              placeholder="写一点关于这张图的说明"
              value={form.photoDescription}
              onChange={(event) =>
                setForm((current) => ({ ...current, photoDescription: event.target.value }))
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? '正在写入...' : '上传到相册'}
            </button>
            <span className="text-sm leading-7 text-[var(--muted)]">
              目标 bucket：`ustccb-hub-assets`
            </span>
          </div>

          {error ? <p className="mt-4 text-sm text-[var(--warning)]">{error}</p> : null}
        </form>

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            <article className="metric-panel">
              <span>相册数量</span>
              <strong>{albums.length}</strong>
            </article>
            <article className="metric-panel">
              <span>已收录图片</span>
              <strong>{totalPhotos}</strong>
            </article>
            <article className="metric-panel">
              <span>当前视图</span>
              <strong>{photos.length}</strong>
            </article>
          </section>

          <section className="panel p-8">
            <p className="section-chip">Archive Shelf</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[var(--muted-strong)]"
                >
                  {album.title} · {album.photo_count || 0}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {loading ? (
              <article className="panel p-7 text-sm text-[var(--muted)]">正在读取相册...</article>
            ) : null}

            {!loading && photos.length === 0 ? (
              <article className="panel p-7 text-sm leading-7 text-[var(--muted)] sm:col-span-2">
                还没有图片记录。上传第一张之后，这里会直接显示实际写入的图片 URL 和相册结果。
              </article>
            ) : null}

            {photos.map((photo) => (
              <article key={photo.id} className="panel overflow-hidden p-0">
                <div className="relative min-h-[280px]">
                  <img
                    src={photo.url}
                    alt={photo.title || '上传图片'}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="hero-label">{photo.object_key}</p>
                  <h3 className="text-2xl text-white">{photo.title || '未命名图片'}</h3>
                  <p className="text-sm leading-7 text-[var(--muted-strong)]">
                    {photo.description || '这张图还没有补充描述。'}
                  </p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
