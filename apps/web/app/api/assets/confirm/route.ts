/**
 * POST /api/assets/confirm
 *
 * Clerk-authed endpoint (org users only).
 * Called after a successful PUT to R2.
 * Body: { clientId, key, filename, contentType, sizeBytes, source }
 * Returns: { asset }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, assets } from "@getpostflow/db";
import { buildPublicUrl } from "@/lib/r2";

function inferAssetType(mimeType: string): "image" | "video" | "document" | "audio" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireOrgAuthWithRoleApi();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      clientId?: string;
      key: string;
      filename: string;
      contentType: string;
      sizeBytes?: number;
      source?: string;
    };

    if (!body.key || !body.filename || !body.contentType) {
      return NextResponse.json(
        { error: "key, filename, and contentType are required" },
        { status: 400 }
      );
    }

    if (body.clientId) {
      await requireClientAccess({ dbUserId: auth.dbUserId, clientId: body.clientId, orgId: auth.orgRow.id, role: auth.role });
    }

    const db = createDb(process.env.DATABASE_URL!);
    const assetType = inferAssetType(body.contentType);

    const [asset] = await db
      .insert(assets)
      .values({
        orgId: auth.orgRow.id,
        clientId: body.clientId ?? null,
        type: assetType,
        kind: assetType,
        filename: body.filename,
        mimeType: body.contentType,
        sizeBytes: body.sizeBytes,
        storageKey: body.key,
        publicUrl: buildPublicUrl(body.key),
        source: body.source ?? "agency_upload",
        aiTags: [],
        tags: [],
      })
      .returning();

    return NextResponse.json({ asset });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unauthorized") || msg.includes("redirect") || msg.includes("Forbidden")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
