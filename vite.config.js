import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Configure CORS for the development server
    cors: {
      // Allow all origins
      origin: '*',
      // Or specify allowed origins
      // origin: ['http://localhost:3333'],
      
      // Allow credentials (cookies, authorization headers)
      credentials: true,
      
      // Configure which headers can be used
      allowedHeaders: ['Content-Type', 'Authorization'],
      
      // Configure which HTTP methods are allowed
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    
    // Optional: Set up a proxy for specific paths
    proxy: {
      '/awi-projects': {
        target: 'http://localhost:3333/projects', // Replace with your AWI server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/awi-projects/, '')
      },
    }
  }
});