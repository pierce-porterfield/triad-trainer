import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBestTime, recordTime, formatTime, WRONG_PENALTY_MS } from '../utils/bestTimes';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import Staff from './Staff.jsx';
import PianoInput from './PianoInput.jsx';
import GuitarInput from './GuitarInput.jsx';
import InputModeSelector, { INPUT_MODES } from './InputModeSelector.jsx';
import { shuffle, formatNote, notesEqual } from '../data/notes';
import { noteToPc } from '../data/pitchClass';

// One row per pitch class. `natural` covers white-key letters; sharp/flat
// covers the five accidentals — we randomly pick a spelling per card so the
// user practices reading both directions.
const PCS = [
  { pc: 0,  natural: { letter: 'C', accidental: '' } },
  { pc: 1,  sharp: { letter: 'C', accidental: '#' }, flat: { letter: 'D', accidental: 'b' } },
  { pc: 2,  natural: { letter: 'D', accidental: '' } },
  { pc: 3,  sharp: { letter: 'D', accidental: '#' }, flat: { letter: 'E', accidental: 'b' } },
  { pc: 4,  natural: { letter: 'E', accidental: '' } },
  { pc: 5,  natural: { letter: 'F', accidental: '' } },
  { pc: 6,  sharp: { letter: 'F', accidental: '#' }, flat: { letter: 'G', accidental: 'b' } },
  { pc: 7,  natural: { letter: 'G', accidental: '' } },
  { pc: 8,  sharp: { letter: 'G', accidental: '#' }, flat: { letter: 'A', accidental: 'b' } },
  { pc: 9,  natural: { letter: 'A', accidental: '' } },
  { pc: 10, sharp: { letter: 'A', accidental: '#' }, flat: { letter: 'B', accidental: 'b' } },
  { pc: 11, natural: { letter: 'B', accidental: '' } },
];

// Re-use the trainer-wide icon set; tap isn't a "display" so we drop it.
const DISPLAY_MODES = INPUT_MODES.filter((m) => m.id !== 'tap');

// Pick a spelling for a pitch class. Naturals are deterministic; accidentals
// flip sharp/flat by the seed to keep deck variety while staying reproducible.
const pickSpelling = (entry, seed) => {
  if (entry.natural) return { ...entry.natural, mode: 'natural' };
  const useSharp = (seed & 1) === 0;
  return useSharp
    ? { ...entry.sharp, mode: 'sharp' }
    : { ...entry.flat, mode: 'flat' };
};

// Build 12 cards — one per pitch class. Each gets a random spelling (where
// applicable), a random display mode chosen from the user's selection, and
// random position metadata for staff (octave) / piano + guitar (seed for
// chordSeed-driven octave or fret).
const buildDeck = (selectedModes) => {
  return PCS.map((entry, i) => {
    const spelling = pickSpelling(entry, Math.floor(Math.random() * 1000) + i);
    const note = `${spelling.letter}${spelling.accidental}`;
    const displayMode = selectedModes[Math.floor(Math.random() * selectedModes.length)];
    // Treble-clef-friendly octaves: middle-C (4) or one above (5).
    const octave = 4 + Math.floor(Math.random() * 2);
    // Stable seed for piano/guitar position randomisation.
    const seed = `note-${i}-${note}-${Math.floor(Math.random() * 1e6)}`;
    return { id: `${i}-${note}`, pc: entry.pc, note, spelling, displayMode, octave, seed };
  });
};

