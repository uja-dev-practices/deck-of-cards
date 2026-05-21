import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{js,jsx}'],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    watch: {
      ignored: [
        '**/Dockerfile',
        '**/.dockerignore',
        '**/docker-compose*.yml',
        '**/docker-compose*.yaml',
        '**/README.md',
      ],
    },
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://backend:8000',
        changeOrigin: true
      }
    }
  }
})
