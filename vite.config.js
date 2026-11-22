import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// "base" must match your GitHub repository name for GitHub Pages.
// Example: https://username.github.io/tamheed/  ->  base: '/tamheed/'
export default defineConfig({
  plugins: [react()],
  base: '/tamheed/',
});
