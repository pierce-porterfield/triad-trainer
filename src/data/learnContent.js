// Long-form educational articles — Layer 3 of seo-strategy.md ("Topic hubs").
//
// Where /chords/* and /keys/* and /scales/* are programmatic-but-canonical
// reference pages, /learn/* is essay-format. Each article is hand-written as
// an ordered array of content blocks (h2, p, ul, ol, callout) so the
// LearnPage component can render structured prose without needing a markdown
// parser dependency.

import { isLive } from './publishSchedule.js';

// All learn-article slugs, including drafts/stubs.
export const ALL_LEARN_SLUGS = [
  'how-does-the-circle-of-fifths-work',
  'how-to-remember-base-triads',
];

const CONTENT = {
  'how-does-the-circle-of-fifths-work': {
    publishAt: '2020-01-01',
    title: 'How does the circle of fifths work?',
    description:
      'A plain-English guide to the circle of fifths — what it is, how to read it, and why it makes key signatures, chord progressions, and modulation easier to understand.',
    blocks: [
      { type: 'diagram', name: 'circle-of-fifths' },
      { type: 'p', text:
        'The circle of fifths is the single most useful diagram in music theory. Once you understand it, key signatures stop feeling like memorisation and start making structural sense. Chord progressions reveal patterns. Modulating between keys becomes a step rather than a leap.' },
      { type: 'p', text:
        'But "circle of fifths" is a name that doesn\'t explain itself. This article walks through what the circle is, how to read it, and the four or five facts about music it makes immediately obvious.' },

      { type: 'h2', text: 'The basic idea' },
      { type: 'p', text:
        'Start on C. Count up five letter-named notes including C itself: C, D, E, F, G. You land on G. That distance — five letter-names, or seven semitones — is called a perfect fifth.' },
      { type: 'p', text:
        'Now do it again starting from G: G, A, B, C, D. You land on D. From D you get to A. From A, E. From E, B. Keep going and you eventually return to C, having visited every note in the chromatic scale exactly once.' },
      { type: 'p', text:
        'That cycle — C → G → D → A → E → B → F# → C# → G# → D# → A# → E# (= F) → C — is the circle of fifths. Twelve steps, twelve keys, back to where you started.' },

      { type: 'h2', text: 'Reading the circle' },
      { type: 'p', text:
        'In its standard diagram form, C major sits at the top. Moving clockwise, each step adds one sharp to the key signature. Moving counter-clockwise, each step adds one flat.' },
      { type: 'ul', items: [
        'C major (top) — zero sharps, zero flats.',
        'G major (one step clockwise) — one sharp (F#).',
        'D major — two sharps (F#, C#).',
        'A major — three sharps (F#, C#, G#).',
        'And so on, adding one sharp per step until you wrap around.',
        'F major (one step counter-clockwise from C) — one flat (B♭).',
        'B♭ major — two flats (B♭, E♭).',
        'E♭ major — three flats. And so on counter-clockwise.',
      ] },
      { type: 'p', text:
        'The bottom of the circle is where the sharp side and the flat side meet. F# major (six sharps) and G♭ major (six flats) are enharmonically the same pitch — different notation, same sound.' },

      { type: 'h2', text: 'What the circle tells you instantly' },

      { type: 'h3', text: '1. The order of sharps and flats.' },
      { type: 'p', text:
        'Sharps are added to key signatures in a fixed order: F C G D A E B. Flats are added in the reverse order: B E A D G C F. The circle of fifths is literally that order made geometric — every step clockwise is the next sharp added; every step counter-clockwise is the next flat.' },

      { type: 'h3', text: '2. The relative minor of every major key.' },
      { type: 'p', text:
        'Every major key has a relative minor that shares its key signature. To find it, count down a minor third (three semitones) from the major tonic. C major\'s relative minor is A minor. G major\'s is E minor. F major\'s is D minor. On the circle, the relative minor lives just inside the circle from its major.' },

      { type: 'h3', text: '3. Adjacent keys are easy to modulate between.' },
      { type: 'p', text:
        'Two keys that sit next to each other on the circle differ by exactly one accidental. C major and G major share six notes; the only difference is F vs F#. That one-note overlap is why modulating to a neighbouring key feels smooth, while jumping to a key on the opposite side of the circle (e.g., C to F#) feels jarring.' },

      { type: 'h3', text: '4. The V chord of any key is one step clockwise.' },
      { type: 'p', text:
        'In C major, the V chord (the dominant) is G — one step clockwise on the circle. In G major, the V is D. In D, it\'s A. The V → I cadence is the strongest harmonic resolution in tonal music, and the circle makes its location obvious for any key.' },

      { type: 'h3', text: '5. Common chord progressions are circle-walks.' },
      { type: 'p', text:
        'The ii–V–I cadence (in C: Dm–G–C) walks two steps counter-clockwise. The "rhythm changes" bridge (B7–E7–A7–D7 in B♭) is a sequence of dominants chained around the circle. Once you know the circle, jazz harmony stops feeling random.' },

      { type: 'h2', text: 'Why fifths and not some other interval?' },
      { type: 'p', text:
        'The perfect fifth is the strongest consonance after the octave. Stack twelve perfect fifths and you arrive (very nearly) at the same pitch class twelve octaves higher. That mathematical coincidence — Pythagoras noticed it — is why the circle of fifths is a circle and not just a list. Every other interval, when stacked, eventually overshoots or undershoots; only the fifth wraps cleanly through twelve steps.' },

      { type: 'callout', text:
        'Practice tip: the Circle of Fifths Trainer drills exactly this — say a key, mark its sharps or flats. The fastest way to internalise the circle is to drill it until naming any key signature feels reflexive.' },

      { type: 'h2', text: 'Where to go next' },
      { type: 'p', text:
        'Once the circle clicks, study the diatonic chords of each key (the seven triads built on each scale degree) and watch how the I, IV, and V chords of every major key are always the three keys closest on the circle. After that, learn the modes — they\'re seven different ways to start a major scale, and they distribute neatly around the circle too.' },
      { type: 'related', items: [
        { label: 'Circle of Fifths Trainer', to: '/circle-of-fifths' },
        { label: 'Key of G major', to: '/keys/g-major' },
        { label: 'Key of F major', to: '/keys/f-major' },
      ] },
    ],
    faq: [
      { q: 'Why is it called the circle of "fifths"?', a: 'Each step around the circle moves up by a perfect fifth (seven semitones). Twelve fifths brings you back to the same pitch class twelve octaves higher.' },
      { q: 'Is the circle of fifths the same as the circle of fourths?', a: 'It\'s the same circle read in the opposite direction. Every step counter-clockwise is a perfect fifth down — which is the same as a perfect fourth up.' },
      { q: 'Do I need to memorise the whole circle to read music?', a: 'You need to know the order of sharps (F C G D A E B) and flats (B E A D G C F), which the circle visualises. Most musicians develop a working knowledge of the circle naturally as they encounter more keys.' },
    ],
  },

  'how-to-remember-base-triads': {
    publishAt: '2020-01-01',
    title: 'How to remember base triads',
    description:
      'Memorise the four basic triads — major, minor, diminished, augmented — by the interval pattern between their three notes, not by rote memorisation of every chord.',
    blocks: [
      { type: 'p', text:
        'There are four basic triads in Western music: major, minor, diminished, and augmented. Times twelve possible roots, that\'s 48 chords. You don\'t need to memorise 48 chords. You need to memorise four interval patterns and apply them to any root.' },
      { type: 'p', text:
        'This article walks through the four shapes, the rule that makes them stick, and a couple of memory tricks for when the spelling gets weird.' },

      { type: 'h2', text: 'The rule: stack two thirds' },
      { type: 'p', text:
        'Every basic triad is built by stacking two thirds on top of a root. The only thing that changes between the four chord types is whether each third is major (4 semitones, e.g. C → E) or minor (3 semitones, e.g. C → E♭).' },
      { type: 'ul', items: [
        'Major triad: major third, then minor third. (C → E → G.)',
        'Minor triad: minor third, then major third. (C → E♭ → G.)',
        'Diminished triad: minor third, then minor third. (C → E♭ → G♭.)',
        'Augmented triad: major third, then major third. (C → E → G#.)',
      ] },
      { type: 'p', text:
        'That\'s the whole system. If you can name the third above any note (and you can, with practice — drilling intervals is the fastest way), you can build any of the four triads on any root.' },

      { type: 'h2', text: 'A memory trick: the symmetric pair and the asymmetric pair' },
      { type: 'p', text:
        'Two of the four triads are symmetric (both thirds the same):' },
      { type: 'ul', items: [
        'Diminished = two minor thirds.',
        'Augmented = two major thirds.',
      ] },
      { type: 'p', text:
        'Two are asymmetric (different thirds):' },
      { type: 'ul', items: [
        'Major = major-then-minor (the "happy" one starts with the bigger interval).',
        'Minor = minor-then-major (the "sad" one starts with the smaller interval).',
      ] },
      { type: 'p', text:
        'If you can remember "major starts big, minor starts small," and "diminished is all small, augmented is all big," you have the four triads encoded as a tiny rule rather than a list.' },

      { type: 'h2', text: 'The spelling rule that catches everyone' },
      { type: 'p', text:
        'When you build a triad, every note must use a different letter name, advancing two letters at a time: 1, 3, 5. C major is C–E–G. F# minor is F#–A–C#. E♭ diminished is E♭–G♭–B♭♭ (yes, double-flat — that\'s correct).' },
      { type: 'callout', text:
        'Common trap: a learner builds E♭ diminished as E♭–G♭–A. The pitches are right (A is enharmonically the same as B♭♭), but the spelling is wrong because you\'ve skipped from G♭ to A — that\'s a second, not a third. Always advance two letters per note.' },
      { type: 'p', text:
        'The double-sharps and double-flats look intimidating, but they show up specifically because the stack-of-thirds rule must be honoured. Once you accept that, the spelling becomes mechanical.' },

      { type: 'h2', text: 'Drill it, don\'t memorise it' },
      { type: 'p', text:
        'Looking up "what are the notes in B♭ diminished?" once and forgetting it next week is rote memorisation, and it doesn\'t scale. The faster path is to drill the rule with flash cards: see a chord name, build it from scratch, check yourself. Repeat until it\'s automatic.' },
      { type: 'p', text:
        'The Chord Trainer on this site does exactly this — it shows you a chord name (C aug, F# dim, B♭m, etc.) and asks you to spell out the three notes. It runs through every quality you\'ve toggled on, with a timer to track your improvement.' },

      { type: 'h2', text: 'Beyond the four basics' },
      { type: 'p', text:
        'Once the four basic triads are reflexive, the same logic extends to seventh chords (add another third on top), ninth chords (add another), thirteenth chords (one more). The interval-stack rule never changes — you\'re just chaining more thirds on top of the same root.' },
      { type: 'related', items: [
        { label: 'Chord Trainer', to: '/triads' },
        { label: 'C major chord', to: '/chords/c-major' },
        { label: 'Interval Trainer', to: '/intervals' },
      ] },
    ],
    faq: [
      { q: 'Are there only four kinds of triads?', a: 'Yes — major, minor, diminished, and augmented are the four basic triads, distinguished by their two stacked thirds. Other chords (sus2, sus4, etc.) replace one of the triad notes; seventh chords add a fourth note on top.' },
      { q: 'How do I know whether to use ♯ or ♭ when spelling a triad?', a: 'Use whichever accidental keeps each note on a different letter name (1-3-5). If the root is F#, the third must be on the letter A (so A or A#), not B♭, even if they sound the same.' },
      { q: 'What\'s the fastest way to memorise all 48 base triads?', a: 'Don\'t memorise them one by one. Memorise the four interval patterns (M3+m3, m3+M3, m3+m3, M3+M3) and drill them with random roots until the application is automatic.' },
    ],
  },
};

export const getLearnPageContent = (slug, now = new Date()) => {
  const content = CONTENT[slug];
  if (!content || !isLive(content.publishAt, now)) return null;
  return { slug, ...content };
};

export const getLiveLearnSlugs = (now = new Date()) =>
  Object.entries(CONTENT)
    .filter(([, c]) => isLive(c.publishAt, now))
    .map(([slug]) => slug);

export const PUBLISHED_LEARN_SLUGS = getLiveLearnSlugs();

// Title-only lookup for nav (works even before the page is published, but we
// only expose published ones via PUBLISHED_LEARN_SLUGS).
export const getLearnTitle = (slug) => CONTENT[slug]?.title || slug;
