import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép truy cập qua mạng (IP/Ngrok)
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app' // Cho phép bất kỳ tên miền ngrok nào
    ],
    proxy: {
      // Tất cả các request bắt đầu bằng /api sẽ được chuyển đến backend
      '/api': {
        target: 'https://localhost:7220', // Backend local
        changeOrigin: true,
        secure: false, // Nếu dùng HTTPS tự ký thì cần false
      },
    },
  },
})
