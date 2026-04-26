import React, { useState, useRef } from 'react';

// Treble-clef staff with letter-first placement.
//
// UX:
//   - Drag in the left "handle" zone to position a ghost note in the centre,
//     release to place it. Direct taps on the staff area also work.
//   - Accidentals apply to the LAST placed note (disabled until one exists).
//   - Undo removes the most recent note. Clear wipes everything.
//   - Click an existing note's step (no accidental modifier needed) to remove it.

const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const STEP_LETTER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const E4_ABS = 4 * 7 + LETTER_STEP.E;
const C4_ABS = 4 * 7 + LETTER_STEP.C;

const stepFromLetterOctave = (letter, octave) =>
  (octave * 7 + LETTER_STEP[letter]) - E4_ABS;

const letterOctaveFromStep = (step) => {
  const total = E4_ABS + step;
  const octave = Math.floor(total / 7);
  const letterIdx = ((total % 7) + 7) % 7;
  return { letter: STEP_LETTER[letterIdx], octave };
};

// Pick octaves so chord notes stack ascending starting near middle C.
export const layoutChordNotes = (notes, baseOctave = 4) => {
  let prevAbs = null;
  return notes.map((n) => {
    const letter = n[0];
    const accidental = n.slice(1);
    let octave = baseOctave;
    const li = LETTER_STEP[letter];
    if (prevAbs == null) {
      while (octave * 7 + li < C4_ABS) octave++;
    } else {
      while (octave * 7 + li <= prevAbs) octave++;
    }
    prevAbs = octave * 7 + li;
    return { letter, accidental, octave };
  });
};

// Geometry — bumped for readable mobile touch targets.
const W = 400;
const H = 280;
const HANDLE_LEFT = 8;
const HANDLE_RIGHT = 92;
const STAFF_LEFT = 110;
const STAFF_RIGHT = W - 16;
const STAFF_TOP = 100;
const LINE_GAP = 18;
const STEP_PX = LINE_GAP / 2;
const NOTE_X = STAFF_LEFT + 150;
const yForStep = (step) => STAFF_TOP + (8 - step) * STEP_PX;

const MIN_STEP = -3;
const MAX_STEP = 11;
const clampStep = (s) => Math.max(MIN_STEP, Math.min(MAX_STEP, s));

const stepFromY = (y) => {
  const raw = (STAFF_TOP + 8 * STEP_PX - y) / STEP_PX;
  return clampStep(Math.round(raw));
};

const ACCIDENTAL_GLYPH = { '': '', '#': '\u266F', 'b': '\u266D' };

function StaffLines() {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const y = STAFF_TOP + i * LINE_GAP;
    lines.push(
      <line
        key={`l${i}`}
        x1={STAFF_LEFT}
        y1={y}
        x2={STAFF_RIGHT}
        y2={y}
        stroke="#1a1410"
        strokeWidth="1.2"
      />
    );
  }
  return <g>{lines}</g>;
}

function TrebleClef() {
  return (
    <text
      x={STAFF_LEFT - 8}
      y={STAFF_TOP + 4 * LINE_GAP + 14}
      fontFamily="Times New Roman, serif"
      fontSize="148"
      fill="#1a1410"
    >
      {'\u{1D11E}'}
    </text>
  );
}

function NoteHead({ x, y, accidental, ghost = false }) {
  const fill = ghost ? 'rgba(26, 20, 16, 0.4)' : '#1a1410';
  return (
    <g style={{ pointerEvents: 'none' }}>
      {accidental && (
        <text
          x={x - 18}
          y={y + 7}
          fontFamily="Times New Roman, serif"
          fontSize="26"
          fill={fill}
          textAnchor="end"
        >
          {ACCIDENTAL_GLYPH[accidental]}
        </text>
      )}
      <ellipse
        cx={x}
        cy={y}
        rx={9.5}
        ry={7}
        fill={fill}
        stroke={fill}
        strokeWidth="1.5"
        transform={`rotate(-20 ${x} ${y})`}
      />
    </g>
  );
}

