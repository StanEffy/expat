import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
  server: {
    port: 3000,
    allowedHosts: ['localhost', '127.0.0.1', 'x-pat.duckdns.org', '57ee-YOUR_SERVER_IP.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Reduce HMR spam and improve stability
    hmr: {
      overlay: true,
    },
  },
  // Cache configuration
  cacheDir: 'node_modules/.vite',
  optimizeDeps: {
    // Force re-optimization if needed (set to false to disable caching)
    force: false,
    // Reduce cache-related issues
    holdUntilCrawlEnd: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public',
})
