const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: 'frontend',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});