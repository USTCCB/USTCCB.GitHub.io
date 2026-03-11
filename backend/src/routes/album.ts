import { Router } from 'express';
import { pool } from '../db';

export const albumRouter = Router();

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

// 获取或创建默认相册
async function getOrCreateDefaultAlbum() {
  const anonUser = await getOrCreateAnonUser();
  const result = await pool.query('SELECT id FROM albums WHERE user_id = $1 AND title = $2', [anonUser.id, '默认相册']);
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  const insert = await pool.query(
    'INSERT INTO albums (user_id, title, description, cover_image) VALUES ($1, $2, $3, $4) RETURNING *',
    [anonUser.id, '默认相册', '默认相册，存放所有照片', null]
  );
  return insert.rows[0];
}

// 获取所有相册
albumRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, COALESCE(u.username, 'Anonymous') as username,
        (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count
       FROM albums a
       LEFT JOIN users u ON a.user_id = u.id
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
      'SELECT a.*, COALESCE(u.username, \'Anonymous\') as username FROM albums a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = $1',
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
albumRouter.post('/', async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;
    const anonUser = await getOrCreateAnonUser();

    const result = await pool.query(
      'INSERT INTO albums (user_id, title, description, cover_image) VALUES ($1, $2, $3, $4) RETURNING *',
      [anonUser.id, title, description, coverImage]
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
albumRouter.post('/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, description, tags } = req.body;
    const anonUser = await getOrCreateAnonUser();

    const result = await pool.query(
      'INSERT INTO photos (album_id, user_id, url, title, description, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, anonUser.id, url, title, description, tags]
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

// 删除照片
albumRouter.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    const { id, photoId } = req.params;

    const result = await pool.query(
      'DELETE FROM photos WHERE id = $1 AND album_id = $2 RETURNING id',
      [photoId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '照片不存在' });
    }

    res.json({
      success: true,
      message: '照片已删除'
    });
  } catch (error) {
    console.error('删除照片错误:', error);
    res.status(500).json({ error: '删除照片失败' });
  }
});
