import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuthWithRoleApi, requireClientAccess, isAdminRole } from "@/lib/auth-org";
import { createDb, conversations, messages, inboxAssignments, conversationNotes, users, clients } from "@getpostflow/db";
import { eq, and, desc, like, sql, or } from "drizzle-orm";

/**
 * GET /api/inbox/conversations
 *
 * Query params:
 *   clientId   — optional, filter by client
 *   platform   — optional
 *   status     — optional (open | pending | resolved | spam)
 *   priority   — optional (low | normal | high | urgent)
 *   search     — optional, search participant handle or message content
 *   assignedTo — optional, "me" | "unassigned" | userId
 *   limit      — default 50
 *   offset     — default 0
 */
export async function GET(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dbUserId, orgRow: org, role } = auth;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const platform = searchParams.get("platform") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const assignedTo = searchParams.get("assignedTo") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const db = createDb(process.env.DATABASE_URL!);

  // Resolve accessible client IDs
  let accessibleClientIds: string[] | undefined;
  if (isAdminRole(role)) {
    if (clientId) accessibleClientIds = [clientId];
  } else {
    const assignments = await db
      .select({ clientId: clientAssignments.clientId })
      .from(clientAssignments)
      .where(and(eq(clientAssignments.orgId, org.id), eq(clientAssignments.userId, dbUserId)));
    accessibleClientIds = assignments.map((a) => a.clientId);
    if (clientId) {
      if (!accessibleClientIds.includes(clientId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      accessibleClientIds = [clientId];
    }
    if (accessibleClientIds.length === 0) {
      return NextResponse.json({ conversations: [], total: 0 });
    }
  }

  // Build conditions
  const conditions = [];
  if (accessibleClientIds) {
    conditions.push(inArray(conversations.clientId, accessibleClientIds));
  }
  if (platform) conditions.push(eq(conversations.platform, platform));
  if (status) conditions.push(eq(conversations.status, status as any));
  if (priority) conditions.push(eq(conversations.priority, priority as any));
  if (assignedTo === "unassigned") {
    conditions.push(sql`${conversations.assignedToUserId} IS NULL`);
  } else if (assignedTo === "me") {
    conditions.push(eq(conversations.assignedToUserId, dbUserId));
  } else if (assignedTo) {
    conditions.push(eq(conversations.assignedToUserId, assignedTo));
  }

  // Search across participant handle or message content
  let conversationIdsFromSearch: string[] | undefined;
  if (search) {
    const searchLike = `%${search}%`;
    const handleMatches = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          ...conditions,
          or(
            like(conversations.participantHandle, searchLike),
            like(conversations.platformConversationId, searchLike)
          )
        )
      );
    const msgMatches = await db
      .select({ conversationId: messages.conversationId })
      .from(messages)
      .where(like(messages.content, searchLike));
    const ids = new Set([
      ...handleMatches.map((r) => r.id),
      ...msgMatches.map((r) => r.conversationId),
    ]);
    conversationIdsFromSearch = Array.from(ids);
    if (conversationIdsFromSearch.length === 0) {
      return NextResponse.json({ conversations: [], total: 0 });
    }
  }

  if (conversationIdsFromSearch) {
    conditions.push(inArray(conversations.id, conversationIdsFromSearch));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(conversations)
    .where(whereClause);
  const total = totalRes[0]?.count ?? 0;

  const rows = await db
    .select()
    .from(conversations)
    .where(whereClause)
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit)
    .offset(offset);

  // Enrich with unread count and last message preview
  const convIds = rows.map((r) => r.id);
  const unreadCounts = convIds.length
    ? await db
        .select({ conversationId: messages.conversationId, count: sql<number>`count(*)` })
        .from(messages)
        .where(and(inArray(messages.conversationId, convIds), eq(messages.status, "unread")))
        .groupBy(messages.conversationId)
    : [];
  const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u.count]));

  const lastMsgs = convIds.length
    ? await db
        .selectDistinctOn([messages.conversationId], {
          conversationId: messages.conversationId,
          content: messages.content,
        })
        .from(messages)
        .where(inArray(messages.conversationId, convIds))
        .orderBy(messages.conversationId, desc(messages.createdAt))
    : [];
  const lastMsgMap = new Map(lastMsgs.map((m) => [m.conversationId, m.content]));

  const conversationsOut = rows.map((c) => ({
    id: c.id,
    clientId: c.clientId,
    platform: c.platform,
    platformConversationId: c.platformConversationId,
    participantHandle: c.participantHandle,
    status: c.status,
    priority: c.priority,
    assignedToUserId: c.assignedToUserId,
    sentimentSummary: c.sentimentSummary,
    lastMessageAt: c.lastMessageAt.toISOString(),
    lastMessagePreview: lastMsgMap.get(c.id) ?? "",
    unreadCount: unreadMap.get(c.id) ?? 0,
    createdAt: c.createdAt.toISOString(),
  }));

  return NextResponse.json({ conversations: conversationsOut, total });
}

// Need inArray import
import { inArray } from "drizzle-orm";
import { clientAssignments } from "@getpostflow/db";
