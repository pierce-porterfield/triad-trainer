// Programmatic chord-page content registry.
//
// Each entry maps a URL slug to its canonical reference content + a
// `publishAt: 'YYYY-MM-DD'` UTC date. Pages go live automatically when today's
// UTC date reaches that string. See src/data/publishSchedule.js + the daily
// rebuild GitHub Action for the staggered-rollout mechanics.

import { buildChord, QUALITIES } from './triads.js';
import { isLive } from './publishSchedule.js';

// Convert a root + quality slug ("c-major", "a-flat-minor") to a chord descriptor.
export const slugToChord = (slug) => {
  const m = slug.match(/^([a-g])(?:-(sharp|flat))?-(major|minor|diminished|augmented)$/);
  if (!m) return null;
  const [, letter, accidental, quality] = m;
  const root = letter.toUpperCase()
    + (accidental === 'sharp' ? '#' : accidental === 'flat' ? 'b' : '');
  const qualityKey = { major: 'maj', minor: 'min', diminished: 'dim', augmented: 'aug' }[quality];
  const q = QUALITIES[qualityKey];
  return {
    root,
    qualityKey,
    quality,
    qualityLabel: q.label,
    chordName: `${root}${q.symbol}`,
    displayName: `${root} ${quality}`,
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
