import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, conversations, messages, conversationNotes, users } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/inbox/conversations/[id]
 *
 * Returns conversation detail with messages, notes, and assignment history.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const db = createDb(process.env.DATABASE_URL!);

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await requireClientAccess({
    dbUserId: auth.dbUserId,
    clientId: conv.clientId,
    orgId: auth.orgRow.id,
    role: auth.role,
  });

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const notes = await db
    .select({
      id: conversationNotes.id,
      userId: conversationNotes.userId,
      content: conversationNotes.content,
      createdAt: conversationNotes.createdAt,
      userName: users.name,
    })
    .from(conversationNotes)
    .leftJoin(users, eq(conversationNotes.userId, users.id))
    .where(eq(conversationNotes.conversationId, id))
    .orderBy(desc(conversationNotes.createdAt));

  // Mark unread inbound messages as read
  await db
    .update(messages)
    .set({ status: "read" })
    .where(and(eq(messages.conversationId, id), eq(messages.direction, "inbound"), eq(messages.status, "unread")));

  return NextResponse.json({
    conversation: {
      ...conv,
      lastMessageAt: conv.lastMessageAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
    },
    messages: msgs.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    notes: notes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}
