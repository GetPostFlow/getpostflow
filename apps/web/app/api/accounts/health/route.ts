import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";
import { createDb, socialAccounts } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/accounts/health
 *
 * Checks all connected accounts for the org and returns status per account.
 */
export async function GET(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createDb(process.env.DATABASE_URL!);
  const rows = await db
    .select()
    .from(socialAccounts)
    .where(and(eq(socialAccounts.orgId, auth.orgRow.id), eq(socialAccounts.isActive, true)));

  const now = Date.now();
  const health = rows.map((r) => {
    const expired = r.tokenExpiresAt ? new Date(r.tokenExpiresAt).getTime() < now : false;
    const stale = r.lastSyncedAt ? now - new Date(r.lastSyncedAt).getTime() > 24 * 60 * 60 * 1000 : true;
    return {
      id: r.id,
      platform: r.platform,
      accountName: r.accountName,
      status: expired ? "expired" : stale ? "stale" : "healthy",
      lastSyncedAt: r.lastSyncedAt?.toISOString() ?? null,
      tokenExpiresAt: r.tokenExpiresAt?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ health });
}
