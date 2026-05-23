/**
 * GET /api/portal/assets?token=...&orgSlug=...&clientSlug=...
 *
 * Portal-authed. Returns assets uploaded by this client.
 */
import { NextRequest, NextResponse } from "next/server";
import { validatePortalToken } from "@/app/portal/_portal-helpers";
import { createDb, assets } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const orgSlug = req.nextUrl.searchParams.get("orgSlug") ?? "";
  const clientSlug = req.nextUrl.searchParams.get("clientSlug") ?? "";

  if (!token || !orgSlug || !clientSlug) {
    return NextResponse.json({ error: "Missing token, orgSlug, or clientSlug" }, { status: 400 });
  }

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) {
    return NextResponse.json({ error: "Invalid or expired portal token" }, { status: 401 });
  }

  const { org, client } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  const rows = await db
    .select()
    .from(assets)
    .where(and(eq(assets.orgId, org.id), eq(assets.clientId, client.id)))
    .orderBy(desc(assets.createdAt))
    .limit(100);

  return NextResponse.json({ assets: rows });
}
