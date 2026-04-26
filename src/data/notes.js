// Shared note primitives used by every trainer and the daily orchestrator.

// Letters in stacked-thirds order (used for chord spelling: root, 3rd, 5th...)
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Base semitone for each natural letter
export const LETTER_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// All accepted root spellings (avoids theoretical roots that need double accidentals)
export const ROOTS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
];

// Parse a note like "F#" or "Bb" into { letter, semitone }
export const parseNote = (n) => {
  const letter = n[0];
  const accidental = n.slice(1);
  let offset = 0;
  for (const ch of accidental) {
    if (ch === '#' || ch === '\u266F') offset += 1;
    else if (ch === 'b' || ch === '\u266D') offset -= 1;
  }
  return {
    letter,
    semitone: (LETTER_SEMITONES[letter] + offset + 120) % 12,
  };
};

// Given a target letter and target pitch class, produce the spelling.
// May use ## or bb for theoretical chords.
export const spellForLetter = (letter, targetSemitone) => {
  const natural = LETTER_SEMITONES[letter];
  let diff = ((targetSemitone - natural) % 12 + 12) % 12;
  if (diff > 6) diff -= 12;
  if (diff === 0) return letter;
  if (diff === 1) return letter + '#';
  if (diff === 2) return letter + '##';
  if (diff === -1) return letter + 'b';
  if (diff === -2) return letter + 'bb';
  return letter;
};

// Normalize user input to a pitch class (handles case + enharmonics)
export const normalizeNote = (n) => {
  if (!n) return '';
  const clean = n.trim().replace(/\s+/g, '');
  if (!clean) return '';
  const letter = clean[0].toUpperCase();
  const accidental = clean.slice(1).toLowerCase().replace('\u266F', '#').replace('\u266D', 'b');
  const note = letter + accidental;
  const ENHARMONIC = {
    'C': 0,  'B#': 0,  'Dbb': 0,
    'C#': 1, 'Db': 1,
    'D': 2,  'Cx': 2,  'Ebb': 2,
    'D#': 3, 'Eb': 3,
    'E': 4,  'Fb': 4,
    'F': 5,  'E#': 5,  'Gbb': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,  'Fx': 7,  'Abb': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,  'Gx': 9,  'Bbb': 9,
    'A#': 10,'Bb': 10,
    'B': 11, 'Cb': 11,
  };
  return ENHARMONIC[note] !== undefined ? ENHARMONIC[note] : note;
};

// Compare unordered note sets (enharmonics treated as equal).
export const notesMatch = (userNotes, correctNotes) => {
  const u = userNotes.map(normalizeNote).filter((x) => x !== '').sort();
  const c = correctNotes.map(normalizeNote).sort();
  if (u.length !== c.length) return false;
  return u.every((v, i) => v === c[i]);
};

// Single-note enharmonic equality.
export const notesEqual = (a, b) => {
  const na = normalizeNote(a);
  const nb = normalizeNote(b);
  return na !== '' && na === nb;
};

// Pretty display for a note string.
export const formatNote = (n) =>
  n.replace(/##/g, '\u{1D12A}').replace(/bb/g, '\u{1D12B}')
   .replace(/#/g, '\u266F').replace(/b/g, '\u266D');

// Fisher–Yates shuffle (non-deterministic).
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
