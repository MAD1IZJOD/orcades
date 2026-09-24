import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // three.js is ~540 kB raw / ~135 kB gzip, but it's lazy-loaded after first paint
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // keep three.js in its own chunk so the first paint never waits on it
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
})
