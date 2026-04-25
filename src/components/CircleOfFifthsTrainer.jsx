import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBestTime, recordTime, formatTime, WRONG_PENALTY_MS } from '../utils/bestTimes';

// ============================================================================
// KEY SIGNATURE DATA — all 15 major keys
// Each key has: name, type ('sharp'|'flat'|'natural'), and a map of
// letter → accidental ('#', 'b', or '' for natural)
// ============================================================================
const ORDER_OF_SHARPS = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const ORDER_OF_FLATS  = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

const MAJOR_KEYS = [
  // Natural
  { tonic: 'C',  name: 'C',  count: 0, type: 'natural', sharps: [], flats: [], mode: 'major' },
  // Sharp keys
  { tonic: 'G',  name: 'G',  count: 1, type: 'sharp', sharps: ['F'], flats: [], mode: 'major' },
  { tonic: 'D',  name: 'D',  count: 2, type: 'sharp', sharps: ['F', 'C'], flats: [], mode: 'major' },
  { tonic: 'A',  name: 'A',  count: 3, type: 'sharp', sharps: ['F', 'C', 'G'], flats: [], mode: 'major' },
  { tonic: 'E',  name: 'E',  count: 4, type: 'sharp', sharps: ['F', 'C', 'G', 'D'], flats: [], mode: 'major' },
  { tonic: 'B',  name: 'B',  count: 5, type: 'sharp', sharps: ['F', 'C', 'G', 'D', 'A'], flats: [], mode: 'major' },
  { tonic: 'F#', name: 'F#', count: 6, type: 'sharp', sharps: ['F', 'C', 'G', 'D', 'A', 'E'], flats: [], mode: 'major' },
  { tonic: 'C#', name: 'C#', count: 7, type: 'sharp', sharps: ['F', 'C', 'G', 'D', 'A', 'E', 'B'], flats: [], mode: 'major' },
  // Flat keys
  { tonic: 'F',  name: 'F',  count: 1, type: 'flat', sharps: [], flats: ['B'], mode: 'major' },
  { tonic: 'Bb', name: 'Bb', count: 2, type: 'flat', sharps: [], flats: ['B', 'E'], mode: 'major' },
  { tonic: 'Eb', name: 'Eb', count: 3, type: 'flat', sharps: [], flats: ['B', 'E', 'A'], mode: 'major' },
  { tonic: 'Ab', name: 'Ab', count: 4, type: 'flat', sharps: [], flats: ['B', 'E', 'A', 'D'], mode: 'major' },
  { tonic: 'Db', name: 'Db', count: 5, type: 'flat', sharps: [], flats: ['B', 'E', 'A', 'D', 'G'], mode: 'major' },
  { tonic: 'Gb', name: 'Gb', count: 6, type: 'flat', sharps: [], flats: ['B', 'E', 'A', 'D', 'G', 'C'], mode: 'major' },
];

// Each natural minor key shares the key signature of its relative major.
const MINOR_TONICS = [
  ['A',   0],  ['E',   1], ['B',   2], ['F#',  3], ['C#',  4], ['G#',  5], ['D#',  6], ['A#',  7],
  ['D',   1], ['G',   2], ['C',   3], ['F',   4], ['Bb',  5], ['Eb',  6],
];
const MINOR_KEYS = MINOR_TONICS.map(([tonic, idx]) => {
  const m = MAJOR_KEYS[idx];
  return {
    tonic,
    name: tonic + 'm',
    count: m.count,
    type: m.type,
    sharps: m.sharps,
    flats: m.flats,
    mode: 'minor',
  };
});

const KEYS = [...MAJOR_KEYS, ...MINOR_KEYS];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Return the accidental for a letter in a given key: '#', 'b', or ''
const accidentalFor = (key, letter) => {
  if (key.sharps.includes(letter)) return '#';
  if (key.flats.includes(letter)) return 'b';
  return '';
};

