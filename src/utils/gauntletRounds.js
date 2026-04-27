// Gauntlet round generator.
//
// Produces a self-contained round descriptor: trainer type, focus subject
// (e.g., "Minor 7", "minor 3rd", "music staff"), direction, input mode,
// and 5 cards. The Gauntlet component renders these via its own light card
// engine — separate from Daily's so we can use trainer-style "one shot per
// card, reveal answer, advance" feedback rather than Daily's keep-guessing.

import { ROOTS } from '../data/notes';
import { QUALITIES, buildChord } from '../data/triads';
import { INTERVALS, INTERVAL_BY_ID, buildIntervalNote } from '../data/intervals';
import { MAJOR_KEYS, MINOR_KEYS, KEYS, notesInKey } from '../data/keys';

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
const sampleN = (arr, n) => shuffle(arr).slice(0, n);

// ---------- Subject pools -----------------------------------------------

// All chord qualities the Chord Trainer recognises (excluding `aug`-only
// limitations — they're allowed but produce simpler rounds).
const CHORD_QUALITIES = Object.keys(QUALITIES);

// Intervals worth drilling — exclude unison and octave (trivial).
const INTERVAL_IDS = INTERVALS
  .filter((i) => i.id !== 'P1' && i.id !== 'P8')
  .map((i) => i.id);

const NOTE_DISPLAYS = ['staff', 'piano', 'guitar'];

const COF_DIRECTIONS = ['key-to-accidentals', 'notes-to-key'];

// ---------- Per-trainer round builders ----------------------------------

// Pull a single (root, quality) chord card with a clean (no double-accidental)
// spelling. Returns null if the chosen quality doesn't have any clean root,
// which lets the caller resample.
const tryBuildChordCard = (qualityKey) => {
  const quality = QUALITIES[qualityKey];
  if (!quality) return null;
  const validRoots = ROOTS.filter((root) => {
    try {
      const notes = buildChord(root, qualityKey);
      return !notes.some((n) => n.includes('##') || n.includes('bb'));
    } catch {
      return false;
    }
  });
  if (validRoots.length === 0) return null;
  const root = pickOne(validRoots);
  const notes = buildChord(root, qualityKey);
  return {
    id: `${root}-${qualityKey}`,
    root,
    quality: qualityKey,
    qualityLabel: quality.label,
    chordName: `${root}${quality.symbol}`,
    notes,
  };
};

const buildChordRound = () => {
  // Mix chord types within a round so the user can't lock in one shape and
  // coast through the remaining four cards. We pick 5 distinct qualities
  // and pair each with a random root.
  const direction = pickOne(['chord-to-notes', 'notes-to-chord']);
  const inputMode = pickOne(['tap', 'staff', 'piano', 'guitar']);

  const qualities = sampleN(CHORD_QUALITIES, 5);
  const cards = qualities.map(tryBuildChordCard).filter(Boolean);
  // If any of the picked qualities had no valid roots (rare), backfill
  // until we have 5 cards.
  while (cards.length < 5) {
    const fallback = tryBuildChordCard(pickOne(CHORD_QUALITIES));
    if (fallback && !cards.some((c) => c.id === fallback.id)) cards.push(fallback);
  }

  const inputModeLabel = ({
    tap: 'Tap selector', staff: 'Music staff', piano: 'Piano keys', guitar: 'Guitar fretboard',
  })[inputMode];

  return {
    type: 'chord',
    direction,
    inputMode,
    subject: direction === 'chord-to-notes' ? 'Spell the chord' : 'Name the chord',
    subjectExtra: inputModeLabel,
    cards,
  };
};

const buildIntervalRound = () => {
  const intervalId = pickOne(INTERVAL_IDS);
  const interval = INTERVAL_BY_ID[intervalId];
  const inputMode = pickOne(['tap', 'staff', 'piano', 'guitar']);

  // Pick 5 roots whose interval-result is a single-accidental spelling
  // (avoid double-flats / double-sharps for clean drills).
  const validRoots = ROOTS.filter((root) => {
    try {
      const note = buildIntervalNote(root, interval);
      return !note.includes('##') && !note.includes('bb');
    } catch {
      return false;
    }
  });
  const roots = sampleN(validRoots, 5);

  const cards = roots.map((root) => ({
    id: `${root}-${intervalId}`,
    root,
    interval,
    note: buildIntervalNote(root, interval),
  }));

  return {
    type: 'interval',
    intervalId,
    intervalLabel: interval.label,
    inputMode,
    subject: interval.label,
    subjectExtra: `name the note above the root`,
    cards,
  };
};

