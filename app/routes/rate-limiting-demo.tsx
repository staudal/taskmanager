import React, { useState, useEffect, useRef } from "react";

const TOKEN_BUCKET_CAPACITY = 6;
const TOKEN_BUCKET_REFILL_INTERVAL = 2 * 1000; // refill 1 token every 2 seconds

function now() {
  return Date.now();
}

function Dot({
  allowed,
  animate = false,
}: {
  allowed: boolean;
  animate?: boolean;
}) {
  return (
    <span
      className={`mx-1 inline-block h-4 w-4 rounded-full transition-all duration-300 ${allowed ? "bg-green-500" : "bg-red-500"} ${animate ? (allowed ? "animate-pulse-success" : "animate-pulse-error") : ""}`}
    />
  );
}

function Timeline({
  dots,
  latestIndex,
}: {
  dots: { allowed: boolean }[];
  latestIndex: number;
}) {
  return (
    <div className="my-2 flex h-8 min-w-[200px] items-center overflow-x-auto rounded bg-gray-800 px-2">
      {dots.map((dot, i) => (
        <Dot key={i} allowed={dot.allowed} animate={i === latestIndex} />
      ))}
    </div>
  );
}

function useTokenBucket() {
  const [tokens, setTokens] = useState(TOKEN_BUCKET_CAPACITY);
  const [dots, setDots] = useState<{ allowed: boolean }[]>([]);
  const lastRefill = useRef(now());

  // Refill logic
  function refillTokens() {
    const current = now();
    const elapsed = current - lastRefill.current;
    const tokensToAdd = Math.floor(elapsed / TOKEN_BUCKET_REFILL_INTERVAL);
    if (tokensToAdd > 0) {
      setTokens((prev) => Math.min(TOKEN_BUCKET_CAPACITY, prev + tokensToAdd));
      lastRefill.current += tokensToAdd * TOKEN_BUCKET_REFILL_INTERVAL;
    }
  }

  useEffect(() => {
    const intervalId = setInterval(refillTokens, 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only set up interval once

  function hit() {
    refillTokens();
    if (tokens > 0) {
      setTokens(tokens - 1);
      setDots((dots) => [...dots, { allowed: true }]);
    } else {
      setDots((dots) => [...dots, { allowed: false }]);
    }
  }

  function reset() {
    setTokens(TOKEN_BUCKET_CAPACITY);
    lastRefill.current = now();
    setDots([]);
  }

  const latestIndex = dots.length - 1;

  return { hit, dots, remaining: tokens, reset, latestIndex };
}

function TokenBucketVisual({
  tokens,
  capacity,
}: {
  tokens: number;
  capacity: number;
}) {
  return (
    <div className="my-4 rounded-md bg-gray-800 p-4">
      <div className="mb-2">
        <span className="text-xs text-gray-400">Token Bucket</span>
      </div>
      <div className="relative mx-auto h-16 w-32 overflow-hidden rounded-md border border-gray-600 bg-gray-700">
        <div
          className="absolute bottom-0 w-full bg-yellow-600 transition-all duration-300 ease-out"
          style={{ height: `${(tokens / capacity) * 100}%` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-white">{tokens}</span>
          <span className="text-xs text-gray-300">tokens</span>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-gray-400">
        Refill: 1 token every {TOKEN_BUCKET_REFILL_INTERVAL / 1000} seconds
      </div>
    </div>
  );
}

function LimiterDemo({
  title,
  limiter,
  description,
  visualComponent,
}: {
  title: string;
  limiter: ReturnType<typeof useTokenBucket>;
  description: React.ReactNode;
  visualComponent: React.ReactNode;
}) {
  const { hit, dots, remaining, reset, latestIndex } = limiter;

  return (
    <section className="mb-10 rounded-lg bg-gray-900 p-6 shadow-lg">
      <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
      <p className="mb-2 text-gray-300">{description}</p>

      {visualComponent}

      <Timeline dots={dots} latestIndex={latestIndex} />
      <div className="mt-2 flex items-center gap-3">
        <button
          className="rounded bg-blue-600 px-4 py-1 text-white shadow hover:bg-blue-700"
          onClick={hit}
        >
          Hit
        </button>
        <button
          className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
          onClick={reset}
        >
          Reset
        </button>
        <span className="ml-4 text-gray-300">remaining = {remaining}</span>
      </div>
    </section>
  );
}

export default function RateLimitingDemo() {
  const tokenBucket = useTokenBucket();

  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-8 text-3xl font-bold">Rate Limiting Demo</h1>
      <LimiterDemo
        title="Token Bucket"
        limiter={tokenBucket}
        description={
          <span className="italic">
            Capacity: 6, Refill interval: 1 token every 2 seconds
          </span>
        }
        visualComponent={
          <TokenBucketVisual
            tokens={tokenBucket.remaining}
            capacity={TOKEN_BUCKET_CAPACITY}
          />
        }
      />
    </div>
  );
}
