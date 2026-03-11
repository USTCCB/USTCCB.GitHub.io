import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';

export const blogRouter = Router();

// 获取或创建匿名用户 ID
async function getOrCreateAnonUser() {
  const result = await pool.query('SELECT id FROM users WHERE username = $1', ['anon']);
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  // 创建匿名用户
  const insert = await pool.query(
    `INSERT INTO users (username, email, password_hash, avatar_url, bio)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['anon', 'anon@localhost', 'no-password', null, 'Anonymous user for public posts']
  );
  return insert.rows[0];
}

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false)
});

// 获取所有文章（分页）
blogRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, COALESCE(u.username, 'Anonymous') as username, COALESCE(u.avatar_url, '') as avatar_url,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM blog_posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.published = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM blog_posts WHERE published = true'
    );

    res.json({
      success: true,
      data: {
        posts: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error('获取文章列表错误:', error);
    // 数据库未连接时返回空列表，不报错
    if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED') || !process.env.DATABASE_URL) {
      return res.json({ success: true, data: { posts: [], total: 0, page: 1, limit: 10 } });
    }
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取单篇文章
blogRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 增加浏览量
    await pool.query(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    const result = await pool.query(
      `SELECT p.*, u.username, u.avatar_url
       FROM blog_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建文章（无需认证，使用匿名用户 ID）
blogRouter.post('/', async (req, res) => {
  try {
    const data = createPostSchema.parse(req.body);
    // 使用匿名用户 ID（如果没有则创建）
    const anonUser = await getOrCreateAnonUser();

    const result = await pool.query(
      `INSERT INTO blog_posts (user_id, title, content, summary, cover_image, tags, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [anonUser.id, data.title, data.content, data.summary, data.coverImage, data.tags, data.published]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: '输入验证失败', details: error.errors });
    }
    console.error('创建文章错误:', error);
    res.status(500).json({ error: '创建文章失败' });
  }
});

// 更新文章
blogRouter.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const data = createPostSchema.parse(req.body);
    const userId = (req as any).user.userId;

    // 检查权限
    const checkResult = await pool.query(
      'SELECT user_id FROM blog_posts WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: '无权限修改此文章' });
    }

    const result = await pool.query(
      `UPDATE blog_posts
       SET title = $1, content = $2, summary = $3, cover_image = $4, tags = $5, published = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [data.title, data.content, data.summary, data.coverImage, data.tags, data.published, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: '输入验证失败', details: error.errors });
    }
    console.error('更新文章错误:', error);
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章
blogRouter.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在或无权限删除' });
    }

    res.json({
      success: true,
      message: '文章已删除'
    });
  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({ error: '删除文章失败' });
  }
});

// 点赞文章
blogRouter.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE blog_posts SET like_count = like_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ error: '点赞失败' });
  }
});
