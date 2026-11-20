import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Sends /api requests to the backend during development (no CORS setup needed).
    proxy: { '/api': 'http://localhost:4000' },
  },
})
