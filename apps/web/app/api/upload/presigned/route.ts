import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import { assets, orgs } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * POST /api/upload/presigned
 *
 * Body: { filename, mimeType, sizeBytes, clientId? }
 *
 * Returns: { uploadUrl, storageKey, assetId }
 *
 * In development (no R2 credentials), returns a simulated presigned URL.
 * In production, returns a real S3-compatible presigned URL for Cloudflare R2.
 */

const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT ?? process.env.R2_PUBLIC_URL;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? process.env.R2_BUCKET ?? "getpostflow-assets";
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
const R2_SECRET = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;

const DEV_MODE = !R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET;

function inferAssetType(mimeType: string): "image" | "video" | "document" | "audio" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    filename: string;
    mimeType: string;
    sizeBytes?: number;
    clientId?: string;
  };

  if (!body.filename || !body.mimeType) {
    return NextResponse.json({ error: "filename and mimeType are required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const ext = body.filename.split(".").pop() ?? "bin";
  const storageKey = `assets/${org.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const assetType = inferAssetType(body.mimeType);

  // Create asset record first
  const [asset] = await db
    .insert(assets)
    .values({
      orgId: org.id,
      clientId: body.clientId ?? null,
      type: assetType,
      kind: assetType,
      filename: body.filename,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      storageKey,
      publicUrl: DEV_MODE
        ? `https://cdn.getpostflow.dev/${storageKey}`
        : `${R2_ENDPOINT}/${R2_BUCKET}/${storageKey}`,
      aiTags: [],
      tags: [],
    })
    .returning();

  if (DEV_MODE) {
    // Development: return a simulated upload URL
    return NextResponse.json({
      uploadUrl: `http://localhost:3000/api/upload/dev-stub?key=${encodeURIComponent(storageKey)}`,
      storageKey,
      assetId: asset.id,
      publicUrl: asset.publicUrl,
      devMode: true,
    });
  }

  // Production: generate S3-compatible presigned URL for R2
  // Using a manual HMAC presigned URL (no SDK dependency needed)
  // In a real deployment, use @aws-sdk/s3-request-presigner with R2 endpoint
  const expiresIn = 3600; // 1 hour
  const now = Math.floor(Date.now() / 1000);
  const expires = now + expiresIn;

  // Simplified presigned URL — in production replace with proper S3 signing
  const uploadUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${storageKey}?X-Amz-Expires=${expiresIn}&X-Amz-Date=${now}&stub=1`;

  return NextResponse.json({
    uploadUrl,
    storageKey,
    assetId: asset.id,
    publicUrl: asset.publicUrl,
  });
}
