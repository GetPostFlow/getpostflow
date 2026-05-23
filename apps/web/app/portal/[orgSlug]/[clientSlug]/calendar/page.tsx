import { createDb, contentItems } from "@getpostflow/db";
import { eq, and, inArray, gte } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";
import CalendarClient from "./_calendar-client";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalCalendarPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid." />;

  const { client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  const items = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.clientId, client.id),
        gte(contentItems.scheduledFor, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        inArray(contentItems.status, ["approved", "scheduled", "published", "client_published", "pending_review"])
      )
    )
    .limit(60);

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="calendar" />
      <CalendarClient clientName={client.name} items={items.map((i) => ({
        id: i.id,
        title: i.title,
        platform: i.platform ?? "instagram",
        status: i.status,
        scheduledFor: i.scheduledFor?.toISOString() ?? null,
      }))} />
    </div>
  );
}
