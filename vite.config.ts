import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs'
import { build } from 'vite'

function extensionPlugin() {
  return {
    name: 'extension-assets',
    async closeBundle() {
      copyFileSync('manifest.json', 'dist/manifest.json')
      mkdirSync('dist/icons', { recursive: true })
      for (const s of ['16', '48', '128'])
        copyFileSync(`public/icons/icon${s}.png`, `dist/icons/icon${s}.png`)

      // Build background + content as fully inlined IIFE bundles
      for (const entry of ['background', 'content']) {
        await build({
          configFile: false,
          logLevel: 'silent',
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, `src/${entry}/index.ts`),
              formats: ['iife'],
              name: '_',
              fileName: () => `${entry}.js`,
            },
            rollupOptions: {
              output: { inlineDynamicImports: true },
            },
          },
        })
      }

      // Build popup + dashboard as fully inlined IIFE bundles
      for (const entry of ['popup', 'dashboard']) {
        await build({
          configFile: false,
          logLevel: 'silent',
          define: { 'process.env.NODE_ENV': '"production"' },
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, `src/${entry}/${entry}.tsx`),
              formats: ['iife'],
              name: '_',
              fileName: () => `assets/${entry}.js`,
            },
            rollupOptions: {
              output: { inlineDynamicImports: true },
            },
          },
        })
      }

      // Clean up leftover ESM chunks from the initial Vite build
      // The IIFE bundles are self-contained, so we don't need split chunks
      const assetsDir = resolve(__dirname, 'dist/assets')
      // Ensure assets dir exists (may already exist from main build)
      mkdirSync(assetsDir, { recursive: true })
      for (const f of readdirSync(assetsDir)) {
        if (f !== 'popup.js' && f !== 'dashboard.js') {
          unlinkSync(resolve(assetsDir, f))
        }
      }

      // Rewrite popup.html and dashboard.html to use IIFE scripts
      for (const page of ['popup', 'dashboard']) {
        const htmlPath = resolve(__dirname, `dist/${page}.html`)
        let html = readFileSync(htmlPath, 'utf8')

        // Remove ESM artifacts
        html = html.replace(/<link\s+rel="modulepreload"[^>]*>/g, '')
        html = html.replace(/<script\s+type="module"[^>]*><\/script>/g, '')
        // Remove leftover asset chunks from the initial Vite build
        html = html.replace(/<link[^>]*href="\.\/assets\/[^"]*"[^>]*>/g, '')

        // Insert the IIFE script
        html = html.replace('</body>', `<script src="./assets/${page}.js"></script>\n</body>`)

        writeFileSync(htmlPath, html)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), extensionPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
})
