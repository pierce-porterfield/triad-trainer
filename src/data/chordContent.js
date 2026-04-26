// Programmatic chord-page content registry.
//
// Each entry maps a URL slug ("c-major", "a-flat-minor") to the data needed to
// render its canonical reference page. Pages are built one at a time per the
// SEO strategy doc — only entries with `published: true` get a route + sitemap
// inclusion. The rest are stubs so we can roll them out gradually.

import { buildChord, QUALITIES } from './triads.js';

// Convert a root + quality slug ("c-major", "a-flat-minor") to a chord descriptor.
// Returns { root, qualityKey, chordName } or null.
export const slugToChord = (slug) => {
  const m = slug.match(/^([a-g])(?:-(sharp|flat))?-(major|minor|diminished|augmented)$/);
  if (!m) return null;
  const [, letter, accidental, quality] = m;
  const root = letter.toUpperCase()
    + (accidental === 'sharp' ? '#' : accidental === 'flat' ? 'b' : '');
  const qualityKey = { major: 'maj', minor: 'min', diminished: 'dim', augmented: 'aug' }[quality];
  const q = QUALITIES[qualityKey];
  return {
    root,
    qualityKey,
    quality,
    qualityLabel: q.label,
    chordName: `${root}${q.symbol}`,
    displayName: `${root} ${quality}`,
  };
};

// All 48 base-triad slugs (4 qualities × 12 roots, including enharmonic spellings
// where they're commonly searched). These are the targets — we publish them one
// by one as canonical content is written.
export const ALL_CHORD_SLUGS = (() => {
  const roots = [
    'c', 'c-sharp', 'd-flat', 'd', 'd-sharp', 'e-flat',
    'e', 'f', 'f-sharp', 'g-flat', 'g', 'g-sharp',
    'a-flat', 'a', 'a-sharp', 'b-flat', 'b',
  ];
  const qualities = ['major', 'minor', 'diminished', 'augmented'];
  const slugs = [];
  roots.forEach((r) => qualities.forEach((q) => slugs.push(`${r}-${q}`)));
  return slugs;
})();

// Hand-written content per slug. Add a key here + flip `published: true` to ship it.
// The Phase 1 canonical template is `c-major`. Everything else is a stub for now.
const CONTENT = {
  'c-major': {
    published: true,
    intro:
      'C major is the simplest triad in Western music — three white keys, no sharps, no flats. It\'s the chord most students learn first, and it sits at the centre of the circle of fifths as the only major key with a key signature of zero accidentals. Built by stacking thirds on the root, C major is C, E, and G.',
    intervals: [
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'G', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of C major', slug: 'c-major', kind: 'key' },
      { label: 'Relative minor: A minor', slug: 'a-minor', kind: 'chord' },
      { label: 'Parallel minor: C minor', slug: 'c-minor', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'f-major', 'a-minor', 'c-minor'],
    commonMistakes:
      'Beginners sometimes confuse C major with the C-shape barre chord on guitar (which is the same chord voiced differently) or assume the chord must always start on middle C. Pitch class is what matters: any C, any E, and any G — in any octave or order — voice a C major triad. The other trap is spelling: when writing C major in a flat key context (like as the V chord of F major), don\'t respell E as Fb or G as Abb. Stacked thirds dictate C–E–G; that\'s the only correct spelling.',
    inProgressions:
      'C major shows up as the I chord in C major, the IV chord in G major, the V chord in F major, and the bVII chord in D minor. The most common progression you\'ll meet it in is I–V–vi–IV (C–G–Am–F) — the so-called "four chords of pop."',
    faq: [
      {
        q: 'What notes are in a C major chord?',
        a: 'A C major chord contains three notes: C (the root), E (the major third), and G (the perfect fifth).',
      },
      {
        q: 'Is C major a major or minor chord?',
        a: 'C major is a major chord. The major quality comes from the third — E is a major third (4 semitones) above C.',
      },
      {
        q: 'How do you play a C major chord on piano?',
        a: 'Place your thumb on C, middle finger on E, and pinky on G. All three are white keys with no sharps or flats.',
      },
      {
        q: 'How do you play a C major chord on guitar?',
        a: 'The most common open voicing puts your ring finger on the 3rd fret of the 5th string (C), middle finger on the 2nd fret of the 4th string (E), index finger on the 1st fret of the 2nd string (C), and the 3rd, 1st, and open 6th strings ring out as G, E, and an optional bass note.',
      },
    ],
  },
};

// Public lookup. Returns the full page descriptor or null if not yet published.
export const getChordPageContent = (slug) => {
  const meta = slugToChord(slug);
  if (!meta) return null;
  const content = CONTENT[slug];
  if (!content || !content.published) return null;
  const notes = buildChord(meta.root, meta.qualityKey);
  return { slug, ...meta, notes, ...content };
};

// All slugs that currently have published content. Drives sitemap + route registration.
export const PUBLISHED_CHORD_SLUGS = Object.entries(CONTENT)
  .filter(([, c]) => c.published)
  .map(([slug]) => slug);
