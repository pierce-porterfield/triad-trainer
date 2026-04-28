// Curated guitar chord fingerings — used by the "name the chord" cards
// when the prompt is shown on a fretboard, so the displayed voicing is
// something a guitarist would actually play (instead of the abstract
// nearest-note algorithmic placement we used before).
//
// Two layers:
//   1. Movable SHAPES (E-shape, A-shape major/minor/maj7/dom7/min7) —
//      barre patterns that translate to any root by sliding up the neck.
//   2. OPEN_FINGERINGS — specific open-position voicings (C, D, G, etc.)
//      that don't fit any movable shape.
//
// The lookup function returns ALL valid curated fingerings for a chord;
// pickFingering deterministically picks one by hashing a seed (the chord
// name, normally) so the same prompt always shows the same voicing.
//
// Chord types not covered here (m7♭5, dim, aug, 6ths, 9ths, 11ths, 13ths,
// add chords) return null — caller falls back to algorithmic placement.

import { noteToPc } from './pitchClass';
import { cyrb53 } from '../utils/seededRandom';

// String tuning, top-down (idx 0 = high e, idx 5 = low E).
//   high e: 4    A: 9
//   B:     11    E: 4 (low)
//   G:      7
//   D:      2
const TUNING_PC = [4, 11, 7, 2, 9, 4];

// Lowest fret on `stringIdx` where pitch class `targetPc` lives (0..11).
const fretForPcOnString = (targetPc, stringIdx) =>
  ((targetPc - TUNING_PC[stringIdx]) % 12 + 12) % 12;

// MOVABLE SHAPES. Each pattern entry is { stringIdx, offset } where the
// realised fret = rootFret + offset. Strings not listed are simply not
// played in the voicing (no dot rendered = effectively muted).
const SHAPES = [
  // Major E-shape — root on the 6th (low E) string. Open E = 022100.
  {
    id: 'major-E', quality: 'maj', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 }, // root
      { stringIdx: 4, offset: 2 }, // 5
      { stringIdx: 3, offset: 2 }, // root (oct)
      { stringIdx: 2, offset: 1 }, // 3
      { stringIdx: 1, offset: 0 }, // 5 (oct)
      { stringIdx: 0, offset: 0 }, // root (2-oct)
    ],
  },
  // Major A-shape — root on the 5th (A) string. Open A = x02220.
  {
    id: 'major-A', quality: 'maj', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 }, // root
      { stringIdx: 3, offset: 2 }, // 5
      { stringIdx: 2, offset: 2 }, // root (oct)
      { stringIdx: 1, offset: 2 }, // 3
      { stringIdx: 0, offset: 0 }, // 5 (oct)
    ],
  },
  // Minor E-shape. Open Em = 022000.
  {
    id: 'minor-E', quality: 'min', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 0 }, // ♭3 (open against barre)
      { stringIdx: 1, offset: 0 },
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Minor A-shape. Open Am = x02210.
  {
    id: 'minor-A', quality: 'min', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 2 },
      { stringIdx: 1, offset: 1 }, // ♭3
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Dominant 7 E-shape. Open E7 = 020100.
  {
    id: 'dom7-E', quality: 'dom7', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 },
      { stringIdx: 3, offset: 0 }, // ♭7 (open against barre)
      { stringIdx: 2, offset: 1 },
      { stringIdx: 1, offset: 0 },
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Dominant 7 A-shape. Open A7 = x02020.
  {
    id: 'dom7-A', quality: 'dom7', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 0 }, // ♭7
      { stringIdx: 1, offset: 2 },
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Major 7 E-shape. Open Emaj7 = 021100.
  {
    id: 'maj7-E', quality: 'maj7', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 },
      { stringIdx: 3, offset: 1 }, // major 7
      { stringIdx: 2, offset: 1 },
      { stringIdx: 1, offset: 0 },
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Major 7 A-shape. Open Amaj7 = x02120.
  {
    id: 'maj7-A', quality: 'maj7', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 1 }, // major 7
      { stringIdx: 1, offset: 2 },
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Minor 7 E-shape. Open Em7 = 020000.
  {
    id: 'min7-E', quality: 'min7', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 },
      { stringIdx: 3, offset: 0 }, // ♭7
      { stringIdx: 2, offset: 0 }, // ♭3
      { stringIdx: 1, offset: 0 },
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Minor 7 A-shape. Open Am7 = x02010.
  {
    id: 'min7-A', quality: 'min7', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 0 }, // ♭7
      { stringIdx: 1, offset: 1 }, // ♭3
      { stringIdx: 0, offset: 0 },
    ],
  },
];

