# 🚀 Railway 后端部署指南

## 前端已部署
✅ **前端地址**: https://frontend-pi-six-0l9p0rwmqj.vercel.app

## 后端部署步骤

### 1. 访问 Railway
打开 https://railway.app 并使用 GitHub 登录

### 2. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择仓库：`USTCCB/USTCCB.GitHub.io`

### 3. 添加 PostgreSQL 数据库
1. 在项目中点击 "New"
2. 选择 "Database" → "PostgreSQL"
3. Railway 会自动创建数据库

### 4. 添加 Redis
1. 点击 "New"
2. 选择 "Database" → "Redis"

### 5. 配置后端服务
1. 点击你的 GitHub 仓库服务
2. 设置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`

### 6. 添加环境变量

点击 "Variables" 标签，添加以下环境变量：

```bash
NODE_ENV=production
PORT=3001

# 数据库（Railway 自动注入）
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis（Railway 自动注入）
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# JWT 密钥（生成一个随机字符串）
JWT_SECRET=你的超级密钥-至少32位随机字符串
JWT_EXPIRES_IN=7d

# CORS（填写你的 Vercel 前端地址）
CORS_ORIGIN=https://frontend-pi-six-0l9p0rwmqj.vercel.app
```

### 7. 生成 JWT 密钥

在本地运行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制生成的密钥，填入 `JWT_SECRET`

### 8. 部署

点击 "Deploy" 按钮，Railway 会自动：
1. 拉取代码
2. 安装依赖
3. 构建项目
4. 启动服务

### 9. 初始化数据库

部署成功后，需要初始化数据库表：

**方式一：通过 Railway CLI**
```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接项目
railway link

# 运行 SQL
railway run psql -f backend/src/db/schema.sql
```

**方式二：通过 Railway Dashboard**
1. 进入 PostgreSQL 服务
2. 点击 "Data" 标签
3. 点击 "Query"
4. 复制 `backend/src/db/schema.sql` 的内容
5. 粘贴并执行

### 10. 获取后端 URL

部署成功后，Railway 会提供一个公开 URL，类似：
```
https://your-backend.railway.app
```

### 11. 更新前端环境变量

回到 Vercel：
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. 重新部署前端

### 12. 测试

访问：
- 前端：https://frontend-pi-six-0l9p0rwmqj.vercel.app
- 后端健康检查：https://your-backend.railway.app/health

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-03-11T..."
}
```

## 🎉 完成！

你的全栈应用已经完全部署到线上了！

**前端**: Vercel（全球 CDN）
**后端**: Railway（包含 PostgreSQL + Redis）

---

## 💡 提示

1. Railway 免费额度：每月 $5 免费额度
2. 如果需要更多资源，可以升级到付费计划
3. 记得在 README.md 中更新在线演示链接
