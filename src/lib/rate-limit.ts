type Bucket = {
  timestamps: number[];
};

const windows = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const LIMIT = 40;

function prune(bucket: Bucket, now: number) {
  bucket.timestamps = bucket.timestamps.filter((time) => now - time < WINDOW_MS);
}

export function rateLimit(key: string, limit = LIMIT): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const bucket = windows.get(key) ?? { timestamps: [] };
  prune(bucket, now);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    windows.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterMs: Math.max(250, WINDOW_MS - (now - oldest)) };
  }

  bucket.timestamps.push(now);
  windows.set(key, bucket);
  return { ok: true, remaining: limit - bucket.timestamps.length, retryAfterMs: 0 };
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
