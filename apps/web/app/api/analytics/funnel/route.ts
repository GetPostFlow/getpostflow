import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, funnels, leads } from "@getpostflow/db";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/analytics/funnel
 *
 * Query: clientId (required)
 */
export async function GET(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId, orgId: auth.orgRow.id, role: auth.role });

  const db = createDb(process.env.DATABASE_URL!);

  const funnelRows = await db.select().from(funnels).where(eq(funnels.clientId, clientId)).limit(1);
  const leadRows = await db
    .select({ count: sql<number>`count(*)`, status: leads.status })
    .from(leads)
    .where(eq(leads.clientId, clientId))
    .groupBy(leads.status);

  const counts: Record<string, number> = {};
  for (const r of leadRows) counts[r.status] = r.count;

  const awareness = counts["new"] ?? 0;
  const interest = counts["contacted"] ?? 0;
  const conversion = counts["qualified"] ?? 0;
  const total = awareness + interest + conversion + (counts["lost"] ?? 0);

  return NextResponse.json({
    clientId,
    funnel: funnelRows[0] ?? null,
    stages: [
      { name: "Awareness", count: awareness, rate: total > 0 ? awareness / total : 0 },
      { name: "Interest", count: interest, rate: total > 0 ? interest / total : 0 },
      { name: "Conversion", count: conversion, rate: total > 0 ? conversion / total : 0 },
    ],
    totals: { total, ...counts },
  });
}
