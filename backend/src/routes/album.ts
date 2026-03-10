import { Router } from 'express';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export const albumRouter = Router();

// 获取所有相册
albumRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username,
        (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count
       FROM albums a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('获取相册列表错误:', error);
    res.status(500).json({ error: '获取相册列表失败' });
  }
});

// 获取相册详情及照片
albumRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const albumResult = await pool.query(
      'SELECT a.*, u.username FROM albums a JOIN users u ON a.user_id = u.id WHERE a.id = $1',
      [id]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({ error: '相册不存在' });
    }

    const photosResult = await pool.query(
      'SELECT * FROM photos WHERE album_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: {
        album: albumResult.rows[0],
        photos: photosResult.rows
      }
    });
  } catch (error) {
    console.error('获取相册详情错误:', error);
    res.status(500).json({ error: '获取相册详情失败' });
  }
});

// 创建相册
albumRouter.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'INSERT INTO albums (user_id, title, description, cover_image) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description, coverImage]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('创建相册错误:', error);
    res.status(500).json({ error: '创建相册失败' });
  }
});

// 上传照片到相册
albumRouter.post('/:id/photos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, description, tags } = req.body;
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'INSERT INTO photos (album_id, user_id, url, title, description, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, userId, url, title, description, tags]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('上传照片错误:', error);
    res.status(500).json({ error: '上传照片失败' });
  }
});
