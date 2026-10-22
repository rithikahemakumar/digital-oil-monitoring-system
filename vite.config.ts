import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

const esToolkitCompatDir = fileURLToPath(new URL('./node_modules/es-toolkit/compat', import.meta.url)).replace(/\\/g, '/');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'OilWise — Smart Oil Use',
        short_name: 'OilWise',
        description: 'Track daily oil intake and build healthier cooking habits.',
        theme_color: '#16a34a',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/dashboard',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: /^es-toolkit\/compat\/(.*)$/, replacement: `${esToolkitCompatDir}/$1.mjs` },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
});
