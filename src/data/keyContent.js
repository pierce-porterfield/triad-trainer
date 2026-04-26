// Programmatic key-signature page content registry — Layer 2 of seo-strategy.md.
//
// Each entry maps a URL slug ("g-major", "f-sharp-major") to its canonical
// reference content + a `publishAt: 'YYYY-MM-DD'` UTC date. Pages go live
// automatically when today's date reaches that string. The daily-rebuild
// GitHub Action triggers a Vercel redeploy at 06:00 UTC each day so newly
// scheduled pages appear in production without manual intervention.
//
// All 14 major keys have hand-written content. To stagger the rollout (per
// the SEO strategy doc, "Don't ship all 60+ pages on day one"), only a couple
// are live today; the rest queue up one per day.

import { MAJOR_KEYS, notesInKey } from './keys.js';
import { buildChord, QUALITIES } from './triads.js';
import { isLive } from './publishSchedule.js';

const tonicToSlugStem = (tonic) => {
  const letter = tonic[0].toLowerCase();
  if (tonic.length === 1) return letter;
  return `${letter}-${tonic[1] === '#' ? 'sharp' : 'flat'}`;
};

const tonicToSlug = (tonic) => `${tonicToSlugStem(tonic)}-major`;

export const slugToKey = (slug) => {
  const m = slug.match(/^([a-g])(?:-(sharp|flat))?-major$/);
  if (!m) return null;
  const [, letter, accidental] = m;
  const tonic = letter.toUpperCase()
    + (accidental === 'sharp' ? '#' : accidental === 'flat' ? 'b' : '');
  return MAJOR_KEYS.find((k) => k.tonic === tonic) || null;
};

const DIATONIC_QUALITIES = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export const diatonicTriads = (key) => {
  const scale = notesInKey(key);
  return scale.map((root, i) => {
    const qKey = DIATONIC_QUALITIES[i];
    const notes = buildChord(root, qKey);
    return {
      roman: ROMAN[i],
      degree: i + 1,
      root,
      quality: qKey,
      qualityLabel: QUALITIES[qKey].label,
      symbol: QUALITIES[qKey].symbol,
      chordName: `${root}${QUALITIES[qKey].symbol}`,
      notes,
    };
  });
};

export const relativeMinorOf = (key) => notesInKey(key)[5] + ' minor';

export const ALL_KEY_SLUGS = MAJOR_KEYS.map((k) => tonicToSlug(k.tonic));

