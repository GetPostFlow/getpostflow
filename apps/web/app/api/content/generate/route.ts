import { requireOrgAuthWithRoleApi, requireClientAccess } from "@/lib/auth-org";
import { NextRequest, NextResponse } from "next/server";
import { createDb } from "@getpostflow/db";
import {
  contentItems,
  contentVersions,
  clientBrandStrategies,
  clients,
  auditLogs,
} from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import { generateContent, generateContentBatch, scoreContent } from "@getpostflow/ai";
import type { BrandStrategyDraft } from "@getpostflow/ai";
import type { SupportedPlatform, ContentType } from "@getpostflow/ai";

/**
 * POST /api/content/generate
 *
 * Body (single): { clientId, platform, contentType, locale?, topic?, campaignBrief? }
 * Body (batch): { clientId, platforms[], contentType, locale?, topic?, campaignBrief? }
 *
 * Creates new content item(s) with AI-generated draft(s).
 */
export async function POST(req: NextRequest) {
  const auth = await requireOrgAuthWithRoleApi();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { dbUserId, orgRow: org, role } = auth;

  const body = (await req.json()) as {
    clientId: string;
    platform?: SupportedPlatform;
    platforms?: SupportedPlatform[];
    contentType: ContentType;
    locale?: string;
    topic?: string;
    campaignBrief?: string;
    title?: string;
  };

  const platforms = body.platforms ?? (body.platform ? [body.platform] : []);
  if (!body.clientId || platforms.length === 0 || !body.contentType) {
    return NextResponse.json(
      { error: "clientId, platform(s), and contentType are required" },
      { status: 400 }
    );
  }

  await requireClientAccess({ dbUserId, clientId: body.clientId, orgId: org.id, role });

  const db = createDb(process.env.DATABASE_URL!);

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

  const opts = {
    locale: body.locale ?? client.primaryLocale,
    topic: body.topic,
    campaignBrief: body.campaignBrief,
  };

  // Generate content for all platforms
  const draftsByPlatform =
    platforms.length === 1
      ? { [platforms[0]!]: await generateContent(brandStrategyDraft, platforms[0]!, body.contentType, opts) }
      : await generateContentBatch(brandStrategyDraft, platforms, body.contentType, opts);

  const results: Array<{
    platform: string;
    contentItemId: string;
    draft: unknown;
    contentScore: number;
    autoApproved: boolean;
    status: string;
  }> = [];

  for (const platform of platforms) {
    const draft = draftsByPlatform[platform]!;
    const contentScore = scoreContent(draft);
    const autoApproved = contentScore >= 0.85 && draft.moderationFlags.length === 0;
    const title = body.title ?? draft.headline.slice(0, 120) ?? `${platform} ${body.contentType}`;

    const [item] = await db
      .insert(contentItems)
      .values({
        clientId: client.id,
        orgId: org.id,
        title,
        platform,
        contentType: body.contentType,
        locale: draft.locale,
        status: autoApproved ? "pending_review" : "draft",
        draftPayload: draft as unknown as Record<string, unknown>,
        targetPlatforms: [platform],
        historyTags: ["ai-generated"],
        createdByUserId: undefined,
      })
      .returning();

    await db.insert(contentVersions).values({
      contentItemId: item!.id,
      versionInt: 1,
      body: draft.body,
      platformVariants: {},
      draftPayload: draft as unknown as Record<string, unknown>,
      changeSummary: "AI-generated initial draft",
    });

    await db.insert(auditLogs).values({
      orgId: org.id,
      clientId: client.id,
      action: "content_generated",
      entityType: "content_item",
      entityId: item!.id,
      payload: {
        platform,
        contentType: body.contentType,
        locale: draft.locale,
        contentScore,
        autoApproved,
        topic: body.topic,
      },
    });

    results.push({
      platform,
      contentItemId: item!.id,
      draft,
      contentScore,
      autoApproved,
      status: item!.status,
    });
  }

  // Backward compatibility: if single platform, return flat object
  if (platforms.length === 1 && body.platform) {
    const r = results[0]!;
    return NextResponse.json({
      contentItemId: r.contentItemId,
      draft: r.draft,
      contentScore: r.contentScore,
      autoApproved: r.autoApproved,
      status: r.status,
    });
  }

  return NextResponse.json({ results });
}
