import React, { useState, useEffect, useMemo, useRef } from 'react';
import { noteToPc, pcToNote } from '../data/pitchClass';
import { cyrb53 } from '../utils/seededRandom';

// Per-position dot palette. Cycled through as the user places notes.
const DOT_COLORS = [
  '#8b2c20', // accent red
  '#a88734', // gold
  '#2f6d4f', // green
  '#3a5c8b', // blue
  '#6b4d8b', // purple
  '#3d342b', // ink-soft (neutral fallback)
];

// Standard tuning (low to high): E A D G B E. Pitch classes:
//   E=4  A=9  D=2  G=7  B=11  E=4
// Drawn high-to-low top-to-bottom: top row is high e, bottom row is low E.
const TUNING_PC = [4, 9, 2, 7, 11, 4];
const STRING_LABELS_TOP_DOWN = ['e', 'B', 'G', 'D', 'A', 'E'];
const TUNING_TOP_DOWN = [...TUNING_PC].reverse();

const FRETS = 15;
const FRET_W = 60;
const NUT_X = 48;
const FRET_AREA_W = FRETS * FRET_W;
const W = NUT_X + FRET_AREA_W + 20;
const H = 280;
const TOP_Y = 24;
const BOTTOM_PAD = 36; // room for fret-number labels under the board
const STRING_GAP = (H - TOP_Y - BOTTOM_PAD) / (TUNING_TOP_DOWN.length - 1);
const FRETBOARD_BOTTOM = H - BOTTOM_PAD;

const fretPc = (stringIdx, fret) =>
  ((TUNING_TOP_DOWN[stringIdx] + fret) % 12 + 12) % 12;

const xForFret = (fret) => NUT_X + (fret - 0.5) * FRET_W;
// Open-string indicator dot above the nut
const openX = NUT_X / 2 + 2;

// For display mode: pick one (string, fret) per note, varying placement on the
// neck so different chords appear in different spots. Uses cyrb53(seed) to
// pick a "centre fret"; greedy nearest-neighbour assignment per string.
const placeChordOnNeck = (notes, seed) => {
  const seedNum = cyrb53(String(seed || ''));
  const centreFret = seedNum % 13; // 0..12
  const usedStrings = new Set();
  const positions = [];
  for (const note of notes) {
    const pc = noteToPc(note);
    if (pc < 0) continue;
    const candidates = [];
    for (let s = 0; s < 6; s++) {
      if (usedStrings.has(s)) continue;
      for (let f = 0; f <= FRETS; f++) {
        if (fretPc(s, f) === pc) {
          candidates.push({ stringIdx: s, fret: f, dist: Math.abs(f - centreFret) });
        }
      }
    }
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => a.dist - b.dist);
    const chosen = candidates[0];
    positions.push({ stringIdx: chosen.stringIdx, fret: chosen.fret });
    usedStrings.add(chosen.stringIdx);
  }
  return positions;
};

