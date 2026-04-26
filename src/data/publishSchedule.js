// Shared "is this page live yet?" gate for programmatic content (chords + keys).
//
// Each registry entry carries a `publishAt: 'YYYY-MM-DD'` UTC date instead of a
// hard `published: bool`. Pages go live automatically when today's UTC date
// reaches that string. A daily GitHub Actions cron triggers a Vercel rebuild
// (.github/workflows/daily-rebuild.yml) so the new pages actually appear on
// the live site without manual intervention.
//
// This staggers the rollout per seo-strategy.md ("Don't ship all 60+ pages on
// day one — Google's spam systems flag sudden mass content drops").

export const todayUtc = (now = new Date()) =>
  `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;

// Lexicographic compare works for ISO dates.
export const isLive = (publishAt, now = new Date()) => {
  if (!publishAt) return false;
  return publishAt <= todayUtc(now);
};

// Auto-schedule: yields a YYYY-MM-DD string `daysFromBase` after `baseIso`.
// Used to stamp publishAt dates onto slug arrays without typing every date.
export const dateOffset = (baseIso, daysFromBase) => {
  const [y, m, d] = baseIso.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d) + daysFromBase * 86400000;
  const dt = new Date(t);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
};

// Build a slug→publishAt map by handing the helper a base date and an ordered
// list of slugs. The first slug publishes on the base date, the next on +1 day,
// etc. Slugs that should publish "now or earlier" (already-shipped content)
// can be passed as a separate `liveNow` array.
export const scheduleSlugs = ({ baseDate, liveNow = [], queue = [] }) => {
  const map = {};
  for (const slug of liveNow) {
    map[slug] = '2020-01-01'; // any past date — already live
  }
  queue.forEach((slug, i) => {
    if (map[slug]) return; // already live, don't overwrite
    map[slug] = dateOffset(baseDate, i);
  });
  return map;
};
