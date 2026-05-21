import { NextRequest, NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import {
  contentItems,
  portalTokens,
  auditLogs,
  notifications,
  publishedContent,
  clients,
  orgs,
  users,
  orgMemberships,
} from "@getpostflow/db";
import { eq, and, gt, desc } from "drizzle-orm";

/**
 * POST /api/portal/publish
 *
 * Allows a client (authenticated via portal token) to self-publish a content item.
 *
 * Body: { token, contentItemId, platform? }
 *
 * Behavior:
 * 1. Validates the portal token
 * 2. Verifies the content item belongs to the token's client
 * 3. Publishes via Ayrshare (stub in dev)
 * 4. Updates content item status → client_published
 * 5. Logs audit event (actor: client, action: direct_publish)
 * 6. Creates in-app notification for the assigned strategist
 * 7. Returns the published content record
 */

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    token: string;
    contentItemId: string;
    platform?: string;
  };

  if (!body.token || !body.contentItemId) {
    return NextResponse.json({ error: "token and contentItemId are required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  // 1. Validate token
  const [tokenRecord] = await db
    .select()
    .from(portalTokens)
    .where(
      and(
        eq(portalTokens.tokenHash, body.token),
        gt(portalTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!tokenRecord) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // 2. Load content item + verify ownership
  const [contentItem] = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.id, body.contentItemId),
        eq(contentItems.clientId, tokenRecord.clientId)
      )
    )
    .limit(1);

  if (!contentItem) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  if (contentItem.status === "published" || contentItem.status === "client_published") {
    return NextResponse.json({ error: "Content has already been published" }, { status: 409 });
  }

  // 3. Load client for notification context
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, tokenRecord.clientId))
    .limit(1);

  // 4. Stub publish (in dev, simulate Ayrshare response)
  const platform = body.platform ?? contentItem.platform ?? "instagram";
  const isAyrshareAvailable = !!process.env.AYRSHARE_API_KEY;

  let platformPostId = `stub-post-${Date.now()}`;
  let platformPostUrl = `https://www.instagram.com/p/stub-${Date.now()}/`;

  if (isAyrshareAvailable && client) {
    // In production, call Ayrshare here
    // const ayrshareResult = await publishViaAyrshare(...)
    // platformPostId = ayrshareResult.id
    // platformPostUrl = ayrshareResult.postUrl
  }

  // 5. Update content item status
  await db
    .update(contentItems)
    .set({
      status: "client_published",
      publishedAt: new Date(),
      publishedUrl: platformPostUrl,
      historyTags: [...(contentItem.historyTags as string[]), "client-published"],
      updatedAt: new Date(),
    })
    .where(eq(contentItems.id, contentItem.id));

  // 6. Create published_content record
  const [published] = await db
    .insert(publishedContent)
    .values({
      contentItemId: contentItem.id,
      clientId: tokenRecord.clientId,
      platform,
      platformPostId,
      platformPostUrl,
      publishedAt: new Date(),
      isClientPublished: true,
      rawResponse: { stub: true, publishedAt: new Date().toISOString() },
    })
    .returning();

  // 7. Audit log
  const orgRecord = client
    ? await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.id, client.orgId)).limit(1).then((r) => r[0])
    : null;

  await db.insert(auditLogs).values({
    orgId: orgRecord?.id,
    clientId: tokenRecord.clientId,
    action: "direct_publish",
    entityType: "content_item",
    entityId: contentItem.id,
    payload: {
      actor: "client",
      email: tokenRecord.email,
      platform,
      platformPostUrl,
      publishedAt: new Date().toISOString(),
    },
  });

  // 8. In-app notification for the strategist(s) of this org
  if (orgRecord) {
    const strategists = await db
      .select({ userId: orgMemberships.userId })
      .from(orgMemberships)
      .where(
        and(
          eq(orgMemberships.orgId, orgRecord.id),
          eq(orgMemberships.role, "strategist")
        )
      )
      .limit(5);

    const contentLink = `/dashboard/clients/${tokenRecord.clientId}/content/${contentItem.id}`;

    for (const s of strategists) {
      await db.insert(notifications).values({
        orgId: orgRecord.id,
        userId: s.userId,
        kind: "direct_publish",
        title: `Client published content directly`,
        body: `"${contentItem.title}" was published on ${platform} by ${tokenRecord.email} without going through the approval queue.`,
        linkHref: contentLink,
        metadata: {
          contentItemId: contentItem.id,
          platform,
          clientEmail: tokenRecord.email,
          publishedAt: new Date().toISOString(),
        },
      });
    }

    // Email stub — in production this would call Resend
    if (process.env.RESEND_API_KEY) {
      // await resend.emails.send({ to: strategistEmail, subject: "Client published content directly", ... })
    }
  }

  return NextResponse.json({
    success: true,
    publishedContentId: published.id,
    platformPostUrl,
    status: "client_published",
    message: `Content published successfully on ${platform}`,
  });
}
