<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserPhotos } from '@/composables/useUserPhotos'
import { useTransitionEffect } from '@/composables/useTransitionEffect'

const staticModules = import.meta.glob('@/assets/photos/**/*.{jpg,jpeg,png,gif,webp}', {
  eager: true,
})

const staticPhotoPaths = computed(() => {
  const paths: string[] = []
  for (const path in staticModules) {
    const module = staticModules[path] as { default?: string }
    if (module?.default) {
      paths.push(module.default)
    }
  }
  return paths.sort()
})

const { userPhotos, removePhotoByUrl } = useUserPhotos()

const photoItems = computed(() => {
  const userItems = userPhotos.value.map((url, index) => ({
    url,
    isUser: true,
    key: `user-${index}-${url}`,
  }))

  const staticItems = staticPhotoPaths.value.map((url) => ({
    url,
    isUser: false,
    key: `static-${url}`,
  }))

  return [...userItems, ...staticItems]
})

const photoPaths = computed(() => photoItems.value.map((item) => item.url))
const hasPhotos = computed(() => photoItems.value.length > 0)

const currentIndex = ref(-1)
const isViewerOpen = ref(false)
const isAutoPlay = ref(true)
const autoPlayDelay = 3500
let autoPlayTimer: number | null = null

const touchStartX = ref<number | null>(null)

const { currentEffect } = useTransitionEffect()
const showSettingsMenu = ref(false)

const openViewer = (index: number) => {
  currentIndex.value = index
  isViewerOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeViewer = () => {
  isViewerOpen.value = false
  document.body.style.overflow = ''
  currentIndex.value = -1
}

const prevPhoto = () => {
  if (!photoPaths.value.length) return
  currentIndex.value =
    (currentIndex.value - 1 + photoPaths.value.length) % photoPaths.value.length
}

const nextPhoto = () => {
  if (!photoPaths.value.length) return
  currentIndex.value = (currentIndex.value + 1) % photoPaths.value.length
}

const startAutoPlay = () => {
  if (!isViewerOpen.value || !isAutoPlay.value || photoPaths.value.length < 2 || autoPlayTimer) {
    return
  }
  autoPlayTimer = window.setInterval(() => {
    nextPhoto()
  }, autoPlayDelay)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

watch([isViewerOpen, isAutoPlay, () => photoPaths.value.length], () => {
  stopAutoPlay()
  if (isViewerOpen.value && isAutoPlay.value && photoPaths.value.length > 1) {
    startAutoPlay()
  }
})

const handleKeydown = (e: KeyboardEvent) => {
  if (!isViewerOpen.value) return
  if (e.key === 'ArrowLeft') prevPhoto()
  else if (e.key === 'ArrowRight') nextPhoto()
  else if (e.key === 'Escape') closeViewer()
}

const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX
}

const handleTouchEnd = (event: TouchEvent) => {
  if (touchStartX.value === null) return
  const delta = event.changedTouches[0].clientX - touchStartX.value
  if (Math.abs(delta) > 50) {
    delta > 0 ? prevPhoto() : nextPhoto()
  }
  touchStartX.value = null
}

const toggleSettingsMenu = () => {
  showSettingsMenu.value = !showSettingsMenu.value
}

const closeSettingsMenu = () => {
  showSettingsMenu.value = false
}

const effectOptions = [
  { value: 'fade' as const, label: '淡进淡出', icon: '✨' },
  { value: 'slide' as const, label: '滑动', icon: '➡️' },
  { value: 'zoom' as const, label: '缩放', icon: '🔍' },
  { value: 'rotate' as const, label: '旋转', icon: '🔄' },
  { value: 'flip' as const, label: '翻转', icon: '🔄' },
]

const { setEffect } = useTransitionEffect()

const selectEffect = (effect: typeof effectOptions[number]['value']) => {
  setEffect(effect)
  closeSettingsMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  if (showSettingsMenu.value) {
    const target = event.target as HTMLElement
    if (!target.closest('.settings-wrapper')) {
      closeSettingsMenu()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
  stopAutoPlay()
})

const isUserPhoto = (index: number) => photoItems.value[index]?.isUser === true

const handleRemoveUserPhoto = (url: string) => {
  if (!confirm('确定删除这张上传的照片吗？')) return
  removePhotoByUrl(url)
  if (isViewerOpen.value && currentIndex.value >= 0) {
    const currentUrl = photoPaths.value[currentIndex.value]
    if (currentUrl === url) {
      closeViewer()
    }
  }
}

watch(
  () => photoPaths.value.length,
  () => {
    if (!photoPaths.value.length) {
      closeViewer()
      return
    }
    if (currentIndex.value >= photoPaths.value.length) {
      currentIndex.value = photoPaths.value.length - 1
    }
  }
)
</script>

<template>
  <div class="photo-grid" :class="{ empty: !hasPhotos }">
    <transition-group name="grid" tag="div" class="photo-grid__inner">
      <div
        v-for="(item, index) in photoItems"
        :key="item.key"
        class="photo-item"
        @click="openViewer(index)"
      >
        <img :src="item.url" loading="lazy" decoding="async" />
        <button
          v-if="item.isUser"
          class="thumb-remove"
          @click.stop="handleRemoveUserPhoto(item.url)"
          aria-label="删除照片"
        >
          ×
        </button>
      </div>
    </transition-group>
    <p v-if="!hasPhotos" class="empty-state">暂时没有照片，快去上传吧～</p>
  </div>

  <Teleport to="body">
    <transition name="overlay">
      <div
        v-if="isViewerOpen"
        class="viewer-overlay"
        @click.self="closeViewer"
        @touchstart.passive="handleTouchStart"
        @touchend.passive="handleTouchEnd"
      >
        <button class="btn-close" @click="closeViewer" aria-label="关闭">×</button>
        <button v-if="photoPaths.length > 1" class="btn-nav btn-prev" @click.stop="prevPhoto">
          ‹
        </button>
        <button v-if="photoPaths.length > 1" class="btn-nav btn-next" @click.stop="nextPhoto">
          ›
        </button>

        <div class="toolbar">
          <div class="toolbar-group">
            <button class="toggle" @click="isAutoPlay = !isAutoPlay">
              <span v-if="isAutoPlay">⏸ 自动</span>
              <span v-else>▶️ 自动</span>
            </button>
            <div class="settings-wrapper">
              <button class="toggle settings-btn" @click.stop="toggleSettingsMenu">
                ⚙️ 特效
              </button>
              <transition name="menu">
                <div v-if="showSettingsMenu" class="settings-menu" @click.stop>
                  <div class="menu-header">切换特效</div>
                  <div class="menu-items">
                    <button
                      v-for="option in effectOptions"
                      :key="option.value"
                      class="menu-item"
                      :class="{ active: currentEffect === option.value }"
                      @click="selectEffect(option.value)"
                    >
                      <span class="menu-icon">{{ option.icon }}</span>
                      <span class="menu-label">{{ option.label }}</span>
                      <span v-if="currentEffect === option.value" class="menu-check">✓</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
            <button
              v-if="currentIndex >= 0 && isUserPhoto(currentIndex)"
              class="toggle danger"
              @click.stop="handleRemoveUserPhoto(photoPaths[currentIndex])"
            >
              删除
            </button>
          </div>
        </div>

        <transition :name="currentEffect" mode="out-in">
          <img
            v-if="currentIndex >= 0"
            :key="currentIndex"
            :src="photoPaths[currentIndex]"
            class="viewer-img"
          />
        </transition>

        <div class="indicator">{{ currentIndex + 1 }} / {{ photoPaths.length }}</div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.photo-grid {
  width: 100%;
}

.photo-grid.empty {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-grid__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: clamp(10px, 3vw, 18px);
}

.photo-item {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  cursor: zoom-in;
  aspect-ratio: 3 / 4;
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.15);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.photo-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.25));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.25);
}

