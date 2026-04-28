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

  // === 6th chords ===
  // Major 6 E-shape. Open E6 = 022120 → 1, 5, 1, 3, 6, 1.
  {
    id: 'maj6-E', quality: 'maj6', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 }, // root
      { stringIdx: 4, offset: 2 }, // 5
      { stringIdx: 3, offset: 2 }, // root oct
      { stringIdx: 2, offset: 1 }, // 3
      { stringIdx: 1, offset: 2 }, // 6
      { stringIdx: 0, offset: 0 }, // root 2-oct
    ],
  },
  // Major 6 A-shape. Open A6 = x02222 → 1, 5, 1, 3, 6.
  {
    id: 'maj6-A', quality: 'maj6', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 }, // root
      { stringIdx: 3, offset: 2 }, // 5
      { stringIdx: 2, offset: 2 }, // root oct
      { stringIdx: 1, offset: 2 }, // 3
      { stringIdx: 0, offset: 2 }, // 6
    ],
  },
  // Minor 6 E-shape. Open Em6 = 022020 → 1, 5, 1, ♭3, 6, 1.
  {
    id: 'min6-E', quality: 'min6', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 0 }, // ♭3 (open against barre)
      { stringIdx: 1, offset: 2 }, // 6
      { stringIdx: 0, offset: 0 },
    ],
  },
  // Minor 6 A-shape. Open Am6 = x02212 → 1, 5, 1, ♭3, 6.
  {
    id: 'min6-A', quality: 'min6', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 2 },
      { stringIdx: 1, offset: 1 }, // ♭3
      { stringIdx: 0, offset: 2 }, // 6
    ],
  },

  // === 9th chords ===
  // Dominant 9 E-shape. Open E9 = 022132 → 1, 5, 1, 3, ♭7, 9.
  {
    id: 'dom9-E', quality: 'dom9', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 },
      { stringIdx: 3, offset: 2 },
      { stringIdx: 2, offset: 1 }, // 3
      { stringIdx: 1, offset: 3 }, // ♭7
      { stringIdx: 0, offset: 2 }, // 9
    ],
  },
  // Dominant 9 A-shape. Open A9 = x02423 → 1, 5, 9, 3, ♭7.
  {
    id: 'dom9-A', quality: 'dom9', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 }, // 5
      { stringIdx: 2, offset: 4 }, // 9
      { stringIdx: 1, offset: 2 }, // 3
      { stringIdx: 0, offset: 3 }, // ♭7
    ],
  },
  // Major 9 E-shape with B muted. Open Emaj9 ≈ 02112x + e=2 → 1, 5, 7, 3, 9.
  {
    id: 'maj9-E', quality: 'maj9', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 4, offset: 2 }, // 5
      { stringIdx: 3, offset: 1 }, // 7 (raised from ♭7)
      { stringIdx: 2, offset: 1 }, // 3
      // B string skipped (would otherwise be the 6 = wrong note)
      { stringIdx: 0, offset: 2 }, // 9
    ],
  },
  // Major 9 A-shape — drop-3 voicing. Cmaj9 = x35433 → 1, 5, 7, 9, 5.
  // No 3rd; the maj7 + 9 still tells the ear "maj9" clearly.
  {
    id: 'maj9-A', quality: 'maj9', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 2 }, // 5
      { stringIdx: 2, offset: 1 }, // 7
      { stringIdx: 1, offset: 0 }, // 9
      { stringIdx: 0, offset: 0 }, // 5 oct
    ],
  },
  // Minor 9 E-shape with A muted. Em9 = 0x0002 → 1, ♭7, ♭3, 5, 9.
  {
    id: 'min9-E', quality: 'min9', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      // A skipped
      { stringIdx: 3, offset: 0 }, // ♭7
      { stringIdx: 2, offset: 0 }, // ♭3
      { stringIdx: 1, offset: 0 }, // 5
      { stringIdx: 0, offset: 2 }, // 9
    ],
  },

  // === 11th chords ===
  // The full 1·3·5·♭7·9·11 stack puts the 3 and the 11 a half-step apart in
  // adjacent octaves — they clash. Standard practice is to omit the 3rd in
  // dominant and major 11 voicings (the chord then sounds suspended-like,
  // which is the conventional sound of a dom11). Minor 11s keep the ♭3
  // because there's no clash.
  //
  // Dominant 11 A-shape (no 3). C11 = x33333 → 1, 11, ♭7, 9, 5.
  // The famous "barre across one fret" sus-style voicing.
  {
    id: 'dom11-A', quality: 'dom11', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 }, // root
      { stringIdx: 3, offset: 0 }, // 11
      { stringIdx: 2, offset: 0 }, // ♭7
      { stringIdx: 1, offset: 0 }, // 9
      { stringIdx: 0, offset: 0 }, // 5
    ],
  },
  // Major 11 A-shape (no 3). Cmaj11 = x33433 → 1, 11, 7, 9, 5.
  {
    id: 'maj11-A', quality: 'maj11', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 0 }, // 11
      { stringIdx: 2, offset: 1 }, // 7
      { stringIdx: 1, offset: 0 }, // 9
      { stringIdx: 0, offset: 0 }, // 5
    ],
  },
  // Minor 11 A-shape — keeps the ♭3 since there's no half-step clash with 11.
  // Cm11 = x33343 → 1, 11, ♭7, ♭3, 5. Am11 = x00010.
  {
    id: 'min11-A', quality: 'min11', rootStringIdx: 4,
    pattern: [
      { stringIdx: 4, offset: 0 },
      { stringIdx: 3, offset: 0 }, // 11
      { stringIdx: 2, offset: 0 }, // ♭7
      { stringIdx: 1, offset: 1 }, // ♭3
      { stringIdx: 0, offset: 0 }, // 5
    ],
  },

  // === 13th chords ===
  // The full 1·3·5·7·9·13 stack is impossible to reach. Standard guitar
  // voicings are 4-note "shells" — root, 7th, 3rd, 13th — which uniquely
  // identify the chord while staying playable. These are the voicings
  // taught in jazz comping pedagogy.
  //
  // Dominant 13 E-shape shell. G13 = 3x345x → 1, ♭7, 3, 13.
  {
    id: 'dom13-E', quality: 'dom13', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 }, // root
      // A muted (would be the 5th — omitted in the shell)
      { stringIdx: 3, offset: 0 }, // ♭7
      { stringIdx: 2, offset: 1 }, // 3
      { stringIdx: 1, offset: 2 }, // 13
      // e muted
    ],
  },
  // Major 13 E-shape shell. Gmaj13 = 3x445x → 1, 7, 3, 13.
  {
    id: 'maj13-E', quality: 'maj13', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 3, offset: 1 }, // 7 (raised from ♭7)
      { stringIdx: 2, offset: 1 }, // 3
      { stringIdx: 1, offset: 2 }, // 13
    ],
  },
  // Minor 13 E-shape shell. Gm13 = 3x335x → 1, ♭7, ♭3, 13.
  {
    id: 'min13-E', quality: 'min13', rootStringIdx: 5,
    pattern: [
      { stringIdx: 5, offset: 0 },
      { stringIdx: 3, offset: 0 }, // ♭7
      { stringIdx: 2, offset: 0 }, // ♭3
      { stringIdx: 1, offset: 2 }, // 13
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

  // === Add chords — standard open voicings ===
  // Cadd9 — x32030 → 1, 3, 5, 9, 3.
  'C-add9': [
    { stringIdx: 4, fret: 3 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 3 },
    { stringIdx: 0, fret: 0 },
  ],
  // Eadd9 — 022102 → 1, 5, 1, 3, 5, 9.
  'E-add9': [
    { stringIdx: 5, fret: 0 },
    { stringIdx: 4, fret: 2 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 1 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 2 },
  ],
  // Gadd9 — 300003 → 1, 9, 5, 1, 3, 1.
  'G-add9': [
    { stringIdx: 5, fret: 3 },
    { stringIdx: 4, fret: 0 },
    { stringIdx: 3, fret: 0 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 3 },
  ],
  // Aadd9 — x02420 → 1, 5, 9, 3, 5.
  'A-add9': [
    { stringIdx: 4, fret: 0 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 4 },
    { stringIdx: 1, fret: 2 },
    { stringIdx: 0, fret: 0 },
  ],
  // Em(add9) — 022002 → 1, 5, 1, ♭3, 5, 9.
  'E-madd9': [
    { stringIdx: 5, fret: 0 },
    { stringIdx: 4, fret: 2 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 0 },
    { stringIdx: 1, fret: 0 },
    { stringIdx: 0, fret: 2 },
  ],
  // Am(add9) — x02410 → 1, 5, 9, ♭3, 1.
  'A-madd9': [
    { stringIdx: 4, fret: 0 },
    { stringIdx: 3, fret: 2 },
    { stringIdx: 2, fret: 4 },
    { stringIdx: 1, fret: 1 },
    { stringIdx: 0, fret: 0 },
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
