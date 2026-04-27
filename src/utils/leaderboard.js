// Thin client wrappers around /api/daily/{submit,stats}.
// Errors don't throw — leaderboard is a "nice-to-have" overlay; the local
// game state is always the source of truth for "did I play today?".

export const submitDailyResult = async ({ puzzleNumber, playerId, tag, name, time, totalGuesses, breakdown }) => {
  try {
    const r = await fetch('/api/daily/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puzzleNumber, playerId, tag, name, time, totalGuesses, breakdown }),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};

export const fetchDailyStats = async ({ puzzleNumber, playerId } = {}) => {
  try {
    const params = new URLSearchParams();
    if (puzzleNumber != null) params.set('puzzleNumber', String(puzzleNumber));
    if (playerId) params.set('playerId', playerId);
    const url = '/api/daily/stats' + (params.toString() ? `?${params}` : '');
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};
