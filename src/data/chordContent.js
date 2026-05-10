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