export default function GuitarInput({
  mode = 'input',
  value = [],
  onChange,
  maxNotes = 6,
  chordSeed,
}) {
  // For input mode, track each placed dot at its specific (string, fret) position
  // so two same-pitch frets aren't both auto-lit. The pitch-class array fed to
  // the parent is derived from these positions.
  const [positions, setPositions] = useState([]); // {stringIdx, fret}[]

  // Reset internal positions when the parent clears `value` (new card / clear).
  useEffect(() => {
    if (mode === 'input' && value.length === 0 && positions.length > 0) {
      setPositions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value.length]);

  // For display mode, place exactly one dot per note, varied by chord seed.
  const displayPositions = useMemo(
    () => mode === 'display' ? placeChordOnNeck(value, chordSeed) : [],
    [mode, value, chordSeed]
  );

  // Auto-scroll the fretboard so the placed chord centres in view
  const scrollRef = useRef(null);
  useEffect(() => {
    if (mode !== 'display' || !scrollRef.current || displayPositions.length === 0) return;
    const xs = displayPositions.map((p) => p.fret === 0 ? openX : xForFret(p.fret));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const centreX = (minX + maxX) / 2;
    const containerW = scrollRef.current.clientWidth;
    scrollRef.current.scrollLeft = Math.max(0, centreX - containerW / 2);
  }, [mode, displayPositions]);

  const positionAt = (stringIdx, fret) => {
    const pool = mode === 'input' ? positions : displayPositions;
    return pool.findIndex((p) => p.stringIdx === stringIdx && p.fret === fret);
  };

  const isPositionLit = (stringIdx, fret) => positionAt(stringIdx, fret) !== -1;

  const colorForPosition = (stringIdx, fret) => {
    const idx = positionAt(stringIdx, fret);
    if (idx < 0) return 'var(--accent)';
    return DOT_COLORS[idx % DOT_COLORS.length];
  };

  const emitPositions = (next) => {
    setPositions(next);
    if (onChange) {
      onChange(next.map((p) => pcToNote(fretPc(p.stringIdx, p.fret))));
    }
  };

  const handleTap = (stringIdx, fret) => {
    if (mode !== 'input' || !onChange) return;
    const idx = positionAt(stringIdx, fret);
    if (idx !== -1) {
      // Toggle off this exact position
      emitPositions(positions.filter((_, i) => i !== idx));
      return;
    }
    if (positions.length >= maxNotes) {
      // At capacity — drop the oldest position to make room
      emitPositions([...positions.slice(1), { stringIdx, fret }]);
      return;
    }
    emitPositions([...positions, { stringIdx, fret }]);
  };

  return (
    <div className="guitar-wrapper">
      <div className="guitar-scroll" ref={scrollRef}>
      <svg
        className="guitar-svg"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'pan-x' }}
      >
        {/* Background fingerboard */}
        <rect x={NUT_X} y={TOP_Y - 4} width={FRET_AREA_W} height={FRETBOARD_BOTTOM - TOP_Y + 8} fill="#3d2817" />
        {/* Nut (thick line at fret 0) */}
        <rect x={NUT_X - 4} y={TOP_Y - 4} width={4} height={FRETBOARD_BOTTOM - TOP_Y + 8} fill="#1a1410" />
        {/* Frets */}
        {Array.from({ length: FRETS }, (_, i) => i + 1).map((f) => (
          <line
            key={`f-${f}`}
            x1={NUT_X + f * FRET_W}
            y1={TOP_Y - 4}
            x2={NUT_X + f * FRET_W}
            y2={FRETBOARD_BOTTOM + 4}
            stroke="#a08060"
            strokeWidth={f <= 5 ? 1.5 : 1}
          />
        ))}
        {/* Inlay dots at 3, 5, 7, 9, 15 — double at 12 */}
        {(() => {
          const midY = (TOP_Y + FRETBOARD_BOTTOM) / 2;
          return (
            <>
              {[3, 5, 7, 9, 15].map((f) => f <= FRETS && (
                <circle key={`inlay-${f}`} cx={xForFret(f)} cy={midY} r={5} fill="#d9cbad" opacity="0.6" />
              ))}
              {12 <= FRETS && (
                <>
                  <circle cx={xForFret(12)} cy={midY - STRING_GAP} r={5} fill="#d9cbad" opacity="0.6" />
                  <circle cx={xForFret(12)} cy={midY + STRING_GAP} r={5} fill="#d9cbad" opacity="0.6" />
                </>
              )}
            </>
          );
        })()}

        {/* Strings — bottom (low E) thickest, top (high e) thinnest */}
        {TUNING_TOP_DOWN.map((_, sIdx) => (
          <line
            key={`s-${sIdx}`}
            x1={NUT_X - 10}
            y1={TOP_Y + sIdx * STRING_GAP}
            x2={W - 10}
            y2={TOP_Y + sIdx * STRING_GAP}
            stroke="#f4ecdc"
            strokeWidth={1.4 + sIdx * 0.45}
          />
        ))}

        {/* Fret number labels under the board */}
        {Array.from({ length: FRETS + 1 }, (_, f) => f).map((f) => (
          <text
            key={`fl-${f}`}
            x={f === 0 ? (NUT_X - 4) / 2 : xForFret(f)}
            y={FRETBOARD_BOTTOM + 22}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="13"
            fill="#3d342b"
            pointerEvents="none"
          >
            {f}
          </text>
        ))}

        {/* Open-string tap zones + indicators with centred string label */}
        {TUNING_TOP_DOWN.map((_, sIdx) => {
          const isOn = isPositionLit(sIdx, 0);
          const color = colorForPosition(sIdx, 0);
          const cx = openX;
          const cy = TOP_Y + sIdx * STRING_GAP;
          const label = STRING_LABELS_TOP_DOWN[sIdx];
          return (
            <g
              key={`open-${sIdx}`}
              style={{ cursor: mode === 'input' ? 'pointer' : 'default' }}
              onClick={() => handleTap(sIdx, 0)}
            >
              <rect x={0} y={cy - STRING_GAP / 2} width={NUT_X - 4} height={STRING_GAP} fill="transparent" />
              <circle
                cx={cx}
                cy={cy}
                r={11}
                fill={isOn ? color : 'var(--paper)'}
                stroke={isOn ? color : '#3d342b'}
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="11"
                fontWeight="600"
                fill={isOn ? '#f4ecdc' : '#3d342b'}
                pointerEvents="none"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Fret tap zones + dots */}
        {TUNING_TOP_DOWN.map((_, sIdx) =>
          Array.from({ length: FRETS }, (_, f) => f + 1).map((fret) => {
            const isOn = isPositionLit(sIdx, fret);
            const color = colorForPosition(sIdx, fret);
            const cx = xForFret(fret);
            const cy = TOP_Y + sIdx * STRING_GAP;
            return (
              <g
                key={`fret-${sIdx}-${fret}`}
                style={{ cursor: mode === 'input' ? 'pointer' : 'default' }}
                onClick={() => handleTap(sIdx, fret)}
              >
                <rect
                  x={NUT_X + (fret - 1) * FRET_W}
                  y={cy - STRING_GAP / 2}
                  width={FRET_W}
                  height={STRING_GAP}
                  fill="transparent"
                />
                {isOn && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={11}
                    fill={color}
                    stroke="#1a1410"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })
        )}
      </svg>
      </div>
      {mode === 'input' && (
        <div className="guitar-hint">Scroll the neck horizontally · tap any fret with the right note · open strings tap left of the nut</div>
      )}
    </div>
  );
}
