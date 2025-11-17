<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const view = urlParams.get('view')
  if (view === 'gallery' && route.path !== '/gallery') {
    router.replace({ path: '/gallery' })
  }
})

const hideNavPaths = ['/gallery', '/__github-config']
const showBottomNav = computed(() => !hideNavPaths.includes(route.path))
</script>

<template>
  <div class="app">
    <div class="app-content">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>

    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<style scoped>
:global(html, body, #app) {
  min-height: 100%;
}

:global(body) {
  margin: 0;
  font-family: 'SF Pro Display', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  background: linear-gradient(180deg, #fff5f7, #f4fbff);
  color: #0f172a;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7, #f4fbff);
}

.app-content {
  flex: 1 0 auto;
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
  background: transparent;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
