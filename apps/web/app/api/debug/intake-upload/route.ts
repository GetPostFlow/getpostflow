/**
 * POST /api/debug/intake-upload
 *
 * Simulates an intake form upload (no Clerk auth required, for render verification).
 * Body: multipart/form-data with file, clientId
 * Returns: { asset }
 */
import { NextRequest, NextResponse } from "next/server";
import { createDb, assets, clients } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { buildStorageKey, buildPublicUrl } from "@/lib/r2";

function inferAssetType(mimeType: string): "image" | "video" | "document" | "audio" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string;

  if (!file || !clientId) {
    return NextResponse.json({ error: "file and clientId required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);
  const contentType = file.type || "application/octet-stream";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const [client] = await db
    .select({ orgId: clients.orgId })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  const orgId = client?.orgId ?? "6ecd46e1-e1ce-4240-842b-a912a9587fb9";
  const key = buildStorageKey(orgId, file.name);

  const assetType = inferAssetType(contentType);

  const [asset] = await db
    .insert(assets)
    .values({
      orgId,
      clientId,
      type: assetType,
      kind: assetType,
      filename: file.name,
      mimeType: contentType,
      sizeBytes: buffer.length,
      storageKey: key,
      publicUrl: buildPublicUrl(key),
      source: "intake_upload",
      aiTags: [],
      tags: [],
    })
    .returning();

  return NextResponse.json({ asset });
}
