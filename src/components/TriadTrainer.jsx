import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// TRIAD DATA
// All 12 roots × 4 qualities = 48 triads
// ============================================================================
// Roots — using spellings that give reasonable, readable triads.
// (We avoid theoretical roots like G# or D# major which would require double-sharps.)
const ROOTS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const QUALITIES = {
  maj:  { label: 'major',      symbol: '',    intervals: [0, 4, 7] },
  min:  { label: 'minor',      symbol: 'm',   intervals: [0, 3, 7] },
  dim:  { label: 'diminished', symbol: '°',   intervals: [0, 3, 6] },
  aug:  { label: 'augmented',  symbol: '+',   intervals: [0, 4, 8] },
};

// Letter names in order — used to spell triads as stacked thirds.
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Base semitone value for each letter (natural, no accidental)
const LETTER_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Parse a note like "F#" or "Bb" into { letter, semitone }
const parseNote = (n) => {
  const letter = n[0];
  const accidental = n.slice(1);
  let offset = 0;
  for (const ch of accidental) {
    if (ch === '#' || ch === '♯') offset += 1;
    else if (ch === 'b' || ch === '♭') offset -= 1;
  }
  return {
    letter,
    semitone: (LETTER_SEMITONES[letter] + offset + 120) % 12,
  };
};

// Given a target letter and a target semitone, produce the correct spelling
// (may use ##, bb for theoretical triads, though we avoid roots that need it)
const spellForLetter = (letter, targetSemitone) => {
  const natural = LETTER_SEMITONES[letter];
  let diff = ((targetSemitone - natural) % 12 + 12) % 12;
  // interpret as -2..+2 (bb, b, natural, #, ##)
  if (diff > 6) diff -= 12;
  if (diff === 0) return letter;
  if (diff === 1) return letter + '#';
  if (diff === 2) return letter + '##';
  if (diff === -1) return letter + 'b';
  if (diff === -2) return letter + 'bb';
  return letter;
};

// Build a triad as stacked thirds: root, 3rd (skip one letter), 5th (skip another)
const buildTriad = (root, quality) => {
  const { letter: rootLetter, semitone: rootSemi } = parseNote(root);
  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  const thirdLetter = LETTERS[(rootLetterIdx + 2) % 7];
  const fifthLetter = LETTERS[(rootLetterIdx + 4) % 7];
  const intervals = QUALITIES[quality].intervals;
  const thirdSemi = (rootSemi + intervals[1]) % 12;
  const fifthSemi = (rootSemi + intervals[2]) % 12;
  return [
    root, // preserve original root spelling exactly
    spellForLetter(thirdLetter, thirdSemi),
    spellForLetter(fifthLetter, fifthSemi),
  ];
};

const buildDeck = () => {
  const deck = [];
  ROOTS.forEach((root) => {
    Object.entries(QUALITIES).forEach(([qKey, q]) => {
      const notes = buildTriad(root, qKey);
      // Skip theoretical chords that would require double accidentals
      const hasDouble = notes.some((n) => n.includes('##') || n.includes('bb'));
      if (hasDouble) return;
      const chordName = `${root}${q.symbol}`;
      deck.push({
        id: `${root}-${qKey}`,
        chordName,
        root,
        quality: qKey,
        qualityLabel: q.label,
        notes,
      });
    });
  });
  return deck;
};

// Scale-step semitone offsets from the root
// Major scale: W-W-H-W-W-W-H  →  0, 2, 4, 5, 7, 9, 11
// Natural minor: W-H-W-W-H-W-W →  0, 2, 3, 5, 7, 8, 10
const SCALE_INTERVALS = {
  maj: { 2: 2, 6: 9 },  // major 2nd, major 6th
  min: { 2: 2, 6: 8 },  // major 2nd, minor 6th (natural minor)
};

// Given a chord and a scale degree (2 or 6), return the correctly spelled note.
// Letter name comes from counting up the 7-letter cycle; accidental is chosen
// to hit the correct semitone.
const intervalForChord = (card, degree) => {
  const { letter: rootLetter, semitone: rootSemi } = parseNote(card.root);
  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  const targetLetter = LETTERS[(rootLetterIdx + (degree - 1)) % 7];
  const offset = SCALE_INTERVALS[card.quality][degree];
  const targetSemi = (rootSemi + offset) % 12;
  return spellForLetter(targetLetter, targetSemi);
};

