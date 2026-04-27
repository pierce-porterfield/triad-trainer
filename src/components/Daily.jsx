import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDailyPuzzle } from '../utils/dailyPuzzle';
import { loadState, hasPlayedToday, markCompleted } from '../utils/dailyState';
import { formatTime } from '../utils/bestTimes';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import { getPlayerId, getPlayerTag, getPlayerName, setPlayerName, sanitisePlayerName, PLAYER_NAME_RULES } from '../utils/player';
import { submitDailyResult, fetchDailyStats } from '../utils/leaderboard';
import { notesMatch, formatNote } from '../data/notes';
import { chordNameMatch } from '../data/triads';
import { KEY_LETTERS, accidentalFor, answersMatch, keyNameMatch, notesInKey } from '../data/keys';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import ChordPicker from './ChordPicker.jsx';
import KeyPicker from './KeyPicker.jsx';
import Staff, { layoutChordNotes } from './Staff.jsx';
import PianoInput from './PianoInput.jsx';
import GuitarInput from './GuitarInput.jsx';
import { QUALITIES } from '../data/triads';

const FEEDBACK_DELAY_MS = 1100;          // dwell after a correct submit
const RETRY_FEEDBACK_DELAY_MS = 750;     // dwell after a wrong submit before re-arming input
const ROUND_TRANSITION_MS = 1400;

const formatChord = (c) => c.replace('#', '\u266F').replace('b', '\u266D');
const formatKey = (n) => n.replace('#', '\u266F').replace('b', '\u266D');

