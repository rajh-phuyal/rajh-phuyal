import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base so it works when served from /docs on GitHub Pages
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
})
