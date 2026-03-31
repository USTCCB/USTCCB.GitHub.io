// src/lib/chunker.ts
// 将长文本切成适合向量化的小块
// 策略：按段落优先，超长段落按句子切，保留重叠窗口（overlap）

export interface Chunk {
  content: string;
  index: number;
}

const CHUNK_SIZE = 500;      // 每块目标字符数（中文约 250 字）
const CHUNK_OVERLAP = 80;    // 块间重叠字符数，避免语义截断

/**
 * 将原始文本切分为带重叠的小块
 */
export function chunkText(text: string): Chunk[] {
  // 1. 清洗：去除多余空白行、统一换行
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. 先按段落（双换行）切分
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0);

  // 3. 合并过短段落、拆分过长段落
  const rawChunks: string[] = [];
  let buffer = '';

  for (const para of paragraphs) {
    if (para.length > CHUNK_SIZE * 2) {
      // 超长段落：按句子切
      if (buffer) {
        rawChunks.push(buffer.trim());
        buffer = '';
      }
      const sentences = para.split(/(?<=[。！？.!?])\s*/);
      let sentBuffer = '';
      for (const sent of sentences) {
        if ((sentBuffer + sent).length > CHUNK_SIZE && sentBuffer) {
          rawChunks.push(sentBuffer.trim());
          sentBuffer = sent;
        } else {
          sentBuffer += sent;
        }
      }
      if (sentBuffer) rawChunks.push(sentBuffer.trim());
    } else if ((buffer + '\n\n' + para).length > CHUNK_SIZE && buffer) {
      rawChunks.push(buffer.trim());
      buffer = para;
    } else {
      buffer = buffer ? buffer + '\n\n' + para : para;
    }
  }
  if (buffer) rawChunks.push(buffer.trim());

  // 4. 加 overlap：每块头部附加上一块末尾的部分内容
  const chunks: Chunk[] = rawChunks.map((content, index) => {
    if (index === 0) return { content, index };
    const prev = rawChunks[index - 1];
    const overlap = prev.slice(-CHUNK_OVERLAP);
    return { content: overlap + '\n' + content, index };
  });

  return chunks.filter(c => c.content.trim().length > 10);
}

/**
 * 从 PDF Buffer 提取纯文本（需安装 pdf-parse）
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // 动态 require 避免在没有 PDF 文件时报错
  const pdfParse = await import('pdf-parse').then(m => m.default ?? m);
  const data = await pdfParse(buffer);
  return data.text;
}
