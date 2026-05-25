import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, analyticsAggregates, analyticsEvents, contentItems, publishedContent, conversations, messages, leads, funnels } from "@getpostflow/db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

function rangeToDateStrings(range: string, from?: string, to?: string) {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  let fromDate: Date;
  if (range === "custom" && from) fromDate = new Date(from);
  else if (range === "7d") fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (range === "90d") fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  else fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { fromStr: fromDate.toISOString().slice(0, 10), toStr: toDate.toISOString().slice(0, 10) };
}

/**
 * GET /api/analytics/clients/[id]
 *
 * Per-client analytics dashboard data.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clientId } = await params;

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const platformFilter = searchParams.get("platform") ?? undefined;

  const { fromStr, toStr } = rangeToDateStrings(range, from, to);
  const db = createDb(process.env.DATABASE_URL!);

  // Aggregates
  let aggQuery = db
    .select()
    .from(analyticsAggregates)
    .where(and(eq(analyticsAggregates.clientId, clientId), gte(analyticsAggregates.date, fromStr), lte(analyticsAggregates.date, toStr)))
    .$dynamic();
  if (platformFilter) aggQuery = aggQuery.where(eq(analyticsAggregates.platform, platformFilter));
  const aggRows = await aggQuery;

  const byDate: Record<string, Record<string, Record<string, number>>> = {};
  const totals: Record<string, Record<string, number>> = {};
  for (const row of aggRows) {
    if (!byDate[row.date]) byDate[row.date] = {};
    byDate[row.date][row.platform] = row.metrics as Record<string, number>;
    if (!totals[row.platform]) totals[row.platform] = {};
    const m = row.metrics as Record<string, number>;
    for (const [k, v] of Object.entries(m)) totals[row.platform][k] = (totals[row.platform][k] ?? 0) + v;
  }

  // Content performance
  const contentRows = await db
    .select({ id: contentItems.id, title: contentItems.title, platform: contentItems.platform, status: contentItems.status, publishedAt: contentItems.publishedAt })
    .from(contentItems)
    .where(and(eq(contentItems.clientId, clientId), gte(contentItems.createdAt, new Date(fromStr)), lte(contentItems.createdAt, new Date(toStr))))
    .orderBy(desc(contentItems.createdAt))
    .limit(20);

  // Community metrics
  const convCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(conversations)
    .where(and(eq(conversations.clientId, clientId), gte(conversations.createdAt, new Date(fromStr))));
  const msgResolved = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.status, "escalated"), gte(messages.createdAt, new Date(fromStr))));

  // Funnel
  const funnelRows = await db.select().from(funnels).where(eq(funnels.clientId, clientId)).limit(1);
  const leadRows = await db
    .select({ count: sql<number>`count(*)`, status: leads.status })
    .from(leads)
    .where(eq(leads.clientId, clientId))
    .groupBy(leads.status);

  return NextResponse.json({
    clientId,
    range,
    from: fromStr,
    to: toStr,
    byDate,
    totals,
    content: contentRows.map((r) => ({ ...r, publishedAt: r.publishedAt?.toISOString() ?? null })),
    community: {
      totalConversations: convCount[0]?.count ?? 0,
      escalatedMessages: msgResolved[0]?.count ?? 0,
    },
    funnel: funnelRows[0] ?? null,
    leads: leadRows,
  });
}
