import { clerkMiddleware, createRouteMatcher, type ClerkMiddlewareAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/features(.*)",
  "/how-it-works(.*)",
  "/case-studies(.*)",
  "/faq(.*)",
  "/blog(.*)",
  "/contact(.*)",
  "/about(.*)",
  "/careers(.*)",
  "/legal(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/design-system(.*)",
  "/api/clerk/webhook(.*)",
  "/api/stripe/webhook(.*)",
  "/api/health(.*)",
  "/api/debug/render-test(.*)",
  "/portal(.*)",
  "/api/portal(.*)",
]);

// Stub/preview mode: bypass Clerk entirely when no real key is configured.
const STUB_CLERK_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const stubMode =
  !clerkKey ||
  clerkKey === STUB_CLERK_KEY ||
  clerkKey.length <= 30 ||
  (!clerkKey.startsWith("pk_live_") && !clerkKey.startsWith("pk_test_"));

// ── Rate limiting (Upstash) ─────────────────────────────────────────────────
// Only initialise if env vars are present to avoid errors in stub/preview mode.
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  // Only rate-limit API routes (excluding webhooks which use their own auth)
  if (!pathname.startsWith("/api/")) return null;
  if (pathname.startsWith("/api/clerk/webhook")) return null;
  if (pathname.startsWith("/api/stripe/webhook")) return null;
  if (pathname.startsWith("/api/webhooks/")) return null;
  if (!upstashUrl || !upstashToken) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: upstashUrl, token: upstashToken });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 req/min per IP
      analytics: false,
    });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { success, limit, remaining, reset } = await ratelimit.limit(`api:${ip}`);
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests", code: "RATE_LIMIT_EXCEEDED" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      );
    }
  } catch {
    // Rate limit check failure should not block requests — fail open
  }
  return null;
}

async function stubMiddlewareWithRateLimit(req: NextRequest) {
  const rateLimitResponse = await applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // Real Clerk keys are configured — allow dashboard routes
  return NextResponse.next();
}

async function clerkMiddlewareWithRateLimit(auth: ClerkMiddlewareAuth, req: NextRequest) {
  const rateLimitResponse = await applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
}

export default stubMode
  ? stubMiddlewareWithRateLimit
  : clerkMiddleware(clerkMiddlewareWithRateLimit);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
