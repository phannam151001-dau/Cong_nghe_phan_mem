import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ttsan.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/auth_status.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/login.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/register.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/logout.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/datsan.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/lichdat.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/thanhtoan.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/addsan.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/dongmosan.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/admin.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/vaitro.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      },
      '/dichvu.php': {
        target: 'http://localhost/SanCoproDaNang',
        changeOrigin: true
      }
    }
  }
})
