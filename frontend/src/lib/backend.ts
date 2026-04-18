const DEFAULT_BACKEND_BASE_URL = 'https://backend-production-4de2.up.railway.app';

export function getBackendBaseUrl() {
  return (
    process.env.BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
    DEFAULT_BACKEND_BASE_URL
  ).replace(/\/+$/, '');
}

export async function readBackendJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    cache: 'no-store',
  });

  const text = await response.text();
  let data: T | { error?: string } | null = null;

  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error || '请求后端服务失败';
    throw new Error(message);
  }

  return data as T;
}
