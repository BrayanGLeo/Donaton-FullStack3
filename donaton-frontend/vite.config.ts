import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/donaciones': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
      },
      '/api/logistica': {
        target: 'http://127.0.0.1:8086',
        changeOrigin: true,
      },
      '/api/bff': {
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
      }
    }
  }
})