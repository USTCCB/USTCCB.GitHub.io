// src/lib/embeddings.ts
// 封装 Embedding 调用，支持 OpenAI / DeepSeek 两个提供商
// 在 .env 里设置 EMBEDDING_PROVIDER=openai 或 deepseek

import OpenAI from 'openai';

// ── 配置 ──────────────────────────────────────────────────
const PROVIDER = process.env.EMBEDDING_PROVIDER ?? 'openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

// DeepSeek 兼容 OpenAI SDK，只需换 baseURL
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  baseURL: 'https://api.deepseek.com',
});

const MODEL_MAP = {
  openai: {
    client: openaiClient,
    model: 'text-embedding-3-small',
    dim: 1536,
  },
  deepseek: {
    client: deepseekClient,
    model: 'deepseek-embedding',   // DeepSeek embedding 接口
    dim: 1024,
  },
} as const;

// ── 核心函数 ──────────────────────────────────────────────

/**
 * 单条文本向量化
 */
export async function embedText(text: string): Promise<number[]> {
  const { client, model } = MODEL_MAP[PROVIDER as keyof typeof MODEL_MAP] ?? MODEL_MAP.openai;
  const resp = await client.embeddings.create({ model, input: text });
  return resp.data[0].embedding;
}

/**
 * 批量向量化（自动分批，避免超 token 限制）
 * 每批最多 20 条，适合大量 chunk 上传
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 20;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { client, model } = MODEL_MAP[PROVIDER as keyof typeof MODEL_MAP] ?? MODEL_MAP.openai;
    const resp = await client.embeddings.create({ model, input: batch });
    // 按返回顺序排序（API 保证，但防御性处理）
    const sorted = resp.data.sort((a, b) => a.index - b.index);
    results.push(...sorted.map(d => d.embedding));
  }

  return results;
}

/**
 * 向量格式化为 pgvector SQL 字符串
 * 例：[0.1, 0.2, ...] → '[0.1,0.2,...]'
 */
export function formatVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}
