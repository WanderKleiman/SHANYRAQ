import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Оптимизация сборки
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в проде
        drop_debugger: true
      }
    },
    // Chunk size warning
    chunkSizeWarningLimit: 1000
  }
});
