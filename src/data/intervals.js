import { ROOTS, LETTERS, parseNote, spellForLetter } from './notes';

// All standard intervals within an octave.
//   letterSteps = how many letter names to advance (so spelling stays correct)
//   semitones   = how many half-steps the interval covers
export const INTERVALS = [
  { id: 'P1', short: 'P1', label: 'Perfect Unison', letterSteps: 0, semitones: 0  },
  { id: 'm2', short: 'm2', label: 'Minor 2nd',      letterSteps: 1, semitones: 1  },
  { id: 'M2', short: 'M2', label: 'Major 2nd',      letterSteps: 1, semitones: 2  },
  { id: 'm3', short: 'm3', label: 'Minor 3rd',      letterSteps: 2, semitones: 3  },
  { id: 'M3', short: 'M3', label: 'Major 3rd',      letterSteps: 2, semitones: 4  },
  { id: 'P4', short: 'P4', label: 'Perfect 4th',    letterSteps: 3, semitones: 5  },
  { id: 'TT', short: 'TT', label: 'Tritone (A4)',   letterSteps: 3, semitones: 6  },
  { id: 'P5', short: 'P5', label: 'Perfect 5th',    letterSteps: 4, semitones: 7  },
  { id: 'm6', short: 'm6', label: 'Minor 6th',      letterSteps: 5, semitones: 8  },
  { id: 'M6', short: 'M6', label: 'Major 6th',      letterSteps: 5, semitones: 9  },
  { id: 'm7', short: 'm7', label: 'Minor 7th',      letterSteps: 6, semitones: 10 },
  { id: 'M7', short: 'M7', label: 'Major 7th',      letterSteps: 6, semitones: 11 },
  { id: 'P8', short: 'P8', label: 'Perfect Octave', letterSteps: 7, semitones: 12 },
];

export const INTERVAL_BY_ID = Object.fromEntries(INTERVALS.map((i) => [i.id, i]));

// Groups shown to the user — major/minor variants collapse into a single toggle.
export const GROUPS = [
  { id: '2nds', label: '2nds',    intervalIds: ['m2', 'M2'] },
  { id: '3rds', label: '3rds',    intervalIds: ['m3', 'M3'] },
  { id: 'P4',   label: '4th',     intervalIds: ['P4'] },
  { id: 'TT',   label: 'Tritone', intervalIds: ['TT'] },
  { id: 'P5',   label: '5th',     intervalIds: ['P5'] },
  { id: '6ths', label: '6ths',    intervalIds: ['m6', 'M6'] },
  { id: '7ths', label: '7ths',    intervalIds: ['m7', 'M7'] },
];

// Build the note an interval above a given root.
export const buildIntervalNote = (root, interval) => {
  const { letter: rootLetter, semitone: rootSemi } = parseNote(root);
  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  const targetLetter = LETTERS[(rootLetterIdx + interval.letterSteps) % 7];
  const targetSemi = (rootSemi + interval.semitones) % 12;
  return spellForLetter(targetLetter, targetSemi);
};

// Build a deck of interval cards from a list of interval ids. Skips
// combinations that would need double accidentals.
export const buildIntervalDeck = (activeIds) => {
  const deck = [];
  ROOTS.forEach((root) => {
    activeIds.forEach((id) => {
      const interval = INTERVAL_BY_ID[id];
      if (!interval) return;
      const note = buildIntervalNote(root, interval);
      if (note.includes('##') || note.includes('bb')) return;
      deck.push({
        id: `${root}-${id}`,
        root,
        interval,
        note,
      });
    });
  });
  return deck;
};
