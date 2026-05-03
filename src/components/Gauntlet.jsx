import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import ChordPicker from './ChordPicker.jsx';
import KeyPicker from './KeyPicker.jsx';
import Staff, { layoutChordNotes } from './Staff.jsx';
import PianoInput from './PianoInput.jsx';
import GuitarInput from './GuitarInput.jsx';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import { formatTime } from '../utils/bestTimes';
import { buildGauntletRound } from '../utils/gauntletRounds';
import { loadGauntletState, recordGauntletRound } from '../utils/gauntletState';
import { notesMatch, formatNote } from '../data/notes';
import { chordNameMatch, QUALITIES, guitarOptionalPcs, octavesForChord } from '../data/triads';
import { pickFingering } from '../data/guitarFingerings';
import { KEY_LETTERS, answersMatch, keyNameMatch, keyNameMatchOrRelative, relativeKeyOf, notesInKey } from '../data/keys';
import { noteToPc, pcSetMatchWithOptional } from '../data/pitchClass';

const FEEDBACK_DELAY_MS = 1400;          // dwell after correct (auto-advances)
// Wrong answers no longer auto-advance — the user clicks Next when ready,
// so they can study the correct answer at their own pace. Time was already
// captured at submit time so the review phase doesn't penalise them.
const ROUND_TRANSITION_MS = 600;

const formatChord = (c) => c.replace('#', '\u266F').replace('b', '\u266D');
const formatKey   = (n) => n.replace('#', '\u266F').replace('b', '\u266D');

// Full quality menu for notes-to-chord rounds. Lets the user actually
// pick from the universe rather than having the picker pre-narrowed.
const ALL_QUALITY_OPTIONS = Object.entries(QUALITIES).map(([key, q]) => ({
  key,
  symbol: q.symbol,
  label: q.symbol || 'maj',
}));

