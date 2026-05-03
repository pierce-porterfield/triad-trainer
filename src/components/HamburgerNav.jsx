import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PUBLISHED_CHORD_SLUGS, slugToChord } from '../data/chordContent.js';
import { PUBLISHED_KEY_SLUGS, slugToKey } from '../data/keyContent.js';
import { PUBLISHED_SCALE_SLUGS, slugToScale } from '../data/scaleContent.js';
import { PUBLISHED_LEARN_SLUGS, getLearnTitle } from '../data/learnContent.js';

// Site-wide nav. Mounts in RootLayout so every prerendered page links to
// every other — kills orphan-page SEO penalties (seo-strategy.md "internal
// linking rules").
//
// Hidden inside trainer-locked sessions so the focused study mode stays clean;
// the End Study button is the escape hatch on those pages.
export default function HamburgerNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close on route change.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock background scroll while the panel is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) document.body.classList.add('nav-open');
    else document.body.classList.remove('nav-open');
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  const chordLinks = PUBLISHED_CHORD_SLUGS
    .map((slug) => ({ slug, meta: slugToChord(slug) }))
    .filter((x) => x.meta);
  const keyLinks = PUBLISHED_KEY_SLUGS
    .map((slug) => ({ slug, meta: slugToKey(slug) }))
    .filter((x) => x.meta);
  const scaleLinks = PUBLISHED_SCALE_SLUGS
    .map((slug) => ({ slug, meta: slugToScale(slug) }))
    .filter((x) => x.meta);
  const learnLinks = PUBLISHED_LEARN_SLUGS
    .map((slug) => ({ slug, title: getLearnTitle(slug) }));

  return (
    <>
      <style>{styles}</style>
      <button
        type="button"
        className={`hamburger-btn${open ? ' is-open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-nav-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="hamburger-bar" aria-hidden="true" />
        <span className="hamburger-bar" aria-hidden="true" />
        <span className="hamburger-bar" aria-hidden="true" />
      </button>

      <div
        className={`hamburger-backdrop${open ? ' is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="site-nav-panel"
        className={`hamburger-panel${open ? ' is-open' : ''}`}
        aria-label="Site"
        aria-hidden={!open}
      >
        <div className="nav-header">
          <span className="nav-eyebrow">— Music Theory Trainer —</span>
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">Practice</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/daily">Etudle <span className="nav-badge">daily</span></Link></li>
            <li><Link to="/gauntlet">Practice Gauntlet</Link></li>
            <li><Link to="/triads">Chord Trainer</Link></li>
            <li><Link to="/circle-of-fifths">Circle of Fifths</Link></li>
            <li><Link to="/intervals">Interval Trainer</Link></li>
            <li><Link to="/notes">Note Trainer</Link></li>
          </ul>
        </div>

        {learnLinks.length > 0 && (
          <div className="nav-section">
            <Link to="/learn" className="nav-section-title-link">
              <h3 className="nav-section-title">Guides <span className="nav-section-arrow">→</span></h3>
            </Link>
            <ul>
              {learnLinks.map(({ slug, title }) => (
                <li key={slug}>
                  <Link to={`/learn/${slug}`}>{title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {keyLinks.length > 0 && (
          <div className="nav-section">
            <Link to="/keys" className="nav-section-title-link">
              <h3 className="nav-section-title">Key library <span className="nav-section-arrow">→</span></h3>
            </Link>
            <ul>
              {keyLinks.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link to={`/keys/${slug}`}>{meta.tonic} major</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {scaleLinks.length > 0 && (
          <div className="nav-section">
            <Link to="/scales" className="nav-section-title-link">
              <h3 className="nav-section-title">Scale library <span className="nav-section-arrow">→</span></h3>
            </Link>
            <ul>
              {scaleLinks.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link to={`/scales/${slug}`}>
                    {meta.tonic} {meta.type === 'major' ? 'major' : 'minor'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {chordLinks.length > 0 && (
          <div className="nav-section">
            <Link to="/chords" className="nav-section-title-link">
              <h3 className="nav-section-title">Chord library <span className="nav-section-arrow">→</span></h3>
            </Link>
            <ul>
              {chordLinks.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link to={`/chords/${slug}`}>{meta.displayName} chord</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="nav-section">
          <h3 className="nav-section-title">Site</h3>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
          </ul>
        </div>

        <div className="nav-footer">
          Created by Pierce Porterfield
        </div>
      </nav>
    </>
  );
}

const styles = `
  .hamburger-btn {
    position: fixed;
    top: calc(env(safe-area-inset-top) + 0.85rem);
    right: 0.85rem;
    z-index: 1001;
    width: 44px;
    height: 44px;
    background: var(--paper, #f4ecdc);
    border: 1px solid var(--ink, #1a1410);
    box-shadow: 3px 3px 0 var(--paper-shadow, #d9cbad);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding: 0;
    transition: box-shadow 0.15s ease, transform 0.15s ease;
  }
  .hamburger-btn:hover {
    box-shadow: 5px 5px 0 var(--paper-shadow, #d9cbad);
    transform: translate(-1px, -1px);
  }
  .hamburger-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--paper-shadow, #d9cbad); }
  .hamburger-bar {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--ink, #1a1410);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .hamburger-btn.is-open .hamburger-bar:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .hamburger-btn.is-open .hamburger-bar:nth-child(2) {
    opacity: 0;
  }
  .hamburger-btn.is-open .hamburger-bar:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  .hamburger-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(26, 20, 16, 0.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 999;
  }
  .hamburger-backdrop.is-open {
    opacity: 1;
    pointer-events: auto;
  }

  .hamburger-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(86vw, 340px);
    background: var(--paper, #f4ecdc);
    border-left: 1px solid var(--ink, #1a1410);
    box-shadow: -8px 0 0 var(--paper-shadow, #d9cbad);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.28s ease;
    overflow-y: auto;
    padding: 4.5rem 1.6rem 2rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: var(--ink, #1a1410);
  }
  .hamburger-panel.is-open { transform: translateX(0); }

  .nav-header { margin-bottom: 1.5rem; }
  .nav-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--ink-soft, #3d342b);
  }
  .nav-section { margin-bottom: 1.75rem; }
  .nav-section-title {
    font-family: 'Italiana', serif;
    font-size: 1.15rem;
    margin: 0 0 0.5rem;
    font-weight: 400;
    color: var(--accent, #8b2c20);
    border-bottom: 1px dotted var(--ink-soft, #3d342b);
    padding-bottom: 0.35rem;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  /* Section-title-as-link wrapper. Visually identical to a non-link
     section title; the small arrow on the right hints at navigability. */
  .nav-section-title-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .nav-section-title-link:hover .nav-section-title {
    color: var(--ink, #1a1410);
  }
  .nav-section-arrow {
    font-family: 'Italiana', serif;
    font-size: 1rem;
    color: var(--ink-soft, #3d342b);
    opacity: 0.6;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .nav-section-title-link:hover .nav-section-arrow {
    opacity: 1;
    transform: translateX(2px);
  }
  .nav-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .nav-section li { margin: 0; }
  .nav-section a {
    display: block;
    padding: 0.55rem 0.25rem;
    color: var(--ink, #1a1410);
    text-decoration: none;
    font-size: 1.1rem;
    border-bottom: 1px solid transparent;
    transition: color 0.12s ease, padding-left 0.12s ease;
  }
  .nav-section a:hover {
    color: var(--accent, #8b2c20);
    padding-left: 0.6rem;
  }
  .nav-badge {
    display: inline-block;
    margin-left: 0.4rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold, #a88734);
    background: var(--paper-deep, #ebe0c9);
    padding: 0.15rem 0.4rem;
    border: 1px solid var(--gold, #a88734);
    vertical-align: 2px;
  }

  .nav-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--paper-shadow, #d9cbad);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft, #3d342b);
    opacity: 0.7;
  }

  /* Hide nav while a trainer locks the page for a focused session. */
  body.trainer-locked .hamburger-btn,
  body.trainer-locked .hamburger-backdrop,
  body.trainer-locked .hamburger-panel { display: none; }

  body.nav-open { overflow: hidden; }
`;
