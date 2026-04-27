// localStorage-backed lifetime stats for the Practice Gauntlet.
//
// We keep this minimal — just the rolling round count — because the user
// asked specifically for "total rounds completed all time" on the homepage
// card. Card-level stats are session-only.

const STORAGE_KEY = 'gauntlet:state:v1';

const empty = () => ({
  totalRounds: 0,
});

export const loadGauntletState = () => {
  try {
    if (typeof localStorage === 'undefined') return empty();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
};

const writeGauntletState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota / private mode — ignore */ }
};

// Increment the lifetime round counter. Returns the new total.
export const recordGauntletRound = () => {
  const prev = loadGauntletState();
  const next = { ...prev, totalRounds: prev.totalRounds + 1 };
  writeGauntletState(next);
  return next.totalRounds;
};

// Tier ladder. Each step is a milestone the user is working towards. The
// thresholds are deliberately spaced to feel rewarding for a hobby player —
// reaching Apprentice (10) is achievable in one session, Practitioner (50)
// is a few weeks of casual play, and so on.
const TIERS = [
  { name: 'Just starting', min: 0,    next: 1 },
  { name: 'Newcomer',      min: 1,    next: 10 },
  { name: 'Apprentice',    min: 10,   next: 25 },
  { name: 'Student',       min: 25,   next: 50 },
  { name: 'Practitioner',  min: 50,   next: 100 },
  { name: 'Adept',         min: 100,  next: 250 },
  { name: 'Virtuoso',      min: 250,  next: 500 },
  { name: 'Master',        min: 500,  next: 1000 },
  { name: 'Maestro',       min: 1000, next: null }, // top tier
];

// Returns { name, min, next, toNext, progress01 } for a given round count.
//   next       — round count that triggers the NEXT tier (null if Maestro)
//   toNext     — rounds remaining until the next tier
//   progress01 — 0..1 progress through the current tier
export const getGauntletRank = (totalRounds = 0) => {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (totalRounds >= t.min) tier = t;
    else break;
  }
  if (tier.next == null) {
    return { ...tier, toNext: 0, progress01: 1 };
  }
  const span = tier.next - tier.min;
  const into = totalRounds - tier.min;
  return {
    ...tier,
    toNext: tier.next - totalRounds,
    progress01: span > 0 ? Math.min(1, into / span) : 0,
  };
};
