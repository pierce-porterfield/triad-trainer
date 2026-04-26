import React from 'react';
import { noteToPc, pcToNote } from '../data/pitchClass';

// Standard tuning (low to high): E A D G B E. Pitch classes:
//   E=4  A=9  D=2  G=7  B=11  E=4
// Each string row's pitch class at fret 0 (open string).
const TUNING_PC = [4, 9, 2, 7, 11, 4];
// String labels for display. Drawn from low (bottom) to high (top) — but we
// render top-to-bottom matching the player's eye view (high E at top).
const STRING_LABELS_TOP_DOWN = ['e', 'B', 'G', 'D', 'A', 'E'];
const TUNING_TOP_DOWN = [...TUNING_PC].reverse();

const FRETS = 15;
const FRET_W = 60;
const NUT_X = 44;
const FRET_AREA_W = FRETS * FRET_W;
const W = NUT_X + FRET_AREA_W + 16;
const H = 240;
const STRING_GAP = (H - 30) / (TUNING_TOP_DOWN.length - 1);
const TOP_Y = 16;

const fretPc = (stringIdx, fret) =>
  ((TUNING_TOP_DOWN[stringIdx] + fret) % 12 + 12) % 12;

const xForFret = (fret) => NUT_X + (fret - 0.5) * FRET_W;
// Open-string indicator dot above the nut
const openX = NUT_X / 2 + 2;

export default function GuitarInput({
  mode = 'input',
  value = [],
  onChange,
  maxNotes = 6,
}) {
  const selectedPcs = new Set(
    value.map(noteToPc).filter((pc) => pc >= 0)
  );

  const handleTap = (stringIdx, fret) => {
    if (mode !== 'input' || !onChange) return;
    const pc = fretPc(stringIdx, fret);
    if (selectedPcs.has(pc)) {
      onChange(value.filter((n) => noteToPc(n) !== pc));
      return;
    }
    if (value.length >= maxNotes) {
      onChange([...value.slice(1), pcToNote(pc)]);
      return;
    }
    onChange([...value, pcToNote(pc)]);
  };

  return (
    <div className="guitar-wrapper">
      <div className="guitar-scroll">
      <svg
        className="guitar-svg"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'pan-x' }}
      >
        {/* Background fingerboard */}
        <rect x={NUT_X} y={TOP_Y - 2} width={FRET_AREA_W} height={H - 2 * TOP_Y + 4} fill="#3d2817" />
        {/* Nut (thick line at fret 0) */}
        <rect x={NUT_X - 4} y={TOP_Y - 2} width={4} height={H - 2 * TOP_Y + 4} fill="#1a1410" />
        {/* Frets */}
        {Array.from({ length: FRETS }, (_, i) => i + 1).map((f) => (
          <line
            key={`f-${f}`}
            x1={NUT_X + f * FRET_W}
            y1={TOP_Y - 2}
            x2={NUT_X + f * FRET_W}
            y2={H - TOP_Y + 2}
            stroke="#a08060"
            strokeWidth={f <= 5 ? 1.5 : 1}
          />
        ))}
        {/* Inlay dots at 3, 5, 7, 9, 15 — double at 12 */}
        {[3, 5, 7, 9, 15].map((f) => f <= FRETS && (
          <circle key={`inlay-${f}`} cx={xForFret(f)} cy={H / 2} r={5} fill="#d9cbad" opacity="0.6" />
        ))}
        {12 <= FRETS && (
          <>
            <circle cx={xForFret(12)} cy={H / 2 - STRING_GAP} r={5} fill="#d9cbad" opacity="0.6" />
            <circle cx={xForFret(12)} cy={H / 2 + STRING_GAP} r={5} fill="#d9cbad" opacity="0.6" />
          </>
        )}

        {/* Strings */}
        {TUNING_TOP_DOWN.map((_, sIdx) => (
          <line
            key={`s-${sIdx}`}
            x1={NUT_X - 8}
            y1={TOP_Y + sIdx * STRING_GAP}
            x2={W - 8}
            y2={TOP_Y + sIdx * STRING_GAP}
            stroke="#f4ecdc"
            strokeWidth={1 + (5 - sIdx) * 0.25}
          />
        ))}

        {/* String labels (left of nut) */}
        {STRING_LABELS_TOP_DOWN.map((label, sIdx) => (
          <text
            key={`sl-${sIdx}`}
            x={NUT_X - 14}
            y={TOP_Y + sIdx * STRING_GAP + 4}
            textAnchor="end"
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            fill="#3d342b"
            pointerEvents="none"
          >
            {label}
          </text>
        ))}

        {/* Open-string tap zones + indicators */}
        {TUNING_TOP_DOWN.map((_, sIdx) => {
          const pc = fretPc(sIdx, 0);
          const isOn = selectedPcs.has(pc);
          const cx = openX;
          const cy = TOP_Y + sIdx * STRING_GAP;
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
                r={6}
                fill={isOn ? 'var(--accent)' : 'transparent'}
                stroke={isOn ? 'var(--accent)' : '#3d342b'}
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* Fret tap zones + dots */}
        {TUNING_TOP_DOWN.map((_, sIdx) =>
          Array.from({ length: FRETS }, (_, f) => f + 1).map((fret) => {
            const pc = fretPc(sIdx, fret);
            const isOn = selectedPcs.has(pc);
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
                    r={9}
                    fill="var(--accent)"
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