// What a card's "front" looks like depending on type/direction
function CardFront({ round, card }) {
  if (round.type === 'triad' && round.direction === 'chord-to-notes') {
    return (
      <>
        <div className="d-card-label">— Spell the chord —</div>
        <div className="d-card-prompt">{formatChord(card.chordName)}</div>
        <div className="d-card-sub">{card.qualityLabel}</div>
      </>
    );
  }
  if (round.type === 'triad' && round.direction === 'notes-to-chord') {
    const im = round.inputMode || 'tap';
    return (
      <>
        <div className="d-card-label">— Name the chord —</div>
        {im === 'staff' ? (
          <Staff mode="display" displayNotes={layoutChordNotes(card.notes)} />
        ) : im === 'piano' ? (
          <PianoInput mode="display" value={card.notes} chordSeed={card.chordName} />
        ) : im === 'guitar' ? (
          <GuitarInput mode="display" value={card.notes} chordSeed={card.chordName} />
        ) : (
          <div className="d-card-notes">
            {card.notes.map((n, i) => (
              <React.Fragment key={i}>
                <span className="d-note-chip">{formatNote(n)}</span>
                {i < card.notes.length - 1 && <span className="d-note-sep">·</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </>
    );
  }
  if (round.type === 'key' && round.direction === 'key-to-accidentals') {
    return (
      <>
        <div className="d-card-label">— Key of —</div>
        <div className="d-card-prompt">{formatKey(card.tonic)}</div>
        <div className="d-card-sub">{card.mode}</div>
      </>
    );
  }
  if (round.type === 'key' && round.direction === 'notes-to-key') {
    const notes = notesInKey(card);
    return (
      <>
        <div className="d-card-label">— Notes of the scale —</div>
        <div className="d-card-notes">
          {notes.map((n, i) => (
            <React.Fragment key={i}>
              <span className="d-note-chip">{formatNote(n)}</span>
              {i < notes.length - 1 && <span className="d-note-sep">·</span>}
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }
  if (round.type === 'interval') {
    return (
      <>
        <div className="d-card-label">— A {card.interval.label} above —</div>
        <div className="d-card-prompt">{formatNote(card.root)}</div>
      </>
    );
  }
  return null;
}

// Show the correct answer when the user got a card wrong. Layout depends
// on the round type / direction — in every case we surface the specific
// fact they missed, not just a generic "the chord was X".
function CorrectAnswer({ round, card }) {
  if (round.type === 'triad' && round.direction === 'chord-to-notes') {
    return (
      <>
        <div className="d-card-label">— Answer —</div>
        <div className="d-card-notes">
          {card.notes.map((n, i) => (
            <React.Fragment key={i}>
              <span className="d-note-chip">{formatNote(n)}</span>
              {i < card.notes.length - 1 && <span className="d-note-sep">·</span>}
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }
  if (round.type === 'triad' && round.direction === 'notes-to-chord') {
    return (
      <>
        <div className="d-card-label">— Answer —</div>
        <div className="d-card-prompt d-answer-prompt">{formatChord(card.chordName)}</div>
        <div className="d-card-sub">{card.qualityLabel}</div>
      </>
    );
  }
  if (round.type === 'key' && round.direction === 'key-to-accidentals') {
    const list = card.type === 'sharp' ? card.sharps : card.flats;
    const symbol = card.type === 'sharp' ? '\u266F' : '\u266D';
    return (
      <>
        <div className="d-card-label">— Answer —</div>
        {card.count === 0 ? (
          <div className="d-card-prompt d-answer-prompt">No sharps or flats</div>
        ) : (
          <div className="d-card-notes">
            {list.map((letter, i) => (
              <span key={i} className="d-note-chip">{letter}{symbol}</span>
            ))}
          </div>
        )}
        <div className="d-card-sub">
          {card.count} {card.type}{card.count === 1 ? '' : 's'}
        </div>
      </>
    );
  }
  if (round.type === 'key' && round.direction === 'notes-to-key') {
    return (
      <>
        <div className="d-card-label">— Answer —</div>
        <div className="d-card-prompt d-answer-prompt">{formatKey(card.tonic)}</div>
        <div className="d-card-sub">{card.mode}</div>
      </>
    );
  }
  if (round.type === 'interval') {
    return (
      <>
        <div className="d-card-label">— Answer —</div>
        <div className="d-card-prompt d-answer-prompt">{formatNote(card.note)}</div>
        <div className="d-card-sub">
          {card.interval.label} above {formatNote(card.root)}
        </div>
      </>
    );
  }
  return null;
}

// Per-card-type input rendering
function CardInput({ round, card, answer, setAnswer }) {
  if (round.type === 'triad' && round.direction === 'chord-to-notes') {
    const im = round.inputMode || 'tap';
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
        />
      );
    }
    if (im === 'guitar') {
      return (
        <GuitarInput
          value={answer.notes || []}
          onChange={(next) => setAnswer({ ...answer, notes: next })}
          maxNotes={card.notes.length}
        />
      );
    }
    const labels = ['1', '3', '5', '7', '9', '13'];
    const names = ['ROOT', '3rd', '5th', '7th', '9th', '13th'];
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
  if (round.type === 'triad' && round.direction === 'notes-to-chord') {
    // Use the chord's quality pool from the round config so users see the
    // same buttons as the deck behind today's puzzle.
    const qualityKeys = round.qualities || ['maj', 'min', 'dim', 'aug'];
    const qualityOptions = qualityKeys.map((k) => {
      const q = QUALITIES[k];
      return { key: k, symbol: q.symbol, label: q.symbol || 'maj' };
    });
    return (
      <ChordPicker
        value={answer.chord || ''}
        onChange={(next) => setAnswer({ ...answer, chord: next })}
        qualityOptions={qualityOptions}
      />
    );
  }
  if (round.type === 'key' && round.direction === 'key-to-accidentals') {
    const map = answer.letterAnswers || { A: '', B: '', C: '', D: '', E: '', F: '', G: '' };
    const toggle = (letter, value) => {
      const next = { ...map, [letter]: map[letter] === value ? '' : value };
      setAnswer({ ...answer, letterAnswers: next });
    };
    return (
      <div className="d-letter-grid">
        {KEY_LETTERS.map((letter) => (
          <div key={letter} className="d-letter-col">
            <div className="d-letter-label">{letter}</div>
            <button
              className={`d-acc-btn ${map[letter] === '#' ? 'active-sharp' : ''}`}
              onClick={() => toggle(letter, '#')}
              type="button"
            >{'\u266F'}</button>
            <button
              className={`d-acc-btn ${map[letter] === 'b' ? 'active-flat' : ''}`}
              onClick={() => toggle(letter, 'b')}
              type="button"
            >{'\u266D'}</button>
          </div>
        ))}
      </div>
    );
  }
  if (round.type === 'key' && round.direction === 'notes-to-key') {
    const allowMajor = round.keyPool !== 'minor';
    const allowMinor = round.keyPool === 'minor' || round.keyPool === 'mixed';
    return (
      <KeyPicker
        value={answer.keyAnswer || ''}
        onChange={(next) => setAnswer({ ...answer, keyAnswer: next })}
        allowMajor={allowMajor}
        allowMinor={allowMinor}
      />
    );
  }
  if (round.type === 'interval') {
    const im = round.inputMode || 'tap';
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
  return null;
}

// Check whether the user's answer for the current card is correct
// Convert staff input notes (objects) to plain note strings for grading.
const staffToStrings = (staffNotes) =>
  (staffNotes || []).map((n) => `${n.letter}${n.accidental || ''}`);

function gradeAnswer(round, card, answer) {
  if (round.type === 'triad' && round.direction === 'chord-to-notes') {
    if (round.inputMode === 'staff') {
      return notesMatch(staffToStrings(answer.staffNotes), card.notes);
    }
    return notesMatch(answer.notes || [], card.notes);
  }
  if (round.type === 'triad' && round.direction === 'notes-to-chord') {
    return chordNameMatch(answer.chord || '', card.chordName);
  }
  if (round.type === 'key' && round.direction === 'key-to-accidentals') {
    return answersMatch(answer.letterAnswers || {}, card);
  }
  if (round.type === 'key' && round.direction === 'notes-to-key') {
    return keyNameMatch(answer.keyAnswer || '', card);
  }
  if (round.type === 'interval') {
    if (round.inputMode === 'staff') {
      const staff = staffToStrings(answer.staffNotes);
      return staff.length === 1 && notesMatch(staff, [card.note]);
    }
    return notesMatch([answer.note || ''], [card.note]);
  }
  return false;
}

// What the round-type label looks like
const roundTypeLabel = (round) => {
  if (round.type === 'triad') return 'Chords';
  if (round.type === 'key') return 'Keys';
  if (round.type === 'interval') return 'Intervals';
  return '';
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function Daily() {
  const puzzle = useMemo(() => getDailyPuzzle(), []);
  const initialState = loadState();
  const [phase, setPhase] = useState(hasPlayedToday() ? 'done' : 'pre');

  // Playing state
  const [roundIdx, setRoundIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [answer, setAnswer] = useState({});
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [transitioning, setTransitioning] = useState(false);
  // Guess tracking for the new "keep guessing until correct" rules:
  //   currentCardGuesses          — submits made on the active card so far
  //   currentRoundCardGuesses     — banked per-card counts for the active round
  //   allRoundCardGuesses         — finished rounds' per-card counts (number[][])
  const [currentCardGuesses, setCurrentCardGuesses] = useState(0);
  const [currentRoundCardGuesses, setCurrentRoundCardGuesses] = useState([]);
  const [allRoundCardGuesses, setAllRoundCardGuesses] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // Result + post-completion state
  const [finalState, setFinalState] = useState(initialState);
  const [latestResult, setLatestResult] = useState(initialState.lastResult || null);

  const round = puzzle.rounds[roundIdx];
  const card = round && round.cards[cardIdx];

  // Live timer
  useEffect(() => {
    if (phase !== 'playing' || !startedAt) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [phase, startedAt]);

  // After feedback shows: correct → advance to next card; wrong → re-arm input
  // for another guess on the same card. Don't reveal the right answer; the
  // user has to figure it out.
  useEffect(() => {
    if (!feedback) return;
    if (feedback === 'correct') {
      const timer = setTimeout(() => advance(), FEEDBACK_DELAY_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setFeedback(null);
      setAnswer({});
    }, RETRY_FEEDBACK_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  // Round transition timer
  useEffect(() => {
    if (!transitioning) return;
    const timer = setTimeout(() => setTransitioning(false), ROUND_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [transitioning]);

  const start = () => {
    setRoundIdx(0);
    setCardIdx(0);
    setAnswer({});
    setFeedback(null);
    setCurrentCardGuesses(0);
    setCurrentRoundCardGuesses([]);
    setAllRoundCardGuesses([]);
    setStartedAt(Date.now());
    setElapsed(0);
    setTransitioning(true);
    setPhase('playing');
  };

  const submit = () => {
    if (feedback) return;
    // Every submit counts — even wrong ones. The user keeps guessing until
    // the card is right; total guess count is the "score" alongside time.
    const guessNum = currentCardGuesses + 1;
    setCurrentCardGuesses(guessNum);
    const isCorrect = gradeAnswer(round, card, answer);
    if (isCorrect) {
      hapticCorrect();
    } else {
      hapticWrong();
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  // Called only after a CORRECT submit. Banks the card's guess count and
  // advances to the next card / round / done.
  const advance = () => {
    setFeedback(null);
    setAnswer({});

    const cardGuesses = currentCardGuesses; // captured before reset
    const updatedRound = [...currentRoundCardGuesses, cardGuesses];
    setCurrentCardGuesses(0);

    const isLastCardOfRound = cardIdx + 1 >= round.cards.length;
    const isLastRound = roundIdx + 1 >= puzzle.rounds.length;

    if (!isLastCardOfRound) {
      setCurrentRoundCardGuesses(updatedRound);
      setCardIdx(cardIdx + 1);
      return;
    }

    // Round done — bank it
    const updatedAllRounds = [...allRoundCardGuesses, updatedRound];
    setAllRoundCardGuesses(updatedAllRounds);
    setCurrentRoundCardGuesses([]);

    if (isLastRound) {
      finishPuzzle(updatedAllRounds);
      return;
    }

    setRoundIdx(roundIdx + 1);
    setCardIdx(0);
    setTransitioning(true);
  };

  const finishPuzzle = (breakdown) => {
    const totalGuesses = breakdown.reduce(
      (acc, row) => acc + row.reduce((a, b) => a + b, 0),
      0
    );
    const time = Math.round((Date.now() - startedAt) / 1000); // seconds
    const result = {
      time,
      totalGuesses,
      breakdown, // number[][]
      puzzleNumber: puzzle.number,
    };
    const newState = markCompleted(result);
    setLatestResult(result);
    setFinalState(newState);
    setPhase('done');

    // Fire-and-forget: ship the result to the leaderboard. Failures are
    // silent — the local result is the source of truth.
    const playerId = getPlayerId();
    const tag = getPlayerTag();
    const name = getPlayerName();
    if (playerId) {
      submitDailyResult({
        puzzleNumber: puzzle.number,
        playerId, tag, name,
        time, totalGuesses, breakdown,
      }).catch(() => {});
    }
  };

  const totalCards = puzzle.rounds.reduce((sum, r) => sum + r.cards.length, 0);

  // ============================================================================
  // PRE-PLAY SCREEN
  // ============================================================================
  if (phase === 'pre') {
    return (
      <div className="d-pre-root">
        <style>{dailyCss}</style>
        <div className="d-pre-container d-fade-in">
          <Link to="/" className="d-pre-back">
            <span>←</span> Back
          </Link>
          <div className="d-pre-eyebrow">— Today's training —</div>
          <h1 className="d-pre-title">Etu<em>dle</em> · #{String(puzzle.number).padStart(3, '0')}</h1>
          <div className="d-pre-date">{puzzle.date}</div>
          <div className="d-pre-rule">❦</div>

          <div className="d-pre-template">
            {puzzle.rounds.map((r, i) => (
              <div key={i} className="d-pre-round">
                <span className="d-pre-round-num">{i + 1}</span>
                <span className="d-pre-round-label">{roundTypeLabel(r)}</span>
                <span className="d-pre-round-count">{r.cards.length} cards</span>
              </div>
            ))}
          </div>

          <div className="d-pre-stats">
            {initialState.currentStreak > 0 && (
              <div className="d-pre-stat">
                <span className="d-pre-stat-label">Streak</span>
                <span className="d-pre-stat-value">🔥 {initialState.currentStreak}</span>
              </div>
            )}
            {initialState.bestTime != null && (
              <div className="d-pre-stat">
                <span className="d-pre-stat-label">Best</span>
                <span className="d-pre-stat-value">{formatTime(initialState.bestTime * 1000)}</span>
              </div>
            )}
            <div className="d-pre-stat">
              <span className="d-pre-stat-label">Played</span>
              <span className="d-pre-stat-value">{initialState.totalPlayed}</span>
            </div>
          </div>

          <button className="d-pre-start" onClick={start}>
            Start today's training <span className="d-pre-start-arrow">→</span>
          </button>

          <Leaderboard puzzleNumber={puzzle.number} variant="preview" limit={5} />

          <div className="d-pre-footer">
            Timer starts when you tap Start · one attempt per day
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // DONE / RESULTS SCREEN
  // ============================================================================
  if (phase === 'done') {
    return <ResultsScreen
      puzzle={puzzle}
      result={latestResult}
      state={finalState}
    />;
  }

  // ============================================================================
  // PLAYING SCREEN
  // ============================================================================
  if (transitioning) {
    return (
      <>
        <style>{dailyCss}</style>
        <TrainerLayout
          topLeft={null}
          topCenter={<>R {roundIdx + 1} / {puzzle.rounds.length}</>}
          topRight={<span>{formatTime(elapsed)}</span>}
          progress={roundIdx / puzzle.rounds.length}
          controls={null}
        >
          <div className="d-transition d-fade-in">
            <div className="d-transition-num">Round {roundIdx + 1}</div>
            <div className="d-transition-label">{roundTypeLabel(round)}</div>
            <div className="d-transition-detail">{round.cards.length} cards</div>
          </div>
        </TrainerLayout>
      </>
    );
  }

  const cardNumberOverall =
    puzzle.rounds.slice(0, roundIdx).reduce((sum, r) => sum + r.cards.length, 0) +
    cardIdx + 1;

  return (
    <>
      <style>{dailyCss}</style>
      <TrainerLayout
        topLeft={
          <span className="d-top-round">R {roundIdx + 1}/{puzzle.rounds.length}</span>
        }
        topCenter={<>{String(cardNumberOverall).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}</>}
        topRight={<span>{formatTime(elapsed)}</span>}
        progress={cardNumberOverall / totalCards}
        controls={
          <>
            {!feedback && (
              <CardInput round={round} card={card} answer={answer} setAnswer={setAnswer} />
            )}
            {!feedback && (
              <button className="trainer-submit" onClick={submit}>Submit ⏎</button>
            )}
          </>
        }
      >
        <div className={`d-card ${feedback || ''}`}>
          <CardFront round={round} card={card} />
          {feedback && (
            <div className={`d-feedback-overlay ${feedback}`}>
              <div className={`d-feedback ${feedback}`}>
                {feedback === 'correct' ? '✓' : '✗'}
              </div>
              <div className="d-feedback-label">
                {feedback === 'correct' ? 'Correct' : 'Try again'}
              </div>
            </div>
          )}
        </div>
      </TrainerLayout>
    </>
  );
}

// ============================================================================
// RESULTS SCREEN
// ============================================================================
function ResultsScreen({ puzzle, result, state }) {
  const [copied, setCopied] = useState(false);
  // Bumped whenever the player saves/edits their name, so the Leaderboard
  // re-fetches and shows the new label on their row.
  const [refreshKey, setRefreshKey] = useState(0);

  // Map a per-card guess count to a coloured square for the share grid.
  // 1 → green (perfect), 2 → yellow, 3 → orange, 4+ → red.
  const guessSquare = (g) => {
    if (g <= 1) return '\uD83D\uDFE9';
    if (g === 2) return '\uD83D\uDFE8';
    if (g === 3) return '\uD83D\uDFE7';
    return '\uD83D\uDFE5';
  };

  const buildShareString = () => {
    if (!result) return '';
    const breakdown = result.breakdown || [];
    const totalGuesses = result.totalGuesses
      ?? breakdown.reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0);
    const rows = breakdown.map((roundCounts) =>
      roundCounts.map(guessSquare).join('')
    );
    const lines = [
      `Etudle #${String(result.puzzleNumber).padStart(3, '0')} \u00B7 ${formatTime(result.time * 1000)}`,
      ...rows,
      `${totalGuesses} guesses \u00B7 etudle.com`,
    ];
    if (state.currentStreak > 1) {
      lines[0] += `  \uD83D\uDD25 ${state.currentStreak}`;
    }
    return lines.join('\n');
  };

  const share = async () => {
    const text = buildShareString();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!result) {
    return (
      <div className="d-pre-root">
        <style>{dailyCss}</style>
        <div className="d-pre-container d-fade-in">
          <Link to="/" className="d-pre-back"><span>←</span> Back</Link>
          <div className="d-pre-eyebrow">— No result yet —</div>
          <p className="d-pre-date">Play today's puzzle first.</p>
        </div>
      </div>
    );
  }

  const isPersonalBest = state.bestTime === result.time;
  const totalGuesses = result.totalGuesses
    ?? (result.breakdown || []).reduce(
      (acc, row) => acc + row.reduce((a, b) => a + b, 0),
      0
    );

  return (
    <div className="d-pre-root">
      <style>{dailyCss}</style>
      <div className="d-pre-container d-fade-in">
        <Link to="/" className="d-pre-back"><span>←</span> Back</Link>
        <div className="d-pre-eyebrow">— Etudle #{String(result.puzzleNumber).padStart(3, '0')} —</div>
        <h1 className="d-pre-title">{formatTime(result.time * 1000)}</h1>
        <div className="d-pre-date">
          {totalGuesses} guesses
          {isPersonalBest && <span className="d-new-best"> — new personal best!</span>}
        </div>
        <div className="d-pre-rule">❦</div>

        <div className="d-pre-template">
          {(result.breakdown || []).map((roundCounts, i) => {
            const round = puzzle.rounds[i];
            const roundGuesses = roundCounts.reduce((a, b) => a + b, 0);
            const perfect = roundCounts.every((g) => g === 1);
            return (
              <div key={i} className="d-pre-round">
                <span className="d-pre-round-num">{i + 1}</span>
                <span className="d-pre-round-label">{roundTypeLabel(round)}</span>
                <span className="d-pre-round-count">
                  {roundGuesses} guess{roundGuesses === 1 ? '' : 'es'}
                  {perfect && ' \u2728'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="d-pre-stats">
          <div className="d-pre-stat">
            <span className="d-pre-stat-label">Streak</span>
            <span className="d-pre-stat-value">🔥 {state.currentStreak}</span>
          </div>
          <div className="d-pre-stat">
            <span className="d-pre-stat-label">Best</span>
            <span className="d-pre-stat-value">{formatTime(state.bestTime * 1000)}</span>
          </div>
          <div className="d-pre-stat">
            <span className="d-pre-stat-label">Played</span>
            <span className="d-pre-stat-value">{state.totalPlayed}</span>
          </div>
        </div>

        <NameForm
          puzzleNumber={result.puzzleNumber}
          result={result}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />

        <button className="d-pre-start" onClick={share}>
          {copied ? 'Copied to clipboard ✓' : 'Share result →'}
        </button>

        <Leaderboard
          puzzleNumber={result.puzzleNumber}
          variant="full"
          refreshKey={refreshKey}
        />

        <div className="d-pre-footer">
          New training at midnight UTC. Practice in the trainers to improve.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NAME FORM — independent of leaderboard fetch so it renders immediately
// ============================================================================
function NameForm({ puzzleNumber, result, onChanged }) {
  const [name, setName] = useState(getPlayerName() || '');
  const [savedName, setSavedName] = useState(getPlayerName());
  const [savingName, setSavingName] = useState(false);
  const playerId = getPlayerId();
  const tag = getPlayerTag();

  const onSaveName = async (e) => {
    if (e) e.preventDefault();
    const clean = sanitisePlayerName(name);
    if (!clean) return;
    setSavingName(true);
    setPlayerName(clean);
    setSavedName(clean);
    if (result && playerId) {
      await submitDailyResult({
        puzzleNumber, playerId, tag, name: clean,
        time: result.time,
        totalGuesses: result.totalGuesses,
        breakdown: result.breakdown,
      });
    }
    setSavingName(false);
    if (onChanged) onChanged();
  };

  if (savedName) {
    return (
      <div className="d-name-saved">
        Playing as <strong>{savedName}</strong>{' '}
        <span className="d-leaderboard-tag">#{tag}</span>{' '}
        <button
          type="button"
          className="d-name-edit"
          onClick={() => { setSavedName(null); setName(savedName); }}
        >
          edit
        </button>
      </div>
    );
  }

  return (
    <form className="d-name-form" onSubmit={onSaveName}>
      <label className="d-name-label">
        Set a display name? Otherwise the leaderboard shows your tag{' '}
        <span className="d-leaderboard-tag">#{tag}</span>.
      </label>
      <div className="d-name-row">
        <input
          type="text"
          className="d-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={PLAYER_NAME_RULES.maxLen}
        />
        <button
          type="submit"
          className="d-name-save"
          disabled={!sanitisePlayerName(name) || savingName}
        >
          {savingName ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="d-name-rules">{PLAYER_NAME_RULES.description}</div>
    </form>
  );
}

// ============================================================================
// LEADERBOARD (today-only)
// ============================================================================
//   variant='full'    — used on results screen. Highlights the player's row.
//   variant='preview' — used on pre-play screen. Read-only, hides "you're
//                       first" until a row exists; shorter list.
function Leaderboard({ puzzleNumber, variant = 'full', limit = 10, refreshKey = 0 }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const playerId = variant === 'full' ? getPlayerId() : null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDailyStats({ puzzleNumber, playerId }).then((s) => {
      if (cancelled) return;
      setStats(s);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [puzzleNumber, playerId, refreshKey]);

  const me = stats?.today?.me;
  const top = (stats?.today?.top10 || []).slice(0, limit);
  const inTop = me && me.rank <= limit;

  return (
    <div className="d-leaderboard">
      <div className="d-leaderboard-header">
        <span className="d-leaderboard-title">
          {variant === 'preview' ? "Today's leaders" : "Today's leaderboard"}
        </span>
        {stats?.today && (
          <span className="d-leaderboard-count">
            {stats.today.plays.toLocaleString()} {stats.today.plays === 1 ? 'player' : 'players'}
          </span>
        )}
      </div>

      {loading && <div className="d-leaderboard-loading">Loading…</div>}

      {!loading && top.length === 0 && variant === 'full' && (
        <div className="d-leaderboard-empty">
          You're the first to finish today's puzzle.
        </div>
      )}
      {!loading && top.length === 0 && variant === 'preview' && (
        <div className="d-leaderboard-empty">
          No finishers yet — beat the field.
        </div>
      )}

      {!loading && top.length > 0 && (
        <ol className="d-leaderboard-list">
          {top.map((row) => (
            <li
              key={row.rank}
              className={`d-leaderboard-row ${me && row.rank === me.rank ? 'is-me' : ''}`}
            >
              <span className="d-leaderboard-rank">{row.rank}</span>
              <PlayerNameCell name={row.name} tag={row.tag} />
              <span className="d-leaderboard-time">{formatTime(row.time * 1000)}</span>
            </li>
          ))}
          {variant === 'full' && me && !inTop && (
            <>
              <li className="d-leaderboard-gap">…</li>
              <li className="d-leaderboard-row is-me">
                <span className="d-leaderboard-rank">{me.rank}</span>
                <PlayerNameCell name={me.name} tag={me.tag} />
                <span className="d-leaderboard-time">{formatTime(me.time * 1000)}</span>
              </li>
            </>
          )}
        </ol>
      )}
    </div>
  );
}

// Renders a leaderboard row's identity. If a display name is set, shows
// `Name #TAG` with the tag styled small + gray. If not, shows only `#TAG`.
function PlayerNameCell({ name, tag }) {
  const safeTag = tag || '??????';
  if (name && name.trim()) {
    return (
      <span className="d-leaderboard-name">
        {name}
        <span className="d-leaderboard-tag">#{safeTag}</span>
      </span>
    );
  }
  return (
    <span className="d-leaderboard-name">
      <span className="d-leaderboard-tag d-leaderboard-tag-only">#{safeTag}</span>
    </span>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const dailyCss = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&family=Italiana&display=swap');

  .d-pre-root {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--paper);
    background-image:
      radial-gradient(ellipse at top left, rgba(168, 135, 52, 0.08), transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(139, 44, 32, 0.06), transparent 50%);
    color: var(--ink);
    font-family: 'Cormorant Garamond', Georgia, serif;
    padding: 1.5rem 1rem 3rem;
    overscroll-behavior: none;
  }
  .d-pre-container {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  .d-pre-back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--ink-soft);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .d-pre-back:hover { color: var(--accent); }
  .d-pre-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 0.75rem;
  }
  .d-pre-title {
    font-family: 'Italiana', serif;
    font-size: clamp(2.5rem, 7vw, 4rem);
    margin: 0 0 0.5rem;
    line-height: 0.95;
  }
  .d-pre-title em {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--accent);
  }
  .d-pre-date {
    font-style: italic;
    color: var(--ink-soft);
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  .d-new-best { color: var(--accent); font-weight: 600; font-style: normal; }
  .d-pre-rule {
    font-family: 'Italiana', serif;
    font-size: 1.2rem;
    color: var(--ink-soft);
    margin: 1rem 0 1.5rem;
  }
  .d-pre-template {
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: 6px 6px 0 var(--paper-shadow);
  }
  .d-pre-round {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px dotted var(--ink-soft);
    font-family: 'Cormorant Garamond', serif;
  }
  .d-pre-round:last-child { border-bottom: none; }
  .d-pre-round-num {
    font-family: 'Italiana', serif;
    font-size: 1.4rem;
    color: var(--accent);
    width: 1.5rem;
    text-align: left;
  }
  .d-pre-round-label {
    text-align: left;
    font-size: 1.1rem;
  }
  .d-pre-round-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .d-pre-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .d-pre-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  .d-pre-stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .d-pre-stat-value {
    font-family: 'Italiana', serif;
    font-size: 1.6rem;
  }
  .d-pre-start {
    width: 100%;
    min-height: 56px;
    background: var(--ink);
    color: var(--paper);
    border: 1px solid var(--ink);
    padding: 1rem 1.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: 1rem;
  }
  .d-pre-start:hover { background: var(--accent); border-color: var(--accent); }

  /* Leaderboard panel on the results screen */
  .d-leaderboard {
    margin-top: 2rem;
    padding: 1.25rem 1.25rem 1.5rem;
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    box-shadow: 6px 6px 0 var(--paper-shadow);
    text-align: left;
  }
  .d-leaderboard-header {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 0.85rem;
    border-bottom: 1px dotted var(--ink-soft);
    padding-bottom: 0.5rem;
  }
  .d-leaderboard-title {
    font-family: 'Italiana', serif;
    font-size: 1.3rem;
    color: var(--ink);
  }
  .d-leaderboard-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .d-leaderboard-loading,
  .d-leaderboard-empty {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    text-align: center;
    padding: 0.75rem 0;
  }
  .d-leaderboard-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .d-leaderboard-row {
    display: grid;
    grid-template-columns: 2.25rem 1fr auto;
    gap: 0.6rem;
    align-items: baseline;
    padding: 0.4rem 0.5rem;
    border-bottom: 1px dotted rgba(61, 52, 43, 0.2);
  }
  .d-leaderboard-row:last-child { border-bottom: none; }
  .d-leaderboard-row.is-me {
    background: var(--paper);
    border: 1px solid var(--accent);
    margin: 0.2rem -0.25rem;
    padding: 0.5rem 0.6rem;
  }
  .d-leaderboard-rank {
    font-family: 'Italiana', serif;
    font-size: 1.1rem;
    color: var(--accent);
    text-align: right;
  }
  .d-leaderboard-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .d-leaderboard-row.is-me .d-leaderboard-name {
    font-weight: 600;
  }
  /* Anonymous tag chip — small, monospaced, neutral grey. Sits next to a
     display name, or stands alone when no name has been set. */
  .d-leaderboard-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: #8a7e6b;
    margin-left: 0.45rem;
    font-weight: 400;
  }
  .d-leaderboard-tag.d-leaderboard-tag-only {
    margin-left: 0;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    color: var(--ink-soft);
  }
  .d-name-tag-hint {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px dotted var(--ink-soft);
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 0.9rem;
  }
  .d-leaderboard-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: var(--ink);
  }
  .d-leaderboard-gap {
    list-style: none;
    text-align: center;
    color: var(--ink-soft);
    padding: 0.2rem 0;
    font-family: 'Italiana', serif;
    letter-spacing: 0.5em;
  }
  .d-name-form {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dotted var(--ink-soft);
  }
  .d-name-label {
    display: block;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  .d-name-row {
    display: flex; gap: 0.4rem;
  }
  .d-name-input {
    flex: 1; min-width: 0;
    padding: 0.5rem 0.65rem;
    background: var(--paper);
    border: 1px solid var(--ink);
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    color: var(--ink);
    outline: none;
  }
  .d-name-input:focus { border-color: var(--accent); }
  .d-name-save {
    background: var(--ink);
    color: var(--paper);
    border: 1px solid var(--ink);
    padding: 0.5rem 0.9rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .d-name-save:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); }
  .d-name-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .d-name-rules {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-top: 0.4rem;
    opacity: 0.7;
  }
  .d-name-saved {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px dotted var(--ink-soft);
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 0.95rem;
  }
  .d-name-saved strong {
    font-style: normal;
    font-family: 'Italiana', serif;
    font-size: 1.1rem;
    color: var(--ink);
  }
  .d-name-edit {
    background: transparent;
    border: none;
    color: var(--accent);
    text-decoration: underline;
    font-family: inherit;
    font-style: italic;
    cursor: pointer;
    padding: 0;
    margin-left: 0.4rem;
  }
  .d-pre-start-arrow {
    font-family: 'Italiana', serif;
    font-size: 1.5rem;
    letter-spacing: normal;
    margin-left: 0.5rem;
  }
  .d-pre-footer {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-soft);
    opacity: 0.7;
    margin-top: 1.5rem;
  }

  /* Playing card */
  .d-card {
    position: relative;
    background: var(--paper-deep);
    border: 1px solid var(--ink);
    padding: 2rem 1.5rem;
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
  .d-card.correct { border-color: var(--green); }
  .d-card.wrong  { border-color: var(--accent); }
  /* Brief overlay flashed on submit. Sits on top of the card prompt so the
     user can still read what the puzzle is asking after the wrong overlay
     dismisses. */
  .d-feedback-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    backdrop-filter: blur(2px);
    animation: dailyFeedbackFlash 0.18s ease forwards;
  }
  .d-feedback-overlay.correct { background: rgba(232, 236, 212, 0.92); }
  .d-feedback-overlay.wrong   { background: rgba(240, 220, 213, 0.92); }
  @keyframes dailyFeedbackFlash {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .d-card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .d-card-prompt {
    font-family: 'Italiana', serif;
    font-size: clamp(2.5rem, 8vw, 4rem);
    line-height: 1;
  }
  .d-card-sub {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 1rem;
  }
  .d-card-notes {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    font-family: 'Italiana', serif;
    font-size: clamp(1.2rem, 4vw, 1.8rem);
  }
  .d-note-chip {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: 0.25rem 0.6rem;
  }
  .d-note-sep { color: var(--ink-soft); }
  .d-feedback {
    font-size: 4rem;
    line-height: 1;
  }
  .d-feedback.correct { color: var(--green); }
  .d-feedback.wrong { color: var(--accent); font-size: 3rem; }
  .d-answer-prompt {
    font-size: clamp(1.8rem, 6vw, 2.6rem) !important;
    margin-top: 0.25rem;
  }
  .d-feedback-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  /* Top-bar bits */
  .d-top-round {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    color: var(--accent);
  }

  /* Round transition */
  .d-transition {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }
  .d-transition-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .d-transition-label {
    font-family: 'Italiana', serif;
    font-size: clamp(2rem, 6vw, 3rem);
  }
  .d-transition-detail {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    color: var(--ink-soft);
    font-size: 1.1rem;
  }

  /* Letter grid for key-to-accidentals */
  .d-letter-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.3rem;
  }
  .d-letter-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }
  .d-letter-label {
    font-family: 'Italiana', serif;
    font-size: 1.1rem;
  }
  .d-acc-btn {
    width: 100%;
    min-height: 40px;
    padding: 0.4rem 0.2rem;
    background: var(--paper);
    border: 1px solid var(--ink);
    font-family: 'Italiana', serif;
    font-size: 1.1rem;
    color: var(--ink);
    cursor: pointer;
    line-height: 1;
  }
  .d-acc-btn.active-sharp { background: var(--ink); color: var(--paper); }
  .d-acc-btn.active-flat  { background: var(--accent); color: var(--paper); border-color: var(--accent); }

  @keyframes dailyFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .d-fade-in { animation: dailyFadeIn 0.35s ease forwards; }
`;
