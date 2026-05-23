import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createDb, tasks } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { status?: string };

  const db = createDb(process.env.DATABASE_URL!);
  const [task] = await db
    .update(tasks)
    .set({
      status: body.status as "todo" | "in_progress" | "done",
      completedAt: body.status === "done" ? new Date() : null,
    })
    .where(eq(tasks.id, id))
    .returning();

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ task });
}
