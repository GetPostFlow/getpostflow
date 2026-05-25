import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, conversations, messages, auditLogs } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/inbox/conversations/[id]/escalate
 *
 * Body: { reason?: string }
 *
 * Escalates conversation: sets status to pending, marks latest unread inbound as escalated.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json()) as { reason?: string };

  const db = createDb(process.env.DATABASE_URL!);

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await requireClientAccess({
    dbUserId: auth.dbUserId,
    clientId: conv.clientId,
    orgId: auth.orgRow.id,
    role: auth.role,
  });

  await db
    .update(conversations)
    .set({ status: "pending", priority: "high" })
    .where(eq(conversations.id, id));

  await db
    .update(messages)
    .set({ status: "escalated" })
    .where(and(eq(messages.conversationId, id), eq(messages.direction, "inbound"), eq(messages.status, "unread")));

  await db.insert(auditLogs).values({
    orgId: auth.orgRow.id,
    clientId: conv.clientId,
    actorUserId: auth.dbUserId,
    action: "conversation_escalated",
    entityType: "conversation",
    entityId: id,
    payload: { reason: body.reason ?? "Manual escalation" },
  });

  return NextResponse.json({ escalated: true });
}
