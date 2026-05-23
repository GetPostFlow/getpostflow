/**
 * GET /api/debug/content-queue?clientId=...
 *
 * Returns content items for a client (no auth required, for render verification).
 */
import { NextRequest, NextResponse } from "next/server";
import { createDb, contentItems, clients } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const db = createDb(process.env.DATABASE_URL!);

  const items = await db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      platform: contentItems.platform,
      status: contentItems.status,
      clientId: contentItems.clientId,
    })
    .from(contentItems)
    .where(eq(contentItems.clientId, clientId))
    .orderBy(desc(contentItems.createdAt))
    .limit(20);

  const [client] = await db
    .select({ name: clients.name })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  return NextResponse.json({
    clientId,
    clientName: client?.name ?? "Unknown",
    count: items.length,
    items,
  });
}