function LedgerLine({ x, step }) {
  const y = yForStep(step);
  return (
    <line
      x1={x - 14}
      y1={y}
      x2={x + 14}
      y2={y}
      stroke="#1a1410"
      strokeWidth="1.2"
    />
  );
}

function ledgersForStep(step) {
  const ledgers = [];
  if (step <= -2) {
    for (let s = -2; s >= step; s -= 2) ledgers.push(s);
  } else if (step >= 10) {
    for (let s = 10; s <= step; s += 2) ledgers.push(s);
  }
  return ledgers;
}

// Drag-handle indicator — a vertical bar on the left with arrows + label.
function DragHandle({ active, dragStep }) {
  const knobY = dragStep != null ? yForStep(dragStep) : (STAFF_TOP + 4 * LINE_GAP);
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Tall hint zone */}
      <rect
        x={HANDLE_LEFT}
        y={STAFF_TOP - 24}
        width={HANDLE_RIGHT - HANDLE_LEFT}
        height={H - STAFF_TOP - 8}
        fill="rgba(168, 135, 52, 0.12)"
        stroke={active ? 'var(--accent)' : 'var(--gold)'}
        strokeWidth="1.5"
        strokeDasharray="6 4"
        rx="4"
      />
      {/* Up/down arrows */}
      <text
        x={(HANDLE_LEFT + HANDLE_RIGHT) / 2}
        y={STAFF_TOP - 8}
        textAnchor="middle"
        fontFamily="Italiana, serif"
        fontSize="18"
        fill="var(--ink-soft)"
      >
        {'\u25B2'}
      </text>
      <text
        x={(HANDLE_LEFT + HANDLE_RIGHT) / 2}
        y={H - 12}
        textAnchor="middle"
        fontFamily="Italiana, serif"
        fontSize="18"
        fill="var(--ink-soft)"
      >
        {'\u25BC'}
      </text>
      {/* Drag knob (current Y indicator) */}
      <circle
        cx={(HANDLE_LEFT + HANDLE_RIGHT) / 2}
        cy={knobY}
        r={active ? 24 : 20}
        fill={active ? 'var(--accent)' : 'var(--gold)'}
        stroke="#1a1410"
        strokeWidth="1.5"
        opacity={active ? 1 : 0.9}
      />
      <text
        x={(HANDLE_LEFT + HANDLE_RIGHT) / 2}
        y={knobY + 4}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="10"
        fill="#f4ecdc"
        letterSpacing="0.1em"
      >
        DRAG
      </text>
    </g>
  );
}

