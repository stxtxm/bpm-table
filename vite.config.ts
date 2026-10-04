import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.BASE_PATH ?? '/bpm-table/';

export default defineConfig({
  base,
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
      sass: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
});
