#!/bin/bash
# 外贸轻助手 - 一键部署脚本
# 使用前请确保已安装 Vercel CLI: npm i -g vercel
# 使用前请确保已安装 GitHub CLI: gh

set -e

echo "🚀 外贸轻助手部署脚本"
echo "========================"

# 检查是否在项目根目录
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ 请在 trade-helper 项目根目录运行此脚本"
    exit 1
fi

# Step 1: 构建后端
echo ""
echo "📦 Step 1: 构建后端..."
cd backend
npm run build
echo "✅ 后端构建成功"

# Step 2: 构建前端
echo ""
echo "📦 Step 2: 构建前端..."
cd ../frontend
npm run build
echo "✅ 前端构建成功"

# Step 3: Git commit
echo ""
echo "📝 Step 3: 提交代码..."
cd ..
git add -A
git commit -m "feat: ready for deployment" || echo "没有新的更改需要提交"
echo "✅ 代码已提交"

echo ""
echo "========================"
echo "✅ 构建完成！请按以下步骤部署："
echo ""
echo "🔧 后端部署 (Render):"
echo "  1. 推送代码到 GitHub:  gh repo create trade-helper --public --source=. --push"
echo "  2. 打开 https://render.com → New → Web Service"
echo "  3. 连接 GitHub 仓库，选择 trade-helper"
echo "  4. 设置:"
echo "     - Build Command: cd backend && npm install && npm run build"
echo "     - Start Command: cd backend && npm run start:prod"
echo "     - Environment Variables:"
echo "       NODE_ENV = production"
echo "       JWT_SECRET = (自动生成)"
echo "       DB_DATABASE = data/trade_helper.db"
echo "  5. 创建 Disk: mount at /opt/render/project/src/backend/data, 1GB"
echo ""
echo "🎨 前端部署 (Vercel):"
echo "  1. 打开 https://vercel.com → Import Project"
echo "  2. 连接 GitHub 仓库 trade-helper"
echo "  3. 设置:"
echo "     - Root Directory: frontend"
echo "     - Framework: Vite"
echo "  4. 环境变量:"
echo "     VITE_API_URL = https://你的Render服务地址.onrender.com/api"
echo "  5. Deploy"
echo ""
echo "🔗 部署完成后，更新后端 CORS:"
echo "  在 Render 环境变量中添加:"
echo "  FRONTEND_URL = https://你的Vercel地址.vercel.app"
echo ""
