/**
 * GET /api/debug/assets-count?clientId=...
 *
 * Returns asset count for a given client (no auth required, for render verification).
 */
import { NextRequest, NextResponse } from "next/server";
import { createDb, assets } from "@getpostflow/db";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  const rows = await db
    .select({
      id: assets.id,
      filename: assets.filename,
      source: assets.source,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .where(eq(assets.clientId, clientId))
    .orderBy(assets.createdAt);

  return NextResponse.json({
    clientId,
    count: rows.length,
    assets: rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      source: r.source,
      createdAt: r.createdAt,
    })),
  });
}
