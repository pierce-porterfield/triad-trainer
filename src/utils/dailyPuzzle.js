// Daily puzzle generation — deterministic, no server roundtrip.
//
// The same UTC day produces the same puzzle on every device.

import { mulberry32, cyrb53, sample } from './seededRandom';
import { buildAllTriadCards } from '../data/triads';
import { MAJOR_KEYS } from '../data/keys';
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

// Round templates for v1. Each puzzle is one template's three rounds.
// Selection: TEMPLATES[dayNumber % TEMPLATES.length].
export const TEMPLATES = [
  {
    id: 'foundations',
    name: 'Foundations',
    rounds: [
      { type: 'triad',    direction: 'chord-to-notes',   count: 5 },
      { type: 'key',      direction: 'key-to-accidentals', count: 5 },
      { type: 'interval', direction: 'mixed',            count: 5, groups: ['2nds', '6ths'] },
    ],
  },
  {
    id: 'reverse-foundations',
    name: 'Reverse Foundations',
    rounds: [
      { type: 'triad',    direction: 'notes-to-chord',   count: 5 },
      { type: 'key',      direction: 'notes-to-key',     count: 5 },
      { type: 'interval', direction: 'mixed',            count: 5, groups: ['2nds', '6ths'] },
    ],
  },
  {
    id: 'triad-heavy',
    name: 'Triad-heavy',
    rounds: [
      { type: 'triad',    direction: 'chord-to-notes',   count: 5 },
      { type: 'triad',    direction: 'notes-to-chord',   count: 5 },
      { type: 'interval', direction: 'mixed',            count: 5, groups: ['2nds', '6ths'] },
    ],
  },
  {
    id: 'interval-heavy',
    name: 'Interval-heavy',
    rounds: [
      { type: 'interval', direction: 'mixed', count: 5, groups: ['2nds'] },
      { type: 'interval', direction: 'mixed', count: 5, groups: ['6ths'] },
      { type: 'triad',    direction: 'chord-to-notes',   count: 5 },
    ],
  },
  {
    id: 'quick-scan',
    name: 'Quick Scan',
    rounds: [
      { type: 'key',   direction: 'notes-to-key',     count: 5 },
      { type: 'triad', direction: 'chord-to-notes',   count: 5 },
      { type: 'key',   direction: 'key-to-accidentals', count: 5 },
    ],
  },
];

// Pick the cards for one round, deterministically from (day, roundIndex).
const pickRoundCards = (round, dayNumber, roundIndex) => {
  const seed = cyrb53(`${dayNumber}|${roundIndex}|${round.type}`);
  const rng = mulberry32(seed);
  let pool;
  switch (round.type) {
    case 'triad':    pool = buildAllTriadCards(); break;
    case 'key':      pool = MAJOR_KEYS; break;
    case 'interval': {
      const ids = (round.groups || ['2nds', '6ths']).flatMap((gid) =>
        gid === '2nds' ? ['m2', 'M2']
        : gid === '3rds' ? ['m3', 'M3']
        : gid === '6ths' ? ['m6', 'M6']
        : gid === '7ths' ? ['m7', 'M7']
        : [gid]
      );
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
  const rounds = template.rounds.map((round, i) => ({
    ...round,
    cards: pickRoundCards(round, dayNumber, i),
  }));
  return {
    number: dayNumber,
    date: getUtcDateString(new Date(EPOCH_UTC + (dayNumber - 1) * ONE_DAY_MS)),
    template: template.id,
    templateName: template.name,
    rounds,
  };
};