.photo-item:hover::after {
  opacity: 1;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.75);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-item:hover .thumb-remove {
  opacity: 1;
}

.empty-state {
  color: #94a3b8;
  font-size: 15px;
}

.viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 11, 31, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
  padding: clamp(20px, 5vw, 60px);
}

.viewer-img {
  max-height: 75vh;
  max-width: 92vw;
  border-radius: 24px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.4);
  object-fit: contain;
}

.btn-close {
  position: absolute;
  top: clamp(12px, 4vw, 32px);
  right: clamp(12px, 4vw, 32px);
  border: none;
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: white;
  font-size: 22px;
  cursor: pointer;
}

.btn-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(255, 255, 255, 0.15);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  color: white;
  font-size: 30px;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.btn-prev {
  left: clamp(12px, 6vw, 80px);
}

.btn-next {
  right: clamp(12px, 6vw, 80px);
}

.indicator {
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.toolbar {
  position: absolute;
  bottom: clamp(12px, 5vw, 40px);
  right: clamp(12px, 5vw, 40px);
  display: flex;
  gap: 10px;
}

.toolbar-group {
  display: flex;
  gap: 10px;
  position: relative;
}

.toggle {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(6px);
}

.toggle:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.toggle.danger {
  background: rgba(239, 68, 68, 0.25);
}

.toggle.danger:hover {
  background: rgba(239, 68, 68, 0.35);
}

.settings-wrapper {
  position: relative;
}

.settings-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
}

.menu-header {
  padding: 8px 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
  text-align: left;
  width: 100%;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: rgba(255, 126, 179, 0.2);
  color: #ff7eb3;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-label {
  flex: 1;
}

.menu-check {
  color: #ff7eb3;
  font-weight: bold;
}

@media (max-width: 640px) {
  .photo-grid__inner {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .photo-item {
    border-radius: 16px;
    aspect-ratio: 2 / 3;
  }

  .viewer-img {
    max-height: 70vh;
  }

  .btn-nav {
    width: 40px;
    height: 40px;
  }
}

/* 淡进淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* 滑动 */
.slide-enter-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
}

.slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* 缩放 */
.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* 旋转 */
.rotate-enter-active,
.rotate-leave-active {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.8);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.8);
}

/* 翻转 */
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}

.flip-enter-from {
  opacity: 0;
  transform: rotateY(-90deg) scale(0.9);
}

.flip-leave-to {
  opacity: 0;
  transform: rotateY(90deg) scale(0.9);
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.35s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* 菜单过渡动画 */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
</style>