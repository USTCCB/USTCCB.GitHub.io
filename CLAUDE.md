# CLAUDE.md - 个人平台全栈维护指南

## 项目概览

| 项目 | 地址 |
|------|------|
| 前端部署 | https://ustc.chat/ (GitHub Pages) |
| 后端 API | https://backend-production-4de2.up.railway.app |
| GitHub 仓库 | https://github.com/USTCCB/USTCCB.GitHub.io |
| Railway 项目 ID | `b4ffa18c-e025-4fcb-86e7-a27aee74e72c` |

## 技术栈

- **前端**: 纯 HTML/CSS/JavaScript (无框架)
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL (Railway 托管)

## 核心配置

### 数据库连接 (backend/src/db/index.ts)

```typescript
const dbUrl = process.env.DATABASE_URL
  || 'postgresql://postgres:hAJeYuCbrmOxUfXjlEHtCBHDtPawWfnV@postgres.railway.internal:5432/railway';
```

### 匿名用户模式

所有上传功能无需登录，使用匿名用户 ID (user_id=2) 存储：

```typescript
async function getOrCreateAnonUser() {
  const result = await pool.query('SELECT id FROM users WHERE username = $1', ['anon']);
  if (result.rows.length > 0) return result.rows[0];
  // 创建匿名用户...
}
```

## API 端点

| 功能 | 端点 | 认证 |
|------|------|------|
| 博客 | GET/POST /api/blog | 否 |
| 日记 | GET/POST /api/diary | 否 |
| 相册 | GET /api/album/:id | 否 |
| 上传照片 | POST /api/album/:id/photos | 否 |

## 部署流程

```bash
# 1. 提交更改
git add .
git commit -m "fix: 描述"

# 2. 推送 (自动触发 Railway 部署)
git push origin main

# 3. 数据库初始化 (首次部署后)
curl https://backend-production-4de2.up.railway.app/api/init-db
```

## 调试命令

```bash
# 测试后端 API
curl https://backend-production-4de2.up.railway.app/health
curl https://backend-production-4de2.up.railway.app/api/blog
curl https://backend-production-4de2.up.railway.app/api/diary
curl https://backend-production-4de2.up.railway.app/api/album/1

# 查看 git 状态
git log --oneline -5
```

## 常见问题

1. **前端不显示数据**: 强制刷新 (Ctrl+Shift+R)，检查浏览器控制台错误
2. **后端构建失败**: `cd backend && npm run build` 本地验证
3. **上传功能失效**: 检查默认相册 (id=1) 和匿名用户 (id=2) 是否存在

## 重要文件

| 文件 | 用途 |
|------|------|
| `myBlogs.html` | 博客页面 |
| `myAlbum.html` | 相册页面 |
| `myDairy.html` | 日记页面 |
| `backend/src/routes/blog.ts` | 博客 API |
| `backend/src/routes/album.ts` | 相册 API |
| `backend/src/routes/diary.ts` | 日记 API |

## 注意事项

- 无登录模式，所有用户可直接上传内容
- 默认相册 ID=1，匿名用户 ID=2
- Railway 监听 GitHub 推送自动部署
