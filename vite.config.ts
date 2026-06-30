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
      includeAssets: ['favicon.svg'],
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
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webp,jpg,png}'],
        runtimeCaching: [
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
