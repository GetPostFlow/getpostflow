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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contentItemId } = await params;
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";

  try {
    const { createDb, analyticsEvents, publishedContent } = await import("@getpostflow/db");
    const { eq } = await import("drizzle-orm");
    const db = createDb();

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
