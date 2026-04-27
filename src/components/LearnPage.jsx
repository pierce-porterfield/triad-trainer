import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getLearnPageContent } from '../data/learnContent.js';
import CircleOfFifthsDiagram from './CircleOfFifthsDiagram.jsx';

// Named diagrams that learn articles can embed via { type: 'diagram', name: '...' }.
const DIAGRAMS = {
  'circle-of-fifths': CircleOfFifthsDiagram,
};

// Long-form essay article. Each entry in learnContent.js stores its body as
// an ordered array of typed blocks; this component renders them.
export default function LearnPage({ slug }) {
  const data = getLearnPageContent(slug);

  if (!data) {
    return (
      <div className="learn-page-root">
        <Head>
          <title>Article not found — Music Theory Trainer</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="learn-container">
          <p className="learn-eyebrow">Not found</p>
          <h1 className="learn-h1">Article not yet published</h1>
          <p>This page hasn't been written yet. <Link to="/">Back home</Link>.</p>
        </div>
      </div>
    );
  }

  const { title, description, blocks, faq } = data;
  const canonical = `https://theory-trainer.com/learn/${slug}`;

  // JSON-LD: Article + FAQPage.
  //
  // datePublished comes from the entry's publishAt. dateModified defaults to
  // publishAt unless an explicit updatedAt is set on the entry — that way
  // editing an article later can advance dateModified to today (signals
  // "maintained" to Google, helps E-E-A-T) without invalidating the original
  // publish date.
  const datePublished = data.publishAt;
  const dateModified  = data.updatedAt || data.publishAt;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Person', name: 'Pierce Porterfield' },
    publisher: { '@type': 'Organization', name: 'Music Theory Trainer' },
    datePublished,
    dateModified,
  };
  const faqLd = faq && faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  return (
    <div className="learn-page-root">
      <Head>
        <title>{`${title} | Music Theory Trainer`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Head>

      <style>{styles}</style>

      <header className="learn-header">
        <div className="learn-container">
          <nav className="learn-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Music Theory Trainer</Link>
            <span aria-hidden="true"> / </span>
            <span>Learn</span>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{title}</span>
          </nav>
          <p className="learn-eyebrow">— Guide —</p>
          <h1 className="learn-h1">{title}</h1>
        </div>
      </header>

      <main className="learn-container learn-main">
        {blocks.map((block, i) => <Block key={i} block={block} />)}

        {faq && faq.length > 0 && (
          <section>
            <h2 className="learn-h2">Frequently asked</h2>
            <dl className="learn-faq">
              {faq.map(({ q, a }, i) => (
                <React.Fragment key={i}>
                  <dt>{q}</dt>
                  <dd>{a}</dd>
                </React.Fragment>
              ))}
            </dl>
          </section>
        )}
      </main>

      <footer className="learn-footer">
        <Link to="/">← Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>;
    case 'h2':
      return <h2 className="learn-h2">{block.text}</h2>;
    case 'h3':
      return <h3 className="learn-h3">{block.text}</h3>;
    case 'ul':
      return <ul className="learn-list">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
    case 'ol':
      return <ol className="learn-list">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ol>;
    case 'callout':
      return <aside className="learn-callout">{block.text}</aside>;
    case 'related':
      return (
        <div className="learn-related">
          {block.items.map(({ label, to }, i) => (
            <Link key={i} to={to} className="learn-related-link">{label}</Link>
          ))}
        </div>
      );
    case 'diagram': {
      const Diagram = DIAGRAMS[block.name];
      return Diagram ? <Diagram /> : null;
    }
    case 'video': {
      // YouTube embed. Lazy-loads so it doesn't block first paint.
      const src = `https://www.youtube-nocookie.com/embed/${block.id}`;
      return (
        <figure className="learn-video">
          <div className="learn-video-frame">
            <iframe
              src={src}
              title={block.title || 'Embedded video'}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
    default:
      return null;
  }
}

const styles = `
  .learn-page-root {
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
    line-height: 1.65;
    font-size: 1.075rem;
  }
  .learn-container { max-width: 720px; margin: 0 auto; }
  .learn-breadcrumb {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 1.25rem;
  }
  .learn-breadcrumb a { color: var(--ink-soft); text-decoration: none; }
  .learn-breadcrumb a:hover { color: var(--accent); }
  .learn-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: var(--ink-soft); margin: 0 0 0.5rem;
  }
  .learn-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    line-height: 1.05; margin: 0 0 1.5rem; color: var(--ink);
  }
  .learn-h2 {
    font-family: 'Italiana', serif;
    font-size: 1.7rem; margin: 2.25rem 0 0.5rem; color: var(--ink);
  }
  .learn-h3 {
    font-family: 'Italiana', serif;
    font-size: 1.25rem; margin: 1.5rem 0 0.25rem; color: var(--accent);
    font-weight: 400;
  }
  .learn-main p { margin: 0 0 1rem; }
  .learn-list {
    margin: 0.25rem 0 1.25rem 1.25rem; padding: 0;
  }
  .learn-list li { margin-bottom: 0.4rem; }
  .learn-callout {
    background: var(--paper-deep);
    border-left: 4px solid var(--gold);
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: var(--ink-soft);
  }
  .learn-related {
    display: flex; flex-wrap: wrap; gap: 0.6rem;
    margin: 1rem 0 1.5rem;
    padding: 1rem 0;
    border-top: 1px dotted var(--ink-soft);
    border-bottom: 1px dotted var(--ink-soft);
  }
  .learn-related-link {
    display: inline-block; padding: 0.55rem 0.9rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    text-decoration: none; color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
    transition: all 0.15s ease;
  }
  .learn-related-link:hover { background: var(--ink); color: var(--paper); }
  .learn-faq dt {
    font-family: 'Italiana', serif; font-size: 1.2rem;
    margin-top: 1.25rem; color: var(--ink);
  }
  .learn-faq dd { margin: 0.4rem 0 0; color: var(--ink-soft); }
  .learn-video { margin: 1.5rem 0 2rem; }
  .learn-video-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #1a1410;
    border: 1px solid var(--ink);
    box-shadow: 6px 6px 0 var(--paper-shadow);
    overflow: hidden;
  }
  .learn-video-frame iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .learn-video figcaption {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 0.95rem;
    text-align: center;
    margin-top: 0.75rem;
  }
  .learn-footer {
    max-width: 720px; margin: 4rem auto 0;
    padding-top: 2rem; border-top: 1px solid var(--paper-shadow);
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .learn-footer a { color: var(--ink-soft); text-decoration: none; }
  .learn-footer a:hover { color: var(--accent); }
`;