// Build a deck for 2nds or 6ths mode. Only major and minor chords are used —
// diminished and augmented don't have a canonical "scale" for this exercise.
const buildIntervalDeck = (degree) => {
  const full = buildDeck();
  return full
    .filter((c) => c.quality === 'maj' || c.quality === 'min')
    .map((c) => {
      const note = intervalForChord(c, degree);
      // Skip anything that would need a double accidental (shouldn't happen
      // for 2nds/6ths with our root set, but be safe)
      if (note.includes('##') || note.includes('bb')) return null;
      return { ...c, intervalNote: note, intervalDegree: degree };
    })
    .filter(Boolean);
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Normalize a user-entered note to compare (handles #, b, case, enharmonics)
const normalizeNote = (n) => {
  if (!n) return '';
  const clean = n.trim().replace(/\s+/g, '');
  if (!clean) return '';
  const letter = clean[0].toUpperCase();
  const accidental = clean.slice(1).toLowerCase().replace('♯', '#').replace('♭', 'b');
  const note = letter + accidental;
  const ENHARMONIC = {
    'C': 0, 'B#': 0, 'Dbb': 0,
    'C#': 1, 'Db': 1,
    'D': 2, 'Cx': 2, 'Ebb': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'F': 5, 'E#': 5, 'Gbb': 5,
    'F#': 6, 'Gb': 6,
    'G': 7, 'Fx': 7, 'Abb': 7,
    'G#': 8, 'Ab': 8,
    'A': 9, 'Gx': 9, 'Bbb': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11,
  };
  return ENHARMONIC[note] !== undefined ? ENHARMONIC[note] : note;
};

const notesMatch = (userNotes, correctNotes) => {
  const u = userNotes.map(normalizeNote).filter((x) => x !== '').sort();
  const c = correctNotes.map(normalizeNote).sort();
  if (u.length !== c.length) return false;
  return u.every((v, i) => v === c[i]);
};

const chordNameMatch = (user, correct) => {
  const norm = (s) => s.trim().toLowerCase()
    .replace(/\s+/g, '')
    .replace('♯', '#').replace('♭', 'b')
    .replace('maj', '').replace('major', '')
    .replace('minor', 'm').replace('min', 'm').replace('−', 'm').replace('-', 'm')
    .replace('diminished', '°').replace('dim', '°').replace('o', '°')
    .replace('augmented', '+').replace('aug', '+');
  return norm(user) === norm(correct);
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function TriadTrainer() {
  const fullDeck = useMemo(() => buildDeck(), []);
  const secondsDeck = useMemo(() => buildIntervalDeck(2), []);
  const sixthsDeck = useMemo(() => buildIntervalDeck(6), []);
  const [mode, setMode] = useState('menu'); // menu, playing, finished
  const [direction, setDirection] = useState('chord-to-notes');
  // directions: 'chord-to-notes', 'notes-to-chord', 'interval-2', 'interval-6'
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({ n1: '', n2: '', n3: '', chord: '', interval: '' });
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [flipped, setFlipped] = useState(false);

  const startGame = (dir) => {
    setDirection(dir);
    let chosenDeck;
    if (dir === 'interval-2') chosenDeck = secondsDeck;
    else if (dir === 'interval-6') chosenDeck = sixthsDeck;
    else chosenDeck = fullDeck;
    setDeck(shuffle(chosenDeck));
    setIdx(0);
    setResults([]);
    setAnswers({ n1: '', n2: '', n3: '', chord: '', interval: '' });
    setFeedback(null);
    setFlipped(false);
    setMode('playing');
  };

  const current = deck[idx];

  const handleSubmit = () => {
    if (feedback) return;
    let isCorrect = false;
    let userAnswer = '';
    if (direction === 'chord-to-notes') {
      const userNotes = [answers.n1, answers.n2, answers.n3];
      userAnswer = userNotes.filter(Boolean).join(' – ') || '(blank)';
      isCorrect = notesMatch(userNotes, current.notes);
    } else if (direction === 'notes-to-chord') {
      userAnswer = answers.chord || '(blank)';
      isCorrect = chordNameMatch(answers.chord, current.chordName);
    } else {
      // interval-2 or interval-6: single-note answer against card.intervalNote
      userAnswer = answers.interval || '(blank)';
      isCorrect = notesMatch([answers.interval], [current.intervalNote]);
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setFlipped(true);
    setResults((r) => [...r, { card: current, correct: isCorrect, userAnswer }]);
  };

  const handleNext = () => {
    if (idx + 1 >= deck.length) {
      setMode('finished');
    } else {
      setIdx(idx + 1);
      setAnswers({ n1: '', n2: '', n3: '', chord: '', interval: '' });
      setFeedback(null);
      setFlipped(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (mode !== 'playing') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (feedback) handleNext();
        else handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, feedback, answers, idx]);

  const score = results.filter((r) => r.correct).length;
  const scorePercent = results.length ? Math.round((score / results.length) * 100) : 0;

  // ============================================================================
  // STYLES — editorial / music conservatory aesthetic
  // ============================================================================
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

    .tt-root {
      --ink: #1a1410;
      --ink-soft: #3d342b;
      --paper: #f4ecdc;
      --paper-deep: #ebe0c9;
      --paper-shadow: #d9cbad;
      --accent: #8b2c20;
      --accent-deep: #5e1d14;
      --correct: #3d5a3a;
      --wrong: #8b2c20;
      --gold: #a88734;
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: var(--ink);
      background: var(--paper);
      background-image:
        radial-gradient(ellipse at top left, rgba(168, 135, 52, 0.08), transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(139, 44, 32, 0.06), transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 20, 16, 0.012) 2px, rgba(26, 20, 16, 0.012) 3px);
      min-height: 100vh;
      padding: 2rem 1rem;
      position: relative;
      overflow-x: hidden;
    }
    .tt-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
      opacity: 0.12;
      pointer-events: none;
      mix-blend-mode: multiply;
    }
    .tt-container {
      max-width: 760px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .tt-back {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      text-decoration: none;
      margin-bottom: 1.5rem;
      padding: 0.5rem 0.75rem 0.5rem 0;
      transition: color 0.15s ease;
    }
    .tt-back:hover {
      color: var(--accent);
    }
    .tt-back-arrow {
      font-family: 'Italiana', serif;
      font-size: 1.1rem;
      letter-spacing: normal;
      margin-right: 0.5rem;
    }
    .tt-header {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .tt-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.5rem;
    }
    .tt-title {
      font-family: 'Italiana', serif;
      font-size: clamp(2.5rem, 7vw, 4.25rem);
      font-weight: 400;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: var(--ink);
      margin: 0;
    }
    .tt-title em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-weight: 400;
      color: var(--accent);
    }
    .tt-rule {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: center;
      margin: 1rem auto;
      color: var(--ink-soft);
    }
    .tt-rule::before, .tt-rule::after {
      content: '';
      height: 1px;
      background: var(--ink-soft);
      flex: 1;
      max-width: 80px;
      opacity: 0.4;
    }
    .tt-rule-mark {
      font-family: 'Italiana', serif;
      font-size: 1.25rem;
    }

    /* MENU */
    .tt-menu-card {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 2.5rem 2rem;
      position: relative;
      box-shadow: 8px 8px 0 var(--paper-shadow);
    }
    .tt-menu-card::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.25;
      pointer-events: none;
    }
    .tt-menu-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .tt-menu-q {
      font-family: 'Italiana', serif;
      font-size: 1.6rem;
      text-align: center;
      margin-bottom: 2rem;
      line-height: 1.3;
    }
    .tt-mode-btn {
      display: block;
      width: 100%;
      padding: 1.25rem 1.5rem;
      margin-bottom: 0.75rem;
      background: var(--paper);
      border: 1px solid var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      color: var(--ink);
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tt-mode-btn:hover {
      background: var(--ink);
      color: var(--paper);
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0 var(--accent);
    }
    .tt-mode-btn-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      opacity: 0.6;
      letter-spacing: 0.15em;
    }
    .tt-mode-btn-arrow {
      font-family: 'Italiana', serif;
      font-size: 1.4rem;
    }
    .tt-deck-info {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.9rem;
      font-style: italic;
      color: var(--ink-soft);
    }
    .tt-deck-info strong {
      font-weight: 600;
      font-style: normal;
      color: var(--ink);
    }

    /* PLAYING */
    .tt-progress-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }
    .tt-progress-bar {
      height: 2px;
      background: var(--paper-shadow);
      margin-bottom: 2rem;
      position: relative;
    }
    .tt-progress-fill {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      background: var(--accent);
      transition: width 0.4s ease;
    }

    .tt-card {
      perspective: 1200px;
      margin-bottom: 1.5rem;
    }
    .tt-card-inner {
      position: relative;
      min-height: 320px;
      transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .tt-card-inner.flipped {
      transform: rotateY(180deg);
    }
    .tt-card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 2.5rem 2rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .tt-card-face::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.2;
      pointer-events: none;
    }
    .tt-card-back {
      transform: rotateY(180deg);
    }
    .tt-card-back.correct {
      background: #e8ecd4;
    }
    .tt-card-back.wrong {
      background: #f0dcd5;
    }

    .tt-card-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1.5rem;
    }
    .tt-chord-display {
      font-family: 'Italiana', serif;
      font-size: clamp(4rem, 12vw, 6rem);
      line-height: 1;
      color: var(--ink);
    }
    .tt-chord-quality {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 1.3rem;
      color: var(--ink-soft);
      margin-top: 0.75rem;
      letter-spacing: 0.05em;
    }
    .tt-notes-display {
      display: flex;
      gap: 1rem;
      align-items: baseline;
      justify-content: center;
      flex-wrap: wrap;
    }
    .tt-note-chip {
      font-family: 'Italiana', serif;
      font-size: clamp(2.5rem, 8vw, 4rem);
      line-height: 1;
      color: var(--ink);
    }
    .tt-note-sep {
      font-family: 'Italiana', serif;
      font-size: 2rem;
      color: var(--gold);
      line-height: 1;
    }

    /* FEEDBACK face */
    .tt-feedback-mark {
      font-family: 'Italiana', serif;
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .tt-feedback-mark.correct { color: var(--correct); }
    .tt-feedback-mark.wrong { color: var(--wrong); }
    .tt-feedback-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }
    .tt-feedback-label.correct { color: var(--correct); }
    .tt-feedback-label.wrong { color: var(--wrong); }
    .tt-answer-block {
      text-align: center;
      margin-bottom: 0.75rem;
    }
    .tt-answer-small {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.4rem;
    }
    .tt-answer-value {
      font-family: 'Italiana', serif;
      font-size: 2rem;
      line-height: 1.1;
    }
    .tt-answer-value.was-wrong {
      text-decoration: line-through;
      text-decoration-color: var(--wrong);
      color: var(--ink-soft);
      font-size: 1.4rem;
    }

    /* INPUTS */
    .tt-input-row {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .tt-note-input {
      width: 90px;
      padding: 1rem 0.5rem;
      font-family: 'Italiana', serif;
      font-size: 2rem;
      text-align: center;
      background: var(--paper);
      border: 1px solid var(--ink);
      color: var(--ink);
      outline: none;
      transition: all 0.2s;
    }
    .tt-note-input:focus {
      background: var(--paper-deep);
      box-shadow: 4px 4px 0 var(--accent);
      transform: translate(-2px, -2px);
    }
    .tt-chord-input {
      width: 100%;
      max-width: 320px;
      padding: 1rem;
      font-family: 'Italiana', serif;
      font-size: 2rem;
      text-align: center;
      background: var(--paper);
      border: 1px solid var(--ink);
      color: var(--ink);
      outline: none;
      transition: all 0.2s;
    }
    .tt-chord-input:focus {
      background: var(--paper-deep);
      box-shadow: 4px 4px 0 var(--accent);
      transform: translate(-2px, -2px);
    }
    .tt-hint {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink-soft);
      opacity: 0.7;
      margin-bottom: 1.5rem;
    }

    /* ACTION BUTTONS */
    .tt-btn {
      display: block;
      width: 100%;
      padding: 1.1rem 1.5rem;
      background: var(--ink);
      color: var(--paper);
      border: 1px solid var(--ink);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
      font-weight: 500;
    }
    .tt-btn:hover {
      background: var(--accent);
      border-color: var(--accent);
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0 var(--ink);
    }
    .tt-btn-ghost {
      background: transparent;
      color: var(--ink);
    }
    .tt-btn-ghost:hover {
      background: var(--ink);
      color: var(--paper);
    }
    .tt-btn-row {
      display: flex;
      gap: 0.75rem;
    }

    /* RESULTS */
    .tt-score-display {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .tt-score-number {
      font-family: 'Italiana', serif;
      font-size: clamp(5rem, 18vw, 9rem);
      line-height: 0.9;
      color: var(--ink);
    }
    .tt-score-number em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--accent);
    }
    .tt-score-fraction {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-top: 0.5rem;
    }
    .tt-score-verdict {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 1.3rem;
      margin-top: 1rem;
      color: var(--ink-soft);
    }
    .tt-results-list {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      position: relative;
    }
    .tt-results-list::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.2;
      pointer-events: none;
    }
    .tt-results-heading {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1rem;
      text-align: center;
    }
    .tt-result-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: baseline;
      padding: 0.75rem 0;
      border-bottom: 1px dotted var(--ink-soft);
    }
    .tt-result-item:last-child {
      border-bottom: none;
    }
    .tt-result-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: var(--ink-soft);
      width: 2.5em;
    }
    .tt-result-q {
      font-family: 'Italiana', serif;
      font-size: 1.15rem;
    }
    .tt-result-q-sub {
      display: block;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 0.85rem;
      color: var(--ink-soft);
      margin-top: 0.15rem;
    }
    .tt-result-q-sub.was-wrong {
      text-decoration: line-through;
    }
    .tt-result-mark {
      font-family: 'Italiana', serif;
      font-size: 1.4rem;
    }
    .tt-result-mark.correct { color: var(--correct); }
    .tt-result-mark.wrong { color: var(--wrong); }

    /* FOOTER */
    .tt-footer {
      text-align: center;
      margin-top: 2rem;
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
    .tt-fade-in {
      animation: fadeIn 0.4s ease forwards;
    }
  `;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="tt-root">
      <style>{css}</style>
      <div className="tt-container">

        <Link to="/" className="tt-back">
          <span className="tt-back-arrow">←</span>
          Back to studies
        </Link>

        {/* HEADER */}
        <header className="tt-header">
          <div className="tt-eyebrow">Opus I · Nº 48</div>
          <h1 className="tt-title">
            Triad <em>Trainer</em>
          </h1>
          <div className="tt-rule"><span className="tt-rule-mark">❦</span></div>
          <div className="tt-eyebrow" style={{ opacity: 0.7 }}>A Study of Three Notes</div>
        </header>

        {/* MENU */}
        {mode === 'menu' && (
          <div className="tt-menu-card tt-fade-in">
            <div className="tt-menu-label">— Select a study —</div>
            <div className="tt-menu-q">Which direction shall we begin?</div>

            <button className="tt-mode-btn" onClick={() => startGame('chord-to-notes')}>
              <span>
                <span className="tt-mode-btn-num">I. </span>
                Chord name → spell the triad
              </span>
              <span className="tt-mode-btn-arrow">→</span>
            </button>
            <button className="tt-mode-btn" onClick={() => startGame('notes-to-chord')}>
              <span>
                <span className="tt-mode-btn-num">II. </span>
                Triad notes → name the chord
              </span>
              <span className="tt-mode-btn-arrow">→</span>
            </button>
            <button className="tt-mode-btn" onClick={() => startGame('interval-2')}>
              <span>
                <span className="tt-mode-btn-num">III. </span>
                Chord name → the <em style={{ fontStyle: 'italic' }}>2nd</em> of its scale
              </span>
              <span className="tt-mode-btn-arrow">→</span>
            </button>
            <button className="tt-mode-btn" onClick={() => startGame('interval-6')}>
              <span>
                <span className="tt-mode-btn-num">IV. </span>
                Chord name → the <em style={{ fontStyle: 'italic' }}>6th</em> of its scale
              </span>
              <span className="tt-mode-btn-arrow">→</span>
            </button>

            <div className="tt-deck-info">
              <strong>{fullDeck.length}</strong> triad cards · <strong>{secondsDeck.length + sixthsDeck.length}</strong> interval cards
              <br /><em>major &amp; minor use natural minor for the 6th</em>
            </div>
          </div>
        )}

        {/* PLAYING */}
        {mode === 'playing' && current && (
          <div className="tt-fade-in">
            <div className="tt-progress-row">
              <span>Card {String(idx + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}</span>
              <span>Score · {score}</span>
            </div>
            <div className="tt-progress-bar">
              <div className="tt-progress-fill" style={{ width: `${(idx / deck.length) * 100}%` }} />
            </div>

            <div className="tt-card">
              <div className={`tt-card-inner ${flipped ? 'flipped' : ''}`}>

                {/* FRONT */}
                <div className="tt-card-face">
                  {direction === 'chord-to-notes' && (
                    <>
                      <div className="tt-card-label">— Spell the triad —</div>
                      <div className="tt-chord-display">{formatChord(current.chordName)}</div>
                      <div className="tt-chord-quality">{current.qualityLabel}</div>
                    </>
                  )}
                  {direction === 'notes-to-chord' && (
                    <>
                      <div className="tt-card-label">— Name the chord —</div>
                      <div className="tt-notes-display">
                        {current.notes.map((n, i) => (
                          <React.Fragment key={i}>
                            <span className="tt-note-chip">{formatNote(n)}</span>
                            {i < current.notes.length - 1 && <span className="tt-note-sep">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </>
                  )}
                  {(direction === 'interval-2' || direction === 'interval-6') && (
                    <>
                      <div className="tt-card-label">
                        — The {direction === 'interval-2' ? '2nd' : '6th'} of —
                      </div>
                      <div className="tt-chord-display">{formatChord(current.chordName)}</div>
                      <div className="tt-chord-quality">{current.qualityLabel}</div>
                    </>
                  )}
                </div>

                {/* BACK (feedback) */}
                <div className={`tt-card-face tt-card-back ${feedback || ''}`}>
                  {feedback === 'correct' && (
                    <>
                      <div className="tt-feedback-mark correct">✓</div>
                      <div className="tt-feedback-label correct">— Correct —</div>
                      <div className="tt-answer-block">
                        <div className="tt-answer-small">The answer</div>
                        <div className="tt-answer-value">
                          {correctAnswerDisplay(direction, current)}
                        </div>
                      </div>
                    </>
                  )}
                  {feedback === 'wrong' && (
                    <>
                      <div className="tt-feedback-mark wrong">✗</div>
                      <div className="tt-feedback-label wrong">— Not quite —</div>
                      <div className="tt-answer-block">
                        <div className="tt-answer-small">Your answer</div>
                        <div className="tt-answer-value was-wrong">
                          {results[results.length - 1]?.userAnswer || ''}
                        </div>
                      </div>
                      <div className="tt-answer-block">
                        <div className="tt-answer-small">Correct answer</div>
                        <div className="tt-answer-value">
                          {correctAnswerDisplay(direction, current)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* INPUTS */}
            {!feedback && direction === 'chord-to-notes' && (
              <>
                <div className="tt-input-row">
                  {['n1', 'n2', 'n3'].map((k, i) => (
                    <input
                      key={k}
                      className="tt-note-input"
                      type="text"
                      autoFocus={i === 0}
                      value={answers[k]}
                      onChange={(e) => setAnswers((a) => ({ ...a, [k]: e.target.value }))}
                      placeholder={['1', '3', '5'][i]}
                      maxLength={3}
                    />
                  ))}
                </div>
                <div className="tt-hint">Accepts # or b · Any order</div>
              </>
            )}
            {!feedback && direction === 'notes-to-chord' && (
              <>
                <div className="tt-input-row">
                  <input
                    className="tt-chord-input"
                    type="text"
                    autoFocus
                    value={answers.chord}
                    onChange={(e) => setAnswers((a) => ({ ...a, chord: e.target.value }))}
                    placeholder="e.g. Cm, F#, Bb°, G+"
                  />
                </div>
                <div className="tt-hint">m = minor · ° = dim · + = aug</div>
              </>
            )}
            {!feedback && (direction === 'interval-2' || direction === 'interval-6') && (
              <>
                <div className="tt-input-row">
                  <input
                    className="tt-note-input"
                    style={{ width: '140px' }}
                    type="text"
                    autoFocus
                    value={answers.interval}
                    onChange={(e) => setAnswers((a) => ({ ...a, interval: e.target.value }))}
                    placeholder="note"
                    maxLength={3}
                  />
                </div>
                <div className="tt-hint">
                  {direction === 'interval-2'
                    ? 'Accepts # or b · enharmonics ok'
                    : 'Minor chords use the natural minor scale'}
                </div>
              </>
            )}

            {!feedback ? (
              <button className="tt-btn" onClick={handleSubmit}>
                Submit answer ⏎
              </button>
            ) : (
              <button className="tt-btn" onClick={handleNext}>
                {idx + 1 >= deck.length ? 'See your score ⏎' : 'Next card ⏎'}
              </button>
            )}
          </div>
        )}

        {/* FINISHED */}
        {mode === 'finished' && (
          <div className="tt-fade-in">
            <div className="tt-score-display">
              <div className="tt-score-number">
                {scorePercent}<em>%</em>
              </div>
              <div className="tt-score-fraction">{score} of {results.length} correct</div>
              <div className="tt-score-verdict">{verdict(scorePercent)}</div>
            </div>

            <div className="tt-results-list">
              <div className="tt-results-heading">— Round summary —</div>
              {results.map((r, i) => (
                <div key={i} className="tt-result-item">
                  <span className="tt-result-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="tt-result-q">
                      {resultPrompt(direction, r.card)}
                    </div>
                    {!r.correct && (
                      <>
                        <div className="tt-result-q-sub was-wrong">
                          you: {r.userAnswer}
                        </div>
                        <div className="tt-result-q-sub">
                          answer: {correctAnswerDisplay(direction, r.card)}
                        </div>
                      </>
                    )}
                  </div>
                  <span className={`tt-result-mark ${r.correct ? 'correct' : 'wrong'}`}>
                    {r.correct ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>

            <div className="tt-btn-row">
              <button className="tt-btn" onClick={() => startGame(direction)}>
                Play again · shuffled
              </button>
              <button className="tt-btn tt-btn-ghost" onClick={() => setMode('menu')}>
                Change mode
              </button>
            </div>
          </div>
        )}

        <div className="tt-footer">— ad studium musicae —</div>
      </div>
    </div>
  );
}

// helpers for pretty display of accidentals
function formatNote(n) {
  return n.replace('#', '♯').replace('b', '♭');
}
function formatChord(c) {
  return c.replace('#', '♯').replace('b', '♭');
}
// What the correct answer looks like, per direction
function correctAnswerDisplay(direction, card) {
  if (direction === 'chord-to-notes') return card.notes.map(formatNote).join(' · ');
  if (direction === 'notes-to-chord') return formatChord(card.chordName);
  // interval-2 or interval-6
  return formatNote(card.intervalNote);
}
// What the prompt looks like in the results summary
function resultPrompt(direction, card) {
  if (direction === 'chord-to-notes') return formatChord(card.chordName);
  if (direction === 'notes-to-chord') return card.notes.map(formatNote).join(' · ');
  if (direction === 'interval-2') return formatChord(card.chordName) + ' · 2nd';
  if (direction === 'interval-6') return formatChord(card.chordName) + ' · 6th';
  return '';
}
function verdict(p) {
  if (p === 100) return '— a perfect recital —';
  if (p >= 90) return '— virtuoso —';
  if (p >= 75) return '— accomplished —';
  if (p >= 50) return '— a fair showing —';
  if (p >= 25) return '— keep at it —';
  return '— back to the études —';
}
