# 🚀 完整部署指南 - Railway 后端部署

## ✅ 前端已部署
**前端地址**: https://frontend-pi-six-0l9p0rwmqj.vercel.app

---

## 📋 后端部署步骤（Railway）

### 第 1 步：访问 Railway

1. 打开浏览器，访问：https://railway.app
2. 点击右上角 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权 Railway 访问你的 GitHub 账号

### 第 2 步：创建新项目

1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 在列表中找到并选择：**`USTCCB/USTCCB.GitHub.io`**
4. Railway 会自动检测到这是一个 Node.js 项目

### 第 3 步：添加 PostgreSQL 数据库

1. 在项目页面，点击右上角 **"+ New"**
2. 选择 **"Database"**
3. 选择 **"Add PostgreSQL"**
4. Railway 会自动创建数据库并生成连接信息
5. 数据库创建完成后，你会看到一个新的 PostgreSQL 服务卡片

### 第 4 步：添加 Redis 缓存

1. 再次点击 **"+ New"**
2. 选择 **"Database"**
3. 选择 **"Add Redis"**
4. Railway 会自动创建 Redis 实例

### 第 5 步：配置后端服务

1. 点击你的 GitHub 仓库服务卡片（显示为 `USTCCB.GitHub.io`）
2. 点击 **"Settings"** 标签
3. 找到 **"Root Directory"** 设置
4. 输入：`backend`
5. 找到 **"Build Command"**（可选，Railway 会自动检测）
6. 输入：`npm install && npm run build`
7. 找到 **"Start Command"**
8. 输入：`node dist/main.js`

### 第 6 步：配置环境变量

1. 在后端服务页面，点击 **"Variables"** 标签
2. 点击 **"+ New Variable"**
3. 添加以下环境变量（一个一个添加）：

#### 基础配置
```
NODE_ENV=production
PORT=3001
```

#### 数据库配置（使用 Railway 的引用变量）
```
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

#### Redis 配置
```
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
```

#### JWT 配置（需要生成密钥）
```
JWT_SECRET=<待填写>
JWT_EXPIRES_IN=7d
```

#### CORS 配置
```
CORS_ORIGIN=https://frontend-pi-six-0l9p0rwmqj.vercel.app
```

### 第 7 步：生成 JWT 密钥

在本地终端运行以下命令生成安全的 JWT 密钥：

**Windows (Git Bash):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**或者使用 PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

复制生成的密钥，回到 Railway，找到 `JWT_SECRET` 变量，粘贴进去。

### 第 8 步：部署后端

1. 所有环境变量配置完成后，点击 **"Deploy"** 按钮
2. Railway 会自动：
   - 拉取 GitHub 代码
   - 安装依赖
   - 构建 TypeScript
   - 启动服务
3. 等待部署完成（通常需要 2-5 分钟）
4. 部署成功后，你会看到 **"Success"** 状态

### 第 9 步：获取后端 URL

1. 在后端服务页面，点击 **"Settings"** 标签
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. Railway 会生成一个公开 URL，类似：
   ```
   https://ustccbgithubio-production.up.railway.app
   ```
5. 复制这个 URL

### 第 10 步：初始化数据库

部署成功后，需要创建数据库表结构：

#### 方式一：通过 Railway Dashboard（推荐）

1. 点击 **PostgreSQL** 服务卡片
2. 点击 **"Data"** 标签
3. 点击 **"Query"** 按钮
4. 打开本地文件：`backend/src/db/schema.sql`
5. 复制所有内容
6. 粘贴到 Railway 的查询编辑器
7. 点击 **"Run Query"**
8. 等待执行完成，应该看到 "Query executed successfully"

#### 方式二：通过本地连接（需要 psql）

1. 在 PostgreSQL 服务页面，点击 **"Connect"** 标签
2. 复制 **"Postgres Connection URL"**
3. 在本地终端运行：
   ```bash
   psql "postgresql://..." -f backend/src/db/schema.sql
   ```

### 第 11 步：测试后端 API

1. 打开浏览器，访问：
   ```
   https://你的后端URL/health
   ```
2. 应该看到：
   ```json
   {
     "status": "ok",
     "timestamp": "2026-03-11T..."
   }
   ```
3. 如果看到这个响应，说明后端部署成功！

### 第 12 步：更新前端环境变量

1. 访问 Vercel Dashboard：https://vercel.com
2. 找到你的 `frontend` 项目
3. 点击 **"Settings"**
4. 点击 **"Environment Variables"**
5. 添加新变量：
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://你的Railway后端URL`（不要加 /api）
   - **Environment**: 选择 **Production**, **Preview**, **Development**
