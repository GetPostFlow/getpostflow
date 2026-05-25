import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, tasks } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { status?: string };

  const db = createDb(process.env.DATABASE_URL!);

  // Verify task exists and resolve clientId for access check
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.clientId) {
    await requireClientAccess({ dbUserId: auth.dbUserId, clientId: existing.clientId, orgId: auth.orgRow.id, role: auth.role });
  }

  const [task] = await db
    .update(tasks)
    .set({
      status: body.status as "todo" | "in_progress" | "done",
      completedAt: body.status === "done" ? new Date() : null,
    })
    .where(eq(tasks.id, id))
    .returning();

  return NextResponse.json({ task });
}
