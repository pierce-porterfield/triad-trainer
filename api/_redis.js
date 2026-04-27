// Shared Redis client for the daily-game serverless functions.
//
// Vercel's Redis (Upstash) integration injects credentials as
// KV_REST_API_URL / KV_REST_API_TOKEN. The @upstash/redis SDK's
// Redis.fromEnv() looks for UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
// instead, so it silently falls back to bogus defaults and fails at first
// request with "Failed to parse URL from /pipeline". Pass them explicitly.

import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url:   process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});
