import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Tất cả request bắt đầu bằng /api sẽ được chuyển tiếp sang backend
      '/api': {
        target: 'https://localhost:7220',
        changeOrigin: true,
        secure: false, // Nếu backend dùng HTTPS tự ký
      },
    },
  },
});
