/**
 * DELETE /api/assets/[id]
 *
 * Clerk-authed. Deletes from R2 and DB.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, assets } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import { deleteObject, R2_CONFIGURED } from "@/lib/r2";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireOrgAuthWithRoleApi();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = createDb(process.env.DATABASE_URL!);

    const [asset] = await db
      .select({ storageKey: assets.storageKey, clientId: assets.clientId })
      .from(assets)
      .where(and(eq(assets.id, id), eq(assets.orgId, auth.orgRow.id)))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (asset.clientId) {
      await requireClientAccess({ dbUserId: auth.dbUserId, clientId: asset.clientId, orgId: auth.orgRow.id, role: auth.role });
    }

    if (R2_CONFIGURED && asset.storageKey) {
      try {
        await deleteObject(asset.storageKey);
      } catch {
        // Log but don't block DB delete
      }
    }

    await db.delete(assets).where(and(eq(assets.id, id), eq(assets.orgId, auth.orgRow.id)));

    return NextResponse.json({ deleted: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unauthorized") || msg.includes("redirect") || msg.includes("Forbidden")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
