# 🔑 如何正确生成 Railway API Token

## ❌ 当前问题

两个 Token 都显示 "Not Authorized"，说明 Token 生成或复制过程有问题。

---

## ✅ 正确生成 Token 的步骤

### 步骤 1: 登录 Railway

1. 打开浏览器
2. 访问：https://railway.app
3. 确保已登录（右上角显示你的头像）

### 步骤 2: 访问 Token 页面

直接访问：https://railway.app/account/tokens

或者：
1. 点击右上角头像
2. 选择 **"Account Settings"**
3. 点击左侧菜单的 **"Tokens"**

### 步骤 3: 创建新 Token

1. 点击 **"Create Token"** 按钮
2. 输入 Token 名称（例如：`CLI Deploy`）
3. 点击 **"Create"**
4. **立即复制显示的 Token**（只显示一次！）

### 步骤 4: 验证 Token 格式

正确的 Token 格式应该是：
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

例如：
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 🔍 常见错误

### 错误 1: 复制了错误的内容
- ❌ 复制了项目 ID
- ❌ 复制了 Service ID
- ✅ 应该复制 API Token

### 错误 2: Token 已过期
- 某些 Token 可能有有效期
- 需要重新生成

### 错误 3: 账号权限不足
- 确保账号有项目访问权限
- 确保 Token 有足够的权限

---

## 📸 截图参考

生成 Token 时，页面应该显示：

```
┌─────────────────────────────────────┐
│  Token Created Successfully         │
│                                     │
│  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx │
│                                     │
│  [Copy]  This token will only be    │
│          shown once                 │
└─────────────────────────────────────┘
```

---

## 🚀 替代方案：使用 Web 界面

如果 Token 生成有问题，我们可以直接使用 Railway Web 界面完成部署。

**我已经准备好了所有需要的代码和步骤，只需要 5 分钟！**

### 快速步骤：

1. **初始化数据库**
   - PostgreSQL → Data → Query
   - 复制粘贴 SQL（我已准备好）

2. **获取后端 URL**
   - Settings → Domains → Generate Domain

3. **测试后端**
   - 访问 `/health` 端点

4. **更新前端**
   - Vercel → Environment Variables
   - 添加 `NEXT_PUBLIC_API_URL`

5. **重新部署前端**
   - Vercel → Redeploy

---

## 🤔 你的选择

**选项 A**: 重新生成 Token（按照上面的步骤）

**选项 B**: 使用 Web 界面完成（更简单，我来指导你）

---

**告诉我你想怎么做？** 🚀
