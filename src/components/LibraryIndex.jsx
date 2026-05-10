import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getLiveChordSlugs, slugToChord } from '../data/chordContent';
import { getLiveKeySlugs, slugToKey } from '../data/keyContent';
import { getLiveScaleSlugs, slugToScale } from '../data/scaleContent';
import { getLiveLearnSlugs, getLearnPageContent } from '../data/learnContent';
import { notesInKey } from '../data/keys';
import { noteToPc } from '../data/pitchClass';
import { QUALITIES, buildChord } from '../data/triads';

// Display labels for the 12 pitch-class buckets used to group chord pages.
// Enharmonic spellings share a heading (e.g. "C♯ / D♭") so users hunting
// either name find the section, but each individual chord card still uses
// its true spelling underneath. Bucket index = pitch class 0..11.
const PC_GROUP_LABELS = [
  'C', 'C♯ / D♭', 'D', 'D♯ / E♭', 'E', 'F',
  'F♯ / G♭', 'G', 'G♯ / A♭', 'A', 'A♯ / B♭', 'B',
];

// Order of qualities within a root group — matches the QUALITIES table in
// triads.js so the grid reads triads → 6ths → 7ths → 9ths → ... left-to-right.
const QUALITY_ORDER = Object.keys(QUALITIES).reduce((acc, k, i) => {
  acc[k] = i;
  return acc;
}, {});

// Qualities whose triad spelling is a major triad (or built atop one).
// Everything else — minor triads, diminished, half-diminished, dim7,
// and the minor-flavoured extensions — falls into the minor column.
const MAJOR_FLAVOR_QUALITIES = new Set([
  'maj', 'aug',
  'maj6', 'maj7', 'dom7',
  'maj9', 'dom9', 'add9',
  'maj11', 'dom11', 'add11',
  'maj13', 'dom13',
]);
const isMajorFlavor = (qualityKey) => MAJOR_FLAVOR_QUALITIES.has(qualityKey);

// Color category per quality — drives the coloured spine on each chord card
// in the chord-library index. Major and minor get their own colours;
// dominants (V chords in disguise) stand out in red; diminished family
// shares a purple range; augmented sits apart in gold.
const QUALITY_COLOR = {
  // Major triad + its non-dominant extensions
  maj:    'major',
  maj6:   'major',
  maj7:   'major',
  maj9:   'major',
  add9:   'major',
  maj11:  'major',
  add11:  'major',
  maj13:  'major',
  // Minor triad + its extensions
  min:    'minor',
  min6:   'minor',
  min7:   'minor',
  min9:   'minor',
  madd9:  'minor',
  min11:  'minor',
  madd11: 'minor',
  min13:  'minor',
  // Dominant family (major triad + minor 7th, or extended)
  dom7:   'dominant',
  dom9:   'dominant',
  dom11:  'dominant',
  dom13:  'dominant',
  // Diminished family
  dim:    'diminished',
  dim7:   'diminished',
  m7b5:   'half-dim',
  // Augmented stands alone
  aug:    'augmented',
};

