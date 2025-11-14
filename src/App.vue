<script setup lang="ts">
import { ref } from 'vue'
import PhotoGrid from './components/PhotoGrid.vue'
import PhotoUploader from './components/PhotoUploader.vue'

const toastMessage = ref('')
const showToast = ref(false)
let toastTimer: number | null = null

const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    showToast.value = false
  }, 2200)
}

const handlePhotosAdded = (count: number) => {
  if (count > 0) {
    showToastMessage(`已添加 ${count} 张照片`)
  } else {
    showToastMessage('已清空上传的照片')
  }
}
</script>

<template>
  <div class="app">
    <header class="hero">
      <p class="eyebrow">Mobile First · GitHub Pages Ready</p>
      <h1>Hey，留住此刻的温度</h1>
      <p class="sub">
        轻量 H5 相册模板，支持上传、全屏预览、自动播放。适合快速分享到手机端或部署到 GitHub Pages。
      </p>
    </header>

    <section class="section card">
      <div class="section__head">
        <div>
          <p class="title">快速上传</p>
          <p class="desc">文件仅存储在本地浏览器，无需后台</p>
        </div>
      </div>
      <PhotoUploader @photos-added="handlePhotosAdded" />
    </section>

    <section class="section card">
      <div class="section__head">
        <div>
          <p class="title">我的相册</p>
          <p class="desc">支持手势滑动、自动切换、全屏预览</p>
        </div>
      </div>
      <PhotoGrid />
    </section>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'SF Pro Display', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  background: linear-gradient(180deg, #fff5f7, #f4fbff);
  min-height: 100vh;
  color: #0f172a;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 48px) clamp(16px, 5vw, 48px) 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eyebrow {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #f472b6;
  margin: 0;
}

.hero h1 {
  margin: 0;
  font-size: clamp(30px, 6vw, 48px);
  color: #0f172a;
}

.sub {
  margin: 0;
  color: #475569;
  font-size: 16px;
  max-width: 600px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 32px;
  padding: clamp(18px, 4vw, 36px);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.desc {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 15px;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.25);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

@media (max-width: 640px) {
  .card {
    border-radius: 24px;
  }
}
</style>
