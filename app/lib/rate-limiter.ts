const RATE_LIMIT = 100; // max requests per interval
const REFILL_INTERVAL = 10 * 1000; // 10 seconds
const TOKENS_PER_INTERVAL = 16; // ~100 requests per minute

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

function getIP(request: Request): string {
  // Try to get the real IP if behind a proxy, fallback to "unknown"
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function refill(bucket: Bucket) {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed > REFILL_INTERVAL) {
    const tokensToAdd =
      Math.floor(elapsed / REFILL_INTERVAL) * TOKENS_PER_INTERVAL;
    bucket.tokens = Math.min(RATE_LIMIT, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

export async function checkRateLimit(
  request: Request,
): Promise<Response | void> {
  // Skip rate limiting for test environments
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const ip = getIP(request);
  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT, lastRefill: Date.now() };
    buckets.set(ip, bucket);
  }
  refill(bucket);

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return;
  } else {
    return new Response("Too Many Requests", { status: 429 });
  }
}
