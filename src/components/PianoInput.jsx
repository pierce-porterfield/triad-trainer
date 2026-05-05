import React, { useMemo, useState, useEffect, useRef } from 'react';
import { noteToPc, pcToNote, pcBothSpellings } from '../data/pitchClass';
import { cyrb53 } from '../utils/seededRandom';

const DOT_COLORS = [
  '#8b2c20', // accent red
  '#a88734', // gold
  '#2f6d4f', // green
  '#3a5c8b', // blue
  '#6b4d8b', // purple
  '#3d342b', // ink-soft
];

const REFERENCE_GREEN = '#2f6d4f';

// For display mode: pick one (octave, pitch-class) per note so the same note
// doesn't light up across multiple octaves. Notes ascend (root → 3rd → 5th
// → 7th → 9th → 13th); octave-of-root varied by seed for visual variety.
//
// `octaves` is the number of octaves visible (and the available range for
// placement). 2 is the default for triads / 7ths / 6ths / single notes;
// callers spelling/displaying 9th-13th chords pass 3 so the topmost
// extension always fits above the 7th.
const placeChordOnPiano = (notes, seed, octaves) => {
  const seedNum = cyrb53(String(seed || ''));
  const validPcs = notes.map(noteToPc).filter((pc) => pc >= 0);
  if (validPcs.length === 0) return [];

  // Walk at oct=0 to find the chord's chromatic span (root to highest note).
  let abs = -1;
  let span = 0;
  for (const pc of validPcs) {
    let o = 0;
    while (o * 12 + pc <= abs && o < octaves) o++;
    abs = o * 12 + pc;
    span = abs;
  }
  // Highest legal startOctave such that the topmost note still fits.
  const maxAbs = octaves * 12 - 1;
  const maxStartOctave = Math.max(0, Math.floor((maxAbs - span) / 12));
  const desired = seedNum % octaves;
  const startOctave = Math.min(desired, maxStartOctave);

  const positions = [];
  let prevAbs = -1;
  validPcs.forEach((pc, i) => {
    let oct = i === 0 ? startOctave : 0;
    while (oct * 12 + pc <= prevAbs && oct < octaves) oct++;
    if (oct >= octaves) oct = octaves - 1; // fallback (rare)
    positions.push({ pc, octave: oct });
    prevAbs = oct * 12 + pc;
  });
  return positions;
};

const WHITE_KEYS = [
  { pc: 0, idx: 0, label: 'C' },
  { pc: 2, idx: 1, label: 'D' },
  { pc: 4, idx: 2, label: 'E' },
  { pc: 5, idx: 3, label: 'F' },
  { pc: 7, idx: 4, label: 'G' },
  { pc: 9, idx: 5, label: 'A' },
  { pc: 11, idx: 6, label: 'B' },
];
const BLACK_KEYS = [
  { pc: 1,  afterIdx: 0 }, // C#
  { pc: 3,  afterIdx: 1 }, // D#
  { pc: 6,  afterIdx: 3 }, // F#
  { pc: 8,  afterIdx: 4 }, // G#
  { pc: 10, afterIdx: 5 }, // A#
];

const WHITE_W = 50;     // SVG-coord width per white key
const H_PER_OCTAVE = 110; // SVG-coord height per octave — keeps the
                          // viewBox aspect ratio constant at 3.18:1
                          // regardless of how many octaves are visible,
                          // so the rendered piano height on mobile stays
                          // the same and tap-targets sit where the user
                          // expects (instead of bunching to the top of
                          // a squashed canvas with empty space below).
const BLACK_W = WHITE_W * 0.6;

