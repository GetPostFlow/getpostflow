import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createDb } from "@getpostflow/db";
import { clients, orgs, portalTokens } from "@getpostflow/db";
import { eq, ilike } from "drizzle-orm";
import crypto from "crypto";

const PORTAL_SIGNING_SECRET = process.env.PORTAL_SIGNING_SECRET ?? "dev-portal-secret-change-me";

/**
 * GET /api/portal/test-token?clientId=<UUID>
 *   OR
 * GET /api/portal/test-token?clientName=acme+bakery
 *
 * Returns a magic-link URL for the given client without sending email.
 * Useful for dev/staging to generate portal test links quickly.
 *
 * Response: { magicLink: string; tokenHash: string; expiresAt: string }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const clientId = searchParams.get("clientId");
    const clientName = searchParams.get("clientName");

    if (!clientId && !clientName) {
      return NextResponse.json(
        { error: "Provide clientId or clientName query param. Example: /api/portal/test-token?clientName=acme+bakery" },
        { status: 400 }
      );
    }

    const db = createDb(process.env.DATABASE_URL!);

    // Resolve client
    const [client] = await db
      .select({ id: clients.id, slug: clients.slug, orgId: clients.orgId, name: clients.name, email: clients.primaryContactEmail })
      .from(clients)
      .where(
        clientId
          ? eq(clients.id, clientId)
          : ilike(clients.name, `%${clientName}%`)
      )
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Resolve org
    const [org] = await db
      .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.id, client.orgId))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Org not found for client" }, { status: 404 });
    }

    const email = client.email ?? "demo@getpostflow.com";
    const raw = `${client.id}:${email}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
    const tokenHash = crypto
      .createHmac("sha256", PORTAL_SIGNING_SECRET)
      .update(raw)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    await db.insert(portalTokens).values({
      clientId: client.id,
      tokenHash,
      email,
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getpostflow.vercel.app";
    const orgSlug = org.clerkOrgId ?? org.id;
    const magicLink = `${appUrl}/portal/${orgSlug}/${client.slug}/strategy?token=${tokenHash}`;

    return NextResponse.json({
      magicLink,
      tokenHash,
      clientId: client.id,
      clientName: client.name,
      orgName: org.name,
      email,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[portal/test-token] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
