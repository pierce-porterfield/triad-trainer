// Programmatic chord-page content registry.
//
// Each entry maps a URL slug to its canonical reference content + a
// `publishAt: 'YYYY-MM-DD'` UTC date. Pages go live automatically when today's
// UTC date reaches that string. See src/data/publishSchedule.js + the daily
// rebuild GitHub Action for the staggered-rollout mechanics.

import { buildChord, QUALITIES } from './triads.js';
import { isLive } from './publishSchedule.js';

// Mapping from URL-quality token to internal QUALITIES key + the human-
// readable display name we use in headings and link labels. Keep slug
// tokens stable — they ship in URLs that may already be indexed.
const QUALITY_SLUG_MAP = {
  'major':            { key: 'maj',  display: 'major' },
  'minor':            { key: 'min',  display: 'minor' },
  'diminished':       { key: 'dim',  display: 'diminished' },
  'augmented':        { key: 'aug',  display: 'augmented' },
  'major-6':          { key: 'maj6', display: 'major 6' },
  'minor-6':          { key: 'min6', display: 'minor 6' },
  'major-7':          { key: 'maj7', display: 'major 7' },
  'minor-7':          { key: 'min7', display: 'minor 7' },
  'dominant-7':       { key: 'dom7', display: 'dominant 7' },
  'diminished-7':     { key: 'dim7', display: 'diminished 7' },
  'half-diminished':  { key: 'm7b5', display: 'half-diminished' },
};
const QUALITY_TOKENS = Object.keys(QUALITY_SLUG_MAP).join('|');
const SLUG_RE = new RegExp(`^([a-g])(?:-(sharp|flat))?-(${QUALITY_TOKENS})$`);

// Convert a root + quality slug ("c-major", "a-flat-minor", "f-sharp-diminished-7")
// to a chord descriptor. Returns null for unparseable or unsupported slugs.
export const slugToChord = (slug) => {
  const m = slug.match(SLUG_RE);
  if (!m) return null;
  const [, letter, accidental, quality] = m;
  const root = letter.toUpperCase()
    + (accidental === 'sharp' ? '#' : accidental === 'flat' ? 'b' : '');
  const { key: qualityKey, display: qualityDisplay } = QUALITY_SLUG_MAP[quality];
  const q = QUALITIES[qualityKey];
  return {
    root,
    qualityKey,
    quality,
    qualityLabel: q.label,
    chordName: `${root}${q.symbol}`,
    displayName: `${root} ${qualityDisplay}`,
  };
};

// All 48 base-triad slugs.
export const ALL_CHORD_SLUGS = (() => {
  const roots = [
    'c', 'c-sharp', 'd-flat', 'd', 'd-sharp', 'e-flat',
    'e', 'f', 'f-sharp', 'g-flat', 'g', 'g-sharp',
    'a-flat', 'a', 'a-sharp', 'b-flat', 'b',
  ];
  const qualities = ['major', 'minor', 'diminished', 'augmented'];
  const slugs = [];
  roots.forEach((r) => qualities.forEach((q) => slugs.push(`${r}-${q}`)));
  return slugs;
})();

// Hand-written content per slug. Add a `publishAt` UTC date string to schedule.
const CONTENT = {
  'c-major': {
    publishAt: '2020-01-01', // already live
    intro:
      'C major is the simplest triad in Western music — three white keys, no sharps, no flats. It\'s the chord most students learn first, and it sits at the centre of the circle of fifths as the only major key with a key signature of zero accidentals. Built by stacking thirds on the root, C major is C, E, and G.',
    intervals: [
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'G', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of C major', slug: 'c-major', kind: 'key' },
      { label: 'Relative minor: A minor', slug: 'a-minor', kind: 'chord' },
      { label: 'Parallel minor: C minor', slug: 'c-minor', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'f-major', 'a-minor', 'c-minor'],
    commonMistakes:
      'Beginners sometimes confuse C major with the C-shape barre chord on guitar (which is the same chord voiced differently) or assume the chord must always start on middle C. Pitch class is what matters: any C, any E, and any G — in any octave or order — voice a C major triad. The other trap is spelling: when writing C major in a flat key context (like as the V chord of F major), don\'t respell E as Fb or G as Abb. Stacked thirds dictate C–E–G; that\'s the only correct spelling.',
    inProgressions:
      'C major shows up as the I chord in C major, the IV chord in G major, the V chord in F major, and the bVII chord in D minor. The most common progression you\'ll meet it in is I–V–vi–IV (C–G–Am–F) — the so-called "four chords of pop."',
    faq: [
      { q: 'What notes are in a C major chord?', a: 'A C major chord contains three notes: C (the root), E (the major third), and G (the perfect fifth).' },
      { q: 'Is C major a major or minor chord?', a: 'C major is a major chord. The major quality comes from the third — E is a major third (4 semitones) above C.' },
      { q: 'How do you play a C major chord on piano?', a: 'Place your thumb on C, middle finger on E, and pinky on G. All three are white keys with no sharps or flats.' },
      { q: 'How do you play a C major chord on guitar?', a: 'The most common open voicing puts your ring finger on the 3rd fret of the 5th string (C), middle finger on the 2nd fret of the 4th string (E), index finger on the 1st fret of the 2nd string (C), and the 3rd, 1st, and open 6th strings ring out as G, E, and an optional bass note.' },
    ],
  },

  'g-major': {
    publishAt: '2026-04-28',
    intro:
      'G major is the second most common chord most musicians ever learn, sitting just one step clockwise from C on the circle of fifths. Built by stacking thirds, G major is G, B, and D — three notes that fall under the hand on guitar in one of the easiest open shapes, and three notes that anchor the I chord of countless folk, country, and pop songs.',
    intervals: [
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'D', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of G major', slug: 'g-major', kind: 'key' },
      { label: 'Relative minor: E minor', slug: 'e-minor', kind: 'chord' },
      { label: 'Parallel minor: G minor', slug: 'g-minor', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'd-major', 'e-minor', 'a-minor', 'g-minor'],
    commonMistakes:
      'The most-missed accidental in G major isn\'t in the chord itself — it\'s in the surrounding key. G major\'s key signature has F♯; learners drilling the chord sometimes accidentally write F natural elsewhere in a piece. The chord itself contains G, B, and D — all naturals — which makes it look easy, but if you\'re analysing a piece in G and see the F sit too low, double-check whether it should be F♯ (almost always yes). On guitar, beginners sometimes leave the high E string open in their G voicing — that adds an E (the 6th) on top, which technically makes the chord G6, not G major.',
    inProgressions:
      'G major is the I chord in G major (with V = D, IV = C), the V chord in C major (where the G → C cadence is the strongest motion in tonal music), the IV chord in D major, and a common bVII in A minor. The progression G–D–Em–C (I–V–vi–IV in G) underlies a frighteningly large slice of pop music.',
    faq: [
      { q: 'What notes are in a G major chord?', a: 'G major contains three notes: G (the root), B (the major third), and D (the perfect fifth).' },
      { q: 'How do you play a G major chord on guitar?', a: 'The standard open voicing: middle finger on the 3rd fret of the 6th string (G), index finger on the 2nd fret of the 5th string (B), ring finger on the 3rd fret of the 1st string (G). The open 4th and 3rd strings ring out as D and G; the 2nd string can ring open as B or be muted.' },
      { q: 'What\'s the difference between G major and G minor?', a: 'Only the third changes. G major uses B; G minor uses B♭. The fifth (D) and the root (G) are the same in both.' },
      { q: 'What scale is the G major chord built from?', a: 'G major is the I chord (tonic) of the G major scale, which has one sharp (F♯). It\'s also the IV chord in D major and the V chord in C major.' },
    ],
  },

  'f-major': {
    publishAt: '2026-04-29',
    intro:
      'F major is the first chord on the flat side of the circle of fifths and the most common chord whose root sits on a white key while its key signature carries an accidental. Built by stacking thirds, F major is F, A, and C. It\'s the I chord of F major, the IV chord of C major, the V chord of B♭ major, and the VI chord of A minor — four extremely common roles that put F major in countless pieces.',
    intervals: [
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'C', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of F major', slug: 'f-major', kind: 'key' },
      { label: 'Relative minor: D minor', slug: 'd-minor', kind: 'chord' },
      { label: 'Parallel minor: F minor', slug: 'f-minor', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'b-flat-major', 'd-minor', 'a-minor', 'g-major'],
    commonMistakes:
      'F major itself uses no accidentals — F, A, and C are all white keys — but the surrounding key signature of F major has B♭. So while the chord looks deceptively easy on the page, learners drilling it in context often forget the B♭ on neighbouring chords (B♭ major is the IV chord). On guitar, F major has no fully-open voicing; the standard "F barre" is most students\' first barre chord and a notorious sticking point because of the index-finger barre on the first fret. Many guitarists substitute a partial F (top four strings only) until the barre becomes reliable.',
    inProgressions:
      'F major shows up most often as the IV chord in C major (the C–F–G progression), the V chord in B♭ major, the I chord in F major itself, and the VI chord in A minor. The plagal "amen" cadence (IV → I) lands on C major from F major — an instantly recognisable hymn-cadence sound.',
    faq: [
      { q: 'What notes are in an F major chord?', a: 'F major contains three notes: F (the root), A (the major third), and C (the perfect fifth).' },
      { q: 'How do you play an F major chord on guitar?', a: 'The standard voicing is a barre chord: index finger across the entire 1st fret, middle finger on the 2nd fret of the 3rd string, ring and pinky on the 3rd fret of the 5th and 4th strings. A common simpler alternative plays only the top four strings (F on the 1st fret of the 1st string, plus A and C on the 2nd and 3rd strings).' },
      { q: 'Is F major in the key of C major?', a: 'Yes — F major is the IV chord (subdominant) in C major. The progression C–F–G–C is one of the most fundamental in Western music, hitting I–IV–V–I.' },
      { q: 'Why is the F barre chord so hard for beginners?', a: 'Because it requires the index finger to press down all six strings cleanly across the 1st fret while the other fingers fret the rest of the chord. The 1st fret has the highest string tension, and most beginners haven\'t built the finger strength for it. Practising with a partial F (top four strings) first is a common workaround.' },
    ],
  },

  'd-major': {
    publishAt: '2026-04-30',
    intro:
      'D major is one of the brightest, most resonant chords in tonal music, especially on stringed instruments. Three of the four open strings on a violin (D, A) and three of the six open strings on a guitar (D, G, B as the 5th of D) sit inside or near the D major triad, which is why orchestral works in D — Pachelbel\'s Canon, Beethoven\'s Violin Concerto — tend to ring with extra brilliance. D major contains D, F♯, and A.',
    intervals: [
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'A', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of D major', slug: 'd-major', kind: 'key' },
      { label: 'Relative minor: B minor', slug: 'b-minor', kind: 'chord' },
      { label: 'Parallel minor: D minor', slug: 'd-minor', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'a-major', 'b-minor', 'e-minor', 'd-minor'],
    commonMistakes:
      'The third in D major is F♯, not F natural. Beginners writing chord changes in lead sheets sometimes notate the third as F, which would technically make D major into D minor (D, F, A). When sight-reading in D major\'s key signature (two sharps: F♯, C♯), the F♯ is implied — but if you see an unexpected F natural in a chord that should be D major, treat it as a misprint or a deliberately altered chord, not the default. On guitar, the standard open D voicing skips the 5th and 6th strings; muting them cleanly with a thumb wrap is a separate technique to learn.',
    inProgressions:
      'D major is the I chord in D major (the Pachelbel-canon home), the V chord in G major (where the V → I cadence drives countless folk progressions), the IV chord in A major, and the bVII in E minor. The progression D–A–Bm–G (I–V–vi–IV in D) is the spine of an enormous slice of guitar-driven pop.',
    faq: [
      { q: 'What notes are in a D major chord?', a: 'D major contains three notes: D (the root), F♯ (the major third), and A (the perfect fifth).' },
      { q: 'How do you play a D major chord on guitar?', a: 'The standard open voicing: index finger on the 2nd fret of the 3rd string (A), ring finger on the 3rd fret of the 2nd string (D), middle finger on the 2nd fret of the 1st string (F♯). The 4th string rings open as D. Strum from the 4th string down (avoid the 5th and 6th strings).' },
      { q: 'Why is D major called a "bright" key?', a: 'Stringed instruments have open strings tuned to D and A — both notes in the D major chord — so the instrument rings sympathetically when D major is played. That sympathetic resonance gives the chord a brilliance that other keys can\'t match without close-mic work or alternate tunings.' },
      { q: 'Is D major a sharp or flat key?', a: 'D major has two sharps in its key signature: F♯ and C♯. The chord itself contains the F♯ as its third.' },
    ],
  },

  'a-major': {
    publishAt: '2026-05-01',
    intro:
      'A major is the I chord of A major and the most common "guitar-friendly bright" key, especially in country and singer-songwriter music. The chord contains A, C♯, and E. All three of those notes are open strings on a guitar (A, E directly; C♯ is the 4th fret of the 1st string but C natural is open), which means A major chord shapes ring with sympathetic resonance and sustain.',
    intervals: [
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'E', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of A major', slug: 'a-major', kind: 'key' },
      { label: 'Relative minor: F♯ minor', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Parallel minor: A minor', slug: 'a-minor', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'e-major', 'a-minor', 'b-minor'],
    commonMistakes:
      'A major\'s third is C♯, not C natural — and that\'s the single most-missed note for beginners. A major and A minor share the same root and fifth (A and E); only the C/C♯ flips between them. When working in A major\'s key signature (three sharps: F♯, C♯, G♯), the C♯ is implied — but in lead sheets without a key signature, writing "A" requires you to know to add the C♯. On guitar, the standard A voicing crowds three fingers onto the 2nd fret of three adjacent strings; some players prefer a one-finger barre across the 2nd fret of strings 4-3-2 to free a finger for added notes.',
    inProgressions:
      'A major is the I chord in A major (where the standard 12-bar blues lives: A–D–E–A), the V chord in D major, the IV chord in E major, and the bVII in B minor. The "country shuffle" progression A–D–A–E sits squarely in this key and accounts for a large share of country guitar tradition.',
    faq: [
      { q: 'What notes are in an A major chord?', a: 'A major contains three notes: A (the root), C♯ (the major third), and E (the perfect fifth).' },
      { q: 'How do you play an A major chord on guitar?', a: 'The standard open voicing puts three fingers on the 2nd fret of strings 4, 3, and 2 — index, middle, and ring respectively. The 5th string rings open as A; the 1st string rings open as E. Strum from the 5th string down (avoid the 6th).' },
      { q: 'How is A major different from A minor?', a: 'Only the third changes. A major uses C♯; A minor uses C natural. The root (A) and the fifth (E) are identical in both.' },
      { q: 'What key signatures contain A major as a chord?', a: 'A major is the I chord in A major (3 sharps), the V in D major (2 sharps), the IV in E major (4 sharps), and the III in F♯ minor.' },
    ],
  },

  'e-major': {
    publishAt: '2026-05-02',
    intro:
      'E major is the brightest of the standard rock and blues keys, and also the natural home of the guitar. The lowest and highest strings on a six-string guitar are both tuned to E, so an E major chord rings through the entire instrument with sympathetic resonance unmatched by any other key. The chord contains E, G♯, and B.',
    intervals: [
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'B', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of E major', slug: 'e-major', kind: 'key' },
      { label: 'Relative minor: C♯ minor', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Parallel minor: E minor', slug: 'e-minor', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'b-major', 'e-minor', 'f-sharp-minor'],
    commonMistakes:
      'E major\'s key signature has four sharps — F♯, C♯, G♯, D♯ — and the third of the chord is G♯. Beginners writing in E major often miss the G♯ because it\'s the third and feels "secondary" to the root and fifth, but G natural in an E chord makes it E minor. The 12-bar blues in E (E–A–B7) is so common that some players forget the proper third altogether and just play parallel power chords (E5, A5, B5), which sidesteps the major/minor distinction. That\'s fine for blues but obscures the harmonic logic.',
    inProgressions:
      'The 12-bar blues in E (E–A–B7) is the most-played progression in rock and blues history. E major is also the I chord of E major, the V chord of A major, the IV chord of B major, and the VI chord of G♯ minor. On guitar, the I–IV–V in E (E–A–B) all sit in open or first-position chords, which is why so much electric blues is in this key.',
    faq: [
      { q: 'What notes are in an E major chord?', a: 'E major contains three notes: E (the root), G♯ (the major third), and B (the perfect fifth).' },
      { q: 'How do you play an E major chord on guitar?', a: 'The standard open voicing: middle finger on the 2nd fret of the 5th string (B), ring finger on the 2nd fret of the 4th string (E — one octave above), index finger on the 1st fret of the 3rd string (G♯). The 6th, 2nd, and 1st strings ring open as E, B, and E.' },
      { q: 'Is E major the same as the E chord in blues?', a: 'Almost. The "E chord" in classic 12-bar blues is often E7 (E–G♯–B–D), which adds a flat seventh on top of E major. Pure E major is the simpler triad, and depending on the song you may use either.' },
      { q: 'What\'s the difference between E major and E minor?', a: 'Only the third changes. E major uses G♯; E minor uses G natural. The root (E) and fifth (B) are the same in both. On guitar, the difference is one finger: lift the index off the 3rd string in an E major shape and you\'re playing E minor.' },
    ],
  },

  'a-minor': {
    publishAt: '2026-05-03',
    intro:
      'A minor is the natural starting point for learning minor harmony — it\'s the relative minor of C major, so it uses the same seven white-key notes but resolves to a different home. The chord contains A, C, and E. All three are white keys, no accidentals; the difference between A minor and C major as chords isn\'t a sharp or flat, it\'s which note the music gravitates toward.',
    intervals: [
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'E', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of A minor (= C major)', slug: 'c-major', kind: 'key' },
      { label: 'Parallel major: A major', slug: 'a-major', kind: 'chord' },
      { label: 'Relative major: C major', slug: 'c-major', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'e-minor', 'd-minor', 'a-major'],
    commonMistakes:
      'A minor\'s third is C natural, not C♯. The chord A–C–E uses three consecutive white keys spanning thirds. Beginners sometimes confuse A minor with A major (A–C♯–E) — the only difference is the C/C♯, but that one half-step changes the entire mood. In the key of A minor, the V chord is most often E major (E–G♯–B), which introduces a G♯ that doesn\'t belong to the diatonic key signature; this "harmonic minor" alteration is what gives V → i cadences in minor their characteristic bite.',
    inProgressions:
      'A minor is the i chord in A minor (where the natural-minor progression Am–G–F–E descends through the diatonic chords) and the vi chord in C major (the "relative minor" position). The Am–F–C–G progression is one of the most-used in modern pop — especially in melancholy or wistful songs.',
    faq: [
      { q: 'What notes are in an A minor chord?', a: 'A minor contains three notes: A (the root), C (the minor third), and E (the perfect fifth).' },
      { q: 'How do you play an A minor chord on guitar?', a: 'The standard open voicing: middle finger on the 2nd fret of the 4th string (E), ring finger on the 2nd fret of the 3rd string (A — one octave above), index finger on the 1st fret of the 2nd string (C). The 5th and 1st strings ring open as A and E.' },
      { q: 'Why is A minor called the relative minor of C major?', a: 'They share the same key signature (no sharps, no flats — all white keys) and use the same seven notes. The difference is which note the music treats as "home." C major resolves to C; A minor resolves to A.' },
      { q: 'What\'s the difference between natural, harmonic, and melodic A minor?', a: 'All three start with the natural minor scale (A–B–C–D–E–F–G). Harmonic minor raises the 7th to G♯, which strengthens the V → i cadence. Melodic minor raises both the 6th (F → F♯) and 7th (G → G♯) ascending, but reverts to natural minor descending. The chord A minor itself is the same in all three; only the surrounding scale changes.' },
    ],
  },

  'd-minor': {
    publishAt: '2026-05-04',
    intro:
      'D minor is the most "serious" of the easy minor chords — Spinal Tap famously called it "the saddest of all keys," and there\'s some truth in the joke. Bach\'s D minor Toccata, Mozart\'s D minor Requiem, and a long list of grave classical and film works live here. The chord contains D, F, and A — all close to the centre of the staff, none requiring a key signature accidental on the chord itself.',
    intervals: [
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'A', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of D minor (= F major)', slug: 'f-major', kind: 'key' },
      { label: 'Parallel major: D major', slug: 'd-major', kind: 'chord' },
      { label: 'Relative major: F major', slug: 'f-major', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'a-minor', 'g-minor', 'd-major'],
    commonMistakes:
      'D minor\'s key signature is one flat (B♭) — same as F major, its relative major. The D minor chord itself is D, F, A (no accidentals on the chord notes), but the surrounding key has B♭ on every B unless cancelled. In the key of D minor, the V chord is usually A major (with C♯ raised from C natural via harmonic minor); the C♯ doesn\'t appear in the key signature, so it has to be written as an explicit accidental every time. Missing it is the most common cadence error in D minor.',
    inProgressions:
      'D minor is the i chord in D minor and the vi chord in F major. The descending tetrachord Dm–C–B♭–A is one of the oldest gestures in Western music — it\'s the bass line of every "lament bass" passacaglia from Purcell\'s Dido onward. In jazz, the Dm7–G7–C cadence (ii–V–I in C major) puts D minor in the "ii" position constantly.',
    faq: [
      { q: 'What notes are in a D minor chord?', a: 'D minor contains three notes: D (the root), F (the minor third), and A (the perfect fifth).' },
      { q: 'How do you play a D minor chord on guitar?', a: 'The standard open voicing: middle finger on the 2nd fret of the 3rd string (A), ring finger on the 3rd fret of the 2nd string (D), index finger on the 1st fret of the 1st string (F). The 4th string rings open as D. Strum from the 4th string down.' },
      { q: 'How is D minor different from D major?', a: 'Only the third changes. D minor uses F (natural); D major uses F♯. The root (D) and fifth (A) are the same. On guitar the difference is one fret: in D major the high F♯ sits on the 2nd fret of the 1st string, in D minor it\'s on the 1st fret as F natural.' },
      { q: 'What is the "lament bass" and how does D minor fit in?', a: 'The lament bass is a descending stepwise bass line, often Dm → C → B♭ → A in D minor. It appears in countless baroque and later compositions to evoke grief — Purcell\'s "Dido\'s Lament," Bach\'s Crucifixus, and many subsequent pieces. The pattern is so iconic that hearing it in D minor immediately signals "lament" in trained ears.' },
    ],
  },

  'e-minor': {
    publishAt: '2026-05-05',
    intro:
      'E minor is the most-used minor chord on guitar by a wide margin. The lowest open string of a guitar is E, and the easy open chords E minor, G major, D major, and C major all sit comfortably in this key — which is why so much singer-songwriter, folk, metal, and modal rock lives in E minor. The chord contains E, G, and B; G and E are open strings on a guitar, so E minor rings sympathetically.',
    intervals: [
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'B', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of E minor (= G major)', slug: 'g-major', kind: 'key' },
      { label: 'Parallel major: E major', slug: 'e-major', kind: 'chord' },
      { label: 'Relative major: G major', slug: 'g-major', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'a-minor', 'd-major', 'e-major'],
    commonMistakes:
      'E minor\'s third is G natural, not G♯. The key signature of E minor matches G major (one sharp: F♯) — but the chord itself uses no sharps. Beginners drilling E minor sometimes confuse it with E major (which has G♯ as its third); on guitar the difference is whether you press the 1st fret of the 3rd string or leave it open. Open = E minor (G natural). Pressed = E major (G♯). The fact that "E minor is easier on guitar" comes from the lifted finger, not from any extra knowledge.',
    inProgressions:
      'E minor is the i chord in E minor, the vi chord in G major, the iii in C major, and the ii in D major. The Em–C–G–D progression is one of the most ubiquitous in modern pop and rock, and dropped-D / drop-tuned riffs in heavy music constantly orbit E minor. The harmonic-minor V → i cadence is B major → E minor (with the borrowed D♯).',
    faq: [
      { q: 'What notes are in an E minor chord?', a: 'E minor contains three notes: E (the root), G (the minor third), and B (the perfect fifth).' },
      { q: 'How do you play an E minor chord on guitar?', a: 'Possibly the easiest chord on guitar: middle finger on the 2nd fret of the 5th string (B), ring finger on the 2nd fret of the 4th string (E — an octave higher). Strum all six strings; the open 6th, 3rd, 2nd, and 1st rings out as E, G, B, and E.' },
      { q: 'How is E minor different from E major?', a: 'Only the third changes. E minor uses G; E major uses G♯. The root (E) and fifth (B) are the same. On guitar, the difference is one fingertip: lift the 1st-fret finger off the 3rd string, and E major becomes E minor.' },
      { q: 'Why is E minor so common in rock and metal?', a: 'Because the lowest open string on a guitar is E, and E minor sits naturally there with no barre needed. Drop-D and drop-C tunings push that further — the lowest string becomes the root note, letting one-finger power chords drive entire songs. The genre\'s preference for minor keys for emotional weight closes the loop.' },
    ],
  },

  'g-minor': {
    publishAt: '2026-05-06',
    intro:
      'G minor is the relative minor of B♭ major and one of the warmest, most expressive minor keys for both classical and jazz. Mozart\'s 40th symphony in G minor and "Summertime" from Porgy and Bess are both built around this chord. G minor contains G, B♭, and D — the B♭ is the only accidental in the chord, and it\'s the same B♭ that defines the surrounding key signature.',
    intervals: [
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'D', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of G minor (= B♭ major)', slug: 'b-flat-major', kind: 'key' },
      { label: 'Parallel major: G major', slug: 'g-major', kind: 'chord' },
      { label: 'Relative major: B♭ major', slug: 'b-flat-major', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'g-major', 'd-minor', 'c-minor'],
    commonMistakes:
      'G minor\'s third is B♭, not B natural. Writing "Gm" in a chord chart and accidentally playing G–B–D would give G major instead — completely flipping the chord\'s mood. The flat is essential. On guitar, G minor is barre-chord territory (E-shape barred at the 3rd fret); there\'s no clean open voicing because the G string is naturally a major-third interval above the open 4th string, and getting B♭ in the chord requires fretting it. Beginners sometimes substitute G7 or G — neither of which is what the chord chart asks for.',
    inProgressions:
      'G minor is the i chord in G minor, the vi chord in B♭ major, and the ii in F major (where the Gm–C–F cadence is the textbook ii–V–I in jazz). Mozart used G minor for his most dramatic statements — the 40th symphony, the G minor string quintet — and a long line of romantic composers followed.',
    faq: [
      { q: 'What notes are in a G minor chord?', a: 'G minor contains three notes: G (the root), B♭ (the minor third), and D (the perfect fifth).' },
      { q: 'How do you play a G minor chord on guitar?', a: 'The standard voicing is a barre chord (E minor shape barred at the 3rd fret): index finger across all six strings on the 3rd fret, ring finger on the 5th fret of the 5th string, pinky on the 5th fret of the 4th string. The barred 6th, 3rd, 2nd, and 1st strings sound G, B♭, D, and G.' },
      { q: 'How is G minor different from G major?', a: 'Only the third changes. G minor uses B♭; G major uses B natural. The root (G) and fifth (D) are the same. The flat third drops the chord\'s emotional weight from bright to brooding.' },
      { q: 'What famous pieces are in G minor?', a: 'Mozart\'s Symphony No. 40 in G minor is one of the most-recognised symphonies ever written. Bach\'s Little Fugue in G minor (BWV 578) and Gershwin\'s "Summertime" are both anchored here. Across genres, G minor often signals dramatic, contemplative, or grave material.' },
    ],
  },

  'b-minor': {
    publishAt: '2026-05-07',
    intro:
      'B minor is the relative minor of D major — both keys share the same two-sharp signature (F♯, C♯). B minor sits at a sweet spot for guitar: comfortable enough to play in barre voicings, dark enough to sustain serious music. Bach\'s Mass in B minor and the slow movement of Schubert\'s "Unfinished" Symphony are both anchored here. The chord contains B, D, and F♯.',
    intervals: [
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'F#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of B minor (= D major)', slug: 'd-major', kind: 'key' },
      { label: 'Parallel major: B major', slug: 'b-major', kind: 'chord' },
      { label: 'Relative major: D major', slug: 'd-major', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'a-major', 'e-minor', 'f-sharp-minor'],
    commonMistakes:
      'B minor\'s fifth is F♯, not F natural — this is where most chord-chart errors happen. Without the F♯, the chord becomes B diminished (B–D–F), a completely different harmonic colour. The two-sharp key signature provides the F♯ implicitly, but if you\'re reading lead sheets without a key signature, you have to know the sharp belongs there. On guitar, B minor is most often played as a barre chord at the 2nd fret (A minor shape) — there\'s no fully-open B minor voicing.',
    inProgressions:
      'B minor is the i chord in B minor, the vi chord in D major (the relative-minor position), the ii in A major, and the iii in G major. Bach\'s Mass in B minor uses the chord constantly; in popular music the Bm–G–D–A progression is a folk and indie staple, putting B minor in the i position before climbing through the relative-major chords.',
    faq: [
      { q: 'What notes are in a B minor chord?', a: 'B minor contains three notes: B (the root), D (the minor third), and F♯ (the perfect fifth).' },
      { q: 'How do you play a B minor chord on guitar?', a: 'The standard voicing is a barre chord (A minor shape barred at the 2nd fret): index finger across strings 5–1 on the 2nd fret, ring finger on the 4th fret of the 4th string, pinky on the 4th fret of the 3rd string, middle finger on the 3rd fret of the 2nd string.' },
      { q: 'How is B minor different from B diminished?', a: 'The fifth changes. B minor (B–D–F♯) has a perfect fifth on top; B diminished (B–D–F) has a diminished fifth (one half-step lower). That single half-step transforms the chord from "minor and stable" to "diminished and unstable."' },
      { q: 'What famous pieces are in B minor?', a: 'Bach\'s Mass in B minor (a foundational work of Western choral music), Schubert\'s "Unfinished" Symphony No. 8, Tchaikovsky\'s 6th Symphony, and Borodin\'s Polovtsian Dances are all in B minor. The key has a long association with profound, weighty subject matter.' },
    ],
  },

  // ─── Phase 1 completions: remaining base majors and minors ────────────────
  // 9 majors + 11 minors = 20 pages. Cross-link enharmonic partners
  // (C# ↔ Db, F# ↔ Gb, etc.) so users searching either spelling land
  // somewhere meaningful even before every page in the pair is live.

  'b-flat-major': {
    publishAt: '2020-01-01',
    intro:
      'B♭ major is the most common key for concert-band literature and shows up across jazz, big-band, and choral writing. The chord contains B♭, D, and F — a perfect-fifth frame anchored by the flat that gives the chord its warm, slightly darker character compared to the all-natural C major. B♭ major is the I chord of B♭ major, the IV chord of F major, and the V chord of E♭ major.',
    intervals: [
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'F', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of B♭ major', slug: 'b-flat-major', kind: 'key' },
      { label: 'Relative minor: G minor', slug: 'g-minor', kind: 'chord' },
      { label: 'Parallel minor: B♭ minor', slug: 'b-flat-minor', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'e-flat-major', 'g-minor', 'd-minor', 'b-flat-minor'],
    commonMistakes:
      'The most common error is forgetting the B♭ — beginners reading lead sheets sometimes play B natural, which voices a B major chord (a tritone away in colour). On guitar, B♭ major has no fully-open voicing; the standard shape is an A-shape barre at the 1st fret, and many players substitute a partial 4-string voicing while their barre technique develops. In notation, B♭ is written with the flat sign on the B line; missing the flat is the single most common reading error in band literature.',
    inProgressions:
      'B♭ major is the I chord in B♭ major (with V = F, IV = E♭), the IV chord in F major, the V chord in E♭ major, and a common bVII in C minor. The progression B♭–E♭–F (I–IV–V) is the spine of much country and gospel writing, and B♭ → E♭ is the standard plagal cadence in band music.',
    faq: [
      { q: 'What notes are in a B♭ major chord?', a: 'B♭ major contains three notes: B♭ (the root), D (the major third), and F (the perfect fifth).' },
      { q: 'How do you play B♭ major on guitar?', a: 'The standard voicing is an A-shape barre at the 1st fret: index finger across strings 5–1, ring finger barring strings 4–2 on the 3rd fret. A simpler partial voicing plays just strings 4–1, omitting the bass B♭.' },
      { q: 'Is B♭ major the same as A♯ major?', a: 'They\'re enharmonically equivalent — same three pitches — but spelled differently. A♯ major would be A♯–C𝄪–E♯, requiring a double-sharp, so it\'s essentially never used. B♭ major is the standard spelling.' },
      { q: 'What instruments are commonly tuned to B♭?', a: 'Trumpet, clarinet, tenor saxophone, and most concert-band brass are B♭ instruments — meaning when they read a written C, they sound a concert B♭. That\'s why B♭ major is the default key for so much band literature.' },
    ],
  },

  'e-flat-major': {
    publishAt: '2020-01-01',
    intro:
      'E♭ major is the warm, full-bodied key of jazz ballads, big-band charts, and Romantic-era piano works. The chord contains E♭, G, and B♭ — a perfect-fifth frame with two flats, which give it a softer landing than its sharp-side neighbours. Mozart\'s Symphony No. 39, Beethoven\'s "Eroica," and Strauss\'s "Ein Heldenleben" are all anchored in E♭ major.',
    intervals: [
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'Bb', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of E♭ major', slug: 'e-flat-major', kind: 'key' },
      { label: 'Relative minor: C minor', slug: 'c-minor', kind: 'chord' },
      { label: 'Parallel minor: E♭ minor', slug: 'e-flat-minor', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'a-flat-major', 'c-minor', 'g-minor', 'e-flat-minor'],
    commonMistakes:
      'Both flats matter: E♭ and B♭. Beginners sometimes fingerings-swap one to E natural or B natural, which produces a totally different chord (E natural would suggest E major; B natural turns E♭ major into an enharmonic spelling of E♭+5). On piano, E♭ major\'s topography (one black-white-black pattern) is less familiar than C major\'s all-white shape, and beginners often hesitate finding G between the two flats. On guitar, E♭ major is almost always a 6th-fret barre (A-shape) since there\'s no useful open voicing.',
    inProgressions:
      'E♭ major is the I chord in E♭ major (with V = B♭, IV = A♭), the IV chord in B♭ major, the V chord in A♭ major, and a common bVI chord in G minor. The classic jazz ballad cadence (ii–V–I in E♭) runs Fm7–B♭7–E♭maj7. Beethoven\'s "Eroica" Symphony opens with two emphatic E♭ major chords that announce the entire harmonic universe of the piece.',
    faq: [
      { q: 'What notes are in an E♭ major chord?', a: 'E♭ major contains three notes: E♭ (the root), G (the major third), and B♭ (the perfect fifth).' },
      { q: 'How do you play E♭ major on guitar?', a: 'The most common voicing is an A-shape barre at the 6th fret: index finger across strings 5–1, ring finger barring strings 4–2 on the 8th fret. A C-shape barre at the 3rd fret also works but is harder to finger.' },
      { q: 'Is E♭ major the same as D♯ major?', a: 'They\'re enharmonic — same pitches, different spellings. D♯ major would be D♯–F𝄪–A♯, requiring a double-sharp, so it\'s never used in practice. E♭ major is the standard.' },
      { q: 'Why is E♭ major common in jazz?', a: 'Jazz developed alongside concert-band instruments — trumpet, alto and tenor saxophone, clarinet — most of which transpose into B♭ or E♭. Writing in E♭ major puts the horns in comfortable home keys (concert E♭ is a written C for alto sax, written F for tenor sax).' },
    ],
  },

  'a-flat-major': {
    publishAt: '2020-01-01',
    intro:
      'A♭ major is one of the warmest keys in the western tonal system and a favourite of Romantic piano composers. The chord contains A♭, C, and E♭ — a perfect-fifth frame with two flats and a natural in the middle. Chopin and Schubert wrote some of their most lyrical works in A♭, and the key shows up in jazz ballads as a tone just dark enough to feel intimate without being heavy.',
    intervals: [
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'Eb', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of A♭ major', slug: 'a-flat-major', kind: 'key' },
      { label: 'Relative minor: F minor', slug: 'f-minor', kind: 'chord' },
      { label: 'Parallel minor: A♭ minor', slug: 'a-flat-minor', kind: 'chord' },
    ],
    relatedChords: ['e-flat-major', 'd-flat-major', 'f-minor', 'c-minor', 'a-flat-minor'],
    commonMistakes:
      'A♭ major\'s third is C natural — not C♭ or C♯. Beginners learning the key signature (four flats: B♭, E♭, A♭, D♭) sometimes apply a flat to C by mistake, which produces an A♭ minor chord (A♭–C♭–E♭) instead. On piano, the chord\'s topography (black-white-black) is comfortable once learned but unfamiliar at first. On guitar, A♭ major is most often played as an E-shape barre at the 4th fret.',
    inProgressions:
      'A♭ major is the I chord in A♭ major (with V = E♭, IV = D♭), the IV chord in E♭ major, the V chord in D♭ major, and the bVI chord in C minor. Brahms\' Op. 118 No. 2 in A major famously modulates to A♭ major in the middle section — a half-step shift that\'s become a Romantic cliché for a reason. In jazz, the ii–V–I in A♭ runs B♭m7–E♭7–A♭maj7.',
    faq: [
      { q: 'What notes are in an A♭ major chord?', a: 'A♭ major contains three notes: A♭ (the root), C (the major third), and E♭ (the perfect fifth).' },
      { q: 'How do you play A♭ major on guitar?', a: 'The standard voicing is an E-shape barre at the 4th fret: index finger across all six strings on the 4th fret, ring finger and pinky on the 6th fret of the 5th and 4th strings, middle finger on the 5th fret of the 3rd string.' },
      { q: 'Is A♭ major the same as G♯ major?', a: 'They\'re enharmonic — same pitches, different spellings. G♯ major would have eight sharps (including F𝄪), so it\'s essentially never used. A♭ major (four flats) is the practical spelling.' },
      { q: 'What pieces are famous in A♭ major?', a: 'Chopin\'s "Heroic" Polonaise Op. 53, Schubert\'s Impromptu Op. 90 No. 4, and Brahms\' Intermezzo Op. 118 No. 2 are all in A♭ major. The key has a deeply lyrical, intimate association in Romantic piano literature.' },
    ],
  },

  'd-flat-major': {
    publishAt: '2020-01-01',
    intro:
      'D♭ major is a five-flat key that sits deep on the flat side of the circle of fifths. The chord contains D♭, F, and A♭ — a perfect-fifth frame whose flat colour gives it a particularly soft, romantic character. Chopin\'s "Raindrop" Prelude and "Minute" Waltz are both in D♭ major; the key is also enharmonic to C♯ major (which has seven sharps) and is almost always preferred for that reason.',
    intervals: [
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'Ab', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of D♭ major', slug: 'd-flat-major', kind: 'key' },
      { label: 'Enharmonic: C♯ major', slug: 'c-sharp-major', kind: 'chord' },
      { label: 'Relative minor: B♭ minor', slug: 'b-flat-minor', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'g-flat-major', 'c-sharp-major', 'b-flat-minor', 'f-minor'],
    commonMistakes:
      'The trap in D♭ major is the third — F natural, not F♭ or F♯. Beginners reading the five-flat signature sometimes assume every accidental letter is flat and accidentally play F♭, which is enharmonic to E and turns the chord into a D♭ diminished spelling. On piano, the chord falls comfortably under the hand once you learn it (black-white-black), and it\'s actually one of the easier keys for fluent playing despite the scary-looking signature. On guitar, D♭ major usually appears as a 4th-fret C-shape barre or a 9th-fret A-shape barre.',
    inProgressions:
      'D♭ major is the I chord in D♭ major (with V = A♭, IV = G♭), the IV chord in A♭ major, the V chord in G♭ major, and the bVI chord in F minor. Many jazz standards modulate to D♭ major to take advantage of its rich, dark colour — Coltrane\'s "Naima" is anchored in A♭ but builds tension on D♭ chords throughout. The "Tristan chord" cadence often resolves to D♭ in late-Romantic harmony.',
    faq: [
      { q: 'What notes are in a D♭ major chord?', a: 'D♭ major contains three notes: D♭ (the root), F (the major third), and A♭ (the perfect fifth).' },
      { q: 'Is D♭ major the same as C♯ major?', a: 'They\'re enharmonic — same three pitches. D♭ major has five flats; C♯ major has seven sharps. D♭ major is almost always preferred because it\'s easier to read.' },
      { q: 'How do you play D♭ major on piano?', a: 'Place your thumb on D♭ (the black key just left of D), middle finger on F (the white key), and pinky on A♭ (the black key just left of A). Two black keys plus a white in the middle — a comfortable shape once memorised.' },
      { q: 'What pieces are famous in D♭ major?', a: 'Chopin\'s "Raindrop" Prelude Op. 28 No. 15, his "Minute" Waltz Op. 64 No. 1, and Liszt\'s "Liebestraum" No. 3 are all in D♭ major. The key is associated with calm, lyrical, and intimate music.' },
    ],
  },

  'g-flat-major': {
    publishAt: '2020-01-01',
    intro:
      'G♭ major sits on the far flat side of the circle of fifths with six flats — only one short of the maximum. The chord contains G♭, B♭, and D♭. G♭ major is enharmonic to F♯ major (six sharps), and which spelling a composer chooses usually depends on the surrounding key area: flat-side music writes G♭, sharp-side writes F♯. The key has a notably soft, distant colour that Debussy and Ravel exploited.',
    intervals: [
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Gb', to: 'Db', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of G♭ major', slug: 'g-flat-major', kind: 'key' },
      { label: 'Enharmonic: F♯ major', slug: 'f-sharp-major', kind: 'chord' },
      { label: 'Relative minor: E♭ minor', slug: 'e-flat-minor', kind: 'chord' },
    ],
    relatedChords: ['d-flat-major', 'f-sharp-major', 'e-flat-minor', 'b-flat-major', 'a-flat-major'],
    commonMistakes:
      'Almost every note in the chord is a flat — G♭, B♭, D♭ — and beginners not yet fluent in flat keys sometimes lose track of which letter gets the accidental. The key signature has six flats (B♭, E♭, A♭, D♭, G♭, C♭), the most you\'ll typically see in standard literature. On piano, G♭ major is the famous "all black keys" pattern for the scale (G♭ A♭ B♭ C♭ D♭ E♭ F = mostly black keys with two white) — but the chord itself is two black keys (G♭, D♭) and one white-key-spelled-as-flat (C♭ rare; B♭ common).',
    inProgressions:
      'G♭ major is the I chord in G♭ major (with V = D♭, IV = C♭), the IV chord in D♭ major, and a frequent bII in F major (the Neapolitan-of-Neapolitan). Chopin\'s "Black Key" Étude (Op. 10 No. 5) is in G♭ major and uses the all-black-keys pattern as its central texture. In jazz, G♭ major progressions often borrow from F♯ major notation depending on the chart.',
    faq: [
      { q: 'What notes are in a G♭ major chord?', a: 'G♭ major contains three notes: G♭ (the root), B♭ (the major third), and D♭ (the perfect fifth).' },
      { q: 'Is G♭ major the same as F♯ major?', a: 'Yes, enharmonically — same three pitches. G♭ major has six flats; F♯ major has six sharps. Composers choose between them based on surrounding harmony, not absolute preference.' },
      { q: 'How do you play G♭ major on piano?', a: 'Thumb on G♭ (black key just left of G), middle finger on B♭ (black key just left of B), pinky on D♭ (black key just left of D). Three black keys — a clean shape once you know it.' },
      { q: 'What pieces are in G♭ major?', a: 'Chopin\'s "Black Key" Étude Op. 10 No. 5 and his "Berceuse" Op. 57 are in G♭ major. Schubert\'s Impromptu Op. 90 No. 3 is famously written in G♭ in the Schubert manuscripts but published in G major; both versions exist.' },
    ],
  },

  'b-major': {
    publishAt: '2020-01-01',
    intro:
      'B major has five sharps (F♯, C♯, G♯, D♯, A♯) and sits five clockwise steps from C on the circle of fifths. The chord contains B, D♯, and F♯. B major is more often encountered in vocal music transposed for range and in jazz tunes than in standard piano literature — its sharp-side spelling is harder to read at sight than its enharmonic neighbour C♭ major (seven flats), but B major is the more common notation choice.',
    intervals: [
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'F#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of B major', slug: 'b-major', kind: 'key' },
      { label: 'Relative minor: G♯ minor', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Parallel minor: B minor', slug: 'b-minor', kind: 'chord' },
    ],
    relatedChords: ['e-major', 'f-sharp-major', 'g-sharp-minor', 'b-minor', 'd-sharp-minor'],
    commonMistakes:
      'Both the third (D♯) and the fifth (F♯) are sharp. The most common error is reading D♯ as D natural, which produces a B minor chord — a mistake especially easy on guitar where the same fret pattern at a different barre position can voice either chord. The five-sharp key signature is tricky for sight-readers; hand-write the sharps F C G D A on a scrap before reading anything dense in B major.',
    inProgressions:
      'B major is the I chord in B major (with V = F♯, IV = E), the IV chord in F♯ major, the V chord in E major, and a common bII in A♯ minor / B♭ minor. Beethoven\'s Piano Sonata Op. 106 ("Hammerklavier") has its slow movement in F♯ minor with a famous excursion to D major; the surrounding harmony often touches B major as a stepping stone. In jazz, ii–V–I in B major runs C♯m7–F♯7–Bmaj7.',
    faq: [
      { q: 'What notes are in a B major chord?', a: 'B major contains three notes: B (the root), D♯ (the major third), and F♯ (the perfect fifth).' },
      { q: 'How do you play B major on guitar?', a: 'The standard voicing is an A-shape barre at the 2nd fret: index finger across strings 5–1 on the 2nd fret, ring finger barring strings 4–2 on the 4th fret. An open partial voicing using strings 4–1 also works for some styles.' },
      { q: 'Is B major the same as C♭ major?', a: 'They\'re enharmonic. B major has five sharps; C♭ major has seven flats. B major is the more common notation; C♭ major appears occasionally in deep flat-key contexts.' },
      { q: 'What\'s the relative minor of B major?', a: 'G♯ minor — it shares B major\'s five-sharp key signature and is built on the 6th degree of the B major scale.' },
    ],
  },

  'c-sharp-major': {
    publishAt: '2020-01-01',
    intro:
      'C♯ major is the seven-sharp key — every letter in the scale carries a sharp. The chord contains C♯, E♯, and G♯. In notation, C♯ major is enharmonic to D♭ major (five flats), and composers almost always prefer D♭ for readability. The key does appear in Bach\'s Well-Tempered Clavier Book 1 and Book 2 (one prelude and fugue in C♯ major in each), but it\'s a deliberate writing choice — the actual sound is identical to D♭ major.',
    intervals: [
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'E#', to: 'G#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'G#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Enharmonic key: D♭ major', slug: 'd-flat-major', kind: 'chord' },
      { label: 'Relative minor: A♯ minor', slug: 'a-sharp-minor', kind: 'chord' },
      { label: 'Parallel minor: C♯ minor', slug: 'c-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['d-flat-major', 'f-sharp-major', 'c-sharp-minor', 'a-sharp-minor', 'g-sharp-minor'],
    commonMistakes:
      'The third is E♯, not F. They\'re the same pitch, but in the C♯ major scale (which uses the letter E once, not F twice) the proper spelling is E♯. Writing F instead of E♯ violates the rule that scale spellings use each letter exactly once. On piano, C♯ major\'s topography (black-white-black if you read E♯ as F) is identical to D♭ major\'s; the difference is purely on the page.',
    inProgressions:
      'C♯ major is the I chord in C♯ major, the IV chord in G♯ major (theoretical), and the V chord in F♯ major. Functional-harmony progressions in C♯ major are rare in published music; most composers reach the same sonic result by writing in D♭ major. Bach\'s use of C♯ major in the WTC was a pedagogical choice — the cycle systematically visits every key in both spellings.',
    faq: [
      { q: 'What notes are in a C♯ major chord?', a: 'C♯ major contains three notes: C♯ (the root), E♯ (the major third), and G♯ (the perfect fifth). E♯ and F are the same pitch but spelled differently in this key.' },
      { q: 'Is C♯ major the same as D♭ major?', a: 'Yes, enharmonically — same three pitches. C♯ major has seven sharps; D♭ major has five flats. D♭ is preferred in almost all literature for readability.' },
      { q: 'Why is the third spelled E♯ instead of F?', a: 'Major scales use each of the seven letters (A through G) exactly once. The C♯ major scale runs C♯ D♯ E♯ F♯ G♯ A♯ B♯ — using the letters C-D-E-F-G-A-B in order. Calling the third "F" instead of "E♯" would skip the letter E entirely and use F twice.' },
      { q: 'What pieces use C♯ major?', a: 'Bach\'s Well-Tempered Clavier (one prelude and fugue in each book) and Beethoven\'s Op. 131 String Quartet (in C♯ minor, with extensive C♯ major sections) are the most-cited examples. In practice, modern composers write D♭ major instead.' },
    ],
  },

  'f-sharp-major': {
    publishAt: '2020-01-01',
    intro:
      'F♯ major has six sharps (every note except B carries a sharp) and is enharmonic to G♭ major (six flats). The chord contains F♯, A♯, and C♯. Which spelling appears in a score depends on context — sharp-side modulations land on F♯, flat-side land on G♭. The key is famous for its "shimmer" in piano writing; Debussy\'s "Reflets dans l\'eau" uses F♯ extensively, and Bach gave it a prelude and fugue in both books of the Well-Tempered Clavier.',
    intervals: [
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'C#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of F♯ major', slug: 'f-sharp-major', kind: 'key' },
      { label: 'Enharmonic: G♭ major', slug: 'g-flat-major', kind: 'chord' },
      { label: 'Relative minor: D♯ minor', slug: 'd-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['b-major', 'c-sharp-major', 'g-flat-major', 'd-sharp-minor', 'f-sharp-minor'],
    commonMistakes:
      'Three sharps live inside the chord itself: F♯, A♯, and C♯. Reading any of them as a natural produces a different chord — F-A-C is F major; F♯-A-C♯ is F♯ minor; F♯-A♯-C is an unusual altered voicing. On guitar, F♯ major is a 2nd-fret E-shape barre or a 9th-fret D-shape; both require reliable barre technique. The key signature is dense enough that hand-writing the sharps as a reminder before sight-reading is a normal precaution.',
    inProgressions:
      'F♯ major is the I chord in F♯ major (with V = C♯, IV = B), the IV chord in C♯ major, the V chord in B major, and a common bII in F minor (Neapolitan). Late-Romantic harmony often modulates between F♯ major and its enharmonic G♭ major mid-piece; Wagner\'s Tristan und Isolde uses both notations across its sprawling chromatic structure.',
    faq: [
      { q: 'What notes are in an F♯ major chord?', a: 'F♯ major contains three notes: F♯ (the root), A♯ (the major third), and C♯ (the perfect fifth).' },
      { q: 'Is F♯ major the same as G♭ major?', a: 'Yes, enharmonically — same three pitches. F♯ major has six sharps; G♭ major has six flats. They\'re equally valid; composers pick one based on surrounding harmony.' },
      { q: 'How do you play F♯ major on guitar?', a: 'Most commonly an E-shape barre at the 2nd fret: index finger across all six strings on the 2nd fret, ring and pinky on the 4th fret of strings 5 and 4, middle finger on the 3rd fret of string 3.' },
      { q: 'What\'s the relative minor of F♯ major?', a: 'D♯ minor — it shares F♯ major\'s six-sharp key signature and is built on the 6th degree of the F♯ major scale.' },
    ],
  },

  'g-sharp-major': {
    publishAt: '2020-01-01',
    intro:
      'G♯ major is a theoretical key — its key signature would require eight sharps (including F𝄪, a double-sharp), so it\'s essentially never written in published music. The chord G♯–B♯–D♯ does appear, but always inside a piece notated in a different key (typically C♯ minor or D♯ minor, where G♯ functions as a dominant). For the actual chord with these pitches, use the enharmonic A♭ major spelling.',
    intervals: [
      { from: 'G#', to: 'B#', name: 'major 3rd', semitones: 4 },
      { from: 'B#', to: 'D#', name: 'minor 3rd', semitones: 3 },
      { from: 'G#', to: 'D#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Enharmonic key: A♭ major', slug: 'a-flat-major', kind: 'chord' },
      { label: 'Relative minor: E♯ minor (theoretical)', slug: 'f-minor', kind: 'chord' },
      { label: 'Parallel minor: G♯ minor', slug: 'g-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'g-sharp-minor', 'c-sharp-minor', 'd-sharp-minor', 'e-major'],
    commonMistakes:
      'The third is B♯, which is enharmonic to C natural. Beginners almost universally read it as C — and they\'re hearing the right pitch — but the proper spelling inside a sharp-key context is B♯. The chord almost always appears as the V chord of C♯ minor, where it spells correctly as G♯-B♯-D♯ to maintain the seven-letter rule.',
    inProgressions:
      'G♯ major is most often encountered as the V chord of C♯ minor, where the cadence G♯ → C♯m is the strongest harmonic motion in the key. It also appears as the V/V (secondary dominant) in F♯ major, resolving to C♯ major. As a standalone tonic, G♯ major isn\'t used in published literature; A♭ major covers the same harmonic territory with a much friendlier key signature.',
    faq: [
      { q: 'What notes are in a G♯ major chord?', a: 'G♯ major contains three notes: G♯ (the root), B♯ (the major third — same pitch as C), and D♯ (the perfect fifth).' },
      { q: 'Is G♯ major the same as A♭ major?', a: 'Yes, enharmonically. G♯ major would have eight sharps (including F𝄪) so it\'s never used as a key. A♭ major (four flats) is the practical spelling for this chord.' },
      { q: 'When would I see G♯ major in a score?', a: 'Almost always as the dominant (V) chord of C♯ minor — the standard key for C♯ minor literature uses G♯ major in cadences. Outside that context, A♭ major is the spelling.' },
      { q: 'Why is the third B♯ instead of C?', a: 'In a sharp-key context, scale spellings use each letter once. The G♯ scale runs G♯-A♯-B♯-C♯-D♯-E♯-F𝄪 — so the third is the "B" letter raised by a sharp, written B♯.' },
    ],
  },

  // ─── Minors ───────────────────────────────────────────────────────────────

  'c-minor': {
    publishAt: '2020-01-01',
    intro:
      'C minor is the dark, dramatic counterpart to C major — Beethoven\'s Symphony No. 5, his "Pathétique" Sonata, and Mozart\'s K. 491 Piano Concerto are all anchored here. The chord contains C, E♭, and G. C minor sits at the centre of the flat side of the circle of fifths and is one of the most common minor keys in classical and film music.',
    intervals: [
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'G', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of C minor (= E♭ major)', slug: 'e-flat-major', kind: 'key' },
      { label: 'Parallel major: C major', slug: 'c-major', kind: 'chord' },
      { label: 'Relative major: E♭ major', slug: 'e-flat-major', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'e-flat-major', 'g-minor', 'f-minor', 'b-flat-major'],
    commonMistakes:
      'The third is E♭, not E. This is the single fact that makes the chord minor; replacing E♭ with E natural produces C major (a completely different harmonic colour). On piano, the chord is white-black-white (C, then the black key just left of E, then G) — a comfortable shape once memorised. On guitar, C minor is most often a barre chord (A-shape at the 3rd fret) since there\'s no fully-open voicing.',
    inProgressions:
      'C minor is the i chord in C minor, the vi chord in E♭ major (the relative-major position), the ii chord in B♭ major, and the iii in A♭ major. Beethoven\'s Symphony No. 5 famously opens with the rhythmic motive "short-short-short-long" hammering the C minor triad; the entire first movement orbits around it. In film scoring, C minor is the go-to key for serious, weighty material.',
    faq: [
      { q: 'What notes are in a C minor chord?', a: 'C minor contains three notes: C (the root), E♭ (the minor third), and G (the perfect fifth).' },
      { q: 'How do you play C minor on guitar?', a: 'Most commonly an A-shape barre at the 3rd fret: index finger across strings 5–1 on the 3rd fret, ring finger on the 5th fret of the 4th string, pinky on the 5th fret of the 3rd string, middle finger on the 4th fret of the 2nd string.' },
      { q: 'How is C minor different from C major?', a: 'Only the third changes. C major has E natural (a major third); C minor has E♭ (a minor third). The root and fifth are the same.' },
      { q: 'What pieces are famous in C minor?', a: 'Beethoven\'s Symphony No. 5, his "Pathétique" Sonata Op. 13, his Piano Concerto No. 3, and Mozart\'s Piano Concerto K. 491 are all in C minor. The key has a long association with serious, dramatic, often heroic material.' },
    ],
  },

  'f-minor': {
    publishAt: '2020-01-01',
    intro:
      'F minor is one of the darker minor keys, its four-flat signature giving it a distinctly heavy, melancholic colour. The chord contains F, A♭, and C. Beethoven\'s "Appassionata" Sonata, Chopin\'s F minor Ballade, and Brahms\' F minor Piano Sonata are all anchored here. F minor is the relative minor of A♭ major, and the two keys share their key signature.',
    intervals: [
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'C', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of F minor (= A♭ major)', slug: 'a-flat-major', kind: 'key' },
      { label: 'Parallel major: F major', slug: 'f-major', kind: 'chord' },
      { label: 'Relative major: A♭ major', slug: 'a-flat-major', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'a-flat-major', 'c-minor', 'b-flat-minor', 'e-flat-major'],
    commonMistakes:
      'F minor\'s third is A♭, not A. The key signature carries the flat implicitly, but if you\'re reading lead sheets without a key signature you have to know it belongs there. On piano, the chord falls under the hand as white-black-white (F, then the black key just left of A, then C). On guitar, F minor is most commonly an E-shape barre at the 1st fret — and like F major, it\'s a famous early-stage hurdle for barre technique.',
    inProgressions:
      'F minor is the i chord in F minor, the vi chord in A♭ major, the ii chord in E♭ major, and the iii in D♭ major. Beethoven\'s "Appassionata" Sonata Op. 57 builds entire movements around the F minor triad; the opening of Chopin\'s F minor Ballade Op. 52 is one of the most famous moments in the piano repertoire. The progression Fm-A♭-E♭-B♭ (i-III-VII-IV) underlies a lot of folk and metal music.',
    faq: [
      { q: 'What notes are in an F minor chord?', a: 'F minor contains three notes: F (the root), A♭ (the minor third), and C (the perfect fifth).' },
      { q: 'How do you play F minor on guitar?', a: 'Most commonly an E-shape barre at the 1st fret: index finger across all six strings on the 1st fret, ring finger on the 3rd fret of the 5th string, pinky on the 3rd fret of the 4th string. The 3rd-string note (A♭) sounds from the barre alone.' },
      { q: 'What\'s the difference between F minor and F major?', a: 'Only the third changes. F major has A natural; F minor has A♭. The root (F) and fifth (C) are the same in both.' },
      { q: 'What pieces are famous in F minor?', a: 'Beethoven\'s "Appassionata" Sonata Op. 57, Chopin\'s Ballade No. 4 Op. 52, his Fantaisie Op. 49, and Brahms\' Piano Sonata No. 3 Op. 5 are all in F minor. The key carries strong associations with passion, struggle, and melancholy.' },
    ],
  },

  'b-flat-minor': {
    publishAt: '2020-01-01',
    intro:
      'B♭ minor is a five-flat key with a famously dark, brooding colour. The chord contains B♭, D♭, and F. Tchaikovsky\'s First Piano Concerto opens in B♭ minor (before unexpectedly modulating to D♭ major in the famous theme), and Chopin\'s "Funeral March" Sonata Op. 35 is centred here. The relative major is D♭ major.',
    intervals: [
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'F', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of B♭ minor (= D♭ major)', slug: 'd-flat-major', kind: 'key' },
      { label: 'Parallel major: B♭ major', slug: 'b-flat-major', kind: 'chord' },
      { label: 'Relative major: D♭ major', slug: 'd-flat-major', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'd-flat-major', 'f-minor', 'e-flat-minor', 'a-flat-major'],
    commonMistakes:
      'Both the root and the third are flat: B♭ and D♭. The fifth is plain F. The most common error is reading the third as D natural, which would voice a B♭ major chord (B♭-D-F), opposite-colour from B♭ minor. The five-flat key signature has B♭, E♭, A♭, D♭, G♭ in that order; D♭ is the third in the order of flats, which can be a useful mnemonic for placing it correctly.',
    inProgressions:
      'B♭ minor is the i chord in B♭ minor, the vi chord in D♭ major (the relative-major position), the ii in A♭ major, and the iii in G♭ major. Tchaikovsky\'s Piano Concerto No. 1 opens with crashing B♭ minor chords before pivoting to its famous D♭ major theme — a textbook relative-key relationship. Chopin\'s Op. 35 "Funeral March" Sonata is one of the most iconic pieces in B♭ minor.',
    faq: [
      { q: 'What notes are in a B♭ minor chord?', a: 'B♭ minor contains three notes: B♭ (the root), D♭ (the minor third), and F (the perfect fifth).' },
      { q: 'How do you play B♭ minor on guitar?', a: 'Most commonly an A-shape barre at the 1st fret: index finger across strings 5–1 on the 1st fret, ring finger on the 3rd fret of the 4th string, pinky on the 3rd fret of the 3rd string, middle finger on the 2nd fret of the 2nd string.' },
      { q: 'Is B♭ minor the same as A♯ minor?', a: 'They\'re enharmonic — same three pitches. A♯ minor would have seven sharps (including F𝄪 in some contexts); B♭ minor (five flats) is the standard spelling. A♯ minor only appears inside C♯ major\'s key area.' },
      { q: 'What pieces are famous in B♭ minor?', a: 'Tchaikovsky\'s Piano Concerto No. 1 (opening), Chopin\'s "Funeral March" Sonata Op. 35, his Scherzo No. 2 Op. 31, and Rachmaninoff\'s Piano Sonata No. 2 are all in B♭ minor. The key carries a particularly dark, funereal association.' },
    ],
  },

  'e-flat-minor': {
    publishAt: '2020-01-01',
    intro:
      'E♭ minor is a six-flat key — a near-extreme on the flat side of the circle of fifths. The chord contains E♭, G♭, and B♭. The key shows up most often as a passing tonality in chromatic music or as the relative minor of G♭ major. Bach\'s Well-Tempered Clavier devotes a prelude and fugue to E♭ minor in each book; Tchaikovsky used it for parts of the Pathétique Symphony.',
    intervals: [
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Eb', to: 'Bb', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of E♭ minor (= G♭ major)', slug: 'g-flat-major', kind: 'key' },
      { label: 'Parallel major: E♭ major', slug: 'e-flat-major', kind: 'chord' },
      { label: 'Enharmonic: D♯ minor', slug: 'd-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['e-flat-major', 'g-flat-major', 'b-flat-minor', 'a-flat-minor', 'd-sharp-minor'],
    commonMistakes:
      'Two notes carry flats: E♭ and G♭ in the chord, plus B♭ as the fifth — three of the six flats in the key signature. The most common error is reading G♭ as G natural, which produces an E♭ major chord. On guitar, E♭ minor is almost always a 6th-fret A-shape barre or an 11th-fret E-shape barre. The six-flat key signature is dense enough that hand-writing the flats (B E A D G C in order) before reading is normal practice.',
    inProgressions:
      'E♭ minor is the i chord in E♭ minor, the vi chord in G♭ major (the relative-major), the ii in D♭ major, and the iii in C♭ major (theoretical). Composers occasionally use E♭ minor for its specific dark colour — Tchaikovsky\'s Pathétique Symphony No. 6 has extensive E♭ minor passages. The enharmonic D♯ minor (six sharps) covers the same harmonic territory in sharp-key music.',
    faq: [
      { q: 'What notes are in an E♭ minor chord?', a: 'E♭ minor contains three notes: E♭ (the root), G♭ (the minor third), and B♭ (the perfect fifth).' },
      { q: 'Is E♭ minor the same as D♯ minor?', a: 'Yes, enharmonically — same three pitches. E♭ minor has six flats; D♯ minor has six sharps. Composers choose between them based on surrounding harmony.' },
      { q: 'How do you play E♭ minor on guitar?', a: 'Most commonly an A-shape barre at the 6th fret: index finger across strings 5–1 on the 6th fret, ring finger on the 8th fret of the 4th string, pinky on the 8th fret of the 3rd string, middle finger on the 7th fret of the 2nd string.' },
      { q: 'What\'s the relative major of E♭ minor?', a: 'G♭ major — both keys share the same six-flat signature. E♭ minor is built on the 6th scale degree of G♭ major.' },
    ],
  },

  'a-flat-minor': {
    publishAt: '2020-01-01',
    intro:
      'A♭ minor is a seven-flat key — the maximum number of flats in a standard key signature. The chord contains A♭, C♭, and E♭. In practice, A♭ minor is almost always rewritten as G♯ minor (five sharps), which is much easier to read. The chord still appears in chromatic passages within flat-key music — Chopin and Liszt both occasionally voice it as A♭ minor for spelling consistency with surrounding harmony.',
    intervals: [
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
      { from: 'Cb', to: 'Eb', name: 'major 3rd', semitones: 4 },
      { from: 'Ab', to: 'Eb', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: G♯ minor', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Parallel major: A♭ major', slug: 'a-flat-major', kind: 'chord' },
      { label: 'Relative major: C♭ major (= B major)', slug: 'b-major', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'g-sharp-minor', 'e-flat-minor', 'd-flat-major', 'b-major'],
    commonMistakes:
      'The third is C♭, which is enharmonic to B natural. Reading it as B is technically wrong inside an A♭ minor context — the seven-letter rule requires the C letter — but the pitch is identical. Most musicians will encounter this chord as G♯ minor (G♯-B-D♯) instead, which spells exactly the same way in pitch class but uses simpler accidentals.',
    inProgressions:
      'A♭ minor rarely appears as a tonic key; it shows up most often as the iv chord of E♭ minor, the ii chord of G♭ major (theoretical), or as a chromatic passing chord in late-Romantic harmony. When composers want this chord in practice, they typically write it as G♯ minor unless the surrounding key signature already has many flats — in which case A♭ minor maintains spelling consistency.',
    faq: [
      { q: 'What notes are in an A♭ minor chord?', a: 'A♭ minor contains three notes: A♭ (the root), C♭ (the minor third — same pitch as B), and E♭ (the perfect fifth).' },
      { q: 'Is A♭ minor the same as G♯ minor?', a: 'Yes, enharmonically — same three pitches. A♭ minor has seven flats; G♯ minor has five sharps. G♯ minor is the standard spelling in published music; A♭ minor appears only in special chromatic contexts.' },
      { q: 'Why is the third C♭ instead of B?', a: 'The minor scale uses each of the seven letters exactly once. The A♭ minor scale runs A♭-B♭-C♭-D♭-E♭-F♭-G♭ — using A-B-C-D-E-F-G in order. Calling the third "B" would skip the C letter and use B twice (also as B♭).' },
      { q: 'When would I see A♭ minor in real music?', a: 'Rarely as a tonic, but occasionally inside late-Romantic chromatic passages or as a iv chord in E♭ minor. Most working musicians will only meet this spelling when reading dense Chopin or Liszt; pop charts always use G♯ minor instead.' },
    ],
  },

  'c-sharp-minor': {
    publishAt: '2020-01-01',
    intro:
      'C♯ minor is a four-sharp key famous for its association with darker, more contemplative music. The chord contains C♯, E, and G♯. Beethoven\'s "Moonlight" Sonata is in C♯ minor — its opening Adagio is among the most recognised pieces in the piano repertoire. Rachmaninoff\'s C♯ minor Prelude is another giant of the literature; the key carries strong associations with introspection, romance, and mystery.',
    intervals: [
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'G#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of C♯ minor (= E major)', slug: 'e-major', kind: 'key' },
      { label: 'Parallel major: C♯ major', slug: 'c-sharp-major', kind: 'chord' },
      { label: 'Relative major: E major', slug: 'e-major', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-major', 'e-major', 'g-sharp-minor', 'f-sharp-minor', 'a-major'],
    commonMistakes:
      'C♯ minor\'s root and fifth are both sharp (C♯ and G♯); the third is plain E. The most common error is reading G♯ as G natural, which produces a C♯ diminished chord (C♯-E-G), a much more dissonant sound. On guitar, C♯ minor is most commonly an A-shape barre at the 4th fret. The four-sharp key signature is dense enough that beginners often miss the G♯ when sight-reading; double-checking the dominant is a good habit.',
    inProgressions:
      'C♯ minor is the i chord in C♯ minor, the vi chord in E major (the relative-major position), the ii in B major, and the iii in A major. Beethoven\'s "Moonlight" Sonata Op. 27 No. 2 builds its first movement around continuous arpeggiated C♯ minor chords; the texture defined an entire era of piano writing. Rachmaninoff\'s Prelude in C♯ minor Op. 3 No. 2 is another defining moment in Romantic piano literature.',
    faq: [
      { q: 'What notes are in a C♯ minor chord?', a: 'C♯ minor contains three notes: C♯ (the root), E (the minor third), and G♯ (the perfect fifth).' },
      { q: 'How do you play C♯ minor on guitar?', a: 'Most commonly an A-shape barre at the 4th fret: index finger across strings 5–1 on the 4th fret, ring finger on the 6th fret of the 4th string, pinky on the 6th fret of the 3rd string, middle finger on the 5th fret of the 2nd string.' },
      { q: 'How is C♯ minor different from C♯ major?', a: 'Only the third changes. C♯ major has E♯ (the major third, same pitch as F); C♯ minor has E natural (the minor third). The root (C♯) and fifth (G♯) are the same.' },
      { q: 'What pieces are famous in C♯ minor?', a: 'Beethoven\'s "Moonlight" Sonata Op. 27 No. 2, Rachmaninoff\'s Prelude Op. 3 No. 2, his Piano Concerto No. 2 (which begins on a C♯ minor pivot), and Chopin\'s C♯ minor Waltz Op. 64 No. 2 are all anchored here.' },
    ],
  },

  'f-sharp-minor': {
    publishAt: '2020-01-01',
    intro:
      'F♯ minor is a three-sharp key (F♯, C♯, G♯) with a brooding, introspective character. The chord contains F♯, A, and C♯. The key has a long Romantic-era pedigree — Bach\'s WTC, Mendelssohn\'s "Italian" Symphony finale, and Tchaikovsky\'s First Piano Concerto cadenza all sit in F♯ minor. The relative major is A major.',
    intervals: [
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'C#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of F♯ minor (= A major)', slug: 'a-major', kind: 'key' },
      { label: 'Parallel major: F♯ major', slug: 'f-sharp-major', kind: 'chord' },
      { label: 'Relative major: A major', slug: 'a-major', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-major', 'a-major', 'c-sharp-minor', 'd-major', 'b-minor'],
    commonMistakes:
      'F♯ minor\'s root and fifth are sharp (F♯ and C♯); the third (A) is plain. The most common slip is reading F♯ as F natural, which voices an F major chord — wrong root, wrong colour. On guitar, F♯ minor is most often an E-minor-shape barre at the 2nd fret: index across all strings on fret 2, ring and pinky at fret 4 on strings 5 and 4. The three-sharp signature is generally readable but missing the C♯ on neighbouring chords is a common error in F♯ minor literature.',
    inProgressions:
      'F♯ minor is the i chord in F♯ minor, the vi chord in A major (the relative-major position), the ii in E major, and the iii in D major. The progression F♯m–D–A–E (i–VI–III–VII in F♯ minor / vi–IV–I–V in A major) is the harmonic spine of countless pop songs. Mendelssohn\'s "Italian" Symphony finale is in F♯ minor; the brooding opening contrasts sharply with the sunny A major of the first three movements.',
    faq: [
      { q: 'What notes are in an F♯ minor chord?', a: 'F♯ minor contains three notes: F♯ (the root), A (the minor third), and C♯ (the perfect fifth).' },
      { q: 'How do you play F♯ minor on guitar?', a: 'Most commonly an E-minor-shape barre at the 2nd fret: index finger across all six strings on the 2nd fret, ring finger on the 4th fret of the 5th string, pinky on the 4th fret of the 4th string. The 3rd and 2nd strings sound A and C♯ from the barre alone.' },
      { q: 'How is F♯ minor different from F♯ major?', a: 'Only the third changes. F♯ major has A♯; F♯ minor has A natural. The root (F♯) and fifth (C♯) are the same in both.' },
      { q: 'What\'s the relative major of F♯ minor?', a: 'A major — both keys share the same three-sharp signature (F♯, C♯, G♯), and F♯ minor is built on the 6th scale degree of A major.' },
    ],
  },

  'g-sharp-minor': {
    publishAt: '2020-01-01',
    intro:
      'G♯ minor is a five-sharp key — the relative minor of B major. The chord contains G♯, B, and D♯. The key shows up in Beethoven (the development sections of the "Hammerklavier" Sonata), in Liszt\'s Hungarian Rhapsody No. 2, and in dense Romantic chromatic writing. G♯ minor is the enharmonic of A♭ minor; G♯ is preferred in published literature for its more navigable five-sharp signature.',
    intervals: [
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'D#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of G♯ minor (= B major)', slug: 'b-major', kind: 'key' },
      { label: 'Enharmonic: A♭ minor', slug: 'a-flat-minor', kind: 'chord' },
      { label: 'Relative major: B major', slug: 'b-major', kind: 'chord' },
    ],
    relatedChords: ['b-major', 'a-flat-minor', 'c-sharp-minor', 'd-sharp-minor', 'e-major'],
    commonMistakes:
      'G♯ minor\'s root (G♯) and fifth (D♯) are both sharp; the third (B) is plain. The most common error is reading D♯ as D natural, which produces a G♯ diminished chord. On guitar, G♯ minor is most often an E-minor-shape barre at the 4th fret. The five-sharp key signature has F♯, C♯, G♯, D♯, A♯ in that order; D♯ is the fourth in the order of sharps, useful for placement when sight-reading.',
    inProgressions:
      'G♯ minor is the i chord in G♯ minor, the vi chord in B major (the relative-major position), the ii in F♯ major, and the iii in E major. Liszt\'s Hungarian Rhapsody No. 2 in C♯ minor uses G♯ minor as a primary contrast key throughout. The progression G♯m–E–B–F♯ (i–VI–III–VII) is a common Romantic-era cadential cycle.',
    faq: [
      { q: 'What notes are in a G♯ minor chord?', a: 'G♯ minor contains three notes: G♯ (the root), B (the minor third), and D♯ (the perfect fifth).' },
      { q: 'Is G♯ minor the same as A♭ minor?', a: 'Yes, enharmonically — same three pitches. G♯ minor has five sharps; A♭ minor has seven flats. G♯ minor is preferred in nearly all published music.' },
      { q: 'How do you play G♯ minor on guitar?', a: 'Most commonly an E-minor-shape barre at the 4th fret: index finger across all six strings on the 4th fret, ring finger on the 6th fret of the 5th string, pinky on the 6th fret of the 4th string.' },
      { q: 'What\'s the relative major of G♯ minor?', a: 'B major — both keys share the five-sharp signature, and G♯ minor is built on the 6th scale degree of B major.' },
    ],
  },

  'd-sharp-minor': {
    publishAt: '2020-01-01',
    intro:
      'D♯ minor is a six-sharp key — enharmonic to E♭ minor (six flats). The chord contains D♯, F♯, and A♯. D♯ minor is the relative minor of F♯ major and is most often encountered inside that key area or in the dense chromatic writing of late-Romantic composers. Bach gave it a prelude and fugue in the Well-Tempered Clavier; it\'s a more common spelling than its scarcity in modern music suggests.',
    intervals: [
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'A#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Key of D♯ minor (= F♯ major)', slug: 'f-sharp-major', kind: 'key' },
      { label: 'Enharmonic: E♭ minor', slug: 'e-flat-minor', kind: 'chord' },
      { label: 'Relative major: F♯ major', slug: 'f-sharp-major', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-major', 'e-flat-minor', 'g-sharp-minor', 'a-sharp-minor', 'b-major'],
    commonMistakes:
      'All three notes carry sharps: D♯, F♯, A♯. The most common error is reading any of them as a natural — which produces a different chord entirely (D-F-A is D minor; D♯-F♯-A is D♯ diminished). The six-sharp key signature is dense; sight-readers benefit from writing the sharps F C G D A E in order on a scrap before tackling D♯ minor literature. On guitar, D♯ minor is almost always written as E♭ minor for chord-chart purposes.',
    inProgressions:
      'D♯ minor is the i chord in D♯ minor, the vi chord in F♯ major (the relative-major position), the ii in C♯ major, and the iii in B major. The key signature\'s density means D♯ minor mostly appears inside F♯ major works (where it doesn\'t need a separate key change). The enharmonic E♭ minor (six flats) covers the same harmonic territory in flat-key music.',
    faq: [
      { q: 'What notes are in a D♯ minor chord?', a: 'D♯ minor contains three notes: D♯ (the root), F♯ (the minor third), and A♯ (the perfect fifth).' },
      { q: 'Is D♯ minor the same as E♭ minor?', a: 'Yes, enharmonically — same three pitches. D♯ minor has six sharps; E♭ minor has six flats. They\'re equally valid; composers pick one based on surrounding harmony.' },
      { q: 'When would I see D♯ minor in a score?', a: 'Most often inside F♯ major key areas, where D♯ minor functions as the vi chord. Bach\'s WTC has preludes and fugues in D♯ minor; outside that systematic context, modern composers usually pick E♭ minor.' },
      { q: 'What\'s the relative major of D♯ minor?', a: 'F♯ major — both keys share the six-sharp signature, and D♯ minor is built on the 6th scale degree of F♯ major.' },
    ],
  },

  'a-sharp-minor': {
    publishAt: '2020-01-01',
    intro:
      'A♯ minor is a seven-sharp key — every letter in the scale carries a sharp. The chord contains A♯, C♯, and E♯. A♯ minor almost never appears as a tonic key; it\'s the relative minor of C♯ major (which itself is rarely written, with composers preferring D♭ major). When the chord A♯-C♯-E♯ does need spelling, it\'s typically inside a C♯ major key area; otherwise B♭ minor (five flats) covers the same pitch material with a much friendlier signature.',
    intervals: [
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'E#', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: B♭ minor', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Relative major: C♯ major', slug: 'c-sharp-major', kind: 'chord' },
      { label: 'Parallel major: A♯ major (theoretical)', slug: 'b-flat-major', kind: 'chord' },
    ],
    relatedChords: ['b-flat-minor', 'c-sharp-major', 'd-sharp-minor', 'g-sharp-minor', 'd-flat-major'],
    commonMistakes:
      'The fifth is E♯, which is enharmonic to F natural. Reading it as F is technically wrong inside an A♯ minor context — the seven-letter rule requires the E letter — but the pitch is identical. The chord is almost always notated as B♭ minor in practical music; A♯ minor appears only when surrounding harmony already uses many sharps.',
    inProgressions:
      'A♯ minor is the i chord in A♯ minor (essentially a theoretical key) and the vi chord in C♯ major. Outside Bach\'s WTC and a handful of other systematic explorations, A♯ minor is virtually never used as a tonic. The same chord written as B♭ minor (B♭-D♭-F) covers the same harmonic territory with five flats instead of seven sharps — a much easier reading.',
    faq: [
      { q: 'What notes are in an A♯ minor chord?', a: 'A♯ minor contains three notes: A♯ (the root), C♯ (the minor third), and E♯ (the perfect fifth — same pitch as F).' },
      { q: 'Is A♯ minor the same as B♭ minor?', a: 'Yes, enharmonically — same three pitches. A♯ minor has seven sharps; B♭ minor has five flats. B♭ minor is preferred in nearly all published music.' },
      { q: 'Why is the fifth E♯ instead of F?', a: 'The minor scale uses each of the seven letters exactly once. The A♯ natural minor scale runs A♯-B♯-C♯-D♯-E♯-F♯-G♯ — using A-B-C-D-E-F-G in order. Calling the fifth "F" would skip the letter E entirely.' },
      { q: 'When would I see A♯ minor in real music?', a: 'Almost never as a tonic. It appears inside C♯ major key areas (as the vi chord) or in Bach\'s systematic WTC explorations. Modern composers always use B♭ minor.' },
    ],
  },

  'd-flat-minor': {
    publishAt: '2020-01-01',
    intro:
      'D♭ minor is a deeply theoretical key. Its key signature would require eight flats (including B𝄫, a double-flat), so the chord D♭-F♭-A♭ is essentially never written as a tonic. The same three pitches form C♯ minor (four sharps), which is the standard spelling. D♭ minor appears occasionally in chromatic passages where surrounding harmony is heavily flat-side, but treating it as a real key signature is impractical.',
    intervals: [
      { from: 'Db', to: 'Fb', name: 'minor 3rd', semitones: 3 },
      { from: 'Fb', to: 'Ab', name: 'major 3rd', semitones: 4 },
      { from: 'Db', to: 'Ab', name: 'perfect 5th', semitones: 7 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: C♯ minor', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Parallel major: D♭ major', slug: 'd-flat-major', kind: 'chord' },
      { label: 'Relative major: F♭ major (= E major)', slug: 'e-major', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-minor', 'd-flat-major', 'a-flat-minor', 'b-flat-minor', 'e-major'],
    commonMistakes:
      'The third is F♭, which is enharmonic to E natural. Reading it as E is technically incorrect inside a D♭ minor context — the seven-letter rule requires the F letter — but the pitch is identical. The chord almost never appears in published music as D♭ minor; C♯ minor is the universal practical spelling. Treat D♭ minor as a theoretical curiosity unless you\'re reading deep chromatic Liszt or Wagner.',
    inProgressions:
      'D♭ minor doesn\'t function as a tonic in standard practice. The chord D♭-F♭-A♭ may appear briefly inside D♭ major as a chromatic colour, or as an enharmonic pivot to C♯ minor. The same harmonic content is always available in C♯ minor (four sharps), which composers use instead.',
    faq: [
      { q: 'What notes are in a D♭ minor chord?', a: 'D♭ minor contains three notes: D♭ (the root), F♭ (the minor third — same pitch as E), and A♭ (the perfect fifth).' },
      { q: 'Is D♭ minor the same as C♯ minor?', a: 'Yes, enharmonically — same three pitches. D♭ minor would have eight flats (theoretical); C♯ minor has four sharps. C♯ minor is the only practical spelling.' },
      { q: 'When would I see D♭ minor in real music?', a: 'Essentially never as a tonic. The spelling appears only briefly inside chromatic passages of dense flat-key music — and even then most editors silently respell it as C♯ minor.' },
      { q: 'Why is the third F♭ instead of E?', a: 'The minor scale uses each of the seven letters exactly once. The D♭ natural minor scale would run D♭-E♭-F♭-G♭-A♭-B𝄫-C♭ — using D-E-F-G-A-B-C in order. Calling the third "E" would skip the F letter entirely.' },
    ],
  },

  // ─── Phase 2: diminished triads ───────────────────────────────────────────
  // Two stacked minor 3rds. Most often the vii° of a major key or the ii°
  // of a minor key — both functions point hard toward the tonic and create
  // some of the strongest cadential pull in tonal music.

  'c-diminished': {
    publishAt: '2020-01-01',
    intro:
      'C diminished is built by stacking two minor thirds: C, E♭, G♭. The chord is symmetric in semitones (3 + 3 = 6), and its tritone between root and fifth gives it a distinctly tense, unresolved sound. C° most often appears as the ii° chord of B♭ minor or as a passing chord between diatonic neighbours in flat-side keys.',
    intervals: [
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'Gb', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In B♭ minor (ii° chord)', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Parallel: C major', slug: 'c-major', kind: 'chord' },
      { label: 'Parallel: C minor', slug: 'c-minor', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'c-minor', 'b-flat-minor', 'd-flat-major', 'a-flat-major'],
    commonMistakes:
      'The trap with C diminished is the fifth — G♭, not G natural. Replacing G♭ with G voices a C minor chord (C–E♭–G), a much more stable harmony. The diminished fifth is what gives C° its tritone-driven pull. On guitar there\'s no fully-open voicing; you\'ll usually see a small barre on the upper four strings or a partial three-string voicing.',
    inProgressions:
      'C° is the ii° chord of B♭ minor (where it precedes V = F major and resolves to i = B♭ minor) and a common passing chord between B♭ major and D♭ major in chromatic harmony. Bach uses dim triads constantly as transitional sonorities — they\'re unstable enough to demand resolution but flexible enough to bridge many chord pairs.',
    faq: [
      { q: 'What notes are in a C diminished chord?', a: 'C diminished contains three notes: C (the root), E♭ (the minor third), and G♭ (the diminished fifth).' },
      { q: 'How is C diminished different from C minor?', a: 'Only the fifth changes. C minor (C–E♭–G) has a perfect fifth; C diminished (C–E♭–G♭) lowers that fifth a half step. The result sounds tenser and demands resolution.' },
      { q: 'What does the ° symbol mean?', a: 'The ° (degree sign) is the standard chord-symbol notation for diminished. C° means "C diminished triad"; C°7 means "C diminished seventh."' },
      { q: 'Where does C diminished appear in real music?', a: 'Most commonly as a passing chord in flat-side keys, or as the ii° of B♭ minor leading to F major. It\'s also frequently used as a chromatic neighbour to C major in late-Romantic harmony.' },
    ],
  },

  'c-sharp-diminished': {
    publishAt: '2020-01-01',
    intro:
      'C♯ diminished is the leading-tone (vii°) chord of D major — one of the most common functional roles for any diminished triad. The chord stacks two minor thirds: C♯, E, G. Its tritone between C♯ and G generates strong pull toward D, making C♯° a textbook cadential preparation in D major.',
    intervals: [
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'G', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In D major (vii° chord)', slug: 'd-major', kind: 'chord' },
      { label: 'In B minor (ii° chord)', slug: 'b-minor', kind: 'chord' },
      { label: 'Parallel: C♯ minor', slug: 'c-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'b-minor', 'c-sharp-minor', 'a-major', 'e-major'],
    commonMistakes:
      'C♯° contains C♯ and E natural; the fifth is G natural (not G♯ — that would make a C♯ minor chord). The combination of one sharp (C♯) and two naturals (E, G) is what gives C♯° its specific tritone colour. On piano the chord falls comfortably under the hand: black-white-white starting from C♯.',
    inProgressions:
      'C♯° is the vii° of D major (resolving to D) and the ii° of B minor (resolving through V = F♯ major to i = B minor). In the cadence vii° → I, the root C♯ rises to D, the third E falls or holds, and the fifth G falls to F♯ — the classic leading-tone resolution.',
    faq: [
      { q: 'What notes are in a C♯ diminished chord?', a: 'C♯ diminished contains three notes: C♯ (the root), E (the minor third), and G (the diminished fifth).' },
      { q: 'What key is C♯ diminished from?', a: 'C♯° is the vii° (leading-tone) chord of D major and the ii° chord of B minor. Both keys share the same two-sharp signature.' },
      { q: 'How does C♯ diminished resolve?', a: 'In D major, C♯° resolves to D major (I): C♯ rises to D, E falls or holds, and G drops to F♯. The voice-leading is among the strongest in tonal music.' },
      { q: 'Is C♯ diminished the same as D♭ diminished?', a: 'They\'d be enharmonic in pitch, but D♭° spelling (D♭–F♭–A𝄫) requires a double-flat, so it\'s essentially never written. C♯° is the practical spelling for this chord.' },
    ],
  },

  'd-diminished': {
    publishAt: '2020-01-01',
    intro:
      'D diminished — D, F, A♭ — is the ii° of C minor and a common chromatic passing chord in flat-side keys. The chord stacks two minor thirds with a tritone between root and fifth, producing the unstable, "needs-to-resolve" sound that defines diminished harmony.',
    intervals: [
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'Ab', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In C minor (ii° chord)', slug: 'c-minor', kind: 'chord' },
      { label: 'In E♭ major (vii° chord)', slug: 'e-flat-major', kind: 'chord' },
      { label: 'Parallel: D minor', slug: 'd-minor', kind: 'chord' },
    ],
    relatedChords: ['d-minor', 'c-minor', 'e-flat-major', 'b-flat-major', 'f-major'],
    commonMistakes:
      'The fifth of D° is A♭, not A natural. Replacing A♭ with A makes a D minor chord — much less tense. The chord\'s flat in the middle of two naturals makes it visually distinctive in score; missing the A♭ is the most common reading error in C minor literature, where D° appears constantly as the supertonic chord.',
    inProgressions:
      'D° → G7 → C minor is the classic ii° → V → i cadence in C minor — one of the most common cadential patterns in Baroque and Classical music. Bach uses D° extensively in his C minor preludes and fugues. In E♭ major, D° serves as the vii° leading back to E♭ at section ends.',
    faq: [
      { q: 'What notes are in a D diminished chord?', a: 'D diminished contains three notes: D (the root), F (the minor third), and A♭ (the diminished fifth).' },
      { q: 'What key uses D diminished as ii°?', a: 'C minor — D° → G7 → Cm is one of the most common cadences in Baroque and Classical music in C minor.' },
      { q: 'How is D diminished different from D minor?', a: 'Only the fifth changes. D minor (D–F–A) has a perfect fifth; D diminished (D–F–A♭) lowers that fifth, generating the tritone that drives toward resolution.' },
      { q: 'Where is D diminished used in jazz?', a: 'As the ii of a ii–V–i in C minor, often extended to Dm7♭5 (the half-diminished version). Standards like "Autumn Leaves" use this exact chord at every C-minor section.' },
    ],
  },

  'd-sharp-diminished': {
    publishAt: '2020-01-01',
    intro:
      'D♯ diminished — D♯, F♯, A — is the vii° of E major. The chord\'s tritone (D♯ to A) drives the resolution to E in the strongest cadence available in E major. D♯° appears regularly in any music in E or its relative minor, C♯ minor.',
    intervals: [
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'D#', to: 'A', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In E major (vii° chord)', slug: 'e-major', kind: 'chord' },
      { label: 'In C♯ minor (ii° chord)', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Parallel: E♭ diminished', slug: 'e-flat-major', kind: 'chord' },
    ],
    relatedChords: ['e-major', 'c-sharp-minor', 'b-major', 'a-major', 'f-sharp-minor'],
    commonMistakes:
      'D♯° contains both D♯ and F♯ as sharps but A natural as the fifth. Reading the A as A♯ would make a D♯ minor chord; reading it as A♭ would respell the entire chord enharmonically. The mixed-accidental signature is part of why diminished triads in sharp keys can be tricky to read at sight.',
    inProgressions:
      'D♯° → E (vii° → I) is a textbook cadence in E major. In C♯ minor, D♯° → G♯ → C♯m (ii° → V → i) is the most-common cadential pattern. Beethoven\'s Piano Sonata Op. 14 No. 1 uses D♯° at multiple points to set up the home key.',
    faq: [
      { q: 'What notes are in a D♯ diminished chord?', a: 'D♯ diminished contains three notes: D♯ (the root), F♯ (the minor third), and A (the diminished fifth).' },
      { q: 'What key uses D♯ diminished as vii°?', a: 'E major — D♯° is built on the 7th scale degree of E and resolves cadentially to E major (the I chord).' },
      { q: 'Is D♯ diminished the same as E♭ diminished?', a: 'Enharmonically yes — the pitches sound identical. But E♭° (E♭–G♭–B𝄫) requires a double-flat, so it\'s rarely written. D♯° is the standard spelling.' },
      { q: 'How do you play D♯ diminished on guitar?', a: 'A small partial barre on the middle strings: index finger on the 6th fret of the 4th string (D♯), middle finger on the 7th fret of the 3rd string (A) and 4th-fret stop... typically played as a closed-position 4-string voicing rather than an open chord.' },
    ],
  },

  'e-diminished': {
    publishAt: '2020-01-01',
    intro:
      'E diminished — E, G, B♭ — is the vii° of F major and the ii° of D minor. It\'s one of the more common diminished triads in standard repertoire because both of its parent keys (F major / D minor) appear constantly in classical and folk literature. The single flat (B♭) marks the chord visually in score.',
    intervals: [
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'Bb', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In F major (vii° chord)', slug: 'f-major', kind: 'chord' },
      { label: 'In D minor (ii° chord)', slug: 'd-minor', kind: 'chord' },
      { label: 'Parallel: E major', slug: 'e-major', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'd-minor', 'e-major', 'e-minor', 'b-flat-major'],
    commonMistakes:
      'E° contains E, G, B♭. The most common error is reading B♭ as B natural — which produces an E minor chord (E–G–B). The flat lives implicitly in the F-major key signature; without that signature on lead sheets, E° has to be marked with an explicit flat or the chord-symbol "°" warns the reader.',
    inProgressions:
      'E° → F major (vii° → I) is a textbook cadence. E° → A7 → D minor (ii° → V → i) is the standard minor-key cadence — and one Bach uses constantly in his D-minor literature, including the famous Toccata and Fugue. In jazz, E°7 (the seventh extension) substitutes for A7♭9 in D-minor cadences.',
    faq: [
      { q: 'What notes are in an E diminished chord?', a: 'E diminished contains three notes: E (the root), G (the minor third), and B♭ (the diminished fifth).' },
      { q: 'What key signature uses E diminished?', a: 'F major (one flat: B♭) — E° is built on the 7th degree and resolves to F. D minor uses the same signature; E° is the ii° there.' },
      { q: 'How is E° different from E minor?', a: 'Only the fifth changes. E minor is E–G–B; E° lowers the B to B♭. That single half-step transforms a stable minor chord into an unstable diminished one.' },
      { q: 'Where does E diminished appear in famous music?', a: 'Constantly in Bach\'s D minor works (the Toccata and Fugue, the Chaconne), in Mozart\'s F major piano sonatas, and in folk music throughout the F-major / D-minor zone.' },
    ],
  },

  'f-diminished': {
    publishAt: '2020-01-01',
    intro:
      'F diminished — F, A♭, C♭ — is a chromatic chord rather than a diatonic one. The C♭ (enharmonic to B) gives the chord away as borrowed harmony or a passing chord. F° most often appears as a chromatic neighbour to F major, or briefly as a vii° in G♭ major.',
    intervals: [
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'Cb', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In G♭ major (vii° chord)', slug: 'g-flat-major', kind: 'chord' },
      { label: 'Parallel: F major', slug: 'f-major', kind: 'chord' },
      { label: 'Parallel: F minor', slug: 'f-minor', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'f-minor', 'g-flat-major', 'e-flat-minor', 'd-flat-major'],
    commonMistakes:
      'The fifth is C♭, enharmonic to B natural. In sharp-key contexts, the chord is more often written as F° using B as the fifth letter — strictly speaking that violates the seven-letter rule, but in chord-symbol practice the substitution is common. In flat-key contexts (the chord\'s natural home), C♭ is the proper spelling.',
    inProgressions:
      'F° rarely appears as a tonic; it\'s a chromatic colour chord. The most common contexts are passing harmony between F major and G♭ major, or as a chromatic neighbour to F major in late-Romantic writing. The chord\'s identity depends heavily on its surroundings.',
    faq: [
      { q: 'What notes are in an F diminished chord?', a: 'F diminished contains three notes: F (the root), A♭ (the minor third), and C♭ (the diminished fifth — same pitch as B).' },
      { q: 'Why is the fifth C♭ instead of B?', a: 'The diminished triad uses each of three letters in a stacked-thirds pattern. Starting from F, the letters go F-A-C; the fifth must be the C letter, which is C♭ when lowered a half step from C natural.' },
      { q: 'What key does F diminished come from?', a: 'F° appears most naturally in G♭ major (where it\'s the vii°) and as a chromatic chord in F major. It\'s rarer than the more common diminished triads.' },
      { q: 'Is F diminished the same as F#°?', a: 'No — they\'re different pitch classes. F° is F–A♭–C♭ (= B); F♯° is F♯–A–C. Different chords entirely.' },
    ],
  },

  'f-sharp-diminished': {
    publishAt: '2020-01-01',
    intro:
      'F♯ diminished — F♯, A, C — is the vii° of G major and the ii° of E minor. It\'s one of the most common diminished triads in popular music because both G major and E minor are guitar-friendly keys. The mixed accidentals (one sharp, two naturals) make F♯° visually distinctive.',
    intervals: [
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'C', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In G major (vii° chord)', slug: 'g-major', kind: 'chord' },
      { label: 'In E minor (ii° chord)', slug: 'e-minor', kind: 'chord' },
      { label: 'Parallel: F♯ minor', slug: 'f-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'e-minor', 'f-sharp-minor', 'd-major', 'b-minor'],
    commonMistakes:
      'F♯° contains F♯ (the root) but A and C are both natural. Reading A as A♯ produces an F♯ minor chord; reading C as C♯ produces a different chord again. The sharp-natural-natural pattern is the chord\'s signature visually. On guitar, F♯° is most often a small barre on the upper strings rather than a full chord shape.',
    inProgressions:
      'F♯° → G major (vii° → I) is a strong cadence in G; F♯° → B7 → E minor (ii° → V → i) is the cadence in E minor. The progression Em → F♯° → G major (i → ii° → III in E minor) is a common modal motion in folk and rock.',
    faq: [
      { q: 'What notes are in an F♯ diminished chord?', a: 'F♯ diminished contains three notes: F♯ (the root), A (the minor third), and C (the diminished fifth).' },
      { q: 'What key uses F♯ diminished?', a: 'F♯° is the vii° of G major and the ii° of E minor. Both keys share the same one-sharp signature.' },
      { q: 'How does F♯ diminished resolve?', a: 'In G major, F♯° resolves to G: F♯ rises to G, A holds or rises, C falls to B. The voice-leading is among the strongest cadential motions in tonal music.' },
      { q: 'What\'s the difference between F♯° and F°?', a: 'They\'re different chords entirely. F♯° is F♯–A–C; F° is F–A♭–C♭. The roots are different pitches and the chords belong to different key areas.' },
    ],
  },

  'g-diminished': {
    publishAt: '2020-01-01',
    intro:
      'G diminished — G, B♭, D♭ — is the ii° of F minor and the vii° of A♭ major. It\'s a flat-side diminished triad with two flats stacked on a natural root. The chord\'s tritone (G to D♭) drives strong cadential motion in both parent keys.',
    intervals: [
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'Db', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In A♭ major (vii° chord)', slug: 'a-flat-major', kind: 'chord' },
      { label: 'In F minor (ii° chord)', slug: 'f-minor', kind: 'chord' },
      { label: 'Parallel: G major', slug: 'g-major', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'g-minor', 'f-minor', 'a-flat-major', 'e-flat-major'],
    commonMistakes:
      'G° contains B♭ and D♭ — both flats are essential. The most common error is reading either as natural; B natural makes a G major chord, and D natural makes a G minor chord. The four-flat signature of A♭ major (or F minor) makes this chord visually compact in score, but on lead sheets without a key signature both flats need explicit accidentals.',
    inProgressions:
      'G° → C7 → F minor (ii° → V → i) is the standard cadence in F minor. G° → A♭ (vii° → I) caps cadences in A♭ major. In jazz, G°7 substitutes for C7♭9 in F-minor cadences — an expanded version of the same harmonic logic.',
    faq: [
      { q: 'What notes are in a G diminished chord?', a: 'G diminished contains three notes: G (the root), B♭ (the minor third), and D♭ (the diminished fifth).' },
      { q: 'What key uses G diminished?', a: 'G° is the vii° of A♭ major and the ii° of F minor. Both keys share a four-flat signature.' },
      { q: 'How is G diminished different from G minor?', a: 'Only the fifth changes. G minor is G–B♭–D; G° lowers the D to D♭. The tritone D♭–G generates the chord\'s instability.' },
      { q: 'Where is G diminished used in classical music?', a: 'Bach\'s F-minor and A♭-major works rely on G° as a primary cadential preparation. Mozart\'s K. 397 Fantasia in D minor uses parallel diminished motion; the same logic applies in G°.' },
    ],
  },

  'g-sharp-diminished': {
    publishAt: '2020-01-01',
    intro:
      'G♯ diminished — G♯, B, D — is the vii° of A major and the ii° of F♯ minor. It\'s a common chord in guitar-friendly sharp keys, with one sharp (G♯) on the root and two naturals above. Its tritone (G♯ to D) creates strong pull toward A.',
    intervals: [
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'G#', to: 'D', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In A major (vii° chord)', slug: 'a-major', kind: 'chord' },
      { label: 'In F♯ minor (ii° chord)', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Parallel: G♯ minor', slug: 'g-sharp-minor', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'f-sharp-minor', 'g-sharp-minor', 'e-major', 'd-major'],
    commonMistakes:
      'G♯° has G♯ as the root, then B and D natural. Reading B as B♯ or D as D♯ destroys the diminished quality — turning the chord into G♯ minor or another harmony. The three-sharp signature of A major is dense enough that beginners sometimes apply sharps too liberally; G♯° is a useful reminder that not every note in a sharp key is sharp.',
    inProgressions:
      'G♯° → A major (vii° → I) is the cadence in A major. G♯° → C♯7 → F♯m (ii° → V → i) is the cadence in F♯ minor. Bach uses G♯° in his F♯ minor literature; the chord\'s strong pull toward A also makes it useful as a borrowed leading-tone chord in C♯ minor.',
    faq: [
      { q: 'What notes are in a G♯ diminished chord?', a: 'G♯ diminished contains three notes: G♯ (the root), B (the minor third), and D (the diminished fifth).' },
      { q: 'What key uses G♯ diminished?', a: 'G♯° is the vii° of A major and the ii° of F♯ minor. Both keys share the three-sharp signature.' },
      { q: 'How does G♯ diminished resolve?', a: 'In A major, G♯° resolves to A: G♯ rises to A, B holds or rises, D falls to C♯. The voice-leading is the textbook leading-tone cadence.' },
      { q: 'Is G♯ diminished the same as A♭ diminished?', a: 'Enharmonically yes, but A♭° (A♭–C♭–E𝄫) requires a double-flat, so it\'s rarely written. G♯° is the standard spelling.' },
    ],
  },

  'a-diminished': {
    publishAt: '2020-01-01',
    intro:
      'A diminished — A, C, E♭ — is the ii° of G minor and the vii° of B♭ major. The chord has one flat (E♭) on top of two naturals, a visual signature that makes it easy to recognise in flat-side scores.',
    intervals: [
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'Eb', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In B♭ major (vii° chord)', slug: 'b-flat-major', kind: 'chord' },
      { label: 'In G minor (ii° chord)', slug: 'g-minor', kind: 'chord' },
      { label: 'Parallel: A major', slug: 'a-major', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'a-minor', 'g-minor', 'b-flat-major', 'd-minor'],
    commonMistakes:
      'A° has E♭ as the fifth, not E natural. Reading the fifth as E natural makes an A minor chord — same root, but a stable minor harmony rather than an unstable diminished one. In B♭ major literature, the E♭ is implicit in the key signature; on lead sheets the flat needs to be explicit.',
    inProgressions:
      'A° → D7 → G minor (ii° → V → i) is one of the most-used cadences in Baroque and Classical music in G minor — Mozart\'s G minor symphonies (No. 25 and No. 40) use this pattern repeatedly. In B♭ major, A° → B♭ caps phrases as the leading-tone cadence.',
    faq: [
      { q: 'What notes are in an A diminished chord?', a: 'A diminished contains three notes: A (the root), C (the minor third), and E♭ (the diminished fifth).' },
      { q: 'What key uses A diminished?', a: 'A° is the ii° of G minor and the vii° of B♭ major. Both keys share a two-flat signature.' },
      { q: 'How is A diminished different from A minor?', a: 'Only the fifth changes. A minor is A–C–E; A° is A–C–E♭. The half-step lower fifth is what creates the diminished tritone.' },
      { q: 'Where does A diminished appear in famous music?', a: 'Mozart\'s Symphony No. 40 in G minor uses A° at every cadence. Bach\'s B♭ major preludes use it as the standard leading-tone preparation. It\'s one of the most-played diminished triads in classical literature.' },
    ],
  },

  'a-sharp-diminished': {
    publishAt: '2020-01-01',
    intro:
      'A♯ diminished — A♯, C♯, E — is the vii° of B major and the ii° of G♯ minor. The chord uses two sharps (A♯, C♯) plus a natural fifth (E). It\'s rarer than its enharmonic neighbour B♭° because B major and G♯ minor are themselves less common keys, but the spelling is correct in those contexts.',
    intervals: [
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'A#', to: 'E', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In B major (vii° chord)', slug: 'b-major', kind: 'chord' },
      { label: 'In G♯ minor (ii° chord)', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: B♭ diminished', slug: 'b-flat-diminished', kind: 'chord' },
    ],
    relatedChords: ['b-major', 'g-sharp-minor', 'b-flat-diminished', 'f-sharp-major', 'c-sharp-minor'],
    commonMistakes:
      'A♯° pairs two sharps with a natural fifth — an unusual visual signature that beginners sometimes mis-spell as A♯-C♯-E♯ (which would make a different chord). The B-major key signature provides the sharps automatically; outside that context the chord is more often written as B♭° (Bb-Db-Fb), which uses the same pitches.',
    inProgressions:
      'A♯° → B major (vii° → I) is the cadence in B major. A♯° → D♯7 → G♯m (ii° → V → i) is the cadence in G♯ minor. The chord appears in Beethoven\'s late string quartets and Liszt\'s sharp-key piano writing.',
    faq: [
      { q: 'What notes are in an A♯ diminished chord?', a: 'A♯ diminished contains three notes: A♯ (the root), C♯ (the minor third), and E (the diminished fifth).' },
      { q: 'Is A♯ diminished the same as B♭ diminished?', a: 'Enharmonically yes — same three pitches. A♯° is the spelling inside B major; B♭° is the spelling inside C minor / D♭ major.' },
      { q: 'What key uses A♯ diminished?', a: 'A♯° is the vii° of B major and the ii° of G♯ minor. Both keys share the five-sharp signature.' },
      { q: 'When would I write A♯° instead of B♭°?', a: 'Whenever the surrounding harmony is in B major or G♯ minor — keeping the same accidental family avoids confusing key changes for the reader.' },
    ],
  },

  'b-flat-diminished': {
    publishAt: '2020-01-01',
    intro:
      'B♭ diminished — B♭, D♭, F♭ — is a five-flat chord that appears in dense flat-side music and as a chromatic passing chord. The F♭ (enharmonic to E natural) is the give-away that you\'re in serious flat-key territory: the chord arrives most naturally in C♭ major or as a borrowed harmony in flat-mode literature.',
    intervals: [
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'Fb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'Fb', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In C♭ major (vii° chord) / B major', slug: 'b-major', kind: 'chord' },
      { label: 'Enharmonic: A♯ diminished', slug: 'a-sharp-diminished', kind: 'chord' },
      { label: 'Parallel: B♭ minor', slug: 'b-flat-minor', kind: 'chord' },
    ],
    relatedChords: ['b-flat-minor', 'b-flat-major', 'a-sharp-diminished', 'b-major', 'd-flat-major'],
    commonMistakes:
      'The fifth is F♭, enharmonic to E natural. In chord-symbol practice, B♭° is sometimes written with E as the fifth letter — strictly incorrect by the seven-letter rule, but common on lead sheets. In notated music inside C♭ major, the F♭ spelling preserves consistency with the surrounding flat-side harmony.',
    inProgressions:
      'B♭° most often appears as a chromatic passing chord rather than a primary cadential preparation. In B♭ minor passages it sometimes appears as a chromatic neighbour to the tonic, and in jazz it\'s used as a passing dim on its way to a B♭ major chord (a "i°7 → I" colour effect).',
    faq: [
      { q: 'What notes are in a B♭ diminished chord?', a: 'B♭ diminished contains three notes: B♭ (the root), D♭ (the minor third), and F♭ (the diminished fifth — same pitch as E).' },
      { q: 'Is B♭ diminished the same as A♯ diminished?', a: 'Enharmonically yes — same three pitches, different spellings. B♭° lives in flat keys; A♯° lives in B major / G♯ minor.' },
      { q: 'Why is the fifth F♭ instead of E?', a: 'The diminished triad uses three consecutive odd-numbered letters: B-D-F. The fifth must be on the F letter, which becomes F♭ when lowered a half step.' },
      { q: 'When does B♭ diminished appear in music?', a: 'Mostly as a chromatic passing chord. It\'s rare as a tonal-functional preparation because the F♭ requires entering deep flat-side keys. In jazz it shows up as a passing chord between Am7 and B♭ in F-major progressions.' },
    ],
  },

  'b-diminished': {
    publishAt: '2020-01-01',
    intro:
      'B diminished — B, D, F — is the vii° of C major and the ii° of A minor. As the diminished triad of the most common key in Western music, B° is by far the most-played diminished chord in the literature. All three notes are naturals, making it visually the cleanest dim triad of all twelve.',
    intervals: [
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'F', name: 'diminished 5th', semitones: 6 },
    ],
    relatedKeys: [
      { label: 'In C major (vii° chord)', slug: 'c-major', kind: 'chord' },
      { label: 'In A minor (ii° chord)', slug: 'a-minor', kind: 'chord' },
      { label: 'Parallel: B major', slug: 'b-major', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'a-minor', 'b-minor', 'b-major', 'g-major'],
    commonMistakes:
      'B° is all naturals (B–D–F) — no sharps, no flats. The most common error is misreading it as B minor (B–D–F♯) by accidentally adding the sharp. The plain-natural fifth (F) is what creates the diminished tritone B–F. On guitar, B° is rarely played as a full chord shape; it\'s usually a partial three-note voicing on the upper strings.',
    inProgressions:
      'B° → C major (vii° → I) is the textbook leading-tone cadence in C major. B° → E7 → A minor (ii° → V → i) is the textbook minor-key cadence. Bach\'s C major preludes use B° at almost every cadence; Beethoven, Mozart, and Haydn all rely on it as a primary cadential preparation in their C-major literature.',
    faq: [
      { q: 'What notes are in a B diminished chord?', a: 'B diminished contains three notes: B (the root), D (the minor third), and F (the diminished fifth).' },
      { q: 'What key uses B diminished?', a: 'B° is the vii° of C major and the ii° of A minor. Both keys have no sharps or flats; B° also uses no accidentals (all naturals).' },
      { q: 'How is B diminished different from B minor?', a: 'Only the fifth changes. B minor is B–D–F♯; B° is B–D–F. The half-step difference in the fifth turns a stable minor chord into an unstable diminished one.' },
      { q: 'Where does B diminished appear in famous music?', a: 'Constantly throughout C-major literature — Bach\'s C major Prelude WTC I, Mozart\'s C major Sonata K. 545, Beethoven\'s 5th Symphony finale (in C major). It\'s the most-played diminished triad in Western music.' },
    ],
  },

  // ─── Phase 2: augmented triads ────────────────────────────────────────────
  // Two stacked major thirds. Symmetric in 12-tone space — only three
  // unique augmented triads exist (every fourth root inverts to the same
  // chord). Most common as V+ or III+ in harmonic-minor cadences and as a
  // chromatic-mediant colour in late-Romantic harmony.

  'c-augmented': {
    publishAt: '2020-01-01',
    intro:
      'C augmented — C, E, G♯ — stacks two major thirds on top of each other. The chord is symmetric: C+, E+, and A♭+ are all the same three pitches, just inverted. C+ most often appears as the III+ of A harmonic minor or as a chromatic-mediant colour in major-key writing.',
    intervals: [
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'G#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In A harmonic minor (III+)', slug: 'a-minor', kind: 'chord' },
      { label: 'Parallel: C major', slug: 'c-major', kind: 'chord' },
      { label: 'Parallel: C minor', slug: 'c-minor', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'c-minor', 'a-minor', 'e-major', 'a-flat-major'],
    commonMistakes:
      'The fifth is G♯, not G natural. Replacing G♯ with G makes a C major chord — a completely different harmonic colour. The augmented fifth is what creates the chord\'s "floating," unresolved sound. On piano, C+ is white-white-black; on guitar it\'s typically a small voicing on three strings, since the augmented fifth doesn\'t fit any standard barre shape.',
    inProgressions:
      'In A harmonic minor, C+ functions as the III+ chord: an augmented colour created by raising the leading tone (G♯ instead of G). The progression Am → C+ → F (i → III+ → VI) is a common Romantic-era turn. The Beatles\' "Oh! Darling" uses an augmented chord at its opening for exactly this kind of suspended, anticipatory feel.',
    faq: [
      { q: 'What notes are in a C augmented chord?', a: 'C augmented contains three notes: C (the root), E (the major third), and G♯ (the augmented fifth).' },
      { q: 'What does the + symbol mean?', a: 'The + sign is the standard chord-symbol notation for augmented. C+ means "C augmented triad." Some scores write it as "C(♯5)" or "Caug" instead.' },
      { q: 'Why are augmented chords symmetric?', a: 'Two stacked major thirds (4 + 4 semitones) total 8 semitones. Adding another major third reaches 12 — back to the root. So C+, E+, and G♯/A♭+ all contain the same three pitches in different inversions.' },
      { q: 'Where does C augmented appear in music?', a: 'In any harmonic-minor music in A minor (III+ chord), in chromatic-mediant Romantic harmony (C → C+ → F), and as a colour chord in jazz piano voicings. The Beatles\' "Oh! Darling" opens with one.' },
    ],
  },

  'd-flat-augmented': {
    publishAt: '2020-01-01',
    intro:
      'D♭ augmented — D♭, F, A — stacks two major thirds. Like all augmented triads it\'s symmetric — D♭+, F+, and A+ share the same three pitches in different inversions. The chord most commonly appears as a chromatic-mediant colour or as the III+ of B♭ harmonic minor.',
    intervals: [
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'Db', to: 'A', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In B♭ harmonic minor (III+)', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Parallel: D♭ major', slug: 'd-flat-major', kind: 'chord' },
      { label: 'Enharmonic: C♯ augmented', slug: 'c-augmented', kind: 'chord' },
    ],
    relatedChords: ['d-flat-major', 'b-flat-minor', 'f-augmented', 'a-augmented', 'g-flat-major'],
    commonMistakes:
      'D♭+ contains D♭, F, and A. The fifth A is natural, not A♭ — replacing A with A♭ makes a D♭ major chord. The mixed accidentals (one flat, two naturals) are the visual signature of D♭+. The chord is enharmonically the same set of pitches as F+ and A+; on a recording you can\'t tell them apart.',
    inProgressions:
      'D♭+ functions as III+ of B♭ harmonic minor. The progression B♭m → D♭+ → G♭ (i → III+ → VI) is a Romantic-era harmonic turn. In jazz, D♭+ also appears as an altered dominant in F minor — a substitute for the V chord with the augmented fifth as a tension to resolve into the i chord.',
    faq: [
      { q: 'What notes are in a D♭ augmented chord?', a: 'D♭ augmented contains three notes: D♭ (the root), F (the major third), and A (the augmented fifth).' },
      { q: 'Is D♭ augmented the same as F augmented?', a: 'Enharmonically yes — same three pitches, just inverted. D♭+, F+, and A+ all contain D♭, F, and A. Which one you write depends on which root sits at the bottom in context.' },
      { q: 'How is D♭+ different from D♭ major?', a: 'Only the fifth changes. D♭ major has A♭ as the fifth; D♭+ raises that fifth to A natural. The augmented fifth gives the chord its floating, unresolved sound.' },
      { q: 'Where does D♭ augmented appear in music?', a: 'In B♭ minor harmonic-minor passages (as III+), in chromatic-mediant motion in flat-side keys, and as an altered dominant in jazz voicings. It\'s less common than C+ or A+ but theoretically equivalent.' },
    ],
  },

  'd-augmented': {
    publishAt: '2020-01-01',
    intro:
      'D augmented — D, F♯, A♯ — stacks two major thirds. The chord is part of the symmetric augmented triad family; D+, F♯+, and A♯+ all spell the same three pitches in different inversions. D+ functions as III+ of B harmonic minor and as a chromatic colour chord in major-key writing.',
    intervals: [
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'A#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In B harmonic minor (III+)', slug: 'b-minor', kind: 'chord' },
      { label: 'Parallel: D major', slug: 'd-major', kind: 'chord' },
      { label: 'Enharmonic: F♯ augmented', slug: 'f-sharp-major', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'b-minor', 'f-sharp-major', 'a-sharp-diminished', 'g-major'],
    commonMistakes:
      'The fifth of D+ is A♯, not A natural. The chord stacks a major third on top of D-F♯ to land on A♯. Replacing A♯ with A makes a D major chord — same root, but a stable major harmony rather than the augmented colour. The two-sharp pattern (F♯, A♯) is the chord\'s key signature inside D-major contexts.',
    inProgressions:
      'D+ functions as III+ of B harmonic minor: Bm → D+ → G is i → III+ → VI. In major-key writing, D+ often appears as a chromatic-mediant approach to G major or B♭ major. Jazz uses it as an altered dominant in G minor cadences.',
    faq: [
      { q: 'What notes are in a D augmented chord?', a: 'D augmented contains three notes: D (the root), F♯ (the major third), and A♯ (the augmented fifth).' },
      { q: 'Is D augmented the same as F♯ augmented?', a: 'Enharmonically yes — same three pitches in different inversions. D+, F♯+, and A♯+ are all the same chord in pitch class.' },
      { q: 'How does D augmented resolve?', a: 'In B minor, D+ resolves to G major (III+ → VI) by lowering the A♯ to A or B. In major-key writing, D+ often acts as a chromatic preparation for G major.' },
      { q: 'What\'s the difference between D+ and D major?', a: 'Only the fifth changes. D major is D–F♯–A; D+ raises the A to A♯. That single semitone shift turns a stable major chord into an unstable augmented one.' },
    ],
  },

  'e-flat-augmented': {
    publishAt: '2020-01-01',
    intro:
      'E♭ augmented — E♭, G, B — stacks two major thirds. Like all augmented triads, E♭+ is symmetric and shares its three pitches with G+ and B+ in different inversions. The chord most often appears as III+ of C harmonic minor or as a chromatic colour in flat-side keys.',
    intervals: [
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'Eb', to: 'B', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In C harmonic minor (III+)', slug: 'c-minor', kind: 'chord' },
      { label: 'Parallel: E♭ major', slug: 'e-flat-major', kind: 'chord' },
      { label: 'Enharmonic: G augmented', slug: 'g-augmented', kind: 'chord' },
    ],
    relatedChords: ['e-flat-major', 'c-minor', 'g-augmented', 'b-augmented', 'a-flat-major'],
    commonMistakes:
      'E♭+ has E♭ and G as the lower notes (the same as E♭ major), but the fifth is B natural — not B♭. Replacing B with B♭ makes an E♭ major chord. The chord\'s mix of one flat and two naturals (B is the natural here) is unusual in flat-key contexts and visually distinctive.',
    inProgressions:
      'E♭+ functions as III+ of C harmonic minor — the III chord raised by the harmonic-minor leading-tone (B instead of B♭). The progression Cm → E♭+ → A♭ (i → III+ → VI) is a common Romantic-era turn. Mahler used augmented sonorities like this constantly.',
    faq: [
      { q: 'What notes are in an E♭ augmented chord?', a: 'E♭ augmented contains three notes: E♭ (the root), G (the major third), and B (the augmented fifth).' },
      { q: 'Is E♭ augmented the same as G augmented?', a: 'Enharmonically yes — same three pitches, different roots. E♭+, G+, and B+ all share E♭, G, and B in pitch.' },
      { q: 'How is E♭+ different from E♭ major?', a: 'Only the fifth changes. E♭ major has B♭ as the fifth; E♭+ raises that fifth to B natural. The half-step shift creates the augmented colour.' },
      { q: 'Where does E♭ augmented appear in music?', a: 'In C minor harmonic-minor cadences (as III+), in chromatic-mediant motion in flat keys, and in late-Romantic harmony as a colour chord. Mahler\'s symphonies use augmented triads constantly.' },
    ],
  },

  'e-augmented': {
    publishAt: '2020-01-01',
    intro:
      'E augmented — E, G♯, B♯ — stacks two major thirds. The B♯ (enharmonic to C natural) is the chord\'s tell that you\'re in serious sharp-key territory. E+ functions as III+ of C♯ harmonic minor and as a chromatic colour chord in A major or E major.',
    intervals: [
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'B#', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'B#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In C♯ harmonic minor (III+)', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Parallel: E major', slug: 'e-major', kind: 'chord' },
      { label: 'Enharmonic: A♭ augmented', slug: 'a-flat-augmented', kind: 'chord' },
    ],
    relatedChords: ['e-major', 'c-sharp-minor', 'g-sharp-minor', 'a-flat-augmented', 'a-major'],
    commonMistakes:
      'The fifth is B♯, enharmonic to C natural. Reading it as C is technically wrong inside a sharp-key context but the pitch is identical. In jazz lead-sheet practice the chord is sometimes written E+ with C as the fifth; in classical notation B♯ is the proper spelling inside C♯-minor key areas.',
    inProgressions:
      'E+ functions as III+ of C♯ harmonic minor — the natural minor III chord raised by the harmonic-minor leading-tone B♯. The progression C♯m → E+ → A (i → III+ → VI) is a classic Romantic-era turn. Beethoven\'s "Moonlight" Sonata uses augmented sonorities for similar dramatic colour.',
    faq: [
      { q: 'What notes are in an E augmented chord?', a: 'E augmented contains three notes: E (the root), G♯ (the major third), and B♯ (the augmented fifth — same pitch as C).' },
      { q: 'Why is the fifth B♯ instead of C?', a: 'The augmented triad uses each of three letters in a stacked-thirds pattern: E-G-B. The fifth must sit on the B letter, which becomes B♯ when raised a half step from B natural.' },
      { q: 'Is E augmented the same as A♭ augmented?', a: 'Enharmonically yes — same three pitches, different roots. E+, G♯+, and B♯+ (= C+) all share E, G♯, and C in pitch.' },
      { q: 'How does E augmented resolve?', a: 'In C♯ minor, E+ resolves to A major (III+ → VI). In E major, E+ often acts as a chromatic neighbour to the tonic, with the augmented fifth resolving up to C♯ (the sixth scale degree).' },
    ],
  },

  'f-augmented': {
    publishAt: '2020-01-01',
    intro:
      'F augmented — F, A, C♯ — stacks two major thirds. F+ is enharmonically the same chord as A+ and D♭+ (or C♯+). The chord most often appears as III+ of D harmonic minor, or as an altered dominant in B♭ major.',
    intervals: [
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'C#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In D harmonic minor (III+)', slug: 'd-minor', kind: 'chord' },
      { label: 'Parallel: F major', slug: 'f-major', kind: 'chord' },
      { label: 'Enharmonic: A augmented', slug: 'a-augmented', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'd-minor', 'a-augmented', 'd-flat-augmented', 'b-flat-major'],
    commonMistakes:
      'F+ has F and A as the lower notes (same as F major) but the fifth is C♯, not C natural. The mix of two naturals and one sharp is unusual in flat-key contexts. Replacing C♯ with C makes an F major chord — the augmented colour disappears.',
    inProgressions:
      'F+ functions as III+ of D harmonic minor: Dm → F+ → B♭ (i → III+ → VI) is a common minor-key colour cadence. In B♭ major, F+ acts as an altered dominant — instead of resolving F → B♭ with a perfect fifth, the augmented fifth (C♯) creates extra tension before resolving to D in the tonic chord.',
    faq: [
      { q: 'What notes are in an F augmented chord?', a: 'F augmented contains three notes: F (the root), A (the major third), and C♯ (the augmented fifth).' },
      { q: 'Is F augmented the same as A augmented?', a: 'Enharmonically yes — same three pitches in different inversions. F+, A+, and D♭+ all spell F, A, and C♯ (= D♭) in pitch class.' },
      { q: 'How does F augmented resolve?', a: 'In D minor, F+ resolves to B♭ major (III+ → VI). As an altered V in B♭ major, F+ resolves to B♭ with the augmented fifth (C♯) leading up to D in the tonic.' },
      { q: 'What\'s the difference between F+ and F major?', a: 'Only the fifth changes. F major is F–A–C; F+ raises the C to C♯. The half-step shift creates the augmented fifth and the chord\'s floating, unresolved sound.' },
    ],
  },

  'g-flat-augmented': {
    publishAt: '2020-01-01',
    intro:
      'G♭ augmented — G♭, B♭, D — stacks two major thirds. The chord is enharmonic to F♯+ (and to A♯+/B♭+, D+ in inversion). G♭+ appears in flat-side music as a chromatic colour chord; it\'s less common than its enharmonic neighbour F♯+ because flat-side augmented harmony is rarer than sharp-side.',
    intervals: [
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'Gb', to: 'D', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In E♭ harmonic minor (III+)', slug: 'e-flat-minor', kind: 'chord' },
      { label: 'Parallel: G♭ major', slug: 'g-flat-major', kind: 'chord' },
      { label: 'Enharmonic: F♯ augmented', slug: 'f-sharp-major', kind: 'chord' },
    ],
    relatedChords: ['g-flat-major', 'e-flat-minor', 'd-flat-major', 'b-flat-augmented', 'd-augmented'],
    commonMistakes:
      'G♭+ has G♭ and B♭ as the lower notes (matching G♭ major) but the fifth is D natural, not D♭. The mix of two flats and one natural is unusual in flat-key writing. Replacing D with D♭ produces a G♭ major chord; the half-step difference is the entire identity of the augmented colour.',
    inProgressions:
      'G♭+ functions as III+ of E♭ harmonic minor: E♭m → G♭+ → C♭ (i → III+ → VI) is a Romantic-era harmonic colour. In modern music, G♭+ also appears in chromatic-mediant progressions where it pivots between flat-side and sharp-side keys.',
    faq: [
      { q: 'What notes are in a G♭ augmented chord?', a: 'G♭ augmented contains three notes: G♭ (the root), B♭ (the major third), and D (the augmented fifth).' },
      { q: 'Is G♭ augmented the same as F♯ augmented?', a: 'Enharmonically yes — same three pitches. G♭+ uses flat-side spelling; F♯+ uses sharp-side. They\'re identical in sound.' },
      { q: 'How is G♭+ different from G♭ major?', a: 'Only the fifth changes. G♭ major has D♭ as the fifth; G♭+ raises that fifth to D natural. The chord then loses its stable major character and gains the augmented "floating" quality.' },
      { q: 'Where does G♭ augmented appear in music?', a: 'In E♭ minor harmonic-minor passages (as III+), in chromatic-mediant motion through flat keys, and as a pivot chord between flat and sharp tonal areas in modulating music.' },
    ],
  },

  'g-augmented': {
    publishAt: '2020-01-01',
    intro:
      'G augmented — G, B, D♯ — stacks two major thirds. G+ is enharmonically equivalent to E♭+ and B+ in inversion. The chord most often functions as III+ of E harmonic minor (where the harmonic-minor leading tone D♯ raises the III chord), or as an altered V in C minor.',
    intervals: [
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'D#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In E harmonic minor (III+)', slug: 'e-minor', kind: 'chord' },
      { label: 'In C minor (V+ altered dominant)', slug: 'c-minor', kind: 'chord' },
      { label: 'Parallel: G major', slug: 'g-major', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'e-minor', 'c-minor', 'e-flat-augmented', 'b-augmented'],
    commonMistakes:
      'G+ has G and B as the lower notes (matching G major) but the fifth is D♯, not D natural. The single sharp on D is the chord\'s identity; replacing it with D natural makes a G major chord. On guitar, G+ is most often a closed-position three-string voicing — the augmented fifth doesn\'t fit any of the standard barre shapes.',
    inProgressions:
      'G+ functions as III+ of E harmonic minor: Em → G+ → C (i → III+ → VI). It also functions as an altered V chord in C minor: G+ → Cm replaces the standard V → i with the augmented fifth (D♯) leading to E♭ in the tonic. The "Bond chord" (the iconic James Bond theme opener) is a similar augmented sonority.',
    faq: [
      { q: 'What notes are in a G augmented chord?', a: 'G augmented contains three notes: G (the root), B (the major third), and D♯ (the augmented fifth).' },
      { q: 'How does G augmented resolve?', a: 'In E minor, G+ resolves to C major (III+ → VI). As V+ in C minor, G+ resolves to C minor with D♯ rising to E♭ in the tonic chord.' },
      { q: 'How is G+ different from G major?', a: 'Only the fifth changes. G major is G–B–D; G+ raises the D to D♯. The half-step shift creates the chord\'s floating, suspended sound.' },
      { q: 'Where does G augmented appear in famous music?', a: 'In E minor harmonic-minor cadences, in C minor altered-dominant progressions (Beethoven uses these constantly in his C-minor works), and in Romantic chromatic harmony as a colour chord.' },
    ],
  },

  'a-flat-augmented': {
    publishAt: '2020-01-01',
    intro:
      'A♭ augmented — A♭, C, E — stacks two major thirds. A♭+ is enharmonically equivalent to C+ and E+ in inversion. The chord functions as III+ of F harmonic minor and as an altered V in D♭ major.',
    intervals: [
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'Ab', to: 'E', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In F harmonic minor (III+)', slug: 'f-minor', kind: 'chord' },
      { label: 'Parallel: A♭ major', slug: 'a-flat-major', kind: 'chord' },
      { label: 'Enharmonic: C augmented', slug: 'c-augmented', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'f-minor', 'c-augmented', 'e-augmented', 'd-flat-major'],
    commonMistakes:
      'A♭+ has A♭ and C as the lower notes (matching A♭ major) but the fifth is E natural, not E♭. The single natural inside a flat-key chord is unusual visually. Replacing E with E♭ makes an A♭ major chord — the augmented colour vanishes.',
    inProgressions:
      'A♭+ functions as III+ of F harmonic minor: Fm → A♭+ → D♭ (i → III+ → VI). In D♭ major, A♭+ acts as an altered V chord, with the augmented fifth (E natural) resolving up to F in the tonic D♭ chord.',
    faq: [
      { q: 'What notes are in an A♭ augmented chord?', a: 'A♭ augmented contains three notes: A♭ (the root), C (the major third), and E (the augmented fifth).' },
      { q: 'Is A♭ augmented the same as C augmented?', a: 'Enharmonically yes — same three pitches in different inversions. A♭+, C+, and E+ all spell A♭, C, and E in pitch class.' },
      { q: 'How is A♭+ different from A♭ major?', a: 'Only the fifth changes. A♭ major has E♭ as the fifth; A♭+ raises that fifth to E natural. The half-step shift creates the augmented fifth and the chord\'s floating quality.' },
      { q: 'Where does A♭ augmented appear in music?', a: 'In F harmonic-minor cadences (as III+), in D♭-major altered-dominant progressions, and in chromatic-mediant motion through flat keys. Chopin\'s F minor literature uses A♭+ regularly.' },
    ],
  },

  'a-augmented': {
    publishAt: '2020-01-01',
    intro:
      'A augmented — A, C♯, E♯ — stacks two major thirds. A+ is enharmonically the same chord as C♯+ and F+ in inversion. The E♯ (= F natural) is the spelling tell that you\'re inside a sharp-key context. A+ functions as III+ of F♯ harmonic minor and as an altered V in D major.',
    intervals: [
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'E#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In F♯ harmonic minor (III+)', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Parallel: A major', slug: 'a-major', kind: 'chord' },
      { label: 'Enharmonic: F augmented', slug: 'f-augmented', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'f-sharp-minor', 'f-augmented', 'd-major', 'd-flat-augmented'],
    commonMistakes:
      'The fifth is E♯, enharmonic to F natural. In jazz chord-symbol practice, the chord is sometimes written A+ with F as the fifth letter — strictly incorrect by the seven-letter rule, but common on lead sheets. In notated classical music inside F♯-minor key areas, E♯ preserves spelling consistency.',
    inProgressions:
      'A+ functions as III+ of F♯ harmonic minor: F♯m → A+ → D (i → III+ → VI). In D major, A+ acts as an altered V chord with E♯ leading up to F♯ in the tonic chord. Schubert\'s late piano sonatas use augmented sonorities like this for chromatic mediant colour.',
    faq: [
      { q: 'What notes are in an A augmented chord?', a: 'A augmented contains three notes: A (the root), C♯ (the major third), and E♯ (the augmented fifth — same pitch as F).' },
      { q: 'Why is the fifth E♯ instead of F?', a: 'The augmented triad stacks thirds on consecutive odd-numbered letters: A-C-E. The fifth must sit on the E letter, which becomes E♯ when raised a half step from E natural.' },
      { q: 'Is A augmented the same as F augmented?', a: 'Enharmonically yes — same three pitches in different inversions. A+, C♯+, and F+ all share A, C♯ (= D♭), and F (= E♯) in pitch class.' },
      { q: 'How does A augmented resolve?', a: 'In F♯ minor, A+ resolves to D major (III+ → VI). In D major, A+ resolves to D with E♯ rising to F♯ — a stronger pull than the standard V → I cadence.' },
    ],
  },

  'b-flat-augmented': {
    publishAt: '2020-01-01',
    intro:
      'B♭ augmented — B♭, D, F♯ — stacks two major thirds. B♭+ is enharmonically the same chord as D+ and F♯+ (= G♭+) in inversion. The chord functions as III+ of G harmonic minor and as an altered V in E♭ major.',
    intervals: [
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'F#', name: 'augmented 5th', semitones: 8 },
    ],
    relatedKeys: [
      { label: 'In G harmonic minor (III+)', slug: 'g-minor', kind: 'chord' },
      { label: 'Parallel: B♭ major', slug: 'b-flat-major', kind: 'chord' },
      { label: 'Enharmonic: D augmented', slug: 'd-augmented', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'g-minor', 'd-augmented', 'g-flat-augmented', 'e-flat-major'],
    commonMistakes:
      'B♭+ has B♭ and D as the lower notes (matching B♭ major) but the fifth is F♯, not F natural. The mix of one flat (B♭) and one sharp (F♯) is unusual visually — most chords use only one accidental type. Replacing F♯ with F makes a B♭ major chord; the augmented colour vanishes.',
    inProgressions:
      'B♭+ functions as III+ of G harmonic minor: Gm → B♭+ → E♭ (i → III+ → VI) is a colour cadence Mozart and Schubert both used in their G-minor works. As an altered V in E♭ major, B♭+ resolves to E♭ with F♯ leading up to G in the tonic.',
    faq: [
      { q: 'What notes are in a B♭ augmented chord?', a: 'B♭ augmented contains three notes: B♭ (the root), D (the major third), and F♯ (the augmented fifth).' },
      { q: 'Is B♭ augmented the same as D augmented?', a: 'Enharmonically yes — same three pitches in different inversions. B♭+, D+, and F♯+ all share B♭, D, and F♯ in pitch class.' },
      { q: 'How is B♭+ different from B♭ major?', a: 'Only the fifth changes. B♭ major is B♭–D–F; B♭+ raises the F to F♯. The half-step shift creates the augmented fifth and the chord\'s suspended quality.' },
      { q: 'Where does B♭ augmented appear in music?', a: 'In G minor harmonic-minor cadences (as III+) — Mozart\'s K. 550 G minor symphony uses similar augmented colours. In E♭ major, B♭+ functions as an altered dominant for a more dramatic resolution to the tonic.' },
    ],
  },

  // ─── Phase 2: diminished 7th chords ───────────────────────────────────────
  // Four notes stacked in minor thirds (3+3+3 = 9 semitones; the missing
  // fourth m3 closes the octave back to the root). Fully symmetric — only
  // three unique dim7 chords exist (every fourth root inverts to the same
  // pitch set). Common as vii°7 in minor keys and as a V7♭9 substitute.

  'c-sharp-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'C♯°7 — C♯, E, G, B♭ — is the vii°7 chord of D minor (and enharmonically the vii°7 of D major when the leading-tone harmony borrows from the parallel minor). The chord stacks three minor thirds, producing a fully symmetric four-note structure; rotating any note to the bass yields E°7, G°7, or B♭°7 — all the same four pitches.',
    intervals: [
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'Bb', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In D minor (vii°7)', slug: 'd-minor', kind: 'chord' },
      { label: 'Parallel: C♯ minor', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: E°7, G°7, B♭°7', slug: 'e-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-diminished', 'd-minor', 'e-diminished-7', 'a-diminished-7', 'b-flat-major'],
    commonMistakes:
      'The seventh is B♭ (a diminished 7th from C♯, enharmonic to A♯). Replacing it with B natural makes a half-diminished chord (C♯m7♭5); the diminished 7th distinction is the lowered B♭. Bach uses C♯°7 constantly in his D-minor literature — the Toccata and Fugue is full of these chords as cadential preparations.',
    inProgressions:
      'C♯°7 → D minor is the strongest cadence in D minor — every voice resolves by half-step or whole-step to the tonic chord. C♯°7 also substitutes for A7♭9 as an altered dominant (omit the A and you have C♯°7). Liszt uses dim7 chords as modulation pivots throughout his Hungarian Rhapsodies.',
    faq: [
      { q: 'What notes are in a C♯ diminished 7 chord?', a: 'C♯°7 contains four notes: C♯ (root), E (minor third), G (diminished fifth), and B♭ (diminished seventh).' },
      { q: 'How does C♯°7 resolve?', a: 'In D minor: C♯ rises to D, E holds or falls to D, G falls to F, and B♭ falls to A — every voice moves by half-step or whole-step to a chord tone of D minor.' },
      { q: 'Why are dim7 chords symmetric?', a: 'Every interval is a minor third (3 semitones). 3+3+3+3 = 12 semitones = an octave. So C♯°7, E°7, G°7, and B♭°7 all contain the same four pitches in different inversions.' },
      { q: 'Where does C♯°7 appear in famous music?', a: 'Bach\'s Toccata and Fugue in D Minor uses it constantly. Mozart\'s K. 397 Fantasia in D minor opens with parallel diminished sonorities. Beethoven\'s "Pathétique" Sonata Op. 13 opens with C°7 → resolution.' },
    ],
  },

  'd-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'D°7 — D, F, A♭, C♭ — is the vii°7 of E♭ minor and a chromatic dim7 in flat-side keys. The C♭ (enharmonic to B) is the spelling tell that the chord lives inside a deep flat-side context. Like all dim7s, D°7 is symmetric; rotating bass tones produces F°7, A♭°7, and C♭°7 — all the same pitches.',
    intervals: [
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'Cb', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In E♭ minor (vii°7)', slug: 'e-flat-minor', kind: 'chord' },
      { label: 'Parallel: D minor', slug: 'd-minor', kind: 'chord' },
      { label: 'Enharmonic: F°7, A♭°7, C♭°7 (= B°7)', slug: 'b-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['d-diminished', 'e-flat-minor', 'b-diminished-7', 'd-flat-major', 'g-flat-major'],
    commonMistakes:
      'The diminished 7th is C♭, enharmonic to B natural. In flat-key contexts (E♭ minor, G♭ major) the C♭ spelling preserves consistency with the surrounding harmony; in sharp-key writing the same chord would respell as B°7 (B-D-F-A♭, often written B-D-F-G♯). Both are correct in their respective contexts.',
    inProgressions:
      'D°7 → E♭ minor is the leading-tone cadence in E♭ minor. D°7 also appears as a passing chord between D minor and E♭ minor in chromatically-modulating music. In jazz, D°7 functions as a B♭7♭9 with omitted root.',
    faq: [
      { q: 'What notes are in a D diminished 7 chord?', a: 'D°7 contains four notes: D (root), F (minor third), A♭ (diminished fifth), and C♭ (diminished seventh — same pitch as B).' },
      { q: 'Why is the seventh C♭ instead of B?', a: 'The diminished 7th interval requires the seventh letter from the root. From D, the seventh letter is C; the diminished version of that letter is C♭. Calling the note B would skip the C letter and use B twice in the chord spelling.' },
      { q: 'Is D°7 the same as B°7?', a: 'Enharmonically yes — both contain the same four pitches. D°7 (D-F-A♭-C♭) is a flat-side spelling; B°7 (B-D-F-A♭) is the sharp-or-natural-side spelling.' },
      { q: 'When does D°7 appear in music?', a: 'In E♭ minor cadences (where it\'s the proper local spelling) and in chromatically-modulating music that pivots through dim7 sonorities. Wagner uses dim7 chords this way constantly.' },
    ],
  },

  'd-sharp-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'D♯°7 — D♯, F♯, A, C — is the vii°7 of E minor (and E major when borrowing from parallel minor). All three intervals are minor thirds, making the chord fully symmetric. D♯°7 is enharmonically equivalent to F°7, A°7, and C°7 (an altered dominant context).',
    intervals: [
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In E minor (vii°7)', slug: 'e-minor', kind: 'chord' },
      { label: 'In E major (borrowed vii°7)', slug: 'e-major', kind: 'chord' },
      { label: 'Enharmonic: F°7, A°7, C°7', slug: 'a-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['d-sharp-diminished', 'e-minor', 'a-diminished-7', 'c-sharp-diminished-7', 'b-major'],
    commonMistakes:
      'D♯°7 mixes two sharps (D♯, F♯) with two naturals (A, C). The mixed-accidental signature is part of its visual identity. In jazz, the chord is sometimes written E♭°7 instead — same pitches, but the flat-side spelling. Both are valid depending on surrounding harmony.',
    inProgressions:
      'D♯°7 → E minor is the leading-tone cadence in E minor. As an altered V/V/V (chains of secondary dominants), the chord pivots through multiple minor keys in chromatically modulating music. The "diminished sequence" in classical literature often climbs through D♯°7 → E°7 → F°7 → ... before resolving.',
    faq: [
      { q: 'What notes are in a D♯ diminished 7 chord?', a: 'D♯°7 contains four notes: D♯ (root), F♯ (minor third), A (diminished fifth), and C (diminished seventh).' },
      { q: 'How does D♯°7 resolve?', a: 'In E minor: D♯ rises to E, F♯ holds or rises to G, A holds, and C falls to B. Every voice moves by half-step or whole-step to a chord tone of E minor.' },
      { q: 'Is D♯°7 the same as E♭°7?', a: 'Enharmonically yes — same four pitches. D♯°7 spells the chord in sharp-key contexts (E minor); E♭°7 (E♭-G♭-B♭♭-D♭♭) is essentially never written because of double flats.' },
      { q: 'Where does D♯°7 appear in music?', a: 'In E-minor and E-major leading-tone cadences. Mendelssohn\'s "Italian" Symphony finale (in F♯ minor) uses adjacent dim7 chords; D♯°7 also appears in jazz progressions through E minor.' },
    ],
  },

  'e-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'E°7 — E, G, B♭, D♭ — is the vii°7 of F minor and a chromatic dim7 in flat-side keys. The chord is enharmonically the same pitch set as G°7, B♭°7, and D♭°7 — all share the same four pitches in different inversions.',
    intervals: [
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'Db', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In F minor (vii°7)', slug: 'f-minor', kind: 'chord' },
      { label: 'Parallel: E minor', slug: 'e-minor', kind: 'chord' },
      { label: 'Enharmonic: G°7, B♭°7, D♭°7 (= C♯°7)', slug: 'c-sharp-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['e-diminished', 'f-minor', 'c-sharp-diminished-7', 'g-diminished-7', 'a-flat-major'],
    commonMistakes:
      'E°7 spells the chord with E as the root, G as the minor third, B♭ as the diminished fifth, and D♭ as the diminished 7th. Replacing D♭ with D natural makes Em7♭5 (a half-diminished chord) — different harmony entirely. The mix of E (natural) plus B♭ and D♭ (flats) places this chord firmly in F-minor territory.',
    inProgressions:
      'E°7 → F minor is the strongest cadence in F minor. The chord also appears as a chromatic passing harmony between Em and Fm in modulating music. In jazz, E°7 functions as C7♭9 with the C omitted — a tritone-substitute relationship.',
    faq: [
      { q: 'What notes are in an E diminished 7 chord?', a: 'E°7 contains four notes: E (root), G (minor third), B♭ (diminished fifth), and D♭ (diminished seventh).' },
      { q: 'How does E°7 resolve?', a: 'In F minor: E rises to F, G holds or rises to A♭, B♭ holds or falls to A♭, and D♭ falls to C. Every voice moves by step to a chord tone of F minor.' },
      { q: 'Is E°7 the same as G°7?', a: 'Enharmonically yes — same four pitches in different inversions. E°7, G°7, B♭°7, and D♭°7 all share E, G, B♭, and D♭.' },
      { q: 'When does E°7 appear in music?', a: 'In F-minor cadences (where it\'s the proper local spelling), in chromatically-modulating music as a pivot, and in jazz as a substitute for C7♭9.' },
    ],
  },

  'f-sharp-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'F♯°7 — F♯, A, C, E♭ — is the vii°7 of G minor and a common chromatic dim7 in sharp-side keys. F♯°7 is enharmonically equivalent to A°7, C°7, and E♭°7 — all four roots of the same symmetric pitch set.',
    intervals: [
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'Eb', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In G minor (vii°7)', slug: 'g-minor', kind: 'chord' },
      { label: 'Parallel: F♯ minor', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: A°7, C°7, E♭°7', slug: 'a-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-diminished', 'g-minor', 'a-diminished-7', 'd-sharp-diminished-7', 'b-flat-major'],
    commonMistakes:
      'F♯°7 mixes one sharp (F♯) with two naturals (A, C) and one flat (E♭). The four-accidental-type variety can be confusing visually — but each one is necessary for the seven-letter rule. Replacing E♭ with E natural makes F♯m7♭5 (half-diminished); the diminished 7th distinction is the lowered E♭.',
    inProgressions:
      'F♯°7 → G minor is the leading-tone cadence in G minor. Mozart\'s G-minor symphonies (No. 25, No. 40) use this exact preparation. The chord also appears as a substitute for D7♭9 (a tritone-related dominant) in jazz harmony.',
    faq: [
      { q: 'What notes are in an F♯ diminished 7 chord?', a: 'F♯°7 contains four notes: F♯ (root), A (minor third), C (diminished fifth), and E♭ (diminished seventh).' },
      { q: 'How does F♯°7 resolve?', a: 'In G minor: F♯ rises to G, A holds or rises to B♭, C falls to B♭, and E♭ falls to D — every voice moves by half-step or whole-step to a tone of G minor.' },
      { q: 'Why does F♯°7 spell the seventh as E♭ instead of D♯?', a: 'The diminished 7th interval requires the seventh letter (E from F). The diminished version of E natural is E♭. Calling the note D♯ would put the chord on the wrong letter and break the seven-letter spelling rule.' },
      { q: 'Where does F♯°7 appear in music?', a: 'In Mozart\'s G-minor symphonies, in Bach\'s G-minor preludes and fugues, and in countless jazz minor-key cadences. It\'s one of the most-played dim7 chords in classical literature.' },
    ],
  },

  'g-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'G°7 — G, B♭, D♭, F♭ — is the vii°7 of A♭ minor and a deeply flat-side chromatic chord. The F♭ (enharmonic to E natural) signals you\'re in serious flat-key territory. Like all dim7s, G°7 is symmetric and equals B♭°7, D♭°7, and F♭°7 in pitch class.',
    intervals: [
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'Fb', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In A♭ minor (vii°7)', slug: 'a-flat-minor', kind: 'chord' },
      { label: 'Parallel: G minor', slug: 'g-minor', kind: 'chord' },
      { label: 'Enharmonic: B♭°7, D♭°7, F♭°7 (= E°7)', slug: 'e-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['g-diminished', 'a-flat-minor', 'e-diminished-7', 'b-diminished-7', 'a-flat-major'],
    commonMistakes:
      'The seventh F♭ is enharmonic to E natural. Inside A♭-minor key context, F♭ preserves consistency with the surrounding flats; outside that context the chord usually respells as E°7 (E-G-B♭-D♭) or as one of its other inversions. The four-accidental spelling (G natural, plus three flats) is unusual visually.',
    inProgressions:
      'G°7 → A♭ minor is the cadence in A♭ minor — though A♭ minor itself is rare as a tonic. More commonly, G°7 appears as a chromatic passing chord or as a substitute for E♭7♭9 (tritone-related dominant) in jazz minor-key progressions.',
    faq: [
      { q: 'What notes are in a G diminished 7 chord?', a: 'G°7 contains four notes: G (root), B♭ (minor third), D♭ (diminished fifth), and F♭ (diminished seventh — same pitch as E).' },
      { q: 'Why is the seventh F♭ instead of E?', a: 'The diminished 7th interval requires the seventh letter (F from G). The diminished version of F natural is F♭. Calling the note E would skip the F letter and use E twice if combined with surrounding harmony in flat keys.' },
      { q: 'Is G°7 the same as E°7?', a: 'Enharmonically yes — both contain the same four pitches. G°7 is the spelling inside flat-key contexts (A♭ minor); E°7 is the more common spelling in F-minor contexts.' },
      { q: 'When would I write G°7 instead of E°7?', a: 'When the surrounding harmony is firmly in A♭ minor or G♭ major — the all-flat key signature makes G°7 easier to read than respelling as E°7 with multiple naturals.' },
    ],
  },

  'g-sharp-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'G♯°7 — G♯, B, D, F — is the vii°7 of A minor and one of the most common dim7 chords in standard repertoire. The chord stacks three minor thirds and resolves powerfully to A minor. G♯°7 is enharmonically equivalent to B°7, D°7, and F°7.',
    intervals: [
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In A minor (vii°7)', slug: 'a-minor', kind: 'chord' },
      { label: 'Parallel: G♯ minor', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: B°7, D°7, F°7', slug: 'b-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['g-sharp-diminished', 'a-minor', 'b-diminished-7', 'a-sharp-diminished-7', 'c-major'],
    commonMistakes:
      'G♯°7 is one of the most common dim7s in classical literature precisely because A minor is one of the most common keys. The chord mixes one sharp (G♯) with three naturals (B, D, F). The strong G♯ → A leading-tone resolution is what makes this chord function so powerfully.',
    inProgressions:
      'G♯°7 → A minor is the textbook leading-tone cadence in A minor — every voice resolves by half-step or whole-step to a tone of A minor (G♯ rises to A, B holds, D holds or falls to C, F falls to E). Bach uses G♯°7 constantly in his A-minor literature.',
    faq: [
      { q: 'What notes are in a G♯ diminished 7 chord?', a: 'G♯°7 contains four notes: G♯ (root), B (minor third), D (diminished fifth), and F (diminished seventh).' },
      { q: 'How does G♯°7 resolve?', a: 'In A minor: G♯ rises to A (the leading-tone resolution), B holds, D falls to C, and F falls to E. Every voice moves by half-step or whole-step to a chord tone.' },
      { q: 'Is G♯°7 the same as B°7?', a: 'Enharmonically yes — same four pitches in different inversions. G♯°7, B°7, D°7, and F°7 all share G♯, B, D, and F.' },
      { q: 'Where does G♯°7 appear in famous music?', a: 'Throughout A-minor literature: Bach\'s A-minor preludes and fugues, Mozart\'s A-minor sonata K. 310, Beethoven\'s "Pathétique" Sonata (which uses C°7 / G♯°7 enharmonically). It\'s one of the most-played dim7 chords in Western music.' },
    ],
  },

  'a-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'A°7 — A, C, E♭, G♭ — is the vii°7 of B♭ minor and an enharmonic equivalent of F♯°7, C°7, and E♭°7. The chord lives most naturally inside flat-side keys (B♭ minor, D♭ major) where its three flats integrate cleanly into the surrounding signature.',
    intervals: [
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'Gb', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In B♭ minor (vii°7)', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Parallel: A minor', slug: 'a-minor', kind: 'chord' },
      { label: 'Enharmonic: C°7, E♭°7, G♭°7 (= F♯°7)', slug: 'f-sharp-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['a-diminished', 'b-flat-minor', 'f-sharp-diminished-7', 'd-flat-major', 'g-minor'],
    commonMistakes:
      'A°7\'s seventh is G♭, enharmonic to F♯. Inside flat-key context the G♭ spelling preserves consistency. In jazz lead-sheet practice, the chord is sometimes written A°7 with F♯ as the seventh — strictly incorrect by the seven-letter rule, but common.',
    inProgressions:
      'A°7 → B♭ minor is the leading-tone cadence in B♭ minor. The chord also appears in D♭ major as a borrowed harmony from the parallel D♭ minor. In jazz, A°7 substitutes for F7♭9 (a tritone-related dominant) in certain D-minor or D♭-major progressions.',
    faq: [
      { q: 'What notes are in an A diminished 7 chord?', a: 'A°7 contains four notes: A (root), C (minor third), E♭ (diminished fifth), and G♭ (diminished seventh — same pitch as F♯).' },
      { q: 'How does A°7 resolve?', a: 'In B♭ minor: A rises to B♭, C holds or rises to D♭, E♭ holds, G♭ falls to F. Every voice moves by half-step or whole-step.' },
      { q: 'Is A°7 the same as F♯°7?', a: 'Enharmonically yes — same four pitches in different inversions. A°7 is the flat-side spelling; F♯°7 is the sharp-side. Composers pick one based on surrounding harmony.' },
      { q: 'Where does A°7 appear in music?', a: 'In B♭-minor cadences (where it\'s the proper local spelling), in chromatically-modulating music as a pivot chord, and as a tritone substitute in jazz dominant cycles.' },
    ],
  },

  'a-sharp-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'A♯°7 — A♯, C♯, E, G — is the vii°7 of B minor and a sharp-side dim7 chord. The chord is enharmonically equivalent to C♯°7, E°7, and G°7 — all the same four pitches. Most often appears inside B-minor classical and folk literature as the standard cadential preparation.',
    intervals: [
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In B minor (vii°7)', slug: 'b-minor', kind: 'chord' },
      { label: 'Parallel: A♯ minor', slug: 'a-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: C♯°7, E°7, G°7', slug: 'c-sharp-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['a-sharp-diminished', 'b-minor', 'c-sharp-diminished-7', 'g-diminished-7', 'd-major'],
    commonMistakes:
      'A♯°7 mixes two sharps (A♯, C♯) with two naturals (E, G). The seventh G is natural, not G♯ — replacing it with G♯ destroys the diminished 7th interval and produces a different chord. The two-sharp signature of D major (which contains B minor as its relative minor) provides the sharps automatically.',
    inProgressions:
      'A♯°7 → B minor is the cadence in B minor — Bach uses this exact resolution constantly in his B-minor literature, including the famous Mass in B minor. Tchaikovsky\'s "Pathétique" Symphony No. 6 (in B minor) uses A♯°7 throughout its development sections.',
    faq: [
      { q: 'What notes are in an A♯ diminished 7 chord?', a: 'A♯°7 contains four notes: A♯ (root), C♯ (minor third), E (diminished fifth), and G (diminished seventh).' },
      { q: 'How does A♯°7 resolve?', a: 'In B minor: A♯ rises to B, C♯ holds, E falls to D, G falls to F♯. Every voice moves by half-step or whole-step to a tone of B minor.' },
      { q: 'Is A♯°7 the same as B♭°7?', a: 'Enharmonically yes (both are four pitches with intervals of m3). A♯°7 is the spelling in B-minor key contexts; B♭°7 (B♭-D♭-F♭-A𝄫) is rare because of the double-flat seventh.' },
      { q: 'Where does A♯°7 appear in music?', a: 'Bach\'s Mass in B minor uses A♯°7 at every cadence. Tchaikovsky\'s "Pathétique" Symphony, Schubert\'s "Unfinished," and countless other B-minor works rely on this chord as the primary cadential preparation.' },
    ],
  },

  'b-diminished-7': {
    publishAt: '2020-01-01',
    intro:
      'B°7 — B, D, F, A♭ — is the vii°7 of C minor and one of the most-played dim7 chords in classical literature. The chord is enharmonically equivalent to D°7, F°7, and A♭°7 — all share the same four pitches. The single flat (A♭) on top of three naturals is its visual signature.',
    intervals: [
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'Ab', name: 'diminished 7th', semitones: 9 },
    ],
    relatedKeys: [
      { label: 'In C minor (vii°7)', slug: 'c-minor', kind: 'chord' },
      { label: 'In C major (borrowed from parallel minor)', slug: 'c-major', kind: 'chord' },
      { label: 'Enharmonic: D°7, F°7, A♭°7', slug: 'd-diminished-7', kind: 'chord' },
    ],
    relatedChords: ['b-diminished', 'c-minor', 'd-diminished-7', 'g-sharp-diminished-7', 'e-flat-major'],
    commonMistakes:
      'B°7 has B-D-F-A♭ — three naturals plus the flat seventh. The most common error is reading A♭ as A natural, which produces Bm7♭5 (half-diminished). The diminished 7th distinction is the lowered seventh, which gives the chord its full symmetry and its strong cadential pull.',
    inProgressions:
      'B°7 → C minor is the textbook leading-tone cadence in C minor. Beethoven\'s "Pathétique" Sonata Op. 13 opens with this exact dim7 → tonic-minor resolution. The chord also appears in C major as a borrowed harmony from the parallel C minor — a colour Beethoven and Schubert used constantly.',
    faq: [
      { q: 'What notes are in a B diminished 7 chord?', a: 'B°7 contains four notes: B (root), D (minor third), F (diminished fifth), and A♭ (diminished seventh).' },
      { q: 'How does B°7 resolve?', a: 'In C minor: B rises to C (the leading-tone resolution), D holds or rises to E♭, F holds, A♭ falls to G. Every voice moves to a chord tone of C minor.' },
      { q: 'Is B°7 the same as D°7?', a: 'Enharmonically yes — both contain the same four pitches in different inversions. B°7, D°7, F°7, and A♭°7 are inversions of each other.' },
      { q: 'Where does B°7 appear in famous music?', a: 'Beethoven\'s "Pathétique" Sonata Op. 13 (which opens with this exact chord), Mozart\'s C minor sonata K. 457, and Schubert\'s C-minor literature all use B°7 as the primary cadential preparation.' },
    ],
  },

  // ─── Phase 2: half-diminished chords (m7♭5) ──────────────────────────────
  // Minor triad with a flatted fifth and a minor seventh on top — written
  // m7♭5 or with the ø symbol. The "ii" chord of every minor key (the most
  // common context). Famous as the opening chord of Wagner's Tristan und
  // Isolde, where it's also called "the Tristan chord."

  'c-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'C half-diminished (Cm7♭5 or Cø) — C, E♭, G♭, B♭ — is the iiø7 chord of B♭ minor and a centrepiece of jazz minor-key harmony. The chord stacks two minor thirds and a major third, distinguishing it from the fully-symmetric diminished 7th. It\'s one of the most evocative four-note sonorities in tonal music.',
    intervals: [
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In B♭ minor (iiø7 → V → i)', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Parallel: C minor', slug: 'c-minor', kind: 'chord' },
      { label: 'Related: C diminished', slug: 'c-diminished', kind: 'chord' },
    ],
    relatedChords: ['c-diminished', 'c-minor', 'b-flat-minor', 'd-half-diminished', 'f-minor'],
    commonMistakes:
      'The seventh is B♭ (a minor 7th from C), not B natural (which would be a major 7th, making this a different chord — C°maj7, virtually never used). The "half" in half-diminished refers to the upper interval being a minor 7th rather than the diminished 7th of the fully-diminished chord. C°7 has B𝄫; Cm7♭5 has B♭.',
    inProgressions:
      'Cm7♭5 → F7 → B♭m is the textbook ii–V–i in B♭ minor — one of the most-used cadences in jazz. Standards like "Autumn Leaves" and "Blue Bossa" use exactly this pattern at every minor-key turnaround. The chord also appears as a colour chord in late-Romantic music, where its instability invites slow chromatic resolution.',
    faq: [
      { q: 'What notes are in a C half-diminished chord?', a: 'C half-diminished contains four notes: C (root), E♭ (minor third), G♭ (diminished fifth), and B♭ (minor seventh).' },
      { q: 'How is half-diminished different from fully diminished?', a: 'Both share the diminished triad below (root, ♭3, ♭5). The difference is the seventh: half-diminished uses a minor 7th (B♭ from C); fully diminished uses a diminished 7th (B𝄫 / A from C).' },
      { q: 'What does the ø symbol mean?', a: 'ø is the standard chord-symbol notation for half-diminished. Cø7 = Cm7♭5 = "C half-diminished seventh." Some writers use the ø without the 7 implied.' },
      { q: 'Where does C half-diminished appear in music?', a: 'In every B♭-minor jazz standard ("Autumn Leaves," "Stella by Starlight," etc.) as the iiø7 chord. In classical literature, the Tristan chord (Wagner\'s most famous opening) is essentially a half-diminished sonority transposed.' },
    ],
  },

  'c-sharp-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'C♯ half-diminished (C♯m7♭5 or C♯ø) — C♯, E, G, B — is the iiø7 of B minor. The chord drives the B-minor minor-key cadence and shows up constantly in any jazz tune in B minor, plus countless classical works in B minor or D major (where it\'s a chromatic colour).',
    intervals: [
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In B minor (iiø7 → V → i)', slug: 'b-minor', kind: 'chord' },
      { label: 'Parallel: C♯ minor', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Related: C♯ diminished', slug: 'c-sharp-diminished', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-diminished', 'c-sharp-minor', 'b-minor', 'd-half-diminished', 'f-sharp-major'],
    commonMistakes:
      'C♯m7♭5 contains C♯ (the only sharp) plus three naturals: E, G, B. The seventh B is the chord\'s major third away from G — a wider interval than dim7 chords use. Replacing B with B♭ would produce C♯°7 (fully diminished); the half-diminished colour requires the minor 7th (B natural).',
    inProgressions:
      'C♯m7♭5 → F♯7 → Bm is the ii–V–i in B minor, used in every B-minor jazz standard and most classical B-minor cadences. The chord also appears in D major as a chromatic colour (the ii of the parallel minor borrowed into the major). Schubert uses these borrowings constantly in his late piano sonatas.',
    faq: [
      { q: 'What notes are in a C♯ half-diminished chord?', a: 'C♯ half-diminished contains four notes: C♯ (root), E (minor third), G (diminished fifth), and B (minor seventh).' },
      { q: 'How does C♯m7♭5 resolve?', a: 'In B minor: C♯m7♭5 → F♯7 → Bm. The C♯m7♭5 sets up the V chord (F♯7), which then resolves to the tonic Bm.' },
      { q: 'Is C♯ half-diminished the same as C♯ diminished?', a: 'No — different chords. C♯° (the triad) is C♯-E-G; C♯m7♭5 (the four-note chord) adds a minor 7th (B) on top. The half-diminished version is a stacked version of the diminished triad.' },
      { q: 'Where does C♯ half-diminished appear in jazz?', a: 'In every jazz standard in B minor — "Beautiful Love," "Solar," and many others use C♯m7♭5 as the standard iiø7 setup before resolving to F♯7 → Bm.' },
    ],
  },

  'd-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'D half-diminished (Dm7♭5 or Dø) — D, F, A♭, C — is the iiø7 of C minor and one of the most-used jazz chords. It opens minor-key turnarounds in countless standards, and shows up in classical literature any time C minor needs a darker, jazz-tinged supertonic. Bach uses it constantly in his C-minor preludes and fugues.',
    intervals: [
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In C minor (iiø7 → V → i)', slug: 'c-minor', kind: 'chord' },
      { label: 'Parallel: D minor', slug: 'd-minor', kind: 'chord' },
      { label: 'Related: D diminished', slug: 'd-diminished', kind: 'chord' },
    ],
    relatedChords: ['d-diminished', 'd-minor', 'c-minor', 'g-minor', 'e-half-diminished'],
    commonMistakes:
      'Dm7♭5 has D-F-A♭-C — one flat, three naturals. The most common error is reading A♭ as A natural, which makes Dm7 (a regular minor seventh, much less tense). The flat fifth (A♭) is what produces the half-diminished colour and the strong tension that pulls toward G7 → Cm.',
    inProgressions:
      'Dm7♭5 → G7 → Cm is the ii–V–i in C minor — the most-used cadence in any C-minor jazz tune. "Autumn Leaves" (the most-played jazz standard ever) contains Dm7♭5 → G7 → Cm at its main cadence. In classical, Bach uses the same harmonic preparation in his C-minor literature.',
    faq: [
      { q: 'What notes are in a D half-diminished chord?', a: 'D half-diminished contains four notes: D (root), F (minor third), A♭ (diminished fifth), and C (minor seventh).' },
      { q: 'How does Dm7♭5 resolve?', a: 'In C minor: Dm7♭5 → G7 → Cm. The chord sets up the V (G7), which then resolves to the tonic Cm. This is the most-used minor-key cadence in jazz.' },
      { q: 'Is Dm7♭5 the same as F minor 6?', a: 'Enharmonically the chord shares notes with Fm6 (F-A♭-C-D = same four pitches). But functionally they\'re different: Dm7♭5 is the iiø7 of C minor; Fm6 is the iv6 of C minor. Same notes, different roles.' },
      { q: 'What jazz standards use D half-diminished?', a: '"Autumn Leaves," "Solar," "Beautiful Love," and many other minor-key standards. It\'s the default iiø7 chord in C-minor jazz harmony.' },
    ],
  },

  'd-sharp-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'D♯ half-diminished (D♯m7♭5 or D♯ø) — D♯, F♯, A, C♯ — is the iiø7 of C♯ minor. The chord lives in sharp-side keys and serves the same minor-key-cadence role as its enharmonic neighbour E♭m7♭5 (which spells the same pitches in flat keys). Bach\'s C♯-minor fugue (WTC I) uses this chord at its primary cadence.',
    intervals: [
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In C♯ minor (iiø7 → V → i)', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Parallel: D♯ minor', slug: 'd-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: E♭m7♭5', slug: 'e-flat-major', kind: 'chord' },
    ],
    relatedChords: ['d-sharp-diminished', 'd-sharp-minor', 'c-sharp-minor', 'f-sharp-minor', 'g-sharp-minor'],
    commonMistakes:
      'D♯m7♭5 mixes three sharps (D♯, F♯, C♯) with one natural (A). The single natural is the flat-five — the chord\'s identity. Replacing A with A♯ produces D♯m7 (a regular minor seventh); the flat fifth is what makes the chord half-diminished.',
    inProgressions:
      'D♯m7♭5 → G♯7 → C♯m is the ii–V–i in C♯ minor. The chord appears in every C♯-minor jazz tune (rare but they exist) and in classical C♯-minor literature including Beethoven\'s "Moonlight" Sonata Op. 27 No. 2 and Rachmaninoff\'s C♯-minor Prelude.',
    faq: [
      { q: 'What notes are in a D♯ half-diminished chord?', a: 'D♯ half-diminished contains four notes: D♯ (root), F♯ (minor third), A (diminished fifth), and C♯ (minor seventh).' },
      { q: 'How does D♯m7♭5 resolve?', a: 'In C♯ minor: D♯m7♭5 → G♯7 → C♯m. The chord prepares the dominant G♯7, which then resolves to the C♯m tonic.' },
      { q: 'Is D♯m7♭5 the same as E♭m7♭5?', a: 'Enharmonically the same set of pitches, but spelled differently. D♯m7♭5 lives in C♯-minor sharp-key contexts; E♭m7♭5 (E♭-G♭-B♭♭-D♭) is essentially never written because of the double-flat fifth.' },
      { q: 'Where does D♯m7♭5 appear in music?', a: 'In C♯-minor cadences in classical and jazz literature. Beethoven\'s "Moonlight" Sonata, Rachmaninoff\'s C♯-minor Prelude, and any C♯-minor jazz tune use this chord as the standard iiø7 preparation.' },
    ],
  },

  'e-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'E half-diminished (Em7♭5 or Eø) — E, G, B♭, D — is the iiø7 of D minor, one of the most common minor keys in classical and jazz music. The chord shows up at every D-minor cadence in standard repertoire — Bach\'s D-minor toccatas, Mozart\'s K. 397 Fantasia, countless jazz tunes.',
    intervals: [
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In D minor (iiø7 → V → i)', slug: 'd-minor', kind: 'chord' },
      { label: 'Parallel: E minor', slug: 'e-minor', kind: 'chord' },
      { label: 'Related: E diminished', slug: 'e-diminished', kind: 'chord' },
    ],
    relatedChords: ['e-diminished', 'e-minor', 'd-minor', 'a-minor', 'd-half-diminished'],
    commonMistakes:
      'Em7♭5 has E-G-B♭-D. The flat fifth (B♭) is what distinguishes it from Em7 (which has B natural). The natural seventh (D) distinguishes it from Em6 (which would have a different fifth). The chord sits comfortably under the hand on piano: E-G-B♭ is white-white-black, plus D on top.',
    inProgressions:
      'Em7♭5 → A7 → Dm is the ii–V–i in D minor — the cadence in every D-minor jazz standard. "Solar" (Miles Davis) opens with exactly this chord. Bach\'s D-minor Toccata and Fugue uses Em7♭5 as a primary cadential preparation.',
    faq: [
      { q: 'What notes are in an E half-diminished chord?', a: 'E half-diminished contains four notes: E (root), G (minor third), B♭ (diminished fifth), and D (minor seventh).' },
      { q: 'How does Em7♭5 resolve?', a: 'In D minor: Em7♭5 → A7 → Dm. The chord prepares the dominant A7, which then resolves to the Dm tonic.' },
      { q: 'Is Em7♭5 the same as Em7?', a: 'No — different chords. Em7 (E-G-B-D) has a perfect fifth; Em7♭5 (E-G-B♭-D) lowers that fifth a half step, producing the half-diminished colour and the iiø7 function in D minor.' },
      { q: 'Where does E half-diminished appear in music?', a: 'In D-minor cadences throughout classical and jazz literature: Bach\'s D-minor works, Miles Davis\'s "Solar," "Stella by Starlight," and any standard with a D-minor turnaround.' },
    ],
  },

  'f-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'F half-diminished (Fm7♭5 or Fø) — F, A♭, C♭, E♭ — is the iiø7 of E♭ minor, a deeply flat-side chord. The C♭ (enharmonic to B) signals the chord\'s flat-key home. Like all half-diminished chords, Fm7♭5 sets up minor-key cadences with a darker, jazz-tinged colour.',
    intervals: [
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
      { from: 'Cb', to: 'Eb', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In E♭ minor (iiø7 → V → i)', slug: 'e-flat-minor', kind: 'chord' },
      { label: 'Parallel: F minor', slug: 'f-minor', kind: 'chord' },
      { label: 'Related: F diminished', slug: 'f-diminished', kind: 'chord' },
    ],
    relatedChords: ['f-diminished', 'f-minor', 'e-flat-minor', 'b-flat-minor', 'a-flat-major'],
    commonMistakes:
      'The fifth is C♭, enharmonic to B natural. In jazz lead-sheet practice, the chord is sometimes written Fm7♭5 with B as the fifth letter — strictly incorrect by the seven-letter rule, but common. Inside E♭-minor key contexts, C♭ preserves consistency with the surrounding flat-side harmony.',
    inProgressions:
      'Fm7♭5 → B♭7 → E♭m is the ii–V–i in E♭ minor. The chord appears in any E♭-minor jazz tune and in classical E♭-minor literature including Bach\'s WTC I prelude and fugue in E♭ minor.',
    faq: [
      { q: 'What notes are in an F half-diminished chord?', a: 'F half-diminished contains four notes: F (root), A♭ (minor third), C♭ (diminished fifth — same pitch as B), and E♭ (minor seventh).' },
      { q: 'How does Fm7♭5 resolve?', a: 'In E♭ minor: Fm7♭5 → B♭7 → E♭m. The chord prepares the dominant B♭7, which then resolves to the tonic E♭m.' },
      { q: 'Why is the fifth C♭ instead of B?', a: 'The half-diminished chord builds on the diminished triad (root, ♭3, ♭5). From F, the fifth letter is C; the diminished version of C natural is C♭. Calling the note B would skip the C letter.' },
      { q: 'Where does F half-diminished appear in music?', a: 'In E♭-minor cadences in classical and jazz. Bach\'s WTC I prelude in E♭ minor uses Fm7♭5; jazz pianists like Bill Evans use it constantly in their darker minor-key voicings.' },
    ],
  },

  'f-sharp-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'F♯ half-diminished (F♯m7♭5 or F♯ø) — F♯, A, C, E — is the iiø7 of E minor and the famous "Tristan chord" (Wagner\'s opening to Tristan und Isolde, the chord that arguably launched late-Romantic chromaticism). The chord\'s harmonic ambiguity made it a touchstone for everything from Wagner to Debussy.',
    intervals: [
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In E minor (iiø7 → V → i)', slug: 'e-minor', kind: 'chord' },
      { label: 'Parallel: F♯ minor', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Related: F♯ diminished', slug: 'f-sharp-diminished', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-diminished', 'f-sharp-minor', 'e-minor', 'a-minor', 'b-minor'],
    commonMistakes:
      'F♯m7♭5 has F♯-A-C-E. The seventh E is natural (a minor 7th from F♯), not E♯. The flat fifth C is natural too; replacing it with C♯ makes F♯m7. The famous Tristan chord context uses this exact spelling — Wagner\'s opening note B in the bass plus F♯, A, C, E above creates a dense, ambiguous half-diminished colour that resolves only after several measures of suspense.',
    inProgressions:
      'F♯m7♭5 → B7 → Em is the ii–V–i in E minor — used in every E-minor jazz standard. In Wagner\'s Tristan, the famous opening F♯m7♭5 lingers and resolves through chromatic voice-leading to E7 (rather than the expected B7), launching an entire era of harmonic ambiguity.',
    faq: [
      { q: 'What notes are in an F♯ half-diminished chord?', a: 'F♯ half-diminished contains four notes: F♯ (root), A (minor third), C (diminished fifth), and E (minor seventh).' },
      { q: 'What is the Tristan chord?', a: 'The famous opening chord of Wagner\'s Tristan und Isolde — F-B-D♯-G♯ in his actual notation, which is enharmonically a half-diminished sonority. It\'s often analysed as F♯m7♭5 reinterpreted enharmonically. The chord\'s ambiguous resolution defined late-Romantic harmonic language.' },
      { q: 'How does F♯m7♭5 resolve?', a: 'In E minor: F♯m7♭5 → B7 → Em. The chord prepares the dominant B7, which then resolves to the tonic Em. In Wagner\'s Tristan, the chord deliberately doesn\'t resolve in the standard way — it sets up an entire opera of harmonic suspense.' },
      { q: 'Where does F♯m7♭5 appear in music?', a: 'Wagner\'s Tristan und Isolde (the most famous appearance), every E-minor jazz standard, and countless classical E-minor cadences. It\'s one of the most-studied chords in Western music history.' },
    ],
  },

  'g-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'G half-diminished (Gm7♭5 or Gø) — G, B♭, D♭, F — is the iiø7 of F minor. The chord serves the standard minor-key-cadence role and shows up in every F-minor jazz tune as well as classical F-minor literature including Beethoven\'s "Appassionata" Sonata.',
    intervals: [
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In F minor (iiø7 → V → i)', slug: 'f-minor', kind: 'chord' },
      { label: 'Parallel: G minor', slug: 'g-minor', kind: 'chord' },
      { label: 'Related: G diminished', slug: 'g-diminished', kind: 'chord' },
    ],
    relatedChords: ['g-diminished', 'g-minor', 'f-minor', 'c-minor', 'a-flat-major'],
    commonMistakes:
      'Gm7♭5 has G-B♭-D♭-F. The two flats (B♭, D♭) plus two naturals (G, F) is the chord\'s signature. Replacing D♭ with D natural makes Gm7 (regular minor seventh, no flat fifth); the chord then loses its half-diminished function. The natural seventh F is what distinguishes Gm7♭5 from G°7 (which has F♭).',
    inProgressions:
      'Gm7♭5 → C7 → Fm is the ii–V–i in F minor. Beethoven\'s "Appassionata" Sonata uses exactly this preparation throughout its first movement. In jazz, Gm7♭5 appears in any F-minor tune — "Stella by Starlight" has a Gm7♭5 → C7 → Fm6 cadence at one of its primary moments.',
    faq: [
      { q: 'What notes are in a G half-diminished chord?', a: 'G half-diminished contains four notes: G (root), B♭ (minor third), D♭ (diminished fifth), and F (minor seventh).' },
      { q: 'How does Gm7♭5 resolve?', a: 'In F minor: Gm7♭5 → C7 → Fm. The chord prepares the dominant C7, which resolves to the tonic Fm.' },
      { q: 'Is Gm7♭5 the same as G°7?', a: 'No — different chords. G°7 (G-B♭-D♭-F♭) has a diminished 7th (F♭); Gm7♭5 (G-B♭-D♭-F) has a minor 7th (F natural). The half-diminished version is functionally a iiø7; the fully-diminished is a vii°7.' },
      { q: 'Where does G half-diminished appear in music?', a: 'In F-minor cadences in classical and jazz: Beethoven\'s "Appassionata" Sonata, Chopin\'s F-minor Ballade, "Stella by Starlight," and many other F-minor works.' },
    ],
  },

  'g-sharp-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'G♯ half-diminished (G♯m7♭5 or G♯ø) — G♯, B, D, F♯ — is the iiø7 of F♯ minor. The chord serves the standard minor-key cadence in F♯-minor literature and jazz. It shares its pitch set with neighbouring half-diminished chords through specific voice-leading relationships, but functionally it\'s the F♯-minor iiø7.',
    intervals: [
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In F♯ minor (iiø7 → V → i)', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Parallel: G♯ minor', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Related: G♯ diminished', slug: 'g-sharp-diminished', kind: 'chord' },
    ],
    relatedChords: ['g-sharp-diminished', 'g-sharp-minor', 'f-sharp-minor', 'c-sharp-minor', 'b-major'],
    commonMistakes:
      'G♯m7♭5 has G♯-B-D-F♯. Two sharps (G♯, F♯) plus two naturals (B, D). The natural fifth (D, lowered from D♯ which would be in G♯ minor) is what creates the half-diminished colour. Replacing D with D♯ makes G♯m7 (regular minor seventh).',
    inProgressions:
      'G♯m7♭5 → C♯7 → F♯m is the ii–V–i in F♯ minor. The chord appears in every F♯-minor jazz tune and in classical F♯-minor literature including Mendelssohn\'s "Italian" Symphony finale.',
    faq: [
      { q: 'What notes are in a G♯ half-diminished chord?', a: 'G♯ half-diminished contains four notes: G♯ (root), B (minor third), D (diminished fifth), and F♯ (minor seventh).' },
      { q: 'How does G♯m7♭5 resolve?', a: 'In F♯ minor: G♯m7♭5 → C♯7 → F♯m. The chord prepares the dominant C♯7, which resolves to the F♯m tonic.' },
      { q: 'Is G♯m7♭5 the same as G♯ diminished?', a: 'No — G♯° (the triad) is just three notes (G♯-B-D); G♯m7♭5 adds a minor 7th (F♯) on top, creating a four-note half-diminished chord with different harmonic function.' },
      { q: 'Where does G♯ half-diminished appear in music?', a: 'In F♯-minor cadences across classical and jazz literature. Mendelssohn\'s "Italian" Symphony finale, Tchaikovsky\'s First Piano Concerto cadenza, and any F♯-minor jazz tune use this chord as the standard iiø7 setup.' },
    ],
  },

  'a-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'A half-diminished (Am7♭5 or Aø) — A, C, E♭, G — is the iiø7 of G minor and a workhorse jazz chord. Mozart\'s G-minor symphonies (No. 25 and No. 40) use this exact chord at every primary cadence; in jazz, "Solar," "Beautiful Love," and many other G-minor standards open with Am7♭5.',
    intervals: [
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In G minor (iiø7 → V → i)', slug: 'g-minor', kind: 'chord' },
      { label: 'Parallel: A minor', slug: 'a-minor', kind: 'chord' },
      { label: 'Related: A diminished', slug: 'a-diminished', kind: 'chord' },
    ],
    relatedChords: ['a-diminished', 'a-minor', 'g-minor', 'd-minor', 'b-flat-major'],
    commonMistakes:
      'Am7♭5 has A-C-E♭-G. Three naturals plus the flat fifth (E♭) is the chord\'s signature. The most common error is reading E♭ as E natural, which makes Am7 (regular minor seventh, no flat fifth); the half-diminished colour requires the lowered fifth. The natural seventh G distinguishes Am7♭5 from A°7 (which has G♭).',
    inProgressions:
      'Am7♭5 → D7 → Gm is the ii–V–i in G minor — Mozart\'s most-used cadence in his G-minor symphonies. In jazz, the same progression underlies "Solar" (Miles Davis), "Beautiful Love," and many other G-minor standards.',
    faq: [
      { q: 'What notes are in an A half-diminished chord?', a: 'A half-diminished contains four notes: A (root), C (minor third), E♭ (diminished fifth), and G (minor seventh).' },
      { q: 'How does Am7♭5 resolve?', a: 'In G minor: Am7♭5 → D7 → Gm. The chord prepares the dominant D7, which resolves to the Gm tonic. This is one of the most-used cadences in Western music.' },
      { q: 'Is Am7♭5 the same as Am7?', a: 'No — different chords. Am7 (A-C-E-G) has a perfect fifth; Am7♭5 (A-C-E♭-G) lowers that fifth a half step, producing the half-diminished colour and the iiø7 function in G minor.' },
      { q: 'Where does A half-diminished appear in famous music?', a: 'Mozart\'s Symphony No. 40 in G minor uses Am7♭5 at every primary cadence. Bach\'s G-minor preludes and fugues, "Solar" by Miles Davis, "Beautiful Love" — anywhere G minor appears in standard repertoire.' },
    ],
  },

  'a-sharp-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'A♯ half-diminished (A♯m7♭5 or A♯ø) — A♯, C♯, E, G♯ — is the iiø7 of G♯ minor. The chord serves the minor-key cadence in G♯-minor literature, which though rarer than C♯ or A♯ minor as tonics, does appear in Beethoven (Op. 106 development) and Liszt.',
    intervals: [
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In G♯ minor (iiø7 → V → i)', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Parallel: A♯ minor', slug: 'a-sharp-minor', kind: 'chord' },
      { label: 'Related: A♯ diminished', slug: 'a-sharp-diminished', kind: 'chord' },
    ],
    relatedChords: ['a-sharp-diminished', 'a-sharp-minor', 'g-sharp-minor', 'd-sharp-minor', 'b-major'],
    commonMistakes:
      'A♯m7♭5 has three sharps (A♯, C♯, G♯) plus one natural (E). The natural fifth (E, lowered from E♯ in A♯ minor) is the chord\'s flat-five — the half-diminished identity. The chord is enharmonically the same set of pitches as B♭m7♭5 (B♭-D♭-F♭-A♭), but the sharp-side spelling preserves consistency in G♯-minor key contexts.',
    inProgressions:
      'A♯m7♭5 → D♯7 → G♯m is the ii–V–i in G♯ minor. Beethoven\'s "Hammerklavier" Sonata Op. 106 uses dense chromatic minor-key harmony where A♯m7♭5 appears as part of the development\'s tonal explorations.',
    faq: [
      { q: 'What notes are in an A♯ half-diminished chord?', a: 'A♯ half-diminished contains four notes: A♯ (root), C♯ (minor third), E (diminished fifth), and G♯ (minor seventh).' },
      { q: 'Is A♯m7♭5 the same as B♭m7♭5?', a: 'Enharmonically yes — same four pitches in different spellings. A♯m7♭5 lives inside G♯-minor key contexts; B♭m7♭5 (B♭-D♭-F♭-A♭) is rarer in practice because of the F♭.' },
      { q: 'How does A♯m7♭5 resolve?', a: 'In G♯ minor: A♯m7♭5 → D♯7 → G♯m. The chord prepares the dominant D♯7, which resolves to the G♯m tonic.' },
      { q: 'Where does A♯ half-diminished appear in music?', a: 'In G♯-minor cadences in classical literature — Beethoven\'s late piano sonatas, Liszt\'s sharp-key piano works, and any other deep sharp-side music in G♯ minor.' },
    ],
  },

  'b-flat-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'B♭ half-diminished (B♭m7♭5 or B♭ø) — B♭, D♭, F♭, A♭ — is the iiø7 of A♭ minor (theoretical) and a deeply flat-side chord. The F♭ (enharmonic to E natural) is the spelling tell. In practice the chord is more often written as A♯m7♭5 in sharp-key contexts, but flat-side music inside A♭ minor uses this spelling.',
    intervals: [
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'Fb', name: 'minor 3rd', semitones: 3 },
      { from: 'Fb', to: 'Ab', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In A♭ minor (iiø7) — theoretical', slug: 'a-flat-minor', kind: 'chord' },
      { label: 'Parallel: B♭ minor', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Enharmonic: A♯m7♭5', slug: 'a-sharp-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['b-flat-minor', 'a-flat-minor', 'a-sharp-half-diminished', 'd-flat-major', 'g-flat-major'],
    commonMistakes:
      'B♭m7♭5\'s fifth is F♭, enharmonic to E. Inside A♭-minor key context (which itself is rare) the F♭ spelling preserves consistency. In jazz lead-sheet practice the chord is sometimes written B♭m7♭5 with E as the fifth — strictly incorrect but common. The all-flat spelling is unusual visually because most flat-key chords use only one or two flats.',
    inProgressions:
      'B♭m7♭5 → E♭7 → A♭m is the theoretical ii–V–i in A♭ minor. Since A♭ minor is essentially never used as a tonic, this progression is rare. The chord appears more often as a chromatic colour in late-Romantic harmony or as a tritone-substitute setup in jazz.',
    faq: [
      { q: 'What notes are in a B♭ half-diminished chord?', a: 'B♭ half-diminished contains four notes: B♭ (root), D♭ (minor third), F♭ (diminished fifth — same pitch as E), and A♭ (minor seventh).' },
      { q: 'Is B♭m7♭5 the same as A♯m7♭5?', a: 'Enharmonically yes — same four pitches. B♭m7♭5 is the flat-side spelling; A♯m7♭5 is the sharp-side. In practice both are rare; G♯m7♭5 covers the most common harmonic territory for this pitch set.' },
      { q: 'Why is the fifth F♭ instead of E?', a: 'The half-diminished chord builds on a diminished triad (root, ♭3, ♭5). From B♭, the fifth letter is F; the diminished version of F natural is F♭. Calling the note E would skip the F letter entirely.' },
      { q: 'When would I see B♭m7♭5 in real music?', a: 'Rarely as a tonic-key iiø7 — A♭ minor is essentially never used. The chord appears in late-Romantic chromatic harmony as a colour or in jazz as a substitute for E7♭9 (tritone-related dominant).' },
    ],
  },

  'b-half-diminished': {
    publishAt: '2020-01-01',
    intro:
      'B half-diminished (Bm7♭5 or Bø) — B, D, F, A — is the iiø7 of A minor and one of the most common half-diminished chords in standard repertoire. As the iiø7 of A minor — a key in which Bach, Mozart, Beethoven, and countless jazz musicians wrote — Bm7♭5 appears at the primary cadences of an enormous slice of Western music.',
    intervals: [
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'In A minor (iiø7 → V → i)', slug: 'a-minor', kind: 'chord' },
      { label: 'Parallel: B minor', slug: 'b-minor', kind: 'chord' },
      { label: 'Related: B diminished', slug: 'b-diminished', kind: 'chord' },
    ],
    relatedChords: ['b-diminished', 'b-minor', 'a-minor', 'e-minor', 'd-minor'],
    commonMistakes:
      'Bm7♭5 has all naturals: B-D-F-A. No sharps, no flats — the cleanest half-diminished spelling on the page. The most common error is reading F as F♯, which makes Bm7 (regular minor seventh, no flat fifth); the half-diminished colour requires the lowered fifth (F natural). On guitar, Bm7♭5 is a common closed-position chord on the upper strings — easier to finger than many half-diminished voicings.',
    inProgressions:
      'Bm7♭5 → E7 → Am is the ii–V–i in A minor — used in countless classical works (Bach\'s A-minor literature is full of it) and in every A-minor jazz standard. Mozart\'s K. 310 piano sonata, Beethoven\'s "Pathétique" (which uses related half-diminished colours), and "Autumn Leaves" (in the relative-minor cadence) all rely on this chord.',
    faq: [
      { q: 'What notes are in a B half-diminished chord?', a: 'B half-diminished contains four notes: B (root), D (minor third), F (diminished fifth), and A (minor seventh).' },
      { q: 'How does Bm7♭5 resolve?', a: 'In A minor: Bm7♭5 → E7 → Am. The chord prepares the dominant E7, which resolves to the Am tonic. This is one of the most-used cadences in tonal music.' },
      { q: 'Is Bm7♭5 the same as Bm7?', a: 'No — different chords. Bm7 (B-D-F♯-A) has a perfect fifth; Bm7♭5 (B-D-F-A) lowers that fifth a half step, producing the half-diminished colour and the iiø7 function in A minor.' },
      { q: 'Where does B half-diminished appear in famous music?', a: 'Throughout A-minor literature: Bach\'s A-minor preludes and fugues, Mozart\'s K. 310 sonata, Beethoven\'s "Moonlight" Sonata third movement (in C♯ minor but borrowing related sonorities), and every A-minor jazz standard.' },
    ],
  },

  // ─── Phase 3: major 7th chords (Imaj7 / IVmaj7) ──────────────────────────
  // Major triad plus a major 7th — the lush, dreamy backbone of jazz, bossa
  // nova, and modern ballads. The defining sound of "Girl from Ipanema."

  'c-major-7': {
    publishAt: '2020-01-01',
    intro:
      'C major 7 (Cmaj7) — C, E, G, B — is one of the most foundational chords in jazz harmony. It\'s C major with the 7th degree of the C scale (B) added on top, creating a smooth, complete-sounding sonority that defines the I chord of major-key jazz. Bill Evans built entire arrangements around it; "Cantaloupe Island" and "Maiden Voyage" open with related Cmaj7 colours.',
    intervals: [
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of C major', slug: 'c-major', kind: 'key' },
      { label: 'Parallel: C major triad', slug: 'c-major', kind: 'chord' },
      { label: 'Related: C dominant 7', slug: 'c-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'c-dominant-7', 'd-minor-7', 'g-dominant-7', 'a-minor-7'],
    commonMistakes:
      'The single biggest trap with Cmaj7 is the 7th — B natural, not B♭. Replacing B with B♭ produces C7 (dominant 7), a completely different chord with the urgent "needs to resolve" sound. The maj7 distinction (a half-step higher than a dom7) is what gives Cmaj7 its lush, stable character. On guitar, the open Cmaj7 voicing (x32000) is one of the easiest jazz chords to learn.',
    inProgressions:
      'Cmaj7 is the I chord in C major (jazz). The full ii–V–I in C is Dm7 → G7 → Cmaj7 — the most-used progression in jazz, underlying "Autumn Leaves" (in the relative minor), "All The Things You Are," and countless standards. Cmaj7 also serves as the IV chord of G major (giving a lydian colour) and the bVI of E minor.',
    faq: [
      { q: 'What notes are in a Cmaj7 chord?', a: 'Cmaj7 contains four notes: C (root), E (major third), G (perfect fifth), and B (major seventh).' },
      { q: 'How is Cmaj7 different from C7?', a: 'Only the seventh changes. Cmaj7 has B natural (a major 7th from C); C7 has B♭ (a minor 7th, also called a dominant 7th). The half-step makes Cmaj7 sound stable and dreamy; C7 sounds tense and wants to resolve to F.' },
      { q: 'What does the "maj7" symbol mean?', a: 'It means major 7th chord — a major triad with a major 7th interval added on top. Some scores write it as Δ7 or M7; "Cmaj7" and "CΔ7" and "CM7" are all the same chord.' },
      { q: 'Where does Cmaj7 appear in famous music?', a: 'Bossa nova and jazz standards constantly: "Girl from Ipanema" (in F but using maj7 voicings), "Misty," "All The Things You Are." Stevie Wonder\'s "Ribbon in the Sky," Steely Dan\'s "Aja" — anywhere a smooth, complete I chord is needed.' },
    ],
  },

  'c-sharp-major-7': {
    publishAt: '2020-01-01',
    intro:
      'C♯ major 7 (C♯maj7) — C♯, E♯, G♯, B♯ — is C♯ major with a major 7th on top. The four-sharp-of-sharps spelling (with B♯ enharmonic to C natural and E♯ enharmonic to F) places the chord deep in sharp-key territory. It\'s enharmonically equivalent to D♭maj7 (which has a friendlier five-flat signature) and is rarely written outside C♯ major or G♯ major contexts.',
    intervals: [
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'E#', to: 'G#', name: 'minor 3rd', semitones: 3 },
      { from: 'G#', to: 'B#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Parallel: C♯ major triad', slug: 'c-sharp-major', kind: 'chord' },
      { label: 'Enharmonic: D♭ major 7', slug: 'd-flat-major-7', kind: 'chord' },
      { label: 'Related: C♯ dominant 7', slug: 'c-sharp-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-major', 'd-flat-major-7', 'c-sharp-dominant-7', 'd-sharp-minor-7', 'g-sharp-dominant-7'],
    commonMistakes:
      'Both the third (E♯) and seventh (B♯) are enharmonics for naturals (F and C respectively). Reading them as naturals is wrong inside C♯ major context but the pitch is identical. Most charts use D♭maj7 instead — same sound, dramatically fewer accidentals on the page.',
    inProgressions:
      'C♯maj7 is the I chord in C♯ major and the IV chord in G♯ major. The ii–V–I cadence runs D♯m7 → G♯7 → C♯maj7. In practice the chord is more often notated as D♭maj7 unless the surrounding key signature is firmly on the sharp side.',
    faq: [
      { q: 'What notes are in a C♯maj7 chord?', a: 'C♯maj7 contains four notes: C♯ (root), E♯ (major third — same pitch as F), G♯ (perfect fifth), and B♯ (major seventh — same pitch as C).' },
      { q: 'Is C♯maj7 the same as D♭maj7?', a: 'Yes, enharmonically — same four pitches. C♯maj7 has seven sharps; D♭maj7 has five flats. D♭maj7 is the standard spelling in nearly all literature.' },
      { q: 'Why is the third E♯ and not F?', a: 'Major scales use each of the seven letters once. The C♯ major scale runs C♯-D♯-E♯-F♯-G♯-A♯-B♯ — using C-D-E-F-G-A-B in order. Calling the third "F" would skip the E letter and use F twice.' },
      { q: 'When would I see C♯maj7 instead of D♭maj7?', a: 'Inside music in C♯ major or G♯ major where the surrounding harmony already uses sharps. Bach\'s Well-Tempered Clavier includes a C♯ major prelude that uses this exact spelling.' },
    ],
  },

  'd-flat-major-7': {
    publishAt: '2020-01-01',
    intro:
      'D♭ major 7 (D♭maj7) — D♭, F, A♭, C — is D♭ major with a major 7th on top. The five-flat spelling makes it the standard notation for this lush, romantic chord. Chopin\'s "Raindrop" Prelude uses D♭ harmony constantly; the maj7 extension gives the chord its full late-Romantic / impressionist colour.',
    intervals: [
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of D♭ major', slug: 'd-flat-major', kind: 'key' },
      { label: 'Parallel: D♭ major triad', slug: 'd-flat-major', kind: 'chord' },
      { label: 'Enharmonic: C♯ major 7', slug: 'c-sharp-major-7', kind: 'chord' },
    ],
    relatedChords: ['d-flat-major', 'c-sharp-major-7', 'd-flat-dominant-7', 'e-flat-minor-7', 'a-flat-dominant-7'],
    commonMistakes:
      'The 7th is C natural — a half-step higher than D♭dom7 (which has C♭ as its 7th). The most common error among beginners is reading the maj7 as dom7 or vice versa; the half-step makes all the difference in chord function. On guitar, D♭maj7 is most often played as a 4th-fret C-shape or as a closed-position three-string voicing.',
    inProgressions:
      'D♭maj7 is the I chord in D♭ major. The ii–V–I cadence runs E♭m7 → A♭7 → D♭maj7. Coltrane\'s "Naima" is anchored in A♭ but builds tension on D♭maj7 throughout. In jazz, D♭maj7 also functions as the bVI in F minor and the IV in A♭ major.',
    faq: [
      { q: 'What notes are in a D♭maj7 chord?', a: 'D♭maj7 contains four notes: D♭ (root), F (major third), A♭ (perfect fifth), and C (major seventh).' },
      { q: 'How is D♭maj7 different from D♭7?', a: 'Only the seventh changes. D♭maj7 has C natural (a major 7th from D♭); D♭7 has C♭ (a minor 7th). The maj7 sounds stable and dreamy; the dom7 wants to resolve to G♭.' },
      { q: 'What jazz standards use D♭maj7?', a: 'Coltrane\'s "Naima" features prominent D♭maj7 voicings. "There Will Never Be Another You" passes through D♭maj7 in its bridge. Many ballads modulate to D♭ for the second half precisely because D♭maj7 has such a rich, romantic colour.' },
      { q: 'Is D♭maj7 the same as C♯maj7?', a: 'Enharmonically yes — same four pitches. D♭maj7 (five flats) is the standard spelling; C♯maj7 (seven sharps) appears only in deep sharp-key contexts.' },
    ],
  },

  'd-major-7': {
    publishAt: '2020-01-01',
    intro:
      'D major 7 (Dmaj7) — D, F♯, A, C♯ — is D major with a major 7th on top. The chord shines on guitar because the open strings (D, A) line up with D major harmonics; jazz guitarists from Wes Montgomery onward have made Dmaj7 a signature voicing. "Girl from Ipanema" is in F major but visits Dmaj7-related colours constantly.',
    intervals: [
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of D major', slug: 'd-major', kind: 'key' },
      { label: 'Parallel: D major triad', slug: 'd-major', kind: 'chord' },
      { label: 'Related: D dominant 7', slug: 'd-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'd-dominant-7', 'e-minor-7', 'a-dominant-7', 'b-minor-7'],
    commonMistakes:
      'Dmaj7 has C♯ as its 7th — the leading tone of D. Replacing C♯ with C natural produces D7 (dominant), which has a tense, "needs to resolve" character. On guitar, the open Dmaj7 voicing (xx0222) is among the most-used jazz chords for beginners learning extended harmony.',
    inProgressions:
      'Dmaj7 is the I chord in D major. The ii–V–I cadence runs Em7 → A7 → Dmaj7. Dmaj7 also appears as IV in A major (very common in jazz) and as bVI in F♯ minor. The progression Dmaj7 → Bm7 → Em7 → A7 → Dmaj7 (I–vi–ii–V–I) is the spine of countless ballads.',
    faq: [
      { q: 'What notes are in a Dmaj7 chord?', a: 'Dmaj7 contains four notes: D (root), F♯ (major third), A (perfect fifth), and C♯ (major seventh).' },
      { q: 'How do you play Dmaj7 on guitar?', a: 'The most common voicing is xx0222 — mute strings 6-5, then D (open 4th), F♯ (2nd fret 3rd string), A (2nd fret 2nd string), C♯ (2nd fret 1st string). The voicing is one of the easiest jazz chords to finger.' },
      { q: 'How is Dmaj7 different from D7?', a: 'Only the seventh changes. Dmaj7 has C♯ (major 7th); D7 has C natural (minor / dominant 7th). The half-step shift creates two very different harmonic functions.' },
      { q: 'Where does Dmaj7 appear in famous music?', a: 'In every jazz standard in D major: "Girl from Ipanema" (in F but echoing D-shaped harmony), "Sweet Georgia Brown," "I Got Rhythm" (in various transpositions). Pop ballads in D major from the 60s onward also use Dmaj7 constantly.' },
    ],
  },

  'e-flat-major-7': {
    publishAt: '2020-01-01',
    intro:
      'E♭ major 7 (E♭maj7) — E♭, G, B♭, D — is E♭ major with a major 7th on top. The chord is fundamental to big-band and jazz writing because so many wind instruments transpose to E♭. The Duke Ellington Orchestra played E♭maj7 voicings constantly; Bill Evans built ballads around the chord.',
    intervals: [
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of E♭ major', slug: 'e-flat-major', kind: 'key' },
      { label: 'Parallel: E♭ major triad', slug: 'e-flat-major', kind: 'chord' },
      { label: 'Related: E♭ dominant 7', slug: 'e-flat-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['e-flat-major', 'e-flat-dominant-7', 'f-minor-7', 'b-flat-dominant-7', 'c-minor-7'],
    commonMistakes:
      'The 7th of E♭maj7 is D natural — a half-step higher than E♭7 (which has D♭). Reading D as D♭ produces a dominant 7th with a totally different harmonic function. On piano, the chord falls under the hand as black-white-black-white starting from E♭. On guitar, the 6th-fret A-shape barre with the 7th replacing the octave is the most common voicing.',
    inProgressions:
      'E♭maj7 is the I chord in E♭ major. The ii–V–I runs Fm7 → B♭7 → E♭maj7 — the cadence in every E♭-major jazz standard from "Stella by Starlight" to "Misty." The chord also functions as the IV of B♭ major and the bVI of G minor.',
    faq: [
      { q: 'What notes are in an E♭maj7 chord?', a: 'E♭maj7 contains four notes: E♭ (root), G (major third), B♭ (perfect fifth), and D (major seventh).' },
      { q: 'How is E♭maj7 different from E♭7?', a: 'Only the seventh changes. E♭maj7 has D natural; E♭7 has D♭. The half-step shift turns a stable, dreamy chord into a tense, dominant one that wants to resolve to A♭.' },
      { q: 'What jazz standards use E♭maj7?', a: '"Misty" (in E♭), "Stella by Starlight" (which modulates through E♭), "There Will Never Be Another You," and many other jazz tunes. The horn-friendly key makes it especially common in big-band arrangements.' },
      { q: 'How do you play E♭maj7 on piano?', a: 'Place your thumb on E♭, index finger on G, middle finger on B♭, and pinky on D. The chord falls comfortably under the hand once memorised.' },
    ],
  },

  'e-major-7': {
    publishAt: '2020-01-01',
    intro:
      'E major 7 (Emaj7) — E, G♯, B, D♯ — is E major with a major 7th on top. The chord is a guitar favourite because the open low E string makes Emaj7 voicings ring out fully. Joe Pass and Jim Hall both used Emaj7 constantly; the chord is the foundation of bossa-nova jazz guitar.',
    intervals: [
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of E major', slug: 'e-major', kind: 'key' },
      { label: 'Parallel: E major triad', slug: 'e-major', kind: 'chord' },
      { label: 'Related: E dominant 7', slug: 'e-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['e-major', 'e-dominant-7', 'f-sharp-minor-7', 'b-dominant-7', 'c-sharp-minor-7'],
    commonMistakes:
      'Emaj7 has D♯ as its 7th — the leading tone of E. Replacing D♯ with D natural produces E7 (dominant), which has a bluesy, resolution-seeking sound. On guitar, the open Emaj7 voicing (021100) keeps the bass E ringing while moving the 4th-string finger off the standard E shape to grab D♯.',
    inProgressions:
      'Emaj7 is the I chord in E major. The ii–V–I runs F♯m7 → B7 → Emaj7. The chord also appears as IV of B major (giving a lydian colour) and bVI of G♯ minor. Wes Montgomery\'s "Bumpin\' on Sunset" uses Emaj7 as its primary tonic.',
    faq: [
      { q: 'What notes are in an Emaj7 chord?', a: 'Emaj7 contains four notes: E (root), G♯ (major third), B (perfect fifth), and D♯ (major seventh).' },
      { q: 'How do you play Emaj7 on guitar?', a: 'The standard open voicing is 021100: open low E, B (2nd fret 5th string), E (2nd fret 4th string), G♯ (1st fret 3rd string), B (open 2nd string), and an optional open high E. The D♯ on top can be added at the 11th fret of the 1st string for a closed voicing.' },
      { q: 'How is Emaj7 different from E7?', a: 'Only the seventh changes. Emaj7 has D♯ (major 7th); E7 has D natural (minor / dominant 7th). E7 wants to resolve to A; Emaj7 sits stably as the tonic of E major.' },
      { q: 'What pieces use Emaj7?', a: 'Wes Montgomery\'s "Bumpin\' on Sunset," many Joe Pass arrangements, bossa-nova standards transposed to E. Jeff Buckley\'s "Hallelujah" (in C major but uses related lush 7th voicings throughout).' },
    ],
  },

  'f-major-7': {
    publishAt: '2020-01-01',
    intro:
      'F major 7 (Fmaj7) — F, A, C, E — is F major with a major 7th on top. The chord is a beginner-jazz favourite because its notes are all naturals; many introductory jazz primers use Fmaj7 as the first 7th chord students learn. On guitar, the partial Fmaj7 voicing (xx3210) avoids the dreaded F barre while still capturing the chord\'s full character.',
    intervals: [
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of F major', slug: 'f-major', kind: 'key' },
      { label: 'Parallel: F major triad', slug: 'f-major', kind: 'chord' },
      { label: 'Related: F dominant 7', slug: 'f-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'f-dominant-7', 'g-minor-7', 'c-dominant-7', 'd-minor-7'],
    commonMistakes:
      'Fmaj7 has E natural as its 7th. Replacing E with E♭ produces F7 (dominant), which has a "needs to resolve" character. The most common beginner error is reading the chord as F minor 7 (which would be F-A♭-C-E♭). On guitar, the partial voicing xx3210 lets you play Fmaj7 with one open string and avoids the barre entirely.',
    inProgressions:
      'Fmaj7 is the I chord in F major. The ii–V–I runs Gm7 → C7 → Fmaj7 — the cadence in countless F-major jazz standards. The chord also serves as the IV of C major (where its lydian colour gives a slight float to the tonic-IV relationship) and the bVI of A minor.',
    faq: [
      { q: 'What notes are in an Fmaj7 chord?', a: 'Fmaj7 contains four notes: F (root), A (major third), C (perfect fifth), and E (major seventh).' },
      { q: 'How do you play Fmaj7 on guitar?', a: 'The most common partial voicing is xx3210: mute strings 6-5, then F (3rd fret 4th string), A (2nd fret 3rd string), C (1st fret 2nd string), and E (open 1st string). This voicing avoids the F barre entirely.' },
      { q: 'How is Fmaj7 different from F7?', a: 'Only the seventh changes. Fmaj7 has E natural; F7 has E♭. Fmaj7 sounds smooth and stable; F7 sounds tense and pulls toward B♭.' },
      { q: 'What jazz standards use Fmaj7?', a: '"Girl from Ipanema" (in F major), "All The Things You Are" (which passes through F major), countless bossa-nova tunes. Fmaj7 is one of the most-played beginner jazz chords because of its all-natural spelling.' },
    ],
  },

  'f-sharp-major-7': {
    publishAt: '2020-01-01',
    intro:
      'F♯ major 7 (F♯maj7) — F♯, A♯, C♯, E♯ — is F♯ major with a major 7th on top. The six-sharp key signature makes the chord visually dense, but the sound is exactly the same as its enharmonic neighbour G♭maj7 (six flats). Wagner used F♯ major harmony in dense chromatic passages; jazz uses F♯maj7 in modulations that pivot from B major harmony.',
    intervals: [
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of F♯ major', slug: 'f-sharp-major', kind: 'key' },
      { label: 'Parallel: F♯ major triad', slug: 'f-sharp-major', kind: 'chord' },
      { label: 'Enharmonic: G♭ major 7', slug: 'g-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-major', 'g-flat-major-7', 'f-sharp-dominant-7', 'g-sharp-minor-7', 'c-sharp-dominant-7'],
    commonMistakes:
      'F♯maj7 has E♯ as its 7th (enharmonic to F natural). Inside F♯-major key contexts the E♯ spelling preserves the seven-letter rule; in jazz lead sheets the same chord may be written F♯maj7 with F as the 7th letter — strictly incorrect but common. The chord is sometimes notated as G♭maj7 in flat-key contexts.',
    inProgressions:
      'F♯maj7 is the I chord in F♯ major. The ii–V–I cadence runs G♯m7 → C♯7 → F♯maj7. The chord also serves as the IV of C♯ major and bVI of A♯ minor. Modulations from B major to F♯ major are common in late-Romantic and modern jazz; the V (C♯7) leads naturally to F♯maj7.',
    faq: [
      { q: 'What notes are in an F♯maj7 chord?', a: 'F♯maj7 contains four notes: F♯ (root), A♯ (major third), C♯ (perfect fifth), and E♯ (major seventh — same pitch as F).' },
      { q: 'Is F♯maj7 the same as G♭maj7?', a: 'Yes, enharmonically — same four pitches. F♯maj7 has six sharps; G♭maj7 has six flats. They\'re equally valid; composers pick one based on surrounding harmony.' },
      { q: 'Why is the 7th E♯ and not F?', a: 'Major scales use each of the seven letters exactly once. The F♯ major scale runs F♯-G♯-A♯-B-C♯-D♯-E♯ — using each letter in order. Calling the 7th "F" would skip the E letter and use F twice.' },
      { q: 'When would I see F♯maj7 in real music?', a: 'In music notated in F♯ major or C♯ major. In jazz, F♯maj7 appears when surrounding chords use sharp-side notation. In late-Romantic classical music it appears in chromatic passages through F♯ major.' },
    ],
  },

  'g-flat-major-7': {
    publishAt: '2020-01-01',
    intro:
      'G♭ major 7 (G♭maj7) — G♭, B♭, D♭, F — is G♭ major with a major 7th on top. The six-flat key signature is dense but the chord\'s sound is lush and far-removed from the bright energy of sharp-side maj7 chords. G♭maj7 is enharmonic to F♯maj7; composers choose based on surrounding harmony.',
    intervals: [
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of G♭ major', slug: 'g-flat-major', kind: 'key' },
      { label: 'Parallel: G♭ major triad', slug: 'g-flat-major', kind: 'chord' },
      { label: 'Enharmonic: F♯ major 7', slug: 'f-sharp-major-7', kind: 'chord' },
    ],
    relatedChords: ['g-flat-major', 'f-sharp-major-7', 'g-flat-dominant-7', 'a-flat-minor-7', 'd-flat-dominant-7'],
    commonMistakes:
      'G♭maj7 has F natural as its 7th — a half-step higher than G♭7 (which has F♭, enharmonic to E natural). The maj7 / dom7 distinction is crucial; the F natural sits a half-step from the root G♭, giving the chord its lush, slightly bittersweet character. Most jazz charts in flat-side keys use G♭maj7 directly; sharp-key contexts respell as F♯maj7.',
    inProgressions:
      'G♭maj7 is the I chord in G♭ major. The ii–V–I cadence runs A♭m7 → D♭7 → G♭maj7. Wayne Shorter\'s "Footprints" and many other modal jazz tunes drift through G♭maj7 voicings. In late-Romantic music, G♭maj7 often appears as a chromatic-mediant approach to D major or E♭ minor.',
    faq: [
      { q: 'What notes are in a G♭maj7 chord?', a: 'G♭maj7 contains four notes: G♭ (root), B♭ (major third), D♭ (perfect fifth), and F (major seventh).' },
      { q: 'Is G♭maj7 the same as F♯maj7?', a: 'Yes, enharmonically — same four pitches. G♭maj7 has six flats; F♯maj7 has six sharps. They\'re identical in sound and equally valid notationally.' },
      { q: 'How is G♭maj7 different from G♭7?', a: 'Only the seventh changes. G♭maj7 has F natural; G♭7 has F♭ (= E). The half-step turns a stable, dreamy chord into a tense, dominant one that wants to resolve to C♭ (= B).' },
      { q: 'Where does G♭maj7 appear in jazz?', a: 'In any jazz tune in G♭ major or with G♭-major modulations. "Lush Life" by Billy Strayhorn passes through G♭-major colours; many ballads modulate to G♭ for the bridge specifically because G♭maj7 has such a distinct lush colour.' },
    ],
  },

  'g-major-7': {
    publishAt: '2020-01-01',
    intro:
      'G major 7 (Gmaj7) — G, B, D, F♯ — is G major with a major 7th on top. The chord is a guitar staple because the standard G voicing barely changes to become Gmaj7 (just lift the F note off the 1st string). The chord opens many jazz ballads and serves as the I in countless G-major standards.',
    intervals: [
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of G major', slug: 'g-major', kind: 'key' },
      { label: 'Parallel: G major triad', slug: 'g-major', kind: 'chord' },
      { label: 'Related: G dominant 7', slug: 'g-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'g-dominant-7', 'a-minor-7', 'd-dominant-7', 'e-minor-7'],
    commonMistakes:
      'Gmaj7 has F♯ as its 7th. Replacing F♯ with F natural produces G7 (dominant), which has a tense, bluesy character. The half-step is what defines the chord\'s major-7 quality. On guitar, the open Gmaj7 voicing (3x0002 or 320002) keeps the bass G and adds F♯ on the 2nd string.',
    inProgressions:
      'Gmaj7 is the I chord in G major. The ii–V–I runs Am7 → D7 → Gmaj7. The chord also serves as the IV of D major and bVI of B minor. Pop-jazz crossovers from the 70s onward use Gmaj7 heavily — Steely Dan, Stevie Wonder, Donald Fagen all built song forms around it.',
    faq: [
      { q: 'What notes are in a Gmaj7 chord?', a: 'Gmaj7 contains four notes: G (root), B (major third), D (perfect fifth), and F♯ (major seventh).' },
      { q: 'How do you play Gmaj7 on guitar?', a: 'The standard open voicing is 3x0002 or 320002 — G on the 6th string, optional B on the 5th string, open D and G on the 4th and 3rd, open B on the 2nd, and F♯ on the 2nd fret of the 1st string.' },
      { q: 'How is Gmaj7 different from G7?', a: 'Only the seventh changes. Gmaj7 has F♯ (major 7th); G7 has F natural (minor / dominant 7th). Gmaj7 sounds stable; G7 wants to resolve to C.' },
      { q: 'What pieces use Gmaj7?', a: 'Steely Dan\'s "Aja," Stevie Wonder\'s "Visions," "Have You Met Miss Jones" (in F major but visiting G-related harmony), and countless other jazz-pop standards. Gmaj7 is one of the most-played 7th chords on guitar.' },
    ],
  },

  'a-flat-major-7': {
    publishAt: '2020-01-01',
    intro:
      'A♭ major 7 (A♭maj7) — A♭, C, E♭, G — is A♭ major with a major 7th on top. The four-flat key signature is comfortable for both pianists and horn players; A♭ is one of the most-used jazz keys, and A♭maj7 appears at every primary cadence in A♭-major literature.',
    intervals: [
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of A♭ major', slug: 'a-flat-major', kind: 'key' },
      { label: 'Parallel: A♭ major triad', slug: 'a-flat-major', kind: 'chord' },
      { label: 'Related: A♭ dominant 7', slug: 'a-flat-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'a-flat-dominant-7', 'b-flat-minor-7', 'e-flat-dominant-7', 'f-minor-7'],
    commonMistakes:
      'A♭maj7 has G natural as its 7th — a half-step higher than A♭7 (which has G♭). The leading-tone G in A♭ major is what gives the chord its full, complete-sounding character. On piano, A♭maj7 falls comfortably as black-white-black-white. On guitar, the most common voicing is a 4th-fret E-shape barre with the 7th adjusted.',
    inProgressions:
      'A♭maj7 is the I chord in A♭ major. The ii–V–I runs B♭m7 → E♭7 → A♭maj7 — the cadence in many great jazz ballads including "Misty" (which centres in A♭) and "What Are You Doing the Rest of Your Life." The chord also serves as the IV of E♭ major and bVI of C minor.',
    faq: [
      { q: 'What notes are in an A♭maj7 chord?', a: 'A♭maj7 contains four notes: A♭ (root), C (major third), E♭ (perfect fifth), and G (major seventh).' },
      { q: 'How is A♭maj7 different from A♭7?', a: 'Only the seventh changes. A♭maj7 has G natural; A♭7 has G♭. The half-step turns a stable I chord into a tense dominant that wants to resolve to D♭.' },
      { q: 'What jazz standards use A♭maj7?', a: '"Misty" (in A♭), "What Are You Doing the Rest of Your Life," "Body and Soul" (in D♭ but with A♭-related modulations). Many ballads use A♭ because the key is comfortable for both vocalists and horns.' },
      { q: 'How do you play A♭maj7 on piano?', a: 'Place your thumb on A♭, index finger on C, middle finger on E♭, and pinky on G. The chord pattern (black-white-black-white) falls comfortably under the hand once memorised.' },
    ],
  },

  'a-major-7': {
    publishAt: '2020-01-01',
    intro:
      'A major 7 (Amaj7) — A, C♯, E, G♯ — is A major with a major 7th on top. The chord is a guitar favourite because the open A string can serve as the bass; the standard open voicing (x02120) is one of the easiest jazz chords to finger.',
    intervals: [
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of A major', slug: 'a-major', kind: 'key' },
      { label: 'Parallel: A major triad', slug: 'a-major', kind: 'chord' },
      { label: 'Related: A dominant 7', slug: 'a-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'a-dominant-7', 'b-minor-7', 'e-dominant-7', 'f-sharp-minor-7'],
    commonMistakes:
      'Amaj7 has G♯ as its 7th — the leading tone of A. Replacing G♯ with G natural produces A7 (dominant), which is the famous blues-cadence chord. The half-step shift completely changes the function. On guitar, the open Amaj7 voicing (x02120) gives a clean, lush sound; the closed-position 5th-fret E-shape barre is the most common alternative.',
    inProgressions:
      'Amaj7 is the I chord in A major. The ii–V–I runs Bm7 → E7 → Amaj7. The chord also serves as IV of E major and bVI of C♯ minor. Many bossa-nova standards modulate to A major for the bridge (the key sits comfortably for both guitar and vocals), making Amaj7 a constant presence in the bossa-nova repertoire.',
    faq: [
      { q: 'What notes are in an Amaj7 chord?', a: 'Amaj7 contains four notes: A (root), C♯ (major third), E (perfect fifth), and G♯ (major seventh).' },
      { q: 'How do you play Amaj7 on guitar?', a: 'The open voicing x02120: mute the low E, then A (open 5th), E (2nd fret 4th string), G♯ (1st fret 3rd string), C♯ (2nd fret 2nd string), and open high E.' },
      { q: 'How is Amaj7 different from A7?', a: 'Only the seventh changes. Amaj7 has G♯; A7 has G natural. Amaj7 sounds dreamy and stable; A7 sounds bluesy and pulls toward D.' },
      { q: 'What pieces use Amaj7?', a: 'Many bossa-nova standards: "Wave," "Corcovado" (in C major but with A♭/A-related modulations), and countless jazz-pop tunes in A. The Beatles\' "Something" hovers around A major and uses related extended voicings.' },
    ],
  },

  'b-flat-major-7': {
    publishAt: '2020-01-01',
    intro:
      'B♭ major 7 (B♭maj7) — B♭, D, F, A — is B♭ major with a major 7th on top. The chord is fundamental to big-band jazz because B♭ is the natural key for trumpets, tenor saxophones, and clarinets (B♭ instruments). Most jazz "fake books" notate tunes in B♭ specifically because the horns play comfortably there.',
    intervals: [
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of B♭ major', slug: 'b-flat-major', kind: 'key' },
      { label: 'Parallel: B♭ major triad', slug: 'b-flat-major', kind: 'chord' },
      { label: 'Related: B♭ dominant 7', slug: 'b-flat-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'b-flat-dominant-7', 'c-minor-7', 'f-dominant-7', 'g-minor-7'],
    commonMistakes:
      'B♭maj7 has A natural as its 7th — a half-step higher than B♭7 (which has A♭). The half-step shift turns a stable I chord into a tense dominant. On guitar, B♭maj7 is most often a 1st-fret A-shape barre with the 4th-string finger adjusted to grab the major 7th.',
    inProgressions:
      'B♭maj7 is the I chord in B♭ major. The ii–V–I runs Cm7 → F7 → B♭maj7. The chord underlies many big-band charts and bebop standards including "Confirmation," "Anthropology," and "Donna Lee" — all in B♭ major and all centred on B♭maj7 as the home chord.',
    faq: [
      { q: 'What notes are in a B♭maj7 chord?', a: 'B♭maj7 contains four notes: B♭ (root), D (major third), F (perfect fifth), and A (major seventh).' },
      { q: 'How is B♭maj7 different from B♭7?', a: 'Only the seventh changes. B♭maj7 has A natural; B♭7 has A♭. The maj7 sounds stable; the dom7 wants to resolve to E♭.' },
      { q: 'What jazz standards use B♭maj7?', a: '"Confirmation," "Anthropology," "Donna Lee" — all Charlie Parker / bebop standards in B♭. "Just Friends," "Have You Met Miss Jones" (in F but with B♭ excursions), and most B♭-major big-band charts.' },
      { q: 'Why is B♭ major so common in jazz?', a: 'Because B♭ is the natural concert key for trumpets, tenor saxes, and clarinets. Most jazz tunes were originally arranged for big bands, and B♭ puts the horns in their easiest registers.' },
    ],
  },

  'b-major-7': {
    publishAt: '2020-01-01',
    intro:
      'B major 7 (Bmaj7) — B, D♯, F♯, A♯ — is B major with a major 7th on top. The five-sharp key signature is dense but the chord shines on guitar in closed-position voicings starting from the 2nd fret. B major is a less common key in classical literature but appears regularly in jazz tunes transposed for vocal range.',
    intervals: [
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
    ],
    relatedKeys: [
      { label: 'Key of B major', slug: 'b-major', kind: 'key' },
      { label: 'Parallel: B major triad', slug: 'b-major', kind: 'chord' },
      { label: 'Related: B dominant 7', slug: 'b-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['b-major', 'b-dominant-7', 'c-sharp-minor-7', 'f-sharp-dominant-7', 'g-sharp-minor-7'],
    commonMistakes:
      'Bmaj7 has A♯ as its 7th — the leading tone of B. Replacing A♯ with A natural produces B7 (dominant). The five-sharp signature is dense; sight-readers benefit from confirming the A♯ on neighbouring chords too. On guitar, Bmaj7 is most often a 2nd-fret A-shape barre with the 4th string adjusted to grab the A♯.',
    inProgressions:
      'Bmaj7 is the I chord in B major. The ii–V–I runs C♯m7 → F♯7 → Bmaj7. The chord also serves as IV of F♯ major and bVI of D♯ minor. Many jazz singers transpose tunes to B major because the key sits well for tenor and soprano voices; Bmaj7 then appears at every cadence.',
    faq: [
      { q: 'What notes are in a Bmaj7 chord?', a: 'Bmaj7 contains four notes: B (root), D♯ (major third), F♯ (perfect fifth), and A♯ (major seventh).' },
      { q: 'How do you play Bmaj7 on guitar?', a: 'Most commonly a 2nd-fret A-shape barre: index across strings 5-1 on fret 2, ring finger on the 4th fret of the 4th string (D♯), middle finger on the 3rd fret of the 3rd string (F♯), pinky on the 4th fret of the 2nd string (A♯).' },
      { q: 'How is Bmaj7 different from B7?', a: 'Only the seventh changes. Bmaj7 has A♯; B7 has A natural. Bmaj7 sounds stable as a tonic; B7 sounds tense and pulls toward E.' },
      { q: 'What pieces use Bmaj7?', a: 'Many jazz vocal standards transposed to B for range: "Misty," "What Are You Doing the Rest of Your Life," and others. Less common in classical literature where C major or D major would be preferred.' },
    ],
  },

  // ─── Phase 3: minor 7th chords (im7 / iim7 / vim7) ────────────────────────
  // Minor triad plus a minor 7th — the bluesy, mellow workhorse of jazz
  // and R&B. The ii chord of major-key ii–V–I cadences.

  'c-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'C minor 7 (Cm7) — C, E♭, G, B♭ — is C minor with a minor 7th on top. The chord is the iim7 of B♭ major (every B♭-major jazz tune cadences through Cm7 → F7 → B♭maj7) and the im7 of C minor in modal jazz. Miles Davis\'s "So What" is built on Dm7 with a Cm7-like modal feel; Cm7 itself appears in countless flat-key standards.',
    intervals: [
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of C minor (= E♭ major)', slug: 'e-flat-major', kind: 'key' },
      { label: 'Parallel: C minor triad', slug: 'c-minor', kind: 'chord' },
      { label: 'Related: C major 7', slug: 'c-major-7', kind: 'chord' },
    ],
    relatedChords: ['c-minor', 'c-major-7', 'b-flat-major-7', 'f-dominant-7', 'e-flat-major-7'],
    commonMistakes:
      'Cm7 has B♭ as its 7th — a minor 7th from C. Replacing B♭ with B natural produces Cm(maj7), a much rarer and tenser chord. The minor-7th distinction is what gives Cm7 its mellow, complete-sounding character. On guitar, Cm7 is most often a 3rd-fret A-shape barre with the 4th-string finger adjusted.',
    inProgressions:
      'Cm7 is the iim7 of B♭ major (Cm7 → F7 → B♭maj7) and the vim7 of E♭ major. As the im7 of C minor in modal jazz, the chord sits stably without needing to resolve — a different function from its tonal cadential role.',
    faq: [
      { q: 'What notes are in a Cm7 chord?', a: 'Cm7 contains four notes: C (root), E♭ (minor third), G (perfect fifth), and B♭ (minor seventh).' },
      { q: 'How is Cm7 different from Cm(maj7)?', a: 'Only the seventh changes. Cm7 has B♭ (minor 7th); Cm(maj7) has B natural (major 7th). Cm(maj7) is the famous "James Bond" chord — much more tense and unstable.' },
      { q: 'What jazz standards use Cm7?', a: '"All The Things You Are" passes through Cm7 in its opening. Any tune in B♭ major or E♭ major cadences through Cm7 at some point. Modal tunes like "Maiden Voyage" use Cm7 voicings constantly.' },
      { q: 'How do you play Cm7 on guitar?', a: 'Most commonly a 3rd-fret A-shape barre: index across strings 5-1 on fret 3, ring finger on the 5th fret of the 4th string, middle finger on the 3rd fret of the 3rd string, pinky on the 4th fret of the 2nd string.' },
    ],
  },

  'c-sharp-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'C♯ minor 7 (C♯m7) — C♯, E, G♯, B — is C♯ minor with a minor 7th on top. The chord is the iim7 of B major (cadencing C♯m7 → F♯7 → Bmaj7) and the im7 of C♯ minor in modal contexts. Many jazz singers transpose tunes to B major for vocal range, putting C♯m7 in the iim7 slot constantly.',
    intervals: [
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of C♯ minor (= E major)', slug: 'e-major', kind: 'key' },
      { label: 'Parallel: C♯ minor triad', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Related: C♯ major 7', slug: 'c-sharp-major-7', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-minor', 'c-sharp-major-7', 'b-major-7', 'f-sharp-dominant-7', 'e-major-7'],
    commonMistakes:
      'C♯m7 has B natural as its 7th. The mix of sharps (C♯, G♯) and naturals (E, B) is the chord\'s signature. Replacing B with B♭ would produce a chord outside the seven-letter-rule. On guitar, C♯m7 is most often a 4th-fret A-shape barre.',
    inProgressions:
      'C♯m7 is the iim7 of B major (the ii–V–I runs C♯m7 → F♯7 → Bmaj7), the vim7 of E major, and the im7 of C♯ minor. Many jazz ballads in B major use C♯m7 as their primary supertonic chord.',
    faq: [
      { q: 'What notes are in a C♯m7 chord?', a: 'C♯m7 contains four notes: C♯ (root), E (minor third), G♯ (perfect fifth), and B (minor seventh).' },
      { q: 'What key does C♯m7 belong to?', a: 'C♯m7 is the iim7 of B major and the vim7 of E major. As the im7 of C♯ minor, the chord serves as a modal-jazz tonic without needing to resolve.' },
      { q: 'How do you play C♯m7 on guitar?', a: 'Most commonly a 4th-fret A-shape barre: index across strings 5-1 on fret 4, ring finger on the 6th fret of the 4th string, middle finger on the 4th fret of the 3rd string, pinky on the 5th fret of the 2nd string.' },
      { q: 'Is C♯m7 the same as D♭m7?', a: 'Enharmonically yes. D♭m7 (D♭-F♭-A♭-C♭) is essentially never written because of the F♭ and C♭ accidentals; C♯m7 is the standard spelling.' },
    ],
  },

  'd-flat-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'D♭ minor 7 (D♭m7) — D♭, F♭, A♭, C♭ — is D♭ minor with a minor 7th on top. The deeply flat spelling (with F♭ and C♭ enharmonic to E and B) makes this chord almost never appear in published music. The same pitches are universally written as C♯m7 (no double accidentals).',
    intervals: [
      { from: 'Db', to: 'Fb', name: 'minor 3rd', semitones: 3 },
      { from: 'Fb', to: 'Ab', name: 'major 3rd', semitones: 4 },
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: C♯ minor 7', slug: 'c-sharp-minor-7', kind: 'chord' },
      { label: 'Parallel: D♭ minor (theoretical)', slug: 'd-flat-minor', kind: 'chord' },
      { label: 'Related: D♭ major 7', slug: 'd-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['d-flat-minor', 'c-sharp-minor-7', 'd-flat-major-7', 'a-flat-minor-7', 'e-major-7'],
    commonMistakes:
      'D♭m7 contains F♭ and C♭ — both enharmonics for naturals (E and B). The spelling exists for theoretical consistency inside heavily flat-side music, but in practice the chord is always written C♯m7. Treat D♭m7 as a notation curiosity rather than a working chord symbol.',
    inProgressions:
      'D♭m7 doesn\'t function as a tonic in practical music. The chord may appear briefly as a chromatic passing chord in dense flat-key Romantic harmony, but every such instance can be respelled as C♯m7 — the version musicians actually read.',
    faq: [
      { q: 'What notes are in a D♭m7 chord?', a: 'D♭m7 contains four notes: D♭ (root), F♭ (minor third — same as E), A♭ (perfect fifth), and C♭ (minor seventh — same as B).' },
      { q: 'Is D♭m7 the same as C♯m7?', a: 'Yes, enharmonically — same four pitches. D♭m7 requires F♭ and C♭ (both unusual accidentals); C♯m7 uses only sharps and naturals. C♯m7 is the universal practical spelling.' },
      { q: 'When would I see D♭m7 in music?', a: 'Essentially never as a working chord symbol. The spelling appears only in deeply chromatic flat-key Romantic music where surrounding harmony demands flat-side consistency.' },
      { q: 'Why is the third F♭ instead of E?', a: 'The minor 7th chord stacks thirds on each letter from the root. D♭ minor uses letters D-F-A-C; the minor third lands on the F letter, which becomes F♭ when lowered from F natural.' },
    ],
  },

  'd-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'D minor 7 (Dm7) — D, F, A, C — is D minor with a minor 7th on top. All four notes are naturals — the cleanest minor 7th spelling on the page. Miles Davis\'s "So What" is built on Dm7 (the chord plays for 16 bars at the top of the form); the chord is also the iim7 of C major and the vim7 of F major.',
    intervals: [
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of D minor (= F major)', slug: 'f-major', kind: 'key' },
      { label: 'Parallel: D minor triad', slug: 'd-minor', kind: 'chord' },
      { label: 'Related: D dominant 7', slug: 'd-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['d-minor', 'd-dominant-7', 'c-major-7', 'g-dominant-7', 'f-major-7'],
    commonMistakes:
      'Dm7 is one of the easier chords to spell because all four notes are naturals — but the most common error is reading the chord as Dmaj7 (which would have C♯ as the 7th). The minor-7th C is what gives Dm7 its mellow, blues-tinged character. On guitar, the open Dm7 voicing (xx0211) is one of the easiest jazz chords for beginners.',
    inProgressions:
      'Dm7 is the iim7 of C major (the ii–V–I runs Dm7 → G7 → Cmaj7), the vim7 of F major, and the im7 of D minor in modal jazz. Miles Davis\'s "So What" makes Dm7 a 16-bar tonic in its modal A section.',
    faq: [
      { q: 'What notes are in a Dm7 chord?', a: 'Dm7 contains four notes: D (root), F (minor third), A (perfect fifth), and C (minor seventh).' },
      { q: 'How do you play Dm7 on guitar?', a: 'The open Dm7 voicing is xx0211: mute strings 6-5, then D (open 4th), A (2nd fret 3rd string), C (1st fret 2nd string), and F (1st fret 1st string).' },
      { q: 'What jazz standards use Dm7?', a: '"So What" by Miles Davis (modal Dm7 for 16 bars), "Autumn Leaves" (in its relative minor cadence to Am7), "Maiden Voyage" by Herbie Hancock (which uses parallel m7 chords). Dm7 is one of the most-played 7th chords in jazz.' },
      { q: 'How is Dm7 different from Dm(maj7)?', a: 'Only the seventh changes. Dm7 has C natural; Dm(maj7) has C♯. Dm(maj7) is the famous "James Bond" chord — much more tense.' },
    ],
  },

  'd-sharp-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'D♯ minor 7 (D♯m7) — D♯, F♯, A♯, C♯ — is D♯ minor with a minor 7th on top. The chord is the iim7 of C♯ major (and enharmonically the iim7 of D♭ major when respelled as E♭m7). All four notes are sharp — the highest-sharp-count m7 chord that avoids double accidentals.',
    intervals: [
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of D♯ minor (= F♯ major)', slug: 'f-sharp-major', kind: 'key' },
      { label: 'Parallel: D♯ minor triad', slug: 'd-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: E♭ minor 7', slug: 'e-flat-minor-7', kind: 'chord' },
    ],
    relatedChords: ['d-sharp-minor', 'e-flat-minor-7', 'c-sharp-major-7', 'g-sharp-dominant-7', 'f-sharp-major-7'],
    commonMistakes:
      'All four notes carry sharps. The most common error is dropping one — reading F♯ as F natural makes a different chord (D♯dim7 essentially). The chord is enharmonically equivalent to E♭m7 (E♭-G♭-B♭-D♭); in flat-key contexts E♭m7 is the preferred spelling.',
    inProgressions:
      'D♯m7 is the iim7 of C♯ major (the ii–V–I runs D♯m7 → G♯7 → C♯maj7) and the vim7 of F♯ major. As the im7 of D♯ minor in modal jazz, it serves as a tonic chord that doesn\'t need to resolve.',
    faq: [
      { q: 'What notes are in a D♯m7 chord?', a: 'D♯m7 contains four notes: D♯ (root), F♯ (minor third), A♯ (perfect fifth), and C♯ (minor seventh).' },
      { q: 'Is D♯m7 the same as E♭m7?', a: 'Yes, enharmonically — same four pitches. D♯m7 lives inside C♯-major key contexts; E♭m7 (E♭-G♭-B♭-D♭) is the flat-side spelling and is much more common in published jazz charts.' },
      { q: 'How do you play D♯m7 on guitar?', a: 'Most commonly a 6th-fret A-shape barre: index across strings 5-1 on fret 6, ring finger on the 8th fret of the 4th string, middle finger on the 6th fret of the 3rd string, pinky on the 7th fret of the 2nd string.' },
      { q: 'When would I see D♯m7 instead of E♭m7?', a: 'In music notated in C♯ major or F♯ major — keeping consistent sharp-side spelling. Outside those keys, E♭m7 is the universal practical spelling.' },
    ],
  },

  'e-flat-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'E♭ minor 7 (E♭m7) — E♭, G♭, B♭, D♭ — is E♭ minor with a minor 7th on top. The chord is the iim7 of D♭ major (the ii–V–I runs E♭m7 → A♭7 → D♭maj7) and a workhorse jazz chord in flat-side keys. Coltrane\'s "Naima" features E♭m7-related voicings prominently.',
    intervals: [
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of E♭ minor (= G♭ major)', slug: 'g-flat-major', kind: 'key' },
      { label: 'Parallel: E♭ minor triad', slug: 'e-flat-minor', kind: 'chord' },
      { label: 'Related: E♭ major 7', slug: 'e-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['e-flat-minor', 'e-flat-major-7', 'd-flat-major-7', 'a-flat-dominant-7', 'b-flat-minor-7'],
    commonMistakes:
      'E♭m7 has three flats on top of the E♭ root — every note except the root is flat. The most common error is misreading G♭ as G natural (which would produce E♭maj7\'s wider third) or D♭ as D natural (which would be E♭m maj7). On guitar, E♭m7 is most often a 6th-fret A-shape barre.',
    inProgressions:
      'E♭m7 is the iim7 of D♭ major (E♭m7 → A♭7 → D♭maj7) and the vim7 of G♭ major. The chord underlies any D♭-major or G♭-major jazz tune. Coltrane\'s "Naima" (in A♭ major but modulating through D♭ harmony) uses E♭m7-related colours constantly.',
    faq: [
      { q: 'What notes are in an E♭m7 chord?', a: 'E♭m7 contains four notes: E♭ (root), G♭ (minor third), B♭ (perfect fifth), and D♭ (minor seventh).' },
      { q: 'Is E♭m7 the same as D♯m7?', a: 'Yes, enharmonically. E♭m7 is the flat-side spelling (used in D♭-major contexts); D♯m7 is the sharp-side spelling. E♭m7 is much more common in published jazz literature.' },
      { q: 'What jazz standards use E♭m7?', a: 'Coltrane\'s "Naima" (with its D♭-major colour modulations), "Lush Life" by Billy Strayhorn, and many other deeply flat-side ballads. The chord is fundamental to advanced jazz harmony in D♭ / G♭.' },
      { q: 'How do you play E♭m7 on guitar?', a: 'Most commonly a 6th-fret A-shape barre: index across strings 5-1 on fret 6, ring finger on the 8th fret of the 4th string, middle finger on the 6th fret of the 3rd string, pinky on the 7th fret of the 2nd string.' },
    ],
  },

  'e-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'E minor 7 (Em7) — E, G, B, D — is E minor with a minor 7th on top. All four notes are naturals, making Em7 one of the cleanest m7 spellings on the page. The chord is the iim7 of D major (Em7 → A7 → Dmaj7) and the vim7 of G major; on guitar, the open Em7 voicing (022030) is among the easiest jazz chords.',
    intervals: [
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of E minor (= G major)', slug: 'g-major', kind: 'key' },
      { label: 'Parallel: E minor triad', slug: 'e-minor', kind: 'chord' },
      { label: 'Related: E dominant 7', slug: 'e-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['e-minor', 'e-dominant-7', 'd-major-7', 'a-dominant-7', 'g-major-7'],
    commonMistakes:
      'Em7 is all naturals. The most common error is misreading the chord as Em(maj7) (which would have D♯ as the 7th) or as E7 (which would have G♯ as the third). On guitar, the open Em7 voicing (022030) is widely used; the closed-position 7th-fret A-shape barre is the alternative.',
    inProgressions:
      'Em7 is the iim7 of D major (Em7 → A7 → Dmaj7) and the vim7 of G major. As the im7 of E minor in modal jazz, the chord serves as a stable tonic. Many folk and pop tunes in G major or E minor use Em7 constantly.',
    faq: [
      { q: 'What notes are in an Em7 chord?', a: 'Em7 contains four notes: E (root), G (minor third), B (perfect fifth), and D (minor seventh).' },
      { q: 'How do you play Em7 on guitar?', a: 'The open Em7 voicing is 022030: low E (open), B (2nd fret 5th string), E (2nd fret 4th string), G (open 3rd string), D (3rd fret 2nd string), and open high E.' },
      { q: 'What pieces use Em7?', a: 'Any tune in D major or E minor: "Autumn Leaves" (in E minor) opens on Em7. "Stairway to Heaven" passes through Em-related harmony. Countless folk and jazz tunes use Em7 as a primary supertonic or tonic chord.' },
      { q: 'How is Em7 different from E7?', a: 'Only the third changes. E7 has G♯ (major 3rd); Em7 has G natural (minor 3rd). E7 is a dominant chord; Em7 is a minor 7th — completely different functions.' },
    ],
  },

  'f-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'F minor 7 (Fm7) — F, A♭, C, E♭ — is F minor with a minor 7th on top. The chord is the iim7 of E♭ major (Fm7 → B♭7 → E♭maj7) — the cadence in every E♭-major jazz standard from "Stella by Starlight" to "Misty." Fm7 is also a primary chord in flat-key R&B and soul.',
    intervals: [
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of F minor (= A♭ major)', slug: 'a-flat-major', kind: 'key' },
      { label: 'Parallel: F minor triad', slug: 'f-minor', kind: 'chord' },
      { label: 'Related: F dominant 7', slug: 'f-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['f-minor', 'f-dominant-7', 'e-flat-major-7', 'b-flat-dominant-7', 'a-flat-major-7'],
    commonMistakes:
      'Fm7 has A♭ as its third and E♭ as its 7th — two flats on a natural root. The most common error is reading A♭ as A natural, which would make Fmaj7 (a completely different chord). On guitar, Fm7 is most often a 1st-fret E-shape barre — though many guitarists prefer the partial voicing on the upper strings to avoid the full barre.',
    inProgressions:
      'Fm7 is the iim7 of E♭ major (Fm7 → B♭7 → E♭maj7), the vim7 of A♭ major, and the im7 of F minor in modal jazz. Beethoven\'s "Appassionata" Sonata uses Fm-related harmony constantly; in jazz, "Misty," "Stella by Starlight," and most E♭-major standards cadence through Fm7.',
    faq: [
      { q: 'What notes are in an Fm7 chord?', a: 'Fm7 contains four notes: F (root), A♭ (minor third), C (perfect fifth), and E♭ (minor seventh).' },
      { q: 'What jazz standards use Fm7?', a: '"Misty" (in E♭ major), "Stella by Starlight" (which cadences in E♭ at multiple points), "There Will Never Be Another You," and most E♭-major bebop standards. The ii–V–I in E♭ runs Fm7 → B♭7 → E♭maj7 — universal in the repertoire.' },
      { q: 'How do you play Fm7 on guitar?', a: 'Most commonly a 1st-fret E-shape barre with the 4th-string finger lifted: index across all six strings on fret 1, ring finger on the 3rd fret of the 5th string, partial open positions on strings 4-3-2-1.' },
      { q: 'How is Fm7 different from Fmaj7?', a: 'Two notes change. Fmaj7 has A natural (major 3rd) and E natural (major 7th); Fm7 has A♭ (minor 3rd) and E♭ (minor 7th). Different chord quality, different harmonic function.' },
    ],
  },

  'f-sharp-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'F♯ minor 7 (F♯m7) — F♯, A, C♯, E — is F♯ minor with a minor 7th on top. The chord is the iim7 of E major (F♯m7 → B7 → Emaj7) and the vim7 of A major. Sting\'s "Roxanne" famously builds on the F♯m and related extensions; jazz guitarists in A major lean on F♯m7 as a tonic-substitute.',
    intervals: [
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of F♯ minor (= A major)', slug: 'a-major', kind: 'key' },
      { label: 'Parallel: F♯ minor triad', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Related: F♯ dominant 7', slug: 'f-sharp-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-minor', 'f-sharp-dominant-7', 'e-major-7', 'b-dominant-7', 'a-major-7'],
    commonMistakes:
      'F♯m7 has F♯ and C♯ as the sharp pair, plus A and E as naturals. The most common error is reading A as A♯, which would produce F♯maj7. The two sharps + two naturals pattern is the chord\'s signature.',
    inProgressions:
      'F♯m7 is the iim7 of E major (F♯m7 → B7 → Emaj7) and the vim7 of A major. As the im7 of F♯ minor in modal jazz, the chord serves as a stable tonic. Many bossa-nova tunes in A major use F♯m7 in their bridges.',
    faq: [
      { q: 'What notes are in an F♯m7 chord?', a: 'F♯m7 contains four notes: F♯ (root), A (minor third), C♯ (perfect fifth), and E (minor seventh).' },
      { q: 'What key does F♯m7 belong to?', a: 'F♯m7 is the iim7 of E major and the vim7 of A major. Both keys share the same three-sharp signature.' },
      { q: 'How do you play F♯m7 on guitar?', a: 'Most commonly a 2nd-fret E-minor-shape barre: index across all six strings on fret 2, ring finger on the 4th fret of the 5th string. Open positions are uncommon for F♯m7.' },
      { q: 'What pieces use F♯m7?', a: 'Sting\'s "Roxanne" hovers around F♯m. Many A-major jazz ballads use F♯m7 as a vim7 / tonic-substitute. Bossa-nova tunes in A often modulate through F♯m7 in their bridges.' },
    ],
  },

  'g-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'G minor 7 (Gm7) — G, B♭, D, F — is G minor with a minor 7th on top. The chord is the iim7 of F major (Gm7 → C7 → Fmaj7) — the cadence in countless F-major jazz tunes including "Girl from Ipanema" (in F). Mozart\'s G-minor symphonies use Gm-related harmony constantly.',
    intervals: [
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of G minor (= B♭ major)', slug: 'b-flat-major', kind: 'key' },
      { label: 'Parallel: G minor triad', slug: 'g-minor', kind: 'chord' },
      { label: 'Related: G dominant 7', slug: 'g-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['g-minor', 'g-dominant-7', 'f-major-7', 'c-dominant-7', 'b-flat-major-7'],
    commonMistakes:
      'Gm7 has B♭ as its third and F natural as its 7th. Reading B♭ as B natural makes Gmaj7 (a completely different chord). On guitar, Gm7 is most often a 3rd-fret E-minor-shape barre or a closed-position three-string voicing.',
    inProgressions:
      'Gm7 is the iim7 of F major (Gm7 → C7 → Fmaj7) and the vim7 of B♭ major. As the im7 of G minor in modal jazz, the chord serves as a stable tonic. "Girl from Ipanema" in F major passes through Gm7 at every cadence.',
    faq: [
      { q: 'What notes are in a Gm7 chord?', a: 'Gm7 contains four notes: G (root), B♭ (minor third), D (perfect fifth), and F (minor seventh).' },
      { q: 'What jazz standards use Gm7?', a: '"Girl from Ipanema" (in F major), Mozart\'s G-minor symphonies (with related harmony), and any tune in F major or B♭ major that needs a iim7 chord. Gm7 is one of the most-played 7th chords in jazz.' },
      { q: 'How do you play Gm7 on guitar?', a: 'Most commonly a 3rd-fret E-minor-shape barre: index across all six strings on fret 3, ring finger on the 5th fret of the 5th string. The closed-position voicing also works at the 10th-fret area as an A-shape.' },
      { q: 'How is Gm7 different from G7?', a: 'Only the third changes. G7 has B natural (major 3rd, dominant); Gm7 has B♭ (minor 3rd). Different chord quality with different harmonic function.' },
    ],
  },

  'g-sharp-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'G♯ minor 7 (G♯m7) — G♯, B, D♯, F♯ — is G♯ minor with a minor 7th on top. The chord is the iim7 of F♯ major (G♯m7 → C♯7 → F♯maj7) and the vim7 of B major. Five sharps on the page; the chord appears in any jazz tune transposed to B major for vocal range.',
    intervals: [
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of G♯ minor (= B major)', slug: 'b-major', kind: 'key' },
      { label: 'Parallel: G♯ minor triad', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: A♭ minor 7', slug: 'a-flat-minor-7', kind: 'chord' },
    ],
    relatedChords: ['g-sharp-minor', 'a-flat-minor-7', 'b-major-7', 'c-sharp-dominant-7', 'f-sharp-major-7'],
    commonMistakes:
      'G♯m7 has three sharps (G♯, D♯, F♯) plus B natural. The most common error is reading B as B♯, which would break the chord spelling. The chord is enharmonically equivalent to A♭m7 (A♭-C♭-E♭-G♭) but the sharp-side spelling is much more common in published music.',
    inProgressions:
      'G♯m7 is the iim7 of F♯ major (G♯m7 → C♯7 → F♯maj7) and the vim7 of B major. Many jazz vocalists transpose tunes to B major for range, putting G♯m7 in the iim7 position at every cadence.',
    faq: [
      { q: 'What notes are in a G♯m7 chord?', a: 'G♯m7 contains four notes: G♯ (root), B (minor third), D♯ (perfect fifth), and F♯ (minor seventh).' },
      { q: 'Is G♯m7 the same as A♭m7?', a: 'Yes, enharmonically — same four pitches. G♯m7 (five sharps) is the standard spelling in B-major contexts; A♭m7 (seven flats with F♭ and C♭) is much rarer in published music.' },
      { q: 'How do you play G♯m7 on guitar?', a: 'Most commonly a 4th-fret E-minor-shape barre: index across all six strings on fret 4, ring finger on the 6th fret of the 5th string. The closed-position voicing covers the chord cleanly without needing open strings.' },
      { q: 'When would I see G♯m7 in real music?', a: 'In music notated in B major or F♯ major. Jazz tunes transposed to those keys (often for vocal range) put G♯m7 at every cadence.' },
    ],
  },

  'a-flat-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'A♭ minor 7 (A♭m7) — A♭, C♭, E♭, G♭ — is A♭ minor with a minor 7th on top. The chord uses three flats plus C♭ (enharmonic to B natural). Like its parent A♭ minor, the chord is rarely written outside dense Romantic chromaticism; G♯m7 is the universal practical spelling.',
    intervals: [
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
      { from: 'Cb', to: 'Eb', name: 'major 3rd', semitones: 4 },
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: G♯ minor 7', slug: 'g-sharp-minor-7', kind: 'chord' },
      { label: 'Parallel: A♭ minor (theoretical)', slug: 'a-flat-minor', kind: 'chord' },
      { label: 'Related: A♭ major 7', slug: 'a-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['a-flat-minor', 'g-sharp-minor-7', 'a-flat-major-7', 'b-major-7', 'd-flat-major-7'],
    commonMistakes:
      'A♭m7 has C♭ as its third (enharmonic to B natural). The all-flat spelling appears almost exclusively in deeply chromatic flat-key music; in practical jazz the same chord is G♯m7. Even when the surrounding key signature has many flats, modern editors often respell as G♯m7 for readability.',
    inProgressions:
      'A♭m7 rarely functions as a working chord. The same harmonic content is universally written G♯m7 in published music. Inside dense chromatic Romantic music — Wagner, Liszt — A♭m7 appears as a chromatic colour with flat-side spelling consistency.',
    faq: [
      { q: 'What notes are in an A♭m7 chord?', a: 'A♭m7 contains four notes: A♭ (root), C♭ (minor third — same as B), E♭ (perfect fifth), and G♭ (minor seventh).' },
      { q: 'Is A♭m7 the same as G♯m7?', a: 'Yes, enharmonically — same four pitches. A♭m7 (seven flats with C♭) is essentially never written in jazz; G♯m7 (five sharps) is the universal practical spelling.' },
      { q: 'Why is the third C♭ instead of B?', a: 'The minor 7th chord stacks thirds on each scale-letter from the root. A♭ minor uses letters A-C-E-G; the third lands on the C letter, which becomes C♭ when lowered a half step.' },
      { q: 'When would I see A♭m7 in real music?', a: 'Essentially never in jazz charts. Only in dense chromatic Romantic-era classical music where surrounding harmony demands flat-side consistency.' },
    ],
  },

  'a-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'A minor 7 (Am7) — A, C, E, G — is A minor with a minor 7th on top. All four notes are naturals — the cleanest m7 spelling on the page. The chord is the iim7 of G major (Am7 → D7 → Gmaj7), the vim7 of C major, and the im7 of A minor; "Autumn Leaves" in C major / A minor uses Am7 constantly.',
    intervals: [
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of A minor (= C major)', slug: 'c-major', kind: 'key' },
      { label: 'Parallel: A minor triad', slug: 'a-minor', kind: 'chord' },
      { label: 'Related: A dominant 7', slug: 'a-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['a-minor', 'a-dominant-7', 'g-major-7', 'd-dominant-7', 'c-major-7'],
    commonMistakes:
      'Am7 is all naturals. The most common error is misreading the chord as Amaj7 (which would have G♯) or as A7 (which would have C♯). On guitar, the open Am7 voicing (x02013) is one of the easiest jazz chords for beginners.',
    inProgressions:
      'Am7 is the iim7 of G major (Am7 → D7 → Gmaj7), the vim7 of C major, and the im7 of A minor. "Autumn Leaves" alternates between G major and E minor cadences, putting Am7 in the iim7 position constantly. Modal jazz tunes like "Maiden Voyage" use Am7 as a stable tonic in modal contexts.',
    faq: [
      { q: 'What notes are in an Am7 chord?', a: 'Am7 contains four notes: A (root), C (minor third), E (perfect fifth), and G (minor seventh).' },
      { q: 'How do you play Am7 on guitar?', a: 'The open Am7 voicing is x02013: mute the low E, then A (open 5th), E (2nd fret 4th string), G (open 3rd string), C (1st fret 2nd string), and an optional open high E.' },
      { q: 'What jazz standards use Am7?', a: '"Autumn Leaves" (in G major / E minor — Am7 is the iim7), "Take the A Train" (in C major), and many modal tunes. Am7 is one of the most-played 7th chords in jazz.' },
      { q: 'How is Am7 different from Amaj7?', a: 'Two notes change. Amaj7 has C♯ (major 3rd) and G♯ (major 7th); Am7 has C natural (minor 3rd) and G natural (minor 7th). Different chord quality and function.' },
    ],
  },

  'a-sharp-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'A♯ minor 7 (A♯m7) — A♯, C♯, E♯, G♯ — is A♯ minor with a minor 7th on top. Four sharps plus the sharp-of-sharp E♯ (enharmonic to F). The chord is the iim7 of G♯ major (theoretical) and the vim7 of C♯ major. In practice, B♭m7 (the enharmonic spelling) is universally used in published music.',
    intervals: [
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'E#', to: 'G#', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: B♭ minor 7', slug: 'b-flat-minor-7', kind: 'chord' },
      { label: 'Parallel: A♯ minor (theoretical)', slug: 'a-sharp-minor', kind: 'chord' },
      { label: 'Related: C♯ major 7', slug: 'c-sharp-major-7', kind: 'chord' },
    ],
    relatedChords: ['a-sharp-minor', 'b-flat-minor-7', 'c-sharp-major-7', 'd-sharp-minor-7', 'g-sharp-dominant-7'],
    commonMistakes:
      'A♯m7 has E♯ as its fifth — same pitch as F natural. The chord uses every kind of accidental in dense sharp-key territory. In practical music the spelling is virtually always replaced by B♭m7. Only Bach\'s systematic key cycles in the Well-Tempered Clavier give this exact spelling proper musical use.',
    inProgressions:
      'A♯m7 doesn\'t function as a working chord outside Bach\'s WTC and very dense chromatic Romantic music. The enharmonic B♭m7 covers all the practical use cases.',
    faq: [
      { q: 'What notes are in an A♯m7 chord?', a: 'A♯m7 contains four notes: A♯ (root), C♯ (minor third), E♯ (perfect fifth — same as F), and G♯ (minor seventh).' },
      { q: 'Is A♯m7 the same as B♭m7?', a: 'Yes, enharmonically — same four pitches. A♯m7 (seven sharps including E♯) is essentially never written in practice; B♭m7 (five flats) is the universal spelling.' },
      { q: 'Why is the fifth E♯ instead of F?', a: 'The minor 7th chord stacks thirds on each scale-letter from the root. A♯ minor uses letters A-C-E-G; the fifth lands on the E letter, which becomes E♯ when raised a half step.' },
      { q: 'When would I see A♯m7 in real music?', a: 'Essentially never as a working chord symbol. The spelling appears only in Bach\'s systematic key explorations (the WTC) and in dense chromatic late-Romantic music.' },
    ],
  },

  'b-flat-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'B♭ minor 7 (B♭m7) — B♭, D♭, F, A♭ — is B♭ minor with a minor 7th on top. The chord is the iim7 of A♭ major (B♭m7 → E♭7 → A♭maj7) and a workhorse in flat-side jazz. Many vocal standards modulate through B♭m harmony; the chord is also fundamental to gospel and R&B writing.',
    intervals: [
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of B♭ minor (= D♭ major)', slug: 'd-flat-major', kind: 'key' },
      { label: 'Parallel: B♭ minor triad', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Related: B♭ major 7', slug: 'b-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['b-flat-minor', 'b-flat-major-7', 'a-flat-major-7', 'e-flat-dominant-7', 'd-flat-major-7'],
    commonMistakes:
      'B♭m7 has D♭ and A♭ as the two flats above the B♭ root, plus F natural as the fifth. The most common error is reading D♭ as D natural, which would produce B♭7 (a dominant chord). On guitar, B♭m7 is most often a 1st-fret A-shape barre.',
    inProgressions:
      'B♭m7 is the iim7 of A♭ major (B♭m7 → E♭7 → A♭maj7) and the vim7 of D♭ major. Coltrane\'s "Naima" passes through B♭m harmony; many ballads modulate to A♭ or D♭ specifically because B♭m7 is such a rich chord for cadences.',
    faq: [
      { q: 'What notes are in a B♭m7 chord?', a: 'B♭m7 contains four notes: B♭ (root), D♭ (minor third), F (perfect fifth), and A♭ (minor seventh).' },
      { q: 'What jazz standards use B♭m7?', a: 'Any tune in A♭ major or D♭ major: "Misty" (in A♭) cadences through B♭m7 at points, "Lush Life" (in D♭) uses B♭m7 as a primary iim7 chord, and many bossa-nova tunes modulate through B♭m7 in their bridges.' },
      { q: 'How do you play B♭m7 on guitar?', a: 'Most commonly a 1st-fret A-shape barre: index across strings 5-1 on fret 1, ring finger on the 3rd fret of the 4th string, middle finger on the 1st fret of the 3rd string, pinky on the 2nd fret of the 2nd string.' },
      { q: 'Is B♭m7 the same as A♯m7?', a: 'Enharmonically yes, but B♭m7 (five flats) is universal; A♯m7 (seven sharps with E♯) appears only in Bach\'s WTC and dense Romantic music.' },
    ],
  },

  'b-minor-7': {
    publishAt: '2020-01-01',
    intro:
      'B minor 7 (Bm7) — B, D, F♯, A — is B minor with a minor 7th on top. The chord is the iim7 of A major (Bm7 → E7 → Amaj7), the vim7 of D major, and the im7 of B minor in modal jazz. On guitar, the open Bm7 voicing (x20202) is one of the easiest jazz chords to finger.',
    intervals: [
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'Key of B minor (= D major)', slug: 'd-major', kind: 'key' },
      { label: 'Parallel: B minor triad', slug: 'b-minor', kind: 'chord' },
      { label: 'Related: B dominant 7', slug: 'b-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['b-minor', 'b-dominant-7', 'a-major-7', 'e-dominant-7', 'd-major-7'],
    commonMistakes:
      'Bm7 has D as its third and F♯ as its fifth (the F♯ is the only sharp in the chord). The most common error is reading F♯ as F natural, which would make Bdim7-related harmony. On guitar, the open Bm7 voicing (x20202) is widely used because the open strings A and E line up with chord tones.',
    inProgressions:
      'Bm7 is the iim7 of A major (Bm7 → E7 → Amaj7), the vim7 of D major, and the im7 of B minor in modal jazz. "Autumn Leaves" transposed to A major would put Bm7 in the iim7 slot; the chord is also fundamental to D-major and A-major folk-rock writing.',
    faq: [
      { q: 'What notes are in a Bm7 chord?', a: 'Bm7 contains four notes: B (root), D (minor third), F♯ (perfect fifth), and A (minor seventh).' },
      { q: 'How do you play Bm7 on guitar?', a: 'The open Bm7 voicing is x20202: mute the low E, then B (2nd fret 5th string), open D, A (2nd fret 3rd string), open B, and open high E. The A and E open strings carry the 7th and 4th naturally.' },
      { q: 'What pieces use Bm7?', a: 'Many A-major and D-major folk-rock tunes use Bm7 as a primary iim7 or vim7. The Beatles\' "Norwegian Wood" centres in E major but uses Bm-related harmony in its bridge; jazz tunes in A major cadence through Bm7 at every turn.' },
      { q: 'How is Bm7 different from Bmaj7?', a: 'Two notes change. Bmaj7 has D♯ (major 3rd) and A♯ (major 7th); Bm7 has D natural (minor 3rd) and A natural (minor 7th). Different chord quality and function.' },
    ],
  },

  // ─── Phase 3: dominant 7th chords (V7) ────────────────────────────────────
  // Major triad plus a minor 7th — the unstable chord that pulls toward
  // the tonic a fourth above. Every blues song is built on dom7 chords;
  // every jazz ii–V–I has a dom7 in the middle.

  'c-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'C dominant 7 (C7) — C, E, G, B♭ — is C major with a minor 7th on top. The chord is the V7 of F major, the V7 of F minor, and the I7 of any blues in C. The defining sound of the blues — every 12-bar blues in C is built on C7, F7, and G7.',
    intervals: [
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of F major', slug: 'f-major', kind: 'chord' },
      { label: 'I7 of C blues', slug: 'c-major', kind: 'chord' },
      { label: 'Related: C major 7', slug: 'c-major-7', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'c-major-7', 'f-major-7', 'g-minor-7', 'f-minor-7'],
    commonMistakes:
      'C7 has B♭ as its 7th — a half-step lower than Cmaj7 (which has B natural). The B♭ is the chord\'s "blue note" — it\'s what gives C7 its bluesy, resolution-seeking sound. The most common error is writing Cmaj7 when C7 is meant, or vice versa. On guitar, the open C7 voicing (x32310) is the standard.',
    inProgressions:
      'C7 is the V7 of F major (C7 → F is the cadence in F-major blues), the V7 of F minor, and the I7 of C blues. In the 12-bar blues, C7 sits as the I, F7 as the IV, and G7 as the V. The chord is also the centerpiece of every jazz cadence resolving to F.',
    faq: [
      { q: 'What notes are in a C7 chord?', a: 'C7 contains four notes: C (root), E (major third), G (perfect fifth), and B♭ (minor seventh — the "blue note").' },
      { q: 'How is C7 different from Cmaj7?', a: 'Only the seventh changes. C7 has B♭ (minor 7th); Cmaj7 has B natural (major 7th). C7 sounds bluesy and wants to resolve to F; Cmaj7 sounds stable and serves as a tonic.' },
      { q: 'What does the "7" symbol mean by itself?', a: 'By convention, "C7" means dominant 7th — major triad plus a minor 7th. Major 7th chords are always written "Cmaj7" or "CΔ7" to distinguish them.' },
      { q: 'Where does C7 appear in famous music?', a: 'Every blues song in C uses C7 as the I, F7 as the IV, G7 as the V. Beethoven\'s Symphony No. 1 famously opens with a deceptive C7 chord (resolving to F major before the C-major home key is even established).' },
    ],
  },

  'c-sharp-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'C♯ dominant 7 (C♯7) — C♯, E♯, G♯, B — is C♯ major with a minor 7th. The chord is the V7 of F♯ major and the V7 of F♯ minor. The E♯ (enharmonic to F) is the spelling tell that you\'re inside a sharp-key context; outside F♯-major literature, the same pitches are written D♭7.',
    intervals: [
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'E#', to: 'G#', name: 'minor 3rd', semitones: 3 },
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of F♯ major', slug: 'f-sharp-major', kind: 'chord' },
      { label: 'Related: C♯ major 7', slug: 'c-sharp-major-7', kind: 'chord' },
      { label: 'Enharmonic: D♭ dominant 7', slug: 'd-flat-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-major', 'c-sharp-major-7', 'd-flat-dominant-7', 'f-sharp-major-7', 'd-sharp-minor-7'],
    commonMistakes:
      'C♯7\'s third is E♯, enharmonic to F. In jazz lead-sheet practice the chord is sometimes written with F as the third — strictly incorrect by the seven-letter rule. The same chord is universally written D♭7 in flat-side music; pick the spelling that matches the surrounding key.',
    inProgressions:
      'C♯7 is the V7 of F♯ major (C♯7 → F♯maj7) and the V7 of F♯ minor (C♯7 → F♯m). In ii–V–I cadences in F♯ major, the progression runs G♯m7 → C♯7 → F♯maj7. As an altered dominant, C♯7 also appears in jazz reharms substituting for G7 (tritone substitute pointing to C).',
    faq: [
      { q: 'What notes are in a C♯7 chord?', a: 'C♯7 contains four notes: C♯ (root), E♯ (major third — same pitch as F), G♯ (perfect fifth), and B (minor seventh).' },
      { q: 'Is C♯7 the same as D♭7?', a: 'Yes, enharmonically — same four pitches. C♯7 lives in F♯-major contexts; D♭7 (D♭-F-A♭-C♭) lives in G♭-major / A♭-major contexts.' },
      { q: 'Why is the third E♯ and not F?', a: 'Major scales use each of the seven letters exactly once. The C♯ major scale runs C♯-D♯-E♯-F♯-G♯-A♯-B♯; the third of C♯7 must sit on the E letter, which is E♯.' },
      { q: 'When would I see C♯7 in real music?', a: 'In music notated in F♯ major or F♯ minor where the V7 needs sharp-side spelling. Bach\'s WTC includes a C♯-major prelude that uses C♯7 inside its cadences.' },
    ],
  },

  'd-flat-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'D♭ dominant 7 (D♭7) — D♭, F, A♭, C♭ — is D♭ major with a minor 7th. The C♭ (enharmonic to B) is the spelling tell that you\'re in flat-side territory. The chord is the V7 of G♭ major and the tritone substitute for G7 in jazz reharms (D♭7 and G7 share the same tritone, F-B / F-C♭).',
    intervals: [
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of G♭ major', slug: 'g-flat-major', kind: 'chord' },
      { label: 'Related: D♭ major 7', slug: 'd-flat-major-7', kind: 'chord' },
      { label: 'Enharmonic: C♯ dominant 7', slug: 'c-sharp-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['d-flat-major', 'd-flat-major-7', 'c-sharp-dominant-7', 'g-flat-major-7', 'a-flat-minor-7'],
    commonMistakes:
      'D♭7\'s 7th is C♭ — enharmonic to B natural. In jazz lead-sheet practice the chord is often written D♭7 with B as the 7th letter — strictly incorrect by the seven-letter rule. Inside G♭-major notation, C♭ preserves consistency.',
    inProgressions:
      'D♭7 is the V7 of G♭ major (D♭7 → G♭maj7) and a famous tritone substitute for G7 in C-major jazz. In ii–V–I cadences in G♭ major, the progression runs A♭m7 → D♭7 → G♭maj7. As a tritone-sub, D♭7 → Cmaj7 replaces the standard G7 → Cmaj7 with chromatic bass motion.',
    faq: [
      { q: 'What notes are in a D♭7 chord?', a: 'D♭7 contains four notes: D♭ (root), F (major third), A♭ (perfect fifth), and C♭ (minor seventh — same as B).' },
      { q: 'What is a "tritone substitute"?', a: 'A jazz reharmonisation device. D♭7 and G7 share the same tritone (F to B / C♭). Substituting D♭7 for G7 in a cadence to C major creates chromatic bass motion (D♭ → C) and a richer harmonic colour.' },
      { q: 'Is D♭7 the same as C♯7?', a: 'Yes, enharmonically — same four pitches. D♭7 lives in flat-side contexts; C♯7 lives in F♯-major contexts. Both are valid; the choice depends on surrounding key.' },
      { q: 'When is D♭7 used in jazz?', a: 'As a tritone substitute for G7 (resolving to C major), in G♭-major ii–V–I cadences, and in chromatic walking-bass progressions. The chord is one of the most common altered dominants in bebop and post-bop jazz.' },
    ],
  },

  'd-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'D dominant 7 (D7) — D, F♯, A, C — is D major with a minor 7th. The chord is the V7 of G major and the V7 of G minor. On guitar, the open D7 voicing (xx0212) is among the easiest jazz chords; the chord is also a staple of folk and country music.',
    intervals: [
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of G major', slug: 'g-major', kind: 'chord' },
      { label: 'Related: D major 7', slug: 'd-major-7', kind: 'chord' },
      { label: 'Related: D major triad', slug: 'd-major', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'd-major-7', 'g-major-7', 'a-minor-7', 'g-minor-7'],
    commonMistakes:
      'D7 has C natural as its 7th — a half-step lower than Dmaj7 (which has C♯). Replacing C with C♯ produces Dmaj7 (a totally different chord function). On guitar, the open D7 (xx0212) keeps the bass D, with F♯, A, and C above. The Beatles\' "Hey Jude" cadence (F → C → G → D) uses D7 as the closing dominant.',
    inProgressions:
      'D7 is the V7 of G major (D7 → G is the cadence in every G-major folk and pop tune) and the V7 of G minor. In ii–V–I in G major, the progression runs Am7 → D7 → Gmaj7. D7 is also the centrepiece of the D-major blues — every 12-bar blues in D uses D7, G7, and A7.',
    faq: [
      { q: 'What notes are in a D7 chord?', a: 'D7 contains four notes: D (root), F♯ (major third), A (perfect fifth), and C (minor seventh).' },
      { q: 'How do you play D7 on guitar?', a: 'The open D7 voicing is xx0212: mute strings 6-5, then open D, A (2nd fret 3rd string), C (1st fret 2nd string), and F♯ (2nd fret 1st string).' },
      { q: 'How is D7 different from Dmaj7?', a: 'Only the seventh changes. D7 has C natural; Dmaj7 has C♯. D7 sounds bluesy and pulls toward G; Dmaj7 sits stably as a tonic.' },
      { q: 'What pieces use D7?', a: 'Every G-major folk and country song uses D7 as the closing V. The Beatles\' "Hey Jude" cadence (F → C → G → D7 → returning to D as resolution moment) leans heavily on D7\'s pull.' },
    ],
  },

  'e-flat-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'E♭ dominant 7 (E♭7) — E♭, G, B♭, D♭ — is E♭ major with a minor 7th. The chord is the V7 of A♭ major and the I7 of E♭ blues. Big-band charts in A♭ use E♭7 constantly as the dominant; jazz blues in E♭ build on E♭7, A♭7, and B♭7 as the three primary chords.',
    intervals: [
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of A♭ major', slug: 'a-flat-major', kind: 'chord' },
      { label: 'I7 of E♭ blues', slug: 'e-flat-major', kind: 'chord' },
      { label: 'Related: E♭ major 7', slug: 'e-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['e-flat-major', 'e-flat-major-7', 'a-flat-major-7', 'b-flat-minor-7', 'a-flat-dominant-7'],
    commonMistakes:
      'E♭7 has D♭ as its 7th — a half-step lower than E♭maj7 (which has D natural). Reading D♭ as D natural produces E♭maj7 (a totally different chord function). On guitar, E♭7 is most often a 6th-fret A-shape barre with the 4th-string finger adjusted.',
    inProgressions:
      'E♭7 is the V7 of A♭ major (E♭7 → A♭maj7) and the I7 of E♭ blues. In ii–V–I cadences in A♭ major, the progression runs B♭m7 → E♭7 → A♭maj7. The chord is fundamental to big-band jazz and bebop standards in A♭ major.',
    faq: [
      { q: 'What notes are in an E♭7 chord?', a: 'E♭7 contains four notes: E♭ (root), G (major third), B♭ (perfect fifth), and D♭ (minor seventh).' },
      { q: 'How is E♭7 different from E♭maj7?', a: 'Only the seventh changes. E♭7 has D♭ (minor 7th); E♭maj7 has D natural (major 7th). E♭7 wants to resolve to A♭; E♭maj7 sits stably as a tonic.' },
      { q: 'What jazz standards use E♭7?', a: 'Any tune in A♭ major or E♭ blues. "Misty" cadences through E♭7 → A♭maj7; "Stella by Starlight" uses E♭7 in multiple modulations. Big-band charts in A♭ rely on E♭7 as the primary dominant.' },
      { q: 'How do you play E♭7 on guitar?', a: 'Most commonly a 6th-fret A-shape barre: index across strings 5-1 on fret 6, ring finger on the 8th fret of the 4th string, middle finger on the 6th fret of the 3rd string, pinky on the 8th fret of the 2nd string.' },
    ],
  },

  'e-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'E dominant 7 (E7) — E, G♯, B, D — is E major with a minor 7th. On guitar, the open E7 voicing (020100) is the easiest jazz chord on the instrument because every note except G♯ rings on an open string. The chord is the V7 of A major and the I7 of E blues — the most-played blues key on guitar.',
    intervals: [
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of A major', slug: 'a-major', kind: 'chord' },
      { label: 'I7 of E blues', slug: 'e-major', kind: 'chord' },
      { label: 'Related: E major 7', slug: 'e-major-7', kind: 'chord' },
    ],
    relatedChords: ['e-major', 'e-major-7', 'a-major-7', 'b-minor-7', 'a-dominant-7'],
    commonMistakes:
      'E7 has D natural as its 7th — a half-step lower than Emaj7 (which has D♯). Replacing D with D♯ produces Emaj7 (a stable tonic chord). The blues-defining D natural is what makes E7 sound bluesy and unresolved. On guitar, the open E7 (020100) is among the first jazz chords beginners learn.',
    inProgressions:
      'E7 is the V7 of A major (E7 → A is the cadence in every A-major folk and rock tune) and the I7 of E blues. The 12-bar blues in E is built on E7, A7, and B7 — three of the most-played dominant chords on guitar. In ii–V–I in A major, the progression runs Bm7 → E7 → Amaj7.',
    faq: [
      { q: 'What notes are in an E7 chord?', a: 'E7 contains four notes: E (root), G♯ (major third), B (perfect fifth), and D (minor seventh).' },
      { q: 'How do you play E7 on guitar?', a: 'The open E7 voicing is 020100: open low E, B (2nd fret 5th string), open D, G♯ (1st fret 3rd string), open B, open high E. The D 7th rings on an open string, making the chord uniquely playable.' },
      { q: 'How is E7 different from Emaj7?', a: 'Only the seventh changes. E7 has D natural; Emaj7 has D♯. E7 sounds bluesy and pulls toward A; Emaj7 sits stably as a tonic.' },
      { q: 'What pieces use E7?', a: 'Every blues in E uses E7, A7, B7. The Beatles\' "Twist and Shout" is built on D-G-A (transposed to E it would be E-A-B7). Chuck Berry\'s riffs are almost all dominant-7 figures built around E7 voicings.' },
    ],
  },

  'f-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'F dominant 7 (F7) — F, A, C, E♭ — is F major with a minor 7th. The chord is the V7 of B♭ major, the IV7 of C blues, and the I7 of F blues. Most concert-band literature in B♭ uses F7 as the primary dominant; jazz blues in F builds on F7, B♭7, and C7.',
    intervals: [
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of B♭ major', slug: 'b-flat-major', kind: 'chord' },
      { label: 'IV7 of C blues', slug: 'c-major', kind: 'chord' },
      { label: 'Related: F major 7', slug: 'f-major-7', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'f-major-7', 'b-flat-major-7', 'c-minor-7', 'b-flat-dominant-7'],
    commonMistakes:
      'F7 has E♭ as its 7th — a half-step lower than Fmaj7 (which has E natural). The E♭ is the chord\'s "blue note." On guitar, F7 is most often a 1st-fret E-shape barre. The partial voicing (xx3211) avoids the full barre while capturing F, A, C, E♭ on the upper four strings.',
    inProgressions:
      'F7 is the V7 of B♭ major (F7 → B♭ is the cadence in B♭ blues and most B♭ band literature), the IV7 of C blues (in 12-bar C blues, F7 is the IV chord), and the I7 of F blues. In ii–V–I in B♭ major, the progression runs Cm7 → F7 → B♭maj7.',
    faq: [
      { q: 'What notes are in an F7 chord?', a: 'F7 contains four notes: F (root), A (major third), C (perfect fifth), and E♭ (minor seventh — the "blue note").' },
      { q: 'How is F7 different from Fmaj7?', a: 'Only the seventh changes. F7 has E♭; Fmaj7 has E natural. F7 sounds bluesy and pulls toward B♭; Fmaj7 sits stably as a tonic.' },
      { q: 'What pieces use F7?', a: 'Every blues in C uses F7 as the IV chord. Every B♭-major standard cadences through F7 → B♭maj7. Beethoven\'s Symphony No. 1 famously opens on F7 (as the V7 of B♭, a chromatic feint before the C-major home key arrives).' },
      { q: 'How do you play F7 on guitar?', a: 'Most commonly a 1st-fret E-shape barre with the 4th-string finger lifted. The partial voicing xx3211 (strings 6-5 muted, then F-A-Eb-C-F) works for many styles.' },
    ],
  },

  'f-sharp-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'F♯ dominant 7 (F♯7) — F♯, A♯, C♯, E — is F♯ major with a minor 7th. The chord is the V7 of B major and the V7 of B minor. Three sharps plus the natural E (the chord\'s 7th); the E is what gives F♯7 its "needs to resolve" character. The chord is enharmonic to G♭7 in flat-side notation.',
    intervals: [
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of B major', slug: 'b-major', kind: 'chord' },
      { label: 'V7 of B minor', slug: 'b-minor', kind: 'chord' },
      { label: 'Enharmonic: G♭ dominant 7', slug: 'g-flat-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-major', 'f-sharp-major-7', 'b-major-7', 'c-sharp-minor-7', 'g-flat-dominant-7'],
    commonMistakes:
      'F♯7\'s 7th is E natural — a half-step lower than F♯maj7 (which has E♯). The natural E inside a sharp-key context is the chord\'s identity. Replacing E with E♯ produces F♯maj7 (a stable tonic). On guitar, F♯7 is most often a 2nd-fret E-shape barre.',
    inProgressions:
      'F♯7 is the V7 of B major (F♯7 → Bmaj7 is the cadence in every B-major jazz tune) and the V7 of B minor. In ii–V–i in B minor, the progression runs C♯m7♭5 → F♯7 → Bm. The chord is also a common tritone substitute for C7 in C-major reharmonisations.',
    faq: [
      { q: 'What notes are in an F♯7 chord?', a: 'F♯7 contains four notes: F♯ (root), A♯ (major third), C♯ (perfect fifth), and E (minor seventh).' },
      { q: 'Is F♯7 the same as G♭7?', a: 'Yes, enharmonically — same four pitches. F♯7 (three sharps + natural) lives in B-major contexts; G♭7 (six flats + natural) lives in flat-side music.' },
      { q: 'How does F♯7 resolve?', a: 'F♯7 → Bmaj7 is the V → I cadence in B major. F♯7 → Bm is the V → i cadence in B minor. Both use the same dominant chord; the resolution differs only in the third of the tonic chord.' },
      { q: 'When is F♯7 a tritone substitute?', a: 'F♯7 can substitute for C7 in cadences to F major (since C7 and F♯7 share the same tritone — E to B♭ / E to A♯). The substitution creates chromatic bass motion from F♯ down to F.' },
    ],
  },

  'g-flat-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'G♭ dominant 7 (G♭7) — G♭, B♭, D♭, F♭ — is G♭ major with a minor 7th. The F♭ (enharmonic to E) is the spelling tell that you\'re in deep flat-key territory. The chord is the V7 of C♭ major (= B major enharmonically) and the tritone substitute for C7 in C-major reharms.',
    intervals: [
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'Fb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of C♭ major (= B major)', slug: 'b-major', kind: 'chord' },
      { label: 'Related: G♭ major 7', slug: 'g-flat-major-7', kind: 'chord' },
      { label: 'Enharmonic: F♯ dominant 7', slug: 'f-sharp-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['g-flat-major', 'g-flat-major-7', 'f-sharp-dominant-7', 'd-flat-major-7', 'a-flat-minor-7'],
    commonMistakes:
      'G♭7\'s 7th is F♭ (enharmonic to E). In jazz lead-sheet practice the chord is sometimes written G♭7 with E as the 7th letter — strictly incorrect by the seven-letter rule. Inside C♭-major or G♭-major notation, F♭ preserves consistency.',
    inProgressions:
      'G♭7 is the V7 of C♭ major and a famous tritone substitute for C7 in C-major reharms. The substitution G♭7 → Cmaj7 replaces the standard G7 → Cmaj7 with chromatic bass motion (G♭ → F → E → C-shaped landing). In G♭-major ii–V–I, the cadence runs A♭m7 → D♭7 → G♭maj7 — G♭7 doesn\'t appear in that progression but as the V7 of C♭ it does.',
    faq: [
      { q: 'What notes are in a G♭7 chord?', a: 'G♭7 contains four notes: G♭ (root), B♭ (major third), D♭ (perfect fifth), and F♭ (minor seventh — same pitch as E).' },
      { q: 'Is G♭7 the same as F♯7?', a: 'Yes, enharmonically — same four pitches. G♭7 lives in flat-side contexts; F♯7 lives in B-major / sharp-side contexts.' },
      { q: 'What is a tritone substitute?', a: 'G♭7 and C7 share the same tritone (B♭-E / B♭-F♭). Substituting G♭7 for C7 in a cadence to F major creates chromatic bass motion (G♭ → F) and richer harmonic colour.' },
      { q: 'When would I see G♭7 in real music?', a: 'In jazz reharms substituting for C7, in G♭-major and C♭-major contexts (rare), and in dense chromatic Romantic music. Modern lead sheets often use F♯7 instead for readability.' },
    ],
  },

  'g-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'G dominant 7 (G7) — G, B, D, F — is G major with a minor 7th. All four notes are naturals. The chord is the V7 of C major (G7 → C is the most common cadence in Western tonal music) and the I7 of G blues. On guitar, the open G7 voicing (320001) is one of the very first chords most students learn.',
    intervals: [
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of C major', slug: 'c-major', kind: 'chord' },
      { label: 'I7 of G blues', slug: 'g-major', kind: 'chord' },
      { label: 'Related: G major 7', slug: 'g-major-7', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'g-major-7', 'c-major-7', 'd-minor-7', 'c-dominant-7'],
    commonMistakes:
      'G7 has F natural as its 7th — a half-step lower than Gmaj7 (which has F♯). Replacing F with F♯ produces Gmaj7 (a stable tonic chord). The natural F is what gives G7 its bluesy pull. On guitar, the open G7 voicing (320001) keeps the standard G major shape with F added on the 1st string.',
    inProgressions:
      'G7 is the V7 of C major — the most-played dominant chord in tonal music. Every C-major cadence in classical, jazz, folk, and pop uses G7 → C. G7 is also the I7 of G blues (G7, C7, D7 — the three blues chords in G) and a primary chord in any C-major folk progression.',
    faq: [
      { q: 'What notes are in a G7 chord?', a: 'G7 contains four notes: G (root), B (major third), D (perfect fifth), and F (minor seventh).' },
      { q: 'How do you play G7 on guitar?', a: 'The open G7 voicing is 320001: G (3rd fret 6th string), B (2nd fret 5th string), open D, open G, open B, F (1st fret 1st string). The single fingering change from open G major (3rd fret 1st string → 1st fret 1st string) makes G7 one of the easiest dominant 7ths.' },
      { q: 'How is G7 different from Gmaj7?', a: 'Only the seventh changes. G7 has F natural; Gmaj7 has F♯. G7 sounds bluesy and pulls toward C; Gmaj7 sits stably as a tonic.' },
      { q: 'What pieces use G7?', a: 'Every C-major piece uses G7 at cadences: Mozart\'s C-major sonatas, Beethoven\'s 5th Symphony (in C), countless folk and pop tunes. "Hey Joe" uses dominant-7 cycles built on G7-derived patterns. G7 → C is the most-played cadence in Western music.' },
    ],
  },

  'g-sharp-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'G♯ dominant 7 (G♯7) — G♯, B♯, D♯, F♯ — is G♯ major with a minor 7th. Three sharps plus the sharp-of-sharp B♯ (enharmonic to C). The chord is the V7 of C♯ major and the V7 of C♯ minor; the enharmonic A♭7 is the more common spelling in flat-key contexts.',
    intervals: [
      { from: 'G#', to: 'B#', name: 'major 3rd', semitones: 4 },
      { from: 'B#', to: 'D#', name: 'minor 3rd', semitones: 3 },
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of C♯ major / minor', slug: 'c-sharp-major', kind: 'chord' },
      { label: 'Enharmonic: A♭ dominant 7', slug: 'a-flat-dominant-7', kind: 'chord' },
      { label: 'Related: G♯ major (theoretical)', slug: 'g-sharp-major', kind: 'chord' },
    ],
    relatedChords: ['g-sharp-major', 'a-flat-dominant-7', 'c-sharp-major-7', 'd-sharp-minor-7', 'c-sharp-minor'],
    commonMistakes:
      'G♯7 has B♯ as its third (enharmonic to C natural). In sharp-key contexts (C♯ major literature) the B♯ spelling preserves the seven-letter rule; in jazz lead sheets the same chord usually appears as A♭7. The chord is most often encountered as the V7 of C♯ minor — even though G♯ major itself is theoretical.',
    inProgressions:
      'G♯7 is the V7 of C♯ major (G♯7 → C♯maj7, in F♯-major contexts) and the V7 of C♯ minor (G♯7 → C♯m). The latter is the more common practical use; Beethoven\'s "Moonlight" Sonata in C♯ minor uses G♯7 → C♯m at every cadence.',
    faq: [
      { q: 'What notes are in a G♯7 chord?', a: 'G♯7 contains four notes: G♯ (root), B♯ (major third — same as C), D♯ (perfect fifth), and F♯ (minor seventh).' },
      { q: 'Is G♯7 the same as A♭7?', a: 'Yes, enharmonically — same four pitches. G♯7 lives in C♯-minor contexts; A♭7 lives in flat-side music. A♭7 is much more common in published jazz charts.' },
      { q: 'Why is the third B♯ and not C?', a: 'Major scales use each of the seven letters exactly once. The G♯ major scale runs G♯-A♯-B♯-C♯-D♯-E♯-F𝄪; the third of G♯7 must sit on the B letter, which is B♯.' },
      { q: 'When would I see G♯7 in real music?', a: 'As the V7 of C♯ minor — every C♯-minor cadence in classical and jazz literature uses G♯7. Beethoven\'s "Moonlight" Sonata is the most famous example. In flat-key contexts the same chord is written A♭7.' },
    ],
  },

  'a-flat-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'A♭ dominant 7 (A♭7) — A♭, C, E♭, G♭ — is A♭ major with a minor 7th. The chord is the V7 of D♭ major and the tritone substitute for D7 in jazz reharms. Coltrane\'s "Naima" uses A♭7 as a centrepiece chord; many jazz ballads modulate through D♭ major specifically to feature A♭7 → D♭maj7 cadences.',
    intervals: [
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of D♭ major', slug: 'd-flat-major', kind: 'chord' },
      { label: 'Related: A♭ major 7', slug: 'a-flat-major-7', kind: 'chord' },
      { label: 'Enharmonic: G♯ dominant 7', slug: 'g-sharp-dominant-7', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'a-flat-major-7', 'd-flat-major-7', 'e-flat-minor-7', 'g-sharp-dominant-7'],
    commonMistakes:
      'A♭7 has G♭ as its 7th — a half-step lower than A♭maj7 (which has G natural). Reading G♭ as G natural produces A♭maj7 (a stable tonic chord). The chord is enharmonically equivalent to G♯7, but A♭7 is much more common in published jazz literature.',
    inProgressions:
      'A♭7 is the V7 of D♭ major (A♭7 → D♭maj7) and a famous tritone substitute for D7 in cadences to G major. In ii–V–I in D♭ major, the progression runs E♭m7 → A♭7 → D♭maj7. Coltrane\'s "Naima" and "Body and Soul" (in D♭) make A♭7 a centerpiece chord.',
    faq: [
      { q: 'What notes are in an A♭7 chord?', a: 'A♭7 contains four notes: A♭ (root), C (major third), E♭ (perfect fifth), and G♭ (minor seventh).' },
      { q: 'Is A♭7 the same as G♯7?', a: 'Yes, enharmonically — same four pitches. A♭7 is the flat-side spelling (used in D♭-major contexts); G♯7 is the sharp-side spelling. A♭7 is universal in jazz.' },
      { q: 'How is A♭7 different from A♭maj7?', a: 'Only the seventh changes. A♭7 has G♭; A♭maj7 has G natural. A♭7 wants to resolve to D♭; A♭maj7 sits stably as a tonic.' },
      { q: 'What jazz standards use A♭7?', a: 'Coltrane\'s "Naima," "Body and Soul" (in D♭ major), "What Are You Doing the Rest of Your Life," and many other ballads in D♭. The cadence A♭7 → D♭maj7 is one of the most-played in advanced jazz harmony.' },
    ],
  },

  'a-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'A dominant 7 (A7) — A, C♯, E, G — is A major with a minor 7th. On guitar, the open A7 voicing (x02020) is one of the easiest chords to finger because open strings carry three of the four notes. The chord is the V7 of D major and the I7 of A blues — a guitar-friendly blues key alongside E.',
    intervals: [
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of D major', slug: 'd-major', kind: 'chord' },
      { label: 'I7 of A blues', slug: 'a-major', kind: 'chord' },
      { label: 'Related: A major 7', slug: 'a-major-7', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'a-major-7', 'd-major-7', 'e-minor-7', 'd-dominant-7'],
    commonMistakes:
      'A7 has G natural as its 7th — a half-step lower than Amaj7 (which has G♯). Replacing G with G♯ produces Amaj7 (a stable tonic chord). The blues-defining G natural is what makes A7 sound bluesy. On guitar, the open A7 (x02020) uses open strings for A, E, and G — making it ring out fully.',
    inProgressions:
      'A7 is the V7 of D major (A7 → D is the cadence in every D-major folk and country tune) and the I7 of A blues. The 12-bar blues in A is built on A7, D7, and E7. In ii–V–I in D major, the progression runs Em7 → A7 → Dmaj7.',
    faq: [
      { q: 'What notes are in an A7 chord?', a: 'A7 contains four notes: A (root), C♯ (major third), E (perfect fifth), and G (minor seventh).' },
      { q: 'How do you play A7 on guitar?', a: 'The open A7 voicing is x02020: mute the low E, then open A, E (2nd fret 4th string), open G, C♯ (2nd fret 2nd string), open high E.' },
      { q: 'How is A7 different from Amaj7?', a: 'Only the seventh changes. A7 has G natural; Amaj7 has G♯. A7 sounds bluesy and pulls toward D; Amaj7 sits stably as a tonic.' },
      { q: 'What pieces use A7?', a: 'Every D-major folk and country tune uses A7 at cadences. Every A blues uses A7 as the I chord. Hank Williams\' classic country writing in A and D leans heavily on A7. Robert Johnson\'s blues recordings are full of A7 voicings.' },
    ],
  },

  'b-flat-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'B♭ dominant 7 (B♭7) — B♭, D, F, A♭ — is B♭ major with a minor 7th. The chord is the V7 of E♭ major (B♭7 → E♭maj7) — the cadence in every E♭-major jazz standard from "Misty" to "Stella by Starlight." B♭7 is also the I7 of B♭ blues and the IV7 of F blues.',
    intervals: [
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of E♭ major', slug: 'e-flat-major', kind: 'chord' },
      { label: 'I7 of B♭ blues', slug: 'b-flat-major', kind: 'chord' },
      { label: 'Related: B♭ major 7', slug: 'b-flat-major-7', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'b-flat-major-7', 'e-flat-major-7', 'f-minor-7', 'e-flat-dominant-7'],
    commonMistakes:
      'B♭7 has A♭ as its 7th — a half-step lower than B♭maj7 (which has A natural). Replacing A♭ with A produces B♭maj7 (a stable tonic chord). On guitar, B♭7 is most often a 1st-fret A-shape barre. The chord is fundamental to big-band jazz because of B♭\'s role as the natural concert key for horns.',
    inProgressions:
      'B♭7 is the V7 of E♭ major (B♭7 → E♭maj7 — the cadence in every E♭-major jazz tune), the I7 of B♭ blues, and the IV7 of F blues. In ii–V–I in E♭ major, the progression runs Fm7 → B♭7 → E♭maj7. Charlie Parker\'s "Confirmation" (in F major) uses B♭7-related dominants throughout.',
    faq: [
      { q: 'What notes are in a B♭7 chord?', a: 'B♭7 contains four notes: B♭ (root), D (major third), F (perfect fifth), and A♭ (minor seventh).' },
      { q: 'What jazz standards use B♭7?', a: '"Misty" cadences through B♭7 → E♭maj7. "Stella by Starlight," "There Will Never Be Another You," and most E♭-major standards rely on B♭7 as the primary V7. Big-band charts in E♭ make B♭7 a workhorse chord.' },
      { q: 'How do you play B♭7 on guitar?', a: 'Most commonly a 1st-fret A-shape barre: index across strings 5-1 on fret 1, ring finger on the 3rd fret of the 4th string, middle finger on the 1st fret of the 3rd string, pinky on the 3rd fret of the 2nd string.' },
      { q: 'How is B♭7 different from B♭maj7?', a: 'Only the seventh changes. B♭7 has A♭; B♭maj7 has A natural. B♭7 sounds bluesy and pulls toward E♭; B♭maj7 sits stably as a tonic.' },
    ],
  },

  'b-dominant-7': {
    publishAt: '2020-01-01',
    intro:
      'B dominant 7 (B7) — B, D♯, F♯, A — is B major with a minor 7th. On guitar, the open B7 voicing (x21202) uses open strings cleverly to produce one of the easiest first-position B-rooted chords. The chord is the V7 of E major and the V7 of E minor. Every E-major and E-minor blues cadence uses B7.',
    intervals: [
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
    ],
    relatedKeys: [
      { label: 'V7 of E major', slug: 'e-major', kind: 'chord' },
      { label: 'V7 of E minor', slug: 'e-minor', kind: 'chord' },
      { label: 'Related: B major 7', slug: 'b-major-7', kind: 'chord' },
    ],
    relatedChords: ['b-major', 'b-major-7', 'e-major-7', 'f-sharp-minor-7', 'e-dominant-7'],
    commonMistakes:
      'B7 has A natural as its 7th — a half-step lower than Bmaj7 (which has A♯). Replacing A with A♯ produces Bmaj7 (a stable tonic chord). On guitar, the open B7 voicing (x21202) makes the chord accessible without needing a full barre; the F♯ and B sound on open strings.',
    inProgressions:
      'B7 is the V7 of E major (B7 → Emaj7 is the cadence in every E-major jazz tune and most E-major blues turnarounds) and the V7 of E minor (B7 → Em is the cadence in E minor). In ii–V–I in E major, the progression runs F♯m7 → B7 → Emaj7. The 12-bar blues in E uses E7, A7, B7.',
    faq: [
      { q: 'What notes are in a B7 chord?', a: 'B7 contains four notes: B (root), D♯ (major third), F♯ (perfect fifth), and A (minor seventh).' },
      { q: 'How do you play B7 on guitar?', a: 'The standard open B7 voicing is x21202: mute the low E, B on the 2nd fret of the 5th string, D♯ on the 1st fret of the 4th string, open string 3 (G is not in the chord but is muted by adjacent fingers in practice), A on the open 5th string... For most players, an A-shape barre at the 2nd fret with the 4th-string note adjusted is the cleanest closed-position voicing.' },
      { q: 'How is B7 different from Bmaj7?', a: 'Only the seventh changes. B7 has A natural; Bmaj7 has A♯. B7 sounds bluesy and pulls toward E; Bmaj7 sits stably as a tonic.' },
      { q: 'What pieces use B7?', a: 'Every E-major and E-minor cadence in jazz, folk, and rock. "Blackbird" by The Beatles (in G major but with related dominant voicings), countless E-major blues turnarounds, and any E-rooted folk song.' },
    ],
  },

  // ─── Phase 4: 6th chords ──────────────────────────────────────────────────
  // Major triad + major 6th (or minor triad + major 6th, despite the name).
  // The 6 chord is the jazz workhorse for "I chord with a softer landing"
  // and the bossa-nova staple at every tonic moment.

  'c-major-6': {
    publishAt: '2020-01-01',
    intro:
      'C6 (C major 6) — C, E, G, A — is a C major triad with an added major sixth. The chord sounds gentler and more complete than a plain triad, and softer than Cmaj7 (whose major 7th creates more tension). Bossa nova players reach for C6 as a tonic chord because of its open, satisfied quality.',
    intervals: [
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'A', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of C major', slug: 'c-major', kind: 'key' },
      { label: 'Parallel: C major triad', slug: 'c-major', kind: 'chord' },
      { label: 'Related: C major 7', slug: 'c-major-7', kind: 'chord' },
    ],
    relatedChords: ['c-major', 'c-major-7', 'c-minor-6', 'a-minor-7', 'f-major-7'],
    commonMistakes:
      'C6 and Am7 share the same four pitches (C, E, G, A) — they\'re different chord symbols for the same pitch set, differentiated only by which note sits in the bass. With C in the bass it\'s C6; with A in the bass it\'s Am7. Be careful not to confuse C6 with Cmaj7: C6 has A as the top extension; Cmaj7 has B. The half-step difference makes Cmaj7 noticeably more pungent.',
    inProgressions:
      'C6 most often appears as the I chord in C major (a softer alternative to Cmaj7) and at the end of jazz tunes as a "final tonic" chord. Bossa nova in C uses C6 constantly; jazz piano voicings frequently substitute C6 for plain C major to enrich the harmony without adding tension.',
    faq: [
      { q: 'What notes are in a C6 chord?', a: 'C6 contains four notes: C (root), E (major third), G (perfect fifth), and A (major sixth).' },
      { q: 'Is C6 the same as A minor 7?', a: 'They share the same four pitches but function differently. C6 has C as its root and serves as a major tonic; Am7 has A as its root and serves as the relative minor or as a ii chord.' },
      { q: 'How is C6 different from Cmaj7?', a: 'Only the top note changes. C6 has A (major sixth); Cmaj7 has B (major seventh). C6 sounds softer and more "resolved"; Cmaj7 has more tension from the half-step between B and C.' },
      { q: 'When is C6 used in jazz?', a: 'As a final tonic at the end of pieces in C major, as a substitute for plain C major in bossa-nova progressions, and as a softer "I chord" in ballads where Cmaj7 would be too rich.' },
    ],
  },

  'c-sharp-major-6': {
    publishAt: '2020-01-01',
    intro:
      'C♯6 — C♯, E♯, G♯, A♯ — is a C♯ major triad with an added major sixth. All four notes are sharps. The chord is enharmonic to D♭6 and is most often written as D♭6 in jazz charts; the C♯ spelling appears inside F♯ major or C♯ major key areas.',
    intervals: [
      { from: 'C#', to: 'E#', name: 'major 3rd', semitones: 4 },
      { from: 'E#', to: 'G#', name: 'minor 3rd', semitones: 3 },
      { from: 'G#', to: 'A#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Parallel: C♯ major triad', slug: 'c-sharp-major', kind: 'chord' },
      { label: 'Enharmonic: D♭ major 6', slug: 'd-flat-major-6', kind: 'chord' },
      { label: 'Related: C♯ major 7', slug: 'c-sharp-major-7', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-major', 'c-sharp-major-7', 'd-flat-major-6', 'a-sharp-minor-7', 'f-sharp-major-7'],
    commonMistakes:
      'The third (E♯) is enharmonic to F natural. In jazz lead-sheet practice, the chord is usually written D♭6 to avoid the E♯. The four sharps of C♯6 vs. the three flats + B♭ of D♭6 — same sound, easier reading on the flat side.',
    inProgressions:
      'C♯6 functions as a softer I chord in C♯ major and as a tonic alternative in F♯ major (where it\'s the IV chord). The enharmonic D♭6 covers the same harmonic territory in flat-key music.',
    faq: [
      { q: 'What notes are in a C♯6 chord?', a: 'C♯6 contains four notes: C♯ (root), E♯ (major third — same pitch as F), G♯ (perfect fifth), and A♯ (major sixth).' },
      { q: 'Is C♯6 the same as D♭6?', a: 'Yes, enharmonically — same four pitches. C♯6 has four sharps (including E♯); D♭6 has three flats plus B♭. D♭6 is the standard practical spelling.' },
      { q: 'Is C♯6 the same as A♯ minor 7?', a: 'Enharmonically the same four pitches but different functions. C♯6 has C♯ as root (major-flavoured tonic); A♯m7 has A♯ as root (minor 7th).' },
      { q: 'When would I see C♯6 in real music?', a: 'In music notated in C♯ major or F♯ major where the surrounding harmony already uses sharps. In jazz lead sheets the chord is universally D♭6.' },
    ],
  },

  'd-flat-major-6': {
    publishAt: '2020-01-01',
    intro:
      'D♭6 — D♭, F, A♭, B♭ — is a D♭ major triad with an added major sixth. The chord sits comfortably in flat-side jazz; many ballads in D♭ major use D♭6 as a final tonic chord. It\'s enharmonic to B♭ minor 7, which shares the same four pitches.',
    intervals: [
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'Bb', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of D♭ major', slug: 'd-flat-major', kind: 'key' },
      { label: 'Parallel: D♭ major triad', slug: 'd-flat-major', kind: 'chord' },
      { label: 'Enharmonic: B♭ minor 7', slug: 'b-flat-minor-7', kind: 'chord' },
    ],
    relatedChords: ['d-flat-major', 'd-flat-major-7', 'b-flat-minor-7', 'c-sharp-major-6', 'a-flat-major-7'],
    commonMistakes:
      'D♭6 uses three flats (D♭, A♭, B♭) plus F natural — a comfortable spelling for jazz musicians used to flat keys. Don\'t confuse D♭6 with D♭maj7: D♭6 has B♭ on top; D♭maj7 has C on top. The half-step difference completely changes the chord\'s character.',
    inProgressions:
      'D♭6 functions as a tonic chord in D♭ major, often substituted for plain D♭ or D♭maj7 for a softer landing. Many bossa-nova tunes that modulate to D♭ use D♭6 throughout the D♭ section because the chord\'s mellow colour suits the genre.',
    faq: [
      { q: 'What notes are in a D♭6 chord?', a: 'D♭6 contains four notes: D♭ (root), F (major third), A♭ (perfect fifth), and B♭ (major sixth).' },
      { q: 'Is D♭6 the same as B♭ minor 7?', a: 'Enharmonically yes — same four pitches. D♭6 has D♭ as root (major-flavoured tonic); B♭m7 has B♭ as root (minor 7th with different function).' },
      { q: 'How is D♭6 different from D♭maj7?', a: 'Only the top note changes. D♭6 has B♭ (major sixth); D♭maj7 has C (major seventh). D♭6 sounds gentler; D♭maj7 has more harmonic richness.' },
      { q: 'When is D♭6 used in jazz?', a: 'As a final tonic chord in D♭-major ballads, as a substitute for plain D♭ in bossa-nova progressions, and in any context where the soft landing of a 6 chord is preferred over the more pungent maj7.' },
    ],
  },

  'd-major-6': {
    publishAt: '2020-01-01',
    intro:
      'D6 — D, F♯, A, B — is a D major triad with an added major sixth. On guitar, the open D6 voicing (xx0202) is one of the easiest jazz chords to finger because three of the four notes ring on open strings or the second fret. The chord is a folk and country staple as well as a jazz tonic.',
    intervals: [
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'B', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of D major', slug: 'd-major', kind: 'key' },
      { label: 'Parallel: D major triad', slug: 'd-major', kind: 'chord' },
      { label: 'Enharmonic: B minor 7', slug: 'b-minor-7', kind: 'chord' },
    ],
    relatedChords: ['d-major', 'd-major-7', 'b-minor-7', 'a-major-7', 'g-major-7'],
    commonMistakes:
      'D6 has B natural as its sixth — a half-step lower than Dmaj7 (which has C♯). Reading B as Bb produces a different chord. On guitar, the open D6 voicing (xx0202) uses the open A and adds B on the high E string. Don\'t confuse D6 with D7: D6 has B (major sixth); D7 has C (minor seventh).',
    inProgressions:
      'D6 is the I chord in D major (a softer alternative to Dmaj7). The chord appears in many country and folk tunes as the tonic; jazz musicians use D6 as a final cadence chord at the end of D-major pieces. Bossa-nova standards in D major use D6 throughout.',
    faq: [
      { q: 'What notes are in a D6 chord?', a: 'D6 contains four notes: D (root), F♯ (major third), A (perfect fifth), and B (major sixth).' },
      { q: 'How do you play D6 on guitar?', a: 'The open D6 voicing is xx0202: mute strings 6-5, then open D, A (2nd fret 3rd string), open B, and F♯ (2nd fret 1st string).' },
      { q: 'Is D6 the same as B minor 7?', a: 'Enharmonically yes — same four pitches. D6 has D as root (major-flavoured); Bm7 has B as root (minor 7th).' },
      { q: 'When is D6 used in music?', a: 'As a tonic chord in D major folk, country, and jazz. The Beatles\' "Norwegian Wood" passes through D6-related harmony; many country ballads in D use D6 at final cadences.' },
    ],
  },

  'e-flat-major-6': {
    publishAt: '2020-01-01',
    intro:
      'E♭6 — E♭, G, B♭, C — is an E♭ major triad with an added major sixth. The chord is fundamental to big-band jazz because E♭ is a horn-friendly key; E♭6 appears at every primary cadence in E♭-major arrangements. It\'s enharmonic to C minor 7, sharing the same four pitches.',
    intervals: [
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'C', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of E♭ major', slug: 'e-flat-major', kind: 'key' },
      { label: 'Parallel: E♭ major triad', slug: 'e-flat-major', kind: 'chord' },
      { label: 'Enharmonic: C minor 7', slug: 'c-minor-7', kind: 'chord' },
    ],
    relatedChords: ['e-flat-major', 'e-flat-major-7', 'c-minor-7', 'a-flat-major-7', 'b-flat-dominant-7'],
    commonMistakes:
      'E♭6 has C natural as its sixth — a half-step lower than E♭maj7 (which has D natural). Reading C as C♭ or D would produce different chords. On piano, the chord falls comfortably as black-white-black-white starting from E♭.',
    inProgressions:
      'E♭6 is the I chord in E♭ major (often used as a softer alternative to E♭maj7) and a final cadence chord in big-band arrangements. "Misty" (in E♭) often resolves to E♭6 at the end. The chord is also fundamental to bebop in E♭ and to many Charlie Parker compositions.',
    faq: [
      { q: 'What notes are in an E♭6 chord?', a: 'E♭6 contains four notes: E♭ (root), G (major third), B♭ (perfect fifth), and C (major sixth).' },
      { q: 'Is E♭6 the same as C minor 7?', a: 'Enharmonically yes — same four pitches. E♭6 has E♭ as root (major tonic); Cm7 has C as root (minor 7th).' },
      { q: 'How is E♭6 different from E♭maj7?', a: 'Only the top note changes. E♭6 has C (major sixth); E♭maj7 has D (major seventh). E♭6 sounds softer; E♭maj7 has more tension from the half-step between D and E♭.' },
      { q: 'When is E♭6 used in big-band jazz?', a: 'As a tonic chord at the end of arrangements in E♭ major. The 6th adds a softer, more "complete" feel than a plain E♭ triad, and it avoids the major-7 dissonance against the root.' },
    ],
  },

  'e-major-6': {
    publishAt: '2020-01-01',
    intro:
      'E6 — E, G♯, B, C♯ — is an E major triad with an added major sixth. The chord is a guitar favourite because the open E string anchors it and the C♯ on top adds the major-6 colour. Many country and folk songs in E use E6 as a tonic alternative; jazz uses it as a final-tonic resolution.',
    intervals: [
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'C#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of E major', slug: 'e-major', kind: 'key' },
      { label: 'Parallel: E major triad', slug: 'e-major', kind: 'chord' },
      { label: 'Enharmonic: C♯ minor 7', slug: 'c-sharp-minor-7', kind: 'chord' },
    ],
    relatedChords: ['e-major', 'e-major-7', 'c-sharp-minor-7', 'a-major-7', 'b-dominant-7'],
    commonMistakes:
      'E6 has C♯ as its sixth — a half-step lower than Emaj7 (which has D♯). Reading C♯ as C natural produces a different chord. On guitar, an open E6 voicing keeps the open E string and replaces the standard E shape\'s 3rd-string finger to grab the sixth.',
    inProgressions:
      'E6 is the I chord in E major (a softer alternative to Emaj7). Country and rockabilly in E use E6 at tonic moments because of its bright, complete sound. The Beatles\' "I Want to Hold Your Hand" hovers around G major but uses E-rooted 6 chords in related sections.',
    faq: [
      { q: 'What notes are in an E6 chord?', a: 'E6 contains four notes: E (root), G♯ (major third), B (perfect fifth), and C♯ (major sixth).' },
      { q: 'Is E6 the same as C♯ minor 7?', a: 'Enharmonically yes — same four pitches. E6 has E as root (major tonic); C♯m7 has C♯ as root (minor 7th).' },
      { q: 'How is E6 different from Emaj7?', a: 'Only the top note changes. E6 has C♯ (major sixth); Emaj7 has D♯ (major seventh). E6 sounds softer and more "country"; Emaj7 sounds more jazz-tinged.' },
      { q: 'What pieces use E6?', a: 'Country and rockabilly tunes in E, jazz ballads ending in E, and many bossa-nova standards transposed to E. The bright, complete colour of E6 makes it a natural choice for tonic resolutions in those genres.' },
    ],
  },

  'f-major-6': {
    publishAt: '2020-01-01',
    intro:
      'F6 — F, A, C, D — is an F major triad with an added major sixth. All four notes are naturals, making F6 one of the cleanest 6-chord spellings. The chord is enharmonic to D minor 7 — same four pitches — and is a staple jazz tonic for F major progressions.',
    intervals: [
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'D', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of F major', slug: 'f-major', kind: 'key' },
      { label: 'Parallel: F major triad', slug: 'f-major', kind: 'chord' },
      { label: 'Enharmonic: D minor 7', slug: 'd-minor-7', kind: 'chord' },
    ],
    relatedChords: ['f-major', 'f-major-7', 'd-minor-7', 'b-flat-major-7', 'c-dominant-7'],
    commonMistakes:
      'F6 has D natural as its sixth — a half-step lower than Fmaj7 (which has E natural). Don\'t confuse F6 with F7 (which has E♭ as a minor 7th); the 6 sits a step lower than the 7. On guitar, F6 is often a partial barre or a 4-string voicing avoiding the full F barre.',
    inProgressions:
      'F6 is the I chord in F major (often used as a softer alternative to Fmaj7). Many jazz standards in F major resolve to F6 at the end ("Girl from Ipanema" voicings sometimes end on F6). The chord also serves as the IV in C major (giving a slightly lydian flavour).',
    faq: [
      { q: 'What notes are in an F6 chord?', a: 'F6 contains four notes: F (root), A (major third), C (perfect fifth), and D (major sixth).' },
      { q: 'Is F6 the same as D minor 7?', a: 'Enharmonically yes — same four pitches. F6 has F as root (major tonic); Dm7 has D as root (minor 7th).' },
      { q: 'How is F6 different from F7?', a: 'F6 has D (major sixth — a stable, consonant note); F7 has E♭ (minor seventh — a tense, dominant-functioning note). F6 sits stably as a tonic; F7 pulls toward B♭.' },
      { q: 'What pieces use F6?', a: '"Girl from Ipanema" (in F major) often uses F6 at final cadences. Many F-major jazz standards resolve to F6 as a final-tonic chord. Bossa-nova in F also leans on F6 voicings.' },
    ],
  },

  'f-sharp-major-6': {
    publishAt: '2020-01-01',
    intro:
      'F♯6 — F♯, A♯, C♯, D♯ — is an F♯ major triad with an added major sixth. Four sharps. The chord is enharmonic to G♭6 (used in flat-key music) and to D♯ minor 7 (sharing all four pitches).',
    intervals: [
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'C#', name: 'minor 3rd', semitones: 3 },
      { from: 'C#', to: 'D#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of F♯ major', slug: 'f-sharp-major', kind: 'key' },
      { label: 'Enharmonic: G♭ major 6', slug: 'g-flat-major-6', kind: 'chord' },
      { label: 'Enharmonic: D♯ minor 7', slug: 'd-sharp-minor-7', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-major', 'f-sharp-major-7', 'g-flat-major-6', 'd-sharp-minor-7', 'c-sharp-major-7'],
    commonMistakes:
      'F♯6 has D♯ as its sixth — a half-step lower than F♯maj7 (which has E♯). On guitar, F♯6 is typically a 2nd-fret E-shape barre with the standard E6 modification (adjusting the high-string finger to grab the 6th).',
    inProgressions:
      'F♯6 is the I chord in F♯ major. The chord appears at final cadences in F♯-major jazz tunes. In flat-key contexts, the same chord is written G♭6.',
    faq: [
      { q: 'What notes are in an F♯6 chord?', a: 'F♯6 contains four notes: F♯ (root), A♯ (major third), C♯ (perfect fifth), and D♯ (major sixth).' },
      { q: 'Is F♯6 the same as G♭6?', a: 'Yes, enharmonically — same four pitches. F♯6 has four sharps; G♭6 has four flats (with E♭ as the major sixth). Composers pick based on surrounding harmony.' },
      { q: 'Is F♯6 the same as D♯ minor 7?', a: 'Enharmonically yes — same four pitches. F♯6 has F♯ as root; D♯m7 has D♯ as root. Different functions but same notes.' },
      { q: 'When would I see F♯6 instead of G♭6?', a: 'In music notated in F♯ major or in sharp-side modulating jazz. In flat-key contexts, G♭6 is the practical spelling.' },
    ],
  },

  'g-flat-major-6': {
    publishAt: '2020-01-01',
    intro:
      'G♭6 — G♭, B♭, D♭, E♭ — is a G♭ major triad with an added major sixth. The chord lives in deep flat-side jazz; many ballads modulate to G♭ specifically because G♭6 has a unique mellow colour. It\'s enharmonic to F♯6 and to E♭ minor 7.',
    intervals: [
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'Eb', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of G♭ major', slug: 'g-flat-major', kind: 'key' },
      { label: 'Enharmonic: F♯ major 6', slug: 'f-sharp-major-6', kind: 'chord' },
      { label: 'Enharmonic: E♭ minor 7', slug: 'e-flat-minor-7', kind: 'chord' },
    ],
    relatedChords: ['g-flat-major', 'g-flat-major-7', 'f-sharp-major-6', 'e-flat-minor-7', 'd-flat-major-7'],
    commonMistakes:
      'G♭6 uses four flats (G♭, B♭, D♭, E♭). The most common confusion is with G♭maj7, which has F natural on top instead of E♭. The half-step lower top note in G♭6 gives a softer landing.',
    inProgressions:
      'G♭6 functions as a tonic chord in G♭ major. Wayne Shorter\'s "Footprints" passes through G♭-major colours; jazz ballads in G♭ use G♭6 at final cadences. The chord is also enharmonic to E♭ minor 7, which can serve as a pivot for modulation.',
    faq: [
      { q: 'What notes are in a G♭6 chord?', a: 'G♭6 contains four notes: G♭ (root), B♭ (major third), D♭ (perfect fifth), and E♭ (major sixth).' },
      { q: 'Is G♭6 the same as F♯6 or E♭ minor 7?', a: 'Yes to both, enharmonically — same four pitches. G♭6 is the flat-side spelling; F♯6 the sharp-side; E♭m7 names the chord by a different root.' },
      { q: 'How is G♭6 different from G♭maj7?', a: 'Only the top note changes. G♭6 has E♭ (major sixth); G♭maj7 has F natural (major seventh). G♭6 sounds gentler.' },
      { q: 'When does G♭6 appear in jazz?', a: 'In G♭-major ballads at final cadences, in modulating jazz tunes that visit G♭ for one section, and as an enharmonic pivot from E♭ minor.' },
    ],
  },

  'g-major-6': {
    publishAt: '2020-01-01',
    intro:
      'G6 — G, B, D, E — is a G major triad with an added major sixth. All four notes are naturals. The chord is one of the friendliest 6-chord spellings, and on guitar the open G6 voicing (320000) is one of the very easiest chords to finger — almost identical to open G major.',
    intervals: [
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'E', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of G major', slug: 'g-major', kind: 'key' },
      { label: 'Parallel: G major triad', slug: 'g-major', kind: 'chord' },
      { label: 'Enharmonic: E minor 7', slug: 'e-minor-7', kind: 'chord' },
    ],
    relatedChords: ['g-major', 'g-major-7', 'e-minor-7', 'c-major-7', 'd-dominant-7'],
    commonMistakes:
      'G6 has E natural as its sixth — a half-step lower than Gmaj7 (which has F♯). The most common error is reading G6 as G7 (which has F natural). On guitar, the open G6 voicing (320000) just removes the high-string finger from open G major, letting the open E ring as the sixth.',
    inProgressions:
      'G6 is the I chord in G major (often substituted for plain G major for a brighter, more complete sound). Country and folk in G use G6 constantly; jazz ballads in G resolve to G6 as a final tonic. The Beatles\' "I Want to Hold Your Hand" hovers around G-related 6-chord voicings.',
    faq: [
      { q: 'What notes are in a G6 chord?', a: 'G6 contains four notes: G (root), B (major third), D (perfect fifth), and E (major sixth).' },
      { q: 'How do you play G6 on guitar?', a: 'The open G6 voicing is 320000: G (3rd fret 6th string), B (2nd fret 5th string), open D, open G, open B, open high E.' },
      { q: 'Is G6 the same as E minor 7?', a: 'Enharmonically yes — same four pitches. G6 has G as root (major tonic); Em7 has E as root (minor 7th).' },
      { q: 'What pieces use G6?', a: 'Countless folk and country tunes in G use G6 instead of plain G major for a brighter sound. The Beatles\' "Day Tripper" and many other 60s pop hits pass through G6-related voicings.' },
    ],
  },

  'g-sharp-major-6': {
    publishAt: '2020-01-01',
    intro:
      'G♯6 — G♯, B♯, D♯, E♯ — is a G♯ major triad with an added major sixth. The B♯ (enharmonic to C) and E♯ (enharmonic to F) reveal the chord\'s deep-sharp-side spelling. In practical music the chord is universally written A♭6, which uses friendlier flats.',
    intervals: [
      { from: 'G#', to: 'B#', name: 'major 3rd', semitones: 4 },
      { from: 'B#', to: 'D#', name: 'minor 3rd', semitones: 3 },
      { from: 'D#', to: 'E#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: A♭ major 6', slug: 'a-flat-major-6', kind: 'chord' },
      { label: 'Parallel: G♯ major (theoretical)', slug: 'g-sharp-major', kind: 'chord' },
      { label: 'Enharmonic: F minor 7 (no — A♭6 pivot)', slug: 'f-minor-7', kind: 'chord' },
    ],
    relatedChords: ['g-sharp-major', 'a-flat-major-6', 'f-minor-7', 'c-sharp-major-7', 'd-sharp-minor-7'],
    commonMistakes:
      'G♯6 uses B♯ and E♯ — both enharmonic to naturals. The spelling appears only in deep sharp-key music (around C♯ major or G♯ major). In all practical jazz and popular notation, A♭6 is the standard spelling.',
    inProgressions:
      'G♯6 doesn\'t function as a working chord outside theoretical sharp-key explorations. The enharmonic A♭6 covers all practical uses.',
    faq: [
      { q: 'What notes are in a G♯6 chord?', a: 'G♯6 contains four notes: G♯ (root), B♯ (major third — same as C), D♯ (perfect fifth), and E♯ (major sixth — same as F).' },
      { q: 'Is G♯6 the same as A♭6?', a: 'Yes, enharmonically — same four pitches. A♭6 (four flats) is the universal practical spelling; G♯6 appears only in deeply chromatic sharp-key music.' },
      { q: 'Why is the third B♯ and not C?', a: 'Major scales use each of the seven letters exactly once. The G♯ major scale runs G♯-A♯-B♯-C♯-D♯-E♯-F𝄪 — using each letter in order. The third must sit on B, becoming B♯.' },
      { q: 'When would I see G♯6 in real music?', a: 'Essentially never as a working chord symbol. The spelling appears only in Bach\'s systematic key explorations (WTC) and in dense chromatic Romantic music.' },
    ],
  },

  'a-flat-major-6': {
    publishAt: '2020-01-01',
    intro:
      'A♭6 — A♭, C, E♭, F — is an A♭ major triad with an added major sixth. The chord is a jazz workhorse: A♭ major is comfortable for horns and vocalists, and A♭6 appears at countless final cadences in A♭-major standards. It\'s enharmonic to F minor 7.',
    intervals: [
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'F', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of A♭ major', slug: 'a-flat-major', kind: 'key' },
      { label: 'Parallel: A♭ major triad', slug: 'a-flat-major', kind: 'chord' },
      { label: 'Enharmonic: F minor 7', slug: 'f-minor-7', kind: 'chord' },
    ],
    relatedChords: ['a-flat-major', 'a-flat-major-7', 'f-minor-7', 'd-flat-major-7', 'e-flat-dominant-7'],
    commonMistakes:
      'A♭6 has F natural as its sixth — a half-step lower than A♭maj7 (which has G natural). Don\'t confuse A♭6 with A♭7 (which has G♭ as a minor 7th). On piano, A♭6 falls comfortably under the hand as black-white-black-white.',
    inProgressions:
      'A♭6 is the I chord in A♭ major (often used as a final tonic at the end of A♭-major arrangements). "Misty" (in A♭ major) frequently ends on A♭6 for a softer landing than A♭maj7. The chord is also fundamental to jazz piano voicings throughout the A♭-major repertoire.',
    faq: [
      { q: 'What notes are in an A♭6 chord?', a: 'A♭6 contains four notes: A♭ (root), C (major third), E♭ (perfect fifth), and F (major sixth).' },
      { q: 'Is A♭6 the same as F minor 7?', a: 'Enharmonically yes — same four pitches. A♭6 has A♭ as root (major tonic); Fm7 has F as root (minor 7th).' },
      { q: 'How is A♭6 different from A♭maj7?', a: 'Only the top note changes. A♭6 has F (major sixth); A♭maj7 has G (major seventh). A♭6 sounds softer; A♭maj7 has more harmonic richness.' },
      { q: 'What jazz standards use A♭6?', a: '"Misty" often resolves to A♭6 at the end. Many A♭-major ballads use A♭6 at final cadences. The chord is also a primary tonic substitute in A♭-major bossa-nova arrangements.' },
    ],
  },

  'a-major-6': {
    publishAt: '2020-01-01',
    intro:
      'A6 — A, C♯, E, F♯ — is an A major triad with an added major sixth. The chord is a guitar favourite because the open A string makes A-rooted 6 voicings ring fully. It\'s enharmonic to F♯ minor 7. Country, folk, and rockabilly in A use A6 constantly.',
    intervals: [
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'F#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of A major', slug: 'a-major', kind: 'key' },
      { label: 'Parallel: A major triad', slug: 'a-major', kind: 'chord' },
      { label: 'Enharmonic: F♯ minor 7', slug: 'f-sharp-minor-7', kind: 'chord' },
    ],
    relatedChords: ['a-major', 'a-major-7', 'f-sharp-minor-7', 'd-major-7', 'e-dominant-7'],
    commonMistakes:
      'A6 has F♯ as its sixth — a half-step lower than Amaj7 (which has G♯). On guitar, the open A6 voicing replaces the standard A shape\'s top-string finger with an open string or barre to grab F♯ on the 2nd fret of the 4th string.',
    inProgressions:
      'A6 is the I chord in A major (often used as a softer alternative to Amaj7). Country and rockabilly in A use A6 as a primary tonic; jazz uses it at final cadences. The Beatles\' "If I Fell" (in D major but with A-rooted excursions) uses A6-related voicings.',
    faq: [
      { q: 'What notes are in an A6 chord?', a: 'A6 contains four notes: A (root), C♯ (major third), E (perfect fifth), and F♯ (major sixth).' },
      { q: 'How do you play A6 on guitar?', a: 'A closed-position A6 voicing: A (open 5th string), F♯ (2nd fret 4th string), A (2nd fret 3rd string), C♯ (2nd fret 2nd string), open high E. Many other voicings exist — A6 is one of the more versatile chords on guitar.' },
      { q: 'Is A6 the same as F♯ minor 7?', a: 'Enharmonically yes — same four pitches. A6 has A as root (major tonic); F♯m7 has F♯ as root (minor 7th).' },
      { q: 'What pieces use A6?', a: 'Many country and rockabilly tunes in A use A6 as a tonic. Jazz ballads in A often resolve to A6 at final cadences. Bossa-nova standards in A use A6 throughout.' },
    ],
  },

  'b-flat-major-6': {
    publishAt: '2020-01-01',
    intro:
      'B♭6 — B♭, D, F, G — is a B♭ major triad with an added major sixth. The chord is fundamental to big-band jazz because B♭ is the natural concert key for trumpets and tenor saxes. B♭6 is enharmonic to G minor 7 and appears at every primary cadence in B♭-major arrangements.',
    intervals: [
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'G', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of B♭ major', slug: 'b-flat-major', kind: 'key' },
      { label: 'Parallel: B♭ major triad', slug: 'b-flat-major', kind: 'chord' },
      { label: 'Enharmonic: G minor 7', slug: 'g-minor-7', kind: 'chord' },
    ],
    relatedChords: ['b-flat-major', 'b-flat-major-7', 'g-minor-7', 'e-flat-major-7', 'f-dominant-7'],
    commonMistakes:
      'B♭6 has G natural as its sixth — a half-step lower than B♭maj7 (which has A natural). Don\'t confuse B♭6 with B♭7 (which has A♭ as a minor 7th). On guitar, B♭6 is typically a 1st-fret A-shape barre with the standard barre voicing adjusted to grab the 6th.',
    inProgressions:
      'B♭6 is the I chord in B♭ major (often used as a final-tonic substitute for plain B♭ or B♭maj7). Charlie Parker\'s "Confirmation," "Anthropology," and other B♭-major bebop standards resolve to B♭6 at final cadences. Big-band charts in B♭ use B♭6 constantly.',
    faq: [
      { q: 'What notes are in a B♭6 chord?', a: 'B♭6 contains four notes: B♭ (root), D (major third), F (perfect fifth), and G (major sixth).' },
      { q: 'Is B♭6 the same as G minor 7?', a: 'Enharmonically yes — same four pitches. B♭6 has B♭ as root (major tonic); Gm7 has G as root (minor 7th).' },
      { q: 'How is B♭6 different from B♭maj7?', a: 'Only the top note changes. B♭6 has G (major sixth); B♭maj7 has A natural (major seventh). B♭6 sounds softer.' },
      { q: 'What pieces use B♭6?', a: '"Confirmation" by Charlie Parker, "Anthropology," and many other B♭-major bebop standards resolve to B♭6. Big-band charts in B♭ use B♭6 throughout as a primary tonic colour.' },
    ],
  },

  'b-major-6': {
    publishAt: '2020-01-01',
    intro:
      'B6 — B, D♯, F♯, G♯ — is a B major triad with an added major sixth. The chord uses four sharps. It\'s enharmonic to G♯ minor 7 and appears in jazz tunes transposed to B major for vocal range.',
    intervals: [
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'G#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of B major', slug: 'b-major', kind: 'key' },
      { label: 'Parallel: B major triad', slug: 'b-major', kind: 'chord' },
      { label: 'Enharmonic: G♯ minor 7', slug: 'g-sharp-minor-7', kind: 'chord' },
    ],
    relatedChords: ['b-major', 'b-major-7', 'g-sharp-minor-7', 'e-major-7', 'f-sharp-dominant-7'],
    commonMistakes:
      'B6 has G♯ as its sixth — a half-step lower than Bmaj7 (which has A♯). On guitar, B6 is typically a 2nd-fret A-shape barre with the standard voicing adjusted.',
    inProgressions:
      'B6 is the I chord in B major (often used as a softer tonic). Jazz tunes transposed to B for vocal range often resolve to B6 at final cadences. The chord also serves as the IV in F♯ major.',
    faq: [
      { q: 'What notes are in a B6 chord?', a: 'B6 contains four notes: B (root), D♯ (major third), F♯ (perfect fifth), and G♯ (major sixth).' },
      { q: 'Is B6 the same as G♯ minor 7?', a: 'Enharmonically yes — same four pitches. B6 has B as root (major tonic); G♯m7 has G♯ as root (minor 7th).' },
      { q: 'How is B6 different from Bmaj7?', a: 'Only the top note changes. B6 has G♯ (major sixth); Bmaj7 has A♯ (major seventh). B6 sounds softer.' },
      { q: 'When does B6 appear in music?', a: 'In jazz tunes transposed to B major for vocal range, in F♯-major arrangements (as the IV), and in late-Romantic classical music as a chromatic colour.' },
    ],
  },

  // ─── Phase 4: minor 6th chords ───────────────────────────────────────────
  // Minor triad + MAJOR 6th (yes, the "minor" 6 chord uses a major 6th —
  // that\'s the defining sound). The chord shows up as i6 in jazz minor-
  // key tonics and as a brighter alternative to a plain minor triad.

  'c-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Cm6 — C, E♭, G, A — is a C minor triad with an added major sixth. The "minor 6" name refers to the minor triad, not the sixth itself; the 6 is the major sixth (A from C), which is what gives the chord its slightly brighter, more jazzy character compared to a plain Cm chord. Cm6 is a primary tonic chord in C-minor jazz.',
    intervals: [
      { from: 'C', to: 'Eb', name: 'minor 3rd', semitones: 3 },
      { from: 'Eb', to: 'G', name: 'major 3rd', semitones: 4 },
      { from: 'G', to: 'A', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of C minor (= E♭ major)', slug: 'e-flat-major', kind: 'key' },
      { label: 'Parallel: C minor triad', slug: 'c-minor', kind: 'chord' },
      { label: 'Related: C major 6', slug: 'c-major-6', kind: 'chord' },
    ],
    relatedChords: ['c-minor', 'c-minor-7', 'c-major-6', 'a-half-diminished', 'g-dominant-7'],
    commonMistakes:
      'The most common surprise with m6 chords is the major sixth — Cm6 has A natural, not A♭ (which would come from C natural minor). The major 6 distinguishes the chord from a Cm scale-based harmonic colour; the chord effectively borrows from C melodic minor or C Dorian. Cm6 is enharmonic to Am7♭5 (sharing the same four pitches).',
    inProgressions:
      'Cm6 is the i chord in C minor (often used as a final tonic in C-minor jazz instead of a plain Cm triad). The cadence Dm7♭5 → G7 → Cm6 closes many C-minor jazz tunes. Bach used i6 chords in his C-minor literature as a softer minor-tonic landing.',
    faq: [
      { q: 'What notes are in a Cm6 chord?', a: 'Cm6 contains four notes: C (root), E♭ (minor third), G (perfect fifth), and A (major sixth).' },
      { q: 'Why does a "minor 6" chord use a MAJOR sixth?', a: 'The "minor" in m6 refers to the triad, not the sixth interval. A minor triad plus a major sixth on top is the standard m6 voicing — it borrows the 6 from melodic minor or Dorian rather than from natural minor.' },
      { q: 'Is Cm6 the same as Am7♭5?', a: 'Enharmonically yes — same four pitches. Cm6 has C as root (minor tonic); Am7♭5 has A as root (half-diminished, ii of G minor).' },
      { q: 'What jazz standards use Cm6?', a: 'C-minor jazz tunes often end on Cm6 instead of plain Cm. "Stella by Starlight" passes through C-minor harmony; "Solar" by Miles Davis modulates through related minor 6 colours.' },
    ],
  },

  'c-sharp-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'C♯m6 — C♯, E, G♯, A♯ — is a C♯ minor triad with an added major sixth. The chord is the i6 of C♯ minor and enharmonic to A♯ half-diminished. Its sound is darker than C♯m7 because the 6 (A♯) sits lower than the m7 would (B), but brighter than plain C♯ minor.',
    intervals: [
      { from: 'C#', to: 'E', name: 'minor 3rd', semitones: 3 },
      { from: 'E', to: 'G#', name: 'major 3rd', semitones: 4 },
      { from: 'G#', to: 'A#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of C♯ minor (= E major)', slug: 'e-major', kind: 'key' },
      { label: 'Parallel: C♯ minor triad', slug: 'c-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: A♯ half-diminished', slug: 'a-sharp-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['c-sharp-minor', 'c-sharp-minor-7', 'a-sharp-half-diminished', 'g-sharp-dominant-7', 'e-major-7'],
    commonMistakes:
      'C♯m6 has A♯ as its sixth — borrowed from C♯ Dorian or C♯ melodic minor (which include A♯ as the raised 6th of C♯ natural minor). On guitar, C♯m6 is typically a closed-position 4-string voicing on the upper strings.',
    inProgressions:
      'C♯m6 is the i6 of C♯ minor (often used as a final tonic in C♯-minor jazz). The cadence D♯m7♭5 → G♯7 → C♯m6 closes many C♯-minor tunes.',
    faq: [
      { q: 'What notes are in a C♯m6 chord?', a: 'C♯m6 contains four notes: C♯ (root), E (minor third), G♯ (perfect fifth), and A♯ (major sixth).' },
      { q: 'Is C♯m6 the same as A♯ half-diminished?', a: 'Enharmonically yes — same four pitches. C♯m6 has C♯ as root; A♯ø has A♯ as root and functions differently.' },
      { q: 'How is C♯m6 different from C♯m7?', a: 'Only the top note changes. C♯m6 has A♯ (major sixth); C♯m7 has B (minor seventh). The 6 sits a step lower; the m7 is more extended.' },
      { q: 'When is C♯m6 used in jazz?', a: 'As a final tonic chord in C♯-minor ballads (rare but they exist when tunes are transposed for vocal range). The chord is more common in classical music as a borrowed-mode colour.' },
    ],
  },

  'd-flat-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'D♭m6 — D♭, F♭, A♭, B♭ — is a D♭ minor triad with an added major sixth. The F♭ (enharmonic to E) marks the deeply flat-side spelling. In practice the chord is universally written C♯m6.',
    intervals: [
      { from: 'Db', to: 'Fb', name: 'minor 3rd', semitones: 3 },
      { from: 'Fb', to: 'Ab', name: 'major 3rd', semitones: 4 },
      { from: 'Ab', to: 'Bb', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: C♯ minor 6', slug: 'c-sharp-minor-6', kind: 'chord' },
      { label: 'Parallel: D♭ minor (theoretical)', slug: 'd-flat-minor', kind: 'chord' },
      { label: 'Related: D♭ major 6', slug: 'd-flat-major-6', kind: 'chord' },
    ],
    relatedChords: ['d-flat-minor', 'c-sharp-minor-6', 'd-flat-major-6', 'a-flat-minor-7', 'g-flat-major-7'],
    commonMistakes:
      'D♭m6 uses F♭ as the minor third (enharmonic to E). The spelling appears only in dense chromatic flat-key music. In all working jazz contexts, C♯m6 is the standard.',
    inProgressions:
      'D♭m6 doesn\'t function as a working chord outside theoretical flat-key explorations. The enharmonic C♯m6 covers all practical uses.',
    faq: [
      { q: 'What notes are in a D♭m6 chord?', a: 'D♭m6 contains four notes: D♭ (root), F♭ (minor third — same as E), A♭ (perfect fifth), and B♭ (major sixth).' },
      { q: 'Is D♭m6 the same as C♯m6?', a: 'Yes, enharmonically — same four pitches. D♭m6 requires F♭ (rare); C♯m6 uses only sharps and naturals. C♯m6 is the universal practical spelling.' },
      { q: 'When does D♭m6 appear in real music?', a: 'Essentially never as a working chord symbol. The spelling appears only in deeply chromatic Romantic-era classical music.' },
      { q: 'Why is the third F♭ instead of E?', a: 'The minor 6 chord stacks intervals on each scale-letter from the root. D♭ minor uses letters D-F-A-C; the third lands on F, which is F♭ when lowered a half step.' },
    ],
  },

  'd-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Dm6 — D, F, A, B — is a D minor triad with an added major sixth. All four notes are naturals. The chord is the i6 of D minor — a primary tonic in D-minor jazz — and is enharmonic to B half-diminished, sharing the same four pitches.',
    intervals: [
      { from: 'D', to: 'F', name: 'minor 3rd', semitones: 3 },
      { from: 'F', to: 'A', name: 'major 3rd', semitones: 4 },
      { from: 'A', to: 'B', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of D minor (= F major)', slug: 'f-major', kind: 'key' },
      { label: 'Parallel: D minor triad', slug: 'd-minor', kind: 'chord' },
      { label: 'Enharmonic: B half-diminished', slug: 'b-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['d-minor', 'd-minor-7', 'b-half-diminished', 'a-dominant-7', 'g-minor-7'],
    commonMistakes:
      'Dm6 has B natural as its sixth — borrowed from D Dorian or D melodic minor (which include B as the raised 6th of D natural minor). Don\'t confuse Dm6 with Dm7: Dm6 has B (major sixth); Dm7 has C (minor seventh).',
    inProgressions:
      'Dm6 is the i6 of D minor (often used as a final tonic in D-minor jazz tunes). Miles Davis\'s "So What" is modally based on Dm7, but related D-minor tunes use Dm6 at cadences. The progression Em7♭5 → A7 → Dm6 is the standard ii-V-i in D minor.',
    faq: [
      { q: 'What notes are in a Dm6 chord?', a: 'Dm6 contains four notes: D (root), F (minor third), A (perfect fifth), and B (major sixth).' },
      { q: 'Is Dm6 the same as B half-diminished?', a: 'Enharmonically yes — same four pitches. Dm6 has D as root (minor tonic); Bø has B as root (ii of A minor).' },
      { q: 'How is Dm6 different from Dm7?', a: 'Only the top note changes. Dm6 has B (major sixth); Dm7 has C (minor seventh). Dm6 sounds brighter and more "jazz-tinged"; Dm7 sounds more modal.' },
      { q: 'When is Dm6 used in jazz?', a: 'As a final tonic in D-minor ballads, as a substitute for plain D minor in modal jazz, and as a bossa-nova tonic colour. "Solar" by Miles Davis (which modulates through D minor) uses related m6 voicings.' },
    ],
  },

  'd-sharp-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'D♯m6 — D♯, F♯, A♯, B♯ — is a D♯ minor triad with an added major sixth. The B♯ (enharmonic to C) marks the sharp-side spelling. The chord is the i6 of D♯ minor and is enharmonic to E♭m6 in flat-key notation.',
    intervals: [
      { from: 'D#', to: 'F#', name: 'minor 3rd', semitones: 3 },
      { from: 'F#', to: 'A#', name: 'major 3rd', semitones: 4 },
      { from: 'A#', to: 'B#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of D♯ minor (= F♯ major)', slug: 'f-sharp-major', kind: 'key' },
      { label: 'Parallel: D♯ minor triad', slug: 'd-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: E♭ minor 6', slug: 'e-flat-minor-6', kind: 'chord' },
    ],
    relatedChords: ['d-sharp-minor', 'd-sharp-minor-7', 'e-flat-minor-6', 'a-sharp-half-diminished', 'g-sharp-dominant-7'],
    commonMistakes:
      'D♯m6 uses B♯ as its sixth — enharmonic to C natural. The all-sharp spelling is unusual; most jazz charts use E♭m6 instead. The chord is enharmonic to A♯ half-diminished.',
    inProgressions:
      'D♯m6 is the i6 of D♯ minor (a rare key in practical music). The chord appears only in deep sharp-key contexts; flat-side music writes E♭m6.',
    faq: [
      { q: 'What notes are in a D♯m6 chord?', a: 'D♯m6 contains four notes: D♯ (root), F♯ (minor third), A♯ (perfect fifth), and B♯ (major sixth — same as C).' },
      { q: 'Is D♯m6 the same as E♭m6?', a: 'Yes, enharmonically — same four pitches. D♯m6 is the sharp-side spelling; E♭m6 is the flat-side. E♭m6 is much more common in jazz literature.' },
      { q: 'Why is the sixth B♯ and not C?', a: 'The m6 chord stacks intervals on each scale-letter from the root. D♯ minor uses letters D-F-A-B-... wait — D-F-A-C. So the sixth must sit on the B letter, which becomes B♯ in this context.' },
      { q: 'When does D♯m6 appear in music?', a: 'Rarely. The chord appears in deep sharp-key contexts (F♯ major literature). Modern lead sheets use E♭m6 instead for readability.' },
    ],
  },

  'e-flat-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'E♭m6 — E♭, G♭, B♭, C — is an E♭ minor triad with an added major sixth. The chord is the i6 of E♭ minor and is enharmonic to C half-diminished. E♭m6 appears at final cadences in E♭-minor jazz tunes, which though rare, do exist.',
    intervals: [
      { from: 'Eb', to: 'Gb', name: 'minor 3rd', semitones: 3 },
      { from: 'Gb', to: 'Bb', name: 'major 3rd', semitones: 4 },
      { from: 'Bb', to: 'C', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of E♭ minor (= G♭ major)', slug: 'g-flat-major', kind: 'key' },
      { label: 'Parallel: E♭ minor triad', slug: 'e-flat-minor', kind: 'chord' },
      { label: 'Enharmonic: C half-diminished', slug: 'c-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['e-flat-minor', 'e-flat-minor-7', 'c-half-diminished', 'b-flat-dominant-7', 'g-flat-major-7'],
    commonMistakes:
      'E♭m6 uses three flats (E♭, G♭, B♭) plus C natural. The chord is rare in published music; flat-key minor tonics usually appear as plain triads or m7 chords. When E♭m6 does appear, the C natural is its identifying feature.',
    inProgressions:
      'E♭m6 functions as the i6 of E♭ minor in jazz. The cadence Fm7♭5 → B♭7 → E♭m6 closes E♭-minor tunes. The chord is also enharmonic to C half-diminished, which makes it a useful pivot for modulation.',
    faq: [
      { q: 'What notes are in an E♭m6 chord?', a: 'E♭m6 contains four notes: E♭ (root), G♭ (minor third), B♭ (perfect fifth), and C (major sixth).' },
      { q: 'Is E♭m6 the same as C half-diminished?', a: 'Enharmonically yes — same four pitches. E♭m6 has E♭ as root (minor tonic); Cø has C as root (ii of B♭ minor).' },
      { q: 'How is E♭m6 different from E♭m7?', a: 'Only the top note changes. E♭m6 has C (major sixth); E♭m7 has D♭ (minor seventh). The 6 sits a step lower than the m7.' },
      { q: 'When is E♭m6 used in jazz?', a: 'As a tonic chord in E♭-minor tunes (rare but they exist) and as an enharmonic pivot via C half-diminished.' },
    ],
  },

  'e-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Em6 — E, G, B, C♯ — is an E minor triad with an added major sixth. The chord is the i6 of E minor and is enharmonic to C♯ half-diminished. On guitar, the open Em6 voicing (022020) keeps the bass E open and adds the major 6th (C♯) on the 2nd fret of the 2nd string.',
    intervals: [
      { from: 'E', to: 'G', name: 'minor 3rd', semitones: 3 },
      { from: 'G', to: 'B', name: 'major 3rd', semitones: 4 },
      { from: 'B', to: 'C#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of E minor (= G major)', slug: 'g-major', kind: 'key' },
      { label: 'Parallel: E minor triad', slug: 'e-minor', kind: 'chord' },
      { label: 'Enharmonic: C♯ half-diminished', slug: 'c-sharp-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['e-minor', 'e-minor-7', 'c-sharp-half-diminished', 'b-dominant-7', 'a-minor-7'],
    commonMistakes:
      'Em6 has C♯ as its sixth — borrowed from E Dorian (which has C♯ as the raised 6th of E natural minor). The C♯ distinguishes Em6 from Em or Em7. On guitar, the open Em6 voicing is one of the easiest m6 chords to finger.',
    inProgressions:
      'Em6 is the i6 of E minor (often used as a tonic in E-minor jazz tunes). The cadence F♯m7♭5 → B7 → Em6 closes many E-minor jazz tunes. "Autumn Leaves" (in E minor / G major) sometimes uses Em6 at final cadences.',
    faq: [
      { q: 'What notes are in an Em6 chord?', a: 'Em6 contains four notes: E (root), G (minor third), B (perfect fifth), and C♯ (major sixth).' },
      { q: 'How do you play Em6 on guitar?', a: 'The open Em6 voicing is 022020: open low E, B (2nd fret 5th string), E (2nd fret 4th string), open G, C♯ (2nd fret 2nd string), and open high E.' },
      { q: 'Is Em6 the same as C♯ half-diminished?', a: 'Enharmonically yes — same four pitches. Em6 has E as root (minor tonic); C♯ø has C♯ as root (ii of B minor).' },
      { q: 'What pieces use Em6?', a: '"Autumn Leaves" (in E minor) sometimes ends on Em6. Many E-minor jazz tunes use Em6 as a tonic; bossa-nova standards in E minor lean on Em6 for its mellow but bright colour.' },
    ],
  },

  'f-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Fm6 — F, A♭, C, D — is an F minor triad with an added major sixth. The chord is the i6 of F minor and is enharmonic to D half-diminished. Beethoven\'s "Appassionata" Sonata uses related minor tonic colours; jazz uses Fm6 as a final cadence in F-minor tunes.',
    intervals: [
      { from: 'F', to: 'Ab', name: 'minor 3rd', semitones: 3 },
      { from: 'Ab', to: 'C', name: 'major 3rd', semitones: 4 },
      { from: 'C', to: 'D', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of F minor (= A♭ major)', slug: 'a-flat-major', kind: 'key' },
      { label: 'Parallel: F minor triad', slug: 'f-minor', kind: 'chord' },
      { label: 'Enharmonic: D half-diminished', slug: 'd-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['f-minor', 'f-minor-7', 'd-half-diminished', 'c-dominant-7', 'b-flat-minor-7'],
    commonMistakes:
      'Fm6 has D natural as its sixth — borrowed from F Dorian (which has D as the raised 6th of F natural minor). The chord is enharmonic to Dm7♭5; same four pitches, different harmonic function. On guitar, Fm6 is typically a 1st-fret E-shape barre with the standard m6 voicing adjustments.',
    inProgressions:
      'Fm6 is the i6 of F minor (often used as a final tonic in F-minor jazz). The cadence Gm7♭5 → C7 → Fm6 closes many F-minor tunes. "Stella by Starlight" passes through F-minor harmony at moments; Fm6 voicings appear at related cadential points.',
    faq: [
      { q: 'What notes are in an Fm6 chord?', a: 'Fm6 contains four notes: F (root), A♭ (minor third), C (perfect fifth), and D (major sixth).' },
      { q: 'Is Fm6 the same as D half-diminished?', a: 'Enharmonically yes — same four pitches. Fm6 has F as root (minor tonic); Dø has D as root (ii of C minor).' },
      { q: 'How is Fm6 different from Fm7?', a: 'Only the top note changes. Fm6 has D (major sixth); Fm7 has E♭ (minor seventh). The 6 sits a step lower than the m7.' },
      { q: 'When does Fm6 appear in jazz?', a: 'As a final tonic in F-minor ballads and as an enharmonic pivot via D half-diminished. Beethoven used related m6 colours in his "Appassionata" Sonata; jazz pianists from Bill Evans onward use Fm6 voicings throughout F-minor literature.' },
    ],
  },

  'f-sharp-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'F♯m6 — F♯, A, C♯, D♯ — is an F♯ minor triad with an added major sixth. The chord is the i6 of F♯ minor and is enharmonic to D♯ half-diminished. On guitar, F♯m6 is typically a 2nd-fret E-minor-shape barre with the m6 voicing adjustments.',
    intervals: [
      { from: 'F#', to: 'A', name: 'minor 3rd', semitones: 3 },
      { from: 'A', to: 'C#', name: 'major 3rd', semitones: 4 },
      { from: 'C#', to: 'D#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of F♯ minor (= A major)', slug: 'a-major', kind: 'key' },
      { label: 'Parallel: F♯ minor triad', slug: 'f-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: D♯ half-diminished', slug: 'd-sharp-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['f-sharp-minor', 'f-sharp-minor-7', 'd-sharp-half-diminished', 'c-sharp-dominant-7', 'b-minor-7'],
    commonMistakes:
      'F♯m6 has D♯ as its sixth — borrowed from F♯ Dorian. The chord uses three sharps (F♯, C♯, D♯) plus A natural. Don\'t confuse with F♯m7 (which has E natural as the m7 instead of D♯ as the 6).',
    inProgressions:
      'F♯m6 is the i6 of F♯ minor (often used as a final tonic in F♯-minor jazz). The cadence G♯m7♭5 → C♯7 → F♯m6 closes many F♯-minor tunes.',
    faq: [
      { q: 'What notes are in an F♯m6 chord?', a: 'F♯m6 contains four notes: F♯ (root), A (minor third), C♯ (perfect fifth), and D♯ (major sixth).' },
      { q: 'Is F♯m6 the same as D♯ half-diminished?', a: 'Enharmonically yes — same four pitches. F♯m6 has F♯ as root (minor tonic); D♯ø has D♯ as root (ii of C♯ minor).' },
      { q: 'How is F♯m6 different from F♯m7?', a: 'Only the top note changes. F♯m6 has D♯ (major sixth); F♯m7 has E natural (minor seventh).' },
      { q: 'When is F♯m6 used in music?', a: 'As a tonic chord in F♯-minor jazz tunes. The chord also appears in classical Romantic music as a borrowed Dorian colour from the parent key.' },
    ],
  },

  'g-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Gm6 — G, B♭, D, E — is a G minor triad with an added major sixth. The chord is the i6 of G minor and is enharmonic to E half-diminished. Bach used related minor-tonic colours in his G-minor literature; jazz uses Gm6 as a final cadence in G-minor tunes.',
    intervals: [
      { from: 'G', to: 'Bb', name: 'minor 3rd', semitones: 3 },
      { from: 'Bb', to: 'D', name: 'major 3rd', semitones: 4 },
      { from: 'D', to: 'E', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of G minor (= B♭ major)', slug: 'b-flat-major', kind: 'key' },
      { label: 'Parallel: G minor triad', slug: 'g-minor', kind: 'chord' },
      { label: 'Enharmonic: E half-diminished', slug: 'e-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['g-minor', 'g-minor-7', 'e-half-diminished', 'd-dominant-7', 'c-minor-7'],
    commonMistakes:
      'Gm6 has E natural as its sixth — borrowed from G Dorian (which has E as the raised 6th of G natural minor). Don\'t confuse Gm6 with Gm7 (which has F natural as the m7). On guitar, Gm6 is typically a 3rd-fret E-minor-shape barre.',
    inProgressions:
      'Gm6 is the i6 of G minor (often used as a final tonic). The cadence Am7♭5 → D7 → Gm6 closes many G-minor jazz tunes. Mozart\'s G-minor symphonies use related minor-tonic colours; the m6 chord adds a slightly brighter quality than plain Gm.',
    faq: [
      { q: 'What notes are in a Gm6 chord?', a: 'Gm6 contains four notes: G (root), B♭ (minor third), D (perfect fifth), and E (major sixth).' },
      { q: 'Is Gm6 the same as E half-diminished?', a: 'Enharmonically yes — same four pitches. Gm6 has G as root (minor tonic); Eø has E as root (ii of D minor).' },
      { q: 'How is Gm6 different from Gm7?', a: 'Only the top note changes. Gm6 has E (major sixth); Gm7 has F (minor seventh).' },
      { q: 'What jazz standards use Gm6?', a: '"Solar" by Miles Davis modulates through G-minor colours. Many G-minor jazz tunes end on Gm6 as a softer tonic alternative to plain Gm.' },
    ],
  },

  'g-sharp-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'G♯m6 — G♯, B, D♯, E♯ — is a G♯ minor triad with an added major sixth. The E♯ (enharmonic to F) marks the sharp-side spelling. The chord is enharmonic to A♭m6 in flat-key contexts and to F half-diminished in pitch.',
    intervals: [
      { from: 'G#', to: 'B', name: 'minor 3rd', semitones: 3 },
      { from: 'B', to: 'D#', name: 'major 3rd', semitones: 4 },
      { from: 'D#', to: 'E#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of G♯ minor (= B major)', slug: 'b-major', kind: 'key' },
      { label: 'Parallel: G♯ minor triad', slug: 'g-sharp-minor', kind: 'chord' },
      { label: 'Enharmonic: A♭ minor 6', slug: 'a-flat-minor-6', kind: 'chord' },
    ],
    relatedChords: ['g-sharp-minor', 'g-sharp-minor-7', 'a-flat-minor-6', 'd-sharp-dominant-7', 'f-half-diminished'],
    commonMistakes:
      'G♯m6 uses E♯ as its sixth — enharmonic to F natural. The all-sharp spelling appears in B-major / F♯-major contexts; in flat keys the same chord is A♭m6.',
    inProgressions:
      'G♯m6 is the i6 of G♯ minor in jazz contexts (rare). The cadence A♯m7♭5 → D♯7 → G♯m6 closes G♯-minor tunes, though most jazz uses A♭m6 instead.',
    faq: [
      { q: 'What notes are in a G♯m6 chord?', a: 'G♯m6 contains four notes: G♯ (root), B (minor third), D♯ (perfect fifth), and E♯ (major sixth — same as F).' },
      { q: 'Is G♯m6 the same as A♭m6?', a: 'Enharmonically yes — same four pitches. G♯m6 is the sharp-side spelling; A♭m6 is the flat-side. A♭m6 is much more common in jazz.' },
      { q: 'Why is the sixth E♯ and not F?', a: 'The m6 chord uses each scale-letter exactly once. G♯ minor uses letters G-B-D-E... wait — G-B-D-F. So the sixth must sit on E (one letter back from F), becoming E♯ when raised a half step.' },
      { q: 'When would I see G♯m6 in music?', a: 'In music notated in B major or F♯ major. Jazz tunes transposed to those keys use G♯m6 as a minor tonic.' },
    ],
  },

  'a-flat-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'A♭m6 — A♭, C♭, E♭, F — is an A♭ minor triad with an added major sixth. The C♭ (enharmonic to B) marks the deeply flat-side spelling. The chord is enharmonic to G♯m6 in sharp keys and to F half-diminished in pitch.',
    intervals: [
      { from: 'Ab', to: 'Cb', name: 'minor 3rd', semitones: 3 },
      { from: 'Cb', to: 'Eb', name: 'major 3rd', semitones: 4 },
      { from: 'Eb', to: 'F', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Enharmonic: G♯ minor 6', slug: 'g-sharp-minor-6', kind: 'chord' },
      { label: 'Parallel: A♭ minor (theoretical)', slug: 'a-flat-minor', kind: 'chord' },
      { label: 'Enharmonic: F half-diminished', slug: 'f-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['a-flat-minor', 'g-sharp-minor-6', 'f-half-diminished', 'e-flat-dominant-7', 'd-flat-major-7'],
    commonMistakes:
      'A♭m6 uses C♭ as its minor third — enharmonic to B natural. The spelling is rare; in practical music G♯m6 is used. The chord is enharmonic to F half-diminished, which gives it a useful modulating role.',
    inProgressions:
      'A♭m6 doesn\'t function as a primary tonic in working music. The chord may appear briefly inside dense chromatic flat-key passages; everywhere else the enharmonic G♯m6 covers the harmonic territory.',
    faq: [
      { q: 'What notes are in an A♭m6 chord?', a: 'A♭m6 contains four notes: A♭ (root), C♭ (minor third — same as B), E♭ (perfect fifth), and F (major sixth).' },
      { q: 'Is A♭m6 the same as G♯m6?', a: 'Yes, enharmonically — same four pitches. A♭m6 (with C♭) is rare; G♯m6 is the standard sharp-side spelling.' },
      { q: 'Why is the third C♭ instead of B?', a: 'The m6 chord uses each scale-letter once. A♭ minor uses letters A-C-E-F (sometimes G). The third lands on C, which is C♭ when lowered from C natural.' },
      { q: 'When does A♭m6 appear in real music?', a: 'Essentially never as a working chord. The spelling appears only in deep chromatic flat-key contexts. Practical music uses G♯m6 instead.' },
    ],
  },

  'a-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Am6 — A, C, E, F♯ — is an A minor triad with an added major sixth. The chord is the i6 of A minor and is enharmonic to F♯ half-diminished. On guitar, the closed-position Am6 voicing is one of the most-used m6 chords in jazz.',
    intervals: [
      { from: 'A', to: 'C', name: 'minor 3rd', semitones: 3 },
      { from: 'C', to: 'E', name: 'major 3rd', semitones: 4 },
      { from: 'E', to: 'F#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of A minor (= C major)', slug: 'c-major', kind: 'key' },
      { label: 'Parallel: A minor triad', slug: 'a-minor', kind: 'chord' },
      { label: 'Enharmonic: F♯ half-diminished', slug: 'f-sharp-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['a-minor', 'a-minor-7', 'f-sharp-half-diminished', 'e-dominant-7', 'd-minor-7'],
    commonMistakes:
      'Am6 has F♯ as its sixth — borrowed from A Dorian (which has F♯ as the raised 6th of A natural minor). Don\'t confuse with Am7 (which has G natural as the m7) or Amaj7 (which would change the third too). The F♯ is the chord\'s identifying note.',
    inProgressions:
      'Am6 is the i6 of A minor (often used as a final tonic in A-minor jazz). "Autumn Leaves" (in A minor) ends on Am6 in some arrangements. The cadence Bm7♭5 → E7 → Am6 closes many A-minor tunes — and the chord is also enharmonic to F♯ half-diminished, the famous "Tristan-chord-related" sonority.',
    faq: [
      { q: 'What notes are in an Am6 chord?', a: 'Am6 contains four notes: A (root), C (minor third), E (perfect fifth), and F♯ (major sixth).' },
      { q: 'Is Am6 the same as F♯ half-diminished?', a: 'Enharmonically yes — same four pitches. Am6 has A as root (minor tonic); F♯ø has F♯ as root (ii of E minor, also the Tristan chord transposed).' },
      { q: 'How is Am6 different from Am7?', a: 'Only the top note changes. Am6 has F♯ (major sixth); Am7 has G (minor seventh). The 6 sits a step lower than the m7.' },
      { q: 'What pieces use Am6?', a: '"Autumn Leaves" (in A minor) often ends on Am6. Many A-minor jazz standards use Am6 as a tonic. The chord is also famous as the enharmonic equivalent of F♯ø, used in Wagner\'s Tristan-style writing.' },
    ],
  },

  'b-flat-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'B♭m6 — B♭, D♭, F, G — is a B♭ minor triad with an added major sixth. The chord is the i6 of B♭ minor and is enharmonic to G half-diminished. Tchaikovsky used related minor-tonic colours in his B♭-minor literature; jazz uses B♭m6 at final cadences.',
    intervals: [
      { from: 'Bb', to: 'Db', name: 'minor 3rd', semitones: 3 },
      { from: 'Db', to: 'F', name: 'major 3rd', semitones: 4 },
      { from: 'F', to: 'G', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of B♭ minor (= D♭ major)', slug: 'd-flat-major', kind: 'key' },
      { label: 'Parallel: B♭ minor triad', slug: 'b-flat-minor', kind: 'chord' },
      { label: 'Enharmonic: G half-diminished', slug: 'g-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['b-flat-minor', 'b-flat-minor-7', 'g-half-diminished', 'f-dominant-7', 'e-flat-minor-7'],
    commonMistakes:
      'B♭m6 has G natural as its sixth — borrowed from B♭ Dorian (which has G as the raised 6th of B♭ natural minor). Don\'t confuse with B♭m7 (which has A♭ as the m7). The G sits a step lower than the m7.',
    inProgressions:
      'B♭m6 is the i6 of B♭ minor (used as a final tonic in B♭-minor jazz). The cadence Cm7♭5 → F7 → B♭m6 closes many B♭-minor tunes. Tchaikovsky\'s Piano Concerto No. 1 (which opens in B♭ minor) uses related minor-tonic colours.',
    faq: [
      { q: 'What notes are in a B♭m6 chord?', a: 'B♭m6 contains four notes: B♭ (root), D♭ (minor third), F (perfect fifth), and G (major sixth).' },
      { q: 'Is B♭m6 the same as G half-diminished?', a: 'Enharmonically yes — same four pitches. B♭m6 has B♭ as root (minor tonic); Gø has G as root (ii of F minor).' },
      { q: 'How is B♭m6 different from B♭m7?', a: 'Only the top note changes. B♭m6 has G (major sixth); B♭m7 has A♭ (minor seventh). The 6 sits a step lower than the m7.' },
      { q: 'What jazz standards use B♭m6?', a: '"Lush Life" (in D♭ major, modulates through B♭-minor sections), "Stella by Starlight," and many other tunes pass through B♭-minor harmony with B♭m6 voicings at cadences.' },
    ],
  },

  'b-minor-6': {
    publishAt: '2020-01-01',
    intro:
      'Bm6 — B, D, F♯, G♯ — is a B minor triad with an added major sixth. The chord is the i6 of B minor and is enharmonic to G♯ half-diminished. Bach\'s Mass in B minor uses related minor-tonic colours; jazz uses Bm6 as a final cadence in B-minor tunes.',
    intervals: [
      { from: 'B', to: 'D', name: 'minor 3rd', semitones: 3 },
      { from: 'D', to: 'F#', name: 'major 3rd', semitones: 4 },
      { from: 'F#', to: 'G#', name: 'major 2nd', semitones: 2 },
    ],
    relatedKeys: [
      { label: 'Key of B minor (= D major)', slug: 'd-major', kind: 'key' },
      { label: 'Parallel: B minor triad', slug: 'b-minor', kind: 'chord' },
      { label: 'Enharmonic: G♯ half-diminished', slug: 'g-sharp-half-diminished', kind: 'chord' },
    ],
    relatedChords: ['b-minor', 'b-minor-7', 'g-sharp-half-diminished', 'f-sharp-dominant-7', 'e-minor-7'],
    commonMistakes:
      'Bm6 has G♯ as its sixth — borrowed from B Dorian (which has G♯ as the raised 6th of B natural minor). Don\'t confuse with Bm7 (which has A natural as the m7). On guitar, Bm6 is typically a closed-position 4-string voicing.',
    inProgressions:
      'Bm6 is the i6 of B minor (often used as a final tonic in B-minor jazz). The cadence C♯m7♭5 → F♯7 → Bm6 closes many B-minor tunes. The chord is also enharmonic to G♯ half-diminished, which makes it useful as a pivot for modulation.',
    faq: [
      { q: 'What notes are in a Bm6 chord?', a: 'Bm6 contains four notes: B (root), D (minor third), F♯ (perfect fifth), and G♯ (major sixth).' },
      { q: 'Is Bm6 the same as G♯ half-diminished?', a: 'Enharmonically yes — same four pitches. Bm6 has B as root (minor tonic); G♯ø has G♯ as root (ii of F♯ minor).' },
      { q: 'How is Bm6 different from Bm7?', a: 'Only the top note changes. Bm6 has G♯ (major sixth); Bm7 has A natural (minor seventh). The 6 sits a step lower than the m7.' },
      { q: 'What pieces use Bm6?', a: 'B-minor jazz standards often end on Bm6. Bach\'s Mass in B minor uses related minor-tonic colours; many film scores in B minor borrow the Dorian raised-6 colour that defines Bm6.' },
    ],
  },
};

// Public lookup. Returns the full page descriptor or null if not yet live.
export const getChordPageContent = (slug, now = new Date()) => {
  const meta = slugToChord(slug);
  if (!meta) return null;
  const content = CONTENT[slug];
  if (!content || !isLive(content.publishAt, now)) return null;
  const notes = buildChord(meta.root, meta.qualityKey);
  return { slug, ...meta, notes, ...content };
};

// Slugs that are live as of `now`. Drives route registration + sitemap.
export const getLiveChordSlugs = (now = new Date()) =>
  Object.entries(CONTENT)
    .filter(([, c]) => isLive(c.publishAt, now))
    .map(([slug]) => slug);

// Backwards-compat export — used by HamburgerNav, sitemap script, App routes.
// Captures the value at module-load time, which for SSG = build time.
export const PUBLISHED_CHORD_SLUGS = getLiveChordSlugs();