export default function Staff({
  mode,
  displayNotes,
  inputNotes,
  onInputChange,
  maxNotes = 6,
}) {
  const [dragStep, setDragStep] = useState(null);
  const dragOriginRef = useRef(null); // 'handle' | 'direct' | null

  const notes = mode === 'display' ? (displayNotes || []) : (inputNotes || []);

  const eventToCoords = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const x = ((e.clientX - rect.left) / rect.width) * W;
    return { x, y, step: stepFromY(y) };
  };

  const handlePointerDown = (e) => {
    if (mode !== 'input') return;
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    const { x, step } = eventToCoords(e);
    dragOriginRef.current = x < STAFF_LEFT - 5 ? 'handle' : 'direct';
    setDragStep(step);
  };

  const handlePointerMove = (e) => {
    if (mode !== 'input' || dragStep == null) return;
    const { step } = eventToCoords(e);
    if (step !== dragStep) setDragStep(step);
  };

  const handlePointerUp = (e) => {
    if (mode !== 'input' || dragStep == null) return;
    const { step } = eventToCoords(e);
    setDragStep(null);
    dragOriginRef.current = null;

    // Toggle: tapping/releasing on an existing-note step removes it.
    const existingIdx = (inputNotes || []).findIndex(
      (n) => stepFromLetterOctave(n.letter, n.octave) === step
    );
    if (existingIdx !== -1) {
      onInputChange((inputNotes || []).filter((_, i) => i !== existingIdx));
      return;
    }

    const cur = inputNotes || [];
    const { letter, octave } = letterOctaveFromStep(step);
    // Letter-first: place natural; user can apply accidental afterwards.
    if (cur.length >= maxNotes) {
      // At capacity — drop the oldest entry to make room for the new one.
      onInputChange([...cur.slice(1), { letter, accidental: '', octave }]);
      return;
    }
    onInputChange([...cur, { letter, accidental: '', octave }]);
  };

  const cancelDrag = () => {
    setDragStep(null);
    dragOriginRef.current = null;
  };

  const lastIdx = (inputNotes || []).length - 1;
  const lastNote = lastIdx >= 0 ? inputNotes[lastIdx] : null;
  const accidentalsEnabled = !!lastNote;

  const setAccidental = (acc) => {
    if (!lastNote) return;
    const next = [...inputNotes];
    next[lastIdx] = {
      ...lastNote,
      accidental: lastNote.accidental === acc ? '' : acc,
    };
    onInputChange(next);
  };

  const undo = () => {
    if (!inputNotes || inputNotes.length === 0) return;
    onInputChange(inputNotes.slice(0, -1));
  };

  const clear = () => {
    onInputChange([]);
  };

  return (
    <div className="staff-wrapper">
      <svg
        className="staff-svg"
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelDrag}
        onPointerLeave={cancelDrag}
        style={{ touchAction: 'none' }}
      >
        <StaffLines />
        <TrebleClef />

        {/* Drag handle (input mode only) */}
        {mode === 'input' && <DragHandle active={dragStep != null} dragStep={dragStep} />}

        {/* Existing notes — vertically stacked at NOTE_X */}
        {notes.map((n, i) => {
          const step = stepFromLetterOctave(n.letter, n.octave);
          const y = yForStep(step);
          const ledgers = ledgersForStep(step);
          return (
            <g key={`${i}-${n.letter}-${n.octave}-${n.accidental}`}>
              {ledgers.map((s) => <LedgerLine key={`ld${i}-${s}`} x={NOTE_X} step={s} />)}
              <NoteHead x={NOTE_X} y={y} accidental={n.accidental} />
            </g>
          );
        })}

        {/* Drag preview ghost at NOTE_X (always centred) */}
        {mode === 'input' && dragStep != null && (
          <g opacity="0.5" style={{ pointerEvents: 'none' }}>
            {ledgersForStep(dragStep).map((s) => (
              <LedgerLine key={`gld-${s}`} x={NOTE_X} step={s} />
            ))}
            <NoteHead x={NOTE_X} y={yForStep(dragStep)} accidental="" ghost />
          </g>
        )}
      </svg>

      {mode === 'input' && (
        <>
          <div className="staff-acc-row">
            <button
              type="button"
              className={`staff-acc-btn ${lastNote && lastNote.accidental === 'b' ? 'on' : ''}`}
              onClick={() => setAccidental('b')}
              disabled={!accidentalsEnabled}
            >{'\u266D'}</button>
            <button
              type="button"
              className={`staff-acc-btn ${lastNote && lastNote.accidental === '#' ? 'on' : ''}`}
              onClick={() => setAccidental('#')}
              disabled={!accidentalsEnabled}
            >{'\u266F'}</button>
            <button
              type="button"
              className="staff-acc-btn ghost"
              onClick={undo}
              disabled={!inputNotes || inputNotes.length === 0}
            >
              Undo
            </button>
            <button
              type="button"
              className="staff-acc-btn ghost"
              onClick={clear}
              disabled={!inputNotes || inputNotes.length === 0}
            >
              Clear
            </button>
          </div>
          <div className="staff-hint">
            Drag the gold knob on the left · accidentals apply to the last note
          </div>
        </>
      )}
    </div>
  );
}
