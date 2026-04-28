import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBestTime, recordTime, formatTime, WRONG_PENALTY_MS } from '../utils/bestTimes';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import Staff from './Staff.jsx';
import PianoInput from './PianoInput.jsx';
import GuitarInput from './GuitarInput.jsx';
import InputModeSelector from './InputModeSelector.jsx';
import { shuffle, notesEqual, formatNote } from '../data/notes';
import { INTERVALS, INTERVAL_BY_ID, GROUPS, buildIntervalDeck } from '../data/intervals';
import { pcSetsEqual, spellInContext } from '../data/pitchClass';

const buildDeck = buildIntervalDeck;

// ============================================================================
// COMPONENT
// ============================================================================
export default function IntervalTrainer() {
  const defaultActive = GROUPS.map((g) => g.id);
  const [activeGroups, setActiveGroups] = useState(defaultActive);
  const activeIntervalIds = useMemo(
    () => activeGroups.flatMap((gid) => GROUPS.find((g) => g.id === gid).intervalIds),
    [activeGroups]
  );
  // Flow: options (interval + input mode setup) → menu (direction picker)
  // → playing → done. Mirrors Chord Trainer's two-step setup.
  const [mode, setMode] = useState('options'); // 'options' | 'menu' | 'playing' | 'done'
  const [inputMode, setInputMode] = useState('tap'); // 'tap' | 'staff' | 'piano' | 'guitar'
  // Forward ('find-note'): card shows a root + interval, user names the resulting note.
  // Reverse ('find-root'): card shows a note + interval, user names the root it sits above.
  const [direction, setDirection] = useState('find-note');
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [staffNotes, setStaffNotes] = useState([]); // for staff mode: [{letter, accidental, octave}]
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [lastWrongAnswer, setLastWrongAnswer] = useState('');

  const current = deck[idx];

  const settingsKey = useMemo(
    () => `interval-${[...activeGroups].sort().join('_')}_${inputMode}_${direction}`,
    [activeGroups, inputMode, direction]
  );
  const bestTime = getBestTime(settingsKey);
  // Look up the best time for a specific direction without changing the
  // currently-selected `direction`. Used on the menu screen to show both
  // direction's bests next to their buttons.
  const bestForDirection = (dir) =>
    getBestTime(`interval-${[...activeGroups].sort().join('_')}_${inputMode}_${dir}`);

  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    if (mode !== 'playing' || !startedAt) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [mode, startedAt]);

  const toggleGroup = (id) => {
    setActiveGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allOn = () => setActiveGroups(GROUPS.map((g) => g.id));
  const allOff = () => setActiveGroups([]);

  const startGame = (dir) => {
    if (activeIntervalIds.length === 0) return;
    if (dir) setDirection(dir);
    const newDeck = shuffle(buildDeck(activeIntervalIds));
    setDeck(newDeck);
    setIdx(0);
    setAnswer('');
    setStaffNotes([]);
    setFeedback(null);
    setScore(0);
    setLastWrongAnswer('');
    setStartedAt(Date.now());
    setElapsed(0);
    setFinalTime(null);
    setIsNewBest(false);
    setMode('playing');
  };

  const submit = () => {
    if (feedback || !current) return;
    // The deck always stores the relationship as (root, note) where note =
    // root + interval. In forward mode the prompt is the root and we grade
    // against the note; in reverse mode the prompt is the note and we grade
    // against the root.
    const target = direction === 'find-root' ? current.root : current.note;
    let isCorrect = false;
    let userAnswer = '';
    if (inputMode === 'staff') {
      const tok = staffNotes[0];
      userAnswer = tok ? `${tok.letter}${tok.accidental || ''}` : '(blank)';
      // Staff: spelling matters
      isCorrect = !!tok && `${tok.letter}${tok.accidental || ''}` === target;
    } else {
      // For piano/guitar/tap inputs: echo the user's pick in the
      // expected note's spelling (so clicking the pitch class of E♭ inside
      // a "minor 3rd above C" prompt displays as "E♭", not "D♯").
      // No context-match (totally wrong pitch) falls back to "flat/sharp".
      userAnswer = answer
        ? spellInContext(answer, [target], { ambiguousFallback: true })
        : '(blank)';
      isCorrect = notesEqual(answer, target);
    }
    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 1);
      hapticCorrect();
    } else {
      setFeedback('wrong');
      setLastWrongAnswer(userAnswer);
      hapticWrong();
    }
  };

  const next = () => {
    if (idx + 1 >= deck.length) {
      const raw = Date.now() - startedAt;
      const wrong = deck.length - score;
      const adjusted = raw + wrong * WRONG_PENALTY_MS;
      setFinalTime(adjusted);
      setIsNewBest(recordTime(settingsKey, adjusted));
      setMode('done');
    } else {
      setIdx((i) => i + 1);
      setAnswer('');
      setStaffNotes([]);
      setFeedback(null);
      setLastWrongAnswer('');
    }
  };

  // Enter key: submit, then next
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      if (mode !== 'playing') return;
      if (feedback) next();
      else submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, feedback, answer, idx, deck]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

    .it-root {
      --ink: #1a1410;
      --ink-soft: #3d342b;
      --paper: #f4ecdc;
      --paper-deep: #ebe0c9;
      --paper-shadow: #d9cbad;
      --accent: #8b2c20;
      --gold: #a88734;
      --green: #2f6d4f;
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: var(--ink);
      background: var(--paper);
      background-image:
        radial-gradient(ellipse at top left, rgba(168, 135, 52, 0.08), transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(139, 44, 32, 0.06), transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 20, 16, 0.012) 2px, rgba(26, 20, 16, 0.012) 3px);
      min-height: 100vh;
      padding: 1.5rem 1rem 3rem;
      position: relative;
      overflow-x: hidden;
    }
    .it-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
      opacity: 0.12;
      pointer-events: none;
      mix-blend-mode: multiply;
    }
    .it-container {
      max-width: 720px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .it-back {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      opacity: 0.7;
    }
    .it-back:hover { opacity: 1; color: var(--accent); }
    .it-back-arrow { font-family: 'Italiana', serif; font-size: 1.2rem; letter-spacing: normal; }
    .it-back-btn {
      background: transparent;
      border: 1px solid var(--ink-soft);
      cursor: pointer;
      padding: 0.4rem 0.75rem;
      opacity: 1;
    }
    .it-back-btn:hover { color: var(--accent); border-color: var(--accent); }

    .it-header { text-align: center; margin-bottom: 2rem; }
    .it-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin-bottom: 0.5rem;
    }
    .it-title {
      font-family: 'Italiana', serif;
      font-size: clamp(2rem, 5.5vw, 3.25rem);
      font-weight: 400;
      line-height: 0.95;
      margin: 0;
    }
    .it-title em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--accent);
    }
    .it-rule {
      display: flex; align-items: center; gap: 0.75rem; justify-content: center;
      margin: 1rem auto; color: var(--ink-soft);
    }
    .it-rule::before, .it-rule::after {
      content: ''; height: 1px; background: var(--ink-soft);
      flex: 1; max-width: 80px; opacity: 0.4;
    }
    .it-rule-mark { font-family: 'Italiana', serif; font-size: 1.3rem; }

    .it-panel {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 1.75rem 1.5rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      position: relative;
    }
    .it-panel::before {
      content: ''; position: absolute; inset: 6px;
      border: 1px solid var(--ink); opacity: 0.25; pointer-events: none;
    }
    .it-panel-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase;
      color: var(--ink-soft); margin-bottom: 0.75rem; text-align: center;
    }
    .it-panel-q {
      font-family: 'Italiana', serif; font-size: 1.4rem;
      text-align: center; margin-bottom: 1.25rem;
    }

    .it-toggle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .it-toggle {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 0.85rem;
      background: var(--paper);
      border: 1px solid var(--ink);
      cursor: pointer;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      transition: all 0.15s ease;
      user-select: none;
    }
    .it-toggle:hover { background: #efe5cc; }
    .it-toggle.on {
      background: var(--ink);
      color: var(--paper);
    }
    .it-toggle-short {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      opacity: 0.7;
    }
    .it-toggle-actions {
      display: flex; gap: 0.5rem; justify-content: center;
      margin-bottom: 1.25rem;
    }
    /* Chord-trainer-style mode buttons used on the direction-picker screen. */
    .it-mode-btn {
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
    .it-mode-btn:hover {
      background: var(--ink);
      color: var(--paper);
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0 var(--accent);
    }
    .it-mode-btn em {
      font-style: italic;
      color: var(--accent);
    }
    .it-mode-btn:hover em { color: var(--gold); }
    .it-mode-btn-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      opacity: 0.6;
      letter-spacing: 0.15em;
    }
    .it-mode-btn-arrow {
      font-family: 'Italiana', serif;
      font-size: 1.4rem;
    }

    .it-direction-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .it-direction-btn {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 0.7rem 0.85rem;
      background: var(--paper);
      border: 1px solid var(--ink);
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      color: var(--ink);
      transition: all 0.15s ease;
    }
    .it-direction-btn:hover { background: #efe5cc; }
    .it-direction-btn.on { background: var(--ink); color: var(--paper); }
    .it-direction-label {
      font-family: 'Italiana', serif;
      font-size: 1.05rem;
    }
    .it-direction-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      color: var(--ink-soft);
      opacity: 0.85;
    }
    .it-direction-btn.on .it-direction-sub { color: var(--gold); opacity: 1; }
    .it-direction-sub em {
      font-style: normal;
      color: var(--accent);
      font-weight: 600;
    }
    .it-direction-btn.on .it-direction-sub em { color: var(--gold); }
    .it-mini-btn {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
      background: transparent; border: 1px solid var(--ink-soft);
      color: var(--ink-soft); padding: 0.4rem 0.8rem; cursor: pointer;
    }
    .it-mini-btn:hover { color: var(--accent); border-color: var(--accent); }

    .it-start-btn {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%;
      background: var(--ink); color: var(--paper);
      border: 1px solid var(--ink);
      padding: 1rem 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .it-start-btn:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); }
    .it-start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .it-start-btn-arrow { font-family: 'Italiana', serif; font-size: 1.4rem; letter-spacing: normal; }

    .it-deck-info {
      text-align: center;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--ink-soft);
      margin-top: 1rem;
      font-size: 0.95rem;
    }

    .it-progress-row {
      display: flex; justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--ink-soft); margin-bottom: 0.5rem;
    }
    .it-progress-bar {
      height: 2px; background: var(--paper-shadow);
      margin-bottom: 1.5rem;
    }
    .it-progress-fill {
      height: 100%; background: var(--accent);
      transition: width 0.3s ease;
    }

    .it-card {
      background: var(--paper-deep);
      border: 1px solid var(--ink);
      padding: 2.5rem 1.5rem;
      box-shadow: 8px 8px 0 var(--paper-shadow);
      position: relative;
      text-align: center;
      margin-bottom: 1.25rem;
      min-height: 220px;
      display: flex; flex-direction: column; justify-content: center;
    }
    .it-card::before {
      content: ''; position: absolute; inset: 6px;
      border: 1px solid var(--ink); opacity: 0.25; pointer-events: none;
    }
    .it-card.correct { border-color: var(--green); }
    .it-card.wrong { border-color: var(--accent); }

    .it-card-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--ink-soft); margin-bottom: 1rem;
    }
    .it-prompt {
      font-family: 'Italiana', serif;
      font-size: clamp(1.6rem, 5vw, 2.2rem);
      line-height: 1.2;
    }
    .it-prompt em {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--accent);
    }
    .it-prompt-root {
      font-family: 'Italiana', serif;
      font-size: clamp(2.5rem, 8vw, 4rem);
      color: var(--ink);
      margin-top: 0.25rem;
    }

    .it-feedback-mark { font-size: 3rem; line-height: 1; margin-bottom: 0.5rem; }
    .it-feedback-mark.correct { color: var(--green); }
    .it-feedback-mark.wrong { color: var(--accent); }
    .it-answer-row {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      color: var(--ink-soft);
      margin: 0.25rem 0;
    }
    .it-answer-row strong {
      font-family: 'Italiana', serif;
      font-weight: 400;
      font-size: 1.6rem;
      color: var(--ink);
      letter-spacing: 0.05em;
    }
    .it-answer-row.was-wrong strong { color: var(--accent); text-decoration: line-through; }

    .it-input-row { display: flex; justify-content: center; margin-bottom: 0.75rem; }
    .it-note-input {
      width: 8rem; max-width: 100%;
      text-align: center;
      font-family: 'Italiana', serif;
      font-size: 2rem;
      padding: 0.5rem 0.75rem;
      background: var(--paper);
      border: 1px solid var(--ink);
      color: var(--ink);
      outline: none;
    }
    .it-note-input:focus { border-color: var(--accent); }
    .it-hint {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--ink-soft); opacity: 0.6;
    }

    .it-action-row {
      display: flex; gap: 0.75rem; justify-content: center;
      margin-top: 1.25rem;
    }
    .it-btn {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
      background: var(--ink); color: var(--paper);
      border: 1px solid var(--ink);
      padding: 0.7rem 1.4rem; cursor: pointer;
    }
    .it-btn:hover { background: var(--accent); border-color: var(--accent); }
    .it-btn.ghost { background: transparent; color: var(--ink); }
    .it-btn.ghost:hover { background: var(--ink); color: var(--paper); }

    .it-done-mark {
      font-family: 'Italiana', serif;
      font-size: 4rem; text-align: center; margin-bottom: 0.5rem;
    }
    .it-done-score {
      font-family: 'Italiana', serif;
      font-size: 2rem; text-align: center; margin-bottom: 1.5rem;
    }
    .it-done-score em {
      font-style: italic; color: var(--accent);
    }

    .it-footer {
      text-align: center; margin-top: 2.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--ink-soft); opacity: 0.5;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .it-fade-in { animation: fadeIn 0.35s ease forwards; }

    .it-best-row {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px dotted var(--ink-soft);
    }
    .it-best-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--ink-soft);
      text-align: center;
      margin-bottom: 0.5rem;
    }
    .it-best-line {
      display: flex; justify-content: space-between;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      padding: 0.2rem 0.5rem;
      color: var(--ink-soft);
    }
    .it-best-line strong {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--ink);
    }
    .it-best-inline { opacity: 0.7; font-size: 0.9em; }
    .it-score-time {
      text-align: center;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: var(--ink-soft);
      margin-bottom: 1rem;
      font-size: 1.05rem;
    }
    .it-score-time strong {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-style: normal;
      color: var(--ink);
    }
    .it-new-best { color: var(--accent); font-weight: 600; font-style: normal; }
  `;

  if (mode === 'playing' && current) {
    const inputInterface = !feedback ? (
      inputMode === 'staff' ? (
        <Staff
          mode="input"
          inputNotes={staffNotes}
          onInputChange={setStaffNotes}
          maxNotes={1}
        />
      ) : inputMode === 'piano' ? (
        <PianoInput
          value={answer ? [answer] : []}
          onChange={(next) => setAnswer(next[next.length - 1] || '')}
          maxNotes={1}
        />
      ) : inputMode === 'guitar' ? (
        <GuitarInput
          value={answer ? [answer] : []}
          onChange={(next) => setAnswer(next[next.length - 1] || '')}
          maxNotes={1}
        />
      ) : (
        <NotePicker
          count={1}
          value={[answer]}
          onChange={(next) => setAnswer(next[0] || '')}
          slotLabels={['?']}
          slotNames={['ANSWER']}
        />
      )
    ) : null;

    const submitButton = !feedback ? (
      <button className="trainer-submit" onClick={submit}>Submit ⏎</button>
    ) : (
      <button className="trainer-submit" onClick={next}>
        {idx + 1 >= deck.length ? 'Finish ⏎' : 'Next ⏎'}
      </button>
    );

    return (
      <>
        <style>{css}</style>
        <TrainerLayout
          topLeft={
            <button className="trainer-end-btn" onClick={() => setMode('done')}>
              <span className="trainer-end-arrow">×</span>End
            </button>
          }
          topCenter={<>{String(idx + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}</>}
          topRight={
            <span className="trainer-time-line">
              <span>{formatTime(elapsed)}</span>
              {bestTime != null && <span className="trainer-time-best">/ {formatTime(bestTime)}</span>}
            </span>
          }
          progress={idx / deck.length}
          controls={<>{inputInterface}{submitButton}</>}
        >
          <div className={`it-card ${feedback || ''}`} style={{ width: '100%', maxWidth: '480px' }}>
            {!feedback && direction === 'find-note' && (
              <>
                <div className="it-card-label">— A {current.interval.label} above —</div>
                <div className="it-prompt-root">{formatNote(current.root)}</div>
              </>
            )}
            {!feedback && direction === 'find-root' && (
              <>
                <div className="it-prompt-root">{formatNote(current.note)}</div>
                <div className="it-card-label">— is the {current.interval.label} of —</div>
              </>
            )}
            {feedback === 'correct' && (
              <>
                <div className="it-feedback-mark correct">✓</div>
                <div className="it-card-label">— Correct —</div>
                <div className="it-answer-row">
                  {direction === 'find-note' ? (
                    <>
                      {current.interval.label} above {formatNote(current.root)} is{' '}
                      <strong>{formatNote(current.note)}</strong>
                    </>
                  ) : (
                    <>
                      <strong>{formatNote(current.root)}</strong> + {current.interval.label} ={' '}
                      {formatNote(current.note)}
                    </>
                  )}
                </div>
              </>
            )}
            {feedback === 'wrong' && (
              <>
                <div className="it-feedback-mark wrong">✗</div>
                <div className="it-card-label">— Not quite —</div>
                <div className="it-answer-row was-wrong">
                  Your answer · <strong>{lastWrongAnswer}</strong>
                </div>
                <div className="it-answer-row">
                  Correct · <strong>{formatNote(direction === 'find-root' ? current.root : current.note)}</strong>
                </div>
              </>
            )}
          </div>
        </TrainerLayout>
      </>
    );
  }

  return (
    <div className="it-root">
      <style>{css}</style>
      <div className="it-container">

        {mode === 'playing' ? (
          <button className="it-back it-back-btn" onClick={() => setMode('done')}>
            <span className="it-back-arrow">×</span>
            End study
          </button>
        ) : (
          <Link to="/" className="it-back">
            <span className="it-back-arrow">←</span>
            Back to studies
          </Link>
        )}

        <header className="it-header">
          <div className="it-eyebrow">Opus III</div>
          <h1 className="it-title">
            Interval <em>Trainer</em>
          </h1>
          <div className="it-rule"><span className="it-rule-mark">❦</span></div>
          <div className="it-eyebrow" style={{ opacity: 0.7 }}>Name the note based on the root and interval</div>
        </header>

        {/* OPTIONS — interval selection + input mode */}
        {mode === 'options' && (
          <div className="it-panel it-fade-in">
            <div className="it-panel-label">— Choose your intervals —</div>
            <div className="it-panel-q">Toggle the intervals to study</div>

            <div className="it-toggle-grid">
              {GROUPS.map((g) => {
                const on = activeGroups.includes(g.id);
                const variantLabel = g.intervalIds.length > 1
                  ? 'maj + min'
                  : INTERVAL_BY_ID[g.intervalIds[0]].short;
                return (
                  <div
                    key={g.id}
                    className={`it-toggle ${on ? 'on' : ''}`}
                    onClick={() => toggleGroup(g.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleGroup(g.id); }}
                  >
                    <span>{g.label}</span>
                    <span className="it-toggle-short">{variantLabel}</span>
                  </div>
                );
              })}
            </div>

            <div className="it-toggle-actions">
              <button className="it-mini-btn" onClick={allOn}>All on</button>
              <button className="it-mini-btn" onClick={allOff}>All off</button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div className="it-best-label" style={{ marginBottom: '0.5rem' }}>Input mode</div>
              <InputModeSelector value={inputMode} onChange={setInputMode} />
            </div>

            <button
              className="it-start-btn"
              onClick={() => setMode('menu')}
              disabled={activeIntervalIds.length === 0}
            >
              <span>Continue · {activeIntervalIds.length} intervals</span>
              <span className="it-start-btn-arrow">→</span>
            </button>

            <div className="it-deck-info">
              Pick which intervals to drill, then choose a direction on the next screen.
            </div>
          </div>
        )}

        {/* MENU — direction picker */}
        {mode === 'menu' && (
          <div className="it-panel it-fade-in">
            <div className="it-panel-label">— Select a study —</div>
            <div className="it-panel-q">Which direction shall we begin?</div>

            <button
              className="it-mode-btn"
              onClick={() => startGame('find-note')}
            >
              <span>
                <span className="it-mode-btn-num">I. </span>
                Root + interval → <em>find the note</em>
              </span>
              <span className="it-mode-btn-arrow">→</span>
            </button>
            <button
              className="it-mode-btn"
              onClick={() => startGame('find-root')}
            >
              <span>
                <span className="it-mode-btn-num">II. </span>
                Note + interval → <em>find the root</em>
              </span>
              <span className="it-mode-btn-arrow">→</span>
            </button>

            <div className="it-deck-info">
              <strong>{activeIntervalIds.length}</strong> intervals in deck
            </div>

            <div className="it-best-row">
              <div className="it-best-label">Best times for this selection · +20s per wrong</div>
              <div className="it-best-line">
                <span>Find the note</span>
                <strong>{formatTime(bestForDirection('find-note'))}</strong>
              </div>
              <div className="it-best-line">
                <span>Find the root</span>
                <strong>{formatTime(bestForDirection('find-root'))}</strong>
              </div>
            </div>

            <button
              className="it-start-btn"
              style={{ background: 'transparent', color: 'var(--ink)', marginTop: '1rem' }}
              onClick={() => setMode('options')}
            >
              <span>← Change interval selection</span>
              <span></span>
            </button>
          </div>
        )}

        {/* DONE */}
        {mode === 'done' && (
          <div className="it-panel it-fade-in" style={{ textAlign: 'center' }}>
            <div className="it-done-mark">❦</div>
            <div className="it-panel-label">— Study complete —</div>
            <div className="it-done-score">
              <em>{score}</em> / {deck.length} correct
            </div>
            {finalTime != null && (() => {
              const wrong = deck.length - score;
              const penalty = wrong * WRONG_PENALTY_MS;
              const raw = finalTime - penalty;
              return (
                <div className="it-score-time">
                  {wrong > 0 ? (
                    <>
                      {formatTime(raw)} + {formatTime(penalty)} ({wrong} wrong) · <strong>{formatTime(finalTime)}</strong>
                    </>
                  ) : (
                    <>Time · <strong>{formatTime(finalTime)}</strong></>
                  )}
                  {isNewBest
                    ? <span className="it-new-best"> — new best!</span>
                    : bestTime != null && (
                        <span className="it-best-inline"> · best {formatTime(bestTime)}</span>
                      )}
                </div>
              );
            })()}
            <div className="it-action-row">
              <button className="it-btn" onClick={() => startGame()}>Again</button>
              <button className="it-btn ghost" onClick={() => setMode('menu')}>Change direction</button>
              <button className="it-btn ghost" onClick={() => setMode('options')}>Change intervals</button>
            </div>
          </div>
        )}

        <div className="it-footer">Created by Pierce Porterfield</div>
      </div>
    </div>
  );
}
