// Deterministic PRNG and hashing for the daily puzzle.
//
// Mulberry32 — tiny seedable PRNG. Returns a function that yields a uint32
// each call; we wrap it to also yield floats in [0, 1).
//
// cyrb53 — small string-to-uint32 hash. Used to combine a day seed with a
// round index so each round gets its own deterministic stream.

export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0;
};

// Sample `count` distinct items from `pool` using the given PRNG.
// Stable: same RNG state yields same selection.
export const sample = (pool, count, rng) => {
  const indices = [...pool.keys()];
  // Fisher–Yates partial shuffle, take first `count`.
  for (let i = 0; i < count && i < indices.length - 1; i++) {
    const j = i + Math.floor(rng() * (indices.length - i));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count).map((i) => pool[i]);
};