export default function NoteTrainer() {
  const [activeModes, setActiveModes] = useState(['staff', 'piano', 'guitar']);
  const [phase, setPhase] = useState('menu'); // 'menu' | 'playing' | 'done'
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [lastWrongAnswer, setLastWrongAnswer] = useState('');

  const current = deck[idx];

  const settingsKey = useMemo(
    () => `note-${[...activeModes].sort().join('_')}`,
    [activeModes]
  );
  const bestTime = getBestTime(settingsKey);

  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    if (phase !== 'playing' || !startedAt) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [phase, startedAt]);

  const toggleMode = (id) => {
    setActiveModes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const startGame = () => {
    if (activeModes.length === 0) return;
    setDeck(buildDeck(activeModes));
    setIdx(0);
    setAnswer('');
    setFeedback(null);
    setScore(0);
    setLastWrongAnswer('');
    setStartedAt(Date.now());
    setElapsed(0);
    setFinalTime(null);
    setIsNewBest(false);
    setPhase('playing');
  };

  const submit = () => {
    if (feedback || !current) return;
    const userAnswer = answer || '(blank)';
    let isCorrect = false;
    if (current.displayMode === 'staff') {
      // Staff shows a specific spelling — answer must match it exactly.
      isCorrect = answer === current.note;
    } else {
      // Piano + guitar are pitch-class only; accept enharmonic equivalents.
      isCorrect = !!answer && noteToPc(answer) === current.pc;
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
      setPhase('done');
    } else {
      setIdx((i) => i + 1);
      setAnswer('');
      setFeedback(null);
      setLastWrongAnswer('');
    }
  };

  // Enter: submit then advance.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      if (phase !== 'playing') return;
      if (feedback) next();
      else submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, feedback, answer, idx, deck]);

  // Render the prompt for the current card — staff / piano / guitar with the
  // pitch shown in display mode.
  const renderPrompt = () => {
    if (!current) return null;
    if (current.displayMode === 'staff') {
      return (
        <Staff
          mode="display"
          displayNotes={[{
            letter: current.spelling.letter,
            accidental: current.spelling.accidental,
            octave: current.octave,
          }]}
        />
      );
    }
    if (current.displayMode === 'piano') {
      return (
        <PianoInput
          mode="display"
          value={[current.note]}
          chordSeed={current.seed}
        />
      );
    }
    return (
      <GuitarInput
        mode="display"
        value={[current.note]}
        chordSeed={current.seed}
      />
    );
  };

  const promptLabel = current && (
    current.displayMode === 'staff'  ? '— Name the note on the staff —' :
    current.displayMode === 'piano'  ? '— Name the highlighted key —' :
    /* guitar */                       '— Name the note on the fretboard —'
  );

  if (phase === 'playing' && current) {
    const inputInterface = !feedback ? (
      <NotePicker
        count={1}
        value={[answer]}
        onChange={(next) => setAnswer(next[0] || '')}
        slotLabels={['?']}
        slotNames={['ANSWER']}
      />
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
            <button className="trainer-end-btn" onClick={() => setPhase('done')}>
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
          <div className={`nt-card ${feedback || ''}`}>
            {!feedback && (
              <>
                <div className="nt-card-label">{promptLabel}</div>
                <div className="nt-prompt-area">{renderPrompt()}</div>
              </>
            )}
            {feedback === 'correct' && (
              <>
                <div className="nt-feedback-mark correct">✓</div>
                <div className="nt-card-label">— Correct —</div>
                <div className="nt-answer-row">
                  <strong>{formatNote(current.note)}</strong>
                </div>
              </>
            )}
            {feedback === 'wrong' && (
              <>
                <div className="nt-feedback-mark wrong">✗</div>
                <div className="nt-card-label">— Not quite —</div>
                <div className="nt-answer-row was-wrong">
                  Your answer · <strong>{lastWrongAnswer}</strong>
                </div>
                <div className="nt-answer-row">
                  Correct · <strong>{formatNote(current.note)}</strong>
                </div>
              </>
            )}
          </div>
        </TrainerLayout>
      </>
    );
  }

  return (
    <div className="nt-root">
      <style>{css}</style>
      <div className="nt-container">

        {phase === 'playing' ? (
          <button className="nt-back nt-back-btn" onClick={() => setPhase('done')}>
            <span className="nt-back-arrow">×</span>
            End study
          </button>
        ) : (
          <Link to="/" className="nt-back">
            <span className="nt-back-arrow">←</span>
            Back to studies
          </Link>
        )}

        <header className="nt-header">
          <div className="nt-eyebrow">Opus IV</div>
          <h1 className="nt-title">
            Note <em>Trainer</em>
          </h1>
          <div className="nt-rule"><span className="nt-rule-mark">❦</span></div>
          <div className="nt-eyebrow" style={{ opacity: 0.7 }}>
            Identify the note shown on the staff, piano, or fretboard
          </div>
        </header>

        {phase === 'menu' && (
          <div className="nt-panel nt-fade-in">
            <div className="nt-panel-label">— Choose your displays —</div>
            <div className="nt-panel-q">Toggle the input forms to study</div>

            <div className="nt-mode-row">
              <InputModeSelector
                value={activeModes}
                onChange={toggleMode}
                modes={DISPLAY_MODES}
              />
            </div>

            <button
              className="nt-start-btn"
              onClick={startGame}
              disabled={activeModes.length === 0}
            >
              <span>Begin study · 12 notes</span>
              <span className="nt-start-btn-arrow">→</span>
            </button>

            <div className="nt-best-row">
              <div className="nt-best-label">Best time for this selection · +20s per wrong</div>
              <div className="nt-best-line">
                <span>Time to beat</span>
                <strong>{formatTime(bestTime)}</strong>
              </div>
            </div>

            <div className="nt-deck-info">
              Each card shows a single note on one of your chosen displays —
              guitar fret position and staff octave randomise per card. Tap the
              letter (and accidental, if any) to answer.
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="nt-panel nt-fade-in" style={{ textAlign: 'center' }}>
            <div className="nt-done-mark">❦</div>
            <div className="nt-panel-label">— Study complete —</div>
            <div className="nt-done-score">
              <em>{score}</em> / {deck.length} correct
            </div>
            {finalTime != null && (() => {
              const wrong = deck.length - score;
              const penalty = wrong * WRONG_PENALTY_MS;
              const raw = finalTime - penalty;
              return (
                <div className="nt-score-time">
                  {wrong > 0 ? (
                    <>
                      {formatTime(raw)} + {formatTime(penalty)} ({wrong} wrong) · <strong>{formatTime(finalTime)}</strong>
                    </>
                  ) : (
                    <>Time · <strong>{formatTime(finalTime)}</strong></>
                  )}
                  {isNewBest
                    ? <span className="nt-new-best"> — new best!</span>
                    : bestTime != null && (
                        <span className="nt-best-inline"> · best {formatTime(bestTime)}</span>
                      )}
                </div>
              );
            })()}
            <div className="nt-action-row">
              <button className="nt-btn" onClick={startGame}>Again</button>
              <button className="nt-btn ghost" onClick={() => setPhase('menu')}>Change displays</button>
            </div>
          </div>
        )}

        <div className="nt-footer">Created by Pierce Porterfield</div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

  .nt-root {
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
  .nt-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
    opacity: 0.12; pointer-events: none; mix-blend-mode: multiply;
  }
  .nt-container { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }

  .nt-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--ink-soft); text-decoration: none;
    display: inline-flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.5rem; opacity: 0.7;
  }
  .nt-back:hover { opacity: 1; color: var(--accent); }
  .nt-back-arrow { font-family: 'Italiana', serif; font-size: 1.2rem; letter-spacing: normal; }
  .nt-back-btn {
    background: transparent; border: 1px solid var(--ink-soft);
    cursor: pointer; padding: 0.4rem 0.75rem; opacity: 1;
  }
  .nt-back-btn:hover { color: var(--accent); border-color: var(--accent); }

  .nt-header { text-align: center; margin-bottom: 2rem; }
  .nt-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 0.5rem;
  }
  .nt-title {
    font-family: 'Italiana', serif;
    font-size: clamp(2rem, 5.5vw, 3.25rem); font-weight: 400;
    line-height: 0.95; margin: 0;
  }
  .nt-title em {
    font-family: 'Cormorant Garamond', serif; font-style: italic; color: var(--accent);
  }
  .nt-rule {
    display: flex; align-items: center; gap: 0.75rem; justify-content: center;
    margin: 1rem auto; color: var(--ink-soft);
  }
  .nt-rule::before, .nt-rule::after {
    content: ''; height: 1px; background: var(--ink-soft);
    flex: 1; max-width: 80px; opacity: 0.4;
  }
  .nt-rule-mark { font-family: 'Italiana', serif; font-size: 1.3rem; }

  .nt-panel {
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    padding: 1.75rem 1.5rem;
    box-shadow: 8px 8px 0 var(--paper-shadow);
    position: relative;
  }
  .nt-panel::before {
    content: ''; position: absolute; inset: 6px;
    border: 1px solid var(--ink); opacity: 0.25; pointer-events: none;
  }
  .nt-panel-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 0.75rem; text-align: center;
  }
  .nt-panel-q {
    font-family: 'Italiana', serif; font-size: 1.4rem;
    text-align: center; margin-bottom: 1.25rem;
  }

  .nt-mode-row { margin-bottom: 1.25rem; }

  .nt-start-btn {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; background: var(--ink); color: var(--paper);
    border: 1px solid var(--ink);
    padding: 1rem 1.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s ease;
  }
  .nt-start-btn:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); }
  .nt-start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .nt-start-btn-arrow { font-family: 'Italiana', serif; font-size: 1.4rem; letter-spacing: normal; }

  .nt-deck-info {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    color: var(--ink-soft); margin-top: 1rem;
    font-size: 0.95rem; text-align: center;
  }

  .nt-card {
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    padding: 1.5rem 1.25rem;
    box-shadow: 8px 8px 0 var(--paper-shadow);
    position: relative;
    text-align: center;
    margin-bottom: 1.25rem;
    min-height: 260px;
    display: flex; flex-direction: column; justify-content: center;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 540px;
  }
  .nt-card::before {
    content: ''; position: absolute; inset: 6px;
    border: 1px solid var(--ink); opacity: 0.25; pointer-events: none;
  }
  .nt-card.correct { border-color: var(--green); }
  .nt-card.wrong { border-color: var(--accent); }

  .nt-card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  .nt-prompt-area {
    width: 100%;
    display: flex; justify-content: center; align-items: center;
  }
  .nt-prompt-area > * {
    width: 100%;
    max-width: 460px;
  }

  .nt-feedback-mark { font-size: 3rem; line-height: 1; }
  .nt-feedback-mark.correct { color: var(--green); }
  .nt-feedback-mark.wrong { color: var(--accent); }
  .nt-answer-row {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; color: var(--ink-soft);
  }
  .nt-answer-row strong {
    font-family: 'Italiana', serif; font-weight: 400;
    font-size: 1.6rem; color: var(--ink); letter-spacing: 0.05em;
  }
  .nt-answer-row.was-wrong strong { color: var(--accent); text-decoration: line-through; }

  .nt-action-row { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem; flex-wrap: wrap; }
  .nt-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
    background: var(--ink); color: var(--paper);
    border: 1px solid var(--ink);
    padding: 0.7rem 1.4rem; cursor: pointer;
  }
  .nt-btn:hover { background: var(--accent); border-color: var(--accent); }
  .nt-btn.ghost { background: transparent; color: var(--ink); }
  .nt-btn.ghost:hover { background: var(--ink); color: var(--paper); }

  .nt-done-mark {
    font-family: 'Italiana', serif;
    font-size: 4rem; text-align: center; margin-bottom: 0.5rem;
  }
  .nt-done-score {
    font-family: 'Italiana', serif;
    font-size: 2rem; text-align: center; margin-bottom: 1.5rem;
  }
  .nt-done-score em { font-style: italic; color: var(--accent); }

  .nt-footer {
    text-align: center; margin-top: 2.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--ink-soft); opacity: 0.5;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .nt-fade-in { animation: fadeIn 0.35s ease forwards; }

  .nt-best-row {
    margin-top: 1rem; padding-top: 0.75rem;
    border-top: 1px dotted var(--ink-soft);
  }
  .nt-best-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--ink-soft); text-align: center; margin-bottom: 0.5rem;
  }
  .nt-best-line {
    display: flex; justify-content: space-between;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem; padding: 0.2rem 0.5rem; color: var(--ink-soft);
  }
  .nt-best-line strong {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500; font-size: 0.95rem; color: var(--ink);
  }
  .nt-best-inline { opacity: 0.7; font-size: 0.9em; }
  .nt-score-time {
    text-align: center;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic; color: var(--ink-soft);
    margin-bottom: 1rem; font-size: 1.05rem;
  }
  .nt-score-time strong {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500; font-style: normal; color: var(--ink);
  }
  .nt-new-best { color: var(--accent); font-weight: 600; font-style: normal; }
`;
