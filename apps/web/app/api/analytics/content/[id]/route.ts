/**
 * GET /api/analytics/content/[id]
 *
 * Per-content-item performance across all platforms.
 *
 * Query params:
 *   range  — "7d" | "30d" | "90d" | custom (default "30d")
 *   from   — ISO date string (range=custom)
 *   to     — ISO date string (range=custom)
 */

import { NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: contentItemId } = await params;
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";

  try {
    const { createDb, analyticsEvents, publishedContent, contentItems } = await import("@getpostflow/db");
    const { eq } = await import("drizzle-orm");
    const db = createDb();

    // Verify content item exists and resolve clientId
    const [contentItem] = await db.select({ clientId: contentItems.clientId }).from(contentItems).where(eq(contentItems.id, contentItemId)).limit(1);
    if (!contentItem) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (contentItem.clientId) {
      await requireClientAccess({ dbUserId: auth.dbUserId, clientId: contentItem.clientId, orgId: auth.orgRow.id, role: auth.role });
    }

    // Load published records for this content item
    const published = await db
      .select()
      .from(publishedContent)
      .where(eq(publishedContent.contentItemId, contentItemId));

    // Load all metric events for this content item
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.contentItemId, contentItemId));

    // Aggregate by platform + metricType
    const byPlatform: Record<string, Record<string, number>> = {};
    for (const e of events) {
      if (!byPlatform[e.platform]) byPlatform[e.platform] = {};
      byPlatform[e.platform][e.metricType] =
        (byPlatform[e.platform][e.metricType] ?? 0) + e.value;
    }

    return NextResponse.json({
      contentItemId,
      range,
      publishedOn: published.map((p) => ({
        platform: p.platform,
        platformPostId: p.platformPostId,
        platformPostUrl: p.platformPostUrl,
        publishedAt: p.publishedAt,
      })),
      metrics: byPlatform,
    });
  } catch (err) {
    console.error(`[analytics/content/${contentItemId}] Error:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
