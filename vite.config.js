import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, '')
      },
      '/ttsan.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/auth_status.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/login.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/register.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/logout.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/datsan.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/lichdat.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/thanhtoan.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/addsan.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/dongmosan.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/admin.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/vaitro.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/dichvu.php': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
