/**
 * GET /api/analytics/dashboard
 *
 * Returns aggregated metrics for dashboard charts.
 *
 * Query params:
 *   clientId  — required
 *   range     — "7d" | "30d" | "90d" | custom (default "30d")
 *   from      — ISO date string (used when range=custom)
 *   to        — ISO date string (used when range=custom)
 *   platform  — optional, filter to specific platform
 */

import { NextResponse } from "next/server";

function rangeToDateStrings(range: string, from?: string, to?: string) {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  let fromDate: Date;

  if (range === "custom" && from) {
    fromDate = new Date(from);
  } else if (range === "7d") {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "90d") {
    fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else {
    // default 30d
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return {
    fromStr: fromDate.toISOString().slice(0, 10),
    toStr: toDate.toISOString().slice(0, 10),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const range = searchParams.get("range") ?? "30d";
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const platformFilter = searchParams.get("platform") ?? undefined;

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const { fromStr, toStr } = rangeToDateStrings(range, from, to);

  try {
    const { createDb, analyticsAggregates } = await import("@getpostflow/db");
    const { and, eq, gte, lte } = await import("drizzle-orm");
    const db = createDb();

    let query = db
      .select()
      .from(analyticsAggregates)
      .where(
        and(
          eq(analyticsAggregates.clientId, clientId),
          gte(analyticsAggregates.date, fromStr),
          lte(analyticsAggregates.date, toStr)
        )
      )
      .$dynamic();

    if (platformFilter) {
      query = query.where(eq(analyticsAggregates.platform, platformFilter));
    }

    const rows = await query;

    // Shape: { byDate: Record<string, Record<platform, metrics>>, totals: Record<platform, metrics> }
    const byDate: Record<string, Record<string, Record<string, number>>> = {};
    const totals: Record<string, Record<string, number>> = {};

    for (const row of rows) {
      if (!byDate[row.date]) byDate[row.date] = {};
      byDate[row.date][row.platform] = row.metrics as Record<string, number>;

      if (!totals[row.platform]) totals[row.platform] = {};
      const m = row.metrics as Record<string, number>;
      for (const [k, v] of Object.entries(m)) {
        totals[row.platform][k] = (totals[row.platform][k] ?? 0) + v;
      }
    }

    return NextResponse.json({
      clientId,
      range,
      from: fromStr,
      to: toStr,
      byDate,
      totals,
    });
  } catch (err) {
    console.error("[analytics/dashboard] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
