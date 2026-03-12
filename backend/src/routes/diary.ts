import { Router } from 'express';
import { pool } from '../db';

export const diaryRouter = Router();

// 获取或创建匿名用户 ID
async function getOrCreateAnonUser() {
  const result = await pool.query('SELECT id FROM users WHERE username = $1', ['anon']);
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  const insert = await pool.query(
    `INSERT INTO users (username, email, password_hash, avatar_url, bio)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['anon', 'anon@localhost', 'no-password', null, 'Anonymous user for public posts']
  );
  return insert.rows[0];
}

// 获取日记列表（公开）
diaryRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT d.*, COALESCE(u.username, 'Anonymous') as username
       FROM diaries d
       LEFT JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM diaries'
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
      return res.json({ success: true, data: { diaries: [], total: 0, page: 1, limit: 50 } });
    }
    res.status(500).json({ error: '获取日记列表失败' });
  }
});

// 创建日记
diaryRouter.post('/', async (req, res) => {
  try {
    const { title, content, mood, weather, isPrivate } = req.body;
    const anonUser = await getOrCreateAnonUser();

    const result = await pool.query(
      'INSERT INTO diaries (user_id, title, content, mood, weather, is_private) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [anonUser.id, title, content, mood, weather, isPrivate ?? true]
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
diaryRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, weather, isPrivate } = req.body;

    const result = await pool.query(
      `UPDATE diaries
       SET title = $1, content = $2, mood = $3, weather = $4, is_private = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, content, mood, weather, isPrivate, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '日记不存在' });
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
diaryRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM diaries WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '日记不存在' });
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
