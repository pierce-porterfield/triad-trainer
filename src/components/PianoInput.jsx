import React, { useMemo, useState, useEffect } from 'react';
import { noteToPc, pcToNote } from '../data/pitchClass';
import { cyrb53 } from '../utils/seededRandom';

const DOT_COLORS = [
  '#8b2c20', // accent red
  '#a88734', // gold
  '#2f6d4f', // green
  '#3a5c8b', // blue
  '#6b4d8b', // purple
  '#3d342b', // ink-soft
];

// For display mode: pick one (octave, pitch-class) per note so the same note
// doesn't light up across both octaves. Notes ascend (root → 3rd → 5th → 7th
// → 9th → 13th); octave-of-root varied by seed for visual variety.
//
// The piano shows 2 octaves (24 semitones). 9th and 13th chords span more
// than 12 semitones from root to top extension, so they only fit when the
// root starts in octave 0. We compute the chord's chromatic span up front
// and clamp startOctave accordingly — without this clamp, starting in
// octave 1 caused the algorithm to fail-back to octave 1 for the topmost
// extensions, putting them BELOW the 7th and breaking voicing order.
const placeChordOnPiano = (notes, seed) => {
  const seedNum = cyrb53(String(seed || ''));
  const validPcs = notes.map(noteToPc).filter((pc) => pc >= 0);
  if (validPcs.length === 0) return [];

  // Walk the chord at oct=0 to find its total span; that tells us the highest
  // possible startOctave that still fits in 24 semitones.
  let abs = -1;
  let span = 0;
  for (const pc of validPcs) {
    let o = 0;
    while (o * 12 + pc <= abs && o < 2) o++;
    abs = o * 12 + pc;
    span = abs;
  }
  const maxStartOctave = span <= 11 ? 1 : 0; // 11 because 12+span must be ≤ 23
  const startOctave = (seedNum % 2) > maxStartOctave ? maxStartOctave : (seedNum % 2);

  const positions = [];
  let prevAbs = -1;
  validPcs.forEach((pc, i) => {
    let oct = i === 0 ? startOctave : 0;
    while (oct * 12 + pc <= prevAbs && oct < 2) oct++;
    if (oct >= 2) oct = 1;
    positions.push({ pc, octave: oct });
    prevAbs = oct * 12 + pc;
  });
  return positions;
};

// 2 octaves visible (24 semitones) starting at C.
// Pitch-class only (octave-agnostic). Selecting any C selects "C".
//
// Mode = 'input' | 'display'. In display mode the keys are non-interactive.

const WHITE_KEYS = [
  // semitone offset from C, white-key index 0..6 within an octave
  { pc: 0, idx: 0, label: 'C' },
  { pc: 2, idx: 1, label: 'D' },
  { pc: 4, idx: 2, label: 'E' },
  { pc: 5, idx: 3, label: 'F' },
  { pc: 7, idx: 4, label: 'G' },
  { pc: 9, idx: 5, label: 'A' },
  { pc: 11, idx: 6, label: 'B' },
];
// Black keys: pitch class + which two adjacent white keys it sits between
const BLACK_KEYS = [
  { pc: 1,  afterIdx: 0 }, // C#
  { pc: 3,  afterIdx: 1 }, // D#
  { pc: 6,  afterIdx: 3 }, // F#
  { pc: 8,  afterIdx: 4 }, // G#
  { pc: 10, afterIdx: 5 }, // A#
];

const OCTAVES = 2;
const W = 700;
const H = 220;
const WHITE_W = W / (7 * OCTAVES);
const BLACK_W = WHITE_W * 0.6;
const BLACK_H = H * 0.62;

export default function PianoInput({
  mode = 'input',
  value = [],
  onChange,
  maxNotes = 6,
  chordSeed,
}) {
  // Input mode tracks exact (pc, octave) positions internally so a tap on a
  // specific C lights only THAT C, not the C an octave away. The parent only
  // ever sees pitch-class strings, derived from positions in emitPositions.
  const [positions, setPositions] = useState([]); // {pc, octave}[]

  // Reset internal positions when the parent clears `value`.
  useEffect(() => {
    if (mode === 'input' && value.length === 0 && positions.length > 0) {
      setPositions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value.length]);

  // Display mode: pick one (octave, pc) per note so notes don't repeat across octaves.
  const displayPositions = useMemo(
    () => mode === 'display' ? placeChordOnPiano(value, chordSeed) : [],
    [mode, value, chordSeed]
  );

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

  const handleKeyTap = (pc, octave) => {
    if (mode !== 'input' || !onChange) return;
    const idx = positionAt(pc, octave);
    if (idx !== -1) {
      // Toggle off this exact key.
      emitPositions(positions.filter((_, i) => i !== idx));
      return;
    }
    if (positions.length >= maxNotes) {
      // At capacity — drop the oldest position to make room.
      emitPositions([...positions.slice(1), { pc, octave }]);
      return;
    }
    emitPositions([...positions, { pc, octave }]);
  };

  return (
    <div className="piano-wrapper">
      <svg
        className="piano-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'manipulation' }}
      >
        {/* White keys */}
        {Array.from({ length: OCTAVES }, (_, oct) =>
          WHITE_KEYS.map((k) => {
            const x = (oct * 7 + k.idx) * WHITE_W;
            const isOn = isKeyLit(k.pc, oct);
            const color = colorForKey(k.pc, oct);
            return (
              <g
                key={`w-${oct}-${k.idx}`}
                style={{ cursor: mode === 'input' ? 'pointer' : 'default' }}
                onClick={() => handleKeyTap(k.pc, oct)}
              >
                <rect
                  x={x}
                  y={0}
                  width={WHITE_W}
                  height={H}
                  fill={isOn ? color : '#fafafa'}
                  stroke="#1a1410"
                  strokeWidth="1"
                />
              </g>
            );
          })
        )}
        {/* Black keys (drawn on top) */}
        {Array.from({ length: OCTAVES }, (_, oct) =>
          BLACK_KEYS.map((b) => {
            const xCenter = (oct * 7 + b.afterIdx + 1) * WHITE_W;
            const x = xCenter - BLACK_W / 2;
            const isOn = isKeyLit(b.pc, oct);
            const color = colorForKey(b.pc, oct);
            return (
              <rect
                key={`b-${oct}-${b.pc}`}
                x={x}
                y={0}
                width={BLACK_W}
                height={BLACK_H}
                fill={isOn ? color : '#1a1410'}
                stroke="#1a1410"
                strokeWidth="1"
                style={{ cursor: mode === 'input' ? 'pointer' : 'default' }}
                onClick={() => handleKeyTap(b.pc, oct)}
              />
            );
          })
        )}
      </svg>
      {mode === 'input' && (
        <div className="piano-hint">Tap a key to add · tap again to remove</div>
      )}
    </div>
  );
}
