// Hand-curated tune presets for the Jazz Scale Mapper. Each preset is a
// starting point; users can edit and save as their own.
//
// Slot shape: { rootPc, modeId, bars }
//   rootPc: 0..11 (C=0, C#=1, ..., B=11)
//   modeId: one of 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian'
//   bars:   number of bars the scale lasts

export const PRESETS = [
  {
    id: 'autumn-leaves-cm',
    name: 'Autumn Leaves (C minor)',
    timeSignature: [4, 4],
    slots: [
      { rootPc: 5,  modeId: 'dorian',     bars: 2 }, // Fm7 → F Dorian
      { rootPc: 10, modeId: 'mixolydian', bars: 2 }, // Bb7 → Bb Mixolydian
      { rootPc: 3,  modeId: 'ionian',     bars: 2 }, // Ebmaj7 → Eb Ionian
      { rootPc: 8,  modeId: 'lydian',     bars: 2 }, // Abmaj7 → Ab Lydian
      { rootPc: 2,  modeId: 'locrian',    bars: 2 }, // Dm7b5 → D Locrian
      { rootPc: 7,  modeId: 'phrygian',   bars: 2 }, // G7alt approx (or G Phrygian-dominant — using Phrygian as v1 placeholder)
      { rootPc: 0,  modeId: 'aeolian',    bars: 4 }, // Cm7 → C Aeolian
    ],
  },
  {
    id: 'so-what',
    name: 'So What (modal)',
    timeSignature: [4, 4],
    slots: [
      { rootPc: 2,  modeId: 'dorian', bars: 16 }, // Dm7 — D Dorian
      { rootPc: 3,  modeId: 'dorian', bars: 8  }, // Ebm7 — Eb Dorian
      { rootPc: 2,  modeId: 'dorian', bars: 8  }, // Dm7 — D Dorian
    ],
  },
  {
    id: 'blue-bossa',
    name: 'Blue Bossa (C minor)',
    timeSignature: [4, 4],
    slots: [
      { rootPc: 0, modeId: 'aeolian',    bars: 2 }, // Cm7 → C Aeolian
      { rootPc: 5, modeId: 'dorian',     bars: 2 }, // Fm7 → F Dorian
      { rootPc: 2, modeId: 'locrian',    bars: 1 }, // Dm7b5 → D Locrian
      { rootPc: 7, modeId: 'mixolydian', bars: 1 }, // G7 → G Mixolydian
      { rootPc: 0, modeId: 'aeolian',    bars: 2 }, // Cm7 → C Aeolian
      { rootPc: 3, modeId: 'dorian',     bars: 2 }, // Ebm7 → Eb Dorian
      { rootPc: 8, modeId: 'mixolydian', bars: 2 }, // Ab7 → Ab Mixolydian
      { rootPc: 1, modeId: 'ionian',     bars: 2 }, // Dbmaj7 → Db Ionian
      { rootPc: 2, modeId: 'locrian',    bars: 1 }, // Dm7b5 → D Locrian
      { rootPc: 7, modeId: 'mixolydian', bars: 1 }, // G7 → G Mixolydian
      { rootPc: 0, modeId: 'aeolian',    bars: 2 }, // Cm7 → C Aeolian
    ],
  },
];
