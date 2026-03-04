import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to the backend to avoid CORS during development.
    proxy: {
      // If you use /api prefix in the frontend, strip it and forward to backend root
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Direct paths used in the code
      '/orders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/reports': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/kanban': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/resources': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/warehouses': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/audit': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/status': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/alerts': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // socket.io websocket proxy
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
