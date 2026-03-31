-- ============================================================
-- RAG 模块数据库迁移
-- 在 Railway PostgreSQL 控制台或 psql 中执行
-- ============================================================

-- 1. 开启 pgvector 扩展（Railway PostgreSQL 已内置，直接开启即可）
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 文档主表（存储上传的原始文件信息）
CREATE TABLE IF NOT EXISTS rag_documents (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER,                          -- 可关联你现有的 users 表
  filename    TEXT        NOT NULL,
  file_type   TEXT        NOT NULL DEFAULT 'text', -- 'pdf' | 'text' | 'markdown'
  char_count  INTEGER     DEFAULT 0,
  chunk_count INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 文档分块表（向量存储核心）
--    embedding 维度 1536 对应 OpenAI text-embedding-3-small
--    如果用 DeepSeek embedding，改成 vector(1024)
CREATE TABLE IF NOT EXISTS rag_chunks (
  id          SERIAL PRIMARY KEY,
  document_id INTEGER     REFERENCES rag_documents(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,              -- 原文内容（用于回答时展示来源）
  chunk_index INTEGER     NOT NULL,              -- 第几块
  embedding   vector(1536),                      -- 向量
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 向量相似度索引（IVFFlat，适合 10 万条以内）
--    注意：需要表内有数据后再建索引效果最好
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
  ON rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. 对话历史表（可选，用于多轮对话记忆）
CREATE TABLE IF NOT EXISTS rag_conversations (
  id          SERIAL PRIMARY KEY,
  document_id INTEGER     REFERENCES rag_documents(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
