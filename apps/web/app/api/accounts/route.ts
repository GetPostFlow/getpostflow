import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, isAdminRole } from "@/lib/auth-org";
import { createDb, socialAccounts, clientAssignments } from "@getpostflow/db";
import { eq, and, inArray } from "drizzle-orm";

/**
 * GET /api/accounts
 *
 * Returns connected social accounts for the org (optionally filtered by clientId).
 */
export async function GET(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dbUserId, orgRow: org, role } = auth;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const db = createDb(process.env.DATABASE_URL!);

  let accessibleClientIds: string[] | undefined;
  if (!isAdminRole(role)) {
    const assignments = await db
      .select({ clientId: clientAssignments.clientId })
      .from(clientAssignments)
      .where(and(eq(clientAssignments.orgId, org.id), eq(clientAssignments.userId, dbUserId)));
    accessibleClientIds = assignments.map((a) => a.clientId);
    if (accessibleClientIds.length === 0) {
      return NextResponse.json({ accounts: [] });
    }
  }

  const conditions = [eq(socialAccounts.orgId, org.id)];
  if (clientId) {
    conditions.push(eq(socialAccounts.clientId, clientId));
  }
  if (accessibleClientIds) {
    conditions.push(inArray(socialAccounts.clientId, accessibleClientIds));
  }

  const rows = await db.select().from(socialAccounts).where(and(...conditions)).orderBy(socialAccounts.createdAt);

  return NextResponse.json({
    accounts: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      tokenExpiresAt: r.tokenExpiresAt?.toISOString() ?? null,
      lastSyncedAt: r.lastSyncedAt?.toISOString() ?? null,
    })),
  });
}
