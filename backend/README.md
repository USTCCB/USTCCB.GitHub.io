# 🚀 个人平台后端服务 - 企业级架构 (v2.0)

> 从简单后端升级到**企业级架构** - 展示现代化 Web 开发最佳实践

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-red.svg)](https://socket.io/)

---

## ✨ 企业级功能

### 📚 Swagger/OpenAPI 文档
- 完整的 OpenAPI 3.0 规范
- 交互式 API 测试界面
- 访问：`/api-docs`

### 🔌 WebSocket 实时通信
- Socket.IO 双向通信
- 实时统计广播
- 在线用户追踪
- 自动断线重连

### ☁️ S3 对象存储
- AWS S3 / Cloudflare R2 支持
- 图片上传验证
- 优雅降级 Base64

### 📊 结构化日志
- Winston JSON 日志
- 请求耗时追踪
- 日志级别控制

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Express.js + TypeScript |
| **数据库** | PostgreSQL |
| **实时通信** | Socket.IO |
| **API 文档** | Swagger UI |
| **对象存储** | AWS SDK v3 (S3) |
| **日志** | Winston |
| **验证** | Zod |

---

## 📦 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
# .env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/personal_platform
CORS_ORIGIN=http://localhost:3000,https://ustc.chat

# S3 对象存储（可选）
S3_ENDPOINT=https://account_id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your_bucket
S3_REGION=auto

# 日志级别
LOG_LEVEL=info
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build && npm start
```

### 4. 访问服务

- **演示页面**: http://localhost:3001/demo.html
- **API 文档**: http://localhost:3001/api-docs
- **健康检查**: http://localhost:3001/health

---

## 📖 API 接口

### 基础接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/stats` | 获取统计数据 |
| POST | `/api/stats/visit` | 增加访问计数 |
| POST | `/api/stats/like` | 增加点赞计数 |
| POST | `/api/files/upload` | 上传文件 |
| DELETE | `/api/files/:key` | 删除文件 |

### WebSocket 事件

**客户端接收：**
- `stats:update` - 统计数据更新
- `users:online` - 在线用户数变化

---

## 🎯 简历展示

```markdown
## 个人平台后端服务 - 企业级升级

技术栈：Node.js, Express.js, TypeScript, PostgreSQL, Socket.IO, Swagger, AWS S3

核心职责：
• 集成 Swagger/OpenAPI 实现 API 文档自动化，覆盖 100% API 接口
• 实现 WebSocket 实时通信，支持在线用户追踪和实时数据推送
• 集成 AWS S3 兼容对象存储，支持图片上传和优雅降级策略
• 配置 Winston 结构化日志，JSON 格式便于日志分析和问题追踪
• 实施安全最佳实践：Helmet、CORS、限流、Zod 输入验证
```

---

## 🔗 相关链接

- **GitHub**: https://github.com/USTCCB/USTCCB.GitHub.io
- **演示**: http://localhost:3001/demo.html
- **API 文档**: http://localhost:3001/api-docs

---

**🎉 v2.0 升级完成！**
