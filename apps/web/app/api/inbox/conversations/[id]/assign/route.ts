import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess, isAdminRole } from "@/lib/auth-org";
import { createDb, conversations, inboxAssignments } from "@getpostflow/db";
import { eq } from "drizzle-orm";

/**
 * POST /api/inbox/conversations/[id]/assign
 *
 * Body: { userId: string | null }
 *
 * Assigns conversation to a team member. userId=null unassigns.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json()) as { userId?: string | null };

  const db = createDb(process.env.DATABASE_URL!);

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await requireClientAccess({
    dbUserId: auth.dbUserId,
    clientId: conv.clientId,
    orgId: auth.orgRow.id,
    role: auth.role,
  });

  const assigneeId = body.userId ?? null;

  await db
    .update(conversations)
    .set({ assignedToUserId: assigneeId })
    .where(eq(conversations.id, id));

  if (assigneeId) {
    await db.insert(inboxAssignments).values({
      conversationId: id,
      userId: assigneeId,
    });
  }

  return NextResponse.json({ assignedToUserId: assigneeId });
}
