// localStorage-backed state for the daily puzzle. No server roundtrip.
//
// Schema (key: triadle:state:v1):
//   {
//     lastPlayed:    'YYYY-MM-DD' | null,
//     lastResult:    { time, score, breakdown: number[], puzzleNumber } | null,
//     currentStreak: number,
//     longestStreak: number,
//     totalPlayed:   number,
//     bestTime:      number | null,
//     history:       [{ date, puzzleNumber, time, score, breakdown }]   // capped at 30
//   }

import { getUtcDateString } from './dailyPuzzle';

const STORAGE_KEY = 'triadle:state:v1';
const HISTORY_CAP = 30;

const empty = () => ({
  lastPlayed: null,
  lastResult: null,
  currentStreak: 0,
  longestStreak: 0,
  totalPlayed: 0,
  bestTime: null,
  history: [],
});

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
};

const writeState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode errors
  }
};

// Returns true if the user has already completed today's puzzle.
export const hasPlayedToday = (now = new Date()) => {
  const state = loadState();
  return state.lastPlayed === getUtcDateString(now);
};

// Days difference between two YYYY-MM-DD UTC strings.
const daysBetween = (a, b) => {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ams = Date.UTC(ay, am - 1, ad);
  const bms = Date.UTC(by, bm - 1, bd);
  return Math.round((bms - ams) / 86400000);
};

// Record a completed puzzle. Updates streak / best time / history.
// Returns the new state so the caller can use derived fields.
export const markCompleted = ({ time, score, breakdown, puzzleNumber }, now = new Date()) => {
  const today = getUtcDateString(now);
  const prev = loadState();

  // Already played today — be idempotent (don't double-count).
  if (prev.lastPlayed === today) return prev;

  let currentStreak;
  if (prev.lastPlayed && daysBetween(prev.lastPlayed, today) === 1) {
    currentStreak = prev.currentStreak + 1;
  } else {
    currentStreak = 1;
  }
  const longestStreak = Math.max(prev.longestStreak, currentStreak);

  const bestTime = prev.bestTime == null ? time : Math.min(prev.bestTime, time);

  const entry = { date: today, puzzleNumber, time, score, breakdown };
  const history = [entry, ...prev.history].slice(0, HISTORY_CAP);

  const next = {
    lastPlayed: today,
    lastResult: { time, score, breakdown, puzzleNumber },
    currentStreak,
    longestStreak,
    totalPlayed: prev.totalPlayed + 1,
    bestTime,
    history,
  };
  writeState(next);
  return next;
};

// Visible-only export for tests / debugging.
export const _resetState = () => writeState(empty());