// One round per pitch class. Mirrors NoteTrainer's PCS spelling logic.
const NOTE_PCS = [
  { pc: 0,  natural: { letter: 'C', accidental: '' } },
  { pc: 1,  sharp: { letter: 'C', accidental: '#' }, flat: { letter: 'D', accidental: 'b' } },
  { pc: 2,  natural: { letter: 'D', accidental: '' } },
  { pc: 3,  sharp: { letter: 'D', accidental: '#' }, flat: { letter: 'E', accidental: 'b' } },
  { pc: 4,  natural: { letter: 'E', accidental: '' } },
  { pc: 5,  natural: { letter: 'F', accidental: '' } },
  { pc: 6,  sharp: { letter: 'F', accidental: '#' }, flat: { letter: 'G', accidental: 'b' } },
  { pc: 7,  natural: { letter: 'G', accidental: '' } },
  { pc: 8,  sharp: { letter: 'G', accidental: '#' }, flat: { letter: 'A', accidental: 'b' } },
  { pc: 9,  natural: { letter: 'A', accidental: '' } },
  { pc: 10, sharp: { letter: 'A', accidental: '#' }, flat: { letter: 'B', accidental: 'b' } },
  { pc: 11, natural: { letter: 'B', accidental: '' } },
];
const pickSpelling = (entry, seed) => {
  if (entry.natural) return { ...entry.natural, mode: 'natural' };
  return (seed & 1) === 0
    ? { ...entry.sharp, mode: 'sharp' }
    : { ...entry.flat, mode: 'flat' };
};

const buildNoteRound = () => {
  const displayMode = pickOne(NOTE_DISPLAYS);
  const entries = sampleN(NOTE_PCS, 5);
  const cards = entries.map((entry, i) => {
    const spelling = pickSpelling(entry, Math.floor(Math.random() * 1000) + i);
    const note = `${spelling.letter}${spelling.accidental}`;
    const octave = 4 + Math.floor(Math.random() * 2);
    const seed = `gauntlet-note-${i}-${note}-${Math.floor(Math.random() * 1e6)}`;
    return { id: `${i}-${note}`, pc: entry.pc, note, spelling, octave, seed };
  });
  return {
    type: 'note',
    displayMode,
    inputMode: 'tap', // user always answers via NotePicker
    subject: 'Identify the note',
    subjectExtra: ({ staff: 'on the music staff', piano: 'on the piano', guitar: 'on the fretboard' })[displayMode],
    cards,
  };
};

const buildCofRound = () => {
  const direction = pickOne(COF_DIRECTIONS);
  // Pick 5 distinct keys from the full pool (major + minor mixed).
  const keys = sampleN(KEYS, 5);
  const cards = keys.map((k) => ({
    id: `${k.tonic}-${k.mode}`,
    ...k,
    scaleNotes: notesInKey(k),
  }));
  return {
    type: 'cof',
    direction,
    inputMode: 'tap',
    subject: direction === 'key-to-accidentals' ? 'Mark the accidentals' : 'Name the key',
    subjectExtra: direction === 'key-to-accidentals'
      ? 'sharps and flats for each key'
      : 'identify the key from its scale',
    cards,
  };
};

// ---------- Public API --------------------------------------------------

const BUILDERS = {
  chord:    buildChordRound,
  interval: buildIntervalRound,
  note:     buildNoteRound,
  cof:      buildCofRound,
};

const TRAINER_TYPES = Object.keys(BUILDERS);

// Pick a fresh round. Avoids back-to-back same-trainer rounds when possible
// to keep variety up; takes `lastType` to gate the choice.
export const buildGauntletRound = (lastType = null) => {
  const pool = lastType
    ? TRAINER_TYPES.filter((t) => t !== lastType)
    : TRAINER_TYPES;
  const type = pickOne(pool);
  return BUILDERS[type]();
};

// Friendly label for a chord QUALITIES key. Slightly nicer than the raw
// label field for round headers.
function humanQualityLabel(key) {
  const map = {
    maj:    'Major',
    min:    'Minor',
    dim:    'Diminished',
    aug:    'Augmented',
    maj6:   'Major 6th',
    min6:   'Minor 6th',
    maj7:   'Major 7th',
    dom7:   'Dominant 7th',
    min7:   'Minor 7th',
    m7b5:   'Half-diminished 7th',
    dim7:   'Diminished 7th',
    maj9:   'Major 9th',
    dom9:   'Dominant 9th',
    min9:   'Minor 9th',
    add9:   'Major Add 9',
    madd9:  'Minor Add 9',
    maj11:  'Major 11th',
    dom11:  'Dominant 11th',
    min11:  'Minor 11th',
    add11:  'Major Add 11',
    madd11: 'Minor Add 11',
    maj13:  'Major 13th',
    dom13:  'Dominant 13th',
    min13:  'Minor 13th',
  };
  return map[key] || key;
}
