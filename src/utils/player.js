// Anonymous-but-stable player identity for the Etudle leaderboard.
//
// Layered identity:
//   playerId — opaque UUID. Used internally as the leaderboard primary key.
//              Never displayed.
//   tag      — 6-char readable code derived from playerId (hash → friendly
//              alphabet). Stable per browser, displayed as `#ABC123` on
//              the leaderboard. The "anonymous id" the user sees.
//   name     — optional display name. When set, leaderboard shows
//              `Name #ABC123` with the tag styled small + gray.

import { cyrb53 } from './seededRandom';

const ID_KEY = 'etudle:playerId';
const NAME_KEY = 'etudle:playerName';

// Friendly base-32 alphabet — no 0/O/1/I/L to keep tags unambiguous in print.
const TAG_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const TAG_LEN = 6;

export const tagFromId = (playerId) => {
  if (!playerId) return null;
  let n = cyrb53(String(playerId));
  let out = '';
  for (let i = 0; i < TAG_LEN; i++) {
    out += TAG_ALPHABET[n % TAG_ALPHABET.length];
    n = Math.floor(n / TAG_ALPHABET.length);
  }
  return out;
};

const randomId = () => {
  // crypto.randomUUID is widely available; fall back to a 24-char hex if not.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const getPlayerId = () => {
  if (typeof localStorage === 'undefined') return null;
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = randomId();
    try { localStorage.setItem(ID_KEY, id); } catch {}
  }
  return id;
};

export const getPlayerTag = () => tagFromId(getPlayerId());

export const getPlayerName = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(NAME_KEY) || null;
};

const NAME_MAX_LEN = 20;
const NAME_REGEX = /^[\p{L}\p{N}\s._-]+$/u;

// Returns null if the name is invalid.
export const sanitisePlayerName = (raw) => {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().slice(0, NAME_MAX_LEN);
  if (!trimmed) return null;
  if (!NAME_REGEX.test(trimmed)) return null;
  return trimmed;
};

export const setPlayerName = (raw) => {
  const clean = sanitisePlayerName(raw);
  if (!clean) return null;
  try { localStorage.setItem(NAME_KEY, clean); } catch {}
  return clean;
};

export const PLAYER_NAME_RULES = {
  maxLen: NAME_MAX_LEN,
  description: 'Up to 20 letters, numbers, spaces, or . _ -',
};