// Prettify a chord symbol for display: convert ASCII "b" / "#" in the root
// to proper ♭ / ♯ glyphs. The QUALITIES table already uses Unicode for °
// and ♭5, so only the root letter needs touching up.
const formatChordSymbol = (name) =>
  name
    .replace(/^([A-G])b/, '$1♭')
    .replace(/^([A-G])#/, '$1♯');

// Slug helper for the relative-minor scale page. Mirrors the (private)
// tonicToSlug helper in scaleContent — accidental-aware so "F#" → "f-sharp".
const tonicToScaleSlug = (tonic) => {
  const letter = tonic[0].toLowerCase();
  if (tonic.length === 1) return `${letter}-minor`;
  return `${letter}-${tonic[1] === '#' ? 'sharp' : 'flat'}-minor`;
};

// Order-of-sharps sort: C (0 accidentals), then sharp keys 1-7, then flat
// keys 1-6. Matches the pedagogical order on the circle of fifths.
const keyCircleOrder = (meta) =>
  meta.count === 0 ? 0 : (meta.type === 'sharp' ? meta.count : 7 + meta.count);

// Single component handling all four library index pages — chord, key, scale,
// learn. Each variant pulls its live slugs from the corresponding content
// module and renders a card grid linking into the individual reference pages.
//
// Lives at /chords, /keys, /scales, and /learn. Crawler-friendly because the
// list is rendered server-side via vite-react-ssg.

const LIBRARIES = {
  chords: {
    title: 'Chord Library',
    description:
      'Reference pages for every major, minor, diminished, and augmented chord plus their seventh extensions. Each page covers the chord\'s notes, intervals, common voicings on piano and guitar, related chords, and FAQs. Drill them in the Chord Trainer when you\'re ready to commit them to memory.',
    canonicalPath: '/chords',
    drillTo: '/triads',
    drillLabel: 'Chord Trainer',
    // Group cards by root pitch class — all qualities for a given root
    // (C major, C minor, C7, etc.) sit together in the same section, with
    // enharmonic spellings (C♯ / D♭) merged under a single heading. Inside
    // each section, qualities sort by the QUALITIES-table order so triads
    // come first, then sevenths, ninths, and so on.
    grouped: true,
    // Each group has two columns — major-flavoured chords on the left,
    // minor/diminished/half-dim on the right. Inside each column the
    // qualities sort by the QUALITIES-table order.
    splitByQuality: true,
    getGroups: () => {
      const buckets = PC_GROUP_LABELS.map((label) => ({
        label,
        majorItems: [],
        minorItems: [],
      }));
      for (const slug of getLiveChordSlugs()) {
        const meta = slugToChord(slug);
        if (!meta) continue;
        const pc = noteToPc(meta.root);
        if (pc < 0) continue;
        // Pitch classes of every note in the chord — drives the mini piano
        // diagram on the card. buildChord returns spelled notes; we map to
        // pitch class so the highlight works regardless of enharmonic
        // spelling.
        const chordNotes = buildChord(meta.root, meta.qualityKey);
        const pitchClasses = chordNotes
          .map((n) => noteToPc(n))
          .filter((pc) => pc >= 0);
        const item = {
          slug,
          to: `/chords/${slug}`,
          title: `${meta.displayName} chord`,
          sub: meta.qualityLabel,
          // Chord-card extras: lead-sheet shorthand + colour category + piano.
          shorthand: formatChordSymbol(meta.chordName),
          colorKey: QUALITY_COLOR[meta.qualityKey] || 'other',
          pitchClasses,
          // Stable sort key: QUALITIES-table order, then root spelling so
          // C# major sits next to C# minor under "C♯ / D♭" ahead of Db.
          _sortKey: (QUALITY_ORDER[meta.qualityKey] ?? 99) * 100 + meta.root.length,
          _root: meta.root,
        };
        const target = isMajorFlavor(meta.qualityKey) ? 'majorItems' : 'minorItems';
        buckets[pc][target].push(item);
      }
      const byKey = (a, b) => a._sortKey - b._sortKey || a._root.localeCompare(b._root);
      return buckets
        .filter((b) => b.majorItems.length > 0 || b.minorItems.length > 0)
        .map((b) => ({
          label: b.label,
          majorItems: b.majorItems.sort(byKey),
          minorItems: b.minorItems.sort(byKey),
        }));
    },
  },
  keys: {
    title: 'Key Library',
    description:
      'Every major key signature, broken down into its notes, accidentals, diatonic chords, common progressions, and relative minor. Reference pages for sight-reading prep, transposition, and analysis. Drill the same set in the Circle of Fifths Trainer.',
    canonicalPath: '/keys',
    drillTo: '/circle-of-fifths',
    drillLabel: 'Circle of Fifths Trainer',
    // Paired cards: each card represents one key signature, showing the
    // major and its relative minor together. Ordered by the order of
    // sharps so the layout reads C → G → D → A → ... → Gb (matches how
    // the circle of fifths is taught in textbooks).
    paired: true,
    getItems: () => {
      const liveScaleSlugs = new Set(getLiveScaleSlugs());
      return getLiveKeySlugs()
        .map((slug) => {
          const meta = slugToKey(slug);
          if (!meta) return null;
          const relMinorTonic = notesInKey(meta)[5];
          const relMinorSlug = tonicToScaleSlug(relMinorTonic);
          const relMinorLive = liveScaleSlugs.has(relMinorSlug);
          return {
            slug,
            order: keyCircleOrder(meta),
            major: {
              to: `/keys/${slug}`,
              title: `${meta.tonic} major`,
            },
            minor: {
              to: relMinorLive ? `/scales/${relMinorSlug}` : null,
              title: `${relMinorTonic} minor`,
            },
            sub:
              meta.count === 0
                ? 'no sharps or flats'
                : `${meta.count} ${meta.type}${meta.count === 1 ? '' : 's'}`,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.order - b.order);
    },
  },
  scales: {
    title: 'Scale Library',
    description:
      'Detailed reference pages for every major and minor scale — the notes, the interval pattern that defines the scale, the diatonic chords built from it, and where the scale shows up in real music. Drill scale recall in the Note Trainer.',
    canonicalPath: '/scales',
    drillTo: '/notes',
    drillLabel: 'Note Trainer',
    getItems: () =>
      getLiveScaleSlugs().map((slug) => {
        const meta = slugToScale(slug);
        if (!meta) return null;
        const { count, type: accidentalType } = meta.key;
        return {
          slug,
          to: `/scales/${slug}`,
          title: `${meta.tonic} ${meta.type} scale`,
          sub:
            count === 0
              ? 'no accidentals'
              : `${count} ${accidentalType}${count === 1 ? '' : 's'}`,
        };
      }).filter(Boolean),
  },
  learn: {
    title: 'Music Theory Guides',
    description:
      'Long-form articles on the trickier topics in music theory — explanations of how the circle of fifths works, why major and minor sound different, how to read a key signature, and more. Each piece links into the relevant trainer for hands-on practice.',
    canonicalPath: '/learn',
    drillTo: null,
    drillLabel: null,
    getItems: () =>
      getLiveLearnSlugs().map((slug) => {
        const data = getLearnPageContent(slug);
        return data
          ? {
              slug,
              to: `/learn/${slug}`,
              title: data.title,
              sub: data.description,
            }
          : null;
      }).filter(Boolean),
  },
};

// Compact single-octave piano keyboard with chord notes highlighted.
// Pulls its fill colour from the parent's `--spine` CSS variable so the
// highlight always matches the chord-quality colour of the card it sits in.
//
// Black keys sit centred on the boundary between adjacent white keys —
// good enough for a 100-px-wide decorative diagram.
function MiniPiano({ pitchClasses }) {
  const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];           // C D E F G A B
  const BLACK_PCS_AT_BOUNDARY = [                       // pc → which boundary
    { pc: 1,  after: 0 },                               // C♯/D♭ between C and D
    { pc: 3,  after: 1 },                               // D♯/E♭ between D and E
    { pc: 6,  after: 3 },                               // F♯/G♭ between F and G
    { pc: 8,  after: 4 },                               // G♯/A♭ between G and A
    { pc: 10, after: 5 },                               // A♯/B♭ between A and B
  ];
  const whiteW = 14;
  const whiteH = 40;
  const blackW = 10;
  const blackH = 25;
  const totalW = whiteW * 7;
  const set = new Set(pitchClasses);

  return (
    <svg
      className="library-card-chord-piano"
      width={totalW}
      height={whiteH}
      viewBox={`0 0 ${totalW} ${whiteH}`}
      aria-hidden="true"
    >
      {/* White keys */}
      {WHITE_PCS.map((pc, i) => (
        <rect
          key={`w-${pc}`}
          x={i * whiteW}
          y={0}
          width={whiteW}
          height={whiteH}
          className={`mp-key mp-white${set.has(pc) ? ' is-on' : ''}`}
        />
      ))}
      {/* Black keys */}
      {BLACK_PCS_AT_BOUNDARY.map(({ pc, after }) => (
        <rect
          key={`b-${pc}`}
          x={(after + 1) * whiteW - blackW / 2}
          y={0}
          width={blackW}
          height={blackH}
          className={`mp-key mp-black${set.has(pc) ? ' is-on' : ''}`}
        />
      ))}
    </svg>
  );
}

// Renders one card for a single library entry. Two visual variants:
//   - chord cards (when `shorthand` is present): big lead-sheet symbol on
//     top with a small quality label underneath, plus a coloured spine on
//     the left to make qualities scannable
//   - default cards (scales, keys, guides): two-line title + sub
function LibraryCard({ item }) {
  if (item.shorthand) {
    return (
      <Link
        to={item.to}
        className="library-card library-card-chord"
        data-color={item.colorKey}
      >
        <div className="library-card-chord-head">
          <span className="library-card-chord-symbol">{item.shorthand}</span>
          {item.sub && <span className="library-card-chord-label">{item.sub}</span>}
        </div>
        {item.pitchClasses && <MiniPiano pitchClasses={item.pitchClasses} />}
      </Link>
    );
  }
  return (
    <Link to={item.to} className="library-card">
      <span className="library-card-title">{item.title}</span>
      {item.sub && <span className="library-card-sub">{item.sub}</span>}
    </Link>
  );
}

export default function LibraryIndex({ library }) {
  const config = LIBRARIES[library];
  if (!config) return null;
  const items = config.grouped ? null : config.getItems();
  const groups = config.grouped ? config.getGroups() : null;
  const isEmpty = config.grouped
    ? !groups || groups.every((g) =>
        config.splitByQuality
          ? g.majorItems.length === 0 && g.minorItems.length === 0
          : g.items.length === 0
      )
    : items.length === 0;
  const canonical = `https://theory-trainer.com${config.canonicalPath}`;

  return (
    <div className="library-root">
      <Head>
        <title>{config.title} | Music Theory Trainer</title>
        <meta name="description" content={config.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://theory-trainer.com/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.title} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content="https://theory-trainer.com/og-default.png" />
      </Head>

      <style>{styles}</style>

      <header className="library-header">
        <div className="library-container">
          <Link to="/" className="library-back">← Music Theory Trainer</Link>
          <h1 className="library-h1">{config.title}</h1>
          <p className="library-intro">{config.description}</p>
          {config.drillTo && (
            <Link to={config.drillTo} className="library-cta">
              Drill in the {config.drillLabel} →
            </Link>
          )}
        </div>
      </header>

      <main className="library-container library-main">
        {isEmpty ? (
          <p className="library-empty">
            No pages have rolled live yet — check back soon. (Pages publish on a
            staggered schedule per the SEO strategy.)
          </p>
        ) : config.grouped ? (
          // Per-root grouped layout (chord library). Each section heading
          // shows the root pitch class — enharmonic spellings (C♯ / D♭)
          // share a heading so users hunting either name find the section.
          // When `splitByQuality` is on, each section is two columns:
          // major-flavour chords on the left, minor/dim/half-dim on the right.
          <div className="library-groups">
            {groups.map((group) => (
              <section key={group.label} className="library-group">
                <h2 className="library-group-title">{group.label}</h2>
                {config.splitByQuality ? (
                  <div className="library-split">
                    <div className="library-split-column">
                      <h3 className="library-split-title">Major</h3>
                      {group.majorItems.length === 0 ? (
                        <p className="library-split-empty">No major chords yet.</p>
                      ) : (
                        <ul className="library-grid library-grid-stack">
                          {group.majorItems.map((item) => (
                            <li key={item.slug}>
                              <LibraryCard item={item} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="library-split-column">
                      <h3 className="library-split-title">Minor</h3>
                      {group.minorItems.length === 0 ? (
                        <p className="library-split-empty">No minor chords yet.</p>
                      ) : (
                        <ul className="library-grid library-grid-stack">
                          {group.minorItems.map((item) => (
                            <li key={item.slug}>
                              <LibraryCard item={item} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <ul className="library-grid">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <LibraryCard item={item} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <ul className="library-grid">
            {items.map((item) => (
              <li key={item.slug}>
                {config.paired ? (
                  // Paired card for the keys library: major + relative minor
                  // grouped under one signature heading. Each name is its own
                  // link target so the user can jump straight to either page.
                  // The relative minor link disappears (becomes plain text)
                  // if its scale page hasn't rolled live yet.
                  <div className="library-card library-card-paired">
                    {item.sub && <span className="library-card-sub">{item.sub}</span>}
                    <Link to={item.major.to} className="library-card-pair-link">
                      <span className="library-card-title">{item.major.title}</span>
                    </Link>
                    <span className="library-card-pair-divider">relative minor</span>
                    {item.minor.to ? (
                      <Link to={item.minor.to} className="library-card-pair-link library-card-pair-link-secondary">
                        <span className="library-card-title-sub">{item.minor.title}</span>
                      </Link>
                    ) : (
                      <span className="library-card-title-sub library-card-title-muted">
                        {item.minor.title}
                      </span>
                    )}
                  </div>
                ) : (
                  <LibraryCard item={item} />
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="library-footer">
        <Link to="/">← Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

const styles = `
  .library-root {
    --ink: #1a1410;
    --ink-soft: #3d342b;
    --paper: #f4ecdc;
    --paper-deep: #ebe0c9;
    --paper-shadow: #d9cbad;
    --accent: #8b2c20;
    --gold: #a88734;
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: var(--ink);
    background: var(--paper);
    min-height: 100vh;
    padding: 1.5rem 1rem 4rem;
    line-height: 1.55;
  }
  .library-container {
    max-width: 760px;
    margin: 0 auto;
  }
  .library-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft); text-decoration: none;
    display: inline-block; margin-bottom: 1.25rem;
  }
  .library-back:hover { color: var(--accent); }
  .library-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.4rem, 6vw, 3.8rem);
    line-height: 1.05; margin: 0 0 1rem; color: var(--ink);
  }
  .library-intro {
    font-size: 1.1rem;
    color: var(--ink-soft);
    margin: 0 0 1.25rem;
  }
  .library-cta {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--accent); text-decoration: none;
    border-bottom: 1px solid var(--accent); padding-bottom: 2px;
  }
  .library-cta:hover { color: var(--ink); border-color: var(--ink); }

  .library-main {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 1px dotted var(--ink-soft);
  }
  .library-empty {
    font-style: italic;
    color: var(--ink-soft);
    text-align: center;
    padding: 2rem 0;
  }
  /* Per-root grouped layout (chord library). Each section is one root,
     with a divider heading and its own card grid below. */
  .library-groups {
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
  }
  .library-group { margin: 0; }
  .library-group-title {
    font-family: 'Italiana', serif;
    font-weight: 400;
    font-size: 1.7rem;
    color: var(--accent);
    margin: 0 0 0.85rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px dotted var(--ink-soft);
    letter-spacing: 0.02em;
  }
  /* Two-column split per root: major-flavour chords on the left,
     minor/diminished/half-dim on the right. Stacks vertically on mobile,
     side-by-side on tablets and up. */
  .library-split {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 600px) {
    .library-split { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  }
  .library-split-column { min-width: 0; }
  .library-split-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin: 0 0 0.6rem;
    font-weight: 400;
  }
  .library-split-empty {
    font-style: italic;
    color: var(--ink-soft);
    opacity: 0.6;
    font-size: 0.9rem;
    margin: 0;
  }
  /* Inside a split column, cards stack vertically regardless of viewport
     width — the column itself is already narrow. */
  .library-grid-stack { grid-template-columns: 1fr !important; }
  .library-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  @media (min-width: 600px) {
    .library-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 900px) {
    .library-grid { grid-template-columns: repeat(3, 1fr); }
  }
  .library-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem 1.1rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    box-shadow: 4px 4px 0 var(--paper-shadow);
    text-decoration: none;
    color: inherit;
    transition: all 0.15s ease;
  }
  .library-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--accent);
    border-color: var(--accent);
  }
  /* Paired-card variant for the keys library: a non-link container that
     groups two clickable headings (major + relative minor) under one
     signature meta-line. We override the hover transform here because
     the container itself isn't a link — instead each inner pair-link
     gets its own subtle hover treatment. */
  .library-card-paired {
    gap: 0.35rem;
    cursor: default;
  }
  .library-card-paired:hover {
    transform: none;
    box-shadow: 4px 4px 0 var(--paper-shadow);
    border-color: var(--ink);
  }
  .library-card-pair-link {
    text-decoration: none;
    color: inherit;
    display: block;
    padding: 0.15rem 0;
    transition: color 0.12s ease, transform 0.12s ease;
  }
  .library-card-pair-link:hover {
    color: var(--accent);
    transform: translateX(2px);
  }
  .library-card-pair-divider {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    opacity: 0.65;
    margin-top: 0.25rem;
  }
  .library-card-title-sub {
    font-family: 'Italiana', serif;
    font-size: 1.05rem;
    color: var(--ink);
  }
  .library-card-title-muted {
    color: var(--ink-soft);
    opacity: 0.65;
  }
  /* Chord-card variant: lead-sheet shorthand on top, quality label below,
     and a coloured spine on the left edge keyed to chord quality. The
     spine is the entire visual cue — easy to scan a long index by colour. */
  .library-card-chord {
    --spine: var(--paper-shadow);
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.65rem;
    padding: 0.7rem 0.85rem 0.7rem 1.2rem;
    overflow: hidden;
  }
  .library-card-chord::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: var(--spine);
  }
  .library-card-chord:hover { box-shadow: 6px 6px 0 var(--spine); border-color: var(--spine); }
  .library-card-chord-head {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    flex: 1;
  }
  .library-card-chord-symbol {
    font-family: 'Italiana', serif;
    font-size: 1.55rem;
    line-height: 1.05;
    color: var(--ink);
    letter-spacing: 0.01em;
  }
  .library-card-chord-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
    opacity: 0.85;
  }
  /* Mini piano diagram on the right side of each chord card. White keys
     stay paper-coloured when off; highlighted keys flood with the chord-
     quality spine colour. Black keys are dark by default, take on the
     spine colour when highlighted. */
  .library-card-chord-piano {
    flex: 0 0 auto;
    display: block;
  }
  .mp-key {
    stroke: var(--ink);
    stroke-width: 0.75;
    transition: fill 0.15s ease;
  }
  .mp-white          { fill: var(--paper); }
  .mp-white.is-on    { fill: var(--spine); }
  .mp-black          { fill: var(--ink); }
  .mp-black.is-on    { fill: var(--spine); }
  /* Quality colour palette — vintage-friendly, muted but distinguishable.
     Adjust here and the index, the chord-list legend, and every card
     update together. */
  .library-card-chord[data-color="major"]      { --spine: #4a6b54; }
  .library-card-chord[data-color="minor"]      { --spine: #4a5980; }
  .library-card-chord[data-color="dominant"]   { --spine: #a64535; }
  .library-card-chord[data-color="diminished"] { --spine: #5e3a6b; }
  .library-card-chord[data-color="half-dim"]   { --spine: #846a92; }
  .library-card-chord[data-color="augmented"]  { --spine: #a88734; }

  .library-card-title {
    font-family: 'Italiana', serif;
    font-size: 1.15rem;
    color: var(--ink);
  }
  .library-card-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .library-footer {
    max-width: 760px;
    margin: 4rem auto 0;
    padding-top: 2rem;
    border-top: 1px solid var(--paper-shadow);
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .library-footer a { color: var(--ink-soft); text-decoration: none; }
  .library-footer a:hover { color: var(--accent); }
`;
