import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { getBestTime, recordTime, formatTime, WRONG_PENALTY_MS } from '../utils/bestTimes';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import Staff from './Staff.jsx';
import PianoInput from './PianoInput.jsx';
import GuitarInput from './GuitarInput.jsx';
import InputModeSelector, { INPUT_MODES } from './InputModeSelector.jsx';
import { shuffle, formatNote, notesEqual } from '../data/notes';
import { noteToPc, pcBothSpellings } from '../data/pitchClass';

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
  // PCS is in fixed C → C# → ... order. Build the cards then shuffle so
  // each round visits the 12 pitch classes in a fresh sequence.
  const cards = PCS.map((entry, i) => {
    const spelling = pickSpelling(entry, Math.floor(Math.random() * 1000) + i);
    const note = `${spelling.letter}${spelling.accidental}`;
    const displayMode = selectedModes[Math.floor(Math.random() * selectedModes.length)];
    // Treble-clef-friendly octaves: middle-C (4) or one above (5).
    const octave = 4 + Math.floor(Math.random() * 2);
    // Stable seed for piano/guitar position randomisation.
    const seed = `note-${i}-${note}-${Math.floor(Math.random() * 1e6)}`;
    return { id: `${i}-${note}`, pc: entry.pc, note, spelling, displayMode, octave, seed };
  });
  return shuffle(cards);
};

