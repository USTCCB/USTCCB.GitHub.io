import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../middleware/logger';

const router = express.Router();

// 内存存储
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// S3 客户端配置
const s3Client = process.env.S3_ENDPOINT
  ? new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
      region: process.env.S3_REGION || 'auto',
    })
  : null;

/**
 * POST /api/files/upload
 * 上传文件到 S3 或返回 base64
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 验证文件类型
    const schema = z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    const parseResult = schema.safeParse(req.file.mimetype);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const fileKey = `uploads/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;

    if (s3Client && process.env.S3_BUCKET) {
      // 上传到 S3
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      });
      await s3Client.send(command);

      const url = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileKey}`;
      logger.info('File uploaded to S3', { key: fileKey, url });
      res.status(201).json({ url, key: fileKey, size: req.file.size });
    } else {
      // 降级到 base64
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      logger.info('File stored as base64 (S3 not configured)', { size: req.file.size });
      res.status(201).json({
        url: dataUrl,
        key: fileKey,
        size: req.file.size,
        warning: 'S3 not configured, using base64 fallback',
      });
    }
  } catch (err: any) {
    logger.error('File upload failed', { error: err.message });
    res.status(500).json({ error: 'upload_failed' });
  }
});

/**
 * DELETE /api/files/:key
 * 删除文件
 */
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (s3Client && process.env.S3_BUCKET) {
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      });
      await s3Client.send(command);
      logger.info('File deleted from S3', { key });
    }

    res.json({ success: true });
  } catch (err: any) {
    logger.error('File delete failed', { error: err.message });
    res.status(500).json({ error: 'delete_failed' });
  }
});

export { router as fileRouter };
