import { createDb, contentItems, contentVersions } from "@getpostflow/db";
import { eq, and, or, inArray } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";
import PortalContentApprovalClient from "./_portal-content-client";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalContentPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided. Please use the magic link from your email." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid. Please request a new one from your agency." />;

  const { client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  // Fetch all non-draft content items for this client
  const items = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.clientId, client.id),
        inArray(contentItems.status, ["pending_review", "approved", "scheduled", "published", "client_published"])
      )
    )
    .limit(30);

  // For each item, get the latest version body
  const itemsWithBody = await Promise.all(
    items.map(async (item) => {
      const [version] = await db
        .select({ body: contentVersions.body })
        .from(contentVersions)
        .where(eq(contentVersions.contentItemId, item.id))
        .limit(1);

      const payload = item.draftPayload as { captionBody?: string; callToAction?: string; mediaPrompts?: string[] } | null;
      const body = version?.body ?? payload?.captionBody ?? item.title;

      return {
        id: item.id,
        title: item.title,
        platform: item.platform ?? "instagram",
        body,
        callToAction: payload?.callToAction ?? "",
        scheduledFor: item.scheduledFor?.toISOString() ?? null,
        status: item.status,
        contentType: item.contentType ?? "post",
      };
    })
  );

  // Sort: pending first
  const sorted = [...itemsWithBody].sort((a, b) => {
    if (a.status === "pending_review" && b.status !== "pending_review") return -1;
    if (b.status === "pending_review" && a.status !== "pending_review") return 1;
    return 0;
  });

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="content" />
      <PortalContentApprovalClient clientName={client.name} token={token} items={sorted} />
    </div>
  );
}
