// Programmatic scale-page content registry — sister to keyContent.js.
//
// Scale pages focus on the *melodic/intervallic* angle (interval pattern,
// intervals from the root, scale-degree names, modal context), where key
// pages focus on the *harmonic/notational* side (key signature, diatonic
// chords, progressions, relative minor).
//
// Each entry has a `publishAt: 'YYYY-MM-DD'` UTC date and the daily-rebuild
// GitHub Action rolls scheduled scales live.

import { MAJOR_KEYS, MINOR_KEYS, notesInKey } from './keys.js';
import { isLive } from './publishSchedule.js';

const tonicToSlugStem = (tonic) => {
  const letter = tonic[0].toLowerCase();
  if (tonic.length === 1) return letter;
  return `${letter}-${tonic[1] === '#' ? 'sharp' : 'flat'}`;
};

const tonicToSlug = (tonic, type) => `${tonicToSlugStem(tonic)}-${type}`;

// "g-major", "f-sharp-minor" → { tonic, type }
export const slugToScale = (slug) => {
  const m = slug.match(/^([a-g])(?:-(sharp|flat))?-(major|minor)$/);
  if (!m) return null;
  const [, letter, accidental, type] = m;
  const tonic = letter.toUpperCase()
    + (accidental === 'sharp' ? '#' : accidental === 'flat' ? 'b' : '');
  const pool = type === 'major' ? MAJOR_KEYS : MINOR_KEYS;
  const key = pool.find((k) => k.tonic === tonic);
  if (!key) return null;
  return { tonic, type, key };
};

// Whole/half-step pattern of the scale.
export const stepPattern = (type) =>
  type === 'major'
    ? ['W', 'W', 'H', 'W', 'W', 'W', 'H']
    : ['W', 'H', 'W', 'W', 'H', 'W', 'W']; // natural minor