// SPECIFIC OPEN CHORDS — voicings that aren't a barre-shape applied at
// fret 0 (those are already covered by the shapes above). Keyed by
// `${root}-${qualityKey}`.
const OPEN_FINGERINGS = {
  // C major — x32010
  'C-maj': [
    { stringIdx: 4, fret: 3 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 1 },
    { stringIdx: 0, fret: 0 },
  ],
  // D major — xx0232
  'D-maj': [
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 2 },
    { stringIdx: 1, fret: 3 },
    { stringIdx: 0, fret: 2 },
  ],
  // G major — 320003 (ring on high e)
  'G-maj': [
    { stringIdx: 5, fret: 3 },
    { stringIdx: 4, fret: 2 },
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 3 },
  ],
  // D minor — xx0231
  'D-min': [
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 2 },
    { stringIdx: 1, fret: 3 },
    { stringIdx: 0, fret: 1 },
  ],
  // C major 7 — x32000
  'C-maj7': [
    { stringIdx: 4, fret: 3 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 0 },
  ],
  // D major 7 — xx0222
  'D-maj7': [
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 2 },
    { stringIdx: 1, fret: 2 },
    { stringIdx: 0, fret: 2 },
  ],
  // G major 7 — 320002
  'G-maj7': [
    { stringIdx: 5, fret: 3 },
    { stringIdx: 4, fret: 2 },
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 2 },
  ],
  // C7 — x32310
  'C-dom7': [
    { stringIdx: 4, fret: 3 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 3 },
    { stringIdx: 1, fret: 1 },
    { stringIdx: 0, fret: 0 },
  ],
  // D7 — xx0212
  'D-dom7': [
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 2 },
    { stringIdx: 1, fret: 1 },
    { stringIdx: 0, fret: 2 },
  ],
  // G7 — 320001
  'G-dom7': [
    { stringIdx: 5, fret: 3 },
    { stringIdx: 4, fret: 2 },
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 1 },
  ],
  // B7 — x21202
  'B-dom7': [
    { stringIdx: 4, fret: 2 },
    { stringIdx: 3, fret: 1 },
    { stringIdx: 2, fret: 2 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 2 },
  ],
  // Dm7 — xx0211
  'D-min7': [
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 2 },
    { stringIdx: 1, fret: 1 },
    { stringIdx: 0, fret: 1 },
  ],
};

const realiseShape = (shape, rootFret) =>
  shape.pattern
    .map((p) => ({ stringIdx: p.stringIdx, fret: rootFret + p.offset }))
    .filter((p) => p.fret >= 0 && p.fret <= 15);

// All curated fingerings for `(root, qualityKey)`. Empty if uncurated.
export const getCuratedFingerings = (qualityKey, root) => {
  const out = [];
  const openKey = `${root}-${qualityKey}`;
  if (OPEN_FINGERINGS[openKey]) out.push(OPEN_FINGERINGS[openKey]);
  const rootPc = noteToPc(root);
  if (rootPc >= 0) {
    for (const shape of SHAPES) {
      if (shape.quality !== qualityKey) continue;
      const rootFret = fretForPcOnString(rootPc, shape.rootStringIdx);
      out.push(realiseShape(shape, rootFret));
    }
  }
  return out;
};

// Pick a deterministic fingering. Returns null when nothing curated for
// this chord — caller should fall back to algorithmic placement.
export const pickFingering = (qualityKey, root, seed) => {
  const fingerings = getCuratedFingerings(qualityKey, root);
  if (fingerings.length === 0) return null;
  const seedNum = cyrb53(String(seed || ''));
  return fingerings[seedNum % fingerings.length];
};
