import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    Pages({
      dirs: [{ dir: 'src/pages', baseRoute: '' }],
      extensions: ['vue'],
      importMode: 'async',
    }),
  ],
  base: '/photo-album/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
