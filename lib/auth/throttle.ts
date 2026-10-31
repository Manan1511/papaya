// Failed sign-ins per client, counted in memory. Each server instance keeps its own count, so the
// limit holds per instance until the count moves to shared storage before launch. The window runs
// 15 minutes from the first failure.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Attempts = { failures: number; windowStart: number };

const attempts = new Map<string, Attempts>();

// Returns the client's record only while its window is open. Expired records are dropped.
function live(key: string, now: number): Attempts | undefined {
  const record = attempts.get(key);
  if (record && now - record.windowStart < WINDOW_MS) return record;
  attempts.delete(key);
  return undefined;
}

export function loginLocked(key: string, now = Date.now()): boolean {
  return (live(key, now)?.failures ?? 0) >= MAX_FAILURES;
}

export function recordFailure(key: string, now = Date.now()): void {
  for (const other of attempts.keys()) live(other, now);

  const record = live(key, now);
  if (record) record.failures += 1;
  else attempts.set(key, { failures: 1, windowStart: now });
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
