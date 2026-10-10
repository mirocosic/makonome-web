import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://makonome.com',
  build: {
    assets: 'assets'
  },
  markdown: {
    // Keep release-note text exactly as written (no curly quotes).
    smartypants: false
  }
});
