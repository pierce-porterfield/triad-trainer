// Site-wide static pages — About, Privacy, etc. Same block-rendering shape
// as learnContent.js so we can reuse the LearnPage rendering primitives,
// but kept separate because these aren't long-form articles.
//
// Each entry: { title, description, blocks }. No publishAt gating —
// static pages are always live.

export const STATIC_PAGES = {
  privacy: {
    title: 'Privacy policy',
    description:
      'What data Music Theory Trainer collects, where it lives, and how to remove it.',
    blocks: [
      { type: 'p', text:
        'This page describes what data Music Theory Trainer (theory-trainer.com) collects, where it\'s stored, and how you can remove it. The short version: almost everything stays in your browser. The one exception is the Etudle daily-puzzle leaderboard, where your time and an anonymous identifier are sent to the server so the leaderboard can rank everyone consistently.' },
      { type: 'p', text:
        'Last updated: April 2026.' },

      { type: 'h2', text: 'What stays in your browser' },
      { type: 'p', text:
        'The trainers (Chord, Circle of Fifths, Interval, Note, Practice Gauntlet) and the Etudle daily puzzle save state to your browser\'s localStorage. This includes:' },
      { type: 'ul', items: [
        'Best times for each trainer + setting combination, so you can race your previous run.',
        'Whether you\'ve completed today\'s Etudle, your current streak, and your last result.',
        'Practice Gauntlet lifetime round count and tier progress.',
        'An anonymous player ID generated the first time you complete an Etudle (a random UUID; not tied to your name, email, or device).',
        'Optionally, a display name you choose for the leaderboard.',
      ] },
      { type: 'p', text:
        'localStorage data never leaves your browser unless explicitly sent (see the leaderboard section below). It\'s only readable by this site. Clearing your browser\'s site data wipes all of it.' },

      { type: 'h2', text: 'What goes to the server' },
      { type: 'p', text:
        'When you finish an Etudle daily puzzle, the following gets sent to a serverless API endpoint and stored in a Vercel-hosted Redis database:' },
      { type: 'ul', items: [
        'Your anonymous player ID (the random UUID generated locally).',
        'Your display name, if you set one.',
        'The puzzle number, your time, your total guess count, and the per-card guess breakdown.',
      ] },
      { type: 'p', text:
        'This is the entire payload. No IP address, browser fingerprint, location, email, or device info is sent or stored. The anonymous player ID is the only thing tying multiple submissions to "the same person," and it\'s scoped to your browser — clearing localStorage gives you a fresh ID, indistinguishable from a new player.' },

      { type: 'h2', text: 'What we don\'t do' },
      { type: 'ul', items: [
        'No analytics scripts (no Google Analytics, no Plausible, no Mixpanel, no anything). Server logs from the hosting provider are limited to Vercel\'s standard request logs, retained briefly for operational purposes.',
        'No tracking pixels or third-party cookies.',
        'No advertising. No advertiser data sharing.',
        'No newsletter, no email collection. No accounts to create.',
        'No social-media tracking pixels (Facebook Pixel, etc.).',
      ] },

      { type: 'h2', text: 'Embedded content' },
      { type: 'p', text:
        'The "How does the circle of fifths work?" article embeds a YouTube video. We use YouTube\'s privacy-enhanced embed (youtube-nocookie.com), which doesn\'t set tracking cookies until you actually press play. If you do play the video, YouTube\'s standard tracking applies; their privacy policy governs that interaction.' },

      { type: 'h2', text: 'How to remove your data' },
      { type: 'ul', items: [
        'Local data: clear your browser\'s site data for theory-trainer.com (Settings → Privacy → Clear data, or the equivalent on your browser).',
        'Leaderboard data: DM @pierce.engineer on Instagram with your anonymous tag (visible on the Etudle results screen, e.g., #K7P9XR) and we\'ll remove your row from the server within a week.',
      ] },

      { type: 'h2', text: 'Third parties' },
      { type: 'p', text:
        'The site is hosted on Vercel, which processes requests and serves static files. Vercel\'s privacy practices apply to that infrastructure layer. The Redis database used for the leaderboard is also operated by Vercel (via Upstash). No other third-party services have access to user data.' },

      { type: 'h2', text: 'Changes to this policy' },
      { type: 'p', text:
        'If this policy materially changes, the "Last updated" date at the top will reflect the change. The site is small and has no incentive to expand data collection — most plausible changes will be in the direction of collecting less, not more.' },

      { type: 'h2', text: 'Contact' },
      { type: 'p', text:
        'Questions, removal requests, or anything else — DM @pierce.engineer on Instagram.' },
      { type: 'related', items: [
        { label: 'Instagram · @pierce.engineer', to: 'https://instagram.com/pierce.engineer' },
      ] },
    ],
  },

  about: {
    title: 'About Music Theory Trainer',
    description:
      'Built by Pierce Porterfield, a self-taught musician trying to drill music theory fluency. Free, ad-free, no accounts, no tracking.',
    blocks: [
      { type: 'p', text:
        'Music Theory Trainer is a free practice site for the fundamentals of Western music theory: chords, scales, key signatures, intervals, and note reading across the staff, piano, and guitar. Built around the idea that fluency in theory comes from drilling, not memorising — every reference page links into a trainer where you can practise the thing you just read about.' },

      { type: 'h2', text: 'Who I am' },
      { type: 'p', text:
        'Hey — I\'m Pierce. I\'m a self-taught musician with no formal training. I studied music briefly in high school and now study privately with a teacher as an adult, but most of what I know I taught myself. For a stretch I was posting short YouTube explainers about music theory; one of them about the circle of fifths is embedded in the explainer article on this site.' },
      { type: 'p', text:
        'I make music as Pierce Engineer (solo) and as one half of Bill Cole Collision (a duo with my friend). My day job is in advertising, which is unrelated to all this — Music Theory Trainer is a side project I build because I want it to exist.' },
      { type: 'related', items: [
        { label: 'Pierce Engineer on Spotify', to: 'https://open.spotify.com/artist/2CDxcdimckjXii3uHq9vXi' },
        { label: 'Bill Cole Collision on Spotify', to: 'https://open.spotify.com/artist/0YffefgYcK1B5VtBjMFvKg' },
      ] },

      { type: 'h2', text: 'Why I built this' },
      { type: 'p', text:
        'I was working with my teacher on jazz guitar and noticed that my recall for intervals and triads was painfully slow. Every time I tried to analyse a piece or work out a lick, I\'d be stuck wracking my brain trying to remember what a major sixth above F♯ was — and the cognitive load killed any chance of staying musical.' },
      { type: 'p', text:
        'I went looking for a flashcard tool that would let me drill this stuff repeatedly until it became reflexive. Nothing I found scaled to my phone or felt right for serious practice, so I built my own. The trainers and the daily puzzle on this site are the result. They\'re what I personally use to keep my recall sharp.' },

      { type: 'h2', text: 'Where it\'s going' },
      { type: 'p', text:
        'The next steps I\'m thinking about: more practice tools for the things you should know without thinking — so when you sit down to play, you can spend your attention on the music rather than the theory. A mobile app version (the web version already works on a phone, but offline-capable would be a real upgrade) is on the list. Also: better on-ramps for total beginners. Most of my friends who want to learn music find theory daunting, and if I can make the path less intimidating through gamification and short, focused exercises, that\'s a real win.' },

      { type: 'h2', text: 'No ads, no accounts, no tracking' },
      { type: 'p', text:
        'There are no ads on the site today. I might add some eventually if traffic gets serious — but I also like having a platform that\'s mine, where I can occasionally promote my own music or whatever else I think is worth pointing at. There are no user accounts, no email collection, and no analytics or tracking pixels. Your trainer progress lives in your browser; the only thing that goes to a server is your Etudle daily-puzzle result, and that\'s anonymous by default. Full details are on the ' },
      { type: 'related', items: [
        { label: 'Privacy policy', to: '/privacy' },
      ] },

      { type: 'h2', text: 'What\'s here' },
      { type: 'ul', items: [
        'Etudle — a 15-card daily puzzle with a global leaderboard, refreshing at midnight UTC.',
        'Practice Gauntlet — focused 5-card rounds on a random topic, no setup.',
        'Four trainers — Chord, Circle of Fifths, Interval, Note — with timer-based personal bests across multiple input modes (tap, music staff, piano, guitar).',
        'Reference pages — every chord, key, and scale explained with diagrams and links into the relevant trainer.',
        'Long-form guides — for the trickier topics (the circle of fifths, base triads, key signatures, major vs. minor).',
      ] },

      { type: 'h2', text: 'Get in touch' },
      { type: 'p', text:
        'Suggestions, bugs, requests, or anything else — DM me on Instagram at @pierce.engineer. The site is actively developed; useful feedback tends to get shipped pretty fast.' },
      { type: 'related', items: [
        { label: 'Instagram · @pierce.engineer', to: 'https://instagram.com/pierce.engineer' },
        { label: 'Etudle (daily puzzle)', to: '/daily' },
        { label: 'Practice Gauntlet', to: '/gauntlet' },
      ] },
    ],
  },
};

export const getStaticPage = (slug) => STATIC_PAGES[slug] || null;
export const ALL_STATIC_SLUGS = Object.keys(STATIC_PAGES);
