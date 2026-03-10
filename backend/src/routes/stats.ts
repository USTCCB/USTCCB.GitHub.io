import { Router } from 'express';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export const statsRouter = Router();

// 获取整体统计数据
statsRouter.get('/overview', async (req, res) => {
  try {
    const [users, posts, albums, diaries] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM blog_posts WHERE published = true'),
      pool.query('SELECT COUNT(*) FROM albums'),
      pool.query('SELECT COUNT(*) FROM diaries')
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(users.rows[0].count),
        totalPosts: parseInt(posts.rows[0].count),
        totalAlbums: parseInt(albums.rows[0].count),
        totalDiaries: parseInt(diaries.rows[0].count)
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 获取用户个人统计
statsRouter.get('/user', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const [posts, albums, diaries, comments] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM blog_posts WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM albums WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM diaries WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM comments WHERE user_id = $1', [userId])
    ]);

    const totalViews = await pool.query(
      'SELECT SUM(view_count) as total FROM blog_posts WHERE user_id = $1',
      [userId]
    );

    const totalLikes = await pool.query(
      'SELECT SUM(like_count) as total FROM blog_posts WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalPosts: parseInt(posts.rows[0].count),
        totalAlbums: parseInt(albums.rows[0].count),
        totalDiaries: parseInt(diaries.rows[0].count),
        totalComments: parseInt(comments.rows[0].count),
        totalViews: parseInt(totalViews.rows[0].total || 0),
        totalLikes: parseInt(totalLikes.rows[0].total || 0)
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ error: '获取用户统计失败' });
  }
});

// 获取热门文章
statsRouter.get('/popular-posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await pool.query(
      `SELECT p.id, p.title, p.view_count, p.like_count, u.username
       FROM blog_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.published = true
       ORDER BY p.view_count DESC, p.like_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('获取热门文章错误:', error);
    res.status(500).json({ error: '获取热门文章失败' });
  }
});

// 获取最新文章
statsRouter.get('/recent-posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const result = await pool.query(
      `SELECT p.id, p.title, p.created_at, u.username
       FROM blog_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.published = true
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('获取最新文章错误:', error);
    res.status(500).json({ error: '获取最新文章失败' });
  }
});

// 获取标签统计
statsRouter.get('/tags', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.name, t.slug, COUNT(pt.post_id) as post_count
       FROM blog_tags t
       LEFT JOIN blog_post_tags pt ON t.id = pt.tag_id
       GROUP BY t.id, t.name, t.slug
       ORDER BY post_count DESC
       LIMIT 20`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('获取标签统计错误:', error);
    res.status(500).json({ error: '获取标签统计失败' });
  }
});
