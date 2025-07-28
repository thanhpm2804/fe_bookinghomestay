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
        target: 'https://localhost:7220', // Backend local HTTPS
        changeOrigin: true,
        secure: false, // Bỏ qua SSL verification cho development
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
