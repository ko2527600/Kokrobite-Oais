import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.png",
          "icons/*.png",
        ],
        manifest: false,
        workbox: {
          globPatterns: [
            "**/*.{js,css,html,png,svg,ico}"
          ],
          skipWaiting: true,
          clientsClaim: true,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [
            /^\/api/,
            /^\/uploads/
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  }
})
