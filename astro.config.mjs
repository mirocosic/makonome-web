import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://makonome.com',
  integrations: [
    mdx(),
    // sitemap-index.xml + sitemap-0.xml, linked from public/robots.txt. No 404 page in the sitemap.
    sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) }),
  ],
  build: {
    assets: 'assets'
  },
  markdown: {
    // Keep release-note text exactly as written (no curly quotes).
    smartypants: false
  }
});
