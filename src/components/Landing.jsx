import React from 'react';
import { Link } from 'react-router-dom';
import { getDailyPuzzle, getUtcDateString } from '../utils/dailyPuzzle';
import { loadState, hasPlayedToday } from '../utils/dailyState';
import { formatTime } from '../utils/bestTimes';

export default function Landing() {
  const puzzle = getDailyPuzzle();
  const state = loadState();
  const playedToday = hasPlayedToday();
  const todayResult = playedToday ? state.lastResult : null;
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

    /* Daily card — sits in its own row above the trainer grid */
    .daily-row {
      margin-bottom: 2rem;
    }
    .daily-card {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      background: linear-gradient(135deg, #1a1410 0%, #2b1f17 100%);
      border: 2px solid var(--gold);
      padding: 1.75rem 1.5rem;
      box-shadow:
        10px 10px 0 var(--gold),
        0 0 0 5px var(--paper) inset;
      position: relative;
      text-decoration: none;
      color: var(--paper);
      transition: all 0.25s ease;
      overflow: hidden;
    }
    .daily-card:hover {
      transform: translate(-4px, -4px);
      box-shadow:
        14px 14px 0 var(--accent),
        0 0 0 5px var(--paper) inset;
    }
    .daily-card::before {
      content: '\u{1D11E}';
      position: absolute;
      top: -1.5rem;
      right: -0.5rem;
      font-family: 'Times New Roman', serif;
      font-size: 14rem;
      color: var(--gold);
      opacity: 0.08;
      pointer-events: none;
      line-height: 1;
    }
    .daily-card::after {
      content: '';
      position: absolute;
      inset: 12px;
      border: 1px solid var(--gold);
      opacity: 0.4;
      pointer-events: none;
    }
    @media (min-width: 720px) {
      .daily-card {
        grid-template-columns: 1fr auto;
        align-items: center;
        padding: 2rem 2.5rem;
      }
    }
    .daily-body { position: relative; z-index: 1; }
    .daily-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 0.5rem;
    }
    .daily-title {
      font-family: 'Italiana', serif;
      font-size: clamp(2.25rem, 6.5vw, 3.75rem);
      line-height: 0.95;
      margin: 0 0 0.6rem;
      color: var(--paper);
    }
    .daily-title em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--gold);
    }
    .daily-desc {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--paper);
      font-size: 1.1rem;
      line-height: 1.4;
      opacity: 0.85;
      margin-bottom: 0.85rem;
      max-width: 38ch;
    }
    .daily-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--paper);
      opacity: 0.6;
      margin-bottom: 0.85rem;
    }
    .daily-stats {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--paper);
      opacity: 0.7;
    }
    .daily-stats strong {
      font-family: 'Italiana', serif;
      font-weight: 400;
      font-style: normal;
      font-size: 1.2rem;
      color: var(--gold);
      letter-spacing: 0.05em;
      margin-left: 0.4rem;
    }
    .daily-cta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--gold);
      padding-top: 1rem;
      border-top: 1px dotted var(--gold);
      position: relative;
      z-index: 1;
    }
    @media (min-width: 720px) {
      .daily-cta {
        border-top: none;
        padding-top: 0;
        border-left: 1px dotted var(--gold);
        padding-left: 2rem;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
      }
    }
    .daily-cta-arrow {
      font-family: 'Italiana', serif;
      font-size: 2rem;
      letter-spacing: normal;
      color: var(--gold);
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

        <div className="daily-row">
          <Link to="/daily" className="daily-card">
            <div className="daily-body">
              <div className="daily-eyebrow">— Today's training · #{String(puzzle.number).padStart(3, '0')} —</div>
              <h2 className="daily-title">
                Etu<em>dle</em>
              </h2>
              <div className="daily-desc">
                Three rounds, fifteen flashcards, one shot per day. Same training
                worldwide — race the clock and build your streak.
              </div>
              <div className="daily-meta">
                {puzzle.date} · 3 rounds · 15 cards
              </div>
              <div className="daily-stats">
                {state.currentStreak > 0 && (
                  <span>Streak <strong>🔥 {state.currentStreak}</strong></span>
                )}
                {state.bestTime != null && (
                  <span>Best <strong>{formatTime(state.bestTime * 1000)}</strong></span>
                )}
                {todayResult && (
                  <span>Today <strong>{formatTime(todayResult.time * 1000)}</strong></span>
                )}
              </div>
            </div>
            <div className="daily-cta">
              <span>{playedToday ? 'See result' : 'Begin'}</span>
              <span className="daily-cta-arrow">→</span>
            </div>
          </Link>
        </div>

        <div className="landing-grid">

          <Link to="/triads" className="landing-card">
            <div className="landing-card-num">— Opus I —</div>
            <div className="landing-card-title">
              Chord <em>Trainer</em>
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
