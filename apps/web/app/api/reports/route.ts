import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, reports, reportSchedules } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/reports
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
  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.clientId, clientId), eq(reports.orgId, auth.orgRow.id)))
    .orderBy(desc(reports.createdAt))
    .limit(50);

  return NextResponse.json({
    reports: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      sentAt: r.sentAt?.toISOString() ?? null,
    })),
  });
}

/**
 * POST /api/reports/generate
 *
 * Body: { clientId, periodStart, periodEnd, type? }
 */
export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { clientId: string; periodStart: string; periodEnd: string; type?: string };
  if (!body.clientId || !body.periodStart || !body.periodEnd) {
    return NextResponse.json({ error: "clientId, periodStart, periodEnd are required" }, { status: 400 });
  }

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId: body.clientId, orgId: auth.orgRow.id, role: auth.role });

  const db = createDb(process.env.DATABASE_URL!);
  const [report] = await db
    .insert(reports)
    .values({
      clientId: body.clientId,
      orgId: auth.orgRow.id,
      type: body.type ?? "ondemand",
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      status: "ready",
      summaryPayload: {},
    })
    .returning();

  return NextResponse.json({
    report: {
      ...report,
      createdAt: report!.createdAt.toISOString(),
    },
  });
}
