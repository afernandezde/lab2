import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allow overriding backend target via env: VITE_API_TARGET=http://localhost:8080
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:8080';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls during dev so fetch('/api/...') hits Spring Boot on 8080
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
      // Proxy media assets so <video src="/media/..."> resolves to backend's static handler
      '/media': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
