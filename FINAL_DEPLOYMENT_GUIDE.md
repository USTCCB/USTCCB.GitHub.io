# ✅ Token 验证成功！

## 🎉 好消息

你的 Railway Token **有效**！

- **Token**: `6aea044a-74dc-4eec-bca3-7b98ab8618db`
- **账号**: `2403148578@qq.com`
- **用户 ID**: `c1dd2291-0059-4ded-aba2-4a3c276c5062`

---

## 📋 现在完成部署（最快方式）

由于你的 Railway 账号还没有创建项目，**通过 Web 界面创建会更快**。

### 🚀 完整部署步骤（10 分钟）

#### 步骤 1: 创建 Railway 项目

1. 访问：https://railway.app/new
2. 选择 **"Deploy from GitHub repo"**
3. 选择仓库：`USTCCB/USTCCB.GitHub.io`
4. Railway 会自动开始部署

#### 步骤 2: 添加 PostgreSQL

1. 在项目页面，点击 **"+ New"**
2. 选择 **"Database"** → **"Add PostgreSQL"**

#### 步骤 3: 添加 Redis

1. 再次点击 **"+ New"**
2. 选择 **"Database"** → **"Add Redis"**

#### 步骤 4: 配置后端服务

1. 点击 GitHub 仓库服务
2. **Settings** 标签：
   - Root Directory: `backend`
   - Start Command: `node dist/main.js`

#### 步骤 5: 添加环境变量

在 **Variables** 标签，添加：

```bash
NODE_ENV=production
PORT=3001
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
JWT_SECRET=cea67da6c7e4db6858326ba5640b62a982575c6e775d0cf2cb0719a7231ea5f1
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://frontend-pi-six-0l9p0rwmqj.vercel.app
```

#### 步骤 6: 等待部署完成

查看 **Deployments** 标签，等待状态变为 **Success**

#### 步骤 7: 获取后端 URL

1. **Settings** → **Domains** → **Generate Domain**
2. 复制 URL

#### 步骤 8: 测试后端

访问：`https://你的后端URL/health`

应该看到：
```json
{"status":"ok","timestamp":"..."}
```

#### 步骤 9: 初始化数据库

1. 点击 **PostgreSQL** 服务
2. **Data** → **Query**
3. 复制粘贴以下 SQL：

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

4. 点击 **Run Query**

#### 步骤 10: 更新前端环境变量

1. 访问：https://vercel.com
2. 进入 **frontend** 项目
3. **Settings** → **Environment Variables**
4. 添加：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://你的Railway后端URL`
   - Environment: 全选
5. **Save**

#### 步骤 11: 重新部署前端

1. **Deployments** 标签
2. 点击最新部署的 **...** → **Redeploy**

---

## 🎊 完成！

访问：https://frontend-pi-six-0l9p0rwmqj.vercel.app

测试注册/登录功能！

---

## 📞 需要帮助？

告诉我你完成到哪一步了，或者遇到什么问题！

**现在开始部署吧！** 🚀
