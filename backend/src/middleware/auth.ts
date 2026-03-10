import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '未授权：缺少token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; username: string };
    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: '未授权：token无效' });
  }
}
