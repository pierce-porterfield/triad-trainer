// Shared Redis client for the daily-game serverless functions.
//
// Vercel's Redis (Upstash) integration injects credentials as
// KV_REST_API_URL / KV_REST_API_TOKEN. The @upstash/redis SDK's
// Redis.fromEnv() looks for UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
// instead, so we pass them in explicitly. Both name pairs are checked so the
// same code works whether you provisioned via Vercel's marketplace or a
// stand-alone Upstash account.

import { Redis } from '@upstash/redis';

const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // Fail loud at module load with a useful message — Vercel surfaces this
  // verbatim in the Logs tab, replacing the opaque
  // "Failed to parse URL from /pipeline" / FUNCTION_INVOCATION_FAILED that
  // an unconfigured Redis client otherwise throws.
  const have = {
    KV_REST_API_URL:           !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN:         !!process.env.KV_REST_API_TOKEN,
    UPSTASH_REDIS_REST_URL:    !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN:  !!process.env.UPSTASH_REDIS_REST_TOKEN,
  };
  throw new Error(
    `Redis env vars not set. Connect the Redis store in Vercel: ` +
    `Storage → your Redis → Projects → connect the project, then redeploy. ` +
    `Currently visible: ${JSON.stringify(have)}`
  );
}

export const redis = new Redis({ url, token });
