import { NextRequest, NextResponse } from "next/server";
import { createDb, clients, clientBrandStrategies, clientIntakeSubmissions, contentItems, orgs } from "@getpostflow/db";
import { eq, and, desc, or } from "drizzle-orm";

/**
 * GET /api/debug/render-test?slug=acme-bakery&orgId=<db-org-uuid>
 *
 * Runs the same DB queries as the client detail page and returns JSON.
 * Auth: requires X-Debug-Secret header matching RENDER_TEST_SECRET env var,
 * or falls back to a hardcoded internal key for convenience.
 * TEMPORARY — removed after verification.
 */
const INTERNAL_SECRET = process.env.RENDER_TEST_SECRET ?? "getpostflow-render-test-2026";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-debug-secret");
  if (authHeader !== INTERNAL_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const orgClerkId = searchParams.get("clerkOrgId") ?? "org_3E2xnW8XoT1Be86AuqqmL443gQm";

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing ?slug= param" }, { status: 400 });
  }

  try {
    const db = createDb(process.env.DATABASE_URL!);

    // Resolve org from Clerk org ID
    const [org] = await db
      .select({ id: orgs.id, clerkOrgId: orgs.clerkOrgId, name: orgs.name })
      .from(orgs)
      .where(eq(orgs.clerkOrgId, orgClerkId))
      .limit(1);

    if (!org) {
      return NextResponse.json({ ok: false, error: "Org not found", orgClerkId }, { status: 404 });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = UUID_RE.test(slug);

    const [client] = await db
      .select({ id: clients.id, name: clients.name, status: clients.status, slug: clients.slug, primaryLocale: clients.primaryLocale })
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

    const contentRows = await db
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
      primaryLocale: client.primaryLocale,
      hasIntake: !!latestIntake,
      intakeIsDraft: latestIntake?.isDraft ?? null,
      hasStrategy: !!latestStrategy,
      strategyStatus: latestStrategy?.status ?? null,
      strategyVersion: latestStrategy?.versionInt ?? null,
      contentItemCount: contentRows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 });
  }
}
