# API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api` (开发环境)
- **生产环境**: `https://your-api-domain.com/api`
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误信息",
  "details": [ ... ] // 可选，验证错误详情
}
```

## 认证 API

### 用户注册

```http
POST /api/auth/register
```

**请求体：**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "created_at": "2026-03-11T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 用户登录

```http
POST /api/auth/login
```

**请求体：**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**响应：** 同注册

### 获取当前用户信息

```http
GET /api/auth/me
Authorization: Bearer {token}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatar_url": null,
    "bio": null,
    "created_at": "2026-03-11T00:00:00.000Z"
  }
}
```

## 博客 API

### 获取文章列表

```http
GET /api/blog?page=1&limit=10
```

**查询参数���**

- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10

**响应：**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "文章标题",
        "summary": "文章摘要",
        "cover_image": "https://...",
        "tags": ["技术", "前端"],
        "view_count": 100,
        "like_count": 10,
        "username": "testuser",
        "avatar_url": "https://...",
        "comment_count": 5,
        "created_at": "2026-03-11T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### 获取文章���情

```http
GET /api/blog/:id
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容（Markdown）",
    "summary": "文章摘要",
    "cover_image": "https://...",
    "tags": ["技术", "前端"],
    "published": true,
    "view_count": 101,
    "like_count": 10,
    "username": "testuser",
    "avatar_url": "https://...",
    "created_at": "2026-03-11T00:00:00.000Z",
    "updated_at": "2026-03-11T00:00:00.000Z"
  }
}
```

### 创建文章

```http
POST /api/blog
Authorization: Bearer {token}
```

**请求体：**

```json
{
  "title": "文章标题",
  "content": "文章内容（Markdown）",
  "summary": "文章摘要",
  "coverImage": "https://...",
  "tags": ["技术", "前端"],
  "published": true
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容",
    "summary": "文章摘要",
    "cover_image": "https://...",
    "tags": ["技术", "前端"],
    "published": true,
    "view_count": 0,
    "like_count": 0,
    "created_at": "2026-03-11T00:00:00.000Z"
  }
}
```

### 更新文章

```http
PUT /api/blog/:id
Authorization: Bearer {token}
```

**请求体：** 同创建文章

### 删除文章

```http
DELETE /api/blog/:id
Authorization: Bearer {token}
```

**响应：**

```json
{
  "success": true,
  "message": "文章已删除"
}
```

### 点赞文章

```http
POST /api/blog/:id/like
```

**响应：**

```json
{
  "success": true,
  "message": "点赞成功"
}
```

## 评论 API

### 获取文章评论

```http
GET /api/comments/post/:postId
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 1,
      "content": "评论内容",
      "parent_id": null,
      "username": "testuser",
      "avatar_url": "https://...",
      "created_at": "2026-03-11T00:00:00.000Z"
    }
  ]
}
```

### 创建评论

```http
POST /api/comments
Authorization: Bearer {token}
```

**请求体：**

```json
{
  "postId": 1,
  "content": "评论内容",
  "parentId": null // 可选，回复评论时填写父评论ID
}
```

### 删除评论

```http
DELETE /api/comments/:id
Authorization: Bearer {token}
```

## 相册 API

### 获取相册列表

```http
GET /api/album
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "相册标题",
      "description": "相册描述",
      "cover_image": "https://...",
      "username": "testuser",
      "photo_count": 10,
      "created_at": "2026-03-11T00:00:00.000Z"
    }
  ]
}
```

### 获取相册详情

```http
GET /api/album/:id
```

**响应：**

```json
{
  "success": true,
  "data": {
    "album": {
      "id": 1,
      "title": "相册标题",
      "description": "相册描述",
      "cover_image": "https://...",
      "username": "testuser",
      "created_at": "2026-03-11T00:00:00.000Z"
    },
    "photos": [
      {
        "id": 1,
        "url": "https://...",
        "thumbnail_url": "https://...",
        "title": "照片标题",
        "description": "照片描述",
        "tags": ["风景", "旅行"],
        "created_at": "2026-03-11T00:00:00.000Z"
      }
    ]
  }
}
```

### 创建相册

```http
POST /api/album
Authorization: Bearer {token}
```

**请求体：**

```json
{
  "title": "相册标题",
  "description": "相册描述",
  "coverImage": "https://..."
}
```

### 上传照片到相册

```http
POST /api/album/:id/photos
Authorization: Bearer {token}
```

**请求体：**

```json
{
  "url": "https://...",
  "title": "照片标题",
  "description": "照片描述",
  "tags": ["风景", "旅行"]
}
```

## 日记 API

### 获取日记列表

```http
GET /api/diary?page=1&limit=20
Authorization: Bearer {token}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "diaries": [
      {
        "id": 1,
        "title": "日记标题",
        "content": "日记内容",
        "mood": "开心",
        "weather": "晴天",
        "is_private": true,
        "diary_date": "2026-03-11",
        "created_at": "2026-03-11T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### 创建日记

```http
POST /api/diary
Authorization: Bearer {token}
```

**请求体：**

```json
{
  "title": "日记标题",
  "content": "日记内容",
  "mood": "开心",
  "weather": "晴天",
  "isPrivate": true
}
```

### 更新日记

```http
PUT /api/diary/:id
Authorization: Bearer {token}
```

**请求体：** 同创建日记

### 删除日记

```http
DELETE /api/diary/:id
Authorization: Bearer {token}
```

## 搜索 API

### 全局搜索

```http
GET /api/search?q=关键词&type=all&page=1&limit=10
```

**查询参数：**

- `q` (必需): 搜索关键词
- `type` (可选): 搜索类型 - `all`, `posts`, `albums`, `users`，默认 `all`
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10

**响应：**

```json
{
  "success": true,
  "data": {
    "posts": [ ... ],
    "albums": [ ... ],
    "users": [ ... ]
  },
  "query": "关键词",
  "type": "all"
}
```

### 热门搜索词

```http
GET /api/search/trending
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "name": "前端",
      "count": 10
    }
  ]
}
```

## 统计 API

### 整体统计

```http
GET /api/stats/overview
```

**响应：**

```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalPosts": 500,
    "totalAlbums": 50,
    "totalDiaries": 200
  }
}
```

### 用户个人统计

```http
GET /api/stats/user
Authorization: Bearer {token}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "totalPosts": 10,
    "totalAlbums": 5,
    "totalDiaries": 20,
    "totalComments": 30,
    "totalViews": 1000,
    "totalLikes": 100
  }
}
```

### 热门文章

```http
GET /api/stats/popular-posts?limit=10
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "文章标题",
      "view_count": 1000,
      "like_count": 100,
      "username": "testuser"
    }
  ]
}
```

### 最新文章

```http
GET /api/stats/recent-posts?limit=5
```

### 标签统计

```http
GET /api/stats/tags
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "name": "前端",
      "slug": "frontend",
      "post_count": 10
    }
  ]
}
```

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或 token 无效） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 限流

- 每个 IP 每 15 分钟最多 100 个请求
- 超过限制返回 429 状态码

## 认证说明

需要认证的接口需要在请求头中添加：

```
Authorization: Bearer {your_jwt_token}
```

Token 在登录或注册成功后返回，有效期 7 天。