// Interval names from root for each scale degree.
export const degreeIntervals = (type) =>
  type === 'major'
    ? ['Root', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']
    : ['Root', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'];

const SCALE_DEGREE_NAMES = [
  'Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Subtonic / Leading tone',
];

export const buildScaleDegrees = (type, scaleNotes) => {
  const intervals = degreeIntervals(type);
  return scaleNotes.map((note, i) => ({
    degree: i + 1,
    name: SCALE_DEGREE_NAMES[i],
    interval: intervals[i],
    note,
  }));
};

export const ALL_SCALE_SLUGS = [
  ...MAJOR_KEYS.map((k) => tonicToSlug(k.tonic, 'major')),
  ...MINOR_KEYS.map((k) => tonicToSlug(k.tonic, 'minor')),
];

// Hand-written commentary per scale. Intro + context + mistakes + faq are
// per-scale; everything else (notes, intervals, pattern) is computed.
const CONTENT = {
  // ─── Live today ─────────────────────────────────────────────────────────
  'c-major': {
    publishAt: '2020-01-01',
    type: 'major',
    intro:
      'The C major scale is the simplest in Western music — seven white keys, no sharps, no flats. It\'s where every theory student starts: the natural reference for what "major" sounds like. Every other scale is, in some sense, measured against this one.',
    context:
      'Beginning piano repertoire from Bach to The Beatles is full of C major. It\'s the default key for sight-singing, ear-training drills, and theory examples because there\'s no key-signature distraction — every note is exactly what it looks like. The relative minor (A minor) shares the same notes; only the centre of gravity shifts.',
    commonMistakes:
      'Beginners sometimes assume "white keys = C major", but A natural minor uses the same seven notes. What makes a scale a *scale* is its tonic — the note the music resolves to. Watch for B → C as the half-step that gives the scale its strong leading-tone pull.',
    faq: [
      { q: 'What are the notes in the C major scale?', a: 'C, D, E, F, G, A, B.' },
      { q: 'How many sharps or flats does C major have?', a: 'None — C major has no accidentals.' },
      { q: 'What is the interval pattern of the C major scale?', a: 'Whole, whole, half, whole, whole, whole, half (the standard major-scale pattern, often abbreviated W-W-H-W-W-W-H).' },
      { q: 'What is the relative minor of C major?', a: 'A minor — same seven notes, but centred on A instead of C.' },
    ],
  },
  'a-minor': {
    publishAt: '2020-01-01',
    type: 'minor',
    intro:
      'A natural minor uses the same seven notes as C major but starts and resolves on A. It\'s the natural reference scale for "minor" in the same way C major is for major: no sharps, no flats, just a different home note. The half-steps fall in different places, which is what gives minor its darker character.',
    context:
      'A minor shows up across folk, classical, film scoring, and popular music whenever a piece needs to feel pensive without being explicitly sad. Many beginning improvisers learn it as their first minor key because the lack of accidentals makes it easy to focus on the melodic shape rather than fingerings.',
    commonMistakes:
      'A natural minor isn\'t the only A-minor scale — A harmonic minor raises the 7th to G#, and A melodic minor raises the 6th and 7th going up (F#, G#) and uses naturals coming down. Most pop and folk uses *natural* minor; classical and jazz often use harmonic or melodic.',
    faq: [
      { q: 'What are the notes in the A natural minor scale?', a: 'A, B, C, D, E, F, G.' },
      { q: 'How is A minor different from C major if they share notes?', a: 'They use the same set of pitches but treat different notes as the tonal centre. C major resolves to C; A minor resolves to A. The shifted resolution changes the entire feel.' },
      { q: 'What is the interval pattern of A natural minor?', a: 'W-H-W-W-H-W-W (whole, half, whole, whole, half, whole, whole).' },
      { q: 'What is the relative major of A minor?', a: 'C major — same key signature.' },
    ],
  },

  // ─── Queued: 2026-04-27 → onward ────────────────────────────────────────
  'g-major': {
    publishAt: '2026-04-27',
    type: 'major',
    intro:
      'The G major scale has one sharp — F# — and is one of the most frequently played scales in folk, country, rock, and pop. Guitarists know its shape from the first thing they ever learn; violinists practice it more than any other scale because three of its notes are open strings.',
    context:
      'G major scales appear in everything from Mozart concertos to Mumford & Sons. The reason it sits so naturally on stringed instruments is that G, D, and A — three of the seven scale tones — are open strings on a guitar, and four of seven on a violin. That open-string sympathy is also why melodies in G major tend to ring brighter than the same melody transposed.',
    commonMistakes:
      'The single sharp is on the 7th degree (F#), the leading tone — easy to forget when sight-reading. The relative minor is E minor, which uses the same notes; if a melody in G keeps gravitating to E rather than G, you\'re probably hearing E minor.',
    faq: [
      { q: 'What are the notes in the G major scale?', a: 'G, A, B, C, D, E, F#.' },
      { q: 'How many sharps does G major have?', a: 'One: F#.' },
      { q: 'What is the relative minor of G major?', a: 'E minor.' },
    ],
  },
  'e-minor': {
    publishAt: '2026-04-28',
    type: 'minor',
    intro:
      'The E natural minor scale has one sharp — F# — and shares its notes with G major. It\'s the most-used minor key on guitar by a wide margin: the lowest open string is E, and many of the easiest open chords (Em, G, D, C) live inside this scale.',
    context:
      'Heavy metal, blues, folk, and singer-songwriter music all live in E minor. The dropped-tuning variants on rock guitar are typically still in or near E minor. The natural-minor flavour without raised 7ths gives it a modal, ancient feel — many film scores use E natural minor specifically for that quality.',
    commonMistakes:
      'E natural minor and E harmonic minor are easy to confuse. Harmonic raises the 7th from D to D#, which gives a much stronger leading tone and a "Spanish" or "Eastern" sound on the V → i cadence. Most modern rock and folk uses natural; classical and flamenco often use harmonic.',
    faq: [
      { q: 'What are the notes in the E natural minor scale?', a: 'E, F#, G, A, B, C, D.' },
      { q: 'How many sharps does E minor have?', a: 'One: F# — same as its relative major, G major.' },
      { q: 'What is the relative major of E minor?', a: 'G major.' },
    ],
  },
  'f-major': {
    publishAt: '2026-04-29',
    type: 'major',
    intro:
      'The F major scale has one flat — Bb — and is the first scale on the flat side of the circle of fifths. Wind players know it intimately: clarinet and bassoon repertoire is full of F major, and concert-band music uses it as a default key.',
    context:
      'Mozart and Beethoven both used F major for some of their lightest, most pastoral writing — it tends to feel warm and unhurried. In jazz, F major is a common landing key for ballads. The single flat is right where most diatonic melodies fall, so the key signature stays simple even with chromatic embellishment.',
    commonMistakes:
      'Every B in the score is Bb unless explicitly cancelled. Beginners on guitar reach for an "open F" voicing that doesn\'t exist — F major requires either a barre chord or a partial three-string voicing.',
    faq: [
      { q: 'What are the notes in the F major scale?', a: 'F, G, A, Bb, C, D, E.' },
      { q: 'How many flats does F major have?', a: 'One: Bb.' },
      { q: 'What is the relative minor of F major?', a: 'D minor.' },
    ],
  },
  'd-minor': {
    publishAt: '2026-04-30',
    type: 'minor',
    intro:
      'The D natural minor scale has one flat — Bb — and shares its notes with F major. It\'s often called "the saddest of all keys" (quoting Spinal Tap), and there\'s some truth to the reputation: a lot of grave, contemplative music sits in D minor.',
    context:
      'Bach\'s D minor Toccata and Fugue, Mozart\'s D minor Requiem, and countless film and game soundtracks live in this scale. On guitar, D minor is a comfortable key for fingerstyle pieces because the open strings (D, G, B, E) are all diatonic to it.',
    commonMistakes:
      'D natural minor and D harmonic minor differ only in the 7th: natural uses C, harmonic uses C#. The C# (leading tone) gives a strong dominant-to-tonic resolution; without it, the music sounds modal rather than tonal.',
    faq: [
      { q: 'What are the notes in the D natural minor scale?', a: 'D, E, F, G, A, Bb, C.' },
      { q: 'How many flats does D minor have?', a: 'One: Bb — same as its relative major, F major.' },
      { q: 'What is the relative major of D minor?', a: 'F major.' },
    ],
  },
  'd-major': {
    publishAt: '2026-05-01',
    type: 'major',
    intro:
      'The D major scale has two sharps — F# and C# — and is famously bright and resonant. It\'s the home key of Pachelbel\'s Canon, Beethoven\'s Violin Concerto, and a huge slice of orchestral repertoire. Open strings on violin, viola, and cello all line up with notes in D major.',
    context:
      'D major has been the go-to "celebratory" key in classical music for centuries — trumpet fanfares were originally written in D because that\'s where the natural-trumpet harmonics fell. Today it remains a singer-songwriter favourite on guitar because the open D-A-G-Em chord shapes all sit inside the scale.',
    commonMistakes:
      'Two sharps means F# AND C# — beginners often remember the F# but miss the C#. Sharps are added in a fixed order: F C G D A E B.',
    faq: [
      { q: 'What are the notes in the D major scale?', a: 'D, E, F#, G, A, B, C#.' },
      { q: 'How many sharps does D major have?', a: 'Two: F# and C#.' },
      { q: 'What is the relative minor of D major?', a: 'B minor.' },
    ],
  },
  'b-minor': {
    publishAt: '2026-05-02',
    type: 'minor',
    intro:
      'The B natural minor scale has two sharps — F# and C# — and shares its notes with D major. Bach wrote his Mass in B minor in this key, and the scale carries a heavier, more solemn quality than the brighter A or E minor scales.',
    context:
      'B minor is a workhorse key in classical and metal alike. Schubert\'s "Unfinished" Symphony opens in B minor; Bach\'s Mass in B minor is one of the masterworks of Western music. On guitar, B minor often means barre-chord territory, but the scale\'s shape is identical to D major — just shifted one position.',
    commonMistakes:
      'The two sharps (F#, C#) are shared with D major; both keys feel different despite using the same notes because of where the music resolves. Be careful with the harmonic-minor variant — A# replaces A, which transforms the leading tone but takes some practice to play in tune on stringed instruments.',
    faq: [
      { q: 'What are the notes in the B natural minor scale?', a: 'B, C#, D, E, F#, G, A.' },
      { q: 'How many sharps does B minor have?', a: 'Two: F# and C# — same as its relative major, D major.' },
      { q: 'What is the relative major of B minor?', a: 'D major.' },
    ],
  },
  'a-major': {
    publishAt: '2026-05-03',
    type: 'major',
    intro:
      'The A major scale has three sharps — F#, C#, and G# — and is one of the most popular keys in pop, rock, and country. The open-string tuning of a guitar (E-A-D-G-B-E) sits perfectly inside A major, which is why so many singer-songwriter staples live here.',
    context:
      'A major is built into the bones of guitar music. The 1-4-5 progression (A-D-E) is the foundation of countless rock and blues songs. On violin, A major is the second scale most students learn (after D), and Mendelssohn\'s Violin Concerto in E minor lives largely in A major\'s tonal orbit.',
    commonMistakes:
      'Three sharps means F#, C#, AND G#. The G# (leading tone) is the easiest to miss when sight-reading; it gives the V chord (E major) its pull back to A.',
    faq: [
      { q: 'What are the notes in the A major scale?', a: 'A, B, C#, D, E, F#, G#.' },
      { q: 'How many sharps does A major have?', a: 'Three: F#, C#, and G#.' },
      { q: 'What is the relative minor of A major?', a: 'F# minor.' },
    ],
  },
  'f-sharp-minor': {
    publishAt: '2026-05-04',
    type: 'minor',
    intro:
      'The F# natural minor scale has three sharps — F#, C#, and G# — and shares its notes with A major. It\'s a rich, dramatic minor scale that sits comfortably under the hand on guitar (it\'s relative-minor adjacent to all the open-position A major shapes).',
    context:
      'F# minor turns up in plenty of rock and metal — its third sharp (G#) gives the leading tone a bite when the harmonic variant is used. Bach\'s Prelude and Fugue in F# minor (Well-Tempered Clavier I) is one of the most introspective pieces in the keyboard literature.',
    commonMistakes:
      'F# minor and F# major are completely different — major has six sharps (including E#), minor has three. Don\'t confuse the two when sight-reading. Also: G is G#, not G natural.',
    faq: [
      { q: 'What are the notes in the F# natural minor scale?', a: 'F#, G#, A, B, C#, D, E.' },
      { q: 'How many sharps does F# minor have?', a: 'Three: F#, C#, and G# — same as its relative major, A major.' },
      { q: 'What is the relative major of F# minor?', a: 'A major.' },
    ],
  },
  'b-flat-major': {
    publishAt: '2026-05-05',
    type: 'major',
    intro:
      'The B♭ major scale has two flats — B♭ and E♭ — and is the home key for an enormous slice of band and jazz literature. Trumpet, tenor sax, and clarinet are all transposing instruments in B♭, so concert-band music written in B♭ concert is the simplest possible read for those players.',
    context:
      'Big-band jazz lives in B♭ and E♭. Tunes like "Take the A Train" and "All The Things You Are" both spend significant time in B♭. Mozart\'s Symphony No. 39, Beethoven\'s 4th, and Schubert\'s "Trout" Quintet are all in B♭.',
    commonMistakes:
      'Both B and E are flat — beginners sometimes flat just one. The order of flats is B-E-A-D-G-C-F, so B♭ major adds B♭ first and E♭ second.',
    faq: [
      { q: 'What are the notes in the B♭ major scale?', a: 'B♭, C, D, E♭, F, G, A.' },
      { q: 'How many flats does B♭ major have?', a: 'Two: B♭ and E♭.' },
      { q: 'What is the relative minor of B♭ major?', a: 'G minor.' },
    ],
  },
  'g-minor': {
    publishAt: '2026-05-06',
    type: 'minor',
    intro:
      'The G natural minor scale has two flats — B♭ and E♭ — and shares its notes with B♭ major. It\'s a comfortable minor scale on most instruments, and it appears regularly in jazz, classical, and film music when a piece wants to feel pensive without becoming heavy.',
    context:
      'Mozart\'s Symphony No. 40 in G minor is one of the most famous pieces in the western canon and a textbook example of how dramatic G minor can sound. In jazz, G minor is a common ballad key; "Summertime" is in G minor (or sometimes A minor depending on the singer).',
    commonMistakes:
      'G natural minor uses Bb and Eb. G harmonic minor adds F# (raising the 7th); G melodic minor going up adds both E natural and F#. When sight-reading G minor, double-check the mode before assuming the F.',
    faq: [
      { q: 'What are the notes in the G natural minor scale?', a: 'G, A, B♭, C, D, E♭, F.' },
      { q: 'How many flats does G minor have?', a: 'Two: B♭ and E♭ — same as its relative major, B♭ major.' },
      { q: 'What is the relative major of G minor?', a: 'B♭ major.' },
    ],
  },
  'e-flat-major': {
    publishAt: '2026-05-07',
    type: 'major',
    intro:
      'The E♭ major scale has three flats — B♭, E♭, and A♭ — and is one of the warmest, most resonant keys for brass instruments. Beethoven\'s "Eroica" Symphony, Mozart\'s 39th, and a huge swathe of jazz standards live in E♭.',
    context:
      'E♭ is "the heroic key" in classical music — Beethoven used it for his most expansive symphonic statements. It\'s also the home key of alto saxophone (which is in E♭), so jazz-band charts often default here. On piano, E♭ falls comfortably under the hand once you learn the topography.',
    commonMistakes:
      'Three flats means B♭, E♭, AND A♭. The most-missed accidental is A♭ — beginners often play A natural by mistake, especially on the ascent.',
    faq: [
      { q: 'What are the notes in the E♭ major scale?', a: 'E♭, F, G, A♭, B♭, C, D.' },
      { q: 'How many flats does E♭ major have?', a: 'Three: B♭, E♭, and A♭.' },
      { q: 'What is the relative minor of E♭ major?', a: 'C minor.' },
    ],
  },
  'c-minor': {
    publishAt: '2026-05-08',
    type: 'minor',
    intro:
      'The C natural minor scale has three flats — B♭, E♭, and A♭ — and shares its notes with E♭ major. It\'s one of the most dramatic minor keys: Beethoven\'s 5th Symphony and his "Pathétique" Sonata are both in C minor, and the scale carries that gravity.',
    context:
      'C minor has a long association with stormy, fate-laden music. Bach\'s Passacaglia, Mozart\'s 24th piano concerto, and Brahms\'s 1st symphony are all in C minor. In jazz, "Footprints" by Wayne Shorter and many minor blues sit in C minor.',
    commonMistakes:
      'C natural minor (B♭, E♭, A♭) is distinct from C harmonic minor (which raises the 7th to B natural) and C melodic minor (which raises both 6 and 7 going up). Pop and folk almost always use natural; classical often uses harmonic for the V chord.',
    faq: [
      { q: 'What are the notes in the C natural minor scale?', a: 'C, D, E♭, F, G, A♭, B♭.' },
      { q: 'How many flats does C minor have?', a: 'Three: B♭, E♭, and A♭ — same as its relative major, E♭ major.' },
      { q: 'What is the relative major of C minor?', a: 'E♭ major.' },
    ],
  },
  'e-major': {
    publishAt: '2026-05-09',
    type: 'major',
    intro:
      'The E major scale has four sharps — F#, C#, G#, and D# — and is the brightest of the standard rock and blues keys. Both the lowest and highest strings of a guitar are tuned to E, so the scale rings through the whole instrument when played in open position.',
    context:
      'The 12-bar blues in E (E-A-B7) is the most-played progression in rock and blues. Classical guitar uses E major heavily because of the resonant open strings. Mendelssohn\'s "Italian" Symphony opens in E major\'s blazing key, and the scale carries that bright, sun-lit quality.',
    commonMistakes:
      'Four sharps is a lot to track — F#, C#, G#, AND D#. The leading-tone D# is the easiest to miss; without it, cadences sound flat and modal.',
    faq: [
      { q: 'What are the notes in the E major scale?', a: 'E, F#, G#, A, B, C#, D#.' },
      { q: 'How many sharps does E major have?', a: 'Four: F#, C#, G#, and D#.' },
      { q: 'What is the relative minor of E major?', a: 'C# minor.' },
    ],
  },
  'c-sharp-minor': {
    publishAt: '2026-05-10',
    type: 'minor',
    intro:
      'The C# natural minor scale has four sharps — F#, C#, G#, and D# — and shares its notes with E major. It\'s the key of Beethoven\'s "Moonlight" Sonata first movement, and that piece probably defines the scale\'s emotional fingerprint better than any verbal description.',
    context:
      'C# minor turns up in romantic-era piano music constantly: Chopin\'s C# minor Waltz and Nocturne, Rachmaninoff\'s C# minor Prelude. In modern music, the Beatles\' "Something" sits in C# minor for much of its length.',
    commonMistakes:
      'Four sharps including D#: don\'t miss it. The harmonic-minor variant adds B# (= C natural pitch but spelled B# to maintain letter ordering), which is one of the more confusing notational moments in tonal music.',
    faq: [
      { q: 'What are the notes in the C# natural minor scale?', a: 'C#, D#, E, F#, G#, A, B.' },
      { q: 'How many sharps does C# minor have?', a: 'Four: F#, C#, G#, and D# — same as its relative major, E major.' },
      { q: 'What is the relative major of C# minor?', a: 'E major.' },
    ],
  },
  'a-flat-major': {
    publishAt: '2026-05-11',
    type: 'major',
    intro:
      'The A♭ major scale has four flats — B♭, E♭, A♭, and D♭ — and is one of the warmest, most lyrical keys in the western system. Chopin\'s most tender writing lives in A♭, including his famous A♭ major waltzes.',
    context:
      'A♭ is a comfort key for jazz ballads — "Body and Soul" is in D♭ major (next door), and many classic standards live in this region of the circle. On piano, A♭ falls under the hand naturally once learned: the four black-key flats give consistent thumb placement.',
    commonMistakes:
      'The fourth flat is D♭ — easy to miss on the ascent. Beginners playing in A♭ for the first time often default to D natural and end up sounding like Lydian rather than Ionian.',
    faq: [
      { q: 'What are the notes in the A♭ major scale?', a: 'A♭, B♭, C, D♭, E♭, F, G.' },
      { q: 'How many flats does A♭ major have?', a: 'Four: B♭, E♭, A♭, and D♭.' },
      { q: 'What is the relative minor of A♭ major?', a: 'F minor.' },
    ],
  },
  'f-minor': {
    publishAt: '2026-05-12',
    type: 'minor',
    intro:
      'The F natural minor scale has four flats — B♭, E♭, A♭, and D♭ — and shares its notes with A♭ major. It carries some of the darkest weight in the minor-key palette: Beethoven\'s "Appassionata" Sonata and many of Brahms\'s most stormy passages live in F minor.',
    context:
      'F minor is the key of restless, brooding music. In jazz, it\'s a common ballad key when the singer wants something fuller and more shadowed than D or G minor.',
    commonMistakes:
      'Four flats including D♭: easy to miss. Don\'t confuse F minor with F major (one flat) — they share a tonic but have completely different signatures.',
    faq: [
      { q: 'What are the notes in the F natural minor scale?', a: 'F, G, A♭, B♭, C, D♭, E♭.' },
      { q: 'How many flats does F minor have?', a: 'Four: B♭, E♭, A♭, and D♭ — same as its relative major, A♭ major.' },
      { q: 'What is the relative major of F minor?', a: 'A♭ major.' },
    ],
  },
  'd-flat-major': {
    publishAt: '2026-05-13',
    type: 'major',
    intro:
      'The D♭ major scale has five flats — B♭, E♭, A♭, D♭, and G♭ — and is famously rich and lush under the hand on piano. It\'s the enharmonic equivalent of C# major (seven sharps), but D♭ is what nearly all printed music in this pitch uses.',
    context:
      'Pianists love D♭ for the topography — the hand falls naturally across the black keys with the thumb on whites. Sondheim wrote tenderly in D♭. In jazz, the ii–V–I cadence in D♭ (E♭m7–A♭7–D♭maj7) appears frequently in standards.',
    commonMistakes:
      'Five flats means B♭, E♭, A♭, D♭, AND G♭. The G♭ on the 4th degree is the trap — beginners often play G natural and end up sounding Lydian. Also: don\'t confuse D♭ major (5 flats) with D major (2 sharps).',
    faq: [
      { q: 'What are the notes in the D♭ major scale?', a: 'D♭, E♭, F, G♭, A♭, B♭, C.' },
      { q: 'How many flats does D♭ major have?', a: 'Five: B♭, E♭, A♭, D♭, and G♭.' },
      { q: 'What is the relative minor of D♭ major?', a: 'B♭ minor.' },
    ],
  },
  'b-flat-minor': {
    publishAt: '2026-05-14',
    type: 'minor',
    intro:
      'The B♭ natural minor scale has five flats — B♭, E♭, A♭, D♭, and G♭ — and shares its notes with D♭ major. It\'s a serious, weighted minor key: Chopin\'s B♭ minor Sonata (with the famous funeral march) lives here, and Tchaikovsky\'s B♭ minor Piano Concerto No. 1 begins with one of the most famous passages in the repertoire.',
    context:
      'B♭ minor is favoured for music that wants to feel dark without being theatrical. It\'s common in romantic piano literature and in jazz ballads when transposed for vocalists.',
    commonMistakes:
      'Five flats — and the G♭ is the most-missed. Don\'t confuse with B♭ major (two flats) — share a tonic, very different signatures.',
    faq: [
      { q: 'What are the notes in the B♭ natural minor scale?', a: 'B♭, C, D♭, E♭, F, G♭, A♭.' },
      { q: 'How many flats does B♭ minor have?', a: 'Five: B♭, E♭, A♭, D♭, and G♭ — same as its relative major, D♭ major.' },
      { q: 'What is the relative major of B♭ minor?', a: 'D♭ major.' },
    ],
  },
  'b-major': {
    publishAt: '2026-05-15',
    type: 'major',
    intro:
      'The B major scale has five sharps — F#, C#, G#, D#, and A# — and sits at the busy end of the sharp side of the circle of fifths. It appears regularly in vocal music transposed for range and in jazz tunes that want a bright, lifted sonority.',
    context:
      'B major is less common in beginning piano repertoire but standard in vocal and chamber-music transpositions. On guitar, B major is barre-chord territory but the scale shape is identical to other major scales — just shifted up the neck.',
    commonMistakes:
      'Five sharps to track. The A# (leading tone) is the easiest to miss when sight-reading. Don\'t confuse B major with B minor (two sharps) — same tonic, very different signature.',
    faq: [
      { q: 'What are the notes in the B major scale?', a: 'B, C#, D#, E, F#, G#, A#.' },
      { q: 'How many sharps does B major have?', a: 'Five: F#, C#, G#, D#, and A#.' },
      { q: 'What is the relative minor of B major?', a: 'G# minor.' },
    ],
  },
  'g-sharp-minor': {
    publishAt: '2026-05-16',
    type: 'minor',
    intro:
      'The G# natural minor scale has five sharps — F#, C#, G#, D#, and A# — and shares its notes with B major. It\'s the key of Rachmaninoff\'s G# minor Prelude (one of his most haunting), and the scale carries an atmosphere of restless yearning.',
    context:
      'G# minor appears in romantic piano literature and in jazz pieces transposed for female vocalists. On guitar it\'s less common because barre positions are physical, but on piano the scale falls naturally with practice.',
    commonMistakes:
      'Five sharps including A# is a lot to track. The harmonic-minor variant adds F##, which trips up nearly everyone — that\'s a double-sharp on the leading tone.',
    faq: [
      { q: 'What are the notes in the G# natural minor scale?', a: 'G#, A#, B, C#, D#, E, F#.' },
      { q: 'How many sharps does G# minor have?', a: 'Five: F#, C#, G#, D#, and A# — same as its relative major, B major.' },
      { q: 'What is the relative major of G# minor?', a: 'B major.' },
    ],
  },
  'f-sharp-major': {
    publishAt: '2026-05-17',
    type: 'major',
    intro:
      'The F# major scale has six sharps — F#, C#, G#, D#, A#, and E# — and sits at the far end of the sharp side of the circle of fifths. It\'s enharmonically equivalent to G♭ major (six flats); composers choose between them based on context.',
    context:
      'Bach\'s Well-Tempered Clavier includes a famous Prelude and Fugue in F# major. The scale appears in jazz when a tune transposes to fit a vocalist, and in classical music as a remote modulation target.',
    commonMistakes:
      'The unusual sharp here is E# — same pitch as F natural, but spelled E# because every letter of the scale must appear exactly once. Beginners write F instead and end up with two F-named notes.',
    faq: [
      { q: 'What are the notes in the F# major scale?', a: 'F#, G#, A#, B, C#, D#, E#.' },
      { q: 'How many sharps does F# major have?', a: 'Six: F#, C#, G#, D#, A#, and E#.' },
      { q: 'What is the relative minor of F# major?', a: 'D# minor.' },
    ],
  },
  'd-sharp-minor': {
    publishAt: '2026-05-18',
    type: 'minor',
    intro:
      'The D# natural minor scale has six sharps — F#, C#, G#, D#, A#, and E# — and shares its notes with F# major. It\'s an unusual key in practice: most music in this pitch is written in E♭ minor (six flats) instead, but D# minor still appears in modulating passages from related keys.',
    context:
      'Bach included a fugue in D# minor in The Well-Tempered Clavier specifically to demonstrate that all 24 keys could function in the equal-temperament system. In day-to-day music, you\'ll see E♭ minor written far more often.',
    commonMistakes:
      'D# minor includes E# — easy to miswrite as F. The harmonic-minor variant adds C## (double-sharp), which is genuinely confusing to read.',
    faq: [
      { q: 'What are the notes in the D# natural minor scale?', a: 'D#, E#, F#, G#, A#, B, C#.' },
      { q: 'How many sharps does D# minor have?', a: 'Six: F#, C#, G#, D#, A#, and E# — same as its relative major, F# major.' },
      { q: 'What is the relative major of D# minor?', a: 'F# major.' },
    ],
  },
  'g-flat-major': {
    publishAt: '2026-05-19',
    type: 'major',
    intro:
      'The G♭ major scale has six flats — B♭, E♭, A♭, D♭, G♭, and C♭ — and is enharmonically the same pitch as F# major. The choice between G♭ and F# usually comes down to which key the surrounding music is in.',
    context:
      'G♭ major appears in jazz standards (e.g., the bridge of "Lady Bird") and in romantic-era piano literature. On piano, the all-black-key topography of G♭ is genuinely beautiful — the hand floats across the keyboard.',
    commonMistakes:
      'The unusual flat here is C♭ — same pitch as B natural, but spelled C♭ to keep every letter in the scale. Beginners write B and end up with two B-named notes.',
    faq: [
      { q: 'What are the notes in the G♭ major scale?', a: 'G♭, A♭, B♭, C♭, D♭, E♭, F.' },
      { q: 'How many flats does G♭ major have?', a: 'Six: B♭, E♭, A♭, D♭, G♭, and C♭.' },
      { q: 'What is the relative minor of G♭ major?', a: 'E♭ minor.' },
    ],
  },
  'e-flat-minor': {
    publishAt: '2026-05-20',
    type: 'minor',
    intro:
      'The E♭ natural minor scale has six flats — B♭, E♭, A♭, D♭, G♭, and C♭ — and shares its notes with G♭ major. It\'s a heavy, atmospheric minor key that appears in romantic piano literature and in jazz ballads transposed to fit vocal range.',
    context:
      'Rachmaninoff and Tchaikovsky both wrote significant works in E♭ minor when they wanted maximum dramatic weight. The scale can feel "thicker" than its enharmonic equivalent (D# minor) on the page.',
    commonMistakes:
      'The C♭ on the 6th degree is the trap — beginners write B natural instead and end up with two B-named notes in the scale (B♭ and B). Spelling matters here.',
    faq: [
      { q: 'What are the notes in the E♭ natural minor scale?', a: 'E♭, F, G♭, A♭, B♭, C♭, D♭.' },
      { q: 'How many flats does E♭ minor have?', a: 'Six: B♭, E♭, A♭, D♭, G♭, and C♭ — same as its relative major, G♭ major.' },
      { q: 'What is the relative major of E♭ minor?', a: 'G♭ major.' },
    ],
  },
  'c-sharp-major': {
    publishAt: '2026-05-21',
    type: 'major',
    intro:
      'The C# major scale has seven sharps — F#, C#, G#, D#, A#, E#, and B# — and is the most extreme key on the sharp side of the circle of fifths. It\'s the enharmonic equivalent of D♭ major (five flats), and the latter is what almost all music in this pitch uses in print.',
    context:
      'C# major exists primarily as a theoretical scale. Bach\'s Prelude and Fugue in C# major (Well-Tempered Clavier I) is the canonical reason it has any practical existence — Bach wrote it specifically to prove the key was musically viable.',
    commonMistakes:
      'Every letter of the C# scale is sharpened — including E# (= F natural) and B# (= C natural). If you find yourself writing in C# major, double-check whether D♭ major would notate more cleanly. It usually does.',
    faq: [
      { q: 'What are the notes in the C# major scale?', a: 'C#, D#, E#, F#, G#, A#, B#.' },
      { q: 'How many sharps does C# major have?', a: 'Seven: F#, C#, G#, D#, A#, E#, and B#.' },
      { q: 'What is the relative minor of C# major?', a: 'A# minor.' },
    ],
  },
  'a-sharp-minor': {
    publishAt: '2026-05-22',
    type: 'minor',
    intro:
      'The A# natural minor scale has seven sharps — F#, C#, G#, D#, A#, E#, and B# — and shares its notes with C# major. Like C# major, it\'s primarily a theoretical key: B♭ minor (five flats) covers the same pitches with a much cleaner notation.',
    context:
      'A# minor exists for completeness in the 24-key system. Bach\'s prelude and fugue in this key demonstrates that all minor keys are playable in equal temperament. In day-to-day music, you\'ll see B♭ minor written instead.',
    commonMistakes:
      'Seven sharps — including E# and B# — is a lot to read. The harmonic-minor variant adds G## (double-sharp), which most musicians find genuinely difficult to parse. If you can use B♭ minor instead, do.',
    faq: [
      { q: 'What are the notes in the A# natural minor scale?', a: 'A#, B#, C#, D#, E#, F#, G#.' },
      { q: 'How many sharps does A# minor have?', a: 'Seven: F#, C#, G#, D#, A#, E#, and B# — same as its relative major, C# major.' },
      { q: 'What is the relative major of A# minor?', a: 'C# major.' },
    ],
  },
};

// Public lookup. Returns merged descriptor or null if slug isn't live yet.
export const getScalePageContent = (slug, now = new Date()) => {
  const meta = slugToScale(slug);
  if (!meta) return null;
  const content = CONTENT[slug];
  if (!content || !isLive(content.publishAt, now)) return null;
  const scaleNotes = notesInKey(meta.key);
  return {
    slug,
    tonic: meta.tonic,
    type: meta.type,
    name: `${meta.tonic} ${meta.type === 'major' ? 'major' : 'natural minor'}`,
    accidentalCount: meta.key.count,
    accidentalType: meta.key.type,
    sharps: meta.key.sharps,
    flats: meta.key.flats,
    scaleNotes,
    pattern: stepPattern(meta.type),
    degrees: buildScaleDegrees(meta.type, scaleNotes),
    relativeKeyName: meta.type === 'major'
      ? scaleNotes[5] + ' minor'
      : scaleNotes[2] + ' major',
    ...content,
  };
};

export const getLiveScaleSlugs = (now = new Date()) =>
  Object.entries(CONTENT)
    .filter(([, c]) => isLive(c.publishAt, now))
    .map(([slug]) => slug);

export const PUBLISHED_SCALE_SLUGS = getLiveScaleSlugs();
