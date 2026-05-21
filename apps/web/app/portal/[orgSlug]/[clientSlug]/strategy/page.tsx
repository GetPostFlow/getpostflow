import { notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clientBrandStrategies } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import type { BrandStrategyDraft } from "@getpostflow/ai";
import ClientPortalStrategy from "./_portal-strategy-client";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalStrategyPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return <InvalidToken reason="No token provided. Please use the magic link from your email." />;
  }

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) {
    return <InvalidToken reason="This link has expired or is invalid. Please request a new one from your agency." />;
  }
  const { client } = validated;

  const db = createDb(process.env.DATABASE_URL!);

  const [strategy] = await db
    .select()
    .from(clientBrandStrategies)
    .where(eq(clientBrandStrategies.clientId, client.id))
    .orderBy(desc(clientBrandStrategies.versionInt))
    .limit(1);

  if (!strategy) {
    return (
      <div>
        <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="strategy" />
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ color: "#6b7280" }}>No strategy has been drafted yet. Please check back later.</p>
        </div>
      </div>
    );
  }

  const draft = (strategy.editedPayload ?? strategy.draftPayload) as unknown as BrandStrategyDraft;

  if (!draft || !draft.positioningStatement) notFound();

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="strategy" />
      <ClientPortalStrategy
        strategyId={strategy.id}
        clientName={client.name}
        draft={draft}
        status={strategy.status}
        tokenHash={token}
      />
    </div>
  );
}
