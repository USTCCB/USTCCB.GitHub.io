import { Router } from 'express';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export const diaryRouter = Router();

// 获取日记列表（只能看自己的）
diaryRouter.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM diaries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM diaries WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        diaries: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error('获取日记列表错误:', error);
    if (error?.code === 'ECONNREFUSED' || !process.env.DATABASE_URL) {
      return res.json({ success: true, data: { diaries: [], total: 0, page: 1, limit: 20 } });
    }
    res.status(500).json({ error: '获取日记列表失败' });
  }
});

// 创建日记
diaryRouter.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, mood, weather, isPrivate } = req.body;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'INSERT INTO diaries (user_id, title, content, mood, weather, is_private) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, title, content, mood, weather, isPrivate ?? true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('创建日记错误:', error);
    res.status(500).json({ error: '创建日记失败' });
  }
});

// 更新日记
diaryRouter.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, weather, isPrivate } = req.body;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      `UPDATE diaries
       SET title = $1, content = $2, mood = $3, weather = $4, is_private = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, content, mood, weather, isPrivate, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '日记不存在或无权限修改' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('更新日记错误:', error);
    res.status(500).json({ error: '更新日记失败' });
  }
});

// 删除日记
diaryRouter.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'DELETE FROM diaries WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '日记不存在或无权限删除' });
    }

    res.json({
      success: true,
      message: '日记已删除'
    });
  } catch (error) {
    console.error('删除日记错误:', error);
    res.status(500).json({ error: '删除日记失败' });
  }
});
