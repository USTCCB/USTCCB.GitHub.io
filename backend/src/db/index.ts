import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 优先使用环境变量，如果没有则使用硬编码的 Railway PostgreSQL 地址
const dbUrl = process.env.DATABASE_URL
  || 'postgresql://postgres:hAJeYuCbrmOxUfXjlEHtCBHDtPawWfnV@postgres.railway.internal:5432/railway';

export const pool = new Pool(
  dbUrl
    ? {
        connectionString: dbUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        // 无 DATABASE_URL 时使用空配置，查询会报错但服务不会崩溃
        host: 'localhost',
        port: 5432,
        database: 'nodbconfigured',
        connectionTimeoutMillis: 1000,
      }
);

// 数据库初始化
export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      -- 用户表
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 博客文章表
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        cover_image VARCHAR(255),
        tags TEXT[],
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        title VARCHAR(100) NOT NULL,
        description TEXT,
        cover_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 照片表
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        url VARCHAR(255) NOT NULL,
        title VARCHAR(100),
        description TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 日记表
      CREATE TABLE IF NOT EXISTS diaries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        mood VARCHAR(50),
        weather VARCHAR(50),
        is_private BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
      CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
    `);
    console.log('✅ 数据库初始化成功');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}
