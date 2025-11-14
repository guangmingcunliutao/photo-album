#!/bin/bash

set -e

PROJECT_NAME=${1:-photo-album}

echo "🚀 创建 H5 相册项目: $PROJECT_NAME"

# 创建目录结构
mkdir -p "$PROJECT_NAME"/{public/photos,src/components,.github/workflows}

cd "$PROJECT_NAME"

# 写入文件函数
write_file() {
  cat > "$1" << 'EOF'
$2
EOF
}

# =============== package.json ===============
cat > package.json << 'EOF'
{
  "name": "photo-album",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.ts,.tsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-vue": "^9.20.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.2.0",
    "typescript": "~5.4.0",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0"
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
EOF

# =============== tsconfig.json ===============
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
EOF

# =============== .eslintrc.cjs ===============
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': 'warn',
  },
}
EOF

# =============== .prettierrc ===============
cat > .prettierrc << 'EOF'
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 80,
  "trailingComma": "es5"
}
EOF

# =============== .lintstagedrc.json ===============
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,ts,vue}": ["eslint --fix", "prettier --write"]
}
EOF

# =============== vite.config.ts ===============
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/photo-album/', // ← 记得改成你的仓库名！
})
EOF

# =============== index.html ===============
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的相册</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF

# =============== src/main.ts ===============
mkdir -p src
cat > src/main.ts << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
EOF

# =============== src/App.vue ===============
cat > src/App.vue << 'EOF'
<script setup lang="ts">
import PhotoGrid from './components/PhotoGrid.vue'
</script>

<template>
  <div class="app">
    <h1>📷 我的相册</h1>
    <PhotoGrid />
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
  background: #f9f9f9;
  min-height: 100vh;
}
h1 {
  color: #333;
  margin-bottom: 24px;
}
</style>
EOF

# =============== src/components/PhotoGrid.vue ===============
mkdir -p src/components
cat > src/components/PhotoGrid.vue << 'EOF'
<script setup lang="ts">
import { ref } from 'vue'

// 👇 后续你只需在这里添加照片文件名
const photoNames = [
  '1.jpg',
  '2.jpg',
  '3.jpg',
  // '4.png', '5.jpeg', ...
]

const photos = photoNames.map(name => `/photos/${name}`)
const fullscreenSrc = ref<string | null>(null)

const openFullscreen = (src: string) => {
  fullscreenSrc.value = src
  document.body.style.overflow = 'hidden'
}

const closeFullscreen = () => {
  fullscreenSrc.value = null
  document.body.style.overflow = ''
}
</script>

<template>
  <div class="photo-grid">
    <div v-for="(src, i) in photos" :key="i" class="photo-item">
      <img :src="src" @click="openFullscreen(src)" loading="lazy" />
    </div>
  </div>

  <div v-if="fullscreenSrc" class="fullscreen-overlay" @click="closeFullscreen">
    <img :src="fullscreenSrc" alt="Fullscreen" />
  </div>
</template>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
.photo-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}
.photo-item img:hover {
  transform: scale(1.05);
}
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.fullscreen-overlay img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
}
</style>
EOF

# =============== .github/workflows/deploy.yml ===============
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
EOF

# =============== README.md ===============
cat > README.md << 'EOF'
# 📸 H5 相册模板（Vue 3 + TS）

- ✅ Vue 3 \`<script setup>\` + TypeScript
- ✅ ESLint + Prettier 代码规范
- ✅ Husky 提交校验
- ✅ 自动部署到 GitHub Pages
- ✅ 响应式 + 全屏预览

## 🚀 快速开始

1. 克隆本仓库
2. 安装依赖：
   \`\`\`bash
   npm install
   \`\`\`
3. 开发：
   \`\`\`bash
   npm run dev
   \`\`\`
4. 构建：
   \`\`\`bash
   npm run build
   \`\`\`

## 📤 添加你的照片

1. 将图片放入 \`public/photos/\`（如 \`1.jpg\`, \`vacation.png\`）
2. 编辑 \`src/components/PhotoGrid.vue\` 中的 \`photoNames\` 数组
3. 提交代码，自动部署！

## 🌐 部署地址

\`https://<your-username>.github.io/photo-album/\`
EOF

# =============== 初始化 Git 和 Husky ===============
echo "📦 安装依赖并初始化 Husky..."
npm install
npx husky install

# =============== 提示信息 ===============
echo ""
echo "✅ 项目创建成功！"
echo "📁 项目目录: $(pwd)"
echo ""
echo "👉 下一步操作："
echo "1. 把你的照片放入 public/photos/（例如 1.jpg）"
echo "2. 修改 src/components/PhotoGrid.vue 中的 photoNames 数组"
echo "3. 运行 npm run dev 查看效果"
echo "4. 推送到 GitHub 并启用 Pages（记得改 vite.config.ts 中的 base）"
echo ""