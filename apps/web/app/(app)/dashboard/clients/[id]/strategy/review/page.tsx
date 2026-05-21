import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs, clientBrandStrategies } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import StrategyReviewClient from "./_review-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StrategyReviewPage({ params }: Props) {
  const { id } = await params;
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const db = createDb(process.env.DATABASE_URL!);

  const [org] = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.clerkOrgId, orgId))
    .limit(1);

  if (!org) notFound();

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.orgId, org.id)))
    .limit(1);

  if (!client) notFound();

  const [strategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .orderBy(desc(clientBrandStrategies.versionInt))
    .limit(1);

  if (!strategy) {
    redirect(`/dashboard/clients/${client.id}`);
  }

  return (
    <StrategyReviewClient
      strategy={{
        id: strategy.id,
        clientId: strategy.clientId,
        versionInt: strategy.versionInt,
        status: strategy.status,
        draftPayload: strategy.draftPayload as Record<string, unknown>,
        editedPayload: (strategy.editedPayload ?? strategy.draftPayload) as Record<string, unknown>,
        strategistComments: (strategy.strategistComments ?? []) as unknown[],
        aiMetadata: (strategy.aiMetadata ?? {}) as Record<string, unknown>,
      }}
      client={{
        id: client.id,
        name: client.name,
        slug: client.slug,
        status: client.status,
      }}
    />
  );
}
