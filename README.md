# 📸 H5 相册模板（Vue 3 + TS）

- ✅ Vue 3 `<script setup>` + TypeScript
- ✅ ESLint + Prettier 代码规范
- ✅ Husky 提交校验
- ✅ 自动部署到 GitHub Pages
- ✅ 响应式 + 全屏预览

## 🚀 快速开始

1. 克隆本仓库
2. 安装依赖：
   ```bash
   pnpm install
   ```
3. 开发：
   ```bash
   pnpm run dev
   ```
4. 构建：
   ```bash
   pnpm run build
   ```

## 📤 添加或上传照片

### 方式 A：本地静态资源（适合部署）
1. 将图片放到 `src/assets/photos/`
2. 运行 `pnpm run build`
3. 推送代码，GitHub Pages 自动部署

### 方式 B：在线上传（适合手机临时分享）
- 页面内点击「选择照片」即可上传（数据只存储在当前设备浏览器的 `localStorage` 中，不会上传到服务器）
- 可随时点击「清空」重新上传

## 📦 功能亮点
- ✅ 完成移动端适配：响应式网格、懒加载、手势滑动
- ✅ 全屏预览 + 自动播放 + 键盘/手势导航
- ✅ 无后台也能上传：基于浏览器本地存储，隐私可控
- ✅ Vue 组件化结构，可快速扩展功能
- ✅ 一键部署 GitHub Pages

## 📦 部署地址

`https://guangmingcunliutao.github.io/photo-album/`
