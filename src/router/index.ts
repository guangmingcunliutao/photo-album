import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from 'virtual:generated-pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/album' },
    ...generatedRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/album',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

