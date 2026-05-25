import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, isAdminRole } from "@/lib/auth-org";
import { createDb, socialAccounts } from "@getpostflow/db";
import { eq } from "drizzle-orm";

/**
 * POST /api/accounts/[id]/disconnect
 *
 * Revokes / deletes a connected social account.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(auth.role)) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const db = createDb(process.env.DATABASE_URL!);

  const [existing] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(socialAccounts).where(eq(socialAccounts.id, id));

  return NextResponse.json({ disconnected: true });
}
