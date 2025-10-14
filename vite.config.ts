import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    
    // PWA Plugin pour offline support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo_ndjobi.png', 'robots.txt'],
      manifest: {
        name: 'Ndjobi - Plateforme Anti-Corruption',
        short_name: 'Ndjobi',
        description: 'Plateforme citoyenne sécurisée pour lutter contre la corruption et protéger vos innovations',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo_ndjobi.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_ndjobi.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.ndjobi\.ga\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "@supabase/supabase-js"],
    exclude: [],
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['lucide-react', 'date-fns'],
        },
      },
    },
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
  },
  
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}));
