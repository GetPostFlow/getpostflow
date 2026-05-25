import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi } from "@/lib/auth-org";
import { createDb, analyticsAggregates, clients, contentItems, conversations, messages } from "@getpostflow/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * GET /api/analytics/dashboard
 *
 * Agency-wide overview metrics.
 */
export async function GET(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const now = new Date();
  let fromDate: Date;
  if (range === "7d") fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (range === "90d") fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  else fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fromStr = fromDate.toISOString().slice(0, 10);

  const db = createDb(process.env.DATABASE_URL!);

  const clientCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(eq(clients.orgId, auth.orgRow.id));

  const postCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(contentItems)
    .where(and(eq(contentItems.orgId, auth.orgRow.id), gte(contentItems.createdAt, fromDate)));

  const aggRows = await db
    .select()
    .from(analyticsAggregates)
    .where(and(eq(analyticsAggregates.clientId, auth.orgRow.id), gte(analyticsAggregates.date, fromStr)));

  const totalEngagements = aggRows.reduce((sum, r) => sum + ((r.metrics as Record<string, number>)?.engagements ?? 0), 0);
  const totalReach = aggRows.reduce((sum, r) => sum + ((r.metrics as Record<string, number>)?.reach ?? 0), 0);
  const engagementRate = totalReach > 0 ? totalEngagements / totalReach : 0;

  const convCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(conversations)
    .where(and(eq(conversations.clientId, auth.orgRow.id), gte(conversations.createdAt, fromDate)));

  return NextResponse.json({
    orgId: auth.orgRow.id,
    range,
    totalClients: clientCount[0]?.count ?? 0,
    totalPosts: postCount[0]?.count ?? 0,
    engagementRate: Number(engagementRate.toFixed(4)),
    totalConversations: convCount[0]?.count ?? 0,
    totalsByPlatform: aggRows.reduce((acc, r) => {
      const m = r.metrics as Record<string, number>;
      if (!acc[r.platform]) acc[r.platform] = { impressions: 0, reach: 0, engagements: 0 };
      acc[r.platform].impressions += m.impressions ?? 0;
      acc[r.platform].reach += m.reach ?? 0;
      acc[r.platform].engagements += m.engagements ?? 0;
      return acc;
    }, {} as Record<string, { impressions: number; reach: number; engagements: number }>),
  });
}
