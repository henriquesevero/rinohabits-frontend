import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'RinoHabits',
        short_name: 'RinoHabits',
        description: 'Construa hábitos. Viva melhor. Sem desculpas.',
        theme_color: '#7c3aed',
        background_color: '#1e1b4b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Exclude html from precache — navigation requests must always be
        // network-first so the browser reads the latest meta tags (viewport-fit=cover)
        globPatterns: ['**/*.{js,css,svg,webp,jpg,png}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Navigation requests: NetworkFirst so iOS always reads fresh meta tags
            urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 5 },
            },
          },
          {
            urlPattern: /^https:\/\/www\.gravatar\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gravatar-cache',
              expiration: { maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
})
