// Shared Redis client for the daily-game serverless functions.
//
// Uses ioredis with a TCP connection string from REDIS_URL — the env var
// Vercel's Redis integration injects (rebranded from KV in late 2024; the
// new product no longer ships REST credentials, only a Redis-protocol URL).
//
// `lazyConnect: true` defers the actual TCP handshake until the first
// command, which fits the serverless invocation pattern (cold start →
// import → first request kicks the connection).

import Redis from 'ioredis';

const url =
  process.env.REDIS_URL ||
  process.env.KV_URL ||
  process.env.UPSTASH_REDIS_URL;

if (!url) {
  const visible = Object.keys(process.env)
    .filter((k) => /redis|kv|upstash/i.test(k))
    .join(', ') || '(none)';
  throw new Error(
    `Redis connection string missing. Connect the Redis store in Vercel ` +
    `(Storage → your Redis → Projects → connect this project, then redeploy). ` +
    `Redis-related env vars currently visible: ${visible}`
  );
}

export const redis = new Redis(url, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  // Vercel's Redis offering uses TLS on the rediss:// scheme; the URL itself
  // carries that, but ioredis sometimes needs an explicit hint when the URL
  // uses redis:// against a TLS-only host. Detect from the scheme.
  ...(url.startsWith('rediss://') ? { tls: {} } : {}),
});

redis.on('error', (err) => {
  // Surface to function logs without crashing the module on transient errors.
  console.error('[redis] error', err.message);
});
