<script setup lang="ts">
import { navConfig } from '@/config/navConfig'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const handleNavigate = (path: string) => {
  if (route.path === path) return
  router.push(path)
}

const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navConfig"
      :key="item.id"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="handleNavigate(item.path)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(15, 23, 42, 0.1);
  padding: 8px 16px calc(10px + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.08);
  -webkit-tap-highlight-color: transparent;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  flex: 1;
  max-width: 120px;
  touch-action: manipulation;
}

.nav-item:active {
  transform: translateY(1px);
}

.nav-icon {
  font-size: 24px;
  transition: transform 0.2s ease;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item.active {
  color: #ff7eb3;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-item.active .nav-label {
  font-weight: 600;
}
</style>

