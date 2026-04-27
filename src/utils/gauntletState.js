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