// Hand-written content for all 14 major keys. publishAt staggers the rollout.
const CONTENT = {
  'g-major': {
    publishAt: '2020-01-01', // live now
    intro:
      'G major has one sharp — F# — and is one of the most common keys in folk, country, and pop music. It sits one step clockwise from C on the circle of fifths, and its scale is the white-key C major scale with every F raised to F#.',
    progressions:
      'The most common progression in G major is I–V–vi–IV (G–D–Em–C) — the spine of countless pop songs. Other staples: I–vi–IV–V (G–Em–C–D, the 50s doo-wop), ii–V–I (Am–D–G, the jazz cadence), and the 12-bar blues built on G–C–D. Because G major sits next to both D major and C major on the circle of fifths, it modulates smoothly to either.',
    commonMistakes:
      'The single sharp is on the 7th scale degree (F#), not on the tonic itself — a common beginner confusion. Watch for accidental F-naturals when sight-reading: every F you see in a piece in G major is F# unless explicitly cancelled with a natural sign. The relative minor of G major is E minor, which shares the same key signature; if a piece in G major suddenly feels darker and centres around E, it has likely modulated to its relative minor.',
    faq: [
      { q: 'How many sharps does G major have?', a: 'G major has one sharp: F#.' },
      { q: 'What are the notes in the G major scale?', a: 'G, A, B, C, D, E, F#.' },
      { q: 'What is the relative minor of G major?', a: 'E minor — it uses the same key signature (one sharp) and starts on the 6th degree of the G major scale.' },
      { q: 'What are the chords in the key of G major?', a: 'G major (I), A minor (ii), B minor (iii), C major (IV), D major (V), E minor (vi), and F# diminished (vii°).' },
    ],
  },
  'f-major': {
    publishAt: '2020-01-01', // live now
    intro:
      'F major has one flat — Bb — and is the first key on the flat side of the circle of fifths. It is a common key for woodwinds (especially clarinet and bassoon) and shows up everywhere from baroque concertos to country ballads. Its scale is the white-key C major scale with every B lowered to Bb.',
    progressions:
      'F major\'s I–V–vi–IV (F–C–Dm–Bb) is one of the most-used progressions in popular music. The ii–V–I (Gm–C–F) is the standard jazz cadence in this key. F major sits one step counter-clockwise from C on the circle of fifths, so it modulates naturally to C major (its dominant key) and to Bb major (its subdominant).',
    commonMistakes:
      'The trap in F major is forgetting the Bb — every B in the score is flat unless cancelled. Beginners on guitar sometimes try to play F major as a single open chord, but there is no fully open voicing; the F barre chord (E-shape on fret 1) or a partial Fmaj7 voicing is more common. Don\'t confuse F major (one flat) with F# major (six sharps) — they\'re neighbours by name only.',
    faq: [
      { q: 'How many flats does F major have?', a: 'F major has one flat: Bb.' },
      { q: 'What are the notes in the F major scale?', a: 'F, G, A, Bb, C, D, E.' },
      { q: 'What is the relative minor of F major?', a: 'D minor — it shares the same key signature (one flat) and starts on the 6th degree of the F major scale.' },
      { q: 'What are the chords in the key of F major?', a: 'F major (I), G minor (ii), A minor (iii), Bb major (IV), C major (V), D minor (vi), and E diminished (vii°).' },
    ],
  },
  'd-major': {
    publishAt: '2026-04-27',
    intro:
      'D major has two sharps — F# and C# — and is one of the brightest, most resonant keys for stringed instruments. Violins, violas, and guitars all have open strings tuned to notes in the D major scale, which is why orchestral works in D (Beethoven\'s Violin Concerto, Pachelbel\'s Canon) tend to ring with extra brilliance. D major sits two steps clockwise from C on the circle of fifths.',
    progressions:
      'The Pachelbel canon — D–A–Bm–F#m–G–D–G–A — is so iconic that every chord in it appears constantly in pop music. I–V–vi–IV in D (D–A–Bm–G) is the staple modern progression; ii–V–I (Em–A–D) is the jazz cadence. D major also frames the 12-bar blues with D–G–A.',
    commonMistakes:
      'The two sharps are F# and C#, in that order — sharps are always added in the order F C G D A E B. Beginners sometimes get the order backwards or miss the C# entirely when reading at sight. The relative minor is B minor, which shares the same two-sharp signature.',
    faq: [
      { q: 'How many sharps does D major have?', a: 'D major has two sharps: F# and C#.' },
      { q: 'What are the notes in the D major scale?', a: 'D, E, F#, G, A, B, C#.' },
      { q: 'What is the relative minor of D major?', a: 'B minor — same two-sharp key signature, starting on the 6th degree of the D major scale.' },
      { q: 'What are the chords in the key of D major?', a: 'D major (I), E minor (ii), F# minor (iii), G major (IV), A major (V), B minor (vi), and C# diminished (vii°).' },
    ],
  },
  'b-flat-major': {
    publishAt: '2026-04-28',
    intro:
      'B♭ major has two flats — B♭ and E♭ — and is the standard key for many wind instruments (trumpet, clarinet, tenor saxophone). Concert-band literature is full of pieces in B♭ for that reason. It sits two steps counter-clockwise from C on the circle of fifths, with G minor as its relative minor.',
    progressions:
      'I–V–vi–IV in B♭ is B♭–F–Gm–E♭, common in jazz standards and ballads. The ii–V–I (Cm–F–B♭) is the most-used cadence in jazz, often extended as iii–vi–ii–V–I (Dm–Gm–Cm–F–B♭). Modulation to E♭ major (subdominant) and F major (dominant) is smooth via shared chords.',
    commonMistakes:
      'Beginners sometimes mix up the order of flats: B♭ comes first (it\'s the only flat in F major, and B♭ major adds E♭). Brass players reading band parts must be careful about transposition — a B♭ trumpet reading in C concert is actually playing in B♭ written. Don\'t confuse B♭ major (two flats) with its enharmonic A# major, which would require ten sharps and is never used.',
    faq: [
      { q: 'How many flats does B♭ major have?', a: 'B♭ major has two flats: B♭ and E♭.' },
      { q: 'What are the notes in the B♭ major scale?', a: 'B♭, C, D, E♭, F, G, A.' },
      { q: 'What is the relative minor of B♭ major?', a: 'G minor — same two-flat key signature.' },
      { q: 'What are the chords in the key of B♭ major?', a: 'B♭ major (I), C minor (ii), D minor (iii), E♭ major (IV), F major (V), G minor (vi), and A diminished (vii°).' },
    ],
  },
  'a-major': {
    publishAt: '2026-04-29',
    intro:
      'A major has three sharps — F#, C#, and G# — and is a favourite key for guitar, violin, and singer-songwriter material. The open strings of a guitar (E-A-D-G-B-E) line up with chords in A, making it harmonically natural for the instrument. A major sits three clockwise steps from C on the circle of fifths.',
    progressions:
      'I–IV–V in A is A–D–E, the foundation of countless rock and blues songs (and the open-chord vocabulary every beginning guitarist learns). I–V–vi–IV is A–E–F#m–D. The ii–V–I jazz cadence is Bm–E–A.',
    commonMistakes:
      'The three sharps are F#, C#, G# — added in the standard order. The most common slip is forgetting the G# (the leading tone) when sight-reading, which deflates the cadence. The relative minor is F# minor, which shares the same key signature.',
    faq: [
      { q: 'How many sharps does A major have?', a: 'A major has three sharps: F#, C#, and G#.' },
      { q: 'What are the notes in the A major scale?', a: 'A, B, C#, D, E, F#, G#.' },
      { q: 'What is the relative minor of A major?', a: 'F# minor — same three-sharp key signature.' },
      { q: 'What are the chords in the key of A major?', a: 'A major (I), B minor (ii), C# minor (iii), D major (IV), E major (V), F# minor (vi), and G# diminished (vii°).' },
    ],
  },
  'e-flat-major': {
    publishAt: '2026-04-30',
    intro:
      'E♭ major has three flats — B♭, E♭, and A♭ — and is a warm, full-bodied key especially popular in jazz, swing, and classical works featuring brass. Mozart\'s Symphony No. 39, Beethoven\'s "Eroica" Symphony, and most big-band charts use E♭ as a home key. It sits three counter-clockwise steps from C on the circle of fifths.',
    progressions:
      'In E♭, I–V–vi–IV is E♭–B♭–Cm–A♭. The ii–V–I jazz cadence is Fm–B♭–E♭, ubiquitous in standards. Many famous ballads and jazz heads ("Misty," "Body and Soul") are in E♭ or B♭, partly because the key suits horns.',
    commonMistakes:
      'The three flats are added in order: B♭, E♭, A♭. A common mistake is forgetting the A♭ — the 4th degree is flat, not natural. Pianists sometimes hesitate on E♭ chords because the topography (mostly black keys with one white) is less familiar than C\'s all-white chords.',
    faq: [
      { q: 'How many flats does E♭ major have?', a: 'E♭ major has three flats: B♭, E♭, and A♭.' },
      { q: 'What are the notes in the E♭ major scale?', a: 'E♭, F, G, A♭, B♭, C, D.' },
      { q: 'What is the relative minor of E♭ major?', a: 'C minor — same three-flat key signature.' },
      { q: 'What are the chords in the key of E♭ major?', a: 'E♭ major (I), F minor (ii), G minor (iii), A♭ major (IV), B♭ major (V), C minor (vi), and D diminished (vii°).' },
    ],
  },
  'e-major': {
    publishAt: '2026-05-01',
    intro:
      'E major has four sharps — F#, C#, G#, and D# — and is the brightest of the standard keys. It is the open-string home of a guitar (the lowest and highest strings are both E), so rock and blues in E have an immediate, ringing power. E major sits four clockwise steps from C on the circle of fifths.',
    progressions:
      'The 12-bar blues in E (E–A–B7) is the most-played progression in rock history. I–IV–V in E is E–A–B; I–V–vi–IV is E–B–C#m–A. The ii–V–I cadence is F#m–B–E.',
    commonMistakes:
      'Four sharps means F#, C#, G#, D# — that last one (D#) is the leading tone, easy to miss when sight-reading. Don\'t confuse E major with its parallel minor (E minor) which has only one sharp (F#). The relative minor is C# minor.',
    faq: [
      { q: 'How many sharps does E major have?', a: 'E major has four sharps: F#, C#, G#, and D#.' },
      { q: 'What are the notes in the E major scale?', a: 'E, F#, G#, A, B, C#, D#.' },
      { q: 'What is the relative minor of E major?', a: 'C# minor — same four-sharp key signature.' },
      { q: 'What are the chords in the key of E major?', a: 'E major (I), F# minor (ii), G# minor (iii), A major (IV), B major (V), C# minor (vi), and D# diminished (vii°).' },
    ],
  },
  'a-flat-major': {
    publishAt: '2026-05-02',
    intro:
      'A♭ major has four flats — B♭, E♭, A♭, and D♭ — and is one of the warmest keys in the western system. Chopin and Schubert wrote some of their most lyrical works in A♭, and it\'s common in jazz ballads as a key just dark enough to feel intimate without being heavy. It sits four counter-clockwise steps from C on the circle of fifths.',
    progressions:
      'I–V–vi–IV in A♭ is A♭–E♭–Fm–D♭. The jazz ii–V–I is B♭m–E♭–A♭ — a workhorse cadence in standards. The relative minor F minor shares the same four-flat key signature.',
    commonMistakes:
      'The four flats are added in order: B♭, E♭, A♭, D♭. The trap is the D♭ — beginners often play D natural by mistake. Pianists find A♭ comfortable once learned because the hand falls on a pattern of black keys with predictable thumb placement.',
    faq: [
      { q: 'How many flats does A♭ major have?', a: 'A♭ major has four flats: B♭, E♭, A♭, and D♭.' },
      { q: 'What are the notes in the A♭ major scale?', a: 'A♭, B♭, C, D♭, E♭, F, G.' },
      { q: 'What is the relative minor of A♭ major?', a: 'F minor — same four-flat key signature.' },
      { q: 'What are the chords in the key of A♭ major?', a: 'A♭ major (I), B♭ minor (ii), C minor (iii), D♭ major (IV), E♭ major (V), F minor (vi), and G diminished (vii°).' },
    ],
  },
  'b-major': {
    publishAt: '2026-05-03',
    intro:
      'B major has five sharps — F#, C#, G#, D#, and A# — and sits five clockwise steps from C on the circle of fifths. It\'s a less common written key (most tonally adjacent music is notated in C♭ major or modulates through related keys instead), but it appears regularly in vocal music transposed for range and in jazz tunes.',
    progressions:
      'I–IV–V in B is B–E–F#. I–V–vi–IV is B–F#–G#m–E. The five sharps make sight-reading busy, which is one reason composers sometimes prefer the enharmonic C♭ major (seven flats — also visually busy, but with a different feel).',
    commonMistakes:
      'Five sharps is a lot to track at sight — the easiest slip is missing the A# (the leading tone). The relative minor of B major is G# minor, which also has five sharps. Don\'t confuse B major with B♭ major, which has two flats and a very different signature.',
    faq: [
      { q: 'How many sharps does B major have?', a: 'B major has five sharps: F#, C#, G#, D#, and A#.' },
      { q: 'What are the notes in the B major scale?', a: 'B, C#, D#, E, F#, G#, A#.' },
      { q: 'What is the relative minor of B major?', a: 'G# minor — same five-sharp key signature.' },
      { q: 'What are the chords in the key of B major?', a: 'B major (I), C# minor (ii), D# minor (iii), E major (IV), F# major (V), G# minor (vi), and A# diminished (vii°).' },
    ],
  },
  'd-flat-major': {
    publishAt: '2026-05-04',
    intro:
      'D♭ major has five flats — B♭, E♭, A♭, D♭, and G♭ — and sits five counter-clockwise steps from C on the circle of fifths. It\'s the enharmonic equivalent of C# major (which has seven sharps), and almost all music in this pitch is written in D♭ instead. Pianists love it because the hand falls naturally across black keys.',
    progressions:
      'I–V–vi–IV in D♭ is D♭–A♭–B♭m–G♭. The ii–V–I is E♭m–A♭–D♭. D♭ is a common key for rich, lush ballads — Sondheim wrote frequently in five-flat territory, and it\'s a favourite for orchestral horns and warm string writing.',
    commonMistakes:
      'The five flats are B♭, E♭, A♭, D♭, G♭ — the trap for sight-readers is the G♭ (the 4th degree). Don\'t mix up D♭ major (five flats) with D major (two sharps); they sound a half-step apart but their signatures look completely different.',
    faq: [
      { q: 'How many flats does D♭ major have?', a: 'D♭ major has five flats: B♭, E♭, A♭, D♭, and G♭.' },
      { q: 'What are the notes in the D♭ major scale?', a: 'D♭, E♭, F, G♭, A♭, B♭, C.' },
      { q: 'What is the relative minor of D♭ major?', a: 'B♭ minor — same five-flat key signature.' },
      { q: 'What are the chords in the key of D♭ major?', a: 'D♭ major (I), E♭ minor (ii), F minor (iii), G♭ major (IV), A♭ major (V), B♭ minor (vi), and C diminished (vii°).' },
    ],
  },
  'f-sharp-major': {
    publishAt: '2026-05-05',
    intro:
      'F# major has six sharps — F#, C#, G#, D#, A#, and E# — and sits six clockwise steps from C on the circle of fifths. It\'s enharmonically equivalent to G♭ major (six flats), so the choice between them is usually about what the surrounding music makes easiest to read.',
    progressions:
      'I–V–vi–IV in F# is F#–C#–D#m–B. The six-sharp signature is busy enough that composers often modulate through it rather than living there. F# major appears regularly in keyboard literature (Bach\'s Well-Tempered Clavier has a famous prelude and fugue in F# major) and in jazz standards transposed for vocalists.',
    commonMistakes:
      'The unusual sharp here is E# — not "F", but spelled E# because the scale must use every letter exactly once. Beginners write F instead of E# and end up with two F-named notes (F and F#) and no E. The same logic applies to the diatonic chord on the leading tone: it\'s spelled E# diminished, not F diminished.',
    faq: [
      { q: 'How many sharps does F# major have?', a: 'F# major has six sharps: F#, C#, G#, D#, A#, and E#.' },
      { q: 'What are the notes in the F# major scale?', a: 'F#, G#, A#, B, C#, D#, E#.' },
      { q: 'What is the relative minor of F# major?', a: 'D# minor — same six-sharp key signature.' },
      { q: 'What is the enharmonic equivalent of F# major?', a: 'G♭ major (six flats). They sound identical; the choice is about notational convenience.' },
    ],
  },
  'g-flat-major': {
    publishAt: '2026-05-06',
    intro:
      'G♭ major has six flats — B♭, E♭, A♭, D♭, G♭, and C♭ — and sits six counter-clockwise steps from C on the circle of fifths. It\'s enharmonically the same pitch as F# major (six sharps), and music in this region is usually notated in whichever key looks cleaner against the surrounding context.',
    progressions:
      'I–V–vi–IV in G♭ is G♭–D♭–E♭m–C♭. Like F# major, G♭ is more common as a transit key than a destination — but it appears in jazz standards (Tadd Dameron\'s "Lady Bird" briefly visits) and in romantic-era piano literature where the all-black-key topography is part of the appeal.',
    commonMistakes:
      'The unusual flat here is C♭ — it\'s the same pitch as B natural, but it must be spelled C♭ so the scale uses every letter once. Beginners write B instead of C♭ and end up with two B-named notes (B♭ and B) and no C. The IV chord in G♭ is spelled C♭ major (C♭–E♭–G♭), not B major.',
    faq: [
      { q: 'How many flats does G♭ major have?', a: 'G♭ major has six flats: B♭, E♭, A♭, D♭, G♭, and C♭.' },
      { q: 'What are the notes in the G♭ major scale?', a: 'G♭, A♭, B♭, C♭, D♭, E♭, F.' },
      { q: 'What is the relative minor of G♭ major?', a: 'E♭ minor — same six-flat key signature.' },
      { q: 'What is the enharmonic equivalent of G♭ major?', a: 'F# major (six sharps).' },
    ],
  },
  'c-sharp-major': {
    publishAt: '2026-05-07',
    intro:
      'C# major has seven sharps — F#, C#, G#, D#, A#, E#, and B# — and sits seven clockwise steps from C on the circle of fifths. It\'s the enharmonic equivalent of D♭ major (five flats), and almost all practical music in this pitch is written in D♭ instead because the signature is much cleaner.',
    progressions:
      'C# major exists primarily as a theoretical key. Bach wrote a Prelude and Fugue in C# major in The Well-Tempered Clavier specifically to demonstrate that all twelve keys could be playable in equal temperament. In day-to-day music, you\'ll see D♭ written instead almost every time.',
    commonMistakes:
      'Every letter of the C# scale is sharpened — including E# (= F natural) and B# (= C natural). Beginners often miswrite these as F and C, which would create double-letter spellings. If you find yourself writing in C# major, double-check whether the surrounding music would read more cleanly in D♭ — usually it would.',
    faq: [
      { q: 'How many sharps does C# major have?', a: 'C# major has seven sharps: F#, C#, G#, D#, A#, E#, and B#.' },
      { q: 'What are the notes in the C# major scale?', a: 'C#, D#, E#, F#, G#, A#, B#.' },
      { q: 'What is the relative minor of C# major?', a: 'A# minor — same seven-sharp key signature.' },
      { q: 'Is C# major the same as D♭ major?', a: 'They sound identical (enharmonic equivalents) but are spelled differently. D♭ major (five flats) is far more common in printed music than C# major (seven sharps).' },
    ],
  },
  'c-major': {
    publishAt: '2026-05-08',
    intro:
      'C major is the centre of the western tonal system: zero sharps, zero flats, all white keys on the piano. Every other key signature is measured by its distance from C on the circle of fifths. It\'s the first scale most students learn and the default key for theory examples, ear-training drills, and beginner piano literature.',
    progressions:
      'I–V–vi–IV in C is C–G–Am–F — the most-used progression in pop music. I–IV–V is C–F–G, the foundation of countless folk and rock songs. The ii–V–I jazz cadence is Dm–G–C. Because C major has no accidentals, it\'s the easiest key to compose, transpose, and demonstrate theory in.',
    commonMistakes:
      'The fact that C major uses only white keys can mislead beginners into thinking "white keys = C major." Other keys also use white keys (A minor uses the same set), and pieces in C major can borrow accidentals from other keys (chromatic passing tones, secondary dominants). The relative minor is A minor, which uses the same key signature.',
    faq: [
      { q: 'How many sharps or flats does C major have?', a: 'Zero — C major is the only major key with an empty key signature.' },
      { q: 'What are the notes in the C major scale?', a: 'C, D, E, F, G, A, B.' },
      { q: 'What is the relative minor of C major?', a: 'A minor — same empty key signature, starting on the 6th degree of the C major scale.' },
      { q: 'What are the chords in the key of C major?', a: 'C major (I), D minor (ii), E minor (iii), F major (IV), G major (V), A minor (vi), and B diminished (vii°).' },
    ],
  },
};

// Public lookup. Returns merged descriptor (computed + hand-written) or null
// if the slug isn't live yet.
export const getKeyPageContent = (slug, now = new Date()) => {
  const key = slugToKey(slug);
  if (!key) return null;
  const content = CONTENT[slug];
  if (!content || !isLive(content.publishAt, now)) return null;
  return {
    slug,
    key,
    tonic: key.tonic,
    name: `${key.tonic} major`,
    accidentalCount: key.count,
    accidentalType: key.type,
    sharps: key.sharps,
    flats: key.flats,
    scaleNotes: notesInKey(key),
    diatonic: diatonicTriads(key),
    relativeMinor: relativeMinorOf(key),
    ...content,
  };
};

export const getLiveKeySlugs = (now = new Date()) =>
  Object.entries(CONTENT)
    .filter(([, c]) => isLive(c.publishAt, now))
    .map(([slug]) => slug);

export const PUBLISHED_KEY_SLUGS = getLiveKeySlugs();
