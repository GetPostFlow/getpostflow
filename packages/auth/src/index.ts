/**
 * Auth environment contract.
 * These env vars must be present for Clerk to initialise.
 * In production they are set in Vercel / Fly.io environment settings.
 */

export const requiredAuthEnv = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
] as const;

export type RequiredAuthEnv = (typeof requiredAuthEnv)[number];

/**
 * Asserts all required Clerk env vars are set.
 * Call during server startup / health checks.
 */
export function assertAuthEnv(): void {
  const missing = requiredAuthEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[auth] Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
export { useAuth, useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
