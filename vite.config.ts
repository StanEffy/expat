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
  server: {
    port: 3000,
    allowedHosts: ['localhost', '127.0.0.1', '57ee-YOUR_SERVER_IP.ngrok-free.app'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public',
})
