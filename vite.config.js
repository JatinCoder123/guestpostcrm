import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "https://app.guestpostcrm.com",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://errika.guestpostcrm.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      },
      '/invoice-api': {
        target: 'https://errika.guestpostcrm.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/invoice-api/, ''),
        secure: false
      }
    }
  },
  build: {
    // Build optimization
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
});