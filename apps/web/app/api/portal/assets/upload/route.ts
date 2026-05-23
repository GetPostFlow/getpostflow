/**
 * POST /api/portal/assets/upload
 *
 * Server-side proxy upload for portal (token-authed) users.
 * Accepts multipart/form-data with fields: file, token, orgSlug, clientSlug, source.
 * Returns: { asset }
 */
import { NextRequest, NextResponse } from "next/server";
import { validatePortalToken } from "@/app/portal/_portal-helpers";
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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const token = formData.get("token") as string;
    const orgSlug = formData.get("orgSlug") as string;
    const clientSlug = formData.get("clientSlug") as string;
    const source = (formData.get("source") as string) ?? "portal_upload";

    if (!token || !orgSlug || !clientSlug) {
      return NextResponse.json({ error: "Missing token, orgSlug, or clientSlug" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validated = await validatePortalToken(token, orgSlug, clientSlug);
    if (!validated) {
      return NextResponse.json({ error: "Invalid or expired portal token" }, { status: 401 });
    }

    const { org, client } = validated;
    const key = buildStorageKey(org.id, file.name);
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
        // R2 write error — continue to save DB record
        // Object may not be in R2, but record is preserved for retry/recovery
        console.error("[R2 upload error]", r2Err instanceof Error ? r2Err.message : r2Err);
      }
    }

    const db = createDb(process.env.DATABASE_URL!);
    const assetType = inferAssetType(contentType);

    const [asset] = await db
      .insert(assets)
      .values({
        orgId: org.id,
        clientId: client.id,
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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
