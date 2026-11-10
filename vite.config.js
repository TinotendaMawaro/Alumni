import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' assumes the app is served from the domain root (public_html),
// which is the case on both Vercel and cPanel root hosting.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