export default function NoteTrainer() {
  const [activeModes, setActiveModes] = useState(['staff', 'piano', 'guitar']);
  // Two-step setup mirrors Chord/Interval Trainer: pick displays, then
  // pick direction.
  const [phase, setPhase] = useState('options'); // 'options' | 'menu' | 'playing' | 'done'
  // 'identify' — show a note on the chosen display, user types/picks the
  //              note name via NotePicker. (original behaviour)
  // 'place'    — show a note name as text, user clicks/places it on the
  //              chosen display in input mode.
  const [direction, setDirection] = useState('identify');
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  // Object-shaped so we can hold either a plain note string (for NotePicker
  // and piano/guitar input) or an array of staff-note tokens (for Staff
  // input).
  const [answer, setAnswer] = useState({});
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [lastWrongAnswer, setLastWrongAnswer] = useState('');

  const current = deck[idx];

  const settingsKey = useMemo(
    () => `note-${[...activeModes].sort().join('_')}_${direction}`,
    [activeModes, direction]
  );
  const bestTime = getBestTime(settingsKey);
  const bestForDirection = (dir) =>
    getBestTime(`note-${[...activeModes].sort().join('_')}_${dir}`);

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

  const startGame = (dir) => {
    if (activeModes.length === 0) return;
    if (dir) setDirection(dir);
    setDeck(buildDeck(activeModes));
    setIdx(0);
    setAnswer({});
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
    let isCorrect = false;
    let userAnswer = '(blank)';

    if (direction === 'identify') {
      userAnswer = answer.note || '(blank)';
      if (current.displayMode === 'staff') {
        // Staff display — spelling matters.
        isCorrect = answer.note === current.note;
      } else {
        // Piano + guitar are pitch-class only.
        isCorrect = !!answer.note && noteToPc(answer.note) === current.pc;
      }
    } else {
      // 'place' direction — user clicks/places on the chosen display
      // in input mode. Grade against what they placed.
      if (current.displayMode === 'staff') {
        const tok = (answer.staffNotes || [])[0];
        userAnswer = tok ? `${tok.letter}${tok.accidental || ''}` : '(blank)';
        isCorrect = !!tok && `${tok.letter}${tok.accidental || ''}` === current.note;
      } else {
        userAnswer = answer.note || '(blank)';
        isCorrect = !!answer.note && noteToPc(answer.note) === current.pc;
      }
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
      setAnswer({});
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

  // Identify-direction prompt: show the note in display mode on the chosen
  // surface (staff / piano / guitar). User answers via NotePicker.
  const renderIdentifyPrompt = () => {
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

  // Place-direction input: the chosen surface in INPUT mode so the user
  // can click/place the prompted note.
  const renderPlaceInput = () => {
    if (!current) return null;
    if (current.displayMode === 'staff') {
      return (
        <Staff
          mode="input"
          inputNotes={answer.staffNotes || []}
          onInputChange={(next) => setAnswer({ ...answer, staffNotes: next })}
          maxNotes={1}
        />
      );
    }
    if (current.displayMode === 'piano') {
      return (
        <PianoInput
          value={answer.note ? [answer.note] : []}
          onChange={(next) => setAnswer({ ...answer, note: next[next.length - 1] || '' })}
          maxNotes={1}
        />
      );
    }
    return (
      <GuitarInput
        value={answer.note ? [answer.note] : []}
        onChange={(next) => setAnswer({ ...answer, note: next[next.length - 1] || '' })}
        maxNotes={1}
      />
    );
  };

  const identifyLabel = current && (
    current.displayMode === 'staff'  ? '— Name the note on the staff —' :
    current.displayMode === 'piano'  ? '— Name the highlighted key —' :
    /* guitar */                       '— Name the note on the fretboard —'
  );
  const placeLabel = current && (
    current.displayMode === 'staff'  ? '— Place this note on the staff —' :
    current.displayMode === 'piano'  ? '— Tap this note on the piano —' :
    /* guitar */                       '— Find this note on the fretboard —'
  );

  if (phase === 'playing' && current) {
    const inputInterface = !feedback ? (
      direction === 'identify' ? (
        <NotePicker
          count={1}
          value={[answer.note || '']}
          onChange={(next) => setAnswer({ ...answer, note: next[0] || '' })}
          slotLabels={['?']}
          slotNames={['ANSWER']}
        />
      ) : (
        renderPlaceInput()
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
            {!feedback && direction === 'identify' && (
              <>
                <div className="nt-card-label">{identifyLabel}</div>
                <div className="nt-prompt-area">{renderIdentifyPrompt()}</div>
              </>
            )}
            {!feedback && direction === 'place' && (
              <>
                <div className="nt-card-label">{placeLabel}</div>
                <div className="nt-place-prompt">{formatNote(current.note)}</div>
              </>
            )}
            {(() => {
              // In identify-direction with a piano/guitar prompt, both
              // spellings of the highlighted pitch are equally correct
              // (no harmonic context to privilege one). Show "E♭/D♯" so
              // the reveal isn't misleading. Staff displays + place mode
              // both anchor to a specific spelling, so use the exact note.
              const ambiguous =
                direction === 'identify' &&
                (current.displayMode === 'piano' || current.displayMode === 'guitar');
              const correctDisplay = ambiguous
                ? pcBothSpellings(current.pc)
                : formatNote(current.note);
              return (
                <>
                  {feedback === 'correct' && (
                    <>
                      <div className="nt-feedback-mark correct">✓</div>
                      <div className="nt-card-label">— Correct —</div>
                      <div className="nt-answer-row">
                        <strong>{correctDisplay}</strong>
                      </div>
                    </>
                  )}
                  {feedback === 'wrong' && (
                    <>
                      <div className="nt-feedback-mark wrong">✗</div>
                      <div className="nt-card-label">— Not quite —</div>
                      <div className="nt-answer-row was-wrong">
                        Your answer · <strong>{formatNote(lastWrongAnswer)}</strong>
                      </div>
                      <div className="nt-answer-row">
                        Correct · <strong>{correctDisplay}</strong>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </TrainerLayout>
      </>
    );
  }

  return (
    <div className="nt-root">
      <Head>
        <title>Note Trainer — Music Note Reading Flashcards</title>
        <meta name="description" content="Identify notes on the music staff, piano keyboard, or guitar fretboard with interactive flashcards. Practice both directions — see a note name a note, or hear a name place a note. Free and mobile-friendly." />
        <link rel="canonical" href="https://theory-trainer.com/notes" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Note Trainer — Music Note Reading Flashcards" />
        <meta property="og:description" content="Sight-reading drills for staff, piano, and guitar. Free, mobile-friendly, no account." />
        <meta property="og:url" content="https://theory-trainer.com/notes" />
        <meta property="og:image" content="https://theory-trainer.com/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Note Trainer" />
        <meta name="twitter:description" content="Music note reading flashcards on staff, piano, and guitar." />
        <meta name="twitter:image" content="https://theory-trainer.com/og-default.png" />
      </Head>
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

        {phase === 'options' && (
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
              onClick={() => setPhase('menu')}
              disabled={activeModes.length === 0}
            >
              <span>Continue · {activeModes.length} {activeModes.length === 1 ? 'display' : 'displays'}</span>
              <span className="nt-start-btn-arrow">→</span>
            </button>

            <div className="nt-deck-info">
              Pick which displays to drill, then choose a direction on the next screen.
            </div>
          </div>
        )}

        {phase === 'menu' && (
          <div className="nt-panel nt-fade-in">
            <div className="nt-panel-label">— Select a study —</div>
            <div className="nt-panel-q">Which direction shall we begin?</div>

            <button
              className="nt-mode-btn"
              onClick={() => startGame('identify')}
            >
              <span>
                <span className="nt-mode-btn-num">I. </span>
                Display → <em>name the note</em>
              </span>
              <span className="nt-mode-btn-arrow">→</span>
            </button>
            <button
              className="nt-mode-btn"
              onClick={() => startGame('place')}
            >
              <span>
                <span className="nt-mode-btn-num">II. </span>
                Note name → <em>place it on the display</em>
              </span>
              <span className="nt-mode-btn-arrow">→</span>
            </button>

            <div className="nt-deck-info">12 notes per round</div>

            <div className="nt-best-row">
              <div className="nt-best-label">Best times for this selection · +20s per wrong</div>
              <div className="nt-best-line">
                <span>Identify</span>
                <strong>{formatTime(bestForDirection('identify'))}</strong>
              </div>
              <div className="nt-best-line">
                <span>Place</span>
                <strong>{formatTime(bestForDirection('place'))}</strong>
              </div>
            </div>

            <button
              className="nt-start-btn"
              style={{ background: 'transparent', color: 'var(--ink)', marginTop: '1rem' }}
              onClick={() => setPhase('options')}
            >
              <span>← Change displays</span>
              <span></span>
            </button>
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
              <button className="nt-btn" onClick={() => startGame()}>Again</button>
              <button className="nt-btn ghost" onClick={() => setPhase('menu')}>Change direction</button>
              <button className="nt-btn ghost" onClick={() => setPhase('options')}>Change displays</button>
            </div>
          </div>
        )}

        {(phase === 'options' || phase === 'menu') && (
          <section className="trainer-seo">
            <h2 className="trainer-seo-h2">About the Note Trainer</h2>
            <p>
              The Note Trainer drills single-note recognition on three
              different surfaces — the music staff, the piano keyboard, and
              the guitar fretboard. Pick which surfaces to include on the
              setup screen (one, two, or all three) and the trainer cycles
              through 12 random pitches per round, mixing the active
              surfaces.
            </p>
            <h2 className="trainer-seo-h2">Two directions</h2>
            <p>
              <em>Identify the note</em> — see a note drawn on the chosen
              surface (a notehead on the treble staff, a highlighted piano
              key, or a fretboard dot), name what it is. Builds the recall
              path from visual position to note name.
            </p>
            <p>
              <em>Place the note</em> — see a note name (like "F♯") and
              place it on the surface yourself. Builds the reverse path from
              note name to position. On the music staff, you drag a notehead
              to the correct line or space; on the piano and guitar, you tap
              the right key or fret.
            </p>
            <h2 className="trainer-seo-h2">Why drill note reading?</h2>
            <p>
              Note reading on the staff is the slow skill that holds back
              most beginners — every other theory concept builds on it.
              Drilling 12 random notes per round, alternating between
              identification and placement, builds the reflex faster than
              reading exercises alone. Position on the guitar fretboard
              randomizes per card; staff octave randomizes between treble-
              clef ranges. Best times stored locally; +20 seconds per wrong
              answer.
            </p>
          </section>
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

  /* Direction-picker buttons (chord/interval-trainer parity). */
  .nt-mode-btn {
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
  .nt-mode-btn:hover {
    background: var(--ink);
    color: var(--paper);
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 var(--accent);
  }
  .nt-mode-btn em { font-style: italic; color: var(--accent); }
  .nt-mode-btn:hover em { color: var(--gold); }
  .nt-mode-btn-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    opacity: 0.6;
    letter-spacing: 0.15em;
  }
  .nt-mode-btn-arrow {
    font-family: 'Italiana', serif;
    font-size: 1.4rem;
  }

  /* Big note-name prompt for the place direction. */
  .nt-place-prompt {
    font-family: 'Italiana', serif;
    font-size: clamp(3rem, 10vw, 5rem);
    line-height: 1;
    color: var(--ink);
    margin-top: 0.25rem;
  }

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

  .nt-action-row { display: flex; gap: 0.6rem; justify-content: center; margin-top: 1.25rem; flex-wrap: wrap; }
  .nt-action-row .nt-btn { flex: 1 1 140px; min-width: 0; }
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
