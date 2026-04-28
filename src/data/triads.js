import { ROOTS, LETTERS, parseNote, spellForLetter, normalizeNote } from './notes';
import { noteToPc } from './pitchClass';

// All chord qualities supported. Intervals are stacked thirds in semitones.
// 13ths follow the no-11 convention (1·3·5·7·9·13). 11ths include all six
// stacked thirds (1·3·5·7·9·11).
//
// "add" chords are triads with a single non-stacked extension (no 7th):
//   add9 = 1·3·5·9, madd9 = 1·♭3·5·9, etc.
export const QUALITIES = {
  maj:    { label: 'major',           symbol: '',      intervals: [0, 4, 7],             group: 'base' },
  min:    { label: 'minor',           symbol: 'm',     intervals: [0, 3, 7],             group: 'base' },
  dim:    { label: 'diminished',      symbol: '\u00B0', intervals: [0, 3, 6],            group: 'dim' },
  aug:    { label: 'augmented',       symbol: '+',     intervals: [0, 4, 8],             group: 'aug' },
  maj6:   { label: 'major 6th',       symbol: '6',     intervals: [0, 4, 7, 9],          group: 'sixths' },
  min6:   { label: 'minor 6th',       symbol: 'm6',    intervals: [0, 3, 7, 9],          group: 'sixths' },
  maj7:   { label: 'major 7th',       symbol: 'maj7',  intervals: [0, 4, 7, 11],         group: 'sevenths' },
  dom7:   { label: 'dominant 7th',    symbol: '7',     intervals: [0, 4, 7, 10],         group: 'sevenths' },
  min7:   { label: 'minor 7th',       symbol: 'm7',    intervals: [0, 3, 7, 10],         group: 'sevenths' },
  m7b5:   { label: 'half-diminished', symbol: 'm7\u266D5', intervals: [0, 3, 6, 10],     group: 'sevenths' },
  dim7:   { label: 'diminished 7th',  symbol: '\u00B07', intervals: [0, 3, 6, 9],        group: 'sevenths' },
  maj9:   { label: 'major 9th',       symbol: 'maj9',  intervals: [0, 4, 7, 11, 14],     group: 'ninths' },
  dom9:   { label: 'dominant 9th',    symbol: '9',     intervals: [0, 4, 7, 10, 14],     group: 'ninths' },
  min9:   { label: 'minor 9th',       symbol: 'm9',    intervals: [0, 3, 7, 10, 14],     group: 'ninths' },
  add9:   { label: 'add 9',           symbol: 'add9',  intervals: [0, 4, 7, 14],         degrees: [0, 2, 4, 8],   group: 'add' },
  madd9:  { label: 'minor add 9',     symbol: 'm(add9)', intervals: [0, 3, 7, 14],       degrees: [0, 2, 4, 8],   group: 'add' },
  maj11:  { label: 'major 11th',      symbol: 'maj11', intervals: [0, 4, 7, 11, 14, 17], group: 'elevenths' },
  dom11:  { label: 'dominant 11th',   symbol: '11',    intervals: [0, 4, 7, 10, 14, 17], group: 'elevenths' },
  min11:  { label: 'minor 11th',      symbol: 'm11',   intervals: [0, 3, 7, 10, 14, 17], group: 'elevenths' },
  add11:  { label: 'add 11',          symbol: 'add11', intervals: [0, 4, 7, 17],         degrees: [0, 2, 4, 10],  group: 'add' },
  madd11: { label: 'minor add 11',    symbol: 'm(add11)', intervals: [0, 3, 7, 17],      degrees: [0, 2, 4, 10],  group: 'add' },
  // 13th chords skip the 11 (1·3·5·7·9·13), so the 6th note in the array
  // sits on letter+12 (the 13th's letter slot = root letter + 5 mod 7), NOT
  // letter+10 (the 11th's slot). Without this override, default `i * 2`
  // letter-stepping spelled the 13th onto the wrong letter — e.g. E♭maj13
  // returned "A" instead of "C".
  maj13:  { label: 'major 13th',      symbol: 'maj13', intervals: [0, 4, 7, 11, 14, 21], degrees: [0, 2, 4, 6, 8, 12], group: 'thirteenths' },
  dom13:  { label: 'dominant 13th',   symbol: '13',    intervals: [0, 4, 7, 10, 14, 21], degrees: [0, 2, 4, 6, 8, 12], group: 'thirteenths' },
  min13:  { label: 'minor 13th',      symbol: 'm13',   intervals: [0, 3, 7, 10, 14, 21], degrees: [0, 2, 4, 6, 8, 12], group: 'thirteenths' },
};

