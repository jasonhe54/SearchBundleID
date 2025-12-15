import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "30 s"),
});

export default async function proxy(request, event) {
  const ip = request.ip;
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    // Just return a 429 Rate Limit Exceeded Error and the Frontend will handle it
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path", // just matches /api/* but no deeper routes
};