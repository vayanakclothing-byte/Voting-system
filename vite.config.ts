import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.1%, Chrome >= 60, Safari >= 11, iOS >= 11, Edge >= 79'))
    }
  },
  build: {
    cssMinify: 'lightningcss'
  }
});