6. 点击 **"Save"**

### 第 13 步：重新部署前端

1. 在 Vercel 项目页面，点击 **"Deployments"** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 等待重新部署完成

### 第 14 步：完整测试

1. 访问前端：https://frontend-pi-six-0l9p0rwmqj.vercel.app
2. 打开浏览器开发者工具（F12）
3. 查看 Console 和 Network 标签
4. 测试功能：
   - 注册新用户
   - 登录
   - 创建博客文章
   - 上传照片

---

## 🎉 部署完成！

你的全栈应用已经完全部署到线上了！

**前端**: https://frontend-pi-six-0l9p0rwmqj.vercel.app
**后端**: https://你的Railway后端URL
**数据库**: PostgreSQL (Railway)
**缓存**: Redis (Railway)

---

## 📊 部署架构

```
用户浏览器
    ↓
Vercel CDN (前端)
    ↓
Railway (后端 API)
    ↓
PostgreSQL + Redis (Railway)
```

---

## 🔧 常见问题

### 1. 后端部署失败

**检查日志：**
1. 在 Railway 后端服务页面
2. 点击 **"Deployments"** 标签
3. 点击失败的部署
4. 查看 **"Build Logs"** 和 **"Deploy Logs"**

**常见原因：**
- 环境变量配置错误
- 数据库连接失败
- 构建命令错误

### 2. 数据库连接失败

**检查：**
1. 确保 PostgreSQL 服务正在运行
2. 确保环境变量使用了 `${{Postgres.PGHOST}}` 格式
3. 在 Railway 中，服务之间会自动建立私有网络连接

### 3. CORS 错误

**解决：**
1. 确保 `CORS_ORIGIN` 环境变量设置为前端 Vercel URL
2. 不要在 URL 末尾加斜杠
3. 重新部署后端

### 4. 前端无法连接后端

**检查：**
1. 确保 Vercel 环境变量 `NEXT_PUBLIC_API_URL` 已设置
2. 确保后端 URL 正确（不要加 /api）
3. 重新部署前端

### 5. 数据库表不存在

**解决：**
1. 确保已执行 `schema.sql`
2. 在 PostgreSQL Data 标签中查看表是否存在
3. 如果没有，重新执行第 10 步

---

## 📝 监控和维护

### 查看日志

**后端日志：**
1. Railway 后端服务页面
2. 点击 **"Deployments"** 标签
3. 点击当前部署
4. 查看实时日志

**前端日志：**
1. Vercel 项目页面
2. 点击 **"Deployments"**
3. 点击部署
4. 查看 **"Functions"** 日志

### 数据库备份

Railway 自动备份数据库，但建议定期手动备份：

1. PostgreSQL 服务页面
2. 点击 **"Data"** 标签
3. 点击 **"Backups"**
4. 点击 **"Create Backup"**

---

## 💰 费用说明

**Vercel:**
- 免费计划：无限流量，100GB 带宽/月
- 足够个人项目使用

**Railway:**
- 免费计划：$5 免费额度/月
- 超出后按使用量计费
- 估算：小型项目约 $5-10/月

---

## 🚀 下一步

1. ✅ 添加自定义域名
2. ✅ 配置 SSL 证书（自动）
3. ✅ 设置监控告警
4. ✅ 添加更多功能
5. ✅ 优化性能

---

**需要帮助？**
- Railway 文档：https://docs.railway.app
- Vercel 文档：https://vercel.com/docs
- 项目 Issues：https://github.com/USTCCB/USTCCB.GitHub.io/issues
