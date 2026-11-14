// Counts requests per client in fixed windows, in memory. Each server instance keeps its own counts,
// so this blunts floods and runaway scripts on a warm instance but is not a hard global limit.
// Hard limits belong in the hosting platform's rate-limit rules.

export type Limit = { limit: number; windowMs: number };
export type Verdict = { allowed: true } | { allowed: false; retryAfterSeconds: number };

type Window = { count: number; resetAt: number };

// Enough for any real traffic. Past this, expired windows go first, then the table starts over, so a
// flood of one-off addresses can't grow it without bound.
const MAX_ENTRIES = 10_000;

const windows = new Map<string, Window>();

function sweep(now: number) {
  for (const [key, window] of windows) if (window.resetAt <= now) windows.delete(key);
  if (windows.size >= MAX_ENTRIES) windows.clear();
}

export function hit(key: string, { limit, windowMs }: Limit, now = Date.now()): Verdict {
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    if (windows.size >= MAX_ENTRIES) sweep(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  current.count += 1;
  if (current.count <= limit) return { allowed: true };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export function resetRateLimits() {
  windows.clear();
}

// Who is calling. Netlify sets its own header with the real address, which a visitor can't override.
// Elsewhere the first entry of X-Forwarded-For is used, which is only trustworthy behind a proxy that
// sets it.
export function clientAddress(headers: Pick<Headers, "get">): string {
  const netlify = headers.get("x-nf-client-connection-ip")?.trim();
  if (netlify) return netlify;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}
