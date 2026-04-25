import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

    .landing-root {
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
      background-image:
        radial-gradient(ellipse at top left, rgba(168, 135, 52, 0.08), transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(139, 44, 32, 0.06), transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 20, 16, 0.012) 2px, rgba(26, 20, 16, 0.012) 3px);
      min-height: 100vh;
      padding: 1.5rem 1rem;
      position: relative;
      overflow-x: hidden;
    }
    .landing-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
      opacity: 0.12;
      pointer-events: none;
      mix-blend-mode: multiply;
    }
    .landing-container {
      max-width: 760px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .landing-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .landing-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.75rem;
    }
    .landing-title {
      font-family: 'Italiana', serif;
      font-size: clamp(2.25rem, 6vw, 3.75rem);
      font-weight: 400;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: var(--ink);
      margin: 0;
    }
    .landing-title em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--accent);
    }
    .landing-rule {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: center;
      margin: 1.25rem auto;
      color: var(--ink-soft);
    }
    .landing-rule::before, .landing-rule::after {
      content: '';
      height: 1px;
      background: var(--ink-soft);
      flex: 1;
      max-width: 100px;
      opacity: 0.4;
    }
    .landing-rule-mark {
      font-family: 'Italiana', serif;
      font-size: 1.5rem;
    }
    .landing-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 1.2rem;
      color: var(--ink-soft);
      margin-top: 0.5rem;
    }

    .landing-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 720px) {
      .landing-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 1080px) {
      .landing-grid { grid-template-columns: repeat(3, 1fr); }
    }

    .landing-card {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 2rem 1.75rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      position: relative;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      min-height: 280px;
    }
    .landing-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: 11px 11px 0 var(--accent);
    }
    .landing-card::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.25;
      pointer-events: none;
    }
    .landing-card-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1rem;
    }
    .landing-card-title {
      font-family: 'Italiana', serif;
      font-size: 2rem;
      line-height: 1.05;
      margin-bottom: 0.5rem;
    }
    .landing-card-title em {
      font-style: italic;
      color: var(--accent);
      font-family: 'Cormorant Garamond', serif;
    }
    .landing-card-desc {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 1.05rem;
      color: var(--ink-soft);
      line-height: 1.45;
      margin-bottom: 1.25rem;
      flex: 1;
    }
    .landing-card-modes {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink-soft);
      line-height: 1.8;
      margin-bottom: 1.25rem;
    }
    .landing-card-cta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      padding-top: 1rem;
      border-top: 1px dotted var(--ink-soft);
    }
    .landing-card-arrow {
      font-family: 'Italiana', serif;
      font-size: 1.6rem;
      letter-spacing: normal;
    }

    .landing-footer {
      text-align: center;
      margin-top: 3rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      opacity: 0.5;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .landing-fade-in {
      animation: fadeIn 0.4s ease forwards;
    }
  `;

  return (
    <div className="landing-root">
      <style>{css}</style>
      <div className="landing-container landing-fade-in">

        <header className="landing-header">
          <h1 className="landing-title">
            Music <em>Theory</em>
            <br />Trainer
          </h1>
          <div className="landing-rule"><span className="landing-rule-mark">❦</span></div>
          <div className="landing-subtitle">Studies for the daily practice</div>
        </header>

        <div className="landing-grid">

          <Link to="/triads" className="landing-card">
            <div className="landing-card-num">— Opus I —</div>
            <div className="landing-card-title">
              Triad <em>Trainer</em>
            </div>
            <div className="landing-card-desc">
              Triads and extended chords across every root — major, minor, diminished,
              augmented, plus optional 7ths, 9ths, and 13ths. Spell the chord on a staff
              or by typing, or name it from its notes.
            </div>
            <div className="landing-card-modes">
              I. Chord → notes<br />
              II. Notes → chord
            </div>
            <div className="landing-card-cta">
              <span>Begin</span>
              <span className="landing-card-arrow">→</span>
            </div>
          </Link>

          <Link to="/circle-of-fifths" className="landing-card">
            <div className="landing-card-num">— Opus II —</div>
            <div className="landing-card-title">
              Circle of <em>Fifths</em>
            </div>
            <div className="landing-card-desc">
              Every key signature around the circle, major and minor. Mark the sharps
              and flats, or read the scale and name the key.
            </div>
            <div className="landing-card-modes">
              I. Key → sharps &amp; flats<br />
              II. Scale → name the key
            </div>
            <div className="landing-card-cta">
              <span>Begin</span>
              <span className="landing-card-arrow">→</span>
            </div>
          </Link>

          <Link to="/intervals" className="landing-card">
            <div className="landing-card-num">— Opus III —</div>
            <div className="landing-card-title">
              Interval <em>Trainer</em>
            </div>
            <div className="landing-card-desc">
              2nds through 7ths plus the 4th, tritone, and 5th. Toggle which intervals
              to study, then name the note that lies above each root.
            </div>
            <div className="landing-card-modes">
              I. Toggle any subset<br />
              II. Root + interval → note
            </div>
            <div className="landing-card-cta">
              <span>Begin</span>
              <span className="landing-card-arrow">→</span>
            </div>
          </Link>

        </div>

        <div className="landing-footer">Created by Pierce Porterfield</div>
      </div>
    </div>
  );
}
