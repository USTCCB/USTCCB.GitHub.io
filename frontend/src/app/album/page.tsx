'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { albumApi, fileApi } from '@/lib/api';

type Album = {
  id: number;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  photo_count?: number | string;
};

type UploadPhoto = {
  id: number;
  url: string;
  title?: string | null;
  description?: string | null;
  created_at?: string;
};

type AlbumListResponse = {
  success: boolean;
  data?: Album[];
  error?: string;
};

type UploadResponse = {
  url: string;
  key: string;
  size: number;
};

export default function AlbumPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<UploadPhoto[]>([]);
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

  const heroCount = useMemo(() => photos.length, [photos]);

  async function loadAlbums() {
    setLoading(true);
    setError('');

    try {
      const response = await albumApi.getAlbums();
      const payload = response.data as AlbumListResponse;
      const list = payload.data || [];
      setAlbums(list);
    } catch (err) {
      setError('现在还没连上可用的相册服务。');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAlbums();
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);

    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
      if (!form.photoTitle.trim()) {
        const name = selected.name.replace(/\.[^.]+$/, '');
        setForm((current) => ({ ...current, photoTitle: name }));
      }
    } else {
      setPreviewUrl('');
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
    await loadAlbums();
    return createdAlbum.id;
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

      const photoResponse = await albumApi.addPhoto(albumId, {
        url: uploadData.url,
        title: form.photoTitle.trim() || file.name,
        description: form.photoDescription.trim(),
        tags: [],
      });

      const photo = photoResponse.data?.data as UploadPhoto;
      setPhotos((current) => [photo, ...current]);
      setFile(null);
      setPreviewUrl('');
      setForm((current) => ({
        ...current,
        photoTitle: '',
        photoDescription: '',
      }));
      await loadAlbums();
    } catch (err: any) {
      setError(err?.response?.data?.error || '上传图片失败。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell space-y-10 pb-24">
      <SectionHeading
        eyebrow="Album"
        title="图片上传这次是真的，不再只是相册占位展示。"
        description="你可以直接往网站里传图，图片会先走上传接口，再写进相册数据里。后面再继续做分类、标签和筛选。"
      />

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <form className="panel compose-panel p-8" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="section-chip">Image Upload</p>
            <h2 className="text-3xl font-semibold text-white">上传一张新的图片</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              先把上传路径做顺：选图、写标题、写描述、立即入相册。
            </p>
          </div>

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
                  <p className="text-lg font-semibold text-white">点这里选择图片</p>
                  <p className="text-sm text-[var(--muted)]">支持 PNG / JPG / WEBP / GIF，单张 10MB 以内</p>
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
              className="field-input min-h-[140px] resize-y"
              placeholder="写一点这张图的描述"
              value={form.photoDescription}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  photoDescription: event.target.value,
                }))
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? '正在上传...' : '上传到相册'}
            </button>
            <span className="text-sm text-[var(--muted)]">
              当前已连接真实上传接口和相册写入接口。
            </span>
          </div>

          {error ? <p className="mt-4 text-sm text-[#fda4af]">{error}</p> : null}
        </form>

        <section className="space-y-4">
          <div className="panel p-6">
            <p className="section-chip">Live Album</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">当前相册状态</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="metric-panel">
                <span>已有相册</span>
                <strong>{albums.length}</strong>
              </div>
              <div className="metric-panel">
                <span>本页新传图片</span>
                <strong>{heroCount}</strong>
              </div>
            </div>
          </div>

          {loading ? (
            <article className="panel p-7 text-sm text-[var(--muted)]">正在读取相册...</article>
          ) : null}

          {!loading && albums.length === 0 ? (
            <article className="panel p-7 text-sm text-[var(--muted)]">
              还没有相册，上传第一张图时会自动创建一个默认相册。
            </article>
          ) : null}

          {albums.map((album) => (
            <article key={album.id} className="panel p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent-strong)]">
                Album
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{album.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {album.description || '这个相册还没有描述。'}
              </p>
              <p className="mt-4 text-sm text-[var(--muted)]">
                图片数量：{album.photo_count || 0}
              </p>
            </article>
          ))}

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
                <h3 className="text-2xl font-semibold text-white">
                  {photo.title || '未命名图片'}
                </h3>
                <p className="text-sm leading-7 text-[var(--muted)]">
                  {photo.description || '这张图还没有描述。'}
                </p>
              </div>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
