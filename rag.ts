// src/routes/rag.ts
// RAG 模块主路由
// 挂载方式（在 app.ts 里）：app.use('/api/rag', ragRouter);

import { Router, Request, Response } from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../db';                          // 你现有的 pg Pool
import { chunkText, extractTextFromPDF } from '../lib/chunker';
import { embedText, embedBatch, formatVector } from '../lib/embeddings';

const router = Router();

// multer：内存存储，最大 20MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────
// POST /api/rag/upload
// 上传文档 → 切块 → 批量向量化 → 存库
// ─────────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: '请上传文件' });

  try {
    // 1. 提取文本
    let rawText = '';
    if (req.file.mimetype === 'application/pdf') {
      rawText = await extractTextFromPDF(req.file.buffer);
    } else {
      rawText = req.file.buffer.toString('utf-8');
    }

    if (rawText.trim().length < 20) {
      return res.status(400).json({ error: '文件内容过短或无法解析' });
    }

    // 2. 切块
    const chunks = chunkText(rawText);

    // 3. 批量向量化
    const embeddings = await embedBatch(chunks.map(c => c.content));

    // 4. 写库（事务）
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 写文档主记录
      const docRes = await client.query<{ id: number }>(
        `INSERT INTO rag_documents (filename, file_type, char_count, chunk_count)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [req.file.originalname, req.file.mimetype, rawText.length, chunks.length]
      );
      const documentId = docRes.rows[0].id;

      // 批量写 chunks（unnest 一次性插入，效率高）
      const contents = chunks.map(c => c.content);
      const indices  = chunks.map(c => c.index);
      const vectors  = embeddings.map(formatVector);

      await client.query(
        `INSERT INTO rag_chunks (document_id, content, chunk_index, embedding)
         SELECT $1, unnest($2::text[]), unnest($3::int[]),
                unnest($4::text[])::vector`,
        [documentId, contents, indices, vectors]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        documentId,
        filename: req.file.originalname,
        chunkCount: chunks.length,
        charCount: rawText.length,
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[RAG upload]', err);
    res.status(500).json({ error: '上传处理失败，请检查服务日志' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/rag/chat
// Body: { documentId, question, history? }
// 语义检索 → 组装 Prompt → Claude 回答
// ─────────────────────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response) => {
  const { documentId, question, history = [] } = req.body as {
    documentId: number;
    question: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!documentId || !question?.trim()) {
    return res.status(400).json({ error: '缺少 documentId 或 question' });
  }

  try {
    // 1. 向量化问题
    const queryEmbedding = await embedText(question);
    const queryVector    = formatVector(queryEmbedding);

    // 2. 余弦相似度检索，取 Top-5 最相关块
    const searchRes = await pool.query<{ content: string; chunk_index: number; similarity: number }>(
      `SELECT content, chunk_index,
              1 - (embedding <=> $1::vector) AS similarity
       FROM   rag_chunks
       WHERE  document_id = $2
         AND  1 - (embedding <=> $1::vector) > 0.3   -- 过滤低相关块
       ORDER  BY embedding <=> $1::vector
       LIMIT  5`,
      [queryVector, documentId]
    );

    if (searchRes.rows.length === 0) {
      return res.json({
        answer: '在文档中没有找到与该问题相关的内容，请尝试换个提问方式。',
        sources: [],
      });
    }

    // 3. 组装上下文
    const context = searchRes.rows
      .map((r, i) => `【参考段落 ${i + 1}】\n${r.content}`)
      .join('\n\n');

    // 4. 构建 messages（支持多轮对话历史）
    const systemPrompt = `你是一个专业的文档问答助手。
请严格基于下方提供的【参考段落】来回答用户问题，不要编造文档中没有的信息。
如果参考段落中没有足够信息，请如实说明。
回答时请简洁、准确，并在答案末尾注明引用了哪几个参考段落（如「参见段落1、3」）。

${context}`;

    const messages: Anthropic.MessageParam[] = [
      ...history.map(h => ({ role: h.role, content: h.content } as Anthropic.MessageParam)),
      { role: 'user', content: question },
    ];

    // 5. 调用 Claude
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : '';

    // 6. 返回答案 + 来源
    res.json({
      answer,
      sources: searchRes.rows.map(r => ({
        content: r.content.slice(0, 150) + (r.content.length > 150 ? '...' : ''),
        chunkIndex: r.chunk_index,
        similarity: Math.round(r.similarity * 100) / 100,
      })),
    });
  } catch (err) {
    console.error('[RAG chat]', err);
    res.status(500).json({ error: '问答处理失败' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/rag/documents
// 获取已上传文档列表
// ─────────────────────────────────────────────────────────
router.get('/documents', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, filename, file_type, char_count, chunk_count, created_at
       FROM   rag_documents
       ORDER  BY created_at DESC
       LIMIT  50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: '获取文档列表失败' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/rag/documents/:id
// 删除文档（关联 chunks 级联删除）
// ─────────────────────────────────────────────────────────
router.delete('/documents/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '无效的文档 ID' });
  try {
    await pool.query('DELETE FROM rag_documents WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
