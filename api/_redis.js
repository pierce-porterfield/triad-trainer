// Shared Redis client for the daily-game serverless functions.
//
// Vercel's Redis (Upstash) integration auto-injects KV_REST_API_URL and
// KV_REST_API_TOKEN at build/run time on the deployed site, and into the
// local dev environment if `vercel env pull` has been run. Redis.fromEnv()
// picks them up automatically.

import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
