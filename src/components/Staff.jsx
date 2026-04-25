import React, { useState } from 'react';

// Treble-clef staff with whole-note display and click-to-place input.
// Coordinate system: each "step" is half a line-spacing.
// step 0 = bottom line (E4). Steps increase upward.

const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const STEP_LETTER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const E4_ABS = 4 * 7 + LETTER_STEP.E; // 30
const C4_ABS = 4 * 7 + LETTER_STEP.C; // 28

const stepFromLetterOctave = (letter, octave) =>
  (octave * 7 + LETTER_STEP[letter]) - E4_ABS;

const letterOctaveFromStep = (step) => {
  const total = E4_ABS + step;
  const octave = Math.floor(total / 7);
  const letterIdx = ((total % 7) + 7) % 7;
  return { letter: STEP_LETTER[letterIdx], octave };
};

// Choose an octave for each chord note so they stack ascending starting near middle C.
// Returns array of { letter, accidental, octave } in input order.
export const layoutChordNotes = (notes, baseOctave = 4) => {
  let prevAbs = null;
  return notes.map((n) => {
    const letter = n[0];
    const accidental = n.slice(1);
    let octave = baseOctave;
    const li = LETTER_STEP[letter];
    if (prevAbs == null) {
      // For first note: pick lowest octave that puts it at or above C4 (middle C)
      while (octave * 7 + li < C4_ABS) octave++;
    } else {
      // Each subsequent note ascends — smallest octave strictly above prev
      while (octave * 7 + li <= prevAbs) octave++;
    }
    prevAbs = octave * 7 + li;
    return { letter, accidental, octave };
  });
};

// Geometry
const W = 360;
const H = 200;
const STAFF_LEFT = 80;
const STAFF_RIGHT = W - 20;
const STAFF_TOP = 70; // y of top (F5) line
const LINE_GAP = 12; // px between adjacent staff lines
const STEP_PX = LINE_GAP / 2;
// Staff has 5 lines: F5(top)=step 8, D5=6, B4=4, G4=2, E4(bottom)=0
const yForStep = (step) => STAFF_TOP + (8 - step) * STEP_PX;

// Allowed input range: B3 (step -3) to A5 (step 11). Covers what we need.
const MIN_STEP = -3;
const MAX_STEP = 11;
const clampStep = (s) => Math.max(MIN_STEP, Math.min(MAX_STEP, s));

// Click → step (snap to nearest)
const stepFromY = (y) => {
  const raw = (STAFF_TOP + 8 * STEP_PX - y) / STEP_PX;
  return clampStep(Math.round(raw));
};

const ACCIDENTAL_GLYPH = { '': '', '#': '\u266F', 'b': '\u266D' };

