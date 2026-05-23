import { requireOrgAuth } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import { clients, contentItems, contentVersions } from "@getpostflow/db";
import { eq, desc, and, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import ClientApprovalsClient from "./_client-approvals-client";

export const metadata: Metadata = {
  title: "Client Approvals — GetPostFlow",
};

export default async function ClientApprovalsPage() {
  const db = createDb(process.env.DATABASE_URL!);
  const { orgRow: org } = await requireOrgAuth();

  const clientList = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(eq(clients.orgId, org.id));

  const clientIds = clientList.map((c) => c.id);

  const allContent =
    clientIds.length > 0
      ? await db
          .select({
            id: contentItems.id,
            clientId: contentItems.clientId,
            platform: contentItems.platform,
            status: contentItems.status,
            title: contentItems.title,
            scheduledFor: contentItems.scheduledFor,
            createdAt: contentItems.createdAt,
            clientName: clients.name,
          })
          .from(contentItems)
          .innerJoin(clients, eq(contentItems.clientId, clients.id))
          .where(eq(clients.orgId, org.id))
          .orderBy(desc(contentItems.createdAt))
          .limit(100)
      : [];

  // Fetch latest version body for each item
  const itemsWithBody = await Promise.all(
    allContent.map(async (item) => {
      const [version] = await db
        .select({ body: contentVersions.body })
        .from(contentVersions)
        .where(eq(contentVersions.contentItemId, item.id))
        .limit(1);
      return { ...item, body: version?.body ?? "" };
    })
  );

  return (
    <ClientApprovalsClient
      items={itemsWithBody.map((i) => ({
        id: i.id,
        clientId: i.clientId,
        clientName: i.clientName,
        platform: i.platform,
        status: i.status,
        title: i.title,
        scheduledFor: i.scheduledFor?.toISOString() ?? null,
        createdAt: i.createdAt.toISOString(),
        body: i.body,
      }))}
      clients={clientList}
    />
  );
}
