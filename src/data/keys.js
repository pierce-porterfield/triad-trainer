// Key signatures — major and minor.

export const ORDER_OF_SHARPS = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
export const ORDER_OF_FLATS  = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// Letters in alphabetical order — used by the 7-column accidental grid.
export const KEY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const MAJOR_KEYS = [
  { tonic: 'C',  name: 'C',  count: 0, type: 'natural', sharps: [], flats: [], mode: 'major' },
  { tonic: 'G',  name: 'G',  count: 1, type: 'sharp', sharps: ['F'], flats: [], mode: 'major' },
  { tonic: 'D',  name: 'D',  count: 2, type: 'sharp', sharps: ['F', 'C'], flats: [], mode: 'major' },
  { tonic: 'A',  name: 'A',  count: 3, type: 'sharp', sharps: ['F', 'C', 'G'], flats: [], mode: 'major' },
  { tonic: 'E',  name: 'E',  count: 4, type: 'sharp', sharps: ['F', 'C', 'G', 'D'], flats: [], mode: 'major' },
  { tonic: 'B',  name: 'B',  count: 5, type: 'sharp', sharps: ['F', 'C', 'G', 'D', 'A'], flats: [], mode: 'major' },
  { tonic: 'F#', name: 'F#', count: 6, type: 'sharp', sharps: ['F', 'C', 'G', 'D', 'A', 'E'], flats: [], mode: 'major' },
  { tonic: 'C#', name: 'C#', count: 7, type: 'sharp', sharps: ['F', 'C', 'G', 'D', 'A', 'E', 'B'], flats: [], mode: 'major' },
  { tonic: 'F',  name: 'F',  count: 1, type: 'flat',  sharps: [], flats: ['B'], mode: 'major' },
  { tonic: 'Bb', name: 'Bb', count: 2, type: 'flat',  sharps: [], flats: ['B', 'E'], mode: 'major' },
  { tonic: 'Eb', name: 'Eb', count: 3, type: 'flat',  sharps: [], flats: ['B', 'E', 'A'], mode: 'major' },
  { tonic: 'Ab', name: 'Ab', count: 4, type: 'flat',  sharps: [], flats: ['B', 'E', 'A', 'D'], mode: 'major' },
  { tonic: 'Db', name: 'Db', count: 5, type: 'flat',  sharps: [], flats: ['B', 'E', 'A', 'D', 'G'], mode: 'major' },
  { tonic: 'Gb', name: 'Gb', count: 6, type: 'flat',  sharps: [], flats: ['B', 'E', 'A', 'D', 'G', 'C'], mode: 'major' },
];

// Each natural minor key shares the key signature of its relative major.
const MINOR_TONICS = [
  ['A',  0], ['E',  1], ['B',  2], ['F#', 3], ['C#', 4], ['G#', 5], ['D#', 6], ['A#', 7],
  ['D',  8], ['G',  9], ['C',  10], ['F',  11], ['Bb', 12], ['Eb', 13],
];
export const MINOR_KEYS = MINOR_TONICS.map(([tonic, idx]) => {
  const m = MAJOR_KEYS[idx];
  return {
    tonic,
    name: tonic + 'm',
    count: m.count,
    type: m.type,
    sharps: m.sharps,
    flats: m.flats,
    mode: 'minor',
  };
});

export const KEYS = [...MAJOR_KEYS, ...MINOR_KEYS];

// Return the accidental for a letter in a given key: '#', 'b', or ''
export const accidentalFor = (key, letter) => {
  if (key.sharps.includes(letter)) return '#';
  if (key.flats.includes(letter)) return 'b';
  return '';
};

// All notes of a key's scale, starting from the tonic.
export const notesInKey = (key) => {
  const rootLetter = key.tonic[0];
  const rootIdx = KEY_LETTERS.indexOf(rootLetter);
  const scaleLetters = [];
  for (let i = 0; i < 7; i++) {
    scaleLetters.push(KEY_LETTERS[(rootIdx + i) % 7]);
  }
  return scaleLetters.map((l) => l + accidentalFor(key, l));
};

// Compare a user's letter→accidental map against a key.
export const answersMatch = (userMap, key) => {
  for (const letter of KEY_LETTERS) {
    const correct = accidentalFor(key, letter);
    const given = userMap[letter] || '';
    if (correct !== given) return false;
  }
  return true;
};

// Parse a key-name input into { root, mode } or null.
export const parseKeyInput = (s) => {
  if (!s) return null;
  const t = s.trim().replace(/\s+/g, '').replace('\u266F', '#').replace('\u266D', 'b');
  if (!t) return null;
  const letter = t[0].toUpperCase();
  if (!'ABCDEFG'.includes(letter)) return null;
  let i = 1;
  let acc = '';
  while (i < t.length && (t[i] === '#' || t[i] === 'b')) {
    acc += t[i];
    i++;
  }
  const root = letter + acc;
  const rest = t.slice(i).toLowerCase();
  let keyMode = 'major';
  if (rest === 'm' || rest === 'min' || rest === 'minor' || rest === '-') keyMode = 'minor';
  return { root, mode: keyMode };
};

export const keyNameMatch = (userInput, key) => {
  const u = parseKeyInput(userInput);
  if (!u) return false;
  return u.root === key.tonic && u.mode === key.mode;
};

// Find the relative key — same key signature (same sharps + flats), opposite
// mode. C major ↔ A minor, G major ↔ E minor, etc. Returns null if no
// matching entry (shouldn't happen for the standard 14 + 14 we ship).
const arraysEq = (a, b) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

export const relativeKeyOf = (key) => {
  if (!key) return null;
  const pool = key.mode === 'major' ? MINOR_KEYS : MAJOR_KEYS;
  return pool.find((k) => arraysEq(k.sharps, key.sharps) && arraysEq(k.flats, key.flats)) || null;
};

// Used when the prompt is a list of scale notes — those notes belong to
// both the major and its relative minor, so either answer must count.
export const keyNameMatchOrRelative = (userInput, key) => {
  if (keyNameMatch(userInput, key)) return true;
  const rel = relativeKeyOf(key);
  return rel ? keyNameMatch(userInput, rel) : false;
};
