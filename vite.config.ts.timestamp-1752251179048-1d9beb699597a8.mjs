// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { ViteImageOptimizer } from "file:///home/project/node_modules/vite-plugin-image-optimizer/dist/index.mjs";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Only enable image optimization for production builds
    command === "build" && ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|webp|svg)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false
              }
            }
          }
        ]
      },
      png: {
        quality: 80
      },
      jpeg: {
        quality: 80
      },
      jpg: {
        quality: 80
      },
      webp: {
        lossless: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      three: path.resolve(__vite_injected_original_dirname, "node_modules/three")
    },
    dedupe: ["three"]
  },
  optimizeDeps: {
    include: ["kosher-zmanim"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          three: ["three"],
          gsap: ["gsap"],
          framer: ["framer-motion"],
          utils: ["easing-utils", "webfontloader", "typed.js"],
          supabase: ["@supabase/supabase-js"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    cssCodeSplit: true,
    // Only enable minification for production
    minify: command === "build" ? "terser" : false,
    terserOptions: command === "build" ? {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    } : void 0
  },
  preview: {
    port: 4173,
    host: true
  },
  server: {
    port: 3e3,
    host: true
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFZpdGVJbWFnZU9wdGltaXplciB9IGZyb20gJ3ZpdGUtcGx1Z2luLWltYWdlLW9wdGltaXplcic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kIH0pID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIC8vIE9ubHkgZW5hYmxlIGltYWdlIG9wdGltaXphdGlvbiBmb3IgcHJvZHVjdGlvbiBidWlsZHNcbiAgICBjb21tYW5kID09PSAnYnVpbGQnICYmIFZpdGVJbWFnZU9wdGltaXplcih7XG4gICAgICB0ZXN0OiAvXFwuKGpwZT9nfHBuZ3xnaWZ8d2VicHxzdmcpJC9pLFxuICAgICAgaW5jbHVkZVB1YmxpYzogdHJ1ZSxcbiAgICAgIGxvZ1N0YXRzOiB0cnVlLFxuICAgICAgYW5zaUNvbG9yczogdHJ1ZSxcbiAgICAgIHN2Zzoge1xuICAgICAgICBtdWx0aXBhc3M6IHRydWUsXG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAncHJlc2V0LWRlZmF1bHQnLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgIG92ZXJyaWRlczoge1xuICAgICAgICAgICAgICAgIGNsZWFudXBOdW1lcmljVmFsdWVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZW1vdmVWaWV3Qm94OiBmYWxzZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBwbmc6IHtcbiAgICAgICAgcXVhbGl0eTogODAsXG4gICAgICB9LFxuICAgICAganBlZzoge1xuICAgICAgICBxdWFsaXR5OiA4MCxcbiAgICAgIH0sXG4gICAgICBqcGc6IHtcbiAgICAgICAgcXVhbGl0eTogODAsXG4gICAgICB9LFxuICAgICAgd2VicDoge1xuICAgICAgICBsb3NzbGVzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIHRocmVlOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL3RocmVlJyksXG4gICAgfSxcbiAgICBkZWR1cGU6IFsndGhyZWUnXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydrb3NoZXItem1hbmltJ11cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIHRocmVlOiBbJ3RocmVlJ10sXG4gICAgICAgICAgZ3NhcDogWydnc2FwJ10sXG4gICAgICAgICAgZnJhbWVyOiBbJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICAgICAgICB1dGlsczogWydlYXNpbmctdXRpbHMnLCAnd2ViZm9udGxvYWRlcicsICd0eXBlZC5qcyddLFxuICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgLy8gT25seSBlbmFibGUgbWluaWZpY2F0aW9uIGZvciBwcm9kdWN0aW9uXG4gICAgbWluaWZ5OiBjb21tYW5kID09PSAnYnVpbGQnID8gJ3RlcnNlcicgOiBmYWxzZSxcbiAgICB0ZXJzZXJPcHRpb25zOiBjb21tYW5kID09PSAnYnVpbGQnID8ge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgfSxcbiAgICB9IDogdW5kZWZpbmVkLFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNDE3MyxcbiAgICBob3N0OiB0cnVlLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIGhvc3Q6IHRydWUsXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsMEJBQTBCO0FBSG5DLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsRUFDNUMsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsSUFFTixZQUFZLFdBQVcsbUJBQW1CO0FBQUEsTUFDeEMsTUFBTTtBQUFBLE1BQ04sZUFBZTtBQUFBLE1BQ2YsVUFBVTtBQUFBLE1BQ1YsWUFBWTtBQUFBLE1BQ1osS0FBSztBQUFBLFFBQ0gsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFVBQ1A7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFFBQVE7QUFBQSxjQUNOLFdBQVc7QUFBQSxnQkFDVCxzQkFBc0I7QUFBQSxnQkFDdEIsZUFBZTtBQUFBLGNBQ2pCO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFDSCxTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsTUFBTTtBQUFBLFFBQ0osVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsT0FBTyxLQUFLLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsSUFDckQ7QUFBQSxJQUNBLFFBQVEsQ0FBQyxPQUFPO0FBQUEsRUFDbEI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxlQUFlO0FBQUEsRUFDM0I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM3QixPQUFPLENBQUMsT0FBTztBQUFBLFVBQ2YsTUFBTSxDQUFDLE1BQU07QUFBQSxVQUNiLFFBQVEsQ0FBQyxlQUFlO0FBQUEsVUFDeEIsT0FBTyxDQUFDLGdCQUFnQixpQkFBaUIsVUFBVTtBQUFBLFVBQ25ELFVBQVUsQ0FBQyx1QkFBdUI7QUFBQSxRQUNwQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxJQUN2QixjQUFjO0FBQUE7QUFBQSxJQUVkLFFBQVEsWUFBWSxVQUFVLFdBQVc7QUFBQSxJQUN6QyxlQUFlLFlBQVksVUFBVTtBQUFBLE1BQ25DLFVBQVU7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0YsSUFBSTtBQUFBLEVBQ047QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
