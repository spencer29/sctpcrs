/**
 * In-memory rate limiter for login attempts.
 * Tracks failed attempts per IP and per email independently.
 * No passwords or tokens are stored here.
 */

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const store = new Map<string, AttemptRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const MAX_ATTEMPTS = 5;            // max failures before lockout
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout

function getRecord(key: string): AttemptRecord {
  const now = Date.now();
  const rec = store.get(key);

  if (!rec) return { count: 0, firstAttemptAt: now, lockedUntil: null };

  // Reset window if it has expired and not locked
  if (!rec.lockedUntil && now - rec.firstAttemptAt > WINDOW_MS) {
    return { count: 0, firstAttemptAt: now, lockedUntil: null };
  }

  return rec;
}

export function isRateLimited(ip: string, email: string): { limited: boolean; retryAfterMs: number } {
  const now = Date.now();

  for (const key of [ip, `email:${email}`]) {
    const rec = getRecord(key);

    if (rec.lockedUntil !== null) {
      if (now < rec.lockedUntil) {
        return { limited: true, retryAfterMs: rec.lockedUntil - now };
      }
      // Lockout expired — clear it
      store.delete(key);
    }
  }

  return { limited: false, retryAfterMs: 0 };
}

export function recordFailedAttempt(ip: string, email: string): void {
  const now = Date.now();

  for (const key of [ip, `email:${email}`]) {
    const rec = getRecord(key);
    rec.count += 1;

    if (rec.count >= MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_MS;
    }

    store.set(key, rec);
  }
}

export function clearAttempts(ip: string, email: string): void {
  store.delete(ip);
  store.delete(`email:${email}`);
}

/** Prune stale entries (call periodically if needed) */
export function pruneExpired(): void {
  const now = Date.now();
  for (const [key, rec] of store.entries()) {
    const expired =
      rec.lockedUntil !== null
        ? now > rec.lockedUntil
        : now - rec.firstAttemptAt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}
