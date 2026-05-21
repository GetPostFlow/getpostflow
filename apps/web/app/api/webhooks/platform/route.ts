/**
 * POST /api/webhooks/platform
 *
 * Placeholder for direct platform API webhooks.
 * This endpoint will be wired up per-platform as direct API approvals
 * come through and connectors are migrated away from Ayrshare.
 *
 * Currently: accepts inbound events, logs them, and returns 200.
 * Future: route by X-Platform header to per-platform handlers.
 */

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const platform = req.headers.get("x-platform") ?? "unknown";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  // Log for observability — will be replaced with per-platform routing
  console.log(`[platform-webhook] Received event platform=${platform}`, body);

  // TODO(Phase 5): route to per-platform handler based on `platform` header
  // e.g. facebook → verifyMetaSignature + handleMetaWebhook(body)
  //      reddit   → handleRedditWebhook(body) [read-only; no auto-replies]

  return NextResponse.json({ received: true, platform });
}
