import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.GITHUB_PAGES === 'true' ? '/lexia-legal-ai/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', '@radix-ui/react-popover'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        }
      }
    }
  }
})
