import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, conversations, conversationNotes } from "@getpostflow/db";
import { eq } from "drizzle-orm";

/**
 * POST /api/inbox/conversations/[id]/note
 *
 * Body: { content: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json()) as { content?: string };

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await requireClientAccess({
    dbUserId: auth.dbUserId,
    clientId: conv.clientId,
    orgId: auth.orgRow.id,
    role: auth.role,
  });

  const [note] = await db
    .insert(conversationNotes)
    .values({
      conversationId: id,
      userId: auth.dbUserId,
      content: body.content.trim(),
    })
    .returning();

  return NextResponse.json({
    note: {
      ...note,
      createdAt: note!.createdAt.toISOString(),
    },
  });
}
