# 🎉 Railway 部署已完成

## ✅ 已自动完成的配置

### 1. 创建了 Railway 项目
- **项目名称**: personal-platform
- **项目 ID**: `8386fc4c-4eb6-4ca6-b148-68db0dc78e9c`
- **项目 URL**: https://railway.app/project/8386fc4c-4eb6-4ca6-b148-68db0dc78e9c

### 2. 创建了所有必需的服务
- ✅ **backend** (ID: `587b0fa0-6dc3-4cfe-87de-509edfb706d0`)
- ✅ **postgres** (ID: `81bdb05d-52c9-46d9-b6b7-cad7c6c1dd8d`)
- ✅ **redis** (ID: `9ab4f433-8c7d-40b0-ab69-2af01336dfba`)

### 3. 配置了所有环境变量
- ✅ NODE_ENV=production
- ✅ PORT=3001
- ✅ DB_HOST=${{Postgres.PGHOST}}
- ✅ DB_PORT=${{Postgres.PGPORT}}
- ✅ DB_NAME=${{Postgres.PGDATABASE}}
- ✅ DB_USER=${{Postgres.PGUSER}}
- ✅ DB_PASSWORD=${{Postgres.PGPASSWORD}}
- ✅ REDIS_HOST=${{Redis.REDIS_HOST}}
- ✅ REDIS_PORT=${{Redis.REDIS_PORT}}
- ✅ JWT_SECRET=cea67da6c7e4db6858326ba5640b62a982575c6e775d0cf2cb0719a7231ea5f1
- ✅ JWT_EXPIRES_IN=7d
- ✅ CORS_ORIGIN=https://frontend-pi-six-0l9p0rwmqj.vercel.app

### 4. 生成了后端域名
- ✅ **后端 URL**: https://backend-production-4de2.up.railway.app

### 5. 触发了自动部署
- ✅ 部署已启动

---

## 📋 Railway Dashboard 手动配置（2 分钟）

由于 Railway API 限制，需要在 Dashboard 中完成以下配置：

### 步骤 1: 配置 backend 服务

1. 访问：https://railway.app/project/8386fc4c-4eb6-4ca6-b148-68db0dc78e9c
2. 点击 **backend** 服务
3. 进入 **Settings** 标签
4. 配置：
   - **Root Directory**: `backend`
   - **Start Command**: `node dist/main.js`
5. 点击 **Deploy** 重新部署

### 步骤 2: 初始化数据库

1. 点击 **postgres** 服务
2. 进入 **Data** 标签
3. 点击 **Query**
4. 复制粘贴以下 SQL 并执行：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 博客文章表
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  cover_image TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 博客标签表
CREATE TABLE IF NOT EXISTS blog_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 博客文章-标签关联表
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 相册表
CREATE TABLE IF NOT EXISTS albums (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 照片表
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  tags TEXT[],
  taken_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 日记表
CREATE TABLE IF NOT EXISTS diaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(50),
  weather VARCHAR(50),
  is_private BOOLEAN DEFAULT true,
  diary_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(diary_date DESC);
```

### 步骤 3: 测试后端

访问：https://backend-production-4de2.up.railway.app/health

应该看到：
```json
{"status":"ok","timestamp":"2026-03-11T..."}
```

### 步骤 4: 更新前端环境变量

1. 访问 Vercel: https://vercel.com
2. 进入 **frontend** 项目
3. **Settings** → **Environment Variables**
4. 添加：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://backend-production-4de2.up.railway.app`
   - Environment: 全选
5. **Redeploy** 前端

---

## 🎊 完成！

完成上述 4 个步骤后，你的全栈应用就完全上线了！

**前端**: https://frontend-pi-six-0l9p0rwmqj.vercel.app
**后端**: https://backend-production-4de2.up.railway.app

---

## 📞 需要帮助？

如果遇到问题，查看：
- Railway 项目: https://railway.app/project/8386fc4c-4eb6-4ca6-b148-68db0dc78e9c
- 部署日志: 点击 backend 服务 → Deployments 标签
