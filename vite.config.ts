import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Only enable image optimization for production builds
    command === 'build' && ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|webp|svg)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false,
              },
            },
          },
        ],
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      three: path.resolve(__dirname, 'node_modules/three'),
    },
    dedupe: ['three'],
  },
  optimizeDeps: {
    include: ['kosher-zmanim']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          gsap: ['gsap'],
          framer: ['framer-motion'],
          utils: ['easing-utils', 'webfontloader', 'typed.js'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    // Only enable minification for production
    minify: command === 'build' ? 'terser' : false,
    terserOptions: command === 'build' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } : undefined,
  },
  preview: {
    port: 4173,
    host: true,
  },
  server: {
    port: 3000,
    host: true,
  },
}));