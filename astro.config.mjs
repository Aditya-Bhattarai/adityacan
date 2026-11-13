// Main website settings. You rarely need to change this file.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adityacan.com',
  trailingSlash: 'never',
  // Old addresses that now live somewhere else. (Cloudflare also redirects these from public/_redirects.)
  redirects: {
    '/services': '/me#work',
    '/film': '/films',
    '/strategy-content': '/for-creators',
    '/trekking-guide': '/near-mountains',
    '/mountains': '/near-mountains',
    '/teaching': '/classes',
    '/about': '/me',
    '/work': '/everything',
  },
  build: {
    format: 'file', // Clean addresses like /work instead of /work/
    inlineStylesheets: 'always', // Puts the styles inside each page so it opens faster
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // Keeps image compression fast enough for Cloudflare's build limit.
        avif: { effort: 2, quality: 55 },
        webp: { effort: 4, quality: 76 },
      },
    },
  },
  integrations: [sitemap()],
});
