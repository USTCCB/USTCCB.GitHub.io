# 🚀 部署指南

## 1. Vercel 部署（前端）

### 方式一：通过 Vercel Dashboard（推荐）

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库：`USTCCB/USTCCB.GitHub.io`
5. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL=你的后端API地址
   ```
7. 点击 "Deploy"

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署前端
cd frontend
vercel

# 生产部署
vercel --prod
```

## 2. Railway 部署（后端 + 数据库）

### 步骤：

1. 访问 [Railway](https://railway.app)
2. 使用 GitHub 账号登录
3. 创建新项目 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的仓库：`USTCCB/USTCCB.GitHub.io`

### 添加服务：

#### PostgreSQL 数据库
1. 点击 "New" → "Database" → "PostgreSQL"
2. Railway 会自动创建数据库并提供连接信息
3. 记录数据库连接信息（会自动注入环境变量）

#### Redis 缓存
1. 点击 "New" → "Database" → "Redis"
2. Railway 会自动创建 Redis 实例

#### 后端服务
1. 点击你的 GitHub 仓库服务
2. 配置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
3. 添加环境变量：
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   JWT_SECRET=你的超级密钥-至少32位随机字符串
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://你的vercel域名.vercel.app
   ```
4. 点击 "Deploy"

### 初始化数据库

部署成功后，需要初始化数据库表结构：

```bash
# 方式一：通过 Railway CLI
railway login
railway link
railway run psql -f backend/src/db/schema.sql

# 方式二：通过 Railway Dashboard
# 1. 进入 PostgreSQL 服务
# 2. 点击 "Data" 标签
# 3. 点击 "Query"
# 4. 复制 backend/src/db/schema.sql 的内容并执行
```

## 3. Render 部署（备选方案）

### 后端部署

1. 访问 [Render](https://render.com)
2. 创建 "New Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: personal-platform-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
   - **Environment**: Node
5. 添加环境变量（同 Railway）

### 数据库

1. 创建 "New PostgreSQL"
2. 记录连接信息
3. 在后端服务中添加数据库环境变量

## 4. 自建服务器部署

### 使用 Docker Compose

```bash
# 1. SSH 到服务器
ssh user@your-server.com

# 2. 克隆项目
git clone https://github.com/USTCCB/USTCCB.GitHub.io.git
cd USTCCB.GitHub.io

# 3. 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑 backend/.env
nano backend/.env
# 修改：
# - JWT_SECRET（生成随机密钥）
# - DB_PASSWORD（数据库密码）
# - CORS_ORIGIN（前端域名）

# 编辑 frontend/.env
nano frontend/.env
# 修改：
# - NEXT_PUBLIC_API_URL（后端 API 地址）

# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f

# 6. 查看状态
docker-compose ps
```

### 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/personal-platform

# 前端
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 后端 API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/personal-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 配置 SSL（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

## 5. 环境变量说明

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| NODE_ENV | 运行环境 | production |
| PORT | 服务端口 | 3001 |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名称 | personal_platform |
| DB_USER | 数据库用户 | postgres |
| DB_PASSWORD | 数据库密码 | your_password |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| JWT_SECRET | JWT 密钥 | 至少32位随机字符串 |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |
| CORS_ORIGIN | 允许的前端域名 | https://your-domain.com |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| NEXT_PUBLIC_API_URL | 后端 API 地址 | https://api.your-domain.com |

## 6. 生成安全密钥

```bash
# 生成 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 32
```

## 7. 健康检查

部署完成后，访问以下地址检查服务状态：

- 前端：`https://your-domain.com`
- 后端健康检查：`https://api.your-domain.com/health`
- 预期响应：
  ```json
  {
    "status": "ok",
    "timestamp": "2026-03-11T00:00:00.000Z"
  }
  ```

## 8. 常见问题

### 数据库连接失败
- 检查数据库是否已启动
- 检查环境变量是否正确
- 检查防火墙规则

### CORS 错误
- 确保 `CORS_ORIGIN` 设置为前端域名
- 检查前端 `NEXT_PUBLIC_API_URL` 是否正确

### 502 Bad Gateway
- 检查后端服务是否运行
- 查看后端日志：`docker-compose logs backend`

### 数据库表不存在
- 运行初始化脚本：`psql -d personal_platform -f backend/src/db/schema.sql`

## 9. 监控和日志

### Docker 日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 生产环境监控

推荐使用：
- **Sentry** - 错误追踪
- **LogRocket** - 用户会话回放
- **Datadog** - 性能监控
- **UptimeRobot** - 服务可用性监控

## 10. 备份策略

### 数据库备份

```bash
# 手动备份
docker-compose exec postgres pg_dump -U postgres personal_platform > backup.sql

# 定时备份（crontab）
0 2 * * * docker-compose exec postgres pg_dump -U postgres personal_platform > /backups/backup-$(date +\%Y\%m\%d).sql
```

### 恢复数据库

```bash
docker-compose exec -T postgres psql -U postgres personal_platform < backup.sql
```

---

**部署完成后，记得更新 README.md 中的在线演示链接！**
