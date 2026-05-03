// Post-build: generate sitemap.xml and robots.txt from the published-content
// registry. Runs after vite-react-ssg build, so dist/ already has the static
// HTML files for each route.
//
// Sitemap covers:
//   - The home + trainer routes (always live)
//   - Every chord/key reference page whose `publishAt` UTC date is today or
//     earlier (matching what App.jsx routes will have rendered)
//
// We avoid importing the content modules directly because they pull in
// triads.js, which uses extensionless relative imports that Node ESM
// rejects. Instead we scrape `'slug': { publishAt: 'YYYY-MM-DD' }` pairs
// out of source. Cheap and keeps Node loader-config-free.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');

const today = new Date().toISOString().slice(0, 10);

// Pull every `'slug': { publishAt: 'YYYY-MM-DD' }` pair (multiline tolerant).
const scrapeLiveSlugs = (path) => {
  const src = readFileSync(resolve(__dirname, '..', path), 'utf8');
  const re = /'([a-z][a-z0-9-]*)':\s*\{\s*publishAt:\s*'(\d{4}-\d{2}-\d{2})'/g;
  const live = [];
  for (const m of src.matchAll(re)) {
    if (m[2] <= today) live.push(m[1]);
  }
  return live;
};

const liveChords = scrapeLiveSlugs('src/data/chordContent.js');
const liveKeys = scrapeLiveSlugs('src/data/keyContent.js');
const liveScales = scrapeLiveSlugs('src/data/scaleContent.js');
const liveLearn = scrapeLiveSlugs('src/data/learnContent.js');

const SITE = 'https://theory-trainer.com';

const STATIC_ROUTES = [
  { path: '/',                 priority: '1.0', changefreq: 'weekly' },
  { path: '/triads',           priority: '0.9', changefreq: 'monthly' },
  { path: '/circle-of-fifths', priority: '0.9', changefreq: 'monthly' },
  { path: '/intervals',        priority: '0.9', changefreq: 'monthly' },
  { path: '/notes',            priority: '0.9', changefreq: 'monthly' },
  { path: '/daily',            priority: '0.9', changefreq: 'daily' },
  { path: '/about',            priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy',          priority: '0.3', changefreq: 'yearly' },
  // Library index pages — list every published reference page in their tree.
  // Higher priority than individual library entries because they're the hub
  // pages that pass link equity into the references.
  { path: '/chords',           priority: '0.85', changefreq: 'weekly' },
  { path: '/keys',             priority: '0.85', changefreq: 'weekly' },
  { path: '/scales',           priority: '0.85', changefreq: 'weekly' },
  { path: '/learn',            priority: '0.85', changefreq: 'weekly' },
];

const urls = [
  ...STATIC_ROUTES,
  ...liveLearn.map((slug) => ({
    path: `/learn/${slug}`,
    priority: '0.85',
    changefreq: 'monthly',
  })),
  ...liveKeys.map((slug) => ({
    path: `/keys/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  ...liveScales.map((slug) => ({
    path: `/scales/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  ...liveChords.map((slug) => ({
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

console.log(`[post-build] wrote sitemap.xml (${urls.length} urls — ${liveLearn.length} guides, ${liveKeys.length} keys, ${liveScales.length} scales, ${liveChords.length} chords) + robots.txt`);
