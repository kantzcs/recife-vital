import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // A pessoa decide quando atualizar (aparece o aviso "Nova versão disponível").
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Recife Vital',
        short_name: 'Recife Vital',
        description: 'Acompanhe pressão, glicemia e seus atendimentos do HIPERDIA nas UPAs do Recife.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f7f9f6',
        theme_color: '#126457',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Guarda só a "casca" do app (HTML, JS, CSS, ícones).
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['google*.html'],
        // Páginas estáticas e o arquivo do Google abrem direto do servidor.
        navigateFallbackDenylist: [/^\/privacidade/, /^\/termos/, /^\/google[0-9a-f]+\.html$/],
        cleanupOutdatedCaches: true,
        // Nada do Supabase (login, agenda, perfil, pontos) é guardado no aparelho:
        // só as fontes do Google entram em cache.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