// Spell a chord. By default each interval index advances the letter name
// by 2 (root → 3rd → 5th → 7th → 9th → 11th → 13th), which works for
// stacked-thirds chords. Chords that skip a third (add9, add11) supply an
// explicit `degrees` array giving the letter-step distance for each note —
// e.g., add9 = [0, 2, 4, 8] hops from the 5th to the 9th without writing a
// 7th in between.
export const buildChord = (root, qualityKey) => {
  const { letter: rootLetter, semitone: rootSemi } = parseNote(root);
  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  const q = QUALITIES[qualityKey];
  const { intervals, degrees } = q;
  return intervals.map((iv, i) => {
    if (i === 0) return root; // preserve root spelling
    const letterStep = degrees ? degrees[i] : i * 2;
    const targetLetter = LETTERS[(rootLetterIdx + letterStep) % 7];
    const targetSemi = (rootSemi + iv) % 12;
    return spellForLetter(targetLetter, targetSemi);
  });
};

// Pitch classes the user may omit when voicing this chord on a guitar
// fretboard. 11th and 13th chords commonly drop the 9th in standard voicings
// because the hand can't reach the full stack on a six-string neck — this
// is genuinely how those chords are played, not a workaround.
//
// Returns an array of pitch classes (0-11). Empty for chord types where every
// note is required (triads, 7ths, 9ths). Used only by guitar input grading;
// piano/staff/tap modes still require every chord note.
export const guitarOptionalPcs = (qualityKey, chordNotes) => {
  const q = QUALITIES[qualityKey];
  if (!q) return [];
  if (q.group === 'elevenths' || q.group === 'thirteenths') {
    // The 9th sits at index 4 in our stacked-thirds chord arrays.
    return chordNotes[4] != null ? [noteToPc(chordNotes[4])] : [];
  }
  return [];
};

// Build the deck for the given quality keys. Skips combinations that need
// double accidentals.
export const buildTriadDeck = (qualityKeys) => {
  const deck = [];
  ROOTS.forEach((root) => {
    qualityKeys.forEach((qKey) => {
      const q = QUALITIES[qKey];
      if (!q) return;
      const notes = buildChord(root, qKey);
      const hasDouble = notes.some((n) => n.includes('##') || n.includes('bb'));
      if (hasDouble) return;
      const chordName = `${root}${q.symbol}`;
      deck.push({
        id: `${root}-${qKey}`,
        chordName,
        root,
        quality: qKey,
        qualityLabel: q.label,
        notes,
      });
    });
  });
  return deck;
};

// Convenience: every base triad (maj, min, dim, aug) — 48 cards minus theoretical doubles.
export const buildAllTriadCards = () => buildTriadDeck(['maj', 'min', 'dim', 'aug']);

// Split a chord-name string into root + quality.
export const splitChord = (s) => {
  const t = s.trim().replace(/\s+/g, '')
    .replace(/\u266F/g, '#').replace(/\u266D/g, 'b')
    .replace(/\u{1D12A}/gu, '##').replace(/\u{1D12B}/gu, 'bb');
  if (!t) return null;
  const letter = t[0].toUpperCase();
  if (!'ABCDEFG'.includes(letter)) return null;
  let i = 1;
  let acc = '';
  while (i < t.length && (t[i] === '#' || t[i] === 'b')) {
    acc += t[i];
    i++;
  }
  return { root: letter + acc, quality: t.slice(i) };
};

// Reduce a quality string to a canonical symbol matching QUALITIES[*].symbol.
export const canonicalQuality = (q) => {
  let s = q
    .replace(/major/gi, 'M')
    .replace(/minor/gi, 'm')
    .replace(/maj/gi, 'M')
    .replace(/min/gi, 'm')
    .replace(/dim/gi, '\u00B0')
    .replace(/aug/gi, '+')
    .replace(/dominant/gi, '')
    .replace(/dom/gi, '')
    .replace(/halfdiminished/gi, '\u00F8')
    .replace(/halfdim/gi, '\u00F8')
    .replace(/\u0394/g, 'M')
    .replace(/\u2212/g, 'm')
    .replace(/o/g, '\u00B0');
  if (s.startsWith('-')) s = 'm' + s.slice(1);

  const map = {
    '': '', 'M': '',
    'm': 'm',
    '\u00B0': '\u00B0',
    '+': '+',
    'M7': 'maj7',
    '7': '7',
    'm7': 'm7',
    'm7b5': 'm7\u266D5', 'm7\u266D5': 'm7\u266D5', '\u00F8': 'm7\u266D5', '\u00F87': 'm7\u266D5',
    '\u00B07': '\u00B07',
    'M9': 'maj9',
    '9': '9',
    'm9': 'm9',
    'M13': 'maj13',
    '13': '13',
    'm13': 'm13',
  };
  return map[s] !== undefined ? map[s] : s;
};

export const chordNameMatch = (user, correct) => {
  const u = splitChord(user);
  const c = splitChord(correct);
  if (!u || !c) return false;
  if (normalizeNote(u.root) !== normalizeNote(c.root)) return false;
  return canonicalQuality(u.quality) === canonicalQuality(c.quality);
};
