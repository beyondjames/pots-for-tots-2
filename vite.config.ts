import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        'affinity-customisations': 'src/affinity-customisations/main.tsx',
      },
      output: {
        dir: 'assets',
        assetFileNames: 'vite-[name].[ext]',
        entryFileNames: 'vite-[name].js',
        chunkFileNames: 'vite-[name].js',
      },
    },
    watch: {},
    emptyOutDir: false,
  },
});
