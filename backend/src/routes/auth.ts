import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db';

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// 注册
authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    // 检查用户是否存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: '输入验证失败', details: error.errors });
    }
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 查找用户
    const result = await pool.query(
      'SELECT id, username, email, password_hash, avatar_url, bio FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const user = result.rows[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    // 移除密码哈希
    delete user.password_hash;

    res.json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: '输入验证失败', details: error.errors });
    }
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const result = await pool.query(
      'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ error: '未授权' });
  }
});
