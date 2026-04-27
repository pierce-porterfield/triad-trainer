// POST /api/daily/submit
//
// Body: { puzzleNumber, playerId, name?, time, totalGuesses, breakdown }
//
// Records a player's daily-puzzle result, updates the leaderboard for that
// puzzle, and returns the player's rank. Idempotent per (playerId,
// puzzleNumber) — second submits for the same pair are silently ignored
// and return the existing record's rank.
//
// Plausibility checks are intentionally lax: we trust the client time
// because the rules ("keep guessing until correct") make the time the
// natural cost. We just floor at 30 seconds so a one-line fetch can't
// claim the top spot. Stronger anti-cheat (server-side answer grading)
// can be layered on later.

import { redis } from '../_redis.js';

const NAME_MAX_LEN = 20;
const NAME_REGEX = /^[\p{L}\p{N}\s._-]+$/u; // letters, digits, space, dot, underscore, hyphen

const sanitiseName = (raw) => {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().slice(0, NAME_MAX_LEN);
  if (!trimmed) return null;
  if (!NAME_REGEX.test(trimmed)) return null;
  return trimmed;
};

const isValidPlayerId = (id) =>
  typeof id === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(id);

const isValidPuzzleNumber = (n) =>
  Number.isInteger(n) && n >= 1 && n <= 10000;

const isValidBreakdown = (b) => {
  if (!Array.isArray(b)) return false;
  let totalCards = 0;
  for (const round of b) {
    if (!Array.isArray(round)) return false;
    for (const g of round) {
      if (!Number.isInteger(g) || g < 1 || g > 100) return false;
      totalCards++;
    }
  }
  return totalCards >= 1 && totalCards <= 50; // sanity cap
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const { puzzleNumber, playerId, name, time, totalGuesses, breakdown } = req.body || {};

  if (!isValidPuzzleNumber(puzzleNumber)) {
    res.status(400).json({ error: 'invalid-puzzle-number' });
    return;
  }
  if (!isValidPlayerId(playerId)) {
    res.status(400).json({ error: 'invalid-player-id' });
    return;
  }
  if (!Number.isFinite(time) || time < 30 || time > 60 * 60 * 6) {
    res.status(400).json({ error: 'implausible-time' });
    return;
  }
  if (!Number.isInteger(totalGuesses) || totalGuesses < 1 || totalGuesses > 1000) {
    res.status(400).json({ error: 'implausible-guesses' });
    return;
  }
  if (!isValidBreakdown(breakdown)) {
    res.status(400).json({ error: 'invalid-breakdown' });
    return;
  }

  const cleanName = sanitiseName(name);

  const lbKey = `daily:lb:${puzzleNumber}`;
  const resultKey = `daily:result:${puzzleNumber}:${playerId}`;
  const playsKey = `daily:plays:${puzzleNumber}`;
  const nameKey = `daily:player:${playerId}:name`;

  // Already submitted? Return existing record's rank without mutating play
  // counts. We DO allow updating the display name on a duplicate submit so
  // a player who skipped the name prompt can come back and add one without
  // losing their result.
  const existing = await redis.hgetall(resultKey);
  if (existing && existing.time != null) {
    const cleanNameForUpdate = sanitiseName(name);
    if (cleanNameForUpdate && cleanNameForUpdate !== existing.name) {
      await Promise.all([
        redis.hset(resultKey, { name: cleanNameForUpdate }),
        redis.set(nameKey, cleanNameForUpdate),
      ]);
    }
    const rank = (await redis.zrank(lbKey, playerId)) ?? null;
    const todayPlays = Number(await redis.get(playsKey)) || 0;
    res.status(200).json({
      rank: rank == null ? null : rank + 1,
      todayPlays,
      duplicate: true,
    });
    return;
  }

  // Persist name if given (also reused for future submits without re-prompt).
  if (cleanName) {
    await redis.set(nameKey, cleanName);
  }
  const displayName = cleanName || (await redis.get(nameKey)) || null;

  // Pipeline the writes for speed + atomicity-ish guarantees.
  const pipe = redis.pipeline();
  pipe.hset(resultKey, {
    time,
    totalGuesses,
    name: displayName || '',
    submittedAt: Date.now(),
  });
  pipe.zadd(lbKey, { score: time, member: playerId });
  pipe.incr('daily:total');
  pipe.incr(playsKey);
  pipe.sadd('daily:players', playerId);
  await pipe.exec();

  const [rank, todayPlays, lifetimeTotal, lifetimePlayers] = await Promise.all([
    redis.zrank(lbKey, playerId),
    redis.get(playsKey),
    redis.get('daily:total'),
    redis.scard('daily:players'),
  ]);

  res.status(200).json({
    rank: rank == null ? null : rank + 1,
    todayPlays: Number(todayPlays) || 0,
    lifetimeTotal: Number(lifetimeTotal) || 0,
    lifetimePlayers: Number(lifetimePlayers) || 0,
    duplicate: false,
  });
}
