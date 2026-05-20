import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/design-system(.*)",
  "/api/clerk/webhook(.*)",
  "/api/stripe/webhook(.*)",
  "/api/health(.*)",
]);

// Stub/preview mode: bypass Clerk entirely when no real key is configured.
const STUB_CLERK_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const stubMode =
  !clerkKey ||
  clerkKey === STUB_CLERK_KEY ||
  clerkKey.length <= 30 ||
  (!clerkKey.startsWith("pk_live_") && !clerkKey.startsWith("pk_test_"));

function stubMiddleware(req: NextRequest) {
  // In stub mode, gate /dashboard and /app routes with a friendly notice
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/(app)")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export default stubMode
  ? stubMiddleware
  : clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
