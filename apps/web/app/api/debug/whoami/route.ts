import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createDb, orgs, clients, users, orgMemberships } from "@getpostflow/db";
import { eq, inArray } from "drizzle-orm";

/**
 * GET /api/debug/whoami
 * Returns the active Clerk auth context + matching DB org + client count.
 * Gated behind auth — unauthenticated callers get 401.
 */
export async function GET() {
  const { userId, orgId, sessionId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  let org: { id: string; clerkOrgId: string | null; name: string } | undefined;
  let resolvedVia = "unknown";

  // 1. Happy path: Clerk session has active orgId
  if (orgId) {
    [org] = await db
      .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.clerkOrgId, orgId))
      .limit(1);
    if (org) resolvedVia = "clerk-session-orgId";
  }

  // 2. Fallback: use Clerk API to get user's org memberships
  if (!org) {
    try {
      const client = await clerkClient();
      const clerkMemberships = await client.users.getOrganizationMembershipList({ userId, limit: 10 });
      for (const m of clerkMemberships.data) {
        const mOrgId = m.organization.id;
        const [found] = await db
          .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
          .from(orgs)
          .where(eq(orgs.clerkOrgId, mOrgId))
          .limit(1);
        if (found) {
          org = found;
          resolvedVia = "clerk-api-membership";
          break;
        }
      }
    } catch {
      // Clerk API unavailable — continue to DB fallback
    }
  }

  // 3. Final fallback: DB memberships, prefer org with real Clerk org ID
  if (!org) {
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
          .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
          .from(orgs)
          .where(inArray(orgs.id, orgIds));
        const preferred = orgRows.find((o) => o.clerkOrgId?.startsWith("org_")) ?? orgRows[0];
        if (preferred) {
          org = preferred;
          resolvedVia = "db-membership-fallback";
        }
      }
    }
  }

  const clientRows = org
    ? await db.select({ id: clients.id, name: clients.name, status: clients.status }).from(clients).where(eq(clients.orgId, org.id))
    : [];

  return NextResponse.json({
    clerkUserId: userId,
    clerkOrgId: orgId ?? null,
    sessionId: sessionId ?? null,
    dbOrg: org ?? null,
    clientCount: clientRows.length,
    clients: clientRows,
    note: `orgId resolved via ${resolvedVia}`,
  });
}
