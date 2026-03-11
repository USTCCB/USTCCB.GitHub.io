# ✅ Railway 部署清单

## 🎯 你的部署信息

### 前端（已完成）
- ✅ **URL**: https://frontend-pi-six-0l9p0rwmqj.vercel.app
- ✅ **平台**: Vercel
- ✅ **状态**: 已部署

### 后端（待部署）
- ⏳ **平台**: Railway
- ⏳ **状态**: 待部署

---

## 📋 快速部署步骤

### 1. 访问 Railway
🔗 https://railway.app
- 使用 GitHub 登录

### 2. 创建项目
- New Project → Deploy from GitHub repo
- 选择：`USTCCB/USTCCB.GitHub.io`

### 3. 添加数据库
- PostgreSQL: + New → Database → PostgreSQL
- Redis: + New → Database → Redis

### 4. 配置后端服务
- Settings → Root Directory: `backend`
- Start Command: `node dist/main.js`

### 5. 环境变量（复制粘贴）

```bash
# 基础配置
NODE_ENV=production
PORT=3001

# 数据库（Railway 自动引用）
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# JWT（使用下面生成的密钥）
JWT_SECRET=cea67da6c7e4db6858326ba5640b62a982575c6e775d0cf2cb0719a7231ea5f1
JWT_EXPIRES_IN=7d

# CORS（前端地址）
CORS_ORIGIN=https://frontend-pi-six-0l9p0rwmqj.vercel.app
```

### 6. 部署后端
- 点击 Deploy 按钮
- 等待 2-5 分钟

### 7. 获取后端 URL
- Settings → Domains → Generate Domain
- 复制生成的 URL

### 8. 初始化数据库
- PostgreSQL 服务 → Data → Query
- 复制 `backend/src/db/schema.sql` 内容
- 粘贴并执行

### 9. 测试后端
访问：`https://你的后端URL/health`

应该看到：
```json
{
  "status": "ok",
  "timestamp": "2026-03-11T..."
}
```

### 10. 更新前端
- Vercel Dashboard → frontend 项目
- Settings → Environment Variables
- 添加：`NEXT_PUBLIC_API_URL` = `https://你的Railway后端URL`
- Redeploy

---

## 🎉 完成！

前端 + 后端 + 数据库 全部上线！

---

## 📞 需要帮助？

如果遇到问题，查看：
- 📄 完整指南：`docs/COMPLETE_DEPLOYMENT_GUIDE.md`
- 🐛 常见问题：文档中的"常见问题"部分
- 📝 API 文档：`docs/API.md`
