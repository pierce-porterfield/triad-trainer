import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDailyPuzzle, getUtcDateString } from '../utils/dailyPuzzle';
import { loadState, hasPlayedToday } from '../utils/dailyState';
import { formatTime } from '../utils/bestTimes';
import { fetchDailyStats } from '../utils/leaderboard';
import { loadGauntletState, getGauntletRank } from '../utils/gauntletState';

export default function Landing() {
  const puzzle = getDailyPuzzle();
  const state = loadState();
  const playedToday = hasPlayedToday();
  const todayResult = playedToday ? state.lastResult : null;

  const gauntletState = loadGauntletState();
  const gauntletRank = getGauntletRank(gauntletState.totalRounds);

  // Global stats from the leaderboard endpoint. Failure is silent — the
  // counter just doesn't render.
  const [globalStats, setGlobalStats] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchDailyStats({ puzzleNumber: puzzle.number }).then((s) => {
      if (cancelled) return;
      setGlobalStats(s);
    });
    return () => { cancelled = true; };
  }, [puzzle.number]);
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
      margin-bottom: 0.4rem;
    }
    .daily-today-count {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--gold);
      font-size: 0.9rem;
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
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-style: normal;
      font-size: 1rem;
      color: #ffffff;
      letter-spacing: 0.05em;
      margin-left: 0.4rem;
      text-transform: none;
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

    /* Gauntlet — sits between the daily and the trainer grid. Quieter than
       the daily but the lifetime counter is the visual anchor: a big
       Italiana number in a featured slab on the left, with a tier label
       and progress bar so the user has a target to push toward. */
    .gauntlet-row { margin-bottom: 2rem; }
    .gauntlet-card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1.25rem;
      align-items: stretch;
      background: var(--paper);
      border: 1px solid var(--ink);
      box-shadow: 6px 6px 0 var(--paper-shadow);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      overflow: hidden;
      position: relative;
    }
    .gauntlet-card:hover {
      transform: translate(-2px, -2px);
      box-shadow: 9px 9px 0 var(--accent);
    }
    .gauntlet-card:hover .gauntlet-counter {
      background: var(--accent);
    }

    /* Big-number slab on the left */
    .gauntlet-counter {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 1rem 1.25rem;
      min-width: 110px;
      background: var(--ink);
      color: var(--paper);
      transition: background 0.15s ease;
    }
    .gauntlet-counter-num {
      font-family: 'Italiana', serif;
      font-size: clamp(3rem, 9vw, 4.5rem);
      line-height: 1;
      color: var(--gold);
      letter-spacing: -0.01em;
    }
    .gauntlet-counter-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--paper);
      opacity: 0.75;
      margin-top: 0.4rem;
    }

    .gauntlet-body {
      padding: 1rem 1.35rem 1.1rem 0;
      display: flex;
      flex-direction: column;
    }
    .gauntlet-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.35rem;
    }
    .gauntlet-title {
      font-family: 'Italiana', serif;
      font-size: 1.7rem;
      line-height: 1.05;
      margin-bottom: 0.5rem;
      color: var(--ink);
    }
    .gauntlet-title em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--accent);
    }
    .gauntlet-desc {
      font-family: 'Cormorant Garamond', serif;
      color: var(--ink-soft);
      font-size: 0.95rem;
      line-height: 1.4;
      margin-bottom: 0.85rem;
    }

    /* Tier + milestone progress */
    .gauntlet-rank {
      margin-bottom: 0.85rem;
    }
    .gauntlet-rank-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.35rem;
    }
    .gauntlet-rank-name {
      font-family: 'Italiana', serif;
      font-size: 1.05rem;
      color: var(--accent);
    }
    .gauntlet-rank-next {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }
    .gauntlet-rank-bar {
      height: 5px;
      background: var(--paper-shadow);
      overflow: hidden;
      position: relative;
    }
    .gauntlet-rank-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--gold), var(--accent));
      transition: width 0.4s ease;
    }

    .gauntlet-foot {
      display: flex;
      justify-content: flex-end;
      align-items: baseline;
      gap: 0.6rem;
      margin-top: auto;
    }
    .gauntlet-cta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
    }

    /* Tighten on small screens — counter slab shrinks rather than wraps. */
    @media (max-width: 480px) {
      .gauntlet-card { gap: 0.85rem; }
      .gauntlet-counter { padding: 0.85rem 0.75rem; min-width: 88px; }
      .gauntlet-body { padding-right: 1rem; }
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
              {globalStats?.today && (
                <div className="daily-today-count">
                  {globalStats.today.plays.toLocaleString()}{' '}
                  {globalStats.today.plays === 1 ? 'player has' : 'players have'} finished today
                </div>
              )}
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

        <div className="gauntlet-row">
          <Link to="/gauntlet" className="gauntlet-card">
            <div className="gauntlet-counter">
              <div className="gauntlet-counter-num">{gauntletState.totalRounds}</div>
              <div className="gauntlet-counter-label">
                {gauntletState.totalRounds === 1 ? 'round' : 'rounds'}
              </div>
            </div>

            <div className="gauntlet-body">
              <div className="gauntlet-eyebrow">— Practice gauntlet —</div>
              <div className="gauntlet-title">Run the <em>gauntlet</em></div>
              <div className="gauntlet-desc">
                Five-card rounds drilling one focused topic at a time —
                chord, interval, note, or key. New round each time.
              </div>

              <div className="gauntlet-rank">
                <div className="gauntlet-rank-row">
                  <span className="gauntlet-rank-name">{gauntletRank.name}</span>
                  {gauntletRank.next != null && (
                    <span className="gauntlet-rank-next">
                      {gauntletRank.toNext} more {gauntletRank.toNext === 1 ? 'round' : 'rounds'}
                    </span>
                  )}
                </div>
                <div className="gauntlet-rank-bar">
                  <div
                    className="gauntlet-rank-fill"
                    style={{ width: `${Math.round(gauntletRank.progress01 * 100)}%` }}
                  />
                </div>
              </div>

              <div className="gauntlet-foot">
                <span className="gauntlet-cta">Begin →</span>
              </div>
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

          <Link to="/notes" className="landing-card">
            <div className="landing-card-num">— Opus IV —</div>
            <div className="landing-card-title">
              Note <em>Trainer</em>
            </div>
            <div className="landing-card-desc">
              A single note shown on a music staff, piano keyboard, or guitar fretboard.
              Identify the letter and accidental — fret position and octave randomise per card.
            </div>
            <div className="landing-card-modes">
              I. Choose your displays<br />
              II. Display → name the note
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
