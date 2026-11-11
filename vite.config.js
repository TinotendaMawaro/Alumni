import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// The app is built as a single self-contained index.html with the JS and
// CSS inlined. This removes separate /assets/*.js requests entirely, so
// shared hosts (cPanel/Apache) can never serve the module bundle with the
// wrong MIME type — the usual cause of a blank page. Images in public/
// (logo, background, favicon) are still served as normal files.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: '/',
  build: {
    // Inline every asset we can; keep large images (>1MB) as external files.
    assetsInlineLimit: 1024 * 1024,
    cssCodeSplit: false,
  },
})
