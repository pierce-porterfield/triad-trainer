// The seven modes of the major scale — interval set + degree labels.
// Used by JazzMapper to render fretboard diagrams for any (root, mode)
// combination, color-coded by scale degree.

export const MODES = [
  { id: 'ionian',     name: 'Ionian',     intervals: [0, 2, 4, 5, 7, 9, 11], subtitle: 'major' },
  { id: 'dorian',     name: 'Dorian',     intervals: [0, 2, 3, 5, 7, 9, 10], subtitle: 'minor + ♮6' },
  { id: 'phrygian',   name: 'Phrygian',   intervals: [0, 1, 3, 5, 7, 8, 10], subtitle: 'minor + ♭2' },
  { id: 'lydian',     name: 'Lydian',     intervals: [0, 2, 4, 6, 7, 9, 11], subtitle: 'major + ♯4' },
  { id: 'mixolydian', name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], subtitle: 'major + ♭7' },
  { id: 'aeolian',    name: 'Aeolian',    intervals: [0, 2, 3, 5, 7, 8, 10], subtitle: 'natural minor' },
  { id: 'locrian',    name: 'Locrian',    intervals: [0, 1, 3, 5, 6, 8, 10], subtitle: 'diminished + ♭2' },
];

export const modeById = (id) => MODES.find((m) => m.id === id);

// Pitch classes (0..11) of every note in the scale for a given root.
export const scaleNotesPc = (rootPc, modeId) => {
  const m = modeById(modeId);
  if (!m) return [];
  return m.intervals.map((iv) => (rootPc + iv) % 12);
};

// Degree labels relative to the major scale. Lydian's 4 is "♯4" because
// it sits a semitone higher than the major 4; Dorian's 7 is "♭7" because
// it's a semitone lower than the major 7.
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const degreeLabels = (modeId) => {
  const m = modeById(modeId);
  if (!m) return [];
  return m.intervals.map((iv, i) => {
    const degree = i + 1;
    const major = MAJOR_INTERVALS[i];
    if (iv === major) return String(degree);
    if (iv < major) return `♭${degree}`;
    return `♯${degree}`;
  });
};

// "Display root" — uses sharp spellings by default. For showing the root
// note name in the slot header (e.g. "D Dorian", "F♯ Lydian").
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_NAMES  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const pcToSharpName = (pc) => SHARP_NAMES[((pc % 12) + 12) % 12];
export const pcToFlatName  = (pc) => FLAT_NAMES [((pc % 12) + 12) % 12];

// Map any user-entered note name to a pitch class 0..11. Accepts C, C#, Db, etc.
export const noteNameToPc = (name) => {
  if (typeof name !== 'string') return -1;
  const m = name.trim().match(/^([A-Ga-g])([#♯b♭]?)$/);
  if (!m) return -1;
  const letterPc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()];
  const acc = m[2] === '#' || m[2] === '♯' ? 1 : (m[2] === 'b' || m[2] === '♭' ? -1 : 0);
  return ((letterPc + acc) % 12 + 12) % 12;
};