function StaffLines() {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const y = STAFF_TOP + i * LINE_GAP;
    lines.push(<line key={`l${i}`} x1={STAFF_LEFT} y1={y} x2={STAFF_RIGHT} y2={y} stroke="#1a1410" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

function TrebleClef() {
  // Use Unicode treble clef glyph for simplicity
  return (
    <text
      x={STAFF_LEFT + 5}
      y={STAFF_TOP + 4 * LINE_GAP + 14}
      fontFamily="Times New Roman, serif"
      fontSize="62"
      fill="#1a1410"
    >
      {'\u{1D11E}'}
    </text>
  );
}

// Filled note head with accidental drawn to the left.
function NoteHead({ x, y, accidental }) {
  const fill = '#1a1410';
  return (
    <g style={{ pointerEvents: 'none' }}>
      {accidental && (
        <text
          x={x - 16}
          y={y + 6}
          fontFamily="Times New Roman, serif"
          fontSize="22"
          fill={fill}
          textAnchor="end"
        >
          {ACCIDENTAL_GLYPH[accidental]}
        </text>
      )}
      <ellipse
        cx={x}
        cy={y}
        rx={7.5}
        ry={5.5}
        fill={fill}
        stroke={fill}
        strokeWidth="1.5"
        transform={`rotate(-20 ${x} ${y})`}
      />
    </g>
  );
}

// Ledger line at given step (extending C4 = -2, A5 = 10, etc.)
function LedgerLine({ x, step }) {
  const y = yForStep(step);
  return <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke="#1a1410" strokeWidth="1" />;
}

// All ledger lines needed to reach a note at given step from the staff.
// Staff lines exist at steps 0,2,4,6,8. Ledger lines fill steps below 0 or above 8 at even intervals.
function ledgersForStep(step) {
  const ledgers = [];
  if (step <= -2) {
    for (let s = -2; s >= step; s -= 2) ledgers.push(s);
  } else if (step >= 10) {
    for (let s = 10; s <= step; s += 2) ledgers.push(s);
  }
  return ledgers;
}

export default function Staff({
  mode,            // 'display' | 'input'
  displayNotes,    // [{letter, accidental, octave}] for display mode
  inputNotes,      // [{letter, accidental, octave}] current placed notes
  onInputChange,   // (newNotes) => void
  maxNotes = 6,
}) {
  const [accidental, setAccidental] = useState('');
  const [dragStep, setDragStep] = useState(null);

  // All notes share the same x — chord-style vertical stacking.
  const NOTE_X = STAFF_LEFT + 140;
  const notes = mode === 'display' ? (displayNotes || []) : (inputNotes || []);

  const eventToStep = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * H;
    return stepFromY(y);
  };

  const handlePointerDown = (e) => {
    if (mode !== 'input') return;
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    setDragStep(eventToStep(e));
  };

  const handlePointerMove = (e) => {
    if (mode !== 'input' || dragStep == null) return;
    const step = eventToStep(e);
    if (step !== dragStep) setDragStep(step);
  };

  const handlePointerUp = (e) => {
    if (mode !== 'input' || dragStep == null) return;
    const step = eventToStep(e);
    setDragStep(null);

    // Toggle: click/drag-end on an existing-note step removes it.
    const existingIdx = (inputNotes || []).findIndex(
      (n) => stepFromLetterOctave(n.letter, n.octave) === step
    );
    if (existingIdx !== -1) {
      onInputChange((inputNotes || []).filter((_, i) => i !== existingIdx));
      return;
    }

    if ((inputNotes || []).length >= maxNotes) return;
    const { letter, octave } = letterOctaveFromStep(step);
    const next = [...(inputNotes || []), { letter, accidental, octave }];
    onInputChange(next);
    setAccidental('');
  };

  const cancelDrag = () => setDragStep(null);

  return (
    <div className="staff-wrapper">
      {mode === 'input' && (
        <div className="staff-acc-row">
          {['b', '', '#'].map((a) => (
            <button
              key={a || 'natural'}
              type="button"
              className={`staff-acc-btn ${accidental === a ? 'on' : ''}`}
              onClick={() => setAccidental(a)}
            >
              {a === '' ? '\u266E' : ACCIDENTAL_GLYPH[a]}
            </button>
          ))}
          <button
            type="button"
            className="staff-acc-btn ghost"
            onClick={() => onInputChange([])}
          >
            Clear
          </button>
        </div>
      )}

      <svg
        className="staff-svg"
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelDrag}
        onPointerLeave={cancelDrag}
        style={{ cursor: mode === 'input' ? 'crosshair' : 'default', touchAction: 'none' }}
      >
        <StaffLines />
        <TrebleClef />

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

        {/* Drag preview ghost */}
        {dragStep != null && (
          <g opacity="0.4" style={{ pointerEvents: 'none' }}>
            {ledgersForStep(dragStep).map((s) => (
              <LedgerLine key={`gld-${s}`} x={NOTE_X} step={s} />
            ))}
            <NoteHead x={NOTE_X} y={yForStep(dragStep)} accidental={accidental} />
          </g>
        )}
      </svg>

      {mode === 'input' && (
        <div className="staff-hint">
          Click or drag to place · click the same spot to remove · {accidental ? `next note: ${ACCIDENTAL_GLYPH[accidental]}` : 'natural'}
        </div>
      )}
    </div>
  );
}
