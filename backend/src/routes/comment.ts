import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export const commentRouter = Router();

const createCommentSchema = z.object({
  postId: z.number(),
  content: z.string().min(1).max(500),
  parentId: z.number().optional()
});

// 获取文章的所有评论
commentRouter.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('获取评论错误:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 创建评论
commentRouter.post('/', authenticate, async (req, res) => {
  try {
    const data = createCommentSchema.parse(req.body);
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.postId, userId, data.content, data.parentId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: '输入验证失败', details: error.errors });
    }
    console.error('创建评论错误:', error);
    res.status(500).json({ error: '创建评论失败' });
  }
});

// 删除评论
commentRouter.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '评论不存在或无权限删除' });
    }

    res.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '删除评论失败' });
  }
});
