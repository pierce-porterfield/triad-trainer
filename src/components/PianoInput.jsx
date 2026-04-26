import React from 'react';
import { noteToPc, pcToNote } from '../data/pitchClass';

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
}) {
  const selectedPcs = new Set(
    value.map(noteToPc).filter((pc) => pc >= 0)
  );

  const handlePcTap = (pc) => {
    if (mode !== 'input' || !onChange) return;
    if (selectedPcs.has(pc)) {
      onChange(value.filter((n) => noteToPc(n) !== pc));
      return;
    }
    if (value.length >= maxNotes) {
      // At capacity — drop the oldest to make room.
      onChange([...value.slice(1), pcToNote(pc)]);
      return;
    }
    onChange([...value, pcToNote(pc)]);
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
            const isOn = selectedPcs.has(k.pc);
            return (
              <g
                key={`w-${oct}-${k.idx}`}
                style={{ cursor: mode === 'input' ? 'pointer' : 'default' }}
                onClick={() => handlePcTap(k.pc)}
              >
                <rect
                  x={x}
                  y={0}
                  width={WHITE_W}
                  height={H}
                  fill={isOn ? 'var(--accent)' : '#fafafa'}
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
            const isOn = selectedPcs.has(b.pc);
            return (
              <rect
                key={`b-${oct}-${b.pc}`}
                x={x}
                y={0}
                width={BLACK_W}
                height={BLACK_H}
                fill={isOn ? 'var(--accent)' : '#1a1410'}
                stroke="#1a1410"
                strokeWidth="1"
                style={{ cursor: mode === 'input' ? 'pointer' : 'default' }}
                onClick={() => handlePcTap(b.pc)}
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
