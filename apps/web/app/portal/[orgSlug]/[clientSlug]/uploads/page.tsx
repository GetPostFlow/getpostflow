import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";
import { createDb, assets } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import PortalUploadsClient from "./_portal-uploads-client";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalUploadsPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return <InvalidToken reason="No token provided. Please use the magic link from your email." />;
  }

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) {
    return <InvalidToken reason="This link has expired or is invalid. Please request a new one from your agency." />;
  }

  const { org, client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  const existingAssets = await db
    .select({
      id: assets.id,
      filename: assets.filename,
      type: assets.type,
      sizeBytes: assets.sizeBytes,
      publicUrl: assets.publicUrl,
      source: assets.source,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .where(and(eq(assets.orgId, org.id), eq(assets.clientId, client.id)))
    .orderBy(desc(assets.createdAt))
    .limit(100);

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="uploads" />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
          Upload Content
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          Share your logos, photos, videos, and brand files with your agency team.
        </p>
      </div>
      <PortalUploadsClient
        orgSlug={orgSlug}
        clientSlug={clientSlug}
        token={token}
        existingAssets={existingAssets.map((a) => ({
          id: a.id,
          filename: a.filename ?? "Untitled",
          type: a.type,
          sizeBytes: a.sizeBytes ?? 0,
          publicUrl: a.publicUrl ?? null,
          source: a.source ?? "portal_upload",
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
