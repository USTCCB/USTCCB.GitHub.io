import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './routes/auth';
import { blogRouter } from './routes/blog';
import { albumRouter } from './routes/album';
import { diaryRouter } from './routes/diary';
import { commentRouter } from './routes/comment';
import { searchRouter } from './routes/search';
import { statsRouter } from './routes/stats';
import { fileRouter } from './routes/files';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, logger } from './middleware/logger';
import { initDatabase } from './db';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================
// Socket.IO - WebSocket 实时通信
// ============================================
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  logger.info('Client connected', { socketId: socket.id, onlineUsers });

  // 广播在线用户数
  io.emit('users:online', { count: onlineUsers });

  socket.on('disconnect', () => {
    onlineUsers--;
    logger.info('Client disconnected', { socketId: socket.id, onlineUsers });
    io.emit('users:online', { count: onlineUsers });
  });

  socket.on('message', (data) => {
    socket.broadcast.emit('message', data);
  });
});

// 导出 io 供其他模块使用
export { io };

// ============================================
// Express 配置
// ============================================
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .concat(['https://ustc.chat', 'https://ustccb.github.io']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin === o || origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 请求体解析
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use(requestLogger);

// 静态文件
app.use('/uploads', express.static('uploads'));

// ============================================
// Swagger API 文档
// ============================================
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: '个人平台 API',
    version: '2.0.0',
    description: '企业级全栈应用后端 API - Swagger/OpenAPI 3.0',
    contact: { name: 'USTCCB', url: 'https://github.com/USTCCB' },
  },
  servers: [
    { url: 'http://localhost:3001', description: '本地开发' },
    { url: 'https://backend-production-4de2.up.railway.app', description: 'Railway 生产' },
  ],
  tags: [
    { name: 'Health', description: '健康检查' },
    { name: 'Auth', description: '用户认证' },
    { name: 'Blog', description: '博客管理' },
    { name: 'Album', description: '相册管理' },
    { name: 'Diary', description: '日记管理' },
    { name: 'Files', description: '文件上传 (S3)' },
    { name: 'Real-time', description: 'WebSocket 实时通信' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: '健康检查',
        responses: { '200': { description: '服务器健康' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '用户登录',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: '登录成功' } },
      },
    },
    '/api/files/upload': {
      post: {
        tags: ['Files'],
        summary: '上传文件',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } },
        },
        responses: { '201': { description: '上传成功' } },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ============================================
// API 路由
// ============================================
app.use('/api/auth', authRouter);
app.use('/api/blog', blogRouter);
app.use('/api/album', albumRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/comments', commentRouter);
app.use('/api/search', searchRouter);
app.use('/api/stats', statsRouter);
app.use('/api/files', fileRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'v2.0.0',
    onlineUsers,
  });
});

// 错误处理
app.use(errorHandler);

// ============================================
// 启动服务器
// ============================================
httpServer.listen(PORT, async () => {
  logger.info(`🚀 Server ready at http://localhost:${PORT}`);
  logger.info(`📚 API Docs at http://localhost:${PORT}/api-docs`);
  logger.info(`🔌 WebSocket enabled`);
  logger.info(`☁️  S3 Storage: ${process.env.S3_ENDPOINT ? 'Enabled' : 'Disabled (base64 fallback)'}`);

  try {
    await initDatabase();
  } catch (err) {
    logger.error('Database initialization failed', { error: err });
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
