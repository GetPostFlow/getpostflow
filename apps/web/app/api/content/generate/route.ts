import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import {
  contentItems,
  contentVersions,
  clientBrandStrategies,
  clients,
  orgs,
  auditLogs,
  notifications,
  orgMemberships,
} from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { generateContent, scoreContent } from "@getpostflow/ai";
import type { BrandStrategyDraft } from "@getpostflow/ai";
import type { SupportedPlatform, ContentType } from "@getpostflow/ai";

/**
 * POST /api/content/generate
 *
 * Body: { clientId, platform, contentType, locale?, topic?, campaignBrief? }
 *
 * Creates a new content item with an AI-generated draft.
 */
export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    clientId: string;
    platform: SupportedPlatform;
    contentType: ContentType;
    locale?: string;
    topic?: string;
    campaignBrief?: string;
    title?: string;
  };

  if (!body.clientId || !body.platform || !body.contentType) {
    return NextResponse.json(
      { error: "clientId, platform, and contentType are required" },
      { status: 400 }
    );
  }

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, body.clientId), eq(clients.orgId, org.id)))
    .limit(1);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // Load the active brand strategy
  const [strategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .orderBy(desc(clientBrandStrategies.versionInt))
    .limit(1);

  const brandStrategyDraft = (
    strategy?.editedPayload ?? strategy?.draftPayload
  ) as BrandStrategyDraft | null;

  if (!brandStrategyDraft) {
    return NextResponse.json(
      { error: "No approved brand strategy found. Complete onboarding first." },
      { status: 422 }
    );
  }

  // Generate content via AI engine
  const draft = await generateContent(
    brandStrategyDraft,
    body.platform,
    body.contentType,
    {
      locale: body.locale ?? client.primaryLocale,
      topic: body.topic,
      campaignBrief: body.campaignBrief,
    }
  );

  const contentScore = scoreContent(draft);
  const autoApproved = contentScore >= 0.85 && draft.moderationFlags.length === 0;

  const title =
    body.title ??
    draft.headline.slice(0, 120) ??
    `${body.platform} ${body.contentType}`;

  // Create content item
  const [item] = await db
    .insert(contentItems)
    .values({
      clientId: client.id,
      orgId: org.id,
      title,
      platform: body.platform,
      contentType: body.contentType,
      locale: draft.locale,
      status: autoApproved ? "pending_review" : "draft",
      draftPayload: draft as unknown as Record<string, unknown>,
      historyTags: ["ai-generated"],
      createdByUserId: undefined,
    })
    .returning();

  // Create initial version
  await db.insert(contentVersions).values({
    contentItemId: item!.id,
    versionInt: 1,
    body: draft.body,
    platformVariants: {},
    draftPayload: draft as unknown as Record<string, unknown>,
    changeSummary: "AI-generated initial draft",
  });

  // Audit
  await db.insert(auditLogs).values({
    orgId: org.id,
    clientId: client.id,
    action: "content_generated",
    entityType: "content_item",
    entityId: item!.id,
    payload: {
      platform: body.platform,
      contentType: body.contentType,
      locale: draft.locale,
      contentScore,
      autoApproved,
      topic: body.topic,
    },
  });

  return NextResponse.json({
    contentItemId: item!.id,
    draft,
    contentScore,
    autoApproved,
    status: item!.status,
  });
}
