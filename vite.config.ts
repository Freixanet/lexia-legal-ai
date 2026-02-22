import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.GITHUB_PAGES === 'true' ? '/lexia-legal-ai/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    hmr: false, // Evita error RefreshRuntime.getRefreshReg (el plugin react desactiva Fast Refresh cuando hmr es false)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
            if (id.includes('react/') && !id.includes('react-dom')) return 'vendor-react'
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('rehype')) return 'vendor-markdown'
            if (id.includes('idb-keyval') || id.includes('@microsoft/fetch-event-source')) return 'vendor-storage'
            if (id.includes('sonner')) return 'vendor-toast'
            if (id.includes('zustand')) return 'vendor-store'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  }
})
