/**
 * POST /api/webhooks/ayrshare
 *
 * Handles Ayrshare post status callbacks.
 * Ayrshare sends a POST request with a JSON body whenever a post's status changes
 * (published, failed, deleted).
 *
 * Signature verification:
 *   Ayrshare signs requests with an HMAC-SHA256 digest in the
 *   X-Ayrshare-Signature header: `sha256=<hex>`.
 *   We verify against AYRSHARE_WEBHOOK_SECRET.
 *
 * Docs: https://docs.ayrshare.com/rest-api/webhooks
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// ── Types ────────────────────────────────────────────────────────────────────

interface AyrshareWebhookPayload {
  /** Ayrshare post id */
  id: string;
  status: "success" | "error" | "deleted" | "scheduled" | string;
  platform: string;
  postUrl?: string;
  errors?: Array<{ platform: string; msg: string }>;
  postIds?: Array<{ platform: string; id: string; postUrl?: string }>;
  /** ISO 8601 */
  createdAt?: string;
  [key: string]: unknown;
}

// ── Signature verification ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const [prefix, digest] = signature.split("=");
  if (prefix !== "sha256" || !digest) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getDb() {
  const { createDb } = await import("@getpostflow/db");
  return createDb();
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const webhookSecret = process.env.AYRSHARE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[ayrshare-webhook] AYRSHARE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-ayrshare-signature");

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    console.warn("[ayrshare-webhook] Invalid signature — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: AyrshareWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as AyrshareWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await handleAyrshareEvent(payload);
  } catch (err) {
    console.error("[ayrshare-webhook] Error processing event:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Event processing ──────────────────────────────────────────────────────────

async function handleAyrshareEvent(payload: AyrshareWebhookPayload): Promise<void> {
  const { publishedContent, contentItems, auditLogs } = await import("@getpostflow/db");
  const { eq } = await import("drizzle-orm");
  const db = await getDb();

  // Find the published_content row matching this Ayrshare post id
  const [record] = await db
    .select()
    .from(publishedContent)
    .where(eq(publishedContent.platformPostId, payload.id))
    .limit(1);

  if (!record) {
    // Could be a post not tracked by us (e.g. posted directly via Ayrshare dashboard)
    console.log(`[ayrshare-webhook] No record for platformPostId=${payload.id} — skipping`);
    return;
  }

  const status = payload.status;

  if (status === "success") {
    // Update published_url if we now have it
    const postUrl =
      payload.postUrl ??
      payload.postIds?.find((p) => p.platform === record.platform)?.postUrl;

    if (postUrl) {
      await db
        .update(publishedContent)
        .set({ platformPostUrl: postUrl })
        .where(eq(publishedContent.id, record.id));
    }

    // Ensure ContentItem is marked published
    await db
      .update(contentItems)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(contentItems.id, record.contentItemId));

  } else if (status === "error") {
    // Mark ContentItem failed
    await db
      .update(contentItems)
      .set({ status: "failed" })
      .where(eq(contentItems.id, record.contentItemId));

    console.warn(
      `[ayrshare-webhook] Post ${payload.id} failed on ${record.platform}:`,
      payload.errors
    );
  } else if (status === "deleted") {
    // Archive the content item
    await db
      .update(contentItems)
      .set({ status: "archived" })
      .where(eq(contentItems.id, record.contentItemId));
  }

  // Audit log every event
  await db.insert(auditLogs).values({
    clientId: record.clientId,
    action: `ayrshare_webhook.${status}`,
    entityType: "published_content",
    entityId: record.id,
    payload: payload as Record<string, unknown>,
  });
}
