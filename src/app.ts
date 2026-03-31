// src/app.ts
// Express 主应用入口

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ragRouter from './routes/rag';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 挂载 RAG 路由
app.use('/api/rag', ragRouter);

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[App Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 RAG API: http://localhost:${PORT}/api/rag`);
});

export default app;
