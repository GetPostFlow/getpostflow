import { notFound } from "next/navigation";
import { createDb } from "@getpostflow/db";
import { clients, orgs } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";
import { validatePortalToken, InvalidToken } from "../../../_portal-helpers";
import PortalIntakeForm from "./_intake-form";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalIntakePage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return <InvalidToken reason="No access token provided. Please use the link from your welcome email." />;
  }

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) {
    return <InvalidToken reason="This link has expired or is invalid. Please request a new one from your agency." />;
  }
  const { client } = validated;

  // If intake already submitted, redirect to strategy review
  const db = createDb(process.env.DATABASE_URL!);
  const [org] = await db.select().from(orgs).where(eq(orgs.id, client.orgId)).limit(1);

  // If client status is past intake_pending, they already submitted — send to strategy
  if (client.status !== "intake_pending" && client.status !== "draft") {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px" }}>
        <p style={{ color: "#6b7280" }}>Your intake has already been submitted. Redirecting to your strategy…</p>
        <meta httpEquiv="refresh" content={`0;url=/portal/${orgSlug}/${clientSlug}/strategy?token=${token}`} />
      </div>
    );
  }

  return (
    <PortalIntakeForm
      clientId={client.id}
      orgSlug={orgSlug}
      clientSlug={clientSlug}
      token={token}
    />
  );
}
