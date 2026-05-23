import { createDb, portalMessages } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";
import PortalMessagesClient from "./_portal-messages-client";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalMessagesPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid." />;

  const { client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  const messages = await db
    .select()
    .from(portalMessages)
    .where(eq(portalMessages.clientId, client.id))
    .orderBy(desc(portalMessages.createdAt))
    .limit(100);

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="messages" />
      <PortalMessagesClient
        clientName={client.name}
        token={token}
        orgSlug={orgSlug}
        clientSlug={clientSlug}
        initialMessages={messages.map((m) => ({
          id: m.id,
          senderType: m.senderType,
          senderName: m.senderName,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
