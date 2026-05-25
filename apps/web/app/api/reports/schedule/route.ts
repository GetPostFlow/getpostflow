import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, reportSchedules } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/reports/schedule
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
  const [schedule] = await db
    .select()
    .from(reportSchedules)
    .where(and(eq(reportSchedules.clientId, clientId), eq(reportSchedules.orgId, auth.orgRow.id)))
    .limit(1);

  return NextResponse.json({
    schedule: schedule
      ? {
          ...schedule,
          createdAt: schedule.createdAt.toISOString(),
          updatedAt: schedule.updatedAt.toISOString(),
          lastSentAt: schedule.lastSentAt?.toISOString() ?? null,
          nextSendAt: schedule.nextSendAt?.toISOString() ?? null,
        }
      : null,
  });
}

/**
 * POST /api/reports/schedule
 *
 * Body: { clientId, frequency, dayValue, recipientEmails[], isActive? }
 */
export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    clientId: string;
    frequency: "weekly" | "biweekly" | "monthly";
    dayValue: number;
    recipientEmails: string[];
    isActive?: boolean;
  };

  if (!body.clientId || !body.frequency || body.dayValue == null) {
    return NextResponse.json({ error: "clientId, frequency, and dayValue are required" }, { status: 400 });
  }

  await requireClientAccess({ dbUserId: auth.dbUserId, clientId: body.clientId, orgId: auth.orgRow.id, role: auth.role });

  const db = createDb(process.env.DATABASE_URL!);
  const [existing] = await db
    .select()
    .from(reportSchedules)
    .where(and(eq(reportSchedules.clientId, body.clientId), eq(reportSchedules.orgId, auth.orgRow.id)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(reportSchedules)
      .set({
        frequency: body.frequency,
        dayValue: body.dayValue,
        recipientEmails: body.recipientEmails ?? existing.recipientEmails,
        isActive: body.isActive ?? existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(reportSchedules.id, existing.id))
      .returning();
    return NextResponse.json({
      schedule: {
        ...updated,
        createdAt: updated!.createdAt.toISOString(),
        updatedAt: updated!.updatedAt.toISOString(),
      },
    });
  }

  const [schedule] = await db
    .insert(reportSchedules)
    .values({
      clientId: body.clientId,
      orgId: auth.orgRow.id,
      frequency: body.frequency,
      dayValue: body.dayValue,
      recipientEmails: body.recipientEmails ?? [],
      isActive: body.isActive ?? true,
    })
    .returning();

  return NextResponse.json({
    schedule: {
      ...schedule,
      createdAt: schedule!.createdAt.toISOString(),
      updatedAt: schedule!.updatedAt.toISOString(),
    },
  });
}
