const STORAGE_KEY = 'triadtrainer:bestTimes:v1';

// Each wrong answer adds this many milliseconds to the final time.
export const WRONG_PENALTY_MS = 20000;

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const save = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const getBestTime = (key) => {
  const data = load();
  return data[key] ?? null;
};

// Returns true if the new time is a new record.
export const recordTime = (key, ms) => {
  const data = load();
  if (data[key] == null || ms < data[key]) {
    data[key] = ms;
    save(data);
    return true;
  }
  return false;
};

export const formatTime = (ms) => {
  if (ms == null) return '—';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
