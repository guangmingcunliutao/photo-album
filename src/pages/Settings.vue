<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTransitionEffect } from '@/composables/useTransitionEffect'
import { useLongPressAndClick } from '@/composables/useGesture'

const router = useRouter()
const { currentEffect, setEffect } = useTransitionEffect()

const recentlyTriggered = ref(false)

const effectOptions = [
  { value: 'fade' as const, label: '淡进淡出', icon: '✨' },
  { value: 'slide' as const, label: '滑动', icon: '➡️' },
  { value: 'zoom' as const, label: '缩放', icon: '🔍' },
  { value: 'rotate' as const, label: '旋转', icon: '🔄' },
  { value: 'flip' as const, label: '翻转', icon: '🔄' },
]

const handleSecretNavigate = () => {
  recentlyTriggered.value = true
  setTimeout(() => {
    recentlyTriggered.value = false
  }, 3000)
  router.push('/__github-config')
}

const { handleTouchStart, handleTouchEnd, handleTouchCancel, isLongPressing, hasLongPressed } =
  useLongPressAndClick(handleSecretNavigate, 2000)
</script>

<template>
  <div class="settings-view">
    <div class="page-shell">
      <header
        class="page-header"
        :class="{ 'long-pressing': isLongPressing, 'long-pressed': hasLongPressed }"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchCancel"
      >
        <h1>👤 我的</h1>
        <p class="subtitle">个人设置与偏好</p>
        <p class="hint-text">
          <template v-if="isLongPressing">⏳ 长按中，松开即可进入隐藏配置</template>
          <template v-else-if="hasLongPressed">✅ 长按完成，请点按以跳转</template>
          <template v-else-if="recentlyTriggered">🚀 已进入 GitHub 配置页</template>
          <template v-else>💡 长按 2 秒后松开，即可进入 GitHub 隐藏页面</template>
        </p>
      </header>

      <div class="settings-content">
        <section class="settings-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">切换特效</h2>
              <p class="desc">适用于全屏预览的自动播放动画</p>
            </div>
          </div>
          <div class="effect-grid">
            <button
              v-for="option in effectOptions"
              :key="option.value"
              class="effect-option"
              :class="{ active: currentEffect === option.value }"
              @click="setEffect(option.value)"
            >
              <span class="effect-icon">{{ option.icon }}</span>
              <span class="effect-label">{{ option.label }}</span>
              <span v-if="currentEffect === option.value" class="effect-check">✓</span>
            </button>
          </div>
        </section>

        <section class="settings-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">关于隐藏页面</h2>
              <p class="desc">某些高级设置需要长按解锁，避免误操作</p>
            </div>
          </div>
          <p class="info">
            继续在本页标题区域长按 2 秒并松开，即可进入隐藏的 GitHub 配置页面。建议仅在需要云端同步时再启用。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: clamp(12px, 4vw, 24px) 0;
}

.page-shell {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 clamp(16px, 5vw, 32px) clamp(80px, 12vh, 140px);
}

.page-header {
  transition: background-color 0.3s ease, transform 0.2s ease;
  border-radius: 20px;
  padding: clamp(16px, 4vw, 24px);
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.page-header.long-pressing {
  background: rgba(255, 126, 179, 0.12);
  transform: scale(0.985);
}

.page-header.long-pressed {
  background: rgba(16, 185, 129, 0.12);
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.hint-text {
  margin: 12px 0 0;
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: clamp(18px, 4vw, 32px);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.desc {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 14px;
}

.effect-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 16px;
}

.effect-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.effect-option:active {
  transform: scale(0.98);
}

.effect-option.active {
  border-color: #ff7eb3;
  background: rgba(255, 126, 179, 0.08);
  box-shadow: 0 12px 24px rgba(255, 118, 136, 0.18);
}

.effect-icon {
  font-size: 26px;
}

.effect-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.effect-option.active .effect-label {
  color: #ff7eb3;
  font-weight: 600;
}

.effect-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #ff7eb3;
  font-weight: bold;
  font-size: 16px;
}

.info {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .page-header h1 {
    font-size: 24px;
  }

  .effect-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
</style>

