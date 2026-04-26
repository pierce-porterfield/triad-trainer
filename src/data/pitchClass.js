// Pitch-class helpers shared by Piano / Guitar input modes.
//
// Both modes select pitches (not spellings); we represent those pitches as
// "preferred" note strings using sharps for accidentals (so 'C#', not 'Db').

import { normalizeNote } from './notes';

export const PC_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note string -> pitch class index 0..11
export const noteToPc = (note) => {
  const n = normalizeNote(note);
  if (typeof n !== 'number') return -1;
  return n;
};

export const pcToNote = (pc) => PC_NAMES[((pc % 12) + 12) % 12];

// Compare two arrays of note strings as unordered pitch-class sets.
export const pcSetsEqual = (a, b) => {
  const sa = a.map(noteToPc).filter((x) => x >= 0).sort();
  const sb = b.map(noteToPc).filter((x) => x >= 0).sort();
  if (sa.length !== sb.length) return false;
  return sa.every((v, i) => v === sb[i]);
};
