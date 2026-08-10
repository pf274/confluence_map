import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://pf274.github.io/confluence_map/, so assets need
  // that path prefix in production; keep dev server at the root.
  base: command === 'build' ? '/confluence_map/' : '/',
  plugins: [vue()],
}))
