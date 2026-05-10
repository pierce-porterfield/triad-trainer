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
