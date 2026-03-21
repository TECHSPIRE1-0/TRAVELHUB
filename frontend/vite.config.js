import { defineConfig } from 'vite';

// SPA fallback plugin — serves index.html for non-API, non-file routes
// Runs as a return middleware (after proxies have had a chance to handle)
function spaFallback() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Use 'return' function so this middleware runs AFTER Vite internals
      return () => {
        server.middlewares.use((req, res, next) => {
          // Skip if it has a file extension (static asset)
          if (/\.\w+(\?.*)?$/.test(req.url)) return next();
          // Skip if it's the root
          if (req.url === '/' || req.url === '') return next();
          // Skip Vite internal paths
          if (req.url.startsWith('/@') || req.url.startsWith('/src/') ||
              req.url.startsWith('/node_modules/') || req.url.startsWith('/images/')) return next();

          // Rewrite to index.html for SPA client-side routing
          req.url = '/index.html';
          next();
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [spaFallback()],
  server: {
    port: 5173,
    proxy: {
      '/auth/': { target: 'http://localhost:8000', changeOrigin: true },
      '/agency/': { target: 'http://localhost:8000', changeOrigin: true },
      '/packages/': { target: 'http://localhost:8000', changeOrigin: true },
      '/booking/': { target: 'http://localhost:8000', changeOrigin: true },
      '/enquiry/': { target: 'http://localhost:8000', changeOrigin: true },
      '/user/': { target: 'http://localhost:8000', changeOrigin: true },
      '/ai/': { target: 'http://localhost:8000', changeOrigin: true },
      '/dna/': { target: 'http://localhost:8000', changeOrigin: true },
      '/trip/': { target: 'http://localhost:8000', changeOrigin: true },
      '/itinerary/': { target: 'http://localhost:8000', changeOrigin: true },
      '/matchmaking/': { target: 'http://localhost:8000', changeOrigin: true },
      '/gamified/': { target: 'http://localhost:8000', changeOrigin: true },
      '/negotiate/': { target: 'http://localhost:8000', changeOrigin: true },
      '/marketing/': { target: 'http://localhost:8000', changeOrigin: true },
      '/vision/': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
