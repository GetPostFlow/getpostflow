import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createDb, orgs, clients, users, orgMemberships } from "@getpostflow/db";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  let org: { id: string } | undefined;

  // 1. Happy path: Clerk session has an active org
  if (orgId) {
    [org] = await db
      .select({ id: orgs.id })
      .from(orgs)
      .where(eq(orgs.clerkOrgId, orgId))
      .limit(1);
  }

  // 2. Fallback: use Clerk API for org memberships
  if (!org) {
    try {
      const client = await clerkClient();
      const clerkMemberships = await client.users.getOrganizationMembershipList({ userId, limit: 10 });
      for (const m of clerkMemberships.data) {
        const mOrgId = m.organization.id;
        const [found] = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.clerkOrgId, mOrgId)).limit(1);
        if (found) { org = found; break; }
      }
    } catch {
      // continue
    }
  }

  // 3. Final fallback: DB memberships, prefer orgs with real Clerk org ID
  if (!org) {
    const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, userId)).limit(1);
    if (dbUser) {
      const memberships = await db.select({ orgId: orgMemberships.orgId }).from(orgMemberships).where(eq(orgMemberships.userId, dbUser.id));
      if (memberships.length > 0) {
        const orgIds = memberships.map((m) => m.orgId);
        const orgRows = await db.select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId }).from(orgs).where(inArray(orgs.id, orgIds));
        const preferred = orgRows.find((o) => o.clerkOrgId?.startsWith("org_")) ?? orgRows[0];
        if (preferred) org = preferred;
      }
    }
  }

  if (!org) {
    return NextResponse.json({ clients: [] });
  }

  const rows = await db
    .select({
      id: clients.id,
      slug: clients.slug,
      name: clients.name,
      status: clients.status,
      industry: clients.industry,
      primaryContactName: clients.primaryContactName,
      primaryContactEmail: clients.primaryContactEmail,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.orgId, org.id))
    .orderBy(clients.createdAt);

  return NextResponse.json({ clients: rows });
}
