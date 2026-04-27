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
    const playsKey = `daily:plays:${puzzleNumber}`;

    // Top 10: zrange by score asc, fastest times first.
    const topMembers = await redis.zrange(lbKey, 0, 9, { withScores: true });
    // Upstash returns a flat array: [member, score, member, score, ...]
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

    const plays = Number(await redis.get(playsKey)) || 0;
    today = { puzzleNumber, plays, top10, me };
  }

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({
    lifetimeTotal: Number(lifetimeTotal) || 0,
    lifetimePlayers: Number(lifetimePlayers) || 0,
    today,
  });
}