// ---------- Card rendering — front of the card ---------------------------
function CardFront({ round, card }) {
  if (round.type === 'chord' && round.direction === 'chord-to-notes') {
    return (
      <>
        <div className="g-card-label">— Spell the chord —</div>
        <div className="g-card-prompt">{formatChord(card.chordName)}</div>
        <div className="g-card-sub">{card.qualityLabel}</div>
      </>
    );
  }
  if (round.type === 'chord' && round.direction === 'notes-to-chord') {
    const im = round.inputMode;
    return (
      <>
        <div className="g-card-label">— Name the chord —</div>
        {im === 'staff' ? (
          <Staff mode="display" displayNotes={layoutChordNotes(card.notes)} />
        ) : im === 'piano' ? (
          <PianoInput
            mode="display"
            value={card.notes}
            chordSeed={card.chordName}
            octaves={octavesForChord(card.quality)}
          />
        ) : im === 'guitar' ? (
          <GuitarInput
            mode="display"
            value={card.notes}
            chordSeed={card.chordName}
            fingering={pickFingering(card.quality, card.root, card.chordName)}
          />
        ) : (
          <div className="g-card-notes">
            {card.notes.map((n, i) => (
              <React.Fragment key={i}>
                <span className="g-note-chip">{formatNote(n)}</span>
                {i < card.notes.length - 1 && <span className="g-note-sep">·</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </>
    );
  }
  if (round.type === 'interval') {
    return (
      <>
        <div className="g-card-label">— A {card.interval.label} above —</div>
        <div className="g-card-prompt">{formatNote(card.root)}</div>
      </>
    );
  }
  if (round.type === 'note') {
    if (round.displayMode === 'staff') {
      return (
        <>
          <div className="g-card-label">— Name the note —</div>
          <Staff
            mode="display"
            displayNotes={[{ letter: card.spelling.letter, accidental: card.spelling.accidental, octave: card.octave }]}
          />
        </>
      );
    }
    if (round.displayMode === 'piano') {
      return (
        <>
          <div className="g-card-label">— Name the highlighted key —</div>
          <PianoInput mode="display" value={[card.note]} chordSeed={card.seed} />
        </>
      );
    }
    return (
      <>
        <div className="g-card-label">— Name the note on the fretboard —</div>
        <GuitarInput mode="display" value={[card.note]} chordSeed={card.seed} />
      </>
    );
  }
  if (round.type === 'cof' && round.direction === 'key-to-accidentals') {
    return (
      <>
        <div className="g-card-label">— Key of —</div>
        <div className="g-card-prompt">{formatKey(card.tonic)}</div>
        <div className="g-card-sub">{card.mode}</div>
      </>
    );
  }
  if (round.type === 'cof' && round.direction === 'notes-to-key') {
    return (
      <>
        <div className="g-card-label">— Notes of the {card.mode} scale —</div>
        <div className="g-card-notes">
          {card.scaleNotes.map((n, i) => (
            <React.Fragment key={i}>
              <span className="g-note-chip">{formatNote(n)}</span>
              {i < card.scaleNotes.length - 1 && <span className="g-note-sep">·</span>}
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }
  return null;
}

// ---------- Card rendering — input below the card -----------------------
function CardInput({ round, card, answer, setAnswer }) {
  if (round.type === 'chord' && round.direction === 'chord-to-notes') {
    const im = round.inputMode;
    if (im === 'staff') {
      return (
        <Staff
          mode="input"
          inputNotes={answer.staffNotes || []}
          onInputChange={(next) => setAnswer({ ...answer, staffNotes: next })}
          maxNotes={card.notes.length}
        />
      );
    }
    if (im === 'piano') {
      return (
        <PianoInput
          value={answer.notes || []}
          onChange={(next) => setAnswer({ ...answer, notes: next })}
          maxNotes={card.notes.length}
          octaves={octavesForChord(card.quality)}
        />
      );
    }
    if (im === 'guitar') {
      return (
        <GuitarInput
          value={answer.notes || []}
          onChange={(next) => setAnswer({ ...answer, notes: next })}
          maxNotes={6}
        />
      );
    }
    const labels = ['1', '3', '5', '7', '9', '11', '13'];
    const names = ['ROOT', '3rd', '5th', '7th', '9th', '11th', '13th'];
    return (
      <NotePicker
        count={card.notes.length}
        value={answer.notes || []}
        onChange={(next) => setAnswer({ ...answer, notes: next })}
        slotLabels={labels.slice(0, card.notes.length)}
        slotNames={names.slice(0, card.notes.length)}
      />
    );
  }
  if (round.type === 'chord' && round.direction === 'notes-to-chord') {
    return (
      <ChordPicker
        value={answer.chord || ''}
        onChange={(next) => setAnswer({ ...answer, chord: next })}
        qualityOptions={ALL_QUALITY_OPTIONS}
      />
    );
  }
  if (round.type === 'interval') {
    const im = round.inputMode;
    if (im === 'staff') {
      return (
        <Staff
          mode="input"
          inputNotes={answer.staffNotes || []}
          onInputChange={(next) => setAnswer({ ...answer, staffNotes: next })}
          maxNotes={1}
        />
      );
    }
    if (im === 'piano') {
      return (
        <PianoInput
          value={answer.note ? [answer.note] : []}
          onChange={(next) => setAnswer({ ...answer, note: next[next.length - 1] || '' })}
          maxNotes={1}
          referenceNote={card.root}
          referenceOctave={0}
        />
      );
    }
    if (im === 'guitar') {
      return (
        <GuitarInput
          value={answer.note ? [answer.note] : []}
          onChange={(next) => setAnswer({ ...answer, note: next[next.length - 1] || '' })}
          maxNotes={1}
        />
      );
    }
    return (
      <NotePicker
        count={1}
        value={[answer.note || '']}
        onChange={(next) => setAnswer({ ...answer, note: next[0] || '' })}
        slotLabels={['?']}
        slotNames={['ANSWER']}
      />
    );
  }
  if (round.type === 'note') {
    return (
      <NotePicker
        count={1}
        value={[answer.note || '']}
        onChange={(next) => setAnswer({ ...answer, note: next[0] || '' })}
        slotLabels={['?']}
        slotNames={['ANSWER']}
      />
    );
  }
  if (round.type === 'cof' && round.direction === 'key-to-accidentals') {
    const map = answer.letterAnswers || { A: '', B: '', C: '', D: '', E: '', F: '', G: '' };
    const toggle = (letter, value) => {
      const next = { ...map, [letter]: map[letter] === value ? '' : value };
      setAnswer({ ...answer, letterAnswers: next });
    };
    return (
      <div className="g-letter-grid">
        {KEY_LETTERS.map((letter) => (
          <div key={letter} className="g-letter-col">
            <div className="g-letter-label">{letter}</div>
            <button
              className={`g-acc-btn ${map[letter] === '#' ? 'active-sharp' : ''}`}
              onClick={() => toggle(letter, '#')}
              type="button"
            >{'\u266F'}</button>
            <button
              className={`g-acc-btn ${map[letter] === 'b' ? 'active-flat' : ''}`}
              onClick={() => toggle(letter, 'b')}
              type="button"
            >{'\u266D'}</button>
          </div>
        ))}
      </div>
    );
  }
  if (round.type === 'cof' && round.direction === 'notes-to-key') {
    // Lock the picker to the card's mode — the user knows from the prompt
    // which mode is being asked for, so they only need to choose root +
    // accidental.
    const isMinorCard = card.mode === 'minor';
    return (
      <KeyPicker
        value={answer.keyAnswer || ''}
        onChange={(next) => setAnswer({ ...answer, keyAnswer: next })}
        allowMajor={!isMinorCard}
        allowMinor={isMinorCard}
      />
    );
  }
  return null;
}

// ---------- Reveal-the-answer block --------------------------------------
function CorrectAnswer({ round, card }) {
  if (round.type === 'chord' && round.direction === 'chord-to-notes') {
    return (
      <>
        <div className="g-card-label">— Answer —</div>
        <div className="g-card-notes">
          {card.notes.map((n, i) => (
            <React.Fragment key={i}>
              <span className="g-note-chip">{formatNote(n)}</span>
              {i < card.notes.length - 1 && <span className="g-note-sep">·</span>}
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }
  if (round.type === 'chord' && round.direction === 'notes-to-chord') {
    return (
      <>
        <div className="g-card-label">— Answer —</div>
        <div className="g-card-prompt g-answer-prompt">{formatChord(card.chordName)}</div>
        <div className="g-card-sub">{card.qualityLabel}</div>
      </>
    );
  }
  if (round.type === 'interval') {
    return (
      <>
        <div className="g-card-label">— Answer —</div>
        <div className="g-card-prompt g-answer-prompt">{formatNote(card.note)}</div>
        <div className="g-card-sub">{card.interval.label} above {formatNote(card.root)}</div>
      </>
    );
  }
  if (round.type === 'note') {
    return (
      <>
        <div className="g-card-label">— Answer —</div>
        <div className="g-card-prompt g-answer-prompt">{formatNote(card.note)}</div>
      </>
    );
  }
  if (round.type === 'cof' && round.direction === 'key-to-accidentals') {
    const list = card.type === 'sharp' ? card.sharps : card.flats;
    const symbol = card.type === 'sharp' ? '\u266F' : '\u266D';
    return (
      <>
        <div className="g-card-label">— Answer —</div>
        {card.count === 0 ? (
          <div className="g-card-prompt g-answer-prompt">No sharps or flats</div>
        ) : (
          <div className="g-card-notes">
            {list.map((letter, i) => (
              <span key={i} className="g-note-chip">{letter}{symbol}</span>
            ))}
          </div>
        )}
        <div className="g-card-sub">{card.count} {card.type}{card.count === 1 ? '' : 's'}</div>
      </>
    );
  }
  if (round.type === 'cof' && round.direction === 'notes-to-key') {
    return (
      <>
        <div className="g-card-label">— Answer —</div>
        <div className="g-card-prompt g-answer-prompt">{formatKey(card.tonic)}</div>
        <div className="g-card-sub">{card.mode}</div>
      </>
    );
  }
  return null;
}

const staffToStrings = (staffNotes) =>
  (staffNotes || []).map((n) => `${n.letter}${n.accidental || ''}`);

function gradeAnswer(round, card, answer) {
  if (round.type === 'chord' && round.direction === 'chord-to-notes') {
    if (round.inputMode === 'staff') {
      return notesMatch(staffToStrings(answer.staffNotes), card.notes);
    }
    if (round.inputMode === 'guitar') {
      // Guitar voicings: doubled pitch classes are fine, and 11/13 chords
      // commonly omit the 9th in playable shapes.
      return pcSetMatchWithOptional(
        answer.notes || [], card.notes,
        guitarOptionalPcs(card.quality, card.notes),
      );
    }
    return notesMatch(answer.notes || [], card.notes);
  }
  if (round.type === 'chord' && round.direction === 'notes-to-chord') {
    return chordNameMatch(answer.chord || '', card.chordName);
  }
  if (round.type === 'interval') {
    if (round.inputMode === 'staff') {
      const staff = staffToStrings(answer.staffNotes);
      return staff.length === 1 && notesMatch(staff, [card.note]);
    }
    return notesMatch([answer.note || ''], [card.note]);
  }
  if (round.type === 'note') {
    if (round.displayMode === 'staff') {
      // Spelling matters on the staff — exact letter+accidental match.
      return answer.note === card.note;
    }
    // Piano + guitar are pitch-class matches — enharmonic equivalents accepted.
    return !!answer.note && noteToPc(answer.note) === card.pc;
  }
  if (round.type === 'cof' && round.direction === 'key-to-accidentals') {
    return answersMatch(answer.letterAnswers || {}, card);
  }
  if (round.type === 'cof' && round.direction === 'notes-to-key') {
    return keyNameMatch(answer.keyAnswer || '', card);
  }
  return false;
}

// ---------- The component ------------------------------------------------
export default function Gauntlet() {
  const initial = loadGauntletState();
  const [phase, setPhase] = useState('playing'); // 'playing' | 'between' | 'summary'
  const [round, setRound] = useState(() => buildGauntletRound());
  const [cardIdx, setCardIdx] = useState(0);
  const [answer, setAnswer] = useState({});
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'

  // Per-card timing (resets each card)
  const [cardStartedAt, setCardStartedAt] = useState(() => Date.now());
  // Session-wide stats
  const [sessionRounds, setSessionRounds] = useState(0);
  const [allCardResults, setAllCardResults] = useState([]); // [{ correct, timeMs }]
  // Lifetime
  const [lifetimeRounds, setLifetimeRounds] = useState(initial.totalRounds);

  // Per-round aggregation (banked into allCardResults at round end)
  const [roundCardResults, setRoundCardResults] = useState([]);

  const card = round.cards[cardIdx];

  // Reset card timer when the active card changes
  useEffect(() => {
    setCardStartedAt(Date.now());
  }, [round, cardIdx]);

  // Auto-advance only after a correct submit. Wrong answers wait for a tap
  // on the Next button so the user can read the revealed answer.
  useEffect(() => {
    if (feedback !== 'correct') return;
    const t = setTimeout(() => advance(), FEEDBACK_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  // Enter triggers submit (no feedback) or advance (wrong feedback).
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      if (!feedback) submit();
      else if (feedback === 'wrong') advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, feedback, answer, cardIdx, round]);

  const submit = () => {
    if (feedback) return;
    const correct = gradeAnswer(round, card, answer);
    const timeMs = Date.now() - cardStartedAt;
    setRoundCardResults((prev) => [...prev, { correct, timeMs }]);
    if (correct) hapticCorrect(); else hapticWrong();
    setFeedback(correct ? 'correct' : 'wrong');
  };

  const advance = () => {
    setFeedback(null);
    setAnswer({});
    if (cardIdx + 1 < round.cards.length) {
      setCardIdx(cardIdx + 1);
      return;
    }
    // Round complete
    const finishedRoundResults = roundCardResults;
    setAllCardResults((prev) => [...prev, ...finishedRoundResults]);
    setRoundCardResults([]);
    const newSessionRounds = sessionRounds + 1;
    setSessionRounds(newSessionRounds);
    setLifetimeRounds(recordGauntletRound());
    setPhase('between');
  };

  const keepGoing = () => {
    const next = buildGauntletRound(round.type);
    setRound(next);
    setCardIdx(0);
    setAnswer({});
    setFeedback(null);
    setPhase('playing');
  };

  const endSession = () => setPhase('summary');

  // ============================================================ summary
  if (phase === 'summary') {
    const total = allCardResults.length;
    const correct = allCardResults.filter((r) => r.correct).length;
    const avgMs = total === 0 ? 0 : allCardResults.reduce((a, r) => a + r.timeMs, 0) / total;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

    return (
      <div className="g-root">
        <style>{css}</style>
        <div className="g-container g-fade-in">
          <Link to="/" className="g-back"><span>←</span> Home</Link>
          <div className="g-eyebrow">— Gauntlet complete —</div>
          <h1 className="g-title">{sessionRounds} {sessionRounds === 1 ? 'round' : 'rounds'} done</h1>
          <div className="g-rule">❦</div>

          <div className="g-summary-grid">
            <div className="g-summary-stat">
              <span className="g-summary-label">Rounds this session</span>
              <span className="g-summary-value">{sessionRounds}</span>
            </div>
            <div className="g-summary-stat">
              <span className="g-summary-label">Avg time per question</span>
              <span className="g-summary-value">{formatTime(Math.round(avgMs))}</span>
            </div>
            <div className="g-summary-stat">
              <span className="g-summary-label">Correct</span>
              <span className="g-summary-value">{pct}<span className="g-summary-pct">%</span></span>
            </div>
            <div className="g-summary-stat">
              <span className="g-summary-label">Lifetime rounds</span>
              <span className="g-summary-value">{lifetimeRounds}</span>
            </div>
          </div>

          <div className="g-summary-actions">
            <button className="g-action g-action-primary" onClick={keepGoing}>
              Run another →
            </button>
            <Link to="/" className="g-action g-action-ghost">Back to studies</Link>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================== between rounds
  if (phase === 'between') {
    // roundCardResults gets cleared in advance(); pull the last 5 from
    // allCardResults instead.
    const lastRoundSlice = allCardResults.slice(-round.cards.length);
    const lastRoundCorrect = lastRoundSlice.filter((r) => r.correct).length;

    return (
      <div className="g-root">
        <style>{css}</style>
        <div className="g-container g-fade-in">
          <div className="g-eyebrow">— Round {sessionRounds} done —</div>
          <h1 className="g-title-sm">{round.subject}</h1>
          <div className="g-card-sub" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {round.subjectExtra}
          </div>

          <div className="g-round-result">
            <span className="g-round-result-num">{lastRoundCorrect}</span>
            <span className="g-round-result-of">/ {round.cards.length}</span>
            <span className="g-round-result-label">correct</span>
          </div>

          <div className="g-summary-actions">
            <button className="g-action g-action-primary" onClick={keepGoing}>
              Keep going →
            </button>
            <button className="g-action g-action-ghost" onClick={endSession}>End</button>
          </div>

          <div className="g-between-meta">
            Session · <strong>{sessionRounds}</strong> {sessionRounds === 1 ? 'round' : 'rounds'}
            <span className="g-between-meta-sep">·</span>
            Lifetime · <strong>{lifetimeRounds}</strong>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================ playing
  return (
    <>
      <style>{css}</style>
      <TrainerLayout
        topLeft={
          <button className="trainer-end-btn" onClick={endSession}>
            <span className="trainer-end-arrow">×</span>End
          </button>
        }
        topCenter={
          <span className="g-top-round">Round {sessionRounds + 1} · {cardIdx + 1}/{round.cards.length}</span>
        }
        topRight={<span className="g-top-subject">{round.subject}</span>}
        progress={cardIdx / round.cards.length}
        controls={
          <>
            {!feedback && (
              <CardInput round={round} card={card} answer={answer} setAnswer={setAnswer} />
            )}
            {!feedback && (
              <button className="trainer-submit" onClick={submit}>Submit ⏎</button>
            )}
            {feedback === 'wrong' && (
              <button className="trainer-submit" onClick={advance}>
                {cardIdx + 1 >= round.cards.length ? 'Finish round ⏎' : 'Next ⏎'}
              </button>
            )}
          </>
        }
      >
        <div className={`g-card ${feedback || ''}`}>
          {!feedback && <CardFront round={round} card={card} />}
          {feedback === 'correct' && (
            <>
              <div className="g-feedback correct">✓</div>
              <div className="g-feedback-label">Correct</div>
            </>
          )}
          {feedback === 'wrong' && (
            <>
              <div className="g-feedback wrong">✗</div>
              <div className="g-feedback-label">Not quite</div>
              <CorrectAnswer round={round} card={card} />
            </>
          )}
        </div>
      </TrainerLayout>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

  .g-root {
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
    min-height: 100vh;
    min-height: 100dvh;
    padding: 1.5rem 1rem 3rem;
    position: relative;
    overflow-x: hidden;
  }
  .g-container {
    max-width: 640px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  .g-fade-in {
    animation: gFade 0.35s ease forwards;
  }
  @keyframes gFade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .g-back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
    text-decoration: none;
    margin-bottom: 1.5rem;
    opacity: 0.7;
  }
  .g-back:hover { opacity: 1; color: var(--accent); }

  .g-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 0.5rem;
  }
  .g-title {
    font-family: 'Italiana', serif;
    font-size: clamp(2.5rem, 7vw, 4rem);
    line-height: 1;
    margin: 0 0 1rem;
    color: var(--ink);
  }
  .g-title-sm {
    font-family: 'Italiana', serif;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    line-height: 1.05;
    margin: 0 0 0.5rem;
  }
  .g-rule {
    font-family: 'Italiana', serif;
    font-size: 1.4rem;
    color: var(--ink-soft);
    margin: 1rem auto 1.75rem;
  }

  /* Summary grid */
  .g-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 0 auto 2rem;
    max-width: 480px;
  }
  .g-summary-stat {
    background: var(--paper-deep);
    border: 1px solid var(--ink-soft);
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }
  .g-summary-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    text-align: center;
  }
  .g-summary-value {
    font-family: 'Italiana', serif;
    font-size: 2.2rem;
    line-height: 1;
    color: var(--ink);
  }
  .g-summary-pct {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    color: var(--ink-soft);
    margin-left: 0.15rem;
  }

  /* Between-rounds */
  .g-round-result {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.4rem;
    margin: 0.5rem auto 2rem;
  }
  .g-round-result-num {
    font-family: 'Italiana', serif;
    font-size: 4.5rem;
    line-height: 1;
    color: var(--accent);
  }
  .g-round-result-of {
    font-family: 'Italiana', serif;
    font-size: 2rem;
    color: var(--ink-soft);
  }
  .g-round-result-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-left: 0.4rem;
  }
  .g-between-meta {
    margin-top: 2rem;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 0.95rem;
  }
  .g-between-meta strong {
    font-family: 'Italiana', serif;
    font-style: normal;
    color: var(--ink);
    margin: 0 0.15em;
  }
  .g-between-meta-sep { margin: 0 0.6rem; opacity: 0.4; }

  /* Action buttons */
  .g-summary-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .g-action {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 0.85rem 1.4rem;
    cursor: pointer;
    border: 1px solid var(--ink);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.15s ease;
  }
  .g-action-primary {
    background: var(--ink);
    color: var(--paper);
  }
  .g-action-primary:hover { background: var(--accent); border-color: var(--accent); }
  .g-action-ghost {
    background: transparent;
    color: var(--ink);
  }
  .g-action-ghost:hover { background: var(--ink); color: var(--paper); }

  /* Top-bar bits */
  .g-top-round {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .g-top-subject {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 0.9rem;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 14ch;
  }

  /* Playing card */
  .g-card {
    position: relative;
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    padding: 1.75rem 1.25rem;
    box-shadow: 8px 8px 0 var(--paper-shadow);
    text-align: center;
    width: 100%;
    max-width: 480px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .g-card.correct { border-color: var(--green); }
  .g-card.wrong   { border-color: var(--accent); }

  .g-card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .g-card-prompt {
    font-family: 'Italiana', serif;
    font-size: clamp(2.5rem, 8vw, 4rem);
    line-height: 1;
  }
  .g-card-sub {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 1rem;
  }
  .g-card-notes {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    font-family: 'Italiana', serif;
    font-size: clamp(1.2rem, 4vw, 1.8rem);
  }
  .g-note-chip {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: 0.25rem 0.6rem;
  }
  .g-note-sep { color: var(--ink-soft); }

  .g-feedback { font-size: 4rem; line-height: 1; }
  .g-feedback.correct { color: var(--green); }
  .g-feedback.wrong   { color: var(--accent); font-size: 3rem; }
  .g-feedback-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .g-answer-prompt {
    font-size: clamp(1.8rem, 6vw, 2.6rem) !important;
    margin-top: 0.25rem;
  }

  /* Letter grid for COF key-to-accidentals input */
  .g-letter-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.4rem;
  }
  .g-letter-col {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: stretch;
  }
  .g-letter-label {
    text-align: center;
    font-family: 'Italiana', serif;
    font-size: 1.3rem;
    color: var(--ink);
  }
  .g-acc-btn {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: 0.55rem 0;
    font-family: 'Times New Roman', serif;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--ink);
  }
  .g-acc-btn.active-sharp { background: var(--accent); color: var(--paper); }
  .g-acc-btn.active-flat  { background: var(--ink); color: var(--paper); }
`;
