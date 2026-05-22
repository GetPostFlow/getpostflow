import { NextRequest, NextResponse } from "next/server";
import { requireOrgAuth } from "@/lib/auth-org";
import { createDb, clients, clientBrandStrategies, clientIntakeSubmissions, contentItems } from "@getpostflow/db";
import { eq, and, desc, or } from "drizzle-orm";

/**
 * GET /api/debug/render-test?slug=acme-bakery
 *
 * Runs the same DB queries as the client detail page and returns JSON.
 * Used to verify server-side rendering works without a browser session.
 * TEMPORARY — remove after verification.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing ?slug= param" }, { status: 400 });
  }

  try {
    const { orgRow: org } = await requireOrgAuth();
    const db = createDb(process.env.DATABASE_URL!);

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = UUID_RE.test(slug);

    const [client] = await db
      .select({ id: clients.id, name: clients.name, status: clients.status, slug: clients.slug })
      .from(clients)
      .where(
        and(
          isUuid
            ? or(eq(clients.id, slug), eq(clients.slug, slug))
            : eq(clients.slug, slug),
          eq(clients.orgId, org.id)
        )
      )
      .limit(1);

    if (!client) {
      return NextResponse.json({ ok: false, error: "Client not found", slug, orgId: org.id }, { status: 404 });
    }

    const [latestIntake] = await db
      .select({ id: clientIntakeSubmissions.id, isDraft: clientIntakeSubmissions.isDraft })
      .from(clientIntakeSubmissions)
      .where(eq(clientIntakeSubmissions.clientId, client.id))
      .orderBy(desc(clientIntakeSubmissions.id))
      .limit(1);

    const [latestStrategy] = await db
      .select({ id: clientBrandStrategies.id, status: clientBrandStrategies.status, versionInt: clientBrandStrategies.versionInt })
      .from(clientBrandStrategies)
      .where(eq(clientBrandStrategies.clientId, client.id))
      .orderBy(desc(clientBrandStrategies.versionInt))
      .limit(1);

    const contentCount = await db
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(eq(contentItems.clientId, client.id))
      .limit(10);

    return NextResponse.json({
      ok: true,
      clientName: client.name,
      clientId: client.id,
      clientSlug: client.slug,
      clientStatus: client.status,
      hasIntake: !!latestIntake,
      intakeIsDraft: latestIntake?.isDraft ?? null,
      hasStrategy: !!latestStrategy,
      strategyStatus: latestStrategy?.status ?? null,
      strategyVersion: latestStrategy?.versionInt ?? null,
      contentItemCount: contentCount.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
