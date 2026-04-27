import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getStaticPage } from '../data/staticContent.js';

// Renders a top-level static page (Privacy, About, etc.) using the same
// block shape as the learn articles. Standalone styles, lighter than
// LearnPage's article styling — these are utility pages, not essays.
export default function StaticPage({ slug }) {
  const data = getStaticPage(slug);
  if (!data) {
    return (
      <div className="static-page-root">
        <Head>
          <title>Page not found — Music Theory Trainer</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="static-container">
          <h1 className="static-h1">Page not found</h1>
          <p><Link to="/">Back to Music Theory Trainer →</Link></p>
        </div>
      </div>
    );
  }

  const { title, description, blocks } = data;
  const canonical = `https://theory-trainer.com/${slug}`;

  return (
    <div className="static-page-root">
      <Head>
        <title>{`${title} | Music Theory Trainer`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
      </Head>

      <style>{styles}</style>

      <header className="static-header">
        <div className="static-container">
          <Link to="/" className="static-back">← Music Theory Trainer</Link>
          <h1 className="static-h1">{title}</h1>
        </div>
      </header>

      <main className="static-container static-main">
        {blocks.map((block, i) => <Block key={i} block={block} />)}
      </main>

      <footer className="static-footer">
        <Link to="/">← Back to Music Theory Trainer</Link>
        <span>Created by Pierce Porterfield</span>
      </footer>
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case 'p':       return <p>{block.text}</p>;
    case 'h2':      return <h2 className="static-h2">{block.text}</h2>;
    case 'h3':      return <h3 className="static-h3">{block.text}</h3>;
    case 'ul':      return <ul className="static-list">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
    case 'ol':      return <ol className="static-list">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ol>;
    case 'callout': return <aside className="static-callout">{block.text}</aside>;
    case 'related': return (
      <div className="static-related">
        {block.items.map(({ label, to }, i) => (
          <Link key={i} to={to} className="static-related-link">{label}</Link>
        ))}
      </div>
    );
    default: return null;
  }
}

const styles = `
  .static-page-root {
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
    line-height: 1.6;
    font-size: 1.05rem;
  }
  .static-container { max-width: 720px; margin: 0 auto; }
  .static-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft); text-decoration: none;
    display: inline-block; margin-bottom: 1.25rem;
  }
  .static-back:hover { color: var(--accent); }
  .static-h1 {
    font-family: 'Italiana', serif;
    font-size: clamp(2.2rem, 5.5vw, 3.2rem);
    line-height: 1.05; margin: 0 0 1.25rem; color: var(--ink);
  }
  .static-h2 {
    font-family: 'Italiana', serif;
    font-size: 1.55rem; margin: 2rem 0 0.5rem; color: var(--ink);
  }
  .static-h3 {
    font-family: 'Italiana', serif;
    font-size: 1.2rem; margin: 1.4rem 0 0.25rem;
    color: var(--accent); font-weight: 400;
  }
  .static-main p { margin: 0 0 1rem; }
  .static-list { margin: 0.25rem 0 1.25rem 1.25rem; padding: 0; }
  .static-list li { margin-bottom: 0.4rem; }
  .static-callout {
    background: var(--paper-deep);
    border-left: 4px solid var(--gold);
    padding: 0.9rem 1.15rem;
    margin: 1.25rem 0;
    font-style: italic;
    color: var(--ink-soft);
  }
  .static-related {
    display: flex; flex-wrap: wrap; gap: 0.6rem;
    margin: 1.25rem 0;
    padding: 1rem 0;
    border-top: 1px dotted var(--ink-soft);
    border-bottom: 1px dotted var(--ink-soft);
  }
  .static-related-link {
    display: inline-block; padding: 0.5rem 0.9rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    text-decoration: none; color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
  }
  .static-related-link:hover { background: var(--ink); color: var(--paper); }
  .static-footer {
    max-width: 720px; margin: 4rem auto 0;
    padding-top: 2rem; border-top: 1px solid var(--paper-shadow);
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .static-footer a { color: var(--ink-soft); text-decoration: none; }
  .static-footer a:hover { color: var(--accent); }
`;
