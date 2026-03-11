# 🔧 Railway 部署问题排查

## 当前状态

- ✅ Railway 项目已创建
- ✅ 所有服务已配置（backend, PostgreSQL, Redis）
- ✅ 环境变量已设置
- ✅ GitHub 仓库已连接
- ❌ 后端部署持续失败

## 问题分析

Railway API 无法提供详细的构建日志，需要通过 Web Dashboard 查看。

## 解决步骤

### 1. 查看构建日志

1. 打开：https://railway.app/project/8386fc4c-4eb6-4ca6-b148-68db0dc78e9c
2. 点击 **backend** 服务
3. 点击 **Deployments** 标签
4. 点击最新的失败部署
5. 查看 **Build Logs** 和 **Deploy Logs**
6. 找到具体的错误信息

### 2. 常见问题和解决方案

#### 问题 A: Dockerfile 路径错误
**症状**: `COPY failed: file not found`

**解决**:
- 在 Settings → Service Settings 中
- 确认 **Root Directory** 为空（不要设置）
- 确认使用项目根目录的 Dockerfile

#### 问题 B: 依赖安装失败
**症状**: `npm install` 或 `npm ci` 失败

**解决**:
- 检查 backend/package.json 是否正确
- 可能需要在 Dockerfile 中添加 `--legacy-peer-deps`

#### 问题 C: TypeScript 编译失败
**症状**: `tsc` 或 `npm run build` 失败

**解决**:
- 检查 backend/tsconfig.json
- 确保所有 TypeScript 文件没有语法错误

#### 问题 D: 端口配置错误
**症状**: 服务启动但无法访问

**解决**:
- 确认环境变量 PORT=3001
- 确认 Dockerfile EXPOSE 3001

### 3. 手动触发重新部署

如果修复了代码问题：

```bash
cd E:/workspace/personal-platform-fullstack
git add .
git commit -m "fix: 修复部署问题"
git push
```

或者在 Railway Dashboard 中点击 **Redeploy** 按钮。

### 4. 备用方案：使用 Nixpacks

如果 Dockerfile 持续失败，可以尝试 Nixpacks：

1. 删除项目根目录的 Dockerfile
2. 在 Railway Dashboard → Settings 中：
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `node dist/main.js`
3. 点击 **Deploy**

### 5. 初始化数据库（部署成功后）

一旦后端部署成功，执行以下步骤：

1. 点击 **postgres** 服务
2. 点击 **Data** 标签
3. 点击 **Query**
4. 执行 `backend/src/db/schema.sql` 中的 SQL

### 6. 更新前端环境变量

1. 访问 Vercel: https://vercel.com
2. 找到 frontend 项目
3. Settings → Environment Variables
4. 添加：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://backend-production-4de2.up.railway.app`
5. Redeploy

## 需要帮助？

如果遇到无法解决的问题：

1. 截图 Railway 的构建日志
2. 检查 GitHub Actions 是否有错误
3. 确认本地可以成功构建：
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

## 项目信息

- **Railway 项目**: https://railway.app/project/8386fc4c-4eb6-4ca6-b148-68db0dc78e9c
- **GitHub 仓库**: https://github.com/USTCCB/USTCCB.GitHub.io
- **后端域名**: https://backend-production-4de2.up.railway.app
- **前端地址**: https://frontend-pi-six-0l9p0rwmqj.vercel.app