export default function PianoInput({
  mode = 'input',
  value = [],
  onChange,
  maxNotes = 6,
  chordSeed,
  // 2 = standard triad/7th piano. 3 = enough room for the full ascending
  // stack of a 13th chord with the root anywhere. Callers default to 2;
  // chord-spelling for 9ths/11ths/13ths passes 3 so the top extension
  // doesn't get crammed back below the 7th.
  octaves = 2,
  // Optional reference note rendered in green and not interactive — used by
  // the interval trainer to anchor "above C" or "below F" prompts. The
  // parent passes the specific octave to render it in.
  referenceNote,
  referenceOctave,
}) {
  // Input mode tracks exact (pc, octave) positions internally so a tap on a
  // specific C lights only THAT C, not the C an octave away. The parent only
  // ever sees pitch-class strings, derived from positions in emitPositions.
  const [positions, setPositions] = useState([]);

  // Tap-and-drag state. On mobile especially with the 3-octave piano the
  // black keys are tiny — a finger covers 2-3 keys at once. Drag-to-aim
  // lets the user press anywhere, slide to the target, and see a floating
  // preview of the note they'll commit on release. `dragKey.off` means
  // they're currently outside any valid key (or hovering the reference).
  const [dragKey, setDragKey] = useState(null);
  const svgRef = useRef(null);

  // Reset internal positions when the parent clears `value`.
  useEffect(() => {
    if (mode === 'input' && value.length === 0 && positions.length > 0) {
      setPositions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value.length]);

  // Display mode: pick one (octave, pc) per note so notes don't repeat across octaves.
  const displayPositions = useMemo(
    () => mode === 'display' ? placeChordOnPiano(value, chordSeed, octaves) : [],
    [mode, value, chordSeed, octaves]
  );

  // Reference highlight (interval trainer prompt). Pre-computed once.
  const referenceHighlight = useMemo(() => {
    if (referenceNote == null || referenceOctave == null) return null;
    const pc = noteToPc(referenceNote);
    if (pc < 0) return null;
    return { pc, octave: Math.max(0, Math.min(octaves - 1, referenceOctave)) };
  }, [referenceNote, referenceOctave, octaves]);

  const isReferenceKey = (pc, octave) =>
    referenceHighlight && referenceHighlight.pc === pc && referenceHighlight.octave === octave;

  const positionAt = (pc, octave) => {
    const pool = mode === 'input' ? positions : displayPositions;
    return pool.findIndex((p) => p.pc === pc && p.octave === octave);
  };

  const isKeyLit = (pc, octave) => positionAt(pc, octave) !== -1;

  const colorForKey = (pc, octave) => {
    if (mode === 'display') {
      const idx = positionAt(pc, octave);
      return idx >= 0 ? DOT_COLORS[idx % DOT_COLORS.length] : 'var(--accent)';
    }
    return 'var(--accent)';
  };

  const emitPositions = (next) => {
    setPositions(next);
    if (onChange) {
      onChange(next.map((p) => pcToNote(p.pc)));
    }
  };

  const commitKey = (pc, octave) => {
    if (mode !== 'input' || !onChange) return;
    if (isReferenceKey(pc, octave)) return;
    const idx = positionAt(pc, octave);
    if (idx !== -1) {
      emitPositions(positions.filter((_, i) => i !== idx));
      return;
    }
    if (positions.length >= maxNotes) {
      emitPositions([...positions.slice(1), { pc, octave }]);
      return;
    }
    emitPositions([...positions, { pc, octave }]);
  };

  // Hit-test the topmost piano key at a screen point. Black keys overlap
  // white keys in the upper portion of the SVG; elementFromPoint resolves
  // that automatically because black keys render after white keys (so they
  // sit on top in the DOM stacking order).
  const hitTest = (clientX, clientY) => {
    if (typeof document === 'undefined') return null;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const target = el.closest('[data-pc]');
    if (!target) return null;
    const pc = Number(target.dataset.pc);
    const oct = Number(target.dataset.oct);
    if (Number.isNaN(pc) || Number.isNaN(oct)) return null;
    return { pc, octave: oct };
  };

  const onPointerDown = (e) => {
    if (mode !== 'input') return;
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) return;
    // Capture so subsequent move/up events route here even if the finger
    // slides outside the SVG bounds.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    const off = isReferenceKey(hit.pc, hit.octave);
    setDragKey({ pc: hit.pc, octave: hit.octave, x: e.clientX, y: e.clientY, off });
  };

  const onPointerMove = (e) => {
    if (!dragKey) return;
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) {
      setDragKey({ ...dragKey, x: e.clientX, y: e.clientY, off: true });
      return;
    }
    const off = isReferenceKey(hit.pc, hit.octave);
    setDragKey({ pc: hit.pc, octave: hit.octave, x: e.clientX, y: e.clientY, off });
  };

  const onPointerUp = () => {
    if (!dragKey) return;
    if (!dragKey.off) commitKey(dragKey.pc, dragKey.octave);
    setDragKey(null);
  };

  const onPointerCancel = () => setDragKey(null);

  const w = 7 * octaves * WHITE_W;
  const h = H_PER_OCTAVE * octaves;
  const blackH = h * 0.62;

  // Hover/preview key (the one that would commit if the finger lifts now).
  const hoverKey = dragKey && !dragKey.off ? dragKey : null;
  const isHoverKey = (pc, octave) =>
    hoverKey && hoverKey.pc === pc && hoverKey.octave === octave;

  return (
    <div className="piano-wrapper">
      <svg
        ref={svgRef}
        className="piano-svg"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        // touchAction: none disables the browser's own scroll/zoom gestures
        // on this element while in input mode so the drag doesn't scroll
        // the page out from under the user. Display mode keeps the default
        // ('manipulation') so chord pages still pan normally.
        style={{ touchAction: mode === 'input' ? 'none' : 'manipulation' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* White keys */}
        {Array.from({ length: octaves }, (_, oct) =>
          WHITE_KEYS.map((k) => {
            const x = (oct * 7 + k.idx) * WHITE_W;
            const isRef = isReferenceKey(k.pc, oct);
            const isOn = !isRef && isKeyLit(k.pc, oct);
            const isHover = !isRef && isHoverKey(k.pc, oct);
            const color = isRef ? REFERENCE_GREEN : colorForKey(k.pc, oct);
            const fill = isRef || isOn ? color : '#fafafa';
            return (
              <rect
                key={`w-${oct}-${k.idx}`}
                data-pc={k.pc}
                data-oct={oct}
                x={x}
                y={0}
                width={WHITE_W}
                height={h}
                fill={fill}
                stroke={isHover ? color : '#1a1410'}
                strokeWidth={isHover ? 3 : 1}
                style={{ cursor: mode === 'input' && !isRef ? 'pointer' : 'default' }}
              />
            );
          })
        )}
        {/* Black keys (drawn on top) */}
        {Array.from({ length: octaves }, (_, oct) =>
          BLACK_KEYS.map((b) => {
            const xCenter = (oct * 7 + b.afterIdx + 1) * WHITE_W;
            const x = xCenter - BLACK_W / 2;
            const isRef = isReferenceKey(b.pc, oct);
            const isOn = !isRef && isKeyLit(b.pc, oct);
            const isHover = !isRef && isHoverKey(b.pc, oct);
            const color = isRef ? REFERENCE_GREEN : colorForKey(b.pc, oct);
            const fill = isRef ? color : (isOn ? color : '#1a1410');
            return (
              <rect
                key={`b-${oct}-${b.pc}`}
                data-pc={b.pc}
                data-oct={oct}
                x={x}
                y={0}
                width={BLACK_W}
                height={blackH}
                fill={fill}
                stroke={isHover ? color : '#1a1410'}
                strokeWidth={isHover ? 3 : 1}
                style={{ cursor: mode === 'input' && !isRef ? 'pointer' : 'default' }}
              />
            );
          })
        )}
      </svg>
      {hoverKey && (
        <div
          className="piano-preview"
          style={{ left: hoverKey.x, top: hoverKey.y }}
          aria-hidden="true"
        >
          {pcBothSpellings(hoverKey.pc)}
        </div>
      )}
      {mode === 'input' && (
        <div className="piano-hint">Tap or drag to place a note · tap again to remove</div>
      )}
    </div>
  );
}
