import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getScalePageContent, slugToScale } from '../data/scaleContent.js';

// Canonical reference page for a single scale (major or natural minor).
// Focused on the *melodic/intervallic* angle — interval pattern, scale-degree
// names, intervals from the root — to differentiate from the harmonic
// /keys/{slug} pages.
export default function ScalePage({ slug }) {
  const data = getScalePageContent(slug);

  if (!data) {
    const meta = slugToScale(slug);
    return (
      <div className="scale-page-root">
        <Head>
          <title>Scale not found — Music Theory Trainer</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="scale-container">
          <p className="scale-eyebrow">Not found</p>
          <h1 className="scale-h1">{meta ? `${meta.tonic} ${meta.type}` : 'Scale page'}</h1>
          <p>This page hasn't been written yet. <Link to="/">Back home</Link>.</p>
        </div>
      </div>
    );
  }

  const {
    name, tonic, type, scaleNotes, pattern, degrees,
    accidentalCount, accidentalType, sharps, flats,
    relativeKeyName, intro, context, commonMistakes, faq,
  } = data;

  const canonical = `https://triadtrainer.org/scales/${slug}`;
  const title = `The ${name} scale — notes, intervals, and pattern | Music Theory Trainer`;
  const description = `The ${name} scale is ${scaleNotes.join(', ')}. Interval pattern: ${pattern.join('-')}. See every interval from the root and practice with flash cards.`;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  // Map "type" → matching key page for cross-link
  const keySlug = type === 'major'
    ? slug // /keys/c-major matches /scales/c-major
    : null; // minor keys aren't a Layer-2 SEO target right now

  return (
    <div className="scale-page-root">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`The ${name} scale — notes, intervals, and pattern`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${name} scale`} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Head>

      <style>{styles}</style>

      <header className="scale-header">
        <div className="scale-container">
          <nav className="scale-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Music Theory Trainer</Link>
            <span aria-hidden="true"> / </span>
            <span>Scales</span>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{name}</span>
          </nav>
          <p className="scale-eyebrow">— A {type === 'major' ? 'major' : 'natural minor'} scale —</p>
          <h1 className="scale-h1">The {name} scale</h1>
          <p className="scale-notes-line">
            Notes: <strong>{scaleNotes.join(' · ')}</strong>
          </p>
          <Link to="/intervals" className="scale-cta">Drill these intervals in the trainer →</Link>
        </div>
      </header>

      <main className="scale-container scale-main">

        <section>
          <p className="scale-intro">{intro}</p>
        </section>

        <section>
          <h2 className="scale-h2">Interval pattern</h2>
          <p>The {name} scale is built from this fixed pattern of whole steps (W) and half steps (H):</p>
          <ol className="scale-pattern">
            {pattern.map((step, i) => (
              <li key={i} className={step === 'W' ? 'is-whole' : 'is-half'}>
                <span className="scale-pattern-step">{step}</span>
                <span className="scale-pattern-label">{step === 'W' ? 'whole' : 'half'}</span>
              </li>
            ))}
          </ol>
          <p className="scale-pattern-note">
            {type === 'major'
              ? 'Every major scale uses this same pattern, transposed to start on a different tonic. The half-steps fall between scale degrees 3–4 and 7–8.'
              : 'Every natural minor scale uses this same pattern. The half-steps fall between scale degrees 2–3 and 5–6.'}
          </p>
        </section>

        <section>
          <h2 className="scale-h2">Scale degrees and intervals</h2>
          <p>Each note of the scale, with its scale-degree name and interval from the root:</p>
          <table className="scale-degrees">
            <thead>
              <tr>
                <th>Degree</th>
                <th>Note</th>
                <th>Interval from root</th>
                <th>Function</th>
              </tr>
            </thead>
            <tbody>
              {degrees.map((d) => (
                <tr key={d.degree}>
                  <td className="scale-degree-num">{d.degree}</td>
                  <td className="scale-degree-note">{d.note}</td>
                  <td className="scale-degree-interval">{d.interval}</td>
                  <td className="scale-degree-name">{d.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="scale-h2">In melody and improvisation</h2>
          <p>{context}</p>
        </section>

        <section>
          <h2 className="scale-h2">Relative key</h2>
          <p>The {name} scale shares its notes with <strong>{relativeKeyName}</strong>. Same seven pitches, different tonal centre — when a piece moves between them, no accidentals change.</p>
        </section>

        <section>
          <h2 className="scale-h2">Common mistakes</h2>
          <p>{commonMistakes}</p>
        </section>

        <section className="scale-trainer-cta">
          <h2 className="scale-h2">Drill it</h2>
          <p>The Interval Trainer gives you a root note and an interval, and asks you to name the result. Practising the intervals of the {name} scale is the fastest way to internalise it as a melodic shape rather than a memorised string of notes.</p>
          <Link to="/intervals" className="scale-cta scale-cta-big">Open the Interval Trainer →</Link>
          <Link to="/circle-of-fifths" className="scale-cta-secondary">Or drill key signatures</Link>
        </section>

        <section>
          <h2 className="scale-h2">Related</h2>
          <div className="scale-related-grid">
            {type === 'major' && keySlug && (
              <Link to={`/keys/${keySlug}`} className="scale-related-link">
                Key of {tonic} major
              </Link>
            )}
            <Link to="/intervals" className="scale-related-link">Interval Trainer</Link>
            <Link to="/circle-of-fifths" className="scale-related-link">Circle of Fifths</Link>
          </div>
        </section>

        <section>
          <h2 className="scale-h2">Frequently asked</h2>
          <dl className="scale-faq">
            {faq.map(({ q, a }, i) => (
              <React.Fragment key={i}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

      </main>

      <footer className="scale-footer">
        <Link to="/">← Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

const styles = `
  .scale-page-root {
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
  .scale-container { max-width: 760px; margin: 0 auto; }
  .scale-breadcrumb {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 1.25rem;
  }
  .scale-breadcrumb a { color: var(--ink-soft); text-decoration: none; }
  .scale-breadcrumb a:hover { color: var(--accent); }
  .scale-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: var(--ink-soft); margin: 0 0 0.5rem;
  }
  .scale-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.4rem, 6vw, 4rem);
    line-height: 1; margin: 0 0 1rem; color: var(--ink);
  }
  .scale-h2 {
    font-family: 'Italiana', serif;
    font-size: 1.6rem; margin: 2.5rem 0 0.75rem; color: var(--ink);
  }
  .scale-notes-line { font-size: 1.2rem; margin: 0 0 1.25rem; }
  .scale-notes-line strong {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500; color: var(--accent); letter-spacing: 0.1em;
  }
  .scale-cta {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--accent); text-decoration: none;
    border-bottom: 1px solid var(--accent); padding-bottom: 2px;
  }
  .scale-cta:hover { color: var(--ink); border-color: var(--ink); }
  .scale-cta-big {
    background: var(--ink); color: var(--paper);
    padding: 0.85rem 1.4rem; border: none; margin-right: 1rem;
  }
  .scale-cta-big:hover { background: var(--accent); color: var(--paper); }
  .scale-cta-secondary {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    color: var(--ink-soft); text-decoration: none;
    border-bottom: 1px dotted var(--ink-soft);
  }
  .scale-main { padding-top: 1rem; }
  .scale-intro { font-size: 1.15rem; }

  .scale-pattern {
    list-style: none; padding: 0; margin: 1rem 0 0.75rem;
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.4rem;
  }
  .scale-pattern li {
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    border-bottom: 3px solid var(--gold);
    padding: 0.6rem 0.4rem; text-align: center;
  }
  .scale-pattern li.is-half { border-bottom-color: var(--accent); }
  .scale-pattern-step {
    display: block;
    font-family: 'Italiana', serif; font-size: 1.4rem; color: var(--ink);
  }
  .scale-pattern-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .scale-pattern-note {
    font-style: italic; color: var(--ink-soft); font-size: 0.95rem;
    margin-top: 0.75rem;
  }

  .scale-degrees {
    width: 100%; border-collapse: collapse; margin-top: 0.5rem;
    font-size: 0.95rem;
  }
  .scale-degrees th, .scale-degrees td {
    text-align: left; padding: 0.55rem 0.75rem;
    border-bottom: 1px solid var(--paper-shadow);
  }
  .scale-degrees th {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--ink-soft); font-weight: 500;
    border-bottom-color: var(--ink-soft);
  }
  .scale-degree-num {
    font-family: 'Italiana', serif; font-size: 1.1rem; color: var(--accent);
    width: 70px;
  }
  .scale-degree-note {
    font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--ink);
  }
  .scale-degree-interval {
    font-family: 'JetBrains Mono', monospace; color: var(--accent);
  }
  .scale-degree-name { font-style: italic; color: var(--ink-soft); }

  .scale-trainer-cta {
    margin-top: 3rem; padding: 1.75rem;
    background: var(--paper-deep); border: 1px solid var(--ink);
    box-shadow: 6px 6px 0 var(--paper-shadow);
  }
  .scale-trainer-cta .scale-h2 { margin-top: 0; }

  .scale-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .scale-related-link {
    display: block; padding: 0.85rem 1rem;
    background: var(--paper-deep); border: 1px solid var(--ink-soft);
    text-decoration: none; color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase;
    text-align: center; transition: all 0.15s ease;
  }
  .scale-related-link:hover { background: var(--ink); color: var(--paper); }

  .scale-faq dt {
    font-family: 'Italiana', serif; font-size: 1.2rem; margin-top: 1.25rem; color: var(--ink);
  }
  .scale-faq dd { margin: 0.4rem 0 0; color: var(--ink-soft); }

  .scale-footer {
    max-width: 760px; margin: 4rem auto 0;
    padding-top: 2rem; border-top: 1px solid var(--paper-shadow);
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .scale-footer a { color: var(--ink-soft); text-decoration: none; }
  .scale-footer a:hover { color: var(--accent); }
`;
