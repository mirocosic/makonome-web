import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://makonome.com',
  integrations: [mdx()],
  build: {
    assets: 'assets'
  },
  markdown: {
    // Keep release-note text exactly as written (no curly quotes).
    smartypants: false
  }
});
