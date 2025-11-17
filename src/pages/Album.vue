<script setup lang="ts">
import PhotoGrid from '@/components/PhotoGrid.vue'
</script>

<template>
  <div class="album-view">
    <div class="page-shell">
      <header class="page-header">
        <h1>📷 我的相册</h1>
        <p class="subtitle">支持手势滑动、自动切换、全屏预览</p>
      </header>
      <PhotoGrid />
    </div>
  </div>
</template>

<style scoped>
.album-view {
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
</style>

