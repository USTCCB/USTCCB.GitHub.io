import { Router } from 'express';
import { io } from '../main';
import { logger } from '../middleware/logger';

export const statsRouter = Router();

// 内存存储访问和点赞计数
let visitCount = 0;
let likeCount = 0;

// 获取统计数据
statsRouter.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        visits: visitCount,
        likes: likeCount,
        onlineUsers: getOnlineUserCount(),
      },
    });
  } catch (error) {
    logger.error('获取统计数据错误', { error });
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 增加访问计数
statsRouter.post('/visit', async (req, res) => {
  try {
    visitCount++;
    // 实时广播更新
    io.emit('stats:update', { visits: visitCount });
    logger.info('Visit incremented', { visits: visitCount });
    res.json({ success: true, data: { visits: visitCount } });
  } catch (error) {
    logger.error('访问计数错误', { error });
    res.status(500).json({ error: '访问计数失败' });
  }
});

// 增加点赞计数
statsRouter.post('/like', async (req, res) => {
  try {
    likeCount++;
    // 实时广播更新
    io.emit('stats:update', { likes: likeCount });
    logger.info('Like incremented', { likes: likeCount });
    res.json({ success: true, data: { likes: likeCount } });
  } catch (error) {
    logger.error('点赞计数错误', { error });
    res.status(500).json({ error: '点赞计数失败' });
  }
});

// 获取在线用户数
function getOnlineUserCount(): number {
  // 从 Socket.IO 获取连接数
  return io.engine?.clientsCount || 0;
}
