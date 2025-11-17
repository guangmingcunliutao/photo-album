<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const loadedCount = ref(10)
const isLoading = ref(false)

const loadMore = () => {
  if (isLoading.value || loadedCount.value >= photoPaths.value.length) return

  isLoading.value = true
  setTimeout(() => {
    loadedCount.value = Math.min(loadedCount.value + 10, photoPaths.value.length)
    isLoading.value = false
  }, 300)
}

const scrollTarget = ref<HTMLElement | Window | null>(null)

const handleScroll = () => {
  const target = scrollTarget.value
  if (!target) return

  let scrollTop: number
  let visibleHeight: number
  let totalHeight: number

  if (target === window) {
    scrollTop = window.pageYOffset || document.documentElement.scrollTop
    visibleHeight = window.innerHeight
    totalHeight = document.documentElement.scrollHeight
  } else if (target instanceof HTMLElement) {
    scrollTop = target.scrollTop
    visibleHeight = target.clientHeight
    totalHeight = target.scrollHeight
  } else {
    return
  }

  if (totalHeight - scrollTop - visibleHeight < 120) {
    loadMore()
  }
}

onMounted(() => {
  const container = document.querySelector('.app-content')
  if (container instanceof HTMLElement) {
    scrollTarget.value = container
    container.addEventListener('scroll', handleScroll, { passive: true })
  } else {
    scrollTarget.value = window
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  const target = scrollTarget.value
  if (!target) return
  if (target === window) {
    window.removeEventListener('scroll', handleScroll)
  } else {
    target.removeEventListener('scroll', handleScroll)
  }
})

const visiblePhotos = computed(() => photoPaths.value.slice(0, loadedCount.value))
</script>

<template>
  <div class="gallery-view">
    <header class="gallery-header">
      <h1>📸 相册</h1>
    </header>

    <div class="gallery-grid">
      <div v-for="(url, index) in visiblePhotos" :key="url" class="gallery-item">
        <img :src="url" :alt="`Photo ${index + 1}`" loading="lazy" />
      </div>
    </div>

    <div v-if="isLoading" class="loading-more">
      <span>加载中...</span>
    </div>

    <div v-if="loadedCount >= photoPaths.length && photoPaths.length > 0" class="end-message">
      <span>已加载全部照片</span>
    </div>

    <div v-if="photoPaths.length === 0" class="empty-state">
      <p>暂时没有照片</p>
    </div>
  </div>
</template>

<style scoped>
.gallery-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7, #f4fbff);
  padding-bottom: 40px;
}

.gallery-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 20px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
  text-align: center;
}

.gallery-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.gallery-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.loading-more,
.end-message {
  text-align: center;
  padding: 24px;
  color: #64748b;
  font-size: 14px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #94a3b8;
  font-size: 16px;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 32px;
  }
}
</style>

