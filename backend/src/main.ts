import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { blogRouter } from './routes/blog';
import { albumRouter } from './routes/album';
import { diaryRouter } from './routes/diary';
import { commentRouter } from './routes/comment';
import { searchRouter } from './routes/search';
import { statsRouter } from './routes/stats';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .concat(['https://ustc.chat', 'https://ustccb.github.io', 'https://ustccb.github.io/USTCCB.GitHub.io']);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin === o || origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // 临时允许所有来源
    }
  },
  credentials: true
}));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制100个请求
});
app.use('/api/', limiter);

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/uploads', express.static('uploads'));

// 路由
app.use('/api/auth', authRouter);
app.use('/api/blog', blogRouter);
app.use('/api/album', albumRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/comments', commentRouter);
app.use('/api/search', searchRouter);
app.use('/api/stats', statsRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 手动触发数据库初始化
app.get('/api/init-db', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ success: false, error: 'DATABASE_URL environment variable not set' });
    }
    await initDatabase();
    res.json({ success: true, message: '数据库初始化成功', dbUrl: dbUrl.replace(/:[^:@]+@/, ':***@') });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// 错误处理
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  try {
    await initDatabase();
  } catch (err) {
    console.error('数据库初始化失败，服务继续运行:', err);
  }
});
