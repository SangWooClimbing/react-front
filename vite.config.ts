import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: specify port
    open: true, // Optional: automatically open browser
    proxy: {
      // Requests to /api/* will be proxied to http://localhost:8080/api/*
      '/api': {
        target: 'http://localhost:8080', // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites and to change the origin of the host header to the target URL
        // secure: false, // Set to false if your backend is on HTTPS with a self-signed certificate (not applicable here)
        // rewrite: (path) => path.replace(/^\/api/, '') // Optional: if your backend doesn't expect /api prefix
                                                        // In your case, backend already uses /api, so no rewrite needed.
      }
    }
  }
})