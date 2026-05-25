import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { createDb, conversations, messages } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { generateSuggestedReply, classifySentiment } from "@getpostflow/social";

/**
 * POST /api/inbox/conversations/[id]/reply
 *
 * Body: { content: string }
 *
 * Stores outbound message. In production this would also call the platform API.
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

  // Reddit block
  if (conv.platform === "reddit") {
    return NextResponse.json({ error: "Reddit replies are not supported" }, { status: 400 });
  }

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId: id,
      direction: "outbound",
      content: body.content.trim(),
      senderHandle: null,
      status: "replied",
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageAt: new Date(), status: "open" })
    .where(eq(conversations.id, id));

  return NextResponse.json({
    message: {
      ...msg,
      createdAt: msg!.createdAt.toISOString(),
    },
  });
}
