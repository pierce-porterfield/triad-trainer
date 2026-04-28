import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getChordPageContent, slugToChord } from '../data/chordContent';
import { pickFingering } from '../data/guitarFingerings';
import PianoInput from './PianoInput';
import GuitarInput from './GuitarInput';

// Canonical reference page for a single chord. SEO-first layout per
// seo-strategy.md: every section the strategy calls for, plus JSON-LD.
//
// Receives the slug as a prop (set by the route record) so the same component
// can render every chord page.
export default function ChordPage({ slug }) {
  const data = getChordPageContent(slug);

  if (!data) {
    // Slug parses but isn't published yet, or is invalid. Either way: 404-ish.
    const meta = slugToChord(slug);
    return (
      <div className="chord-page-root">
        <Head>
          <title>Chord not found — Music Theory Trainer</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="chord-container">
          <p className="chord-eyebrow">Not found</p>
          <h1 className="chord-h1">
            {meta ? `${meta.displayName} chord` : 'Chord page'}
          </h1>
          <p>This page hasn't been written yet. <Link to="/">Back home</Link>.</p>
        </div>
      </div>
    );
  }

  const {
    chordName, displayName, root, qualityKey, qualityLabel, notes,
    intro, intervals, relatedKeys, relatedChords, commonMistakes,
    inProgressions, faq,
  } = data;

  const canonical = `https://theory-trainer.com/chords/${slug}`;
  const title = `${displayName} chord — notes, intervals, and practice | Music Theory Trainer`;
  const description =
    `Learn the notes in the ${displayName} chord (${notes.join(', ')}), see the intervals, and drill it with interactive flash cards.`;

  // JSON-LD: HowTo for "how to play X chord", FAQPage for the questions.
  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to play the ${displayName} chord`,
    description,
    step: [
      {
        '@type': 'HowToStep',
        name: `Identify the root: ${root}`,
        text: `The root of the ${displayName} chord is ${root}.`,
      },
      ...intervals.map((iv) => ({
        '@type': 'HowToStep',
        name: `Add ${iv.to} (${iv.name} above ${iv.from})`,
        text: `${iv.from} up a ${iv.name} (${iv.semitones} semitones) is ${iv.to}.`,
      })),
      {
        '@type': 'HowToStep',
        name: 'Voice the chord',
        text: `Play ${notes.join(', ')} together, in any octave.`,
      },
    ],
  };
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
    <div className="chord-page-root">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${displayName} chord — notes, intervals, and practice`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://theory-trainer.com/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${displayName} chord`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://theory-trainer.com/og-default.png" />
        <script type="application/ld+json">{JSON.stringify(howToLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Head>

      <style>{styles}</style>

      <header className="chord-header">
        <div className="chord-container">
          <nav className="chord-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Music Theory Trainer</Link>
            <span aria-hidden="true"> / </span>
            <span>Chords</span>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{displayName}</span>
          </nav>
          <p className="chord-eyebrow">— A {qualityLabel} triad —</p>
          <h1 className="chord-h1">
            {displayName} chord
          </h1>
          <p className="chord-notes-line">
            Notes: <strong>{notes.join(' · ')}</strong>
          </p>
          <Link to="/triads" className="chord-cta">Practice this chord in the trainer →</Link>
        </div>
      </header>

      <main className="chord-container chord-main">

        <section>
          <p className="chord-intro">{intro}</p>
        </section>

        <section>
          <h2 className="chord-h2">Intervals</h2>
          <p>The {displayName} chord stacks two thirds on the root. Each interval and its size in semitones:</p>
          <ul className="chord-interval-list">
            {intervals.map((iv, i) => (
              <li key={i}>
                <span className="chord-interval-from">{iv.from}</span>
                <span className="chord-interval-arrow">→</span>
                <span className="chord-interval-to">{iv.to}</span>
                <span className="chord-interval-name">{iv.name}</span>
                <span className="chord-interval-semis">{iv.semitones} semitones</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="chord-h2">On the keyboard</h2>
          <p>Each note of the {displayName} chord highlighted on a piano. Pitch class is what matters — any octave works.</p>
          <div className="chord-diagram">
            <PianoInput mode="display" value={notes} chordSeed={slug} />
          </div>
        </section>

        <section>
          <h2 className="chord-h2">On the guitar</h2>
          <p>One voicing of the {displayName} chord on a six-string guitar fretboard.</p>
          <div className="chord-diagram">
            <GuitarInput
              mode="display"
              value={notes}
              chordSeed={slug}
              fingering={pickFingering(qualityKey, root, slug)}
            />
          </div>
        </section>

        <section>
          <h2 className="chord-h2">Common mistakes</h2>
          <p>{commonMistakes}</p>
        </section>

        {inProgressions && (
          <section>
            <h2 className="chord-h2">In context</h2>
            <p>{inProgressions}</p>
          </section>
        )}

        <section className="chord-trainer-cta">
          <h2 className="chord-h2">Drill it</h2>
          <p>The {displayName} chord is one of 48 in the Chord Trainer. Open the full trainer to practice it alongside related chords with timing and best-time tracking.</p>
          <Link to="/triads" className="chord-cta chord-cta-big">Open the Chord Trainer →</Link>
          <Link to="/daily" className="chord-cta-secondary">Or try today's Etudle puzzle</Link>
        </section>

        <section>
          <h2 className="chord-h2">Related</h2>
          <div className="chord-related-grid">
            {relatedKeys.map(({ label, slug: rs, kind }) => (
              <Link
                key={`${kind}-${rs}`}
                to={kind === 'key' ? `/keys/${rs}` : `/chords/${rs}`}
                className="chord-related-link"
              >
                {label}
              </Link>
            ))}
            {relatedChords.map((rs) => {
              const m = slugToChord(rs);
              if (!m) return null;
              return (
                <Link key={rs} to={`/chords/${rs}`} className="chord-related-link">
                  {m.displayName}
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="chord-h2">Frequently asked</h2>
          <dl className="chord-faq">
            {faq.map(({ q, a }, i) => (
              <React.Fragment key={i}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

      </main>

      <footer className="chord-footer">
        <Link to="/">← Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

const styles = `
  .chord-page-root {
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
  .chord-container {
    max-width: 760px;
    margin: 0 auto;
  }
  .chord-breadcrumb {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 1.25rem;
  }
  .chord-breadcrumb a { color: var(--ink-soft); text-decoration: none; }
  .chord-breadcrumb a:hover { color: var(--accent); }
  .chord-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin: 0 0 0.5rem;
  }
  .chord-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    line-height: 1;
    margin: 0 0 1rem;
    color: var(--ink);
  }
  .chord-h2 {
    font-family: 'Italiana', serif;
    font-size: 1.6rem;
    margin: 2.5rem 0 0.75rem;
    color: var(--ink);
  }
  .chord-notes-line {
    font-size: 1.2rem;
    margin: 0 0 1.25rem;
  }
  .chord-notes-line strong {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.1em;
  }
  .chord-cta {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid var(--accent);
    padding-bottom: 2px;
  }
  .chord-cta:hover { color: var(--ink); border-color: var(--ink); }
  .chord-cta-big {
    background: var(--ink);
    color: var(--paper);
    padding: 0.85rem 1.4rem;
    border: none;
    margin-right: 1rem;
  }
  .chord-cta-big:hover { background: var(--accent); color: var(--paper); }
  .chord-cta-secondary {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    text-decoration: none;
    border-bottom: 1px dotted var(--ink-soft);
  }
  .chord-main { padding-top: 1rem; }
  .chord-intro { font-size: 1.15rem; }
  .chord-interval-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }
  .chord-interval-list li {
    display: grid;
    grid-template-columns: 2.5rem 1.5rem 2.5rem 1fr auto;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.6rem 0.9rem;
    background: var(--paper-deep);
    border-left: 3px solid var(--gold);
  }
  .chord-interval-from, .chord-interval-to {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: var(--accent);
  }
  .chord-interval-arrow { color: var(--ink-soft); }
  .chord-interval-name { font-style: italic; }
  .chord-interval-semis {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: var(--ink-soft);
  }
  .chord-diagram {
    margin: 1rem 0 0.5rem;
    padding: 1.25rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
  }
  .chord-trainer-cta {
    margin-top: 3rem;
    padding: 1.75rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    box-shadow: 6px 6px 0 var(--paper-shadow);
  }
  .chord-trainer-cta .chord-h2 { margin-top: 0; }
  .chord-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .chord-related-link {
    display: block;
    padding: 0.85rem 1rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    text-decoration: none;
    color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-align: center;
    transition: all 0.15s ease;
  }
  .chord-related-link:hover {
    background: var(--ink);
    color: var(--paper);
  }
  .chord-faq dt {
    font-family: 'Italiana', serif;
    font-size: 1.2rem;
    margin-top: 1.25rem;
    color: var(--ink);
  }
  .chord-faq dd {
    margin: 0.4rem 0 0;
    color: var(--ink-soft);
  }
  .chord-footer {
    max-width: 760px;
    margin: 4rem auto 0;
    padding-top: 2rem;
    border-top: 1px solid var(--paper-shadow);
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .chord-footer a { color: var(--ink-soft); text-decoration: none; }
  .chord-footer a:hover { color: var(--accent); }
`;
