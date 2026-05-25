/**
 * POST /api/assets/upload
 *
 * Server-side proxy upload for Clerk-authed users.
 * Accepts multipart/form-data with fields: file, clientId, source.
 * Uploads directly to R2 from the server (avoids presigned PUT permissions issue).
 * Returns: { asset }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, assets } from "@getpostflow/db";
import { buildStorageKey, buildPublicUrl, R2_CONFIGURED, getClient } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const maxDuration = 30;

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("clientId") as string | null;
    const source = (formData.get("source") as string) ?? "agency_upload";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (clientId) {
      await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });
    }

    const key = buildStorageKey(auth.orgRow.id, file.name);
    const contentType = file.type || "application/octet-stream";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (R2_CONFIGURED) {
      const r2 = getClient();
      try {
        await r2.send(
          new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "getpostflow",
            Key: key,
            ContentType: contentType,
            Body: buffer,
          })
        );
      } catch (r2Err) {
        console.error("[R2 upload error]", r2Err instanceof Error ? r2Err.message : r2Err);
      }
    }

    const db = createDb(process.env.DATABASE_URL!);
    const assetType = inferAssetType(contentType);

    const [asset] = await db
      .insert(assets)
      .values({
        orgId: auth.orgRow.id,
        clientId: clientId ?? null,
        type: assetType,
        kind: assetType,
        filename: file.name,
        mimeType: contentType,
        sizeBytes: buffer.length,
        storageKey: key,
        publicUrl: buildPublicUrl(key),
        source,
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
