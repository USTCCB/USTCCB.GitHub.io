#!/bin/bash

# Railway 后端部署脚本
# 此脚本用于记录部署步骤，实际部署需要在 Railway Web 界面完成

echo "=========================================="
echo "Railway 后端部署指南"
echo "=========================================="
echo ""

echo "📋 部署信息："
echo "  - 项目名称: USTCCB.GitHub.io"
echo "  - 后端目录: backend"
echo "  - 前端 URL: https://frontend-pi-six-0l9p0rwmqj.vercel.app"
echo "  - JWT 密钥: cea67da6c7e4db6858326ba5640b62a982575c6e775d0cf2cb0719a7231ea5f1"
echo ""

echo "🚀 请按照以下步骤操作："
echo ""

echo "步骤 1: 访问 Railway"
echo "  打开浏览器，访问: https://railway.app"
echo "  点击 'Login' → 'Login with GitHub'"
echo ""

echo "步骤 2: 创建新项目"
echo "  点击 'New Project'"
echo "  选择 'Deploy from GitHub repo'"
echo "  选择仓库: USTCCB/USTCCB.GitHub.io"
echo ""

echo "步骤 3: 添加 PostgreSQL"
echo "  点击 '+ New'"
echo "  选择 'Database' → 'Add PostgreSQL'"
echo ""

echo "步骤 4: 添加 Redis"
echo "  点击 '+ New'"
echo "  选择 'Database' → 'Add Redis'"
echo ""

echo "步骤 5: 配置后端服务"
echo "  点击 GitHub 仓库服务"
echo "  进入 'Settings' 标签"
echo "  设置 Root Directory: backend"
echo "  设置 Start Command: node dist/main.js"
echo ""

echo "步骤 6: 添加环境变量"
echo "  进入 'Variables' 标签"
echo "  复制以下环境变量（一个一个添加）："
echo ""
cat << 'EOF'
NODE_ENV=production
PORT=3001
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
JWT_SECRET=cea67da6c7e4db6858326ba5640b62a982575c6e775d0cf2cb0719a7231ea5f1
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://frontend-pi-six-0l9p0rwmqj.vercel.app
EOF
echo ""

echo "步骤 7: 部署"
echo "  点击 'Deploy' 按钮"
echo "  等待 2-5 分钟"
echo ""

echo "步骤 8: 获取后端 URL"
echo "  进入 'Settings' → 'Domains'"
echo "  点击 'Generate Domain'"
echo "  复制生成的 URL"
echo ""

echo "步骤 9: 初始化数据库"
echo "  点击 PostgreSQL 服务"
echo "  进入 'Data' 标签"
echo "  点击 'Query'"
echo "  复制 backend/src/db/schema.sql 的内容"
echo "  粘贴并执行"
echo ""

echo "步骤 10: 测试后端"
echo "  访问: https://你的后端URL/health"
echo "  应该看到: {\"status\":\"ok\",\"timestamp\":\"...\"}"
echo ""

echo "步骤 11: 更新前端环境变量"
echo "  访问 Vercel Dashboard"
echo "  进入 frontend 项目"
echo "  Settings → Environment Variables"
echo "  添加: NEXT_PUBLIC_API_URL = https://你的Railway后端URL"
echo "  点击 Redeploy"
echo ""

echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📚 详细文档："
echo "  - DEPLOYMENT_CHECKLIST.md"
echo "  - docs/COMPLETE_DEPLOYMENT_GUIDE.md"
echo ""
