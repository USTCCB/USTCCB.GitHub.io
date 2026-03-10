import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';

export const searchRouter = Router();

const searchSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['all', 'posts', 'albums', 'users']).default('all'),
  page: z.number().default(1),
  limit: z.number().default(10)
});

// 搜索接口
searchRouter.get('/', async (req, res) => {
  try {
    const { q, type, page, limit } = searchSchema.parse({
      q: req.query.q,
      type: req.query.type || 'all',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    });

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;

    let results: any = {};

    // 搜索文章
    if (type === 'all' || type === 'posts') {
      const posts = await pool.query(
        `SELECT p.id, p.title, p.summary, p.created_at, u.username
         FROM blog_posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.published = true AND (p.title ILIKE $1 OR p.content ILIKE $1)
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      results.posts = posts.rows;
    }

    // 搜索相册
    if (type === 'all' || type === 'albums') {
      const albums = await pool.query(
        `SELECT a.id, a.title, a.description, a.cover_image, u.username
         FROM albums a
         JOIN users u ON a.user_id = u.id
         WHERE a.title ILIKE $1 OR a.description ILIKE $1
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      results.albums = albums.rows;
    }

    // 搜索用户
    if (type === 'all' || type === 'users') {
      const users = await pool.query(
        `SELECT id, username, avatar_url, bio
         FROM users
         WHERE username ILIKE $1 OR bio ILIKE $1
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      results.users = users.rows;
    }

    res.json({
      success: true,
      data: results,
      query: q,
      type
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: '输入验证失败', details: error.errors });
    }
    console.error('搜索错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// 热门搜索词
searchRouter.get('/trending', async (req, res) => {
  try {
    // 这里可以从 Redis 或数据库获取热门搜索词
    // 简化版本：返回热门标签
    const result = await pool.query(
      `SELECT t.name, COUNT(pt.post_id) as count
       FROM blog_tags t
       LEFT JOIN blog_post_tags pt ON t.id = pt.tag_id
       GROUP BY t.id, t.name
       ORDER BY count DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('获取热门搜索错误:', error);
    res.status(500).json({ error: '获取热门搜索失败' });
  }
});
