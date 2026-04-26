import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDailyPuzzle } from '../utils/dailyPuzzle';
import { loadState, hasPlayedToday, markCompleted } from '../utils/dailyState';
import { formatTime } from '../utils/bestTimes';
import { hapticCorrect, hapticWrong } from '../utils/haptics';
import { notesMatch, formatNote } from '../data/notes';
import { chordNameMatch } from '../data/triads';
import { KEY_LETTERS, accidentalFor, answersMatch, keyNameMatch, notesInKey } from '../data/keys';
import TrainerLayout from './TrainerLayout.jsx';
import NotePicker from './NotePicker.jsx';
import ChordPicker from './ChordPicker.jsx';
import KeyPicker from './KeyPicker.jsx';
import { QUALITIES } from '../data/triads';

const FEEDBACK_DELAY_MS = 1100;
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
    return (
      <>
        <div className="d-card-label">— Name the chord —</div>
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

// Per-card-type input rendering
function CardInput({ round, card, answer, setAnswer }) {
  if (round.type === 'triad' && round.direction === 'chord-to-notes') {
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
    // Daily uses a fixed pool of base triad qualities (maj, min, dim, aug)
    const qualityKeys = ['maj', 'min', 'dim', 'aug'];
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
    return (
      <KeyPicker
        value={answer.keyAnswer || ''}
        onChange={(next) => setAnswer({ ...answer, keyAnswer: next })}
        allowMajor={true}
        allowMinor={false}
      />
    );
  }
  if (round.type === 'interval') {
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
function gradeAnswer(round, card, answer) {
  if (round.type === 'triad' && round.direction === 'chord-to-notes') {
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
    return notesMatch([answer.note || ''], [card.note]);
  }
  return false;
}

// What the round-type label looks like
const roundTypeLabel = (round) => {
  if (round.type === 'triad') return 'Triads';
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
  const [roundResults, setRoundResults] = useState([]); // correct count per round
  const [currentRoundCorrect, setCurrentRoundCorrect] = useState(0);
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

  // After feedback shows, briefly delay then advance
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => advance(), FEEDBACK_DELAY_MS);
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
    setRoundResults([]);
    setCurrentRoundCorrect(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setTransitioning(true);
    setPhase('playing');
  };

  const submit = () => {
    if (feedback) return;
    const isCorrect = gradeAnswer(round, card, answer);
    if (isCorrect) {
      setCurrentRoundCorrect((n) => n + 1);
      hapticCorrect();
    } else {
      hapticWrong();
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const advance = () => {
    setFeedback(null);
    setAnswer({});

    const isLastCardOfRound = cardIdx + 1 >= round.cards.length;
    const isLastRound = roundIdx + 1 >= puzzle.rounds.length;

    if (!isLastCardOfRound) {
      setCardIdx(cardIdx + 1);
      return;
    }

    // Round done — bank the per-round correct count
    const finalCorrectThisRound = currentRoundCorrect + (feedback === 'correct' ? 0 : 0);
    // currentRoundCorrect was already incremented in submit() before feedback set
    const updatedResults = [...roundResults, currentRoundCorrect];
    setRoundResults(updatedResults);
    setCurrentRoundCorrect(0);

    if (isLastRound) {
      finishPuzzle(updatedResults);
      return;
    }

    // Move to next round with transition
    setRoundIdx(roundIdx + 1);
    setCardIdx(0);
    setTransitioning(true);
  };

  const finishPuzzle = (allRoundResults) => {
    const totalScore = allRoundResults.reduce((a, b) => a + b, 0);
    const time = Math.round((Date.now() - startedAt) / 1000); // seconds
    const result = {
      time,
      score: totalScore,
      breakdown: allRoundResults,
      puzzleNumber: puzzle.number,
    };
    const newState = markCompleted(result);
    setLatestResult(result);
    setFinalState(newState);
    setPhase('done');
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
          <div className="d-pre-eyebrow">— Today's puzzle —</div>
          <h1 className="d-pre-title">Triad<em>le</em> · #{String(puzzle.number).padStart(3, '0')}</h1>
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
            Start today's puzzle <span className="d-pre-start-arrow">→</span>
          </button>

          <div className="d-pre-footer">
            +20s per wrong · timer starts when you tap Start · one attempt per day
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
          {!feedback && <CardFront round={round} card={card} />}
          {feedback === 'correct' && (
            <>
              <div className="d-feedback correct">✓</div>
              <div className="d-feedback-label">Correct</div>
            </>
          )}
          {feedback === 'wrong' && (
            <>
              <div className="d-feedback wrong">✗</div>
              <div className="d-feedback-label">Not quite</div>
            </>
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

  const buildShareString = () => {
    if (!result) return '';
    const blocks = (result.breakdown || []).map((correct) => {
      const filled = '\u25CF'.repeat(correct);
      const empty = '\u25CB'.repeat(5 - correct);
      return filled + empty;
    });
    const lines = [
      `Triadle #${String(result.puzzleNumber).padStart(3, '0')} \u00B7 ${formatTime(result.time * 1000)}`,
      ...blocks,
      `${result.score}/15 \u00B7 triadtrainer.org`,
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

  return (
    <div className="d-pre-root">
      <style>{dailyCss}</style>
      <div className="d-pre-container d-fade-in">
        <Link to="/" className="d-pre-back"><span>←</span> Back</Link>
        <div className="d-pre-eyebrow">— Triadle #{String(result.puzzleNumber).padStart(3, '0')} —</div>
        <h1 className="d-pre-title">{formatTime(result.time * 1000)}</h1>
        <div className="d-pre-date">
          {result.score} / 15 correct
          {isPersonalBest && <span className="d-new-best"> — new personal best!</span>}
        </div>
        <div className="d-pre-rule">❦</div>

        <div className="d-pre-template">
          {result.breakdown.map((correct, i) => {
            const round = puzzle.rounds[i];
            return (
              <div key={i} className="d-pre-round">
                <span className="d-pre-round-num">{i + 1}</span>
                <span className="d-pre-round-label">{roundTypeLabel(round)}</span>
                <span className="d-pre-round-count">{correct} / {round.cards.length}</span>
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

        <button className="d-pre-start" onClick={share}>
          {copied ? 'Copied to clipboard ✓' : 'Share result →'}
        </button>

        <div className="d-pre-footer">
          New puzzle at midnight UTC. Practice triads in the trainers to improve.
        </div>
      </div>
    </div>
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
  .d-card.wrong { border-color: var(--accent); }
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
  .d-feedback.wrong { color: var(--accent); }
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
