/**
 * Einfaches In-Memory Rate-Limiting pro Schlüssel (z. B. Client-IP).
 * Für Serverless mehrere Instanzen nicht global konsistent — ausreichend als Schutz vor Brute-Force.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export function checkCheckinRateLimit(key: string): boolean {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_REQUESTS) {
    return false;
  }
  existing.count += 1;
  return true;
}

export function getClientIpFromHeaders(
  headers: Headers,
  fallback = "unknown"
): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return fallback;
}
