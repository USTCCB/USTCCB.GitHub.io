interface Env {
  DB: D1Database;
  ASSETS_BUCKET?: R2Bucket;
  ALLOWED_ORIGINS?: string;
  ASSETS_BASE_URL?: string;
}

type JsonRecord = Record<string, unknown>;
type DatabaseRecord = Record<string, unknown>;

const DEFAULT_ASSETS_BASE_URL = 'https://assets.ustccb.com';
const LEGACY_PLACEHOLDER = 'legacy-placeholder.jpg';

function json(data: JsonRecord, status = 200, origin?: string | null) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
  });
  applyCorsHeaders(headers, origin);
  return new Response(JSON.stringify(data), { status, headers });
}

function applyCorsHeaders(headers: Headers, origin?: string | null) {
  headers.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'Content-Type, Authorization');
  headers.set('access-control-max-age', '86400');
  if (origin) {
    headers.set('access-control-allow-origin', origin);
  }
}

function getAllowedOrigin(request: Request, env: Env) {
  const requestOrigin = request.headers.get('origin');
  if (!requestOrigin) {
    return '*';
  }

  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] || '*';
}

function getAssetsBaseUrl(env: Env) {
  return (env.ASSETS_BASE_URL || DEFAULT_ASSETS_BASE_URL).replace(/\/+$/, '');
}

function buildAssetUrl(env: Env, key: string) {
  return `${getAssetsBaseUrl(env)}/${key.replace(/^\/+/, '')}`;
}

