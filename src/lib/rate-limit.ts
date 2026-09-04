import "server-only";

// Best-effort in-memory rate limiter, keyed per server instance. This is not
// a substitute for a shared store (Redis/Upstash) under real load, but
// combined with the honeypot field and the render-time check in the contact
// form it meaningfully raises the bar for casual form spam without adding an
// external dependency.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_HITS;
}
