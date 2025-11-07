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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primereact') || id.includes('primeicons')) {
              return 'vendor_primereact';
            }
            if (id.includes('react-router')) {
              return 'vendor_react-router';
            }
            if (id.includes('react-i18next') || id.includes('i18next')) {
              return 'vendor_i18n';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor_react';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  publicDir: 'public',
})
