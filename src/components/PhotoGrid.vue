<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserPhotos } from '@/composables/useUserPhotos'

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

const { userPhotos } = useUserPhotos()

const photoPaths = computed(() => [...userPhotos.value, ...staticPhotoPaths.value])
const hasPhotos = computed(() => photoPaths.value.length > 0)

const currentIndex = ref(-1)
const isViewerOpen = ref(false)
const isAutoPlay = ref(true)
const autoPlayDelay = 3500
let autoPlayTimer: number | null = null

const touchStartX = ref<number | null>(null)

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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopAutoPlay()
})
</script>

<template>
  <div class="photo-grid" :class="{ empty: !hasPhotos }">
    <transition-group name="grid" tag="div" class="photo-grid__inner">
      <div
        v-for="(url, index) in photoPaths"
        :key="url"
        class="photo-item"
        @click="openViewer(index)"
      >
        <img :src="url" loading="lazy" decoding="async" />
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
          <button class="toggle" @click="isAutoPlay = !isAutoPlay">
            <span v-if="isAutoPlay">⏸ 自动</span>
            <span v-else>▶️ 自动</span>
          </button>
        </div>

        <transition name="fade" mode="out-in">
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

.toggle {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
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
</style>