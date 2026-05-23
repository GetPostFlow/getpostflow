/**
 * auth-org.ts
 *
 * Resolves the DB org for the current authenticated user.
 *
 * Handles two cases:
 *  1. Clerk has an active orgId in the session (happy path).
 *  2. Clerk session exists but has no active org (e.g. user switched org or
 *     session was minted without org context) — fall back to DB membership,
 *     preferring orgs with a real Clerk org ID (org_*) over demo/seed orgs.
 *
 * Returns { userId, orgRow } or redirects as appropriate.
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDb, orgs, users, orgMemberships } from "@getpostflow/db";
import { eq, inArray } from "drizzle-orm";

async function resolveOrgRow(userId: string, clerkOrgId: string | null) {
  const db = createDb(process.env.DATABASE_URL!);

  // --- Happy path: Clerk has active org ---
  if (clerkOrgId) {
    const [org] = await db
      .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId })
      .from(orgs)
      .where(eq(orgs.clerkOrgId, clerkOrgId))
      .limit(1);
    if (org) {
      return { userId, clerkOrgId, orgRow: org };
    }
  }

  // --- Fallback: try to get org memberships from Clerk API ---
  try {
    const client = await clerkClient();
    const clerkMemberships = await client.users.getOrganizationMembershipList({ userId, limit: 10 });
    if (clerkMemberships.data.length > 0) {
      for (const m of clerkMemberships.data) {
        const clerkOrgIdFromMembership = m.organization.id;
        const [org] = await db
          .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId })
          .from(orgs)
          .where(eq(orgs.clerkOrgId, clerkOrgIdFromMembership))
          .limit(1);
        if (org) {
          return { userId, clerkOrgId: clerkOrgIdFromMembership, orgRow: org };
        }
      }
    }
  } catch {
    // Clerk API call failed — continue to DB fallback
  }

  // --- Final fallback: resolve org via DB membership, prefer real Clerk orgs ---
  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (dbUser) {
    const memberships = await db
      .select({ orgId: orgMemberships.orgId })
      .from(orgMemberships)
      .where(eq(orgMemberships.userId, dbUser.id));

    if (memberships.length > 0) {
      const orgIds = memberships.map((m) => m.orgId);
      const orgRows = await db
        .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId })
        .from(orgs)
        .where(inArray(orgs.id, orgIds));

      const preferred =
        orgRows.find((o) => o.clerkOrgId?.startsWith("org_")) ?? orgRows[0];

      if (preferred) {
        return { userId, clerkOrgId: clerkOrgId ?? null, orgRow: preferred };
      }
    }
  }

  return null;
}

export async function requireOrgAuth(): Promise<{
  userId: string;
  clerkOrgId: string | null;
  orgRow: { id: string; clerkOrgId: string | null };
}> {
  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId) redirect("/sign-in");

  const result = await resolveOrgRow(userId, clerkOrgId ?? null);
  if (!result) redirect("/sign-in");
  return result;
}

export async function requireOrgAuthApi(): Promise<{
  userId: string;
  clerkOrgId: string | null;
  orgRow: { id: string; clerkOrgId: string | null };
} | null> {
  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId) return null;
  return resolveOrgRow(userId, clerkOrgId ?? null);
}

