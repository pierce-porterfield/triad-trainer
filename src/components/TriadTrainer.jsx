import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBestTime, recordTime, formatTime, WRONG_PENALTY_MS } from '../utils/bestTimes';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import Staff, { layoutChordNotes } from './Staff.jsx';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import ChordPicker from './ChordPicker.jsx';
import PianoInput from './PianoInput.jsx';
import GuitarInput from './GuitarInput.jsx';
import InputModeSelector from './InputModeSelector.jsx';
import { pcSetsEqual } from '../data/pitchClass';
import { shuffle, notesMatch } from '../data/notes';
import { QUALITIES, buildTriadDeck, chordNameMatch } from '../data/triads';

const buildDeck = buildTriadDeck;

// ============================================================================
// COMPONENT
// ============================================================================
export default function TriadTrainer() {
  const [options, setOptions] = useState({
    base: true,
    dim: true,
    aug: true,
    sevenths: false,
    ninths: false,
    thirteenths: false,
    inputMode: 'tap', // 'tap' | 'staff' | 'piano' | 'guitar'
  });

  const enabledQualities = useMemo(() => {
    const enabled = [];
    if (options.base) enabled.push('maj', 'min');
    if (options.dim) enabled.push('dim');
    if (options.aug) enabled.push('aug');
    if (options.sevenths) {
      enabled.push('maj7', 'dom7', 'min7');
      if (options.dim) enabled.push('m7b5', 'dim7');
    }
    if (options.ninths) enabled.push('maj9', 'dom9', 'min9');
    if (options.thirteenths) enabled.push('maj13', 'dom13', 'min13');
    return enabled;
  }, [options]);

  const filteredDeck = useMemo(() => buildDeck(enabledQualities), [enabledQualities]);

  const [mode, setMode] = useState('options'); // options, menu, playing, finished
  const [direction, setDirection] = useState('chord-to-notes');
  // directions: 'chord-to-notes', 'notes-to-chord'
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({ notes: [], chord: '', staffNotes: [] });
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const optionsKey = useMemo(() =>
    `b${options.base ? 1 : 0}d${options.dim ? 1 : 0}a${options.aug ? 1 : 0}_7${options.sevenths ? 1 : 0}_9${options.ninths ? 1 : 0}_13${options.thirteenths ? 1 : 0}_${options.inputMode}`,
    [options]
  );
  const keyFor = (dir) => `triad-${dir}-${optionsKey}`;
  const bestForDirection = (dir) => getBestTime(keyFor(dir));

  // Live timer tick
  useEffect(() => {
    if (mode !== 'playing' || !startedAt) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [mode, startedAt]);

  const toggleOption = (key) =>
    setOptions((o) => ({ ...o, [key]: !o[key] }));

  const startGame = (dir) => {
    setDirection(dir);
    setDeck(shuffle(filteredDeck));
    setIdx(0);
    setResults([]);
    setAnswers({ notes: [], chord: '', staffNotes: [] });
    setFeedback(null);
    setFlipped(false);
    setStartedAt(Date.now());
    setElapsed(0);
    setFinalTime(null);
    setIsNewBest(false);
    setMode('playing');
  };

  const current = deck[idx];

  const handleSubmit = () => {
    if (feedback) return;
    let isCorrect = false;
    let userAnswer = '';
    if (direction === 'chord-to-notes') {
      if (options.inputMode === 'staff') {
        // Staff: spelling matters (letter + accidental compared directly).
        const userTokens = (answers.staffNotes || []).map((n) => `${n.letter}${n.accidental || ''}`);
        userAnswer = userTokens.length ? userTokens.join(' – ') : '(blank)';
        const expectedSorted = [...current.notes].sort();
        const userSorted = [...userTokens].sort();
        isCorrect =
          userSorted.length === expectedSorted.length &&
          userSorted.every((v, i) => v === expectedSorted[i]);
      } else if (options.inputMode === 'piano' || options.inputMode === 'guitar') {
        // Pitch-class match (sharps and flats compared as the same pitch).
        const userNotes = answers.notes || [];
        userAnswer = userNotes.filter(Boolean).join(' – ') || '(blank)';
        isCorrect = pcSetsEqual(userNotes, current.notes);
      } else {
        const userNotes = answers.notes;
        userAnswer = userNotes.filter(Boolean).join(' – ') || '(blank)';
        isCorrect = notesMatch(userNotes, current.notes);
      }
    } else {
      userAnswer = answers.chord || '(blank)';
      isCorrect = chordNameMatch(answers.chord, current.chordName);
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setFlipped(true);
    setResults((r) => [...r, { card: current, correct: isCorrect, userAnswer }]);
    if (isCorrect) hapticCorrect(); else hapticWrong();
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
      setAnswers({ notes: [], chord: '', staffNotes: [] });
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
      padding: 1.25rem 1rem 2rem;
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
    .tt-back-btn {
      background: transparent;
      border: 1px solid var(--ink-soft);
      cursor: pointer;
      padding: 0.4rem 0.75rem;
      color: var(--ink-soft);
    }
    .tt-back-btn:hover {
      color: var(--accent);
      border-color: var(--accent);
    }
    .tt-header {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .tt-header.compact { margin-bottom: 1rem; }
    .tt-header.compact .tt-title { font-size: clamp(1.5rem, 3.5vw, 2rem); }
    .tt-header.compact .tt-rule { margin: 0.4rem auto; }
    .tt-header.compact .tt-rule::before, .tt-header.compact .tt-rule::after { max-width: 50px; }
    .tt-header.compact .tt-rule-mark { font-size: 0.9rem; }
    .tt-header.compact .tt-eyebrow { font-size: 0.6rem; margin-bottom: 0.25rem; }
    .tt-header.compact .tt-eyebrow:last-child { display: none; }
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

    /* BEST TIMES */
    .tt-best-row {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px dotted var(--ink-soft);
    }
    .tt-best-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      text-align: center;
      margin-bottom: 0.6rem;
    }
    .tt-best-line {
      display: flex; justify-content: space-between;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      padding: 0.2rem 0.5rem;
      color: var(--ink-soft);
    }
    .tt-best-line strong {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--ink);
    }
    .tt-best-inline {
      opacity: 0.7;
      font-size: 0.9em;
    }
    .tt-score-time {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--ink-soft);
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }
    .tt-score-time strong {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-style: normal;
      color: var(--ink);
    }
    .tt-new-best {
      color: var(--accent);
      font-weight: 600;
      font-style: normal;
    }

    /* OPTIONS */
    .tt-options-section {
      margin-bottom: 1.5rem;
    }
    .tt-options-section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.6rem;
    }
    .tt-toggle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
    }
    .tt-toggle {
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
    .tt-toggle:hover { background: #efe5cc; }
    .tt-toggle.on {
      background: var(--ink);
      color: var(--paper);
    }
    .tt-toggle-detail {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      opacity: 0.7;
    }
    .tt-continue-btn {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%;
      background: var(--ink); color: var(--paper);
      border: 1px solid var(--ink);
      padding: 1rem 1.25rem;
      margin-top: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tt-continue-btn:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); }
    .tt-continue-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .tt-continue-btn-arrow { font-family: 'Italiana', serif; font-size: 1.4rem; letter-spacing: normal; }

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
      opacity: 0.12;
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
      margin-bottom: 1.75rem;
      padding: 0 0.5rem;
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
      gap: 0.6rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tt-btn-row .tt-btn { flex: 1 1 140px; min-width: 0; }

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
  // RENDER — playing view uses TrainerLayout for mobile-first full-viewport
  // ============================================================================
  if (mode === 'playing' && current) {
    const inputInterface = !feedback && direction === 'chord-to-notes' ? (
      options.inputMode === 'staff' ? (
        <Staff
          mode="input"
          inputNotes={answers.staffNotes || []}
          onInputChange={(next) => setAnswers((a) => ({ ...a, staffNotes: next }))}
          maxNotes={current.notes.length}
        />
      ) : options.inputMode === 'piano' ? (
        <PianoInput
          value={answers.notes || []}
          onChange={(next) => setAnswers((a) => ({ ...a, notes: next }))}
          maxNotes={current.notes.length}
        />
      ) : options.inputMode === 'guitar' ? (
        <GuitarInput
          value={answers.notes || []}
          onChange={(next) => setAnswers((a) => ({ ...a, notes: next }))}
          maxNotes={current.notes.length}
        />
      ) : (
        (() => {
          const labels = ['1', '3', '5', '7', '9', '13'];
          const names = ['ROOT', '3rd', '5th', '7th', '9th', '13th'];
          return (
            <NotePicker
              count={current.notes.length}
              value={answers.notes}
              onChange={(next) => setAnswers((a) => ({ ...a, notes: next }))}
              slotLabels={labels.slice(0, current.notes.length)}
              slotNames={names.slice(0, current.notes.length)}
            />
          );
        })()
      )
    ) : !feedback && direction === 'notes-to-chord' ? (
      (() => {
        const qualityOptions = enabledQualities.map((k) => {
          const q = QUALITIES[k];
          return { key: k, symbol: q.symbol, label: q.symbol || 'maj' };
        });
        return (
          <ChordPicker
            value={answers.chord}
            onChange={(next) => setAnswers((a) => ({ ...a, chord: next }))}
            qualityOptions={qualityOptions}
          />
        );
      })()
    ) : null;

    const submitButton = !feedback ? (
      <button className="trainer-submit" onClick={handleSubmit}>Submit answer ⏎</button>
    ) : (
      <button className="trainer-submit" onClick={handleNext}>
        {idx + 1 >= deck.length ? 'See your score ⏎' : 'Next card ⏎'}
      </button>
    );

    return (
      <>
        <style>{css}</style>
        <TrainerLayout
          topLeft={
            <button className="trainer-end-btn" onClick={() => setMode('finished')}>
              <span className="trainer-end-arrow">×</span>End
            </button>
          }
          topCenter={<>{String(idx + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}</>}
          topRight={
            <span className="trainer-time-line">
              <span>{formatTime(elapsed)}</span>
              {bestForDirection(direction) != null && (
                <span className="trainer-time-best">/ {formatTime(bestForDirection(direction))}</span>
              )}
            </span>
          }
          progress={idx / deck.length}
          controls={
            <>
              {inputInterface}
              {submitButton}
            </>
          }
        >
          <div className="tt-card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className={`tt-card-inner ${flipped ? 'flipped' : ''}`}>
              {/* FRONT */}
              <div className="tt-card-face">
                {direction === 'chord-to-notes' && (
                  <>
                    <div className="tt-card-label">— Spell the chord —</div>
                    <div className="tt-chord-display">{formatChord(current.chordName)}</div>
                    <div className="tt-chord-quality">{current.qualityLabel}</div>
                  </>
                )}
                {direction === 'notes-to-chord' && (
                  <>
                    <div className="tt-card-label">— Name the chord —</div>
                    {options.inputMode === 'staff' ? (
                      <Staff mode="display" displayNotes={layoutChordNotes(current.notes)} />
                    ) : options.inputMode === 'piano' ? (
                      <PianoInput mode="display" value={current.notes} />
                    ) : options.inputMode === 'guitar' ? (
                      <GuitarInput mode="display" value={current.notes} chordSeed={current.chordName} />
                    ) : (
                      <div className="tt-notes-display">
                        {current.notes.map((n, i) => (
                          <React.Fragment key={i}>
                            <span className="tt-note-chip">{formatNote(n)}</span>
                            {i < current.notes.length - 1 && <span className="tt-note-sep">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* BACK */}
              <div className={`tt-card-face tt-card-back ${feedback || ''}`}>
                {feedback === 'correct' && (
                  <>
                    <div className="tt-feedback-mark correct">✓</div>
                    <div className="tt-feedback-label correct">— Correct —</div>
                    <div className="tt-answer-block">
                      <div className="tt-answer-small">The answer</div>
                      <div className="tt-answer-value">{correctAnswerDisplay(direction, current)}</div>
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
                      <div className="tt-answer-value">{correctAnswerDisplay(direction, current)}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </TrainerLayout>
      </>
    );
  }

  return (
    <div className="tt-root">
      <style>{css}</style>
      <div className="tt-container">

        {mode === 'playing' ? (
          <button className="tt-back tt-back-btn" onClick={() => setMode('finished')}>
            <span className="tt-back-arrow">×</span>
            End study
          </button>
        ) : (
          <Link to="/" className="tt-back">
            <span className="tt-back-arrow">←</span>
            Back to studies
          </Link>
        )}

        {/* HEADER */}
        <header className={`tt-header ${mode === 'playing' ? 'compact' : ''}`}>
          <div className="tt-eyebrow">Opus I</div>
          <h1 className="tt-title">
            Chord <em>Trainer</em>
          </h1>
          <div className="tt-rule"><span className="tt-rule-mark">❦</span></div>
          <div className="tt-eyebrow" style={{ opacity: 0.7 }}>Triads &amp; extended chords</div>
        </header>

        {/* OPTIONS */}
        {mode === 'options' && (
          <div className="tt-menu-card tt-fade-in">
            <div className="tt-menu-label">— Choose your chords —</div>
            <div className="tt-menu-q">Which qualities to include?</div>

            <div className="tt-options-section">
              <div className="tt-options-section-label">Triad qualities</div>
              <div className="tt-toggle-grid">
                <div
                  className={`tt-toggle ${options.base ? 'on' : ''}`}
                  onClick={() => toggleOption('base')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('base'); }}
                >
                  <span>Major + minor</span>
                  <span className="tt-toggle-detail">base</span>
                </div>
                <div
                  className={`tt-toggle ${options.dim ? 'on' : ''}`}
                  onClick={() => toggleOption('dim')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('dim'); }}
                >
                  <span>Diminished</span>
                  <span className="tt-toggle-detail">°</span>
                </div>
                <div
                  className={`tt-toggle ${options.aug ? 'on' : ''}`}
                  onClick={() => toggleOption('aug')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('aug'); }}
                >
                  <span>Augmented</span>
                  <span className="tt-toggle-detail">+</span>
                </div>
              </div>
            </div>

            <div className="tt-options-section">
              <div className="tt-options-section-label">Extended chords</div>
              <div className="tt-toggle-grid">
                <div
                  className={`tt-toggle ${options.sevenths ? 'on' : ''}`}
                  onClick={() => toggleOption('sevenths')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('sevenths'); }}
                >
                  <span>7ths</span>
                  <span className="tt-toggle-detail">
                    maj7 · 7 · m7{options.dim ? ' · m7♭5 · °7' : ''}
                  </span>
                </div>
                <div
                  className={`tt-toggle ${options.ninths ? 'on' : ''}`}
                  onClick={() => toggleOption('ninths')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('ninths'); }}
                >
                  <span>9ths</span>
                  <span className="tt-toggle-detail">maj9 · 9 · m9</span>
                </div>
                <div
                  className={`tt-toggle ${options.thirteenths ? 'on' : ''}`}
                  onClick={() => toggleOption('thirteenths')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption('thirteenths'); }}
                >
                  <span>13ths</span>
                  <span className="tt-toggle-detail">maj13 · 13 · m13</span>
                </div>
              </div>
            </div>

            <div className="tt-options-section">
              <div className="tt-options-section-label">Input mode</div>
              <InputModeSelector
                value={options.inputMode}
                onChange={(id) => setOptions((o) => ({ ...o, inputMode: id }))}
              />
            </div>

            <button
              className="tt-continue-btn"
              onClick={() => setMode('menu')}
              disabled={filteredDeck.length === 0}
            >
              <span>Continue · {filteredDeck.length} cards</span>
              <span className="tt-continue-btn-arrow">→</span>
            </button>

            <div className="tt-deck-info">
              <em>13ths use 1·3·5·7·9·13 (no 11)</em>
            </div>

            <div className="tt-best-row">
              <div className="tt-best-label">Best times for this selection · +20s per wrong</div>
              <div className="tt-best-line">
                <span>Chord → notes</span>
                <strong>{formatTime(bestForDirection('chord-to-notes'))}</strong>
              </div>
              <div className="tt-best-line">
                <span>Notes → chord</span>
                <strong>{formatTime(bestForDirection('notes-to-chord'))}</strong>
              </div>
            </div>
          </div>
        )}

        {/* MENU */}
        {mode === 'menu' && (
          <div className="tt-menu-card tt-fade-in">
            <div className="tt-menu-label">— Select a study —</div>
            <div className="tt-menu-q">Which direction shall we begin?</div>

            <button className="tt-mode-btn" onClick={() => startGame('chord-to-notes')}>
              <span>
                <span className="tt-mode-btn-num">I. </span>
                Chord name → spell the chord
              </span>
              <span className="tt-mode-btn-arrow">→</span>
            </button>
            <button className="tt-mode-btn" onClick={() => startGame('notes-to-chord')}>
              <span>
                <span className="tt-mode-btn-num">II. </span>
                Notes → name the chord
              </span>
              <span className="tt-mode-btn-arrow">→</span>
            </button>
            <div className="tt-deck-info">
              <strong>{filteredDeck.length}</strong> cards in deck
            </div>
            <div className="tt-best-row">
              <div className="tt-best-label">Best times for this selection · +20s per wrong</div>
              <div className="tt-best-line">
                <span>Chord → notes</span>
                <strong>{formatTime(bestForDirection('chord-to-notes'))}</strong>
              </div>
              <div className="tt-best-line">
                <span>Notes → chord</span>
                <strong>{formatTime(bestForDirection('notes-to-chord'))}</strong>
              </div>
            </div>
            <button
              className="tt-continue-btn"
              style={{ background: 'transparent', color: 'var(--ink)', marginTop: '1rem' }}
              onClick={() => setMode('options')}
            >
              <span>← Change chord selection</span>
              <span></span>
            </button>
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
              {finalTime != null && (() => {
                const wrong = results.length - score;
                const penalty = wrong * WRONG_PENALTY_MS;
                const raw = finalTime - penalty;
                return (
                  <div className="tt-score-time">
                    {wrong > 0 ? (
                      <>
                        {formatTime(raw)} + {formatTime(penalty)} ({wrong} wrong) · <strong>{formatTime(finalTime)}</strong>
                      </>
                    ) : (
                      <>Time · <strong>{formatTime(finalTime)}</strong></>
                    )}
                    {isNewBest
                      ? <span className="tt-new-best"> — new best!</span>
                      : bestForDirection(direction) != null && (
                          <span className="tt-best-inline"> · best {formatTime(bestForDirection(direction))}</span>
                        )}
                  </div>
                );
              })()}
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
              <button className="tt-btn tt-btn-ghost" onClick={() => setMode('options')}>
                Change chords
              </button>
            </div>
          </div>
        )}

        <div className="tt-footer">Created by Pierce Porterfield</div>
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
  return formatChord(card.chordName);
}
// What the prompt looks like in the results summary
function resultPrompt(direction, card) {
  if (direction === 'chord-to-notes') return formatChord(card.chordName);
  return card.notes.map(formatNote).join(' · ');
}
function verdict(p) {
  if (p === 100) return '— a perfect recital —';
  if (p >= 90) return '— virtuoso —';
  if (p >= 75) return '— accomplished —';
  if (p >= 50) return '— a fair showing —';
  if (p >= 25) return '— keep at it —';
  return '— back to the études —';
}
