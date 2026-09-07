import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import zlib from 'zlib'

function compressionPlugin(): Plugin {
  return {
    name: 'vite-plugin-compression',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;

      const compressFile = (filePath: string) => {
        const ext = path.extname(filePath).toLowerCase();
        if (!['.js', '.css', '.html', '.svg', '.json'].includes(ext)) return;

        const content = fs.readFileSync(filePath);
        if (content.length < 1024) return; // Skip files smaller than 1KB

        // Pre-generate .gz with maximum compression
        const gzipped = zlib.gzipSync(content, { level: 9 });
        fs.writeFileSync(`${filePath}.gz`, gzipped);

        // Pre-generate .br with maximum compression
        const brotlied = zlib.brotliCompressSync(content, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        });
        fs.writeFileSync(`${filePath}.br`, brotlied);
      };

      const walkDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile()) {
            compressFile(fullPath);
          }
        }
      };

      walkDir(distDir);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), compressionPlugin()],
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
    allowedHosts: ['localhost', '127.0.0.1', 'x-pat.duckdns.org'],
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
            if (id.includes('react-router')) {
              return 'vendor_react-router';
            }
            if (
              id.includes('/react/') ||
              id.includes('\\react\\') ||
              id.includes('/react-dom/') ||
              id.includes('\\react-dom\\') ||
              id.includes('scheduler') ||
              id.includes('i18next') ||
              id.includes('react-i18next')
            ) {
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