// Build the full set of notes in a key, in scale order starting from the tonic
const notesInKey = (key) => {
  const rootLetter = key.tonic[0];
  const rootIdx = LETTERS.indexOf(rootLetter);
  const scaleLetters = [];
  for (let i = 0; i < 7; i++) {
    scaleLetters.push(LETTERS[(rootIdx + i) % 7]);
  }
  return scaleLetters.map((l) => l + accidentalFor(key, l));
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Compare user's answer (map letter → '#'|'b'|'') to correct key
const answersMatch = (userMap, key) => {
  for (const letter of LETTERS) {
    const correct = accidentalFor(key, letter);
    const given = userMap[letter] || '';
    if (correct !== given) return false;
  }
  return true;
};

// Parse a key-name input into { root, mode } or null if unparseable.
const parseKeyInput = (s) => {
  if (!s) return null;
  const t = s.trim().replace(/\s+/g, '').replace('♯', '#').replace('♭', 'b');
  if (!t) return null;
  const letter = t[0].toUpperCase();
  if (!'ABCDEFG'.includes(letter)) return null;
  let i = 1;
  let acc = '';
  while (i < t.length && (t[i] === '#' || t[i] === 'b')) {
    acc += t[i];
    i++;
  }
  const root = letter + acc;
  const rest = t.slice(i).toLowerCase();
  let keyMode = 'major';
  if (rest === 'm' || rest === 'min' || rest === 'minor' || rest === '-') keyMode = 'minor';
  return { root, mode: keyMode };
};

const keyNameMatch = (userInput, key) => {
  const u = parseKeyInput(userInput);
  if (!u) return false;
  return u.root === key.tonic && u.mode === key.mode;
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function CircleOfFifthsTrainer() {
  const [mode, setMode] = useState('menu'); // menu, playing, finished
  const [direction, setDirection] = useState('key-to-accidentals'); // or notes-to-key
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  // For key-to-accidentals: map of letter → '#'|'b'|''
  const [letterAnswers, setLetterAnswers] = useState({
    A: '', B: '', C: '', D: '', E: '', F: '', G: '',
  });
  // For notes-to-key: typed key name
  const [keyAnswer, setKeyAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [results, setResults] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const [options, setOptions] = useState({ major: true, minor: false });

  const filteredKeys = useMemo(() => {
    return KEYS.filter((k) =>
      (k.mode === 'major' && options.major) || (k.mode === 'minor' && options.minor)
    );
  }, [options]);

  const optionsKey = `M${options.major ? 1 : 0}m${options.minor ? 1 : 0}`;
  const keyFor = (dir) => `cof-${dir}-${optionsKey}`;
  const bestForDirection = (dir) => getBestTime(keyFor(dir));

  const toggleOption = (k) => setOptions((o) => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    if (mode !== 'playing' || !startedAt) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [mode, startedAt]);

  const startGame = (dir) => {
    setDirection(dir);
    setDeck(shuffle(filteredKeys));
    setIdx(0);
    setResults([]);
    setLetterAnswers({ A: '', B: '', C: '', D: '', E: '', F: '', G: '' });
    setKeyAnswer('');
    setFeedback(null);
    setFlipped(false);
    setStartedAt(Date.now());
    setElapsed(0);
    setFinalTime(null);
    setIsNewBest(false);
    setMode('playing');
  };

  const current = deck[idx];

  const toggleLetter = (letter, value) => {
    if (feedback) return;
    setLetterAnswers((prev) => ({
      ...prev,
      [letter]: prev[letter] === value ? '' : value,
    }));
  };

  const handleSubmit = () => {
    if (feedback) return;
    let isCorrect = false;
    let userAnswerDisplay = '';

    if (direction === 'key-to-accidentals') {
      isCorrect = answersMatch(letterAnswers, current);
      // Build a display string of what the user marked
      const marked = LETTERS
        .filter((l) => letterAnswers[l])
        .map((l) => l + (letterAnswers[l] === '#' ? '♯' : '♭'));
      userAnswerDisplay = marked.length ? marked.join(' · ') : '(none marked)';
    } else {
      isCorrect = keyNameMatch(keyAnswer, current);
      userAnswerDisplay = keyAnswer.trim() || '(blank)';
    }

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setFlipped(true);
    setResults((r) => [...r, { card: current, correct: isCorrect, userAnswer: userAnswerDisplay }]);
  };

  const handleNext = () => {
    if (idx + 1 >= deck.length) {
      const raw = Date.now() - startedAt;
      const wrong = results.length - results.filter((r) => r.correct).length;
      const adjusted = raw + wrong * WRONG_PENALTY_MS;
      setFinalTime(adjusted);
      setIsNewBest(recordTime(keyFor(direction), adjusted));
      setMode('finished');
    } else {
      setIdx(idx + 1);
      setLetterAnswers({ A: '', B: '', C: '', D: '', E: '', F: '', G: '' });
      setKeyAnswer('');
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
  }, [mode, feedback, letterAnswers, keyAnswer, idx]);

  const score = results.filter((r) => r.correct).length;
  const scorePercent = results.length ? Math.round((score / results.length) * 100) : 0;

  // Build the correct accidentals display for feedback
  const correctAccidentalDisplay = current
    ? LETTERS
        .filter((l) => accidentalFor(current, l))
        .map((l) => l + (accidentalFor(current, l) === '#' ? '♯' : '♭'))
        .join(' · ') || 'no accidentals'
    : '';

  // ============================================================================
  // STYLES — matching the triad trainer's editorial aesthetic
  // ============================================================================
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

    .cof-root {
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
      --sharp: #2d4a6b;
      --flat: #6b4223;
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: var(--ink);
      background: var(--paper);
      background-image:
        radial-gradient(ellipse at top left, rgba(168, 135, 52, 0.08), transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(139, 44, 32, 0.06), transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 20, 16, 0.012) 2px, rgba(26, 20, 16, 0.012) 3px);
      min-height: 100vh;
      padding: 1.25rem 1rem 2rem;
      position: relative;
      overflow-x: hidden;
    }
    .cof-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
      opacity: 0.12;
      pointer-events: none;
      mix-blend-mode: multiply;
    }
    .cof-container {
      max-width: 760px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .cof-back {
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
    .cof-back:hover {
      color: var(--accent);
    }
    .cof-back-arrow {
      font-family: 'Italiana', serif;
      font-size: 1.1rem;
      letter-spacing: normal;
      margin-right: 0.5rem;
    }
    .cof-back-btn {
      background: transparent;
      border: 1px solid var(--ink-soft);
      cursor: pointer;
      padding: 0.4rem 0.75rem;
      color: var(--ink-soft);
    }
    .cof-back-btn:hover {
      color: var(--accent);
      border-color: var(--accent);
    }

    /* HEADER */
    .cof-header {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .cof-header.compact { margin-bottom: 1rem; }
    .cof-header.compact .cof-title { font-size: clamp(1.5rem, 3.5vw, 2rem); }
    .cof-header.compact .cof-rule { margin: 0.4rem auto; }
    .cof-header.compact .cof-rule::before, .cof-header.compact .cof-rule::after { max-width: 50px; }
    .cof-header.compact .cof-rule-mark { font-size: 0.9rem; }
    .cof-header.compact .cof-eyebrow { font-size: 0.6rem; margin-bottom: 0.25rem; }
    .cof-header.compact .cof-eyebrow:last-child { display: none; }
    .cof-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.5rem;
    }
    .cof-title {
      font-family: 'Italiana', serif;
      font-size: clamp(2.25rem, 6vw, 3.75rem);
      font-weight: 400;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: var(--ink);
      margin: 0;
    }
    .cof-title em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-weight: 400;
      color: var(--accent);
    }
    .cof-rule {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: center;
      margin: 1rem auto;
      color: var(--ink-soft);
    }
    .cof-rule::before, .cof-rule::after {
      content: '';
      height: 1px;
      background: var(--ink-soft);
      flex: 1;
      max-width: 80px;
      opacity: 0.4;
    }
    .cof-rule-mark {
      font-family: 'Italiana', serif;
      font-size: 1.25rem;
    }

    /* MENU */
    .cof-menu-card {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 2.5rem 2rem;
      position: relative;
      box-shadow: 8px 8px 0 var(--paper-shadow);
    }
    .cof-menu-card::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.25;
      pointer-events: none;
    }
    .cof-menu-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .cof-menu-q {
      font-family: 'Italiana', serif;
      font-size: 1.6rem;
      text-align: center;
      margin-bottom: 2rem;
      line-height: 1.3;
    }
    .cof-mode-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    }
    .cof-mode-btn:hover {
      background: var(--ink);
      color: var(--paper);
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0 var(--accent);
    }
    .cof-mode-btn-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      opacity: 0.6;
      letter-spacing: 0.15em;
    }
    .cof-mode-btn-arrow {
      font-family: 'Italiana', serif;
      font-size: 1.4rem;
    }
    .cof-deck-info {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.9rem;
      font-style: italic;
      color: var(--ink-soft);
    }
    .cof-options-section {
      margin-bottom: 1.25rem;
    }
    .cof-options-section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.6rem;
    }
    .cof-toggle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .cof-toggle {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.55rem 0.85rem;
      background: var(--paper);
      border: 1px solid var(--ink);
      cursor: pointer;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      transition: all 0.15s ease;
      user-select: none;
    }
    .cof-toggle:hover { background: #efe5cc; }
    .cof-toggle.on { background: var(--ink); color: var(--paper); }
    .cof-toggle-detail {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      opacity: 0.7;
    }
    .cof-mode-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .cof-best-row {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px dotted var(--ink-soft);
    }
    .cof-best-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      text-align: center;
      margin-bottom: 0.6rem;
    }
    .cof-best-line {
      display: flex; justify-content: space-between;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      padding: 0.2rem 0.5rem;
      color: var(--ink-soft);
    }
    .cof-best-line strong {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--ink);
    }
    .cof-best-inline { opacity: 0.7; font-size: 0.9em; }
    .cof-score-time {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--ink-soft);
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }
    .cof-score-time strong {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-style: normal;
      color: var(--ink);
    }
    .cof-new-best { color: var(--accent); font-weight: 600; font-style: normal; }
    .cof-deck-info strong {
      font-weight: 600;
      font-style: normal;
      color: var(--ink);
    }

    /* PLAYING */
    .cof-progress-row {
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
    .cof-progress-bar {
      height: 2px;
      background: var(--paper-shadow);
      margin-bottom: 2rem;
      position: relative;
    }
    .cof-progress-fill {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      background: var(--accent);
      transition: width 0.4s ease;
    }

    .cof-card {
      perspective: 1400px;
      margin-bottom: 1.5rem;
    }
    .cof-card-inner {
      position: relative;
      min-height: 240px;
      transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .cof-card-inner.flipped {
      transform: rotateY(180deg);
    }
    .cof-card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 2rem 1.5rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .cof-card-face::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.2;
      pointer-events: none;
    }
    .cof-card-back {
      transform: rotateY(180deg);
    }
    .cof-card-back.correct {
      background: #e8ecd4;
    }
    .cof-card-back.wrong {
      background: #f0dcd5;
    }
    .cof-card-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1.25rem;
    }
    .cof-key-display {
      font-family: 'Italiana', serif;
      font-size: clamp(4rem, 12vw, 6rem);
      line-height: 1;
      color: var(--ink);
    }
    .cof-key-quality {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 1.3rem;
      color: var(--ink-soft);
      margin-top: 0.75rem;
      letter-spacing: 0.05em;
    }
    .cof-notes-display {
      display: flex;
      gap: 0.6rem;
      align-items: baseline;
      justify-content: center;
      flex-wrap: wrap;
      max-width: 100%;
    }
    .cof-note-chip {
      font-family: 'Italiana', serif;
      font-size: clamp(1.75rem, 5vw, 2.5rem);
      line-height: 1;
      color: var(--ink);
    }
    .cof-note-sep {
      font-family: 'Italiana', serif;
      font-size: 1.2rem;
      color: var(--gold);
      line-height: 1;
      align-self: center;
    }

    /* FEEDBACK face */
    .cof-feedback-mark {
      font-family: 'Italiana', serif;
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .cof-feedback-mark.correct { color: var(--correct); }
    .cof-feedback-mark.wrong { color: var(--wrong); }
    .cof-feedback-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    .cof-feedback-label.correct { color: var(--correct); }
    .cof-feedback-label.wrong { color: var(--wrong); }
    .cof-answer-block {
      text-align: center;
      margin-bottom: 0.75rem;
      max-width: 100%;
    }
    .cof-answer-small {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.4rem;
    }
    .cof-answer-value {
      font-family: 'Italiana', serif;
      font-size: 1.75rem;
      line-height: 1.15;
    }
    .cof-answer-value.was-wrong {
      text-decoration: line-through;
      text-decoration-color: var(--wrong);
      color: var(--ink-soft);
      font-size: 1.2rem;
    }

    /* LETTER GRID — the main input for mode 1 */
    .cof-letter-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.4rem;
      margin-bottom: 1.25rem;
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 1.25rem 0.75rem;
      box-shadow: 6px 6px 0 var(--paper-shadow);
      position: relative;
    }
    .cof-letter-grid::before {
      content: '';
      position: absolute;
      inset: 5px;
      border: 1px solid var(--ink);
      opacity: 0.2;
      pointer-events: none;
    }
    .cof-letter-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      position: relative;
      z-index: 1;
    }
    .cof-letter-label {
      font-family: 'Italiana', serif;
      font-size: clamp(1.4rem, 4vw, 1.9rem);
      line-height: 1;
      color: var(--ink);
      margin-bottom: 0.3rem;
    }
    .cof-acc-btn {
      width: 100%;
      min-width: 0;
      padding: 0.45rem 0.2rem;
      background: var(--paper);
      border: 1px solid var(--ink);
      font-family: 'Italiana', serif;
      font-size: 1.3rem;
      color: var(--ink);
      cursor: pointer;
      transition: all 0.15s ease;
      line-height: 1;
    }
    .cof-acc-btn:hover:not(:disabled) {
      background: var(--ink);
      color: var(--paper);
    }
    .cof-acc-btn.active-sharp {
      background: var(--sharp);
      color: var(--paper);
      border-color: var(--sharp);
      box-shadow: 2px 2px 0 var(--ink);
    }
    .cof-acc-btn.active-flat {
      background: var(--flat);
      color: var(--paper);
      border-color: var(--flat);
      box-shadow: 2px 2px 0 var(--ink);
    }
    .cof-acc-btn:disabled {
      cursor: default;
      opacity: 0.6;
    }

    /* KEY NAME INPUT for mode 2 */
    .cof-key-input {
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
      margin: 0 auto 1.5rem;
      display: block;
    }
    .cof-key-input:focus {
      background: var(--paper-deep);
      box-shadow: 4px 4px 0 var(--accent);
      transform: translate(-2px, -2px);
    }

    .cof-hint {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink-soft);
      opacity: 0.7;
      margin-bottom: 1.25rem;
    }

    /* ACTION BUTTONS */
    .cof-btn {
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
    .cof-btn:hover {
      background: var(--accent);
      border-color: var(--accent);
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0 var(--ink);
    }
    .cof-btn-ghost {
      background: transparent;
      color: var(--ink);
    }
    .cof-btn-ghost:hover {
      background: var(--ink);
      color: var(--paper);
    }
    .cof-btn-row {
      display: flex;
      gap: 0.75rem;
    }

    /* RESULTS */
    .cof-score-display {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .cof-score-number {
      font-family: 'Italiana', serif;
      font-size: clamp(5rem, 18vw, 9rem);
      line-height: 0.9;
      color: var(--ink);
    }
    .cof-score-number em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--accent);
    }
    .cof-score-fraction {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-top: 0.5rem;
    }
    .cof-score-verdict {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 1.3rem;
      margin-top: 1rem;
      color: var(--ink-soft);
    }
    .cof-results-list {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      position: relative;
    }
    .cof-results-list::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid var(--ink);
      opacity: 0.2;
      pointer-events: none;
    }
    .cof-results-heading {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 1rem;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .cof-result-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: baseline;
      padding: 0.75rem 0;
      border-bottom: 1px dotted var(--ink-soft);
      position: relative;
      z-index: 1;
    }
    .cof-result-item:last-child {
      border-bottom: none;
    }
    .cof-result-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: var(--ink-soft);
      width: 2.5em;
    }
    .cof-result-q {
      font-family: 'Italiana', serif;
      font-size: 1.15rem;
    }
    .cof-result-q-sub {
      display: block;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 0.85rem;
      color: var(--ink-soft);
      margin-top: 0.15rem;
      word-break: break-word;
    }
    .cof-result-q-sub.was-wrong {
      text-decoration: line-through;
    }
    .cof-result-mark {
      font-family: 'Italiana', serif;
      font-size: 1.4rem;
    }
    .cof-result-mark.correct { color: var(--correct); }
    .cof-result-mark.wrong { color: var(--wrong); }

    .cof-footer {
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
    .cof-fade-in {
      animation: fadeIn 0.4s ease forwards;
    }
  `;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="cof-root">
      <style>{css}</style>
      <div className="cof-container">

        {mode === 'playing' ? (
          <button className="cof-back cof-back-btn" onClick={() => setMode('finished')}>
            <span className="cof-back-arrow">×</span>
            End study
          </button>
        ) : (
          <Link to="/" className="cof-back">
            <span className="cof-back-arrow">←</span>
            Back to studies
          </Link>
        )}

        {/* HEADER */}
        <header className={`cof-header ${mode === 'playing' ? 'compact' : ''}`}>
          <div className="cof-eyebrow">Opus II · Nº 14</div>
          <h1 className="cof-title">
            Circle of <em>Fifths</em>
          </h1>
          <div className="cof-rule"><span className="cof-rule-mark">❦</span></div>
          <div className="cof-eyebrow" style={{ opacity: 0.7 }}>A Study of Key Signatures</div>
        </header>

        {/* MENU */}
        {mode === 'menu' && (
          <div className="cof-menu-card cof-fade-in">
            <div className="cof-menu-label">— Select a study —</div>

            <div className="cof-options-section">
              <div className="cof-options-section-label">Include keys</div>
              <div className="cof-toggle-grid">
                <div
                  className={`cof-toggle ${options.major ? 'on' : ''}`}
                  onClick={() => toggleOption('major')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('major'); }}
                >
                  <span>Major</span>
                  <span className="cof-toggle-detail">{MAJOR_KEYS.length}</span>
                </div>
                <div
                  className={`cof-toggle ${options.minor ? 'on' : ''}`}
                  onClick={() => toggleOption('minor')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('minor'); }}
                >
                  <span>Minor</span>
                  <span className="cof-toggle-detail">{MINOR_KEYS.length}</span>
                </div>
              </div>
            </div>

            <div className="cof-menu-q">Which direction shall we begin?</div>

            <button
              className="cof-mode-btn"
              disabled={filteredKeys.length === 0}
              onClick={() => startGame('key-to-accidentals')}
            >
              <span>
                <span className="cof-mode-btn-num">I. </span>
                Key name → mark the sharps &amp; flats
              </span>
              <span className="cof-mode-btn-arrow">→</span>
            </button>
            <button
              className="cof-mode-btn"
              disabled={filteredKeys.length === 0}
              onClick={() => startGame('notes-to-key')}
            >
              <span>
                <span className="cof-mode-btn-num">II. </span>
                Notes of the scale → name the key
              </span>
              <span className="cof-mode-btn-arrow">→</span>
            </button>

            <div className="cof-deck-info">
              <strong>{filteredKeys.length}</strong> keys in deck
            </div>

            <div className="cof-best-row">
              <div className="cof-best-label">Best times · +20s per wrong</div>
              <div className="cof-best-line">
                <span>Key → accidentals</span>
                <strong>{formatTime(bestForDirection('key-to-accidentals'))}</strong>
              </div>
              <div className="cof-best-line">
                <span>Notes → key</span>
                <strong>{formatTime(bestForDirection('notes-to-key'))}</strong>
              </div>
            </div>
          </div>
        )}

        {/* PLAYING */}
        {mode === 'playing' && current && (
          <div className="cof-fade-in">
            <div className="cof-progress-row">
              <span>Card {String(idx + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}</span>
              <span>
                Time · {formatTime(elapsed)}
                {bestForDirection(direction) != null && (
                  <span className="cof-best-inline"> · best {formatTime(bestForDirection(direction))}</span>
                )}
              </span>
              <span>Score · {score}</span>
            </div>
            <div className="cof-progress-bar">
              <div className="cof-progress-fill" style={{ width: `${(idx / deck.length) * 100}%` }} />
            </div>

            <div className="cof-card">
              <div className={`cof-card-inner ${flipped ? 'flipped' : ''}`}>

                {/* FRONT */}
                <div className="cof-card-face">
                  {direction === 'key-to-accidentals' ? (
                    <>
                      <div className="cof-card-label">— Key of —</div>
                      <div className="cof-key-display">{formatName(current.tonic)}</div>
                      <div className="cof-key-quality">{current.mode}</div>
                    </>
                  ) : (
                    <>
                      <div className="cof-card-label">— Notes of the scale —</div>
                      <div className="cof-notes-display">
                        {notesInKey(current).map((n, i, arr) => (
                          <React.Fragment key={i}>
                            <span className="cof-note-chip">{formatName(n)}</span>
                            {i < arr.length - 1 && <span className="cof-note-sep">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* BACK (feedback) */}
                <div className={`cof-card-face cof-card-back ${feedback || ''}`}>
                  {feedback === 'correct' && (
                    <>
                      <div className="cof-feedback-mark correct">✓</div>
                      <div className="cof-feedback-label correct">— Correct —</div>
                      <div className="cof-answer-block">
                        <div className="cof-answer-small">
                          {direction === 'key-to-accidentals' ? 'Accidentals' : 'The key'}
                        </div>
                        <div className="cof-answer-value">
                          {direction === 'key-to-accidentals'
                            ? correctAccidentalDisplay
                            : formatName(current.tonic) + ' ' + current.mode}
                        </div>
                      </div>
                    </>
                  )}
                  {feedback === 'wrong' && (
                    <>
                      <div className="cof-feedback-mark wrong">✗</div>
                      <div className="cof-feedback-label wrong">— Not quite —</div>
                      <div className="cof-answer-block">
                        <div className="cof-answer-small">Your answer</div>
                        <div className="cof-answer-value was-wrong">
                          {results[results.length - 1]?.userAnswer || ''}
                        </div>
                      </div>
                      <div className="cof-answer-block">
                        <div className="cof-answer-small">Correct answer</div>
                        <div className="cof-answer-value">
                          {direction === 'key-to-accidentals'
                            ? correctAccidentalDisplay
                            : formatName(current.tonic) + ' ' + current.mode}
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* INPUT AREA */}
            {!feedback && direction === 'key-to-accidentals' && (
              <>
                <div className="cof-letter-grid">
                  {LETTERS.map((letter) => (
                    <div key={letter} className="cof-letter-col">
                      <div className="cof-letter-label">{letter}</div>
                      <button
                        className={`cof-acc-btn ${letterAnswers[letter] === '#' ? 'active-sharp' : ''}`}
                        onClick={() => toggleLetter(letter, '#')}
                      >♯</button>
                      <button
                        className={`cof-acc-btn ${letterAnswers[letter] === 'b' ? 'active-flat' : ''}`}
                        onClick={() => toggleLetter(letter, 'b')}
                      >♭</button>
                    </div>
                  ))}
                </div>
                <div className="cof-hint">Tap again to deselect · leave blank for naturals</div>
              </>
            )}

            {!feedback && direction === 'notes-to-key' && (
              <>
                <input
                  className="cof-key-input"
                  type="text"
                  autoFocus
                  value={keyAnswer}
                  onChange={(e) => {
                    const v = e.target.value;
                    setKeyAnswer(v.includes(' ') ? v : v.toUpperCase());
                  }}
                  placeholder={options.minor ? 'e.g. G, F#, Am, Ebm' : 'e.g. G, Eb, F#'}
                />
                <div className="cof-hint">Name the major key · # or b accepted</div>
              </>
            )}

            {!feedback ? (
              <button className="cof-btn" onClick={handleSubmit}>
                Save answer ⏎
              </button>
            ) : (
              <button className="cof-btn" onClick={handleNext}>
                {idx + 1 >= deck.length ? 'See your score ⏎' : 'Next card ⏎'}
              </button>
            )}
          </div>
        )}

        {/* FINISHED */}
        {mode === 'finished' && (
          <div className="cof-fade-in">
            <div className="cof-score-display">
              <div className="cof-score-number">
                {scorePercent}<em>%</em>
              </div>
              <div className="cof-score-fraction">{score} of {results.length} correct</div>
              {finalTime != null && (() => {
                const wrong = results.length - score;
                const penalty = wrong * WRONG_PENALTY_MS;
                const raw = finalTime - penalty;
                return (
                  <div className="cof-score-time">
                    {wrong > 0 ? (
                      <>
                        {formatTime(raw)} + {formatTime(penalty)} ({wrong} wrong) · <strong>{formatTime(finalTime)}</strong>
                      </>
                    ) : (
                      <>Time · <strong>{formatTime(finalTime)}</strong></>
                    )}
                    {isNewBest
                      ? <span className="cof-new-best"> — new best!</span>
                      : bestForDirection(direction) != null && (
                          <span className="cof-best-inline"> · best {formatTime(bestForDirection(direction))}</span>
                        )}
                  </div>
                );
              })()}
              <div className="cof-score-verdict">{verdict(scorePercent)}</div>
            </div>

            <div className="cof-results-list">
              <div className="cof-results-heading">— Round summary —</div>
              {results.map((r, i) => {
                const correctStr = LETTERS
                  .filter((l) => accidentalFor(r.card, l))
                  .map((l) => l + (accidentalFor(r.card, l) === '#' ? '♯' : '♭'))
                  .join(' · ') || 'no accidentals';
                return (
                  <div key={i} className="cof-result-item">
                    <span className="cof-result-num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="cof-result-q">
                        {direction === 'key-to-accidentals'
                          ? formatName(r.card.tonic) + ' ' + r.card.mode
                          : notesInKey(r.card).map(formatName).join(' · ')}
                      </div>
                      {!r.correct && (
                        <>
                          <div className="cof-result-q-sub was-wrong">
                            you: {r.userAnswer}
                          </div>
                          <div className="cof-result-q-sub">
                            answer: {direction === 'key-to-accidentals'
                              ? correctStr
                              : formatName(r.card.tonic) + ' ' + r.card.mode}
                          </div>
                        </>
                      )}
                    </div>
                    <span className={`cof-result-mark ${r.correct ? 'correct' : 'wrong'}`}>
                      {r.correct ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="cof-btn-row">
              <button className="cof-btn" onClick={() => startGame(direction)}>
                Play again · shuffled
              </button>
              <button className="cof-btn cof-btn-ghost" onClick={() => setMode('menu')}>
                Change mode
              </button>
            </div>
          </div>
        )}

        <div className="cof-footer">Created by Pierce Porterfield</div>
      </div>
    </div>
  );
}

function formatName(s) {
  return s.replace('#', '♯').replace('b', '♭');
}
function verdict(p) {
  if (p === 100) return '— a perfect recital —';
  if (p >= 90) return '— virtuoso —';
  if (p >= 75) return '— accomplished —';
  if (p >= 50) return '— a fair showing —';
  if (p >= 25) return '— keep at it —';
  return '— back to the études —';
}
