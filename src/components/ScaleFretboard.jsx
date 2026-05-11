import React from 'react';

// One scale diagram on a 6-string guitar fretboard. Notes inside the
// current position window are highlighted with a scale-degree colour
// and labelled with their degree (1, 2, ♭3, 5, etc.). Position windows
// shift up and down the neck as the user cycles through positions.

const TUNING_PC_TOP_DOWN = [4, 11, 7, 2, 9, 4]; // high e, B, G, D, A, low E
const FRETS = 15;
const FRET_W = 38;
const NUT_X = 32;
const FRET_AREA_W = FRETS * FRET_W;
const W = NUT_X + FRET_AREA_W + 14;
const TOP_Y = 16;
const BOTTOM_PAD = 22;
const STRING_GAP = 22;
const H = TOP_Y + STRING_GAP * 5 + BOTTOM_PAD;
const FRETBOARD_BOTTOM = H - BOTTOM_PAD;

// Seven distinct, vintage-friendly colours for the seven scale degrees.
// Root is the accent red so it's instantly visible; the rest walk through
// the colour wheel.
export const DEGREE_COLORS = [
  '#8b2c20', // 1 — root, deep red
  '#b86a2b', // 2 — burnt orange
  '#a88734', // 3 — gold
  '#4a6b54', // 4 — forest green
  '#3a5c8b', // 5 — ocean blue
  '#5e3a6b', // 6 — plum
  '#846a92', // 7 — violet
];

const xForFret = (fret) => NUT_X + (fret - 0.5) * FRET_W;
const openX = NUT_X / 2 - 2;
const yForString = (stringIdx) => TOP_Y + stringIdx * STRING_GAP;

const fretPc = (stringIdx, fret) =>
  ((TUNING_PC_TOP_DOWN[stringIdx] + fret) % 12 + 12) % 12;

// Five CAGED-style positions per root, anchored to the fret where the
// root appears on each string (low E, A, D, G, B). Each position spans
// roughly 4-5 frets including the root location.
export const positionsForRoot = (rootPc) => {
  const anchors = [];
  const seen = new Set();
  for (let s = 5; s >= 0; s--) {
    const stringPc = TUNING_PC_TOP_DOWN[s];
    const fret = ((rootPc - stringPc) % 12 + 12) % 12;
    if (seen.has(fret)) continue;
    seen.add(fret);
    anchors.push({ stringIdx: s, rootFret: fret });
  }
  anchors.sort((a, b) => a.rootFret - b.rootFret);
  return anchors.map((a) => ({
    ...a,
    startFret: Math.max(0, a.rootFret - 1),
    endFret: Math.min(FRETS, a.rootFret + 4),
  }));
};

export default function ScaleFretboard({
  rootPc,
  scaleNotes,    // array of pitch classes 0..11
  degreeLabels,  // matching array of degree labels e.g. ['1','2','♭3',...]
  startFret,
  endFret,
}) {
  // Walk every (string, fret) inside the window and emit a dot for any
  // pitch class that's part of the scale. The dot's colour and label
  // come from the scale-degree index of that pitch class.
  const dots = [];
  for (let s = 0; s < 6; s++) {
    for (let f = startFret; f <= Math.min(FRETS, endFret); f++) {
      const pc = fretPc(s, f);
      const degreeIdx = scaleNotes.indexOf(pc);
      if (degreeIdx < 0) continue;
      dots.push({ stringIdx: s, fret: f, degreeIdx });
    }
  }
  // Also include open-string notes when fret 0 falls inside the window.
  // (Already covered above since the loop includes f=0 when startFret<=0.)

  return (
    <svg
      className="scale-fb"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Fretboard wood backing */}
      <rect
        x={NUT_X - 2}
        y={TOP_Y - 4}
        width={FRET_AREA_W + 6}
        height={FRETBOARD_BOTTOM - TOP_Y + 8}
        fill="#3d2a1c"
      />

      {/* Highlight the active position window */}
      {startFret <= FRETS && (
        <rect
          x={startFret === 0 ? 0 : NUT_X + (startFret - 1) * FRET_W}
          y={TOP_Y - 4}
          width={
            startFret === 0
              ? NUT_X + endFret * FRET_W
              : (endFret - startFret + 1) * FRET_W
          }
          height={FRETBOARD_BOTTOM - TOP_Y + 8}
          fill="#a88734"
          opacity={0.08}
        />
      )}

      {/* Frets */}
      {Array.from({ length: FRETS + 1 }, (_, i) => i).map((f) => (
        <line
          key={`fret-${f}`}
          x1={NUT_X + f * FRET_W}
          x2={NUT_X + f * FRET_W}
          y1={TOP_Y - 4}
          y2={FRETBOARD_BOTTOM + 4}
          stroke="#d9cbad"
          strokeWidth={f === 0 ? 4 : 0.6}
          opacity={f === 0 ? 1 : 0.6}
        />
      ))}

      {/* Inlay dots at 3, 5, 7, 9, 15 (single) and 12 (double) */}
      {[3, 5, 7, 9, 15].map((f) => (
        <circle
          key={`inlay-${f}`}
          cx={xForFret(f)}
          cy={(yForString(2) + yForString(3)) / 2}
          r={3.5}
          fill="#d9cbad"
          opacity={0.5}
        />
      ))}
      <circle cx={xForFret(12)} cy={yForString(1) + STRING_GAP / 2} r={3.5} fill="#d9cbad" opacity={0.5} />
      <circle cx={xForFret(12)} cy={yForString(3) + STRING_GAP / 2} r={3.5} fill="#d9cbad" opacity={0.5} />

      {/* Strings */}
      {[0, 1, 2, 3, 4, 5].map((s) => (
        <line
          key={`str-${s}`}
          x1={NUT_X - 8}
          x2={W}
          y1={yForString(s)}
          y2={yForString(s)}
          stroke="#f4ecdc"
          strokeWidth={s < 3 ? 0.9 : 1.4}
          opacity={0.85}
        />
      ))}

      {/* Fret number labels */}
      {Array.from({ length: FRETS }, (_, i) => i + 1).map((f) => (
        <text
          key={`flbl-${f}`}
          x={xForFret(f)}
          y={FRETBOARD_BOTTOM + 14}
          textAnchor="middle"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          fill="#3d342b"
          opacity={f >= startFret && f <= endFret ? 1 : 0.4}
        >
          {f}
        </text>
      ))}

      {/* Note dots */}
      {dots.map(({ stringIdx, fret, degreeIdx }) => {
        const x = fret === 0 ? openX : xForFret(fret);
        const y = yForString(stringIdx);
        const color = DEGREE_COLORS[degreeIdx];
        const label = degreeLabels[degreeIdx];
        const isRoot = degreeIdx === 0;
        return (
          <g key={`dot-${stringIdx}-${fret}`}>
            <circle
              cx={x}
              cy={y}
              r={isRoot ? 11 : 10}
              fill={color}
              stroke="#1a1410"
              strokeWidth={isRoot ? 1.4 : 0.8}
            />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize={label.length > 1 ? 8 : 10}
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
              fill="#f4ecdc"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
