<script setup lang="ts">
import { ref } from 'vue'
import PhotoUploader from '@/components/PhotoUploader.vue'

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
  <div class="upload-view">
    <div class="page-shell">
      <header class="page-header">
        <h1>📤 上传照片</h1>
        <p class="subtitle">选择本地照片或通过 GitHub 上传</p>
      </header>

      <section class="upload-section">
        <PhotoUploader @photos-added="handlePhotosAdded" />
      </section>
    </div>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.upload-view {
  padding-top: clamp(16px, 4vw, 32px);
}

.page-shell {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 clamp(16px, 5vw, 32px) clamp(80px, 12vh, 120px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: clamp(26px, 5vw, 34px);
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.upload-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: clamp(18px, 4vw, 32px);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.25);
  z-index: 200;
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
</style>

