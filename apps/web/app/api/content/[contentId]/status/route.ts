import { requireOrgAuthApi } from "@/lib/auth-org";
import { NextRequest, NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import {
  contentItems,
  contentVersions,
  orgs,
  clients,
  auditLogs,
  notifications,
  orgMemberships,
} from "@getpostflow/db";
import { eq, and, max, desc } from "drizzle-orm";

interface Params {
  params: Promise<{ contentId: string }>;
}

/**
 * PATCH /api/content/[contentId]/status
 *
 * Updates content item status, saves a new version if body edits exist.
 *
 * Body: { status, scheduledFor?, edits?: { body, headline, callToAction, hashtags } }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { contentId } = await params;
  const authResult = await requireOrgAuthApi();
  if (!authResult) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId, orgRow: org } = authResult;

  const body = (await req.json()) as {
    status?: string;
    scheduledFor?: string;
    edits?: {
      body?: string;
      headline?: string;
      callToAction?: string;
      hashtags?: string[];
    };
    changeSummary?: string;
  };

  const db = createDb(process.env.DATABASE_URL!);

  const [item] = await db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.id, contentId), eq(contentItems.orgId, org.id)))
    .limit(1);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate status transition (basic guard)
  const allowedTransitions: Record<string, string[]> = {
    draft: ["pending_review", "archived"],
    pending_review: ["approved", "draft", "archived"],
    approved: ["scheduled", "publishing", "draft"],
    scheduled: ["publishing", "draft", "archived"],
    publishing: ["published", "failed"],
    published: ["archived"],
    client_published: ["archived"],
    failed: ["draft", "scheduled"],
    archived: ["draft"],
  };

  if (body.status && body.status !== item.status) {
    const allowed = allowedTransitions[item.status] ?? [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from "${item.status}" to "${body.status}"` },
        { status: 422 }
      );
    }
  }

  // If there are body edits, save a new version
  if (body.edits) {
    const [latestVersion] = await db
      .select({ maxVersion: max(contentVersions.versionInt) })
      .from(contentVersions)
      .where(eq(contentVersions.contentItemId, contentId));

    const nextVersion = (latestVersion?.maxVersion ?? 0) + 1;

    const currentPayload = item.draftPayload as Record<string, unknown>;
    const updatedPayload = {
      ...currentPayload,
      ...(body.edits.headline && { headline: body.edits.headline }),
      ...(body.edits.body && { body: body.edits.body }),
      ...(body.edits.callToAction && { callToAction: body.edits.callToAction }),
      ...(body.edits.hashtags && { hashtags: body.edits.hashtags }),
    };

    await db.insert(contentVersions).values({
      contentItemId: contentId,
      versionInt: nextVersion,
      body: (body.edits.body ?? currentPayload.body ?? "") as string,
      platformVariants: {},
      draftPayload: updatedPayload,
      changeSummary: body.changeSummary ?? `Status: ${body.status ?? "edited"} — v${nextVersion}`,
      createdByUserId: undefined,
    });

    // Update draftPayload on the item
    await db
      .update(contentItems)
      .set({
        draftPayload: updatedPayload,
        ...(body.status ? { status: body.status as typeof item.status } : {}),
        ...(body.scheduledFor ? { scheduledFor: new Date(body.scheduledFor) } : {}),
        historyTags: [...(item.historyTags as string[]), "edited-by-internal"],
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentId));
  } else {
    await db
      .update(contentItems)
      .set({
        ...(body.status ? { status: body.status as typeof item.status } : {}),
        ...(body.scheduledFor ? { scheduledFor: new Date(body.scheduledFor), status: "scheduled" as typeof item.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentId));
  }

  // Audit
  await db.insert(auditLogs).values({
    orgId: org.id,
    clientId: item.clientId,
    action: body.status ?? "content_edited",
    entityType: "content_item",
    entityId: contentId,
    payload: {
      fromStatus: item.status,
      toStatus: body.status,
      hasEdits: !!body.edits,
      scheduledFor: body.scheduledFor,
    },
  });

  // Notifications on key transitions
  if (body.status === "approved" && item.clientId) {
    await db.insert(notifications).values({
      orgId: org.id,
      userId: undefined,
      kind: "content_approved",
      title: "Content approved",
      body: `"${item.title}" has been approved and is ready to schedule.`,
      linkHref: `/dashboard/clients/${item.clientId}/content/${contentId}`,
      metadata: { contentItemId: contentId },
    });
  }

  if (body.status === "pending_review") {
    const strategists = await db
      .select({ userId: orgMemberships.userId })
      .from(orgMemberships)
      .where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.role, "strategist")))
      .limit(3);

    for (const s of strategists) {
      await db.insert(notifications).values({
        orgId: org.id,
        userId: s.userId,
        kind: "content_ready_for_review",
        title: "Content ready for review",
        body: `"${item.title}" has been submitted and is waiting for your review.`,
        linkHref: `/dashboard/clients/${item.clientId}/content/${contentId}`,
        metadata: { contentItemId: contentId },
      });
    }
  }

  const [updated] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, contentId))
    .limit(1);

  return NextResponse.json({ success: true, contentItem: updated });
}

/**
 * GET /api/content/[contentId]/status
 * Returns the content item with its version history.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { contentId } = await params;
  const authResult = await requireOrgAuthApi();
  if (!authResult) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId, orgRow: org } = authResult;

  const db = createDb(process.env.DATABASE_URL!);

  const [item] = await db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.id, contentId), eq(contentItems.orgId, org.id)))
    .limit(1);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentItemId, contentId))
    .orderBy(desc(contentVersions.versionInt));

  return NextResponse.json({ contentItem: item, versions });
}
