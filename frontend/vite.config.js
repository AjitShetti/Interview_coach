import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/interviews': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
