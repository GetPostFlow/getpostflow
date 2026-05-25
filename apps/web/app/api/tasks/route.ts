import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, tasks } from "@getpostflow/db";

export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    title: string;
    description?: string;
    clientId?: string | null;
    priority?: string;
    dueDate?: string | null;
  };

  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  if (body.clientId) {
    await requireClientAccess({ dbUserId: auth.dbUserId, clientId: body.clientId, orgId: auth.orgRow.id, role: auth.role });
  }

  const db = createDb(process.env.DATABASE_URL!);
  const [task] = await db
    .insert(tasks)
    .values({
      title: body.title.trim(),
      description: body.description ?? null,
      clientId: body.clientId ?? null,
      priority: (body.priority as "low" | "medium" | "high") ?? "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: "todo",
    })
    .returning();

  return NextResponse.json({
    task: {
      id: task!.id,
      title: task!.title,
      description: task!.description ?? "",
      clientId: task!.clientId,
      status: task!.status,
      priority: task!.priority,
      dueDate: task!.dueDate?.toISOString() ?? null,
      createdAt: task!.createdAt.toISOString(),
      completedAt: task!.completedAt?.toISOString() ?? null,
    },
  });
}
