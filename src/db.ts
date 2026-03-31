// src/db.ts
// PostgreSQL 连接池配置
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('[DB] 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('[DB] 非预期数据库错误:', err);
  process.exit(-1);
});

export default pool;
