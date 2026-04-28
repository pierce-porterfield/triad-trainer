// GET /api/daily/stats?puzzleNumber=N&playerId=...
//
// Returns:
//   {
//     lifetimeTotal:   number,
//     lifetimePlayers: number,
//     today: {
//       puzzleNumber: N,
//       plays:        number,
//       top10:        [{ rank, name, time, totalGuesses }],
//       me:           { rank, time, totalGuesses, name } | null,
//     } | null
//   }
//
// Cache header set to 60s so the homepage counter doesn't hammer KV.

import { redis } from '../_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const puzzleNumber = Number(req.query.puzzleNumber);
  const playerId = typeof req.query.playerId === 'string' ? req.query.playerId : null;

  const [lifetimeTotal, lifetimePlayers] = await Promise.all([
    redis.get('daily:total'),
    redis.scard('daily:players'),
  ]);

  let today = null;
  if (Number.isInteger(puzzleNumber) && puzzleNumber >= 1) {
    const lbKey = `daily:lb:${puzzleNumber}`;

    // Top 10: zrange by score asc, fastest times first.
    // ioredis returns a flat string[] for WITHSCORES: [member, score, member, score, ...]
    const topMembers = await redis.zrange(lbKey, 0, 9, 'WITHSCORES');
    const top10 = [];
    for (let i = 0; i < topMembers.length; i += 2) {
      const memberId = topMembers[i];
      const time = Number(topMembers[i + 1]);
      const result = await redis.hgetall(`daily:result:${puzzleNumber}:${memberId}`);
      top10.push({
        rank: top10.length + 1,
        name: (result && result.name) || '',
        tag: (result && result.tag) || '',
        time,
        totalGuesses: Number(result?.totalGuesses) || null,
      });
    }

    let me = null;
    if (playerId) {
      const myRank = await redis.zrank(lbKey, playerId);
      if (myRank != null) {
        const result = await redis.hgetall(`daily:result:${puzzleNumber}:${playerId}`);
        me = {
          rank: myRank + 1,
          name: (result && result.name) || '',
          tag: (result && result.tag) || '',
          time: Number(result?.time) || null,
          totalGuesses: Number(result?.totalGuesses) || null,
        };
      }
    }

    // Derive plays from the leaderboard ZSET itself rather than a separate
    // INCR counter — guarantees the homepage count and the visible
    // leaderboard size never disagree.
    const plays = await redis.zcard(lbKey);
    today = { puzzleNumber, plays, top10, me };
  }

  // Personalised responses (with playerId) must not be CDN-cached — otherwise
  // a player who just saved a display name would see stale leaderboard rows
  // for up to the cache TTL. Only the anonymous path gets a public cache.
  if (playerId) {
    res.setHeader('Cache-Control', 'private, no-store');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  }
  res.status(200).json({
    lifetimeTotal: Number(lifetimeTotal) || 0,
    lifetimePlayers: Number(lifetimePlayers) || 0,
    today,
  });
}
