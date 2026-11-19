import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Roofline Estimator',
        short_name: 'Roofline',
        description: 'Roof measurement, material planning, and project estimating for roofing crews.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f4f7f8',
        theme_color: '#0d1b2a',
        orientation: 'any',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ]
});
