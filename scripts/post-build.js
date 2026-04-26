// Post-build: generate sitemap.xml and robots.txt from the published-content
// registry. Runs after vite-react-ssg build, so dist/ already has the static
// HTML files for each route.
//
// Sitemap covers:
//   - The home + trainer routes (always live)
//   - Every published chord/key reference page
//
// Stub slugs (registered but `published: false`) are intentionally NOT in the
// sitemap — they don't have a route yet. Phase rollout per seo-strategy.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Avoid importing chordContent.js directly — it imports triads.js, which uses
// extensionless relative imports that Node ESM rejects. Instead, scrape the
// published-slug list out of chordContent.js source. Cheap and keeps Node
// loader-config-free.
const __dirname = dirname(fileURLToPath(import.meta.url));
const contentSrc = readFileSync(
  resolve(__dirname, '..', 'src/data/chordContent.js'),
  'utf8',
);
const PUBLISHED_CHORD_SLUGS = [...contentSrc.matchAll(/'([a-z-]+)':\s*\{\s*published:\s*true/g)]
  .map((m) => m[1]);

const distDir = resolve(__dirname, '..', 'dist');

const SITE = 'https://triadtrainer.org';

const STATIC_ROUTES = [
  { path: '/',                 priority: '1.0', changefreq: 'weekly' },
  { path: '/triads',           priority: '0.9', changefreq: 'monthly' },
  { path: '/circle-of-fifths', priority: '0.9', changefreq: 'monthly' },
  { path: '/intervals',        priority: '0.9', changefreq: 'monthly' },
  { path: '/daily',            priority: '0.9', changefreq: 'daily' },
];

const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...STATIC_ROUTES,
  ...PUBLISHED_CHORD_SLUGS.map((slug) => ({
    path: `/chords/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap);
writeFileSync(resolve(distDir, 'robots.txt'), robots);

console.log(`[post-build] wrote sitemap.xml (${urls.length} urls) + robots.txt`);
