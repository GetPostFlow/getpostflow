/**
 * POST /api/portal/assets/confirm
 *
 * Portal-authed (token-based, no Clerk).
 * Body: { token, orgSlug, clientSlug, key, filename, contentType, sizeBytes, source }
 * Returns: { asset }
 */
import { NextRequest, NextResponse } from "next/server";
import { validatePortalToken } from "@/app/portal/_portal-helpers";
import { createDb, assets } from "@getpostflow/db";
import { buildPublicUrl } from "@/lib/r2";

function inferAssetType(mimeType: string): "image" | "video" | "document" | "audio" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    token: string;
    orgSlug: string;
    clientSlug: string;
    key: string;
    filename: string;
    contentType: string;
    sizeBytes?: number;
    source?: string;
  };

  if (!body.token || !body.orgSlug || !body.clientSlug || !body.key || !body.filename || !body.contentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validated = await validatePortalToken(body.token, body.orgSlug, body.clientSlug);
  if (!validated) {
    return NextResponse.json({ error: "Invalid or expired portal token" }, { status: 401 });
  }

  const { org, client } = validated;
  const db = createDb(process.env.DATABASE_URL!);
  const assetType = inferAssetType(body.contentType);

  const [asset] = await db
    .insert(assets)
    .values({
      orgId: org.id,
      clientId: client.id,
      type: assetType,
      kind: assetType,
      filename: body.filename,
      mimeType: body.contentType,
      sizeBytes: body.sizeBytes,
      storageKey: body.key,
      publicUrl: buildPublicUrl(body.key),
      source: body.source ?? "portal_upload",
      aiTags: [],
      tags: [],
    })
    .returning();

  return NextResponse.json({ asset });
}
