// Pitch-class helpers shared by Piano / Guitar input modes.
//
// Both modes select pitches (not spellings); we represent those pitches as
// "preferred" note strings using sharps for accidentals (so 'C#', not 'Db').

import { normalizeNote } from './notes';

export const PC_NAMES       = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const PC_FLAT_NAMES  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Note string -> pitch class index 0..11
export const noteToPc = (note) => {
  const n = normalizeNote(note);
  if (typeof n !== 'number') return -1;
  return n;
};

export const pcToNote = (pc) => PC_NAMES[((pc % 12) + 12) % 12];

// "Both spellings" form for a pitch — naturals return the bare letter, the
// five accidentals return "flat/sharp" form (e.g., "Eb/D#"). Used in display
// contexts where neither spelling is privileged (note trainer with a piano
// or guitar prompt — both names are equally valid identifications).
export const pcBothSpellings = (pc) => {
  const i = ((pc % 12) + 12) % 12;
  const flat = PC_FLAT_NAMES[i];
  const sharp = PC_NAMES[i];
  return flat === sharp ? flat : `${flat}/${sharp}`;
};

// Given a note in any spelling and a list of notes whose spellings we'd
// rather use, return the spelling whose pitch class matches. Falls back to
// the original input if no match. Used for echoing back the user's input
// in the question's harmonic context — e.g., a piano click on the black
// key between D and E displays as "Eb" inside an Eb chord context, not "D#".
export const spellInContext = (note, contextNotes = [], { ambiguousFallback = false } = {}) => {
  const pc = noteToPc(note);
  if (pc < 0) return note;
  for (const c of contextNotes) {
    if (noteToPc(c) === pc) return c;
  }
  return ambiguousFallback ? pcBothSpellings(pc) : note;
};

// Compare two arrays of note strings as unordered pitch-class sets.
export const pcSetsEqual = (a, b) => {
  const sa = a.map(noteToPc).filter((x) => x >= 0).sort();
  const sb = b.map(noteToPc).filter((x) => x >= 0).sort();
  if (sa.length !== sb.length) return false;
  return sa.every((v, i) => v === sb[i]);
};
