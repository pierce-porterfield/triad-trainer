import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getLiveChordSlugs, slugToChord } from '../data/chordContent';
import { getLiveKeySlugs, slugToKey } from '../data/keyContent';
import { getLiveScaleSlugs, slugToScale } from '../data/scaleContent';
import { getLiveLearnSlugs, getLearnPageContent } from '../data/learnContent';

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
    getItems: () =>
      getLiveChordSlugs().map((slug) => {
        const meta = slugToChord(slug);
        return meta
          ? {
              slug,
              to: `/chords/${slug}`,
              title: `${meta.displayName} chord`,
              sub: meta.qualityLabel,
            }
          : null;
      }).filter(Boolean),
  },
  keys: {
    title: 'Key Library',
    description:
      'Every major key signature, broken down into its notes, accidentals, diatonic chords, common progressions, and relative minor. Reference pages for sight-reading prep, transposition, and analysis. Drill the same set in the Circle of Fifths Trainer.',
    canonicalPath: '/keys',
    drillTo: '/circle-of-fifths',
    drillLabel: 'Circle of Fifths Trainer',
    getItems: () =>
      getLiveKeySlugs().map((slug) => {
        const meta = slugToKey(slug);
        return meta
          ? {
              slug,
              to: `/keys/${slug}`,
              title: `Key of ${meta.tonic} major`,
              sub:
                meta.count === 0
                  ? 'no sharps or flats'
                  : `${meta.count} ${meta.type}${meta.count === 1 ? '' : 's'}`,
            }
          : null;
      }).filter(Boolean),
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

export default function LibraryIndex({ library }) {
  const config = LIBRARIES[library];
  if (!config) return null;
  const items = config.getItems();
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
        {items.length === 0 ? (
          <p className="library-empty">
            No pages have rolled live yet — check back soon. (Pages publish on a
            staggered schedule per the SEO strategy.)
          </p>
        ) : (
          <ul className="library-grid">
            {items.map((item) => (
              <li key={item.slug}>
                <Link to={item.to} className="library-card">
                  <span className="library-card-title">{item.title}</span>
                  {item.sub && <span className="library-card-sub">{item.sub}</span>}
                </Link>
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
