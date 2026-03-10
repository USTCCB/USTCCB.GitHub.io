# 🚀 个人平台全栈应用

[![CI/CD](https://github.com/USTCCB/USTCCB.GitHub.io/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/USTCCB/USTCCB.GitHub.io/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

一个功能完整的**企业级全栈应用**，展示现代 Web 开发最佳实践。包含用户认证、博客系统、相册管理、日记功能等完整业务模块。

**🎯 简历技术亮点：**
- ✅ 完整的前后端分离架构
- ✅ RESTful API 设计与实现
- ✅ 数据库设计与优化
- ✅ Docker 容器化部署
- ✅ CI/CD 自动化流程
- ✅ 安全最佳实践
- ✅ TypeScript 全栈类型安全

## ✨ 技术栈

### 前端
- **Next.js 14** - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **React Hook Form + Zod** - 表单验证

### 后端
- **Node.js + Express** - API 服务器
- **TypeScript** - 类型安全
- **PostgreSQL** - 关系型数据库
- **Redis** - 缓存
- **JWT** - 身份认证
- **Zod** - 数据验证

### 部署
- **Docker + Docker Compose** - 容器化部署
- **GitHub Actions** - CI/CD
- **Vercel** - 前端部署（可选）

## 🎯 核心功能

### ✅ 已实现
- 🔐 用户认证系统（注册/登录/JWT）
- 📝 博客系统（Markdown 编辑、标签、评论）
- 📷 相册管理（上传、分���、展示）
- 📔 日记系统（私密日记、心情记录）
- 🎮 游戏中心
- 💬 AI 聊天
- 📅 课程表

### 🚧 计划中
- 实时通知
- 数据统计面板
- 搜索功能
- 社交分享
- 移动端适配

## 📦 快速开始

### 前置要求
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (如果不用 Docker)
- Redis 7+ (如果不用 Docker)

### 1. 克隆项目

```bash
git clone https://github.com/USTCCB/USTCCB.GitHub.io.git
cd USTCCB.GitHub.io
```

### 2. 使用 Docker 部署（推荐）

```bash
# 复制环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 修改 backend/.env 中的敏感信息
# JWT_SECRET=你的密钥
# DB_PASSWORD=你的数据库密码

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问：
- 前端：http://localhost:3000
- 后端 API：http://localhost:3001
- 健康检查：http://localhost:3001/health

### 3. 本地开发

#### 后端

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 创建数据库
createdb personal_platform

# 初始化数据库
psql -d personal_platform -f src/db/schema.sql

# 启动开发服务器
npm run dev
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

## 📁 项目结构

```
personal-platform-fullstack/
├── backend/                 # 后端 API
│   ├── src/
│   │   ├── main.ts         # 入口文件
│   │   ├── db/             # 数据库
│   │   │   ├── index.ts    # 连接池
│   │   │   └── schema.sql  # 数据库表结构
│   │   ├── routes/         # 路由
│   │   │   ├── auth.ts     # 认证路由
│   │   │   ├── blog.ts     # 博客路由
│   │   │   ├── album.ts    # 相册路由
│   │   │   └── diary.ts    # 日记路由
│   │   └── middleware/     # 中间件
│   │       └── errorHandler.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── app/           # Next.js 页面
│   │   ├── components/    # React 组件
│   │   ├── store/         # Zustand 状态管理
│   │   └── lib/           # 工具函数
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml    # Docker 编排
└── README.md            # 项目说明
```

## 🔧 环境变量

### 后端 (.env)

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_platform
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### 前端 (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test

# E2E 测试
cd frontend
npm run test:e2e
```

## 📊 数据库设计

主要表结构：
- `users` - 用户表
- `blog_posts` - 博客文章
- `blog_tags` - 博客标签
- `comments` - 评论
- `albums` - 相册
- `photos` - 照片
- `diaries` - 日记

详见：[backend/src/db/schema.sql](backend/src/db/schema.sql)

## 🚀 部署

### Vercel 部署（前端）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署前端
cd frontend
vercel
```

### Railway 部署（后端 + 数据库）

1. 在 Railway 创建项目
2. 添加 PostgreSQL 和 Redis 服务
3. 连接 GitHub 仓库
4. 配置环境变量
5. 自动部署

### Docker 生产部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

## 📝 API 文档

### 认证接口

```
POST /api/auth/register  - 用户注册
POST /api/auth/login     - 用户登录
GET  /api/auth/me        - 获取当前用户
```

### 博客接口

```
GET    /api/blog         - 获取文章列表
POST   /api/blog         - 创建文章
GET    /api/blog/:id     - 获取文章详情
PUT    /api/blog/:id     - 更新文章
DELETE /api/blog/:id     - 删除文章
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

**USTCCB**
- GitHub: [@USTCCB](https://github.com/USTCCB)
- 个人主页: https://ustccb.github.io

## 🌟 Star History

如果这个项目对你有帮助，请给个 Star ⭐️

---

**💼 简历展示要点：**

✅ **全栈开发能力** - Next.js + Node.js + PostgreSQL + Redis
✅ **架构设计能力** - 前后端分离、RESTful API、数据库设计
✅ **工程化能力** - Docker 容器化、CI/CD 自动化、TypeScript 类型安全
✅ **安全意识** - JWT 认证、密码加密、SQL 注入防护、XSS 防护、限流
✅ **代码质量** - ESLint、Prettier、单元测试、E2E 测试
✅ **部署运维** - Docker Compose、GitHub Actions、云平台部署