function sanitizeFilename(filename: string) {
  const normalized = filename.trim().toLowerCase().replace(/\s+/g, '-');
  return normalized.replace(/[^a-z0-9._-]/g, '') || 'asset.bin';
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function normalizeImageUrl(url: string | null | undefined, env: Env, key?: string | null) {
  if (key && env.ASSETS_BUCKET) {
    return buildAssetUrl(env, key);
  }

  if (!url) {
    if (key) {
      return buildAssetUrl(env, key);
    }
    return '';
  }

  if (url.startsWith('data:')) {
    return url;
  }

  if (url.includes('imagedelivery.net')) {
    // Assumption: old Cloudflare Images IDs can not be deterministically mapped to R2 keys,
    // so we return a stable placeholder path until a manual backfill is done.
    return buildAssetUrl(env, LEGACY_PLACEHOLDER);
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return buildAssetUrl(env, url);
}

function mapAlbumRecord(record: DatabaseRecord, env: Env) {
  return {
    ...record,
    cover_image: normalizeImageUrl(record.cover_image as string | null | undefined, env),
  };
}

function mapPhotoRecord(record: DatabaseRecord, env: Env) {
  const rawUrl = record.url as string | null | undefined;
  const objectKey = record.object_key as string | null | undefined;
  return {
    ...record,
    url: normalizeImageUrl(rawUrl, env, objectKey),
  };
}

async function getRequestBody<T>(request: Request) {
  return (await request.json()) as T;
}

async function ensureDefaultAlbum(env: Env) {
  const existing = await env.DB.prepare(
    'SELECT id, title, description, cover_image, created_at FROM albums ORDER BY id ASC LIMIT 1'
  ).first<DatabaseRecord>();

  if (existing) {
    return existing;
  }

  const title = '我的相册';
  const description = '网站里持续更新的日常图像记录。';

  const result = await env.DB.prepare(
    'INSERT INTO albums (title, description) VALUES (?, ?)'
  )
    .bind(title, description)
    .run();

  return {
    id: result.meta.last_row_id,
    title,
    description,
    cover_image: null,
    created_at: new Date().toISOString(),
  };
}

async function handleHealth(request: Request, env: Env) {
  const origin = getAllowedOrigin(request, env);
  return json(
    {
      success: true,
      data: {
        status: 'ok',
        service: 'ustccb-cloudflare-backend',
        runtime: 'cloudflare-workers',
        assetsBaseUrl: getAssetsBaseUrl(env),
        timestamp: new Date().toISOString(),
      },
    },
    200,
    origin
  );
}

async function handleDiaryList(request: Request, env: Env) {
  const origin = getAllowedOrigin(request, env);
  const { results } = await env.DB.prepare(
    'SELECT id, title, content, mood, weather, is_private, created_at, updated_at FROM diaries ORDER BY datetime(created_at) DESC LIMIT 50'
  ).all<DatabaseRecord>();

  return json(
    {
      success: true,
      data: {
        diaries: results || [],
        total: (results || []).length,
        page: 1,
        limit: 50,
      },
    },
    200,
    origin
  );
}

async function handleDiaryCreate(request: Request, env: Env) {
  const origin = getAllowedOrigin(request, env);
  const body = await getRequestBody<{
    title?: string;
    content?: string;
    mood?: string;
    weather?: string;
    isPrivate?: boolean;
  }>(request);

  const title = String(body.title || '').trim();
  const content = String(body.content || '').trim();

  if (!title || !content) {
    return json({ success: false, error: '标题和正文都要填写。' }, 400, origin);
  }

  const timestamp = new Date().toISOString();
  const result = await env.DB.prepare(
    'INSERT INTO diaries (title, content, mood, weather, is_private, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(title, content, body.mood || null, body.weather || null, body.isPrivate ? 1 : 0, timestamp, timestamp)
    .run();

  const created = await env.DB.prepare(
    'SELECT id, title, content, mood, weather, is_private, created_at, updated_at FROM diaries WHERE id = ?'
  )
    .bind(result.meta.last_row_id)
    .first<DatabaseRecord>();

  return json({ success: true, data: created || null }, 201, origin);
}

async function handleAlbumList(request: Request, env: Env) {
  const origin = getAllowedOrigin(request, env);
  await ensureDefaultAlbum(env);

  const { results } = await env.DB.prepare(
    `SELECT a.id, a.title, a.description, a.cover_image, a.created_at,
      (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) AS photo_count
     FROM albums a
     ORDER BY a.id ASC`
  ).all<DatabaseRecord>();

  const albumsWithPhotos = await Promise.all(
    (results || []).map(async (record) => {
      const { results: photoRows } = await env.DB.prepare(
        'SELECT id, album_id, url, object_key, title, description, created_at FROM photos WHERE album_id = ? ORDER BY datetime(created_at) DESC LIMIT 12'
      )
        .bind(Number(record.id))
        .all<DatabaseRecord>();

      return {
        ...mapAlbumRecord(record, env),
        photos: (photoRows || []).map((photo) => mapPhotoRecord(photo, env)),
      };
    })
  );

  return json(
    {
      success: true,
      data: albumsWithPhotos,
    },
    200,
    origin
  );
}

async function handleAlbumCreate(request: Request, env: Env) {
  const origin = getAllowedOrigin(request, env);
  const body = await getRequestBody<{
    title?: string;
    description?: string;
    coverImage?: string | null;
  }>(request);

  const title = String(body.title || '').trim() || '我的相册';
  const description = String(body.description || '').trim() || null;
  const coverImage = body.coverImage || null;

  const result = await env.DB.prepare(
    'INSERT INTO albums (title, description, cover_image, created_at) VALUES (?, ?, ?, ?)'
  )
    .bind(title, description, coverImage, new Date().toISOString())
    .run();

  const created = await env.DB.prepare(
    'SELECT id, title, description, cover_image, created_at FROM albums WHERE id = ?'
  )
    .bind(result.meta.last_row_id)
    .first<DatabaseRecord>();

  return json({ success: true, data: created ? mapAlbumRecord(created, env) : null }, 201, origin);
}

async function handlePhotoList(request: Request, env: Env, albumId: string) {
  const origin = getAllowedOrigin(request, env);
  const { results } = await env.DB.prepare(
    'SELECT id, album_id, url, object_key, title, description, created_at FROM photos WHERE album_id = ? ORDER BY datetime(created_at) DESC'
  )
    .bind(Number(albumId))
    .all<DatabaseRecord>();

  let availableKeys: Set<string> | null = null;
  if (env.ASSETS_BUCKET) {
    const list = await env.ASSETS_BUCKET.list({ prefix: 'images/' });
    availableKeys = new Set(list.objects.map((object) => object.key));
  }

  const photos = (results || []).map((record) => {
    const normalized = mapPhotoRecord(record, env) as DatabaseRecord;
    const objectKey = normalized.object_key as string | undefined;
    if (availableKeys && objectKey && !availableKeys.has(String(objectKey))) {
      return {
        ...normalized,
        url: normalizeImageUrl(String(record.url || ''), env),
      };
    }
    return normalized;
  });

  return json(
    {
      success: true,
      data: photos,
    },
    200,
    origin
  );
}

async function handlePhotoCreate(request: Request, env: Env, albumId: string) {
  const origin = getAllowedOrigin(request, env);
  const body = await getRequestBody<{
    url?: string;
    key?: string;
    title?: string;
    description?: string;
  }>(request);

  const key = String(body.key || '').trim();
  const url = normalizeImageUrl(String(body.url || '').trim(), env, key || null);

  if (!url || !key) {
    return json({ success: false, error: '图片地址和对象键不能为空。' }, 400, origin);
  }

  const result = await env.DB.prepare(
    'INSERT INTO photos (album_id, url, object_key, title, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(Number(albumId), url, key, body.title || null, body.description || null, new Date().toISOString())
    .run();

  const created = await env.DB.prepare(
    'SELECT id, album_id, url, object_key, title, description, created_at FROM photos WHERE id = ?'
  )
    .bind(result.meta.last_row_id)
    .first<DatabaseRecord>();

  return json({ success: true, data: created ? mapPhotoRecord(created, env) : null }, 201, origin);
}

async function handleImageUpload(request: Request, env: Env) {
  const origin = getAllowedOrigin(request, env);
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return json({ success: false, error: 'No file uploaded' }, 400, origin);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return json({ success: false, error: 'Invalid file type' }, 400, origin);
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const objectKey = `images/${Date.now()}-${sanitizeFilename(
    `${crypto.randomUUID()}.${extension}`
  )}`;
  const buffer = await file.arrayBuffer();

  if (env.ASSETS_BUCKET) {
    await env.ASSETS_BUCKET.put(objectKey, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return json(
      {
        success: true,
        url: buildAssetUrl(env, objectKey),
        key: objectKey,
        size: file.size,
      },
      201,
      origin
    );
  }

  // Assumption: keep the current fallback path alive until the Cloudflare account
  // finishes enabling R2. This preserves upload usability during the migration window.
  const dataUrl = `data:${file.type};base64,${arrayBufferToBase64(buffer)}`;
  return json(
    {
      success: true,
      url: dataUrl,
      key: objectKey,
      size: file.size,
      warning: 'R2 尚未在当前 Cloudflare 账号启用，暂时回退为 data URL。启用后会自动切到 R2 对象 URL。',
    },
    201,
    origin
  );
}

async function handleImageRead(request: Request, env: Env, key: string) {
  if (!env.ASSETS_BUCKET) {
    return new Response('R2 not enabled', { status: 404 });
  }

  const object = await env.ASSETS_BUCKET.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  applyCorsHeaders(headers, getAllowedOrigin(request, env));
  return new Response(object.body, { headers });
}

export default {
  async fetch(request, env): Promise<Response> {
    const origin = getAllowedOrigin(request, env);

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (request.method === 'OPTIONS') {
        const headers = new Headers();
        applyCorsHeaders(headers, origin);
        return new Response(null, { status: 204, headers });
      }

      if (path === '/health' || path === '/api/health') {
        return handleHealth(request, env);
      }

      if (path === '/api/diary' && request.method === 'GET') {
        return handleDiaryList(request, env);
      }

      if (path === '/api/diary' && request.method === 'POST') {
        return handleDiaryCreate(request, env);
      }

      if (path === '/api/album' && request.method === 'GET') {
        return handleAlbumList(request, env);
      }

      if (path === '/api/album' && request.method === 'POST') {
        return handleAlbumCreate(request, env);
      }

      const photoMatch = path.match(/^\/api\/album\/(\d+)\/photos$/);
      if (photoMatch && request.method === 'GET') {
        return handlePhotoList(request, env, photoMatch[1]);
      }

      if (photoMatch && request.method === 'POST') {
        return handlePhotoCreate(request, env, photoMatch[1]);
      }

      if (path === '/api/files/upload' && request.method === 'POST') {
        return handleImageUpload(request, env);
      }

      if (path.startsWith('/files/') && request.method === 'GET') {
        return handleImageRead(request, env, path.replace(/^\/files\//, ''));
      }

      return json({ success: false, error: 'Not Found' }, 404, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown worker error';
      console.error('worker-error', message, error);
      return json({ success: false, error: message }, 500, origin);
    }
  },
} satisfies ExportedHandler<Env>;
