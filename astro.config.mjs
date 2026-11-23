import { defineConfig } from 'astro/config';

// Static output: every page is pre-rendered, so the site needs no server.
export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'auto' },
});
