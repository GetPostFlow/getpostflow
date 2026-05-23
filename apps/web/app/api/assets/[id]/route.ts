/**
 * DELETE /api/assets/[id]
 *
 * Clerk-authed. Deletes from R2 and DB.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuth } from "@/lib/auth-org";
import { createDb, assets } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import { deleteObject, R2_CONFIGURED } from "@/lib/r2";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { orgRow: org } = await requireOrgAuth();

    const db = createDb(process.env.DATABASE_URL!);

    const [asset] = await db
      .select({ storageKey: assets.storageKey })
      .from(assets)
      .where(and(eq(assets.id, id), eq(assets.orgId, org.id)))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (R2_CONFIGURED && asset.storageKey) {
      try {
        await deleteObject(asset.storageKey);
      } catch {
        // Log but don't block DB delete
      }
    }

    await db.delete(assets).where(and(eq(assets.id, id), eq(assets.orgId, org.id)));

    return NextResponse.json({ deleted: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unauthorized") || msg.includes("redirect")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
