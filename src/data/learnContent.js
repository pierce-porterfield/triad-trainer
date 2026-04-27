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
  'how-to-read-a-key-signature',
  'major-vs-minor',
];

const CONTENT = {
  'how-does-the-circle-of-fifths-work': {
    publishAt: '2020-01-01',
    updatedAt: '2026-04-27',
    title: 'How does the circle of fifths work?',
    description:
      'A plain-English guide to the circle of fifths — what it is, how to read it, and why it makes key signatures, chord progressions, and modulation easier to understand.',
    blocks: [
      { type: 'diagram', name: 'circle-of-fifths' },
      { type: 'p', text:
        'The circle of fifths is the single most useful diagram in music theory. Once you understand it, key signatures stop feeling like memorisation and start making structural sense. Chord progressions reveal patterns. Modulating between keys becomes a step rather than a leap.' },
      { type: 'p', text:
        'But "circle of fifths" is a name that doesn\'t explain itself. This article walks through what the circle is, how to read it, and the four or five facts about music it makes immediately obvious. If you\'d rather watch a walkthrough first, the video below covers the same ideas:' },
      { type: 'video', id: 'FvOzjlJw9LM', title: 'How the circle of fifths works', caption: 'A short video walkthrough of the same concepts.' },

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
    updatedAt: '2026-04-27',
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

  'how-to-read-a-key-signature': {
    publishAt: '2020-01-01',
    updatedAt: '2026-04-27',
    title: 'How to read a key signature',
    description:
      'A practical guide to identifying any key signature in seconds — the order of sharps and flats, the two simple rules that decode them, and the shortcuts that make sight-reading effortless.',
    blocks: [
      { type: 'p', text:
        'A key signature is the cluster of sharps or flats sitting between the clef and the time signature. It tells you, once, which notes are altered for the entire piece — so you don\'t have to write a sharp or flat next to every individual note. Learn to read it in two seconds and the rest of the page reads itself.' },
      { type: 'p', text:
        'There are exactly fifteen possible key signatures (one for each major key, plus their relative minors share the same signatures). All of them follow the same two rules. Once you internalise those rules, you never have to count accidentals again.' },

      { type: 'h2', text: 'The order of sharps and flats' },
      { type: 'p', text:
        'Sharps are always added in the same order: F C G D A E B. Flats are added in the reverse order: B E A D G C F. Two mnemonics most students learn:' },
      { type: 'ul', items: [
        'Sharps — Father Charles Goes Down And Ends Battle.',
        'Flats — Battle Ends And Down Goes Charles\'s Father.',
      ] },
      { type: 'p', text:
        'These two patterns are the spine of every key signature. A signature with three sharps will always be F#, C#, G# — the first three of the sharp order. A signature with four flats will always be B♭, E♭, A♭, D♭ — the first four of the flat order.' },

      { type: 'h2', text: 'Rule 1: identifying a sharp key' },
      { type: 'p', text:
        'For any key signature with sharps, the major key is one half-step up from the last (rightmost) sharp.' },
      { type: 'callout', text:
        'Example: a key signature with F# and C# (two sharps). The last sharp is C#. One half-step up from C# is D. So this is D major (or its relative minor, B minor).' },
      { type: 'p', text:
        'Try it: a key signature with four sharps — F#, C#, G#, D#. The last sharp is D#. One half-step up is E. That\'s E major.' },

      { type: 'h2', text: 'Rule 2: identifying a flat key' },
      { type: 'p', text:
        'For any key signature with flats (more than one), the major key is the second-to-last flat.' },
      { type: 'callout', text:
        'Example: a key signature with three flats — B♭, E♭, A♭. The second-to-last flat is E♭. So this is E♭ major (or its relative minor, C minor).' },
      { type: 'p', text:
        'The exception is one flat (just B♭) — that\'s F major. Memorise that one. Every other flat key follows the second-to-last-flat rule.' },

      { type: 'h2', text: 'C major and the empty signature' },
      { type: 'p', text:
        'C major has no sharps and no flats — the signature is just the clef alone. Its relative minor, A minor, also uses no accidentals. Whenever you see a piece with no key signature it\'s either C major or A minor; the opening notes and the final cadence will tell you which.' },

      { type: 'h2', text: 'Major or minor?' },
      { type: 'p', text:
        'A key signature alone doesn\'t tell you whether the piece is in the major key or its relative minor — they share the same accidentals. Two ways to decide:' },
      { type: 'ul', items: [
        'Look at the first and last note of the melody (or the bass note of the final chord). It will almost always be the tonic — the note the music resolves to.',
        'Listen. Major scales sound bright and "resolved" on the tonic; minor scales sound darker and pensive.',
      ] },
      { type: 'p', text:
        'Each key signature has exactly one major and one minor home. The two are related: the minor tonic is always the 6th degree of the major scale (and a minor third below the major tonic). C major\'s relative minor is A minor. G major\'s is E minor. F major\'s is D minor.' },

      { type: 'h2', text: 'A two-second mental routine' },
      { type: 'ol', items: [
        'Glance at the signature. Sharps or flats?',
        'Sharps: find the last one, go up a half-step. That\'s the major key.',
        'Flats: it\'s the second-to-last flat (or F major if there\'s only one).',
        'Major or minor? Glance at the first/last note of the melody.',
      ] },
      { type: 'p', text:
        'Done. With a few weeks of drilling, this becomes automatic — you read the signature without consciously running the rules, the way you read a word without sounding out the letters.' },

      { type: 'h2', text: 'Drill it' },
      { type: 'p', text:
        'The Circle of Fifths Trainer on this site gives you a key name and asks you to mark the sharps or flats — or shows you a scale and asks you to name the key. Both directions reinforce the same patterns from different angles. Ten minutes a day for two weeks and key signatures stop feeling like memorisation.' },
      { type: 'related', items: [
        { label: 'Circle of Fifths Trainer', to: '/circle-of-fifths' },
        { label: 'How does the circle of fifths work?', to: '/learn/how-does-the-circle-of-fifths-work' },
        { label: 'Key of G major', to: '/keys/g-major' },
      ] },
    ],
    faq: [
      { q: 'Why are sharps and flats always added in a fixed order?', a: 'Each new sharp is a perfect fifth above the previous one (F → C → G → D…), matching the circle of fifths. Each new flat is a perfect fourth above the previous (B → E → A → D…). The order is built into the harmonic structure of Western music.' },
      { q: 'What\'s the rule again for one flat?', a: 'One flat is always F major (or D minor). It\'s the only flat key that doesn\'t follow the "second-to-last flat" rule, because there\'s no second-to-last when there\'s only one.' },
      { q: 'Why do major and minor share the same key signature?', a: 'Because they use exactly the same seven notes — they just centre the music on a different one. C major and A minor both use C, D, E, F, G, A, B. C major resolves to C; A minor resolves to A. Same scale, different home.' },
      { q: 'Are there really only fifteen key signatures?', a: 'Yes. Seven sharp signatures (one through seven sharps), seven flat signatures (one through seven flats), and the empty signature (C major / A minor). Each pairs a major key with its relative minor.' },
    ],
  },

  'major-vs-minor': {
    publishAt: '2020-01-01',
    updatedAt: '2026-04-27',
    title: 'Major vs. minor: what makes them sound different',
    description:
      'Major sounds bright. Minor sounds dark. But why? A look at the one interval that separates them, the cultural conditioning behind "happy" and "sad," and the moments where the rule breaks.',
    blocks: [
      { type: 'p', text:
        'Major sounds happy. Minor sounds sad. Most people pick this up before they know what a key signature is — it\'s one of the first things a child can hear in music. But the actual mechanical difference between the two is much smaller than the emotional gap suggests: a single interval, a half-step in the right place, and the entire character of a piece flips.' },
      { type: 'p', text:
        'Understanding what\'s really going on under "happy" and "sad" sharpens both your ear and your composing instincts. It also explains the surprising number of pieces that don\'t fit the cliché — major pieces that feel mournful, minor pieces that feel triumphant.' },

      { type: 'h2', text: 'The one interval that matters: the third' },
      { type: 'p', text:
        'A major triad and a minor triad share the same root and the same fifth. The only thing that changes is the third. In C major (C–E–G) the third is E — a major third, four semitones above C. In C minor (C–E♭–G) the third is E♭ — a minor third, three semitones above C. One semitone\'s worth of difference, but it transforms the chord.' },
      { type: 'callout', text:
        'Try this at any keyboard: play C, E, and G together — that\'s the bright sound. Now move the E down to E♭ (the black key just to its left). The chord goes from sunny to overcast in a single step. That move is the entire difference.' },
      { type: 'p', text:
        'The same logic applies at the scale level. The major scale has its third degree four semitones above the tonic; the minor scale has its third degree three semitones above. Everything else differs too — the sixth and seventh degrees of natural minor are also lowered — but the third is the single defining note. Composers playing with mode mixture (briefly borrowing notes from the parallel minor or major) almost always start by changing the third.' },

      { type: 'h2', text: 'Why does that interval feel different?' },
      { type: 'p', text:
        'The major third (4 semitones, e.g., C → E) and the minor third (3 semitones, e.g., C → E♭) sit slightly differently against the natural overtone series. When you sound a low note, its acoustic overtones include a major third high up. So a major chord aligns with what the bass note is already producing in the harmonic series; the minor third creates a small but perceptible friction against it.' },
      { type: 'p', text:
        'That said, "natural" doesn\'t mean "happy." Cultures outside the Western tradition associate minor (or related modes) with festive, joyful music. The bright/dark association in Western ears is a mix of acoustic physics and centuries of cultural conditioning — composers used minor for laments, major for celebrations, and the convention reinforced itself.' },

      { type: 'h2', text: 'The leading tone\'s pull' },
      { type: 'p', text:
        'There\'s a second subtle difference that affects how each mode resolves. The major scale\'s seventh degree sits one half-step below the tonic — the "leading tone." When you play 7 → 1 (B → C in C major), the seventh strongly wants to resolve up to the tonic. That pull is what makes a V → I cadence in major sound conclusive.' },
      { type: 'p', text:
        'Natural minor doesn\'t have a leading tone — its 7th degree is a whole step below the tonic (B♭ → C in C minor), which has a softer, more modal pull. To strengthen the cadence, classical composers introduced harmonic minor, which raises the 7th degree (back to B in C minor) specifically to recreate the leading-tone pull. That\'s why harmonic minor scales contain that distinctive augmented-second jump between the 6th and 7th degrees.' },
      { type: 'p', text:
        'So: major scales come with a built-in pull toward home. Natural minor scales don\'t, which is part of why they feel less resolved. Composers in minor keys deliberately add the leading tone back when they want a strong cadence, removing the brightness everywhere else.' },

      { type: 'h2', text: 'Rules of thumb that mostly work' },
      { type: 'ul', items: [
        'Major key + lyrics about love or victory → bright song. (The Beatles\' "Here Comes the Sun" is in A major.)',
        'Minor key + sparse instrumentation → reflective or sad. (Bach\'s "Air on the G String" is in D major actually; Beethoven\'s 5th opens in C minor.)',
        'Mode mixture (briefly borrowing from the parallel mode) creates emotional shift mid-phrase. The pre-chorus of "Creep" by Radiohead does this — it pivots between the major chord and its minor version on the same root.',
      ] },

      { type: 'h2', text: 'Where the cliché breaks' },
      { type: 'p', text:
        'Plenty of major-key pieces feel mournful — Bach\'s "Air on the G String," Pachelbel\'s Canon (D major) is bittersweet rather than happy, Adele\'s "Someone Like You" is in A major. And plenty of minor-key pieces feel triumphant or driving — most heavy metal lives in minor keys without sounding sad, and tracks like "Eye of the Tiger" (in C minor) are pure energy.' },
      { type: 'p', text:
        'What actually drives mood is the combination of mode, tempo, dynamics, instrumentation, harmonic rhythm, and lyrics. Mode is one input among many. The "happy/sad" shorthand works because it\'s often the most immediate signal — but a slow major-key dirge can be more haunting than a fast minor-key sprint.' },

      { type: 'h2', text: 'Hear it for yourself' },
      { type: 'p', text:
        'The fastest way to internalise the difference is to play the same melody in both modes. Pick "Twinkle, Twinkle, Little Star" — the standard major version is the one you know. Now lower the third (E → E♭ if in C, otherwise the equivalent third). Within seconds you\'ll hear the song flip from a children\'s lullaby to a Romanian folk dirge. Same notes, same rhythm, one altered interval.' },
      { type: 'callout', text:
        'Drilling the difference: the Chord Trainer on this site lets you toggle major and minor as separate qualities, then shows you triads in random order. Reading the third — fast — is the fastest path to hearing major and minor without thinking about it.' },
      { type: 'related', items: [
        { label: 'How to remember base triads', to: '/learn/how-to-remember-base-triads' },
        { label: 'C major chord', to: '/chords/c-major' },
        { label: 'Chord Trainer', to: '/triads' },
      ] },
    ],
    faq: [
      { q: 'Is the only difference between major and minor really one note?', a: 'Between the parallel triads (e.g., C major vs. C minor), yes — only the third changes. Between the parallel scales, three notes differ: the 3rd, the 6th, and the 7th in natural minor. But the 3rd is the defining one; if you change only that, the mode flips even with everything else staying the same.' },
      { q: 'Why is minor associated with sadness in Western music?', a: 'A mix of acoustics and convention. The major third aligns with the natural overtone series of the root; the minor third doesn\'t. Centuries of Western composers using minor for laments and major for celebrations reinforced the association. In other musical traditions the same intervals carry different emotional connotations.' },
      { q: 'What are harmonic and melodic minor?', a: 'Variations of natural minor that change the upper part of the scale. Harmonic minor raises the 7th degree to create a stronger leading-tone pull (and the augmented 2nd that defines its sound). Melodic minor raises both the 6th and 7th going up but uses naturals coming down, smoothing the melodic line in classical practice.' },
      { q: 'Can a song change between major and minor mid-piece?', a: 'Yes, constantly. Modulation between parallel modes (C major ↔ C minor) is called mode mixture and is one of the oldest tricks in tonal music. The Beatles\' "Norwegian Wood" pivots between E major and E minor; many film scores use the device to mark emotional shifts.' },
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
