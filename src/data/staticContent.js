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
        'Leaderboard data: email pierce@theory-trainer.com with your anonymous player ID (visible on the Etudle results screen as your tag, e.g., #K7P9XR) and we\'ll remove your row from the server within a week.',
      ] },

      { type: 'h2', text: 'Third parties' },
      { type: 'p', text:
        'The site is hosted on Vercel, which processes requests and serves static files. Vercel\'s privacy practices apply to that infrastructure layer. The Redis database used for the leaderboard is also operated by Vercel (via Upstash). No other third-party services have access to user data.' },

      { type: 'h2', text: 'Changes to this policy' },
      { type: 'p', text:
        'If this policy materially changes, the "Last updated" date at the top will reflect the change. The site is small and has no incentive to expand data collection — most plausible changes will be in the direction of collecting less, not more.' },

      { type: 'h2', text: 'Contact' },
      { type: 'p', text:
        'Questions, removal requests, or anything else: pierce@theory-trainer.com.' },
    ],
  },

  about: {
    title: 'About Music Theory Trainer',
    description:
      'Why this site exists, who built it, and what it\'s for.',
    blocks: [
      // INTERVIEW STUB — content gets filled in once we have the user's
      // answers to the questions in the response. Leave a sensible
      // placeholder so the route is live but readable.
      { type: 'p', text:
        'Music Theory Trainer is a free, ad-free practice site for the fundamentals of Western music theory: chords, scales, key signatures, intervals, and note reading on the staff, piano, and guitar.' },
      { type: 'p', text:
        'It\'s built around the idea that fluency comes from spaced repetition, not memorisation — so every page is either a focused trainer (drill until it\'s reflexive), a daily puzzle (Etudle, fifteen cards every day at midnight UTC), or a reference page that links you back into the trainer when you\'re ready to drill.' },

      { type: 'h2', text: 'About the maker' },
      { type: 'p', text:
        'Hi — I\'m Pierce. I built Music Theory Trainer because I wanted a faster, mobile-friendly way to drill the fundamentals than what I could find elsewhere. Most reference sites have great diagrams but no practice tool; most practice tools are old-school and don\'t scale to phones. This site is my attempt to do both.' },
      { type: 'p', text:
        'A more detailed bio is on the way — the page is being filled in as the site grows.' },

      { type: 'h2', text: 'Why it exists' },
      { type: 'p', text:
        'Music theory rewards repetition. The chord names, key signatures, interval shapes — they should be reflexive, the way letters in a word are reflexive when you read. Reflexes come from drilling, not from looking things up. Every reference page on this site has a path back into a trainer for exactly this reason.' },
      { type: 'p', text:
        'It\'s ad-free, account-free, and doesn\'t track you. Your progress lives in your browser; the only thing that goes to the server is the daily-puzzle leaderboard, and even that is anonymous by default. See the privacy policy for the full picture.' },

      { type: 'h2', text: 'What\'s here' },
      { type: 'ul', items: [
        'Etudle — a 15-card daily puzzle with a global leaderboard, refreshing at midnight UTC.',
        'Practice Gauntlet — focused 5-card rounds on a random topic, no setup.',
        'Four trainers — Chord, Circle of Fifths, Interval, Note — with timer-based personal bests.',
        'Reference pages — every chord, key, and scale explained with diagrams and links to the relevant trainer.',
        'Long-form guides — for the trickier topics (the circle of fifths, base triads, key signatures, major vs. minor).',
      ] },

      { type: 'h2', text: 'Get in touch' },
      { type: 'p', text:
        'Suggestions, bugs, questions, or requests: pierce@theory-trainer.com. The site is actively developed; useful feedback gets shipped.' },
      { type: 'related', items: [
        { label: 'Etudle (daily puzzle)', to: '/daily' },
        { label: 'Practice Gauntlet', to: '/gauntlet' },
        { label: 'Privacy policy', to: '/privacy' },
      ] },
    ],
  },
};

export const getStaticPage = (slug) => STATIC_PAGES[slug] || null;
export const ALL_STATIC_SLUGS = Object.keys(STATIC_PAGES);
