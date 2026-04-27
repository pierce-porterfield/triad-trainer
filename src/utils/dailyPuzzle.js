// Daily puzzle generation — deterministic, no server roundtrip.
//
// The same UTC day produces the same puzzle on every device.

import { mulberry32, cyrb53, sample } from './seededRandom';
import { buildTriadDeck } from '../data/triads';
import { MAJOR_KEYS, MINOR_KEYS, KEYS } from '../data/keys';
import { buildIntervalDeck } from '../data/intervals';

// Day 1 = 2026-04-26 UTC (launch day). Each subsequent UTC day increments.
export const EPOCH_UTC = Date.UTC(2026, 3, 26); // months are 0-indexed (April = 3)
const ONE_DAY_MS = 86400000;

// 1-indexed day number since launch. Defaults to "now".
export const getDayNumber = (date = new Date()) => {
  const utcMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.max(1, Math.floor((utcMs - EPOCH_UTC) / ONE_DAY_MS) + 1);
};

// YYYY-MM-DD UTC string for the given Date (defaults to "now").
export const getUtcDateString = (date = new Date()) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;

// Round templates — defines the structural skeleton of each puzzle. The
// per-round content (qualities, key pool, interval groups, input mode) is
// chosen separately and varies across days.
export const TEMPLATES = [
  {
    id: 'foundations',
    name: 'Foundations',
    rounds: [
      { type: 'triad',    direction: 'chord-to-notes',     count: 5 },
      { type: 'key',      direction: 'key-to-accidentals', count: 5 },
      { type: 'interval',                                  count: 5 },
    ],
  },
  {
    id: 'reverse-foundations',
    name: 'Reverse Foundations',
    rounds: [
      { type: 'triad',    direction: 'notes-to-chord',     count: 5 },
      { type: 'key',      direction: 'notes-to-key',       count: 5 },
      { type: 'interval',                                  count: 5 },
    ],
  },
  {
    id: 'triad-heavy',
    name: 'Triad-heavy',
    rounds: [
      { type: 'triad',    direction: 'chord-to-notes',     count: 5 },
      { type: 'triad',    direction: 'notes-to-chord',     count: 5 },
      { type: 'interval',                                  count: 5 },
    ],
  },
  {
    id: 'interval-heavy',
    name: 'Interval-heavy',
    rounds: [
      { type: 'interval',                                  count: 5 },
      { type: 'interval',                                  count: 5 },
      { type: 'triad',    direction: 'chord-to-notes',     count: 5 },
    ],
  },
  {
    id: 'quick-scan',
    name: 'Quick Scan',
    rounds: [
      { type: 'key',   direction: 'notes-to-key',          count: 5 },
      { type: 'triad', direction: 'chord-to-notes',        count: 5 },
      { type: 'key',   direction: 'key-to-accidentals',    count: 5 },
    ],
  },
];

// Probability-weighted choice from a list of [value, weight] pairs.
const choice = (rng, weighted) => {
  const total = weighted.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [val, w] of weighted) {
    r -= w;
    if (r <= 0) return val;
  }
  return weighted[weighted.length - 1][0];
};

// Triad quality menus by difficulty level
const TRIAD_BASE = ['maj', 'min', 'dim', 'aug'];
const TRIAD_SEVENTHS = [...TRIAD_BASE, 'maj7', 'dom7', 'min7', 'm7b5', 'dim7'];
const TRIAD_NINTHS = [...TRIAD_SEVENTHS, 'maj9', 'dom9', 'min9'];
const TRIAD_THIRTEENTHS = [...TRIAD_NINTHS, 'maj13', 'dom13', 'min13'];

// Compute the round-level options (deterministic per (day, roundIndex, type)).
const pickRoundOptions = (round, dayNumber, roundIndex) => {
  const seed = cyrb53(`${dayNumber}|${roundIndex}|${round.type}|opts`);
  const rng = mulberry32(seed);

  let qualities = null;
  let keyPool = null;
  let groups = null;

  if (round.type === 'triad') {
    qualities = choice(rng, [
      [TRIAD_BASE,         20],
      [TRIAD_SEVENTHS,     35],
      [TRIAD_NINTHS,       25],
      [TRIAD_THIRTEENTHS,  20],
    ]);
  }

  if (round.type === 'key') {
    keyPool = choice(rng, [
      ['major', 25],
      ['minor', 30],
      ['mixed', 45],
    ]);
  }

  if (round.type === 'interval') {
    groups = choice(rng, [
      [['2nds'],            25],
      [['6ths'],            25],
      [['3rds'],            15],
      [['7ths'],            15],
      [['2nds', '3rds'],    10],
      [['6ths', '7ths'],    10],
    ]);
  }

  // Input mode applies to the whole round (all 5 cards). Keys always use tap.
  // Guitar is intentionally excluded from the daily — fretboard reading is
  // less universal than staff/piano, and the daily should welcome any music
  // student. Trainers still offer guitar for those who want it.
  const inputMode = round.type === 'key'
    ? 'tap'
    : choice(rng, [
        ['tap',    40],
        ['staff',  30],
        ['piano',  30],
      ]);

  return { qualities, keyPool, groups, inputMode };
};

const intervalGroupToIds = (gid) => {
  if (gid === '2nds') return ['m2', 'M2'];
  if (gid === '3rds') return ['m3', 'M3'];
  if (gid === '6ths') return ['m6', 'M6'];
  if (gid === '7ths') return ['m7', 'M7'];
  return [gid];
};

// Pick the actual cards for one round, using the resolved options.
const pickRoundCards = (round, options, dayNumber, roundIndex) => {
  const seed = cyrb53(`${dayNumber}|${roundIndex}|${round.type}|cards`);
  const rng = mulberry32(seed);
  let pool;
  switch (round.type) {
    case 'triad':
      pool = buildTriadDeck(options.qualities || TRIAD_BASE);
      break;
    case 'key':
      pool = options.keyPool === 'minor' ? MINOR_KEYS
        : options.keyPool === 'mixed' ? KEYS
        : MAJOR_KEYS;
      break;
    case 'interval': {
      const ids = (options.groups || ['2nds', '6ths']).flatMap(intervalGroupToIds);
      pool = buildIntervalDeck(ids);
      break;
    }
    default: pool = [];
  }
  return sample(pool, round.count, rng);
};

// The full puzzle for a given day. Pure, idempotent, identical across clients.
export const getDailyPuzzle = (dayNumber = getDayNumber()) => {
  const template = TEMPLATES[dayNumber % TEMPLATES.length];
  const rounds = template.rounds.map((round, i) => {
    const options = pickRoundOptions(round, dayNumber, i);
    const cards = pickRoundCards(round, options, dayNumber, i);
    return {
      ...round,
      ...options,
      cards,
    };
  });
  return {
    number: dayNumber,
    date: getUtcDateString(new Date(EPOCH_UTC + (dayNumber - 1) * ONE_DAY_MS)),
    template: template.id,
    templateName: template.name,
    rounds,
  };
};
