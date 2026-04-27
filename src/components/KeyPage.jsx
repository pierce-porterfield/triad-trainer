import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getKeyPageContent, slugToKey } from '../data/keyContent.js';
import { PUBLISHED_CHORD_SLUGS } from '../data/chordContent.js';

// Canonical reference page for a single major key. Mirrors ChordPage.jsx
// structurally — same SEO contract (per-page Head, JSON-LD, internal linking
// rules from seo-strategy.md) — but the body is key-specific: scale notes,
// key signature, diatonic chords, common progressions, relative minor.
export default function KeyPage({ slug }) {
  const data = getKeyPageContent(slug);

  if (!data) {
    const meta = slugToKey(slug);
    return (
      <div className="key-page-root">
        <Head>
          <title>Key not found — Music Theory Trainer</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="key-container">
          <p className="key-eyebrow">Not found</p>
          <h1 className="key-h1">{meta ? `${meta.tonic} major` : 'Key page'}</h1>
          <p>This page hasn't been written yet. <Link to="/">Back home</Link>.</p>
        </div>
      </div>
    );
  }

  const {
    name, tonic, scaleNotes, sharps, flats, accidentalCount, accidentalType,
    diatonic, relativeMinor, intro, progressions, commonMistakes, faq,
  } = data;

  const canonical = `https://theory-trainer.com/keys/${slug}`;
  const title = `Key of ${name} — notes, key signature, and chords | Music Theory Trainer`;
  const accidentalSummary = accidentalCount === 0
    ? 'no sharps or flats'
    : `${accidentalCount} ${accidentalType}${accidentalCount === 1 ? '' : 's'}: ${(accidentalType === 'sharp' ? sharps : flats).map((l) => l + (accidentalType === 'sharp' ? '#' : 'b')).join(', ')}`;
  const description = `${name} has ${accidentalSummary}. The scale is ${scaleNotes.join(', ')}. See the diatonic chords, common progressions, and practice with flash cards.`;

  // JSON-LD: FAQPage. (HowTo doesn't fit "playing a key" cleanly.)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="key-page-root">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`Key of ${name} — notes, signature, and chords`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://theory-trainer.com/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Key of ${name}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://theory-trainer.com/og-default.png" />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Head>

      <style>{styles}</style>

      <header className="key-header">
        <div className="key-container">
          <nav className="key-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Music Theory Trainer</Link>
            <span aria-hidden="true"> / </span>
            <span>Keys</span>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{name}</span>
          </nav>
          <p className="key-eyebrow">— A major key with {accidentalSummary} —</p>
          <h1 className="key-h1">The key of {name}</h1>
          <p className="key-scale-line">
            Scale: <strong>{scaleNotes.join(' · ')}</strong>
          </p>
          <Link to="/circle-of-fifths" className="key-cta">Drill key signatures in the trainer →</Link>
        </div>
      </header>

      <main className="key-container key-main">

        <section>
          <p className="key-intro">{intro}</p>
        </section>

        <section>
          <h2 className="key-h2">Key signature</h2>
          <div className="key-sig-card">
            <div className="key-sig-count">
              <span className="key-sig-num">{accidentalCount}</span>
              <span className="key-sig-label">
                {accidentalType === 'natural' ? 'sharps or flats' : `${accidentalType}${accidentalCount === 1 ? '' : 's'}`}
              </span>
            </div>
            {accidentalCount > 0 && (
              <ol className="key-sig-list">
                {(accidentalType === 'sharp' ? sharps : flats).map((letter, i) => (
                  <li key={letter}>
                    <span className="key-sig-order">{i + 1}.</span>
                    <span className="key-sig-note">
                      {letter}{accidentalType === 'sharp' ? '#' : '♭'}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <p className="key-sig-note-line">
              {accidentalCount === 0
                ? 'C major is the only major key with no accidentals.'
                : `Added in the standard order of ${accidentalType}s.`}
            </p>
          </div>
        </section>

        <section>
          <h2 className="key-h2">Diatonic chords</h2>
          <p>The seven triads built on each scale degree. These are the chords you hear used most in {name}:</p>
          <table className="key-diatonic">
            <thead>
              <tr>
                <th>Roman</th>
                <th>Chord</th>
                <th>Quality</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {diatonic.map((d) => {
                const chordSlug = slugForChord(d.root, d.quality);
                const isPublished = PUBLISHED_CHORD_SLUGS.includes(chordSlug);
                return (
                  <tr key={d.roman}>
                    <td className="key-roman">{d.roman}</td>
                    <td className="key-chord-cell">
                      {isPublished ? (
                        <Link to={`/chords/${chordSlug}`}>{d.chordName}</Link>
                      ) : (
                        <span>{d.chordName}</span>
                      )}
                    </td>
                    <td>{d.qualityLabel}</td>
                    <td className="key-notes-cell">{d.notes.join(' · ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="key-h2">Common progressions</h2>
          <p>{progressions}</p>
        </section>

        <section>
          <h2 className="key-h2">Relative minor</h2>
          <p>The relative minor of {name} is <strong>{relativeMinor}</strong> — it shares the same key signature, just centred on the 6th degree of the {name} scale ({scaleNotes[5]}). A piece can move between {name} and {relativeMinor} freely without any change of accidentals.</p>
        </section>

        <section>
          <h2 className="key-h2">Common mistakes</h2>
          <p>{commonMistakes}</p>
        </section>

        <section className="key-trainer-cta">
          <h2 className="key-h2">Drill it</h2>
          <p>The Circle of Fifths trainer drills every key signature — {name} included — with timed flash cards and best-time tracking.</p>
          <Link to="/circle-of-fifths" className="key-cta key-cta-big">Open the Circle of Fifths Trainer →</Link>
          <Link to="/daily" className="key-cta-secondary">Or try today's Etudle puzzle</Link>
        </section>

        <section>
          <h2 className="key-h2">Frequently asked</h2>
          <dl className="key-faq">
            {faq.map(({ q, a }, i) => (
              <React.Fragment key={i}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

      </main>

      <footer className="key-footer">
        <Link to="/">← Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

// Build a chord-page slug from a root note and quality key.
// "Eb", "min" → "e-flat-minor"
const slugForChord = (root, qualityKey) => {
  const letter = root[0].toLowerCase();
  const acc = root[1] === '#' ? '-sharp' : root[1] === 'b' ? '-flat' : '';
  const q = { maj: 'major', min: 'minor', dim: 'diminished', aug: 'augmented' }[qualityKey];
  return `${letter}${acc}-${q}`;
};

const styles = `
  .key-page-root {
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
  .key-container { max-width: 760px; margin: 0 auto; }
  .key-breadcrumb {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 1.25rem;
  }
  .key-breadcrumb a { color: var(--ink-soft); text-decoration: none; }
  .key-breadcrumb a:hover { color: var(--accent); }
  .key-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: var(--ink-soft); margin: 0 0 0.5rem;
  }
  .key-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.4rem, 6vw, 4rem);
    line-height: 1; margin: 0 0 1rem; color: var(--ink);
  }
  .key-h2 {
    font-family: 'Italiana', serif;
    font-size: 1.6rem; margin: 2.5rem 0 0.75rem; color: var(--ink);
  }
  .key-scale-line { font-size: 1.2rem; margin: 0 0 1.25rem; }
  .key-scale-line strong {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500; color: var(--accent); letter-spacing: 0.1em;
  }
  .key-cta {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--accent); text-decoration: none;
    border-bottom: 1px solid var(--accent); padding-bottom: 2px;
  }
  .key-cta:hover { color: var(--ink); border-color: var(--ink); }
  .key-cta-big {
    background: var(--ink); color: var(--paper);
    padding: 0.85rem 1.4rem; border: none; margin-right: 1rem;
  }
  .key-cta-big:hover { background: var(--accent); color: var(--paper); }
  .key-cta-secondary {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    color: var(--ink-soft); text-decoration: none;
    border-bottom: 1px dotted var(--ink-soft);
  }
  .key-main { padding-top: 1rem; }
  .key-intro { font-size: 1.15rem; }

  .key-sig-card {
    background: var(--paper-deep);
    border: 1px solid var(--ink); border-left: 4px solid var(--gold);
    padding: 1.25rem 1.5rem; margin-top: 1rem;
  }
  .key-sig-count {
    display: flex; align-items: baseline; gap: 0.6rem; margin-bottom: 0.75rem;
  }
  .key-sig-num {
    font-family: 'Italiana', serif; font-size: 3rem; line-height: 1; color: var(--accent);
  }
  .key-sig-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--ink-soft);
  }
  .key-sig-list {
    list-style: none; padding: 0; margin: 0 0 0.75rem;
    display: flex; flex-wrap: wrap; gap: 0.4rem;
  }
  .key-sig-list li {
    display: inline-flex; align-items: baseline; gap: 0.3rem;
    background: var(--paper); border: 1px solid var(--ink-soft);
    padding: 0.35rem 0.6rem;
  }
  .key-sig-order {
    font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--ink-soft);
  }
  .key-sig-note {
    font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--accent);
  }
  .key-sig-note-line {
    font-style: italic; color: var(--ink-soft); font-size: 0.95rem; margin: 0;
  }

  .key-diatonic {
    width: 100%; border-collapse: collapse; margin-top: 0.5rem;
    font-size: 0.95rem;
  }
  .key-diatonic th, .key-diatonic td {
    text-align: left; padding: 0.55rem 0.75rem;
    border-bottom: 1px solid var(--paper-shadow);
  }
  .key-diatonic th {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--ink-soft); font-weight: 500;
    border-bottom-color: var(--ink-soft);
  }
  .key-roman {
    font-family: 'Italiana', serif; font-size: 1.1rem; color: var(--accent);
    width: 70px;
  }
  .key-chord-cell a {
    font-family: 'JetBrains Mono', monospace; font-weight: 500;
    color: var(--ink); text-decoration: none;
    border-bottom: 1px dotted var(--ink-soft);
  }
  .key-chord-cell a:hover { color: var(--accent); border-color: var(--accent); }
  .key-notes-cell {
    font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--ink-soft);
  }

  .key-trainer-cta {
    margin-top: 3rem; padding: 1.75rem;
    background: var(--paper-deep); border: 1px solid var(--ink);
    box-shadow: 6px 6px 0 var(--paper-shadow);
  }
  .key-trainer-cta .key-h2 { margin-top: 0; }

  .key-faq dt {
    font-family: 'Italiana', serif; font-size: 1.2rem; margin-top: 1.25rem; color: var(--ink);
  }
  .key-faq dd { margin: 0.4rem 0 0; color: var(--ink-soft); }

  .key-footer {
    max-width: 760px; margin: 4rem auto 0;
    padding-top: 2rem; border-top: 1px solid var(--paper-shadow);
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .key-footer a { color: var(--ink-soft); text-decoration: none; }
  .key-footer a:hover { color: var(--accent); }
`;
