import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Migrated from Jekyll (tema jekyll-now). The old site used
// `permalink: /:title/`, so every URL ends in a slash.
//
// `trailingSlash: 'always'` + `build.format: 'directory'` reproduce that
// exactly: /sql-gym/, /full-privacy-policy-es/, /<slug>/ … Those paths are
// referenced from outside the repo (Play Console, the SQL Gym app itself and
// app-ads.txt), so they must not change. See docs/current-urls.txt.
export default defineConfig({
  site: 'https://mkfnx.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
