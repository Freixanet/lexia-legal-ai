import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use /lexia-legal-ai/ base for GitHub Pages, '/' for Vercel/local
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
})
