# RAG 知识库问答模块

> 集成到 ustc.chat 的 RAG 模块：上传 PDF/文档 → 自动向量化 → 语义检索 → LLM 带来源回答

## 技术架构

```
用户上传文档
     ↓
文本提取（pdf-parse）
     ↓
文本切块（500 字/块，80 字重叠）
     ↓
批量 Embedding（OpenAI text-embedding-3-small）
     ↓
存入 PostgreSQL pgvector
     ↓
用户提问 → 问题向量化 → 余弦相似度检索 Top5
     ↓
组装 Context + Prompt → Claude API → 带来源回答
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入真实的 API Key 和数据库连接
```

### 3. 数据库初始化

在 Railway PostgreSQL 控制台执行 `sql/001_rag_setup.sql`：

```bash
# 方式 1：命令行
psql $DATABASE_URL < sql/001_rag_setup.sql

# 方式 2：直接粘贴 sql 文件内容到 Railway 的 Query 界面
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器运行在 `http://localhost:3000`

## API 接口

| 方法   | 路径                    | 说明               |
|--------|-------------------------|--------------------|
| GET    | /health                 | 健康检查           |
| POST   | /api/rag/upload         | 上传文档并向量化   |
| POST   | /api/rag/chat           | 基于文档问答       |
| GET    | /api/rag/documents      | 获取文档列表       |
| DELETE | /api/rag/documents/:id  | 删除文档           |

### 请求/响应示例

#### POST /api/rag/upload

```bash
curl -X POST http://localhost:3000/api/rag/upload \
  -F "file=@document.pdf"
```

响应：
```json
{
  "success": true,
  "documentId": 1,
  "filename": "document.pdf",
  "chunkCount": 42,
  "charCount": 15000
}
```

#### POST /api/rag/chat

```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "question": "什么是 RAG？",
    "history": []
  }'
```

响应：
```json
{
  "answer": "RAG（检索增强生成）是一种...",
  "sources": [
    {
      "content": "RAG 是 Retrieval-Augmented Generation 的缩写...",
      "chunkIndex": 5,
      "similarity": 0.85
    }
  ]
}
```

## 文件结构

```
.
├── src/
│   ├── app.ts                 # Express 主应用
│   ├── db.ts                  # PostgreSQL 连接池
│   ├── routes/
│   │   └── rag.ts             # RAG 路由
│   └── lib/
│       ├── chunker.ts         # 文本分块
│       └── embeddings.ts      # Embedding 封装
├── frontend/
│   └── RagChat.tsx            # React 前端组件
├── sql/
│   └── 001_rag_setup.sql      # 数据库迁移
├── package.json
├── tsconfig.json
└── .env.example
```

## 集成到现有项目

### 后端（在 app.ts 里加一行）

```typescript
import ragRouter from './routes/rag';
app.use('/api/rag', ragRouter);
```

### 前端（在 React Router 里加）

```typescript
import RagChat from './frontend/RagChat';
<Route path="/rag" element={<RagChat />} />
```

## 环境变量

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库连接（Railway PostgreSQL）
DATABASE_URL=postgresql://user:password@host.railway.internal:5432/dbname

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Embedding 提供商：openai 或 deepseek
EMBEDDING_PROVIDER=openai

# OpenAI API Key
OPENAI_API_KEY=sk-...

# 或 DeepSeek API Key（可选）
# DEEPSEEK_API_KEY=sk-...
```

## 费用估算（OpenAI）

- text-embedding-3-small：$0.02 / 百万 tokens
- 上传一本 100 页 PDF（约 10 万字）≈ $0.003（不到 2 分钱）
- 每次对话检索：可忽略不计

## 简历描述

> 在个人全栈平台集成 RAG 知识库问答系统；基于 PostgreSQL pgvector 扩展实现文档向量化存储（IVFFlat 索引）与余弦相似度语义检索；通过批量 Embedding + 滑动窗口分块策略优化检索精度，接入 Claude API 实现私有知识库低幻觉问答，支持 PDF / TXT / Markdown 多格式上传。
