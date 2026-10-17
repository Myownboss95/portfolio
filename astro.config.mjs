// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://danielodiachi.work',

  // CSS goes straight into each page's HTML instead of a separate file, so a
  // page can never render unstyled because its stylesheet failed to load or
  // came from a stale cache.
  build: {
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
    // Same idea for page scripts: anything under 40 KB (all of ours) is
    // inlined, so pages like /start-a-project have no JS file to go missing.
    // Photos and images are larger and still ship as hashed files.
    build: { assetsInlineLimit: 40960 },
  },

  integrations: [mdx(), sitemap()]
});